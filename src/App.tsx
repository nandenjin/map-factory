import { renderToStaticMarkup } from 'react-dom/server'
import './App.css'
import { Layer } from './Layer'
import OSMData from './assets/map.osm?raw'
import { osmFeatureKeys } from './features'

const mercator = (lat: number, lon: number) => {
  const x = lon
  const y =
    (Math.log(Math.tan(Math.PI / 4 + ((lat / 180) * Math.PI) / 2)) / Math.PI) *
    180
  return [x, y]
}

function App() {
  const parser = new DOMParser()
  const doc = parser.parseFromString(OSMData, 'text/xml')
  const errorNode = doc.querySelector('parsererror')
  const bounds = doc.querySelector('bounds')
  const minlat = +(bounds?.getAttribute('minlat') || 0)
  const minlon = +(bounds?.getAttribute('minlon') || 0)
  const maxlat = +(bounds?.getAttribute('maxlat') || 0)
  const maxlon = +(bounds?.getAttribute('maxlon') || 0)

  const [nwX, nwY] = mercator(maxlat, minlon)
  const [seX, seY] = mercator(minlat, maxlon)
  const scale = 1000 / (nwX - seX)
  const aspect = (seX - nwX) / (nwY - seY)

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
      // return <switch>{content}</switch>
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
          <a
            target="_blank"
            download={Date.now() + '.svg'}
            href={URL.createObjectURL(
              new Blob([renderToStaticMarkup(render())], {
                type: 'image/svg+xml',
              }),
            )}
          >
            Download
          </a>
        </>
      )}
    </>
  )
}

export default App
