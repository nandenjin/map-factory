import {
  Alert,
  Box,
  BoxProps,
  Button,
  FormControl,
  FormHelperText,
  LinearProgress,
  Link,
  MenuItem,
  Select,
  SpeedDial,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { useMapBoundsToCapture, useMapZoom } from '../../hooks/hashState'
import { ComponentProps, useEffect, useMemo, useState } from 'react'
import {
  TileStitchRenderer,
  TileStitchRendererStatus,
} from '../ui/TileStitchRenderer'
import { LatLngBounds } from 'leaflet'
import { TILES } from '../../lib/tiles'
import { getTileByLatLng } from '../../lib/geo'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import { Download, OpenInNew } from '@mui/icons-material'

type TileMapViewProps = { paused: boolean } & BoxProps

export function TileMapView({ paused, ...props }: TileMapViewProps) {
  const [boundsToCapture] = useMapBoundsToCapture()
  const [mapZoom] = useMapZoom()
  const [zoomToCapture, setZoomToCapture] = useState(15)
  useEffect(() => {
    if (zoomToCapture < mapZoom) {
      setZoomToCapture(mapZoom)
    }
  }, [mapZoom, zoomToCapture])

  const defaultTileSource = TILES['GSI.std']
  const [tileUrlTemplate, setTileUrlTemplate] = useState<string>(
    defaultTileSource.urlTemplate,
  )
  const tileId = Object.keys(TILES).find(
    (key) => TILES[key].urlTemplate === tileUrlTemplate,
  )
  const tileAttribution = tileId ? TILES[tileId]?.attribution : null
  const tileAttributionLink = tileId ? TILES[tileId]?.attributionLink : null

  const tilesCountTotal = useMemo(() => {
    const bounds = new LatLngBounds(boundsToCapture)
    const [x1, y1] = getTileByLatLng(
      bounds.getNorth(),
      bounds.getWest(),
      zoomToCapture,
    )
    const [x2, y2] = getTileByLatLng(
      bounds.getSouth(),
      bounds.getEast(),
      zoomToCapture,
    )
    return (x2 - x1 + 1) * (y2 - y1 + 1)
  }, [boundsToCapture, zoomToCapture])

  const [rendererStatus, setRendererStatus] =
    useState<TileStitchRendererStatus>()
  const [rendererProgress, setRendererProgress] = useState<{
    loaded: number
    total: number
  }>({ loaded: 0, total: 0 })
  const [rendererProps, setRendererProps] =
    useState<ComponentProps<typeof TileStitchRenderer>>()
  const isUpdateRequired =
    !paused &&
    (!rendererProps ||
      !rendererProps.bounds.equals(boundsToCapture) ||
      rendererProps.zoom !== zoomToCapture ||
      rendererProps.tileUrlTemplate !== tileUrlTemplate)

  const generate = () => {
    setRendererProps({
      bounds: new LatLngBounds(boundsToCapture),
      zoom: zoomToCapture,
      tileUrlTemplate: tileUrlTemplate,
    })
  }

  const [renderedImage, setRenderedImage] = useState<Blob | null>(null)
  const renderedImageUrl = useMemo(() => {
    if (renderedImage) {
      return URL.createObjectURL(renderedImage)
    }
    return null
  }, [renderedImage])

  const numberFormat = new Intl.NumberFormat()

  return (
    <Box {...props}>
      <Box display="flex" flexDirection="column" height="100%">
        <Box display="flex" flexWrap={'wrap'}>
          <FormControl sx={{ m: 1 }}>
            <FormHelperText>Zoom level</FormHelperText>
            <ToggleButtonGroup
              value={zoomToCapture}
              onChange={(_, zoom) => setZoomToCapture(zoom)}
              exclusive
            >
              {[14, 15, 16, 17, 18].map((v) => (
                <ToggleButton key={v} value={v} disabled={v < mapZoom}>
                  {v}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </FormControl>
          <Box sx={{ m: 1, width: '100%' }}>
            <FormControl fullWidth>
              <FormHelperText>Tile source</FormHelperText>
              <Box display="flex">
                <Select
                  value={tileId}
                  onChange={(e) => {
                    setTileUrlTemplate(
                      TILES[e.target.value as string].urlTemplate,
                    )
                  }}
                  label="Tile source"
                  sx={{ m: 1 }}
                >
                  <MenuItem value={undefined}>Custom</MenuItem>
                  {Object.keys(TILES).map((key) => (
                    <MenuItem key={key} value={key}>
                      {key}
                    </MenuItem>
                  ))}
                </Select>
                <TextField
                  value={tileUrlTemplate}
                  onChange={(e) => setTileUrlTemplate(e.target.value)}
                  label="Tile URL"
                  fullWidth
                  sx={{ m: 1 }}
                />
              </Box>
            </FormControl>
            <Box sx={{ m: 1 }}>
              {tileAttribution && (
                <Typography variant="body2">
                  Attribution:{' '}
                  {tileAttributionLink ? (
                    <Link
                      variant="body2"
                      href={tileAttributionLink}
                      target="_blank"
                      rel="noopener"
                    >
                      {tileAttribution}
                      <OpenInNew fontSize="inherit" />
                    </Link>
                  ) : (
                    tileAttribution
                  )}
                </Typography>
              )}
            </Box>
          </Box>
          {tilesCountTotal > 100 && (
            <Alert severity="warning" sx={{ m: 1 }}>
              This will send {numberFormat.format(tilesCountTotal)} requests to
              the source server. Be careful not to overload the source server,
              do this at your own own responsibility.
            </Alert>
          )}
          <Button
            disabled={paused || !isUpdateRequired}
            onClick={generate}
            sx={{ m: 1 }}
          >
            Generate
          </Button>
        </Box>
        {(rendererStatus === 'downloading' && (
          <LinearProgress
            variant="determinate"
            value={(rendererProgress.loaded / rendererProgress.total) * 100}
          />
        )) ||
          (rendererStatus === 'generating' && <LinearProgress />)}

        <TransformWrapper centerOnInit>
          <TransformComponent
            wrapperStyle={{
              width: '100%',
              backgroundColor: '#ccc',
              flexGrow: 1,
            }}
          >
            {rendererProps && (
              <TileStitchRenderer
                bounds={rendererProps.bounds}
                zoom={rendererProps.zoom}
                tileUrlTemplate={rendererProps.tileUrlTemplate}
                onDownloadProgress={(loaded, total) =>
                  setRendererProgress({
                    loaded,
                    total,
                  })
                }
                onComplete={setRenderedImage}
                onStateChanged={setRendererStatus}
                style={{ maxWidth: '100%' }}
              />
            )}
          </TransformComponent>
        </TransformWrapper>
        <SpeedDial
          ariaLabel="Download"
          icon={<Download />}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            visibility: renderedImageUrl ? 'visible' : 'hidden',
          }}
          onClick={
            renderedImageUrl
              ? () => {
                  const bounds = new LatLngBounds(boundsToCapture)
                  const serializedBounds = bounds.toBBoxString()
                  const link = document.createElement('a')
                  link.href = renderedImageUrl
                  link.download = `map-factory_${serializedBounds}.png`
                  link.click()
                }
              : undefined
          }
        />
      </Box>
    </Box>
  )
}
