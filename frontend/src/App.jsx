import { useState } from "react"
import MapComponent from './components/Map'
import Sidebar from './components/Sidebar'
import styles from './App.module.css'
import { DEFAULT_ROUTE_MODE } from "./utils/routeProfiles"

function App() {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [location, setLocation] = useState(null)
  const [routePoints, setRoutePoints] = useState([])
  const [routeGeometry, setRouteGeometry] = useState(null)
  const [routeSummary, setRouteSummary] = useState(null)
  const [currentRouteId, setCurrentRouteId] = useState(null)
  const [currentRouteName, setCurrentRouteName] = useState("")
  const [routeMode, setRouteMode] = useState(DEFAULT_ROUTE_MODE)
  const [selectedEvent, setSelectedEvent] = useState(null)

  return (
    <div className={styles.layout}>

      {/* Левая панель*/}
      <Sidebar 
        weather={weather}
        setWeather={setWeather}
        forecast={forecast}
        setForecast={setForecast}
        location={location}
        setLocation={setLocation}
        routePoints={routePoints}
        setRoutePoints={setRoutePoints}
        setRouteGeometry={setRouteGeometry}
        setRouteSummary={setRouteSummary}
        currentRouteId={currentRouteId}
        setCurrentRouteId={setCurrentRouteId}
        currentRouteName={currentRouteName}
        setCurrentRouteName={setCurrentRouteName}
        routeMode={routeMode}
        setRouteMode={setRouteMode}
        setSelectedEvent={setSelectedEvent}
      />

      {/* Карта */}
      <MapComponent
        setWeather={setWeather}
        setForecast={setForecast}
        location={location}
        setLocation={setLocation}
        routePoints={routePoints}
        routeGeometry={routeGeometry}
        routeSummary={routeSummary}
        setRouteSummary={setRouteSummary}
        currentRouteId={currentRouteId}
        setCurrentRouteId={setCurrentRouteId}
        setRoutePoints={setRoutePoints}
        setRouteGeometry={setRouteGeometry}
        setCurrentRouteName={setCurrentRouteName}
        setRouteMode={setRouteMode}
        selectedEvent={selectedEvent}
      />
    </div>
  )
}

export default App