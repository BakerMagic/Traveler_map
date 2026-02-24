import Events from "./Events";
import Search from "./Search";
import WeatherPanel from "./WeatherPanel";

export default function Sidebar({ weather, setLocation, location }) {
    return (
        <div style={{
            width: "350px",
            padding: "20px",
            boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
            overflowY: "auto"
          }}>
            <Search setLocation={setLocation} />
            <WeatherPanel weather={weather} />
            <Events location={location} setLocation={setLocation}/>
          </div>
    )
}