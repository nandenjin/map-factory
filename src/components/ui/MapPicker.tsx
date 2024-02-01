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
import { useCallback, useRef } from 'react'

type MapPickerProps = {
  center: LatLngTuple
  zoom: number
  boundsToCapture: LatLngBoundsLiteral
  onCenterChange?: (center: LatLngTuple) => unknown
  onZoomChange?: (zoom: number) => unknown
  onBoundsChange?: (bounds: LatLngBounds) => unknown
  onBoundsToCaptureChange?: (bounds: LatLngBounds) => unknown
}

/**
 * A UI component to pick bounding box to capture data.
 */
export function MapPicker({
  center,
  zoom,
  boundsToCapture,
  onCenterChange,
  onZoomChange,
  onBoundsChange,
  onBoundsToCaptureChange,
}: MapPickerProps) {
  const editableLayers = useRef(null)
  const boundRectangle = useRef<LeafletRectangle>(null)

  // Capture drag event from map
  // - https://qiita.com/70ki8suda/items/831727af51c572e10ba8
  const mapRef = useCallback((map: Map) => {
    if (!map) return

    const handleBoundsUpdate = () => {
      const bounds = map.getBounds()
      if (bounds) {
        onBoundsChange?.(bounds)
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
   * Handle rectangle edit and fire onBoundsToCaptureChange event
   */
  function onEdited() {
    const newBound = boundRectangle.current?.getBounds()
    if (newBound) {
      onBoundsToCaptureChange?.(newBound)
    }
  }

  return (
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
          bounds={boundsToCapture}
          interactive={true}
        ></Rectangle>
      </FeatureGroup>
    </MapContainer>
  )
}
