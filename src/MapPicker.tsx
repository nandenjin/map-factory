import type {
  LatLngTuple,
  Map,
  Rectangle as LeafletRectangle,
  LatLngBounds,
  LatLngBoundsLiteral,
} from 'leaflet'
import { MapContainer, TileLayer, Rectangle, FeatureGroup } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import { useEffect, useRef } from 'react'

type MapPickerProps = {
  center: LatLngTuple
  zoom: number
  bounds: LatLngBoundsLiteral
  onCenterChange?: (center: LatLngTuple) => void
  onZoomChange?: (zoom: number) => void
  onBoundsChange?: (bound: LatLngBounds) => void
}

export function MapPicker({
  center,
  zoom,
  bounds,
  onCenterChange,
  onZoomChange,
  onBoundsChange,
}: MapPickerProps) {
  const map = useRef<Map>(null)
  const editableLayers = useRef(null)
  const boundRectangle = useRef<LeafletRectangle>(null)

  useEffect(() => {
    map.current?.on('moveend', () => {
      const center = map.current?.getCenter()
      if (center) {
        onCenterChange?.([center.lat, center.lng])
      }
    })

    map.current?.on('zoomend', () => {
      const zoom = map.current?.getZoom()
      if (zoom) {
        onZoomChange?.(zoom)
      }
    })
  }, [map, onCenterChange, onZoomChange])

  function onEdited() {
    const newBound = boundRectangle.current?.getBounds()
    if (newBound) {
      onBoundsChange?.(newBound)
    }
  }

  return (
    <>
      <MapContainer
        ref={map}
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
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
    </>
  )
}
