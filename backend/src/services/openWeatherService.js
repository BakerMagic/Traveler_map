import fetch from "node-fetch"

const OW_BASE_URL = "https://api.openweathermap.org/data/2.5"

export async function fetchCurrentWeather({ lat, lon }) {
    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
        throw new Error("OPENWEATHER_API_KEY is not set")
    }

    const url = new URL(`${OW_BASE_URL}/weather`)
    url.searchParams.set("lat", String(lat))
    url.searchParams.set("lon", String(lon))
    url.searchParams.set("lang", "ru")
    url.searchParams.set("units", "metric")
    url.searchParams.set("appid", apiKey)

    const response = await fetch(url.toString())
    if (!response.ok) {
        const text = await response.text()
        throw new Error(`OpenWeather current HTTP ${response.status}: ${text}`)
    }

    return await response.json()
}

export async function fetchForecast({ lat, lon }) {
    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
        throw new Error("OPENWEATHER_API_KEY is not set")
    }

    const url = new URL(`${OW_BASE_URL}/forecast`)
    url.searchParams.set("lat", String(lat))
    url.searchParams.set("lon", String(lon))
    url.searchParams.set("lang", "ru")
    url.searchParams.set("units", "metric")
    url.searchParams.set("appid", apiKey)

    const response = await fetch(url.toString())
    if (!response.ok) {
        const text = await response.text()
        throw new Error(`OpenWeather forecast HTTP ${response.status}: ${text}`)
    }

    return await response.json()
}