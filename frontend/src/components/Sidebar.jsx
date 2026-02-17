import WeatherPanel from "./WeatherPanel";

export default function Sidebar({ weather }) {
    return (
        <div style={{
            width: "300px",
            padding: "20px",
            boxShadow: "2px 0 10px rgba(0,0,0,0.1)"
          }}>
            <WeatherPanel weather={weather} />
          </div>
    )
}