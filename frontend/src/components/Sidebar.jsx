import Search from "./Search";
import WeatherPanel from "./WeatherPanel";

export default function Sidebar({ weather, setLocation }) {
    return (
        <div style={{
            width: "300px",
            padding: "20px",
            boxShadow: "2px 0 10px rgba(0,0,0,0.1)"
          }}>
            <Search setLocation={setLocation} />
            <WeatherPanel weather={weather} />
          </div>
    )
}