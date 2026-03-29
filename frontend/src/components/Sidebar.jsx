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
  currentRouteId,
  setCurrentRouteId,
  currentRouteName,
  setCurrentRouteName
}) {
  return (
      <div className={styles.root}>
          <Search 
            setLocation={setLocation}
            routePoints={routePoints}
            setRoutePoints={setRoutePoints}
            setRouteGeometry={setRouteGeometry}
            currentRouteId={currentRouteId}
            setCurrentRouteId={setCurrentRouteId}
            currentRouteName={currentRouteName}
            setCurrentRouteName={setCurrentRouteName}
          />
          <WeatherPanel weather={weather} forecast={forecast} />
          <Events location={location} setLocation={setLocation}/>
      </div>
  )
}