import { useState } from "react"
import MapComponent from './components/Map'
import Sidebar from './components/Sidebar'

function App() {
  const [weather, setWeather] = useState(null)
  const [location, setLocation] = useState(null)
  const [routePoints, setRoutePoints] = useState([])
  const [routeGeometry, setRouteGeometry] = useState(null)

  return (
    <div style={{display: "flex", height: "100vh"}}>

      {/* Левая панель*/}
      <Sidebar 
        weather={weather}
        setLocation={setLocation}
        location={location}
        routePoints={routePoints}
        setRoutePoints={setRoutePoints}
        setRouteGeometry={setRouteGeometry}
      />

      {/* Карта */}
      <MapComponent
        setWeather={setWeather}
        location={location}
        routePoints={routePoints}
        routeGeometry={routeGeometry}
      />
    </div>
  )
}

export default App