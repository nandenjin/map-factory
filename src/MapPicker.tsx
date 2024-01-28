import {
  type LatLngTuple,
  type Map,
  type Rectangle as LeafletRectangle,
  type LatLngBounds,
  type LatLngBoundsLiteral,
  Control,
  DomUtil,
  type ControlOptions,
} from 'leaflet'
import { MapContainer, TileLayer, Rectangle, FeatureGroup } from 'react-leaflet'
import { createControlComponent } from '@react-leaflet/core'
import { EditControl } from 'react-leaflet-draw'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import { useEffect, useRef } from 'react'
import './MapPicker.css'
import { queryAll } from './lib/overpass'

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
  const map = useRef<Map>(null)
  const editableLayers = useRef(null)
  const boundRectangle = useRef<LeafletRectangle>(null)

  // Capture drag event from map
  useEffect(() => {
    map.current?.on('moveend', () => {
      const center = map.current?.getCenter()
      if (center) {
        onCenterChange?.([center.lat, center.lng])
      }
    })
  }, [map, onCenterChange])

  // Capture zoom event from map
  useEffect(() => {
    map.current?.on('zoomend', () => {
      const zoom = map.current?.getZoom()
      if (zoom) {
        onZoomChange?.(zoom)
      }
    })
  }, [map, onZoomChange])

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
        <MapPickerCaptureControl
          onCaptureRequest={async () => {
            const osmData = await queryAll(bounds)
            onCapture?.(osmData)
          }}
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

type MapPickerCaptureControlProps = ControlOptions & {
  onCaptureRequest?: () => unknown
}

const MapPickerCaptureControl = createControlComponent(
  ({ position, onCaptureRequest }: MapPickerCaptureControlProps) => {
    const MapInfo = Control.extend({
      onAdd: (map: Map) => {
        console.log(map)
        const panel = DomUtil.create('div')
        const button = DomUtil.create('button', 'leaflet-bar capture-button')
        button.appendChild(document.createTextNode('Capture'))
        button.addEventListener('click', () => onCaptureRequest?.())

        panel.appendChild(button)
        return panel
      },
    })
    return new MapInfo({ position: position ?? 'topright' })
  },
)
