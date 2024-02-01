import { LatLngBounds, LatLngBoundsLiteral, LatLngTuple } from 'leaflet'
import { useHash } from 'react-use'

/** Hook to get viewId from URL hash state
 *
 * e.g. #mapId!param1=value1&param2=value2
 */
export function useViewId(): [string, (viewId: string) => void] {
  const [hash, setHash] = useHash()

  const hashRegex = /^#([a-z_]+)!/
  const test = hash.match(hashRegex)
  const viewId = test ? test[1] : 'default'

  const setViewId = (viewId: string) => {
    const hashParamString = hash.replace(hashRegex, '').replace(/^#/, '')
    setHash(`#${viewId}!${hashParamString}`)
  }

  return [viewId, setViewId]
}

/** Hook to get center point of map from URL hash state */
export function useMapCenter(): [LatLngTuple, (center: LatLngTuple) => void] {
  // URL hash state
  const [hash, setHash] = useHash()
  const q = new URLSearchParams(hash.slice(1)) // Remove leading '#'

  // Map
  const mapCenter: LatLngTuple = (q
    .get('center')
    ?.split(',')
    .map(parseFloat) as LatLngTuple) ?? [36.081771, 140.113755]

  const setMapCenter = (center: LatLngTuple) => {
    q.set('center', center.join(','))
    setHash('#' + q.toString())
  }

  return [mapCenter, setMapCenter]
}

/** Hook to get zoom level of map from URL hash state */
export function useMapZoom(): [number, (zoom: number) => void] {
  const [hash, setHash] = useHash()
  const q = new URLSearchParams(hash.slice(1)) // Remove leading '#'
  const mapZoom = +(q.get('zoom') ?? 16)

  const setMapZoom = (zoom: number) => {
    q.set('zoom', zoom.toString())
    setHash('#' + q.toString())
  }

  return [mapZoom, setMapZoom]
}

/** Hook to get bounds of map from URL hash state */
export function useMapBoundsToCapture(): [
  LatLngBoundsLiteral,
  (bounds: LatLngBounds) => void,
] {
  const [hash, setHash] = useHash()
  const q = new URLSearchParams(hash.slice(1)) // Remove leading '#'

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
    setHash('#' + q.toString())
  }

  return [mapBoundsToCapture, setMapBoundsToCapture]
}
