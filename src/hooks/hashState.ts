import { LatLngBounds, LatLngBoundsLiteral, LatLngTuple } from 'leaflet'
import { useHash } from 'react-use'

/** Get and parse hash parameters */
const getHash = () =>
  new URLSearchParams(location.hash.replace(/^#/, '').replace(/^[a-z]*!/, ''))

/** Set hash parameters */
const setHash = (hash: string) => (location.hash = '#' + hash.replace(/^#/, ''))

/** Hook to get viewId from URL hash state
 *
 * e.g. #mapId!param1=value1&param2=value2
 */
export function useViewId(): [string, (viewId: string) => void] {
  useHash() // Only for update detection

  const hash = location.hash
  const hashRegex = /^#([a-z_]+)!/
  const test = hash.match(hashRegex)
  const viewId = test ? test[1] : 'default'

  const setViewId = (viewId: string) => {
    const q = getHash()
    setHash(`${viewId}!${q.toString()}`)
  }

  return [viewId, setViewId]
}

/** Hook to get center point of map from URL hash state */
export function useMapCenter(): [LatLngTuple, (center: LatLngTuple) => void] {
  useHash() // Only for update detection

  const q = getHash()

  // Map
  const mapCenter: LatLngTuple = (q
    .get('center')
    ?.split(',')
    .map(parseFloat) as LatLngTuple) ?? [36.081771, 140.113755]

  const setMapCenter = (center: LatLngTuple) => {
    const q = getHash()
    q.set('center', center.join(','))
    setHash(q.toString())
  }

  return [mapCenter, setMapCenter]
}

/** Hook to get zoom level of map from URL hash state */
export function useMapZoom(): [number, (zoom: number) => void] {
  useHash() // Only for update detection

  const q = getHash()
  const mapZoom = +(q.get('zoom') ?? 16)

  const setMapZoom = (zoom: number) => {
    const q = getHash()
    q.set('zoom', zoom.toString())
    setHash(q.toString())
  }

  return [mapZoom, setMapZoom]
}

/** Hook to get bounds of map from URL hash state */
export function useMapBoundsToCapture(): [
  LatLngBoundsLiteral,
  (bounds: LatLngBounds) => void,
] {
  useHash() // Only for update detection

  const q = getHash()

  const boundCoordsFromHash = q.get('bounds')?.split(',').map(parseFloat)
  const mapBoundsToCapture = (
    boundCoordsFromHash
      ? [boundCoordsFromHash.slice(0, 2), boundCoordsFromHash.slice(2, 4)]
      : [
          [36.08493940373973, 140.10615613595058],
          [36.0801983565214, 140.11746687730607],
        ]
  ) as LatLngBoundsLiteral

  const setMapBoundsToCapture = (bounds: LatLngBounds) => {
    const boundsLiteral = [
      [bounds.getNorth(), bounds.getWest()],
      [bounds.getSouth(), bounds.getEast()],
    ]
    q.set('bounds', boundsLiteral.map((latlng) => latlng.join(',')).join(','))
    setHash(q.toString())
  }

  return [mapBoundsToCapture, setMapBoundsToCapture]
}
