import './App.css'
import OSMData from './assets/map.osm?raw'

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
  console.log(scale, aspect)

  const toGraphicXY = (lat: number, lon: number) => {
    const [x, y] = mercator(lat, lon)
    const graphicX = -(x - nwX) * scale
    const graphicY = -(nwY - y) * scale
    return [graphicX, graphicY]
  }

  const ways = doc.querySelectorAll('way')
  return (
    <>
      {errorNode ? (
        <div>Parse error</div>
      ) : (
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="800"
            height={800 / aspect}
            viewBox={[0, 0, 1000, 1000 / aspect].join(',')}
            style={{ border: '1px solid #000' }}
          >
            <g>
              {Array.from(ways).map((way) => {
                const nds = way.getElementsByTagName('nd')

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
                  <g id={way.id} key={way.id}>
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
              })}
            </g>
          </svg>
        </div>
      )}
    </>
  )
}

export default App
