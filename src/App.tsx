import './App.css'
import { Box, CssBaseline } from '@mui/material'
import { SiteHeader } from './components/layouts/SiteHeader'
import { MapPickerView } from './components/views/MapPickerView'
import { VectorMapView } from './components/views/VectorMapView'
import { useViewId } from './hooks/hashState'
import { TileMapView } from './components/views/TileMapView'

function App() {
  const [viewId] = useViewId()
  return (
    <>
      <CssBaseline />
      <Box
        width="100%"
        height="100%"
        display="grid"
        gridTemplateRows={'auto 1fr'}
      >
        <SiteHeader />
        <Box>
          {viewId === 'default' && <MapPickerView width="100%" height="100%" />}
          <VectorMapView
            paused={viewId !== 'vector'}
            display={viewId === 'vector' ? 'block' : 'none'}
            width="100%"
            height="100%"
          />
          <TileMapView
            paused={viewId !== 'tile'}
            display={viewId === 'tile' ? 'block' : 'none'}
            width="100%"
            height="100%"
          />
        </Box>
      </Box>
    </>
  )
}

export default App
