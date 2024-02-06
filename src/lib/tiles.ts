export type TileSource = {
  urlTemplate: string
  attribution?: string
  attributionLink?: string
}

/**
 * Tile sources
 */
export const TILES: Record<string, TileSource> = {
  'GSI.std': {
    urlTemplate: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
    attribution: 'Geospatial Information Authority of Japan',
    attributionLink: 'https://maps.gsi.go.jp/development/ichiran.html',
  },
  'GSI.pale': {
    urlTemplate: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
    attribution: 'Geospatial Information Authority of Japan',
    attributionLink: 'https://maps.gsi.go.jp/development/ichiran.html',
  },
  'GSI.seamlessphoto': {
    urlTemplate:
      'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
    attribution: 'Geospatial Information Authority of Japan',
    attributionLink: 'https://maps.gsi.go.jp/development/ichiran.html',
  },
  'osm-bright': {
    urlTemplate:
      'https://tile.openstreetmap.jp/styles/osm-bright/{z}/{x}/{y}.png',
    attribution: 'OpenStreetMap contributors',
    attributionLink: 'https://www.openstreetmap.org/copyright',
  },
  'osm-bright-ja': {
    urlTemplate:
      'https://tile.openstreetmap.jp/styles/osm-bright-ja/{z}/{x}/{y}.png',
    attribution: 'OpenStreetMap contributors',
    attributionLink: 'https://www.openstreetmap.org/copyright',
  },
  'maptiler-basic-en': {
    urlTemplate:
      'https://tile.openstreetmap.jp/styles/maptiler-basic-en/{z}/{x}/{y}.png',
    attribution: 'OpenStreetMap contributors',
    attributionLink: 'https://www.openstreetmap.org/copyright',
  },
  'maptiler-basic-ja': {
    urlTemplate:
      'https://tile.openstreetmap.jp/styles/maptiler-basic-ja/{z}/{x}/{y}.png',
    attribution: 'OpenStreetMap contributors',
    attributionLink: 'https://www.openstreetmap.org/copyright',
  },
  'maptiler-toner-en': {
    urlTemplate:
      'https://tile.openstreetmap.jp/styles/maptiler-toner-en/{z}/{x}/{y}.png',
    attribution: 'OpenStreetMap contributors',
    attributionLink: 'https://www.openstreetmap.org/copyright',
  },
  'maptiler-toner-ja': {
    urlTemplate:
      'https://tile.openstreetmap.jp/styles/maptiler-toner-ja/{z}/{x}/{y}.png',
    attribution: 'OpenStreetMap contributors',
    attributionLink: 'https://www.openstreetmap.org/copyright',
  },
}
