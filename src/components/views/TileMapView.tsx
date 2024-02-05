import {
  Box,
  BoxProps,
  Button,
  FormControl,
  FormHelperText,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { useMapBoundsToCapture, useMapZoom } from '../../hooks/hashState'
import { ComponentProps, useEffect, useState } from 'react'
import {
  TileStitchRenderer,
  TileStitchRendererStatus,
} from '../ui/TileStitchRenderer'
import { LatLngBounds } from 'leaflet'
import { TILES } from '../../lib/tiles'

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

  const [tileUrlTemplate, setTileUrlTemplate] = useState<string>(
    TILES['GSI.std'],
  )
  const tileId = Object.keys(TILES).find(
    (key) => TILES[key] === tileUrlTemplate,
  )

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

  return (
    <Box {...props}>
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
        <FormControl sx={{ m: 1 }} fullWidth>
          <FormHelperText>Tile source</FormHelperText>
          <Box display="flex">
            <Select
              value={tileId}
              onChange={(e) => {
                setTileUrlTemplate(TILES[e.target.value as string])
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
          onStateChanged={setRendererStatus}
          style={{ maxWidth: '100%' }}
        />
      )}
    </Box>
  )
}
