import { useState } from "react"
import styles from "../styles/WeatherPanel.module.css"

export default function WeatherPanel({ weather, forecast }) {
    const [isForecastOpen, setIsForecastOpen] = useState(false)
    
    if (!weather) {
        return <p>Выберите точку на карте</p>
    }

    return (
        <div className={styles.root}>
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
                    type="button"
                    className={styles.forecastToggle}
                    onClick={() => setIsForecastOpen(prev => !prev)}
                >
                    {isForecastOpen ? "Скрыть прогноз на 5 дней" : "Показать прогноз на 5 дней"}
                </button>
            )}

            {/* Выдвигаюшаяся панель слева */}
            {forecast && (
                <div
                    className={`${styles.forecastPanel} ${isForecastOpen ? styles.forecastPanelOpen : styles.forecastPanelClosed}`}
                >
                    
                    <div className={styles.forecastHeader}>
                        <h3>Прогноз на 5 дней</h3>
                        <svg
                            className={styles.closeIcon}
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            onClick={() => setIsForecastOpen(prev => !prev)}
                        >
                            <line x1="2" y1="2" x2="18" y2="18"/>
                            <line x1="2" y1="18" x2="18" y2="2"/>
                        </svg>
                    </div>
                    {forecast.list.map(item => (
                        <div key={item.dt} className={styles.forecastItem}>
                            <div className={styles.forecastItemTime}>
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