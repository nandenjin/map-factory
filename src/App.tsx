import './App.css'
import { useEffect, useState } from 'react'
import { OSMRenderer } from './components/ui/OSMRenderer'
import { MapPicker } from './components/ui/MapPicker'
import { useHash } from 'react-use'
import { type LatLngBoundsLiteral, type LatLngTuple } from 'leaflet'
import { Box } from '@mui/material'
import { SiteHeader } from './components/layouts/SiteHeader'

function App() {
  // Captured OSM data
  const [OSMData, setOSMData] = useState('')

  // URL hash state
  const [hash, setHash] = useHash()
  const q = new URLSearchParams(hash.slice(1)) // Remove leading '#'

  // Map
  const mapCenterFromHash = q.get('center')?.split(',').map(parseFloat)
  const [mapCenter, setMapCenter] = useState<LatLngTuple>(
    (mapCenterFromHash as LatLngTuple) ?? [36.081771, 140.113755],
  )
  const mapZoomFromHash = +(q.get('zoom') ?? 0)
  const [mapZoom, setMapZoom] = useState(mapZoomFromHash || 16)

  // Bounds to capture
  const boundCoordsFromHash = q.get('bounds')?.split(',').map(parseFloat)
  const [bounds, setBounds] = useState<LatLngBoundsLiteral>(
    boundCoordsFromHash
      ? ([
          boundCoordsFromHash.slice(0, 2),
          boundCoordsFromHash.slice(2, 4),
        ] as LatLngBoundsLiteral)
      : [
          [36.08493940373973, 140.10615613595058],
          [36.0801983565214, 140.11746687730607],
        ],
  )

  // Sync map state to URL hash
  useEffect(() => {
    const q = new URLSearchParams()
    q.set('bounds', bounds.map((latlng) => latlng.join(',')).join(','))
    q.set('center', mapCenter.join(','))
    q.set('zoom', mapZoom.toString())
    setHash(q.toString())
  }, [mapCenter, mapZoom, bounds, setHash])

  return (
    <Box
      width="100%"
      height="100%"
      display="grid"
      gridTemplateRows={'auto 1fr'}
    >
      <Box>
        <SiteHeader
          currentStep="map"
          onStepChangeRequest={(step) => {
            switch (step) {
              case 'map':
                setOSMData('')
                break
            }
          }}
        />
      </Box>
      <Box>
        {OSMData.length > 0 ? (
          <OSMRenderer data={OSMData} bounds={bounds} />
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
            onCapture={setOSMData}
          />
        )}
      </Box>
    </Box>
  )
}

export default App
