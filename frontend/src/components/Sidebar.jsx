import Events from "./Events"
import Search from "./Search"
import WeatherPanel from "./WeatherPanel"

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
      <div style={{
          width: "500px",
          padding: "20px",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          overflowY: "auto"
        }}>
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