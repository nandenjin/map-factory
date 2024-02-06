import { LatLngBounds, LatLngBoundsExpression } from 'leaflet'

/**
 * Converts latitude and longitude coordinates to Mercator projection.
 * @param lat - The latitude coordinate.
 * @param lon - The longitude coordinate.
 * @returns `[x, y]` in Mercator projection.
 */
export const mercator = (lat: number, lon: number): [x: number, y: number] => {
  const x = lon
  const y =
    (Math.log(Math.tan(Math.PI / 4 + ((lat / 180) * Math.PI) / 2)) / Math.PI) *
    180
  return [x, y]
}

/**
 * Converts latitude and longitude coordinates to meters using the Web Mercator projection.
 * @param lat - The latitude coordinate.
 * @param lng - The longitude coordinate.
 * @returns An array containing the x and y coordinates in meters.
 */
export const getMetersByLatLng = function (lat: number, lng: number) {
  const x = (lng * 20037508.34) / 180.0
  let y =
    Math.log(Math.tan(((90.0 + lat) * Math.PI) / 360.0)) / (Math.PI / 180.0)
  y = (y * 20037508.34) / 180.0
  return [x - originX, originY - y]
}

/** Radius of the Earth in meters */
const GEO_R = 6378137

/**
 * The x-coordinate of the origin point.
 */
const originX = -1 * ((2 * GEO_R * Math.PI) / 2)

/**
 * The y-coordinate of the origin point.
 */
const originY = (2 * GEO_R * Math.PI) / 2

/**
 * Calculates the tile unit in meters based on the given zoom level.
 * @param zoom - The zoom level.
 * @returns The tile unit in meters.
 */
export const getTileUnitInMeterByZoom = (zoom: number) =>
  (2 * GEO_R * Math.PI) / Math.pow(2, zoom)

/**
 * Calculates the tile coordinates (xtile, ytile) based on the given latitude, longitude, and zoom level.
 * @param lat - The latitude value.
 * @param lng - The longitude value.
 * @param zoom - The zoom level.
 * @returns Tile indexes `[xtile, ytile]`
 */
export const getTileByLatLng = (
  lat: number,
  lng: number,
  zoom: number,
): [tileIndexX: number, tileIndexY: number] => {
  const [x, y] = getMetersByLatLng(lat, lng)

  const unit = getTileUnitInMeterByZoom(zoom)

  const xtile = Math.floor(x / unit)
  const ytile = Math.floor(y / unit)

  return [xtile, ytile]
}

/**
 * Calculates the size of a given latitude-longitude bounds at a specific zoom level, in tile size units.
 * @param bounds - The latitude-longitude bounds.
 * @param zoom - The zoom level.
 * @returns `[width, height]` of the bounds in tile size unit.
 */
export const getSizeInTilesByLatLngBounds = (
  bounds: LatLngBoundsExpression,
  zoom: number,
): [width: number, height: number] => {
  bounds = bounds instanceof LatLngBounds ? bounds : new LatLngBounds(bounds)
  const [x1, y1] = getMetersByLatLng(bounds.getNorth(), bounds.getWest())
  const [x2, y2] = getMetersByLatLng(bounds.getSouth(), bounds.getEast())
  const unit = getTileUnitInMeterByZoom(zoom)
  return [Math.abs(x2 - x1) / unit, Math.abs(y2 - y1) / unit]
}

/**
 * Calculates the relative position of a given latitude-longitude point in the tile contains it.
 * @param lat - The latitude value.
 * @param lng - The longitude value.
 * @param zoom - The zoom level.
 * @returns the relative `[x, y]` position in the tile. (0 ~ 1)
 */
export const getPositionInTilesByLatLng = (
  lat: number,
  lng: number,
  zoom: number,
): [x: number, y: number] => {
  const [x, y] = getMetersByLatLng(lat, lng)
  const unit = getTileUnitInMeterByZoom(zoom)
  return [(x % unit) / unit, (y % unit) / unit]
}
