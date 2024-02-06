import {
  Box,
  BoxProps,
  Card,
  CardActions,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
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
import { GridView, Polyline } from '@mui/icons-material'

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
        <MapPickerViewCard
          setViewId={setViewId}
          mapBounds={mapBounds}
          setBoundsToCapture={setBoundsToCapture}
        />
      </Box>
    </Box>
  )
}

type MapPickerViewCardProps = {
  setViewId: (id: string) => void
  mapBounds: LatLngBounds | null
  setBoundsToCapture: (bounds: LatLngBounds) => void
}

const MapPickerViewCard = ({
  setViewId,
  mapBounds,
  setBoundsToCapture,
}: MapPickerViewCardProps) => (
  <Card
    style={{
      position: 'absolute',
      top: '30px',
      left: '30px',
      zIndex: 1000,
      width: '20rem',
    }}
  >
    <CardContent>
      <Typography variant="h6">About</Typography>
      <Typography variant="body1">
        map-factory is a tool to generate maps by downloading OpenStreetMap data
        or stitching tiles from any source.
      </Typography>
      <Typography variant="body2" marginTop={1}>
        Set the bounds to capture and go to desired tool view.
      </Typography>
    </CardContent>
    <CardActions>
      <List sx={{ width: '100%' }}>
        <ListItem disablePadding>
          <ListItemButton onClick={() => setViewId('vector')}>
            <ListItemIcon>
              <Polyline />
            </ListItemIcon>
            <ListItemText primary="Vector" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => setViewId('tile')}>
            <ListItemIcon>
              <GridView />
            </ListItemIcon>
            <ListItemText primary="Tile stitcher" />
          </ListItemButton>
        </ListItem>

        <Divider />
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              if (!mapBounds) return
              setBoundsToCapture(mapBounds.pad(-0.2))
            }}
          >
            <ListItemText primary="Fit bounds to viewport" />
          </ListItemButton>
        </ListItem>
      </List>
    </CardActions>
  </Card>
)
