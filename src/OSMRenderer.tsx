import { renderToStaticMarkup } from 'react-dom/server'
import { Layer } from './Layer'
import { osmFeatureKeys } from './features'
import { mercator } from './lib/geo'
import { LatLngBounds, type LatLngBoundsExpression } from 'leaflet'
import { Button } from '@mui/material'

type OSMRendererProps = { data: string; bounds?: LatLngBoundsExpression }

export function OSMRenderer({ data, bounds }: OSMRendererProps) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(data, 'text/xml')
  const errorNode = doc.querySelector('parsererror')

  let minlat = 0,
    minlon = 0,
    maxlat = 0,
    maxlon = 0

  if (bounds) {
    const b = bounds instanceof LatLngBounds ? bounds : new LatLngBounds(bounds)
    minlat = b.getSouth()
    minlon = b.getWest()
    maxlat = b.getNorth()
    maxlon = b.getEast()
  } else {
    const boundsElement = doc.querySelector('bounds')

    // ToDo: Extract geomapping to a separate class.
    minlat = +(boundsElement?.getAttribute('minlat') || 0)
    minlon = +(boundsElement?.getAttribute('minlon') || 0)
    maxlat = +(boundsElement?.getAttribute('maxlat') || 0)
    maxlon = +(boundsElement?.getAttribute('maxlon') || 0)
  }

  const [nwX, nwY] = mercator(maxlat, minlon)
  const [seX, seY] = mercator(minlat, maxlon)
  const scale = 1000 / (nwX - seX)
  const aspect = (seX - nwX) / (nwY - seY)

  /**
   * Converts latitude and longitude coordinates to graphic XY coordinates.
   * @param lat The latitude coordinate.
   * @param lon The longitude coordinate.
   * @returns An array containing the graphic X and Y coordinates.
   */
  const toGraphicXY = (lat: number, lon: number) => {
    const [x, y] = mercator(lat, lon)
    const graphicX = -(x - nwX) * scale
    const graphicY = -(nwY - y) * scale
    return [graphicX, graphicY]
  }

  const renderLayer = (layer: Layer) => {
    const content = layer.els.map((el) => {
      if (el instanceof Layer) {
        return renderLayer(el)
      } else {
        const nds = el.getElementsByTagName('nd')

        const points = Array.from(nds).map((nd) => {
          const ref = nd.getAttribute('ref')
          if (!ref) return null

          const node = doc.getElementById(ref)
          return toGraphicXY(
            +(node?.getAttribute('lat') || 0),
            +(node?.getAttribute('lon') || 0),
          ).join(',')
        })
        return (
          <g id={el.id} key={el.id}>
            <polyline
              points={points.join(',')}
              style={{
                fill: 'none',
                stroke: '#000',
                strokeWidth: '1px',
              }}
            />
          </g>
        )
      }
    })

    if (layer.id === 'root') {
      return <g>{content}</g>
    } else {
      return (
        <g id={layer.id} key={layer.id}>
          {content}
        </g>
      )
    }
  }

  const render = () => (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="800"
      height={800 / aspect}
      viewBox={[0, 0, 1000, 1000 / aspect].join(',')}
      style={{ border: '1px solid #000' }}
    >
      {renderLayer(layer)}
    </svg>
  )

  const ways = Array.from(doc.querySelectorAll('way'))
  const layer = new Layer('root')
  for (const way of ways) {
    const tags = Array.from(way.getElementsByTagName('tag'))
    searchKey: for (const tag of tags) {
      const k = tag.getAttribute('k')
      for (const key of osmFeatureKeys) {
        if (k === key) {
          const v = tag.getAttribute('v')
          if (v) {
            layer.add([k, v], way)
          }
          break searchKey
        }
      }
    }
  }

  return (
    <>
      {errorNode ? (
        <div>Parse error</div>
      ) : (
        <>
          <div>{render()}</div>
          <Button
            variant="contained"
            target="_blank"
            download={Date.now() + '.svg'}
            href={URL.createObjectURL(
              new Blob([renderToStaticMarkup(render())], {
                type: 'image/svg+xml',
              }),
            )}
          >
            Download
          </Button>
        </>
      )}
    </>
  )
}
