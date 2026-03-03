import { useState } from "react"

export default function WeatherPanel({ weather, forecast }) {
    const [isForecastOpen, setIsForecastOpen] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    
    if (!weather) {
        return <p>Выберите точку на карте</p>
    }

    return (
        <div style={{ position: "relative" }}>
            {/* Текущая погода */}
            <h2>Погода</h2>
            <h3>{weather.name}</h3>
            <p>🌡 Температура: {weather.main.temp}°C</p>
            <p>🌡 Ощущается как: {weather.main.feels_like}°C</p>
            <p>☁ {weather.weather[0].description}</p>
            <p>💨 Ветер: {weather.wind.speed} м/с</p>

            {/* Кнопка под текущей погодой */}
            {forecast && (
                <button
                    style={{ marginTop: 8 }}
                    onClick={() => setIsForecastOpen(prev => !prev)}
                >
                    {isForecastOpen ? "Скрыть прогноз на 5 дней" : "Показать прогноз на 5 дней"}
                </button>
            )}

            {/* Выдвигаюшаяся панель слева */}
            {forecast && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: isForecastOpen ? 0 : "-450px",
                        width: "375px",
                        height: "100vh",
                        background: "#242424",
                        boxShadow: "2px 0 10px regb(0,0,0,0.2)",
                        padding: 16,
                        transition: "left 0.3s ease",
                        overflowY: "auto",
                        zIndex: 1000
                    }}
                >
                    
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%"
                        }}
                    >
                        <h3>Прогноз на 5 дней</h3>
                        <svg
                            style={{ 
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "flex-end",
                                cursor: "pointer",
                                textAlign: "right",
                                stroke: isHovered ? "#bbb" : "#777"
                            }}
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            onClick={() => setIsForecastOpen(prev => !prev)}
                        >
                            <line x1="2" y1="2" x2="18" y2="18"/>
                            <line x1="2" y1="18" x2="18" y2="2"/>
                        </svg>
                    </div>
                    {forecast.list.map(item => (
                        <div key={item.dt} style={{ marginBottom: 12, borderBottom: "1px solid #eee", padding: 8 }}>
                            <div style={{ fontSize: 12, color: "#555" }}>
                                {new Date(item.dt * 1000).toLocaleString("ru-RU", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })}
                            </div>
                            <div>🌡 {item.main.temp}°C</div>
                            <div>☁ {item.weather[0].description}</div>
                            <div>💨 {item.wind.speed} м/с</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}