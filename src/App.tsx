import './App.css'
import { Box } from '@mui/material'
import { SiteHeader } from './components/layouts/SiteHeader'
import { MapPickerView } from './components/views/MapPickerView'
import { VectorMapView } from './components/views/VectorMapView'
import { useViewId } from './hooks/hashState'

function App() {
  const [viewId] = useViewId()
  return (
    <Box
      width="100%"
      height="100%"
      display="grid"
      gridTemplateRows={'auto 1fr'}
    >
      <SiteHeader />
      <Box>
        <MapPickerView
          display={viewId === 'default' ? 'block' : 'none'}
          width="100%"
          height="100%"
        />
        <VectorMapView
          paused={viewId !== 'vector'}
          display={viewId === 'vector' ? 'block' : 'none'}
          width="100%"
          height="100%"
        />
      </Box>
    </Box>
  )
}

export default App
