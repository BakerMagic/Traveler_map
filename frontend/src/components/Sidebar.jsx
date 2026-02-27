import Events from "./Events"
import Search from "./Search"
import WeatherPanel from "./WeatherPanel"
import RouteBuilder from "./RouteBuilder"

export default function Sidebar({ 
  weather, 
  setLocation, 
  location, 
  routePoints, 
  setRoutePoints,
  setRouteGeometry 
}) {
  return (
      <div style={{
          width: "500px",
          padding: "20px",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          overflowY: "auto"
        }}>
          <Search setLocation={setLocation} />
          <RouteBuilder
            routePoints={routePoints}
            setRoutePoints={setRoutePoints}
            setRouteGeometry={setRouteGeometry}
          />
{/* 
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="90">
              <circle cx="20" cy="20" r="15" fill="#ff5722"/>
              <path d="M 10 31 Q 18 37 20 45 Q 22 37 30 31" fill="#ff5722"/>
              <circle cx="20" cy="20" r="6" fill="white"/>              
            </svg>
          </div> */}

          <WeatherPanel weather={weather} />
          <Events location={location} setLocation={setLocation}/>
      </div>
  )
}