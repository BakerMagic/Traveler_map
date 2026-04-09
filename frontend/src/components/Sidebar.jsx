import Events from "./Events"
import Search from "./Search"
import WeatherPanel from "./WeatherPanel"
import styles from "../styles/Sidebar.module.css"

export default function Sidebar({ 
  weather,
  setWeather,
  forecast,
  setForecast,
  location, 
  setLocation, 
  routePoints, 
  setRoutePoints,
  setRouteGeometry,
  setRouteSummary,
  currentRouteId,
  setCurrentRouteId,
  currentRouteName,
  setCurrentRouteName,
  routeMode,
  setRouteMode,
  setSelectedEvent
}) {
  return (
      <div className={styles.root}>
          <Search 
            setWeather={setWeather}
            setForecast={setForecast}
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
          />
          <WeatherPanel 
            weather={weather}
            forecast={forecast}
          />
          <Events 
            location={location}
            setLocation={setLocation}
            setSelectedEvent={setSelectedEvent}
          />
      </div>
  )
}