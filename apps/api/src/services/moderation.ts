import { config } from '../config.js'

type ModerationStatus = 'approved' | 'manual_review' | 'rejected'

type ModerationResult = {
  status: ModerationStatus
  reason?: 'safesearch_failed' | 'vision_low_confidence' | 'not_bathroom' | 'extreme_condition'
  score: number
}

const BATHROOM_LABELS = ['bathroom', 'toilet', 'sink', 'plumbing fixture', 'tile', 'public toilet']
const EXTREME_CONDITION_LABELS = ['mold', 'garbage', 'waste', 'fungus']

const SAFESEARCH_BLOCK = ['LIKELY', 'VERY_LIKELY']

export async function moderatePhoto(imageUrl: string): Promise<ModerationResult> {
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${config.GOOGLE_VISION_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { source: { imageUri: imageUrl } },
          features: [
            { type: 'SAFE_SEARCH_DETECTION' },
            { type: 'LABEL_DETECTION', maxResults: 20 },
          ],
        }],
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Vision API error: ${response.status}`)
  }

  const data = await response.json() as {
    responses: Array<{
      safeSearchAnnotation?: {
        adult: string; violence: string; racy: string; medical: string
      }
      labelAnnotations?: Array<{ description: string; score: number }>
      error?: { message: string }
    }>
  }

  const result = data.responses[0]
  if (result.error) throw new Error(`Vision API: ${result.error.message}`)

  const safeSearch = result.safeSearchAnnotation
  const labels = result.labelAnnotations ?? []

  // Conteúdo impróprio → rejected
  if (safeSearch) {
    if (
      SAFESEARCH_BLOCK.includes(safeSearch.adult) ||
      SAFESEARCH_BLOCK.includes(safeSearch.violence) ||
      SAFESEARCH_BLOCK.includes(safeSearch.racy)
    ) {
      return { status: 'rejected', reason: 'safesearch_failed', score: 0 }
    }
  }

  // Condição extrema → manual_review
  const extremeLabel = labels.find(
    l => EXTREME_CONDITION_LABELS.includes(l.description.toLowerCase()) && l.score > 0.8
  )
  if (extremeLabel) {
    return { status: 'manual_review', reason: 'extreme_condition', score: extremeLabel.score }
  }

  // Foto não é de banheiro → manual_review
  const bathroomLabel = labels.find(
    l => BATHROOM_LABELS.includes(l.description.toLowerCase()) && l.score > 0.6
  )
  if (!bathroomLabel) {
    const topScore = labels[0]?.score ?? 0
    return { status: 'manual_review', reason: 'not_bathroom', score: topScore }
  }

  return { status: 'approved', score: bathroomLabel.score }
}
