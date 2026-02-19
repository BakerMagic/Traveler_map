export default function WeatherPanel({ weather }) {
    
    if (!weather) {
        return <p>Выберите точку на карте</p>
    }

    return (
        <div>
            <h2>Погода</h2>

            <h3>{weather.name}</h3>

            <p>🌡 Температура: {weather.main.temp}°C</p>
            <p>🌡 Ощущается как: {weather.main.feels_like}°C</p>
            <p>☁ {weather.weather[0].description}</p>
            <p>💨 Ветер: {weather.wind.speed} м/с</p>
        </div>
    )
}