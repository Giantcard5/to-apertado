export type Bairro = {
  slug: string
  name: string
  lat: number
  lng: number
  radius: number // meters
}

export const BAIRROS: Bairro[] = [
  { slug: 'centro',           name: 'Centro',           lat: -23.5489, lng: -46.6388, radius: 1500 },
  { slug: 'pinheiros',        name: 'Pinheiros',        lat: -23.5629, lng: -46.6964, radius: 1200 },
  { slug: 'vila-madalena',    name: 'Vila Madalena',    lat: -23.5548, lng: -46.6902, radius: 1000 },
  { slug: 'jardins',          name: 'Jardins',          lat: -23.5667, lng: -46.6614, radius: 1200 },
  { slug: 'itaim-bibi',       name: 'Itaim Bibi',       lat: -23.5863, lng: -46.6783, radius: 1000 },
  { slug: 'moema',            name: 'Moema',            lat: -23.6017, lng: -46.6667, radius: 1000 },
  { slug: 'consolacao',       name: 'Consolação',       lat: -23.5521, lng: -46.6597, radius: 800  },
  { slug: 'bela-vista',       name: 'Bela Vista',       lat: -23.5598, lng: -46.6447, radius: 800  },
  { slug: 'liberdade',        name: 'Liberdade',        lat: -23.5598, lng: -46.6341, radius: 900  },
  { slug: 'bras',             name: 'Brás',             lat: -23.5423, lng: -46.6157, radius: 1000 },
  { slug: 'vila-mariana',     name: 'Vila Mariana',     lat: -23.5888, lng: -46.6389, radius: 1200 },
  { slug: 'perdizes',         name: 'Perdizes',         lat: -23.5338, lng: -46.6681, radius: 1000 },
  { slug: 'santana',          name: 'Santana',          lat: -23.5012, lng: -46.6264, radius: 1200 },
  { slug: 'tatuape',          name: 'Tatuapé',          lat: -23.5408, lng: -46.5767, radius: 1200 },
  { slug: 'lapa',             name: 'Lapa',             lat: -23.5199, lng: -46.7043, radius: 1000 },
  { slug: 'butanta',          name: 'Butantã',          lat: -23.5733, lng: -46.7283, radius: 1200 },
  { slug: 'ipiranga',         name: 'Ipiranga',         lat: -23.5878, lng: -46.6067, radius: 1200 },
  { slug: 'brooklin',         name: 'Brooklin',         lat: -23.6207, lng: -46.6944, radius: 1000 },
  { slug: 'paulista',         name: 'Avenida Paulista',  lat: -23.5614, lng: -46.6558, radius: 800  },
  { slug: 'higienopolis',     name: 'Higienópolis',     lat: -23.5432, lng: -46.6583, radius: 900  },
]

export function getBairroBySlug(slug: string): Bairro | undefined {
  return BAIRROS.find(b => b.slug === slug)
}
