import {
  Box,
  BoxProps,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { MapPicker } from '../ui/MapPicker'
import {
  useMapBoundsToCapture,
  useMapCenter,
  useMapZoom,
  useViewId,
} from '../../hooks/hashState'
import { LatLngBounds } from 'leaflet'

type MapPickerViewProps = BoxProps

export function MapPickerView({ ...props }: MapPickerViewProps) {
  const [, setViewId] = useViewId()
  const [mapCenter, setMapCenter] = useMapCenter()
  const [mapZoom, setMapZoom] = useMapZoom()
  const [mapBounds, onBoundsChange] = useState<LatLngBounds | null>(null)
  const [boundsToCapture, setBoundsToCapture] = useMapBoundsToCapture()

  return (
    <Box {...props}>
      <Box position="relative" width="100%" height="100%">
        <MapPicker
          boundsToCapture={boundsToCapture}
          center={mapCenter}
          zoom={mapZoom}
          onBoundsToCaptureChange={setBoundsToCapture}
          onCenterChange={setMapCenter}
          onZoomChange={setMapZoom}
          onBoundsChange={onBoundsChange}
        />
        <Card
          style={{
            position: 'absolute',
            top: '30px',
            left: '30px',
            zIndex: 1000,
          }}
        >
          <CardContent>
            <Typography variant="h6">How to use</Typography>
            <Typography variant="body1">
              Set area to capture on the map.
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              color="primary"
              onClick={() => setViewId('vector')}
            >
              Capture this area
            </Button>
            <Button
              size="small"
              color="secondary"
              onClick={() => {
                if (!mapBounds) return
                setBoundsToCapture(mapBounds.pad(-0.2))
              }}
            >
              Reset with viewport
            </Button>
          </CardActions>
        </Card>
      </Box>
    </Box>
  )
}
