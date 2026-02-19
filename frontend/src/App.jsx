import { useState } from "react"
import MapComponent from './components/Map'
import Sidebar from './components/Sidebar'

function App() {
  const [weather, setWeather] = useState(null)
  const [location, setLocation] = useState(null)

  return (
    <div style={{display: "flex", height: "100vh"}}>

      {/* Левая панель*/}
      <Sidebar weather={weather} setLocation={setLocation}/>

      {/* Карта */}
      <MapComponent setWeather={setWeather} location={location}/>
    </div>
  )
}

export default App