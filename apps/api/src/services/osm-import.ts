import 'dotenv/config'
import { Pool } from 'pg'
import { config } from '../config.js'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

const OVERPASS_QUERY = `
[out:json][timeout:60];
area["name"="São Paulo"]["admin_level"="8"]->.sp;
node["amenity"="toilets"](area.sp);
out body;
`

type OsmNode = {
  id: number
  lat: number
  lon: number
  tags: Record<string, string>
}

type OverpassResponse = {
  elements: OsmNode[]
}

function mapOsmToBathroom(node: OsmNode) {
  const tags = node.tags ?? {}

  const name = tags.name ?? 'Banheiro Público'

  let address: string | null = null
  if (tags['addr:full']) {
    address = tags['addr:full']
  } else if (tags['addr:street']) {
    address = tags['addr:housenumber']
      ? `${tags['addr:street']}, ${tags['addr:housenumber']}`
      : tags['addr:street']
  }

  const is_free       = tags.fee !== 'yes'
  const is_accessible = tags.wheelchair === 'yes'
  const requires_key  = tags.access === 'key'
  const opening_hours = tags.opening_hours ? { raw: tags.opening_hours } : null

  return { name, address, is_free, is_accessible, requires_key, opening_hours }
}

async function run() {
  const pool = new Pool({ connectionString: config.DATABASE_URL })

  console.log('Buscando banheiros no OpenStreetMap...')

  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
  })

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`)
  }

  const data = await response.json() as OverpassResponse
  const nodes = data.elements

  console.log(`Encontrados: ${nodes.length} banheiros no OSM`)

  let inserted = 0
  let updated  = 0
  let errors   = 0

  for (const node of nodes) {
    const mapped = mapOsmToBathroom(node)

    try {
      const result = await pool.query(
        `INSERT INTO bathrooms (name, location, address, is_free, is_accessible, requires_key, opening_hours, osm_id, source)
         VALUES ($1, ST_MakePoint($3, $2)::geography, $4, $5, $6, $7, $8, $9, 'osm')
         ON CONFLICT (osm_id) DO UPDATE
           SET name          = EXCLUDED.name,
               address       = EXCLUDED.address,
               opening_hours = EXCLUDED.opening_hours,
               updated_at    = NOW()
         RETURNING (xmax = 0) AS is_insert`,
        [
          mapped.name,
          node.lat,
          node.lon,
          mapped.address,
          mapped.is_free,
          mapped.is_accessible,
          mapped.requires_key,
          mapped.opening_hours ? JSON.stringify(mapped.opening_hours) : null,
          node.id,
        ]
      )

      if (result.rows[0]?.is_insert) {
        inserted++
      } else {
        updated++
      }
    } catch (err) {
      errors++
      console.error(`Erro ao importar node ${node.id}:`, err)
    }
  }

  await pool.end()

  console.log(`\nImport concluído:`)
  console.log(`  Inseridos: ${inserted}`)
  console.log(`  Atualizados: ${updated}`)
  console.log(`  Erros: ${errors}`)
  console.log(`  Total processado: ${nodes.length}`)
}

run().catch(err => {
  console.error('Import falhou:', err)
  process.exit(1)
})
