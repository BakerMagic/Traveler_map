import { useState } from "react"
import MapComponent from './components/Map'
import Sidebar from './components/Sidebar'

function App() {
  const [weather, setWeather] = useState(null)
  
  return (
    <div style={{display: "flex", height: "100vh"}}>

      {/* Левая панель*/}
      <Sidebar weather={weather}/>

      {/* Карта */}
      <MapComponent setWeather={setWeather}/>
    </div>
  )
}

export default App