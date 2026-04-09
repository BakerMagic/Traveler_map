import { useMemo, useState } from "react"
import styles from "../styles/WeatherPanel.module.css"

function formatTemp(value) {
    return `${Math.round(value)}°`
}

function dayKeyFromUnix(dt) {
    const d = new Date(dt * 1000)

    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function formatDayLabel(dt) {
    return new Date(dt * 1000).toLocaleDateString("ru-RU", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
    })
}

function formatTime(dt) {
    return new Date(dt * 1000).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
    })
}

function isDayHour(dt) {
    const h = new Date(dt * 1000).getHours()

    return h >= 9 && h < 21
}

function isNightAfterMidnight(dt) {
    const h = new Date(dt * 1000).getHours()

    return h >= 0 && h < 6
}

function groupForecastByDay(forecastList = []) {
    const map = new Map()

    for (const item of forecastList) {
        const key = dayKeyFromUnix(item.dt)

        if (!map.has(key)) {
            map.set(key, {
                key,
                dt: item.dt,
                all: [],
                dayItems: [],
                nightItems: [],
            })
        }

        const day = map.get(key)
        day.all.push(item)

        if (isDayHour(item.dt)) day.dayItems.push(item)
        else day.nightItems.push(item)
    }

    return Array.from(map.values()).slice(0, 5)
}

function pickMaxTemp(items) {
    if (!items.length) return null

    return Math.round(Math.max(...items.map((it) => it.main?.temp ?? -Infinity)))
}
  
function pickMinTemp(items) {
    if (!items.length) return null

    return Math.round(Math.min(...items.map((it) => it.main?.temp ?? Infinity)))
}

function pickMainDescription(items) {
    if (!items.length) return "—"

    const counter = new Map()

    for (const it of items) {
        const desc = it.weather?.[0]?.description || "—"
        counter.set(desc, (counter.get(desc) || 0) + 1)
    }

    let best = "—"
    let bestCount = -1

    for (const [desc, count] of counter.entries()) {
        if (count > bestCount) {
            best = desc
            bestCount = count
        }
    }

    return best
}

export default function WeatherPanel({ 
    weather,
    forecast
}) {
    const [isForecastOpen, setIsForecastOpen] = useState(false)
    const [expandedDayKey, setExpandedDayKey] = useState(null)

    const days = useMemo(() => {
        if (!forecast?.list) return []
        return groupForecastByDay(forecast.list)
    }, [forecast])

    if (!weather) {
        return null
    }

    return (
        <div className={styles.root}>
            <div className={styles.currentCard}>
                <div className={styles.currentHeader}>
                    <h2 className={styles.title}>Погода сейчас</h2>
                    <div className={styles.city}>{weather.name}</div>
                </div>


                <div className={styles.currentMain}>
                    <div className={styles.currentTemp}>{formatTemp(weather.main.temp)}</div>
                    <div className={styles.currentDesc}>{weather.weather?.[0]?.description}</div>
                </div>

                <div className={styles.currentMeta}>
                    <div>Ощущается: {formatTemp(weather.main.feels_like)}</div>
                    <div>Ветер: {weather.wind.speed} м/с</div>
                    <div>Влажность: {weather.main.humidity}%</div>
                </div>

                {forecast && (
                    <button
                        type="button"
                        className={styles.forecastToggle}
                        onClick={() => {
                            setIsForecastOpen((v) => !v)
                            if (isForecastOpen) setExpandedDayKey(null)
                        }}
                    >
                        {isForecastOpen ? "Скрыть прогноз на 5 дней" : "Показать прогноз на 5 дней"}
                    </button>
                )}
            </div>

            {forecast && isForecastOpen && (
                <div className={styles.forecastSection}>
                    <h3 className={styles.forecastTitle}>Прогноз на 5 дней</h3>

                    <div className={styles.daysList}>
                        {days.map((day, index) => {
                            const dayTemp = pickMaxTemp(day.dayItems)
                            const dayDesc = pickMainDescription(day.dayItems)

                            const nextDay = days[index + 1]
                            const nextNightItems = nextDay
                                ? nextDay.all.filter((item) => isNightAfterMidnight(item.dt))
                                : []


                            const nightTemp = pickMinTemp(nextNightItems)
                            const isExpanded = expandedDayKey === day.key

                            return (
                                <div key={day.key} className={styles.dayCard}>
                                    <button
                                        type="button"
                                        className={styles.daySummaryBtn}
                                        onClick={() =>
                                            setExpandedDayKey((prev) => (prev === day.key ? null : day.key))
                                        }
                                    >
                                        <div className={styles.daySummaryLeft}>
                                            <div className={styles.dayLabel}>{formatDayLabel(day.dt)}</div>
                                            <div className={styles.dayDesc}>{dayDesc}</div>
                                        </div>

                                        <div className={styles.daySummaryRight}>
                                            <div className={styles.dayTemp}>Днём: {dayTemp !== null ? `${dayTemp}°` : "—"}</div>
                                            <div className={styles.nightTemp}>Ночью: {nightTemp !== null ? `${nightTemp}°` : "—"}</div>
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className={styles.details3h}>
                                            {day.all.map((item) => (
                                                <div key={item.dt} className={styles.detailRow}>
                                                    <div className={styles.detailTime}>{formatTime(item.dt)}</div>
                                                    <div className={styles.detailTemp}>{formatTemp(item.main.temp)}</div>
                                                    <div className={styles.detailDesc}>{item.weather?.[0]?.description}</div>
                                                    <div className={styles.detailWind}>{item.wind.speed} м/с</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}