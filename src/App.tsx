import './App.css'
import { useEffect, useState } from 'react'
import { OSMRenderer } from './OSMRenderer'
import { MapPicker } from './MapPicker'
import { useHash } from 'react-use'
import type { LatLngBoundsLiteral, LatLngTuple } from 'leaflet'

function App() {
  const [OSMData] = useState('')
  const [hash, setHash] = useHash()
  const [mapCenter, setMapCenter] = useState<LatLngTuple>([
    36.081771, 140.113755,
  ])
  const [mapZoom, setMapZoom] = useState(16)
  const [bounds, setBounds] = useState<LatLngBoundsLiteral>([
    [36.08493940373973, 140.10615613595058],
    [36.0801983565214, 140.11746687730607],
  ])

  useEffect(() => {
    const q = new URLSearchParams()
    q.set('bounds', bounds.map((latlng) => latlng.join(',')).join(','))
    q.set('center', mapCenter.join(','))
    q.set('zoom', mapZoom.toString())
    setHash(q.toString())
  }, [mapCenter, mapZoom, bounds, setHash])

  useEffect(() => {
    const q = new URLSearchParams(hash)
    const center = q.get('center')
    if (center) {
      setMapCenter(center.split(',').map(parseFloat) as LatLngTuple)
    }

    const zoom = q.get('zoom')
    if (zoom) {
      setMapZoom(+zoom)
    }

    const bounds = q.get('bounds')
    if (bounds) {
      const coords = bounds.split(',').map(parseFloat)

      setBounds([coords.slice(0, 2), coords.slice(2, 4)] as LatLngBoundsLiteral)
    }
  }, [hash]) // To be fix: double update when hash changes

  return OSMData.length > 0 ? (
    <OSMRenderer data={OSMData} />
  ) : (
    <MapPicker
      center={mapCenter}
      onCenterChange={(center) => {
        setMapCenter(center)
      }}
      zoom={mapZoom}
      onZoomChange={(zoom) => {
        setMapZoom(zoom)
      }}
      bounds={bounds}
      onBoundsChange={(bounds) => {
        setBounds([
          [bounds.getNorth(), bounds.getWest()],
          [bounds.getSouth(), bounds.getEast()],
        ])
      }}
    />
  )
}

export default App
