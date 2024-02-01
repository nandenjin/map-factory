import {
  type LatLngTuple,
  type Map,
  type Rectangle as LeafletRectangle,
  type LatLngBounds,
  type LatLngBoundsLiteral,
} from 'leaflet'
import { MapContainer, TileLayer, Rectangle, FeatureGroup } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import { useCallback, useRef, useState } from 'react'
import { queryAll } from '../../lib/overpass'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Typography,
} from '@mui/material'

type MapPickerProps = {
  center: LatLngTuple
  zoom: number
  bounds: LatLngBoundsLiteral
  onCenterChange?: (center: LatLngTuple) => unknown
  onZoomChange?: (zoom: number) => unknown
  onBoundsChange?: (bound: LatLngBounds) => unknown
  onCapture?: (osmData: string) => unknown
}

/**
 * A UI component to pick bounding box to capture data.
 */
export function MapPicker({
  center,
  zoom,
  bounds,
  onCenterChange,
  onZoomChange,
  onBoundsChange,
  onCapture,
}: MapPickerProps) {
  const editableLayers = useRef(null)
  const boundRectangle = useRef<LeafletRectangle>(null)
  const [viewport, setViewport] = useState<LatLngBounds | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  // Capture drag event from map
  // - https://qiita.com/70ki8suda/items/831727af51c572e10ba8
  const mapRef = useCallback((map: Map) => {
    if (!map) return

    const handleBoundsUpdate = () => {
      const bounds = map.getBounds()
      console.log(bounds)
      if (bounds) {
        setViewport(bounds)
      }
    }

    map.on('moveend', () => {
      const center = map.getCenter()
      if (center) {
        onCenterChange?.([center.lat, center.lng])
      }
      handleBoundsUpdate()
    })

    map.on('zoomend', () => {
      const zoom = map.getZoom()
      if (zoom) {
        onZoomChange?.(zoom)
      }
      handleBoundsUpdate()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Handle rectangle edit and fire onBoundsChange event
   */
  function onEdited() {
    const newBound = boundRectangle.current?.getBounds()
    if (newBound) {
      onBoundsChange?.(newBound)
    }
  }

  return (
    <Box position="relative" style={{ width: '100%', height: '100%' }}>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        zoomControl={false}
        style={{ width: '100%', height: '100%', position: 'relative' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <FeatureGroup ref={editableLayers}>
          <EditControl
            position="topright"
            draw={{
              polyline: false,
              polygon: false,
              rectangle: false,
              circle: false,
              marker: false,
              circlemarker: false,
            }}
            edit={{ featureGroup: editableLayers, remove: false }}
            onEdited={onEdited}
          />
          <Rectangle
            ref={boundRectangle}
            bounds={bounds}
            interactive={true}
          ></Rectangle>
        </FeatureGroup>
      </MapContainer>
      <Card
        style={{
          position: 'absolute',
          top: '30px',
          left: '30px',
          zIndex: 1000,
        }}
        hidden={downloading}
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
            onClick={async () => {
              setDownloadProgress(0)
              setDownloading(true)
              const osmData = await queryAll(bounds)
              setDownloadProgress(1) // To be implemented
              setDownloading(false)
              onCapture?.(osmData)
            }}
          >
            Capture this area
          </Button>
          <Button
            size="small"
            color="secondary"
            onClick={() => {
              if (!viewport) return
              onBoundsChange?.(viewport.pad(-0.2))
            }}
          >
            Reset with viewport
          </Button>
        </CardActions>
      </Card>
      <Dialog keepMounted={true} open={downloading}>
        <DialogTitle>Downloading map data...</DialogTitle>
        <DialogContent>
          <LinearProgress
            variant={downloadProgress > 0 ? 'determinate' : 'indeterminate'}
            value={downloadProgress * 100}
          />
        </DialogContent>
        <DialogActions>{/* <Button>Cancel</Button> */}</DialogActions>
      </Dialog>
    </Box>
  )
}
