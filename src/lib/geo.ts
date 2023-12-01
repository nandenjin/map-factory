/**
 * Converts latitude and longitude coordinates to Mercator projection.
 * @param lat - The latitude coordinate.
 * @param lon - The longitude coordinate.
 * @returns An array containing the x and y coordinates in Mercator projection.
 */
export const mercator = (lat: number, lon: number) => {
  const x = lon
  const y =
    (Math.log(Math.tan(Math.PI / 4 + ((lat / 180) * Math.PI) / 2)) / Math.PI) *
    180
  return [x, y]
}
