import Events from "./Events"
import Search from "./Search"
import WeatherPanel from "./WeatherPanel"
import styles from "../styles/Sidebar.module.css"

export default function Sidebar({ 
  weather,
  forecast,
  setLocation, 
  location, 
  routePoints, 
  setRoutePoints,
  setRouteGeometry,
  setRouteSummary,
  currentRouteId,
  setCurrentRouteId,
  currentRouteName,
  setCurrentRouteName,
  routeMode,
  setRouteMode
}) {
  return (
      <div className={styles.root}>
          <Search 
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
          <WeatherPanel weather={weather} forecast={forecast} />
          <Events location={location} setLocation={setLocation}/>
      </div>
  )
}