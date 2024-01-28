import { LatLngBounds, type LatLngBoundsExpression } from 'leaflet'

/** Execute query for overpass API
 *
 * @param query Overpass QL query string
 */
export const queryOverpass = async (query: string) => {
  const endpoint = `https://overpass-api.de/api/interpreter`

  const requestBody = new URLSearchParams()
  requestBody.append('data', query)

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: requestBody,
  })
  const data = await response.text()
  return data
}

/**
 * Query all elements from overpass API
 *
 * @param bbox Bounding box to query
 * @returns OSM data string
 */
export const queryAll = async (bbox: LatLngBoundsExpression) => {
  const bboxStr = getBBoxString(bbox)
  const query = `way(${bboxStr});(._;>;);out meta;`
  const data = await queryOverpass(query)
  return data
}

/**
 * Returns a string representation of the bounding box coordinates for overpass API.
 *
 * @param bbox - The bounding box coordinates.
 * @returns The string representation of the bounding box coordinates.
 */
const getBBoxString = (bbox: LatLngBoundsExpression) => {
  const bounds = bbox instanceof LatLngBounds ? bbox : new LatLngBounds(bbox)
  return `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`
}
