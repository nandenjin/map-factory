import { HTMLAttributes, useEffect, useState } from 'react'
import {
  getPositionInTilesByLatLng,
  getSizeInTilesByLatLngBounds,
  getTileByLatLng,
} from '../../lib/geo'
import { LatLngBounds } from 'leaflet'

export type TileStitchRendererStatus =
  | 'ready'
  | 'downloading'
  | 'generating'
  | 'loaded'
  | 'error'
type TileStitchRendererProps = HTMLAttributes<HTMLImageElement> & {
  bounds: LatLngBounds
  zoom: number
  tileUrlTemplate: string
  onDownloadProgress?: (loaded: number, total: number) => void
  onLoad?: () => void
  onError?: (error: Error) => void
  onStateChanged?: (state: TileStitchRendererStatus) => void
}

export function TileStitchRenderer({
  bounds,
  zoom,
  tileUrlTemplate,
  onDownloadProgress,
  onLoad,
  onError,
  onStateChanged,
  ...props
}: TileStitchRendererProps) {
  const [generating, setGenerating] = useState(false)

  const [renderedImageUrl, setRenderedImageUrl] = useState<string>()

  const [generatedResultParams, setGeneratedResultParams] = useState<{
    bounds: typeof bounds
    zoom: typeof zoom
    tileUrlTemplate: typeof tileUrlTemplate
  }>()

  // Detection flag if request should be made
  const isUpdateRequired =
    !generatedResultParams ||
    !bounds.equals(generatedResultParams.bounds) ||
    zoom !== generatedResultParams.zoom ||
    tileUrlTemplate !== generatedResultParams.tileUrlTemplate

  useEffect(() => {
    if (generating || !isUpdateRequired) {
      return
    }

    setGenerating(true)
    onStateChanged?.('downloading')
    setGeneratedResultParams({ bounds, zoom, tileUrlTemplate })

    fetchTilesByBoundsAndZoom(tileUrlTemplate, bounds, zoom, onDownloadProgress)
      .then((tiles) => generateImage(tiles, bounds, zoom))
      .then((blob) => {
        setRenderedImageUrl(URL.createObjectURL(blob))
        onStateChanged?.('loaded')
        onLoad?.()
        setGenerating(false)
      })
      .catch((e) => {
        onError?.(e)
        onStateChanged?.('error')
        setGenerating(false)
      })

    // Request should only be made if required
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdateRequired])

  return <img src={renderedImageUrl} alt="" {...props} />
}

const fetchTile = (url: string): Promise<HTMLImageElement> => {
  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.src = url
  return new Promise((resolve, reject) => {
    image.addEventListener('load', () => {
      resolve(image)
    })
    image.addEventListener('error', (e) => {
      reject(e)
    })
  })
}

const fetchTilesByBoundsAndZoom = async (
  urlTemplate: string,
  bounds: LatLngBounds,
  zoom: number,
  onProgress?: TileStitchRendererProps['onDownloadProgress'],
): Promise<HTMLImageElement[]> => {
  const tiles: HTMLImageElement[] = []

  const [startX, startY] = getTileByLatLng(
    bounds.getNorth(),
    bounds.getWest(),
    zoom,
  )
  const [endX, endY] = getTileByLatLng(
    bounds.getSouth(),
    bounds.getEast(),
    zoom,
  )

  const tilesCount = (endX - startX + 1) * (endY - startY + 1)
  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      const tileUrl = urlTemplate
        .replace('{z}', zoom.toString())
        .replace('{x}', x.toString())
        .replace('{y}', y.toString())

      tiles.push(await fetchTile(tileUrl))
      onProgress?.(tiles.length, tilesCount)
    }
  }

  return tiles
}
const generateImage = async (
  tiles: HTMLImageElement[],
  bounds: LatLngBounds,
  zoom: number,
): Promise<Blob> => {
  const [startX] = getTileByLatLng(bounds.getNorth(), bounds.getWest(), zoom)
  const [endX] = getTileByLatLng(bounds.getSouth(), bounds.getEast(), zoom)
  const tilesCountWidth = endX - startX + 1
  const tileWidth = tiles[0].width
  const tileHeight = tiles[0].height

  const [sizeW, sizeH] = getSizeInTilesByLatLngBounds(bounds, zoom)
  const canvas = new OffscreenCanvas(tileWidth * sizeW, tileHeight * sizeH)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get 2d context for canvas')
  }

  const [offsetX, offsetY] = getPositionInTilesByLatLng(
    bounds.getNorth(),
    bounds.getWest(),
    zoom,
  )
  for (let i = 0; i < tiles.length; i++) {
    const x = i % tilesCountWidth
    const y = Math.floor(i / tilesCountWidth)
    ctx.drawImage(
      tiles[i],
      Math.floor((x - offsetX) * tileWidth),
      Math.floor((y - offsetY) * tileHeight),
    )
  }

  return canvas.convertToBlob()
}
