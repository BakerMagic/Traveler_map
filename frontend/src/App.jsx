import { useState } from "react"
import MapComponent from './components/Map'
import Sidebar from './components/Sidebar'

function App() {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [location, setLocation] = useState(null)
  const [routePoints, setRoutePoints] = useState([])
  const [routeGeometry, setRouteGeometry] = useState(null)
  const [currentRouteId, setCurrentRouteId] = useState(null)
  const [currentRouteName, setCurrentRouteName] = useState("")

  return (
    <div style={{display: "flex", height: "100vh"}}>

      {/* Левая панель*/}
      <Sidebar 
        weather={weather}
        forecast={forecast}
        setLocation={setLocation}
        location={location}
        routePoints={routePoints}
        setRoutePoints={setRoutePoints}
        setRouteGeometry={setRouteGeometry}
        currentRouteId={currentRouteId}
        setCurrentRouteId={setCurrentRouteId}
        currentRouteName={currentRouteName}
        setCurrentRouteName={setCurrentRouteName}
      />

      {/* Карта */}
      <MapComponent
        setWeather={setWeather}
        setForecast={setForecast}
        location={location}
        setLocation={setLocation}
        routePoints={routePoints}
        routeGeometry={routeGeometry}
        currentRouteId={currentRouteId}
        setCurrentRouteId={setCurrentRouteId}
        setRoutePoints={setRoutePoints}
        setRouteGeometry={setRouteGeometry}
        setCurrentRouteName={setCurrentRouteName}
      />
    </div>
  )
}

export default App