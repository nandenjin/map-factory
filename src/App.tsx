import './App.css'
import { useState } from 'react'
import { OSMRenderer } from './OSMRenderer'

function App() {
  const [OSMData] = useState('')

  return OSMData.length > 0 ? <OSMRenderer data={OSMData} /> : <div>O</div>
}

export default App
