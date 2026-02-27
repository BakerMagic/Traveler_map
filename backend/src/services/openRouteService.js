import fetch from "node-fetch"

const ORS_BASE_URL = "https://api.openrouteservice.org/v2"

export async function fetchRouteByPoints({ points, profile = "driving-car" }) {
    const apiKey = process.env.OPENROUTESERVICE_API_KEY
    if (!apiKey) {
        throw new Error("OPEROUTESERVICE_API_KEY is not set")
    }

    if (!points || points.length < 2) {
        throw new Error ("Минимум 2 точки для маршрута")
    }

    const coordinates = points.map((p) => [p.lon, p.lat])

    const url = `${ORS_BASE_URL}/directions/${profile}/geojson`

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: apiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ coordinates })
    })

    if (!response.ok) {
        const text = await response.text()
        throw new Error(`OpenRouteService HTTP ${response.status}: ${text}`)
    }

    const data = await response.json()
    const feature = data.features?.[0]
    if (!feature) {
        return null
    }

    const coords = feature.geometry?.coordinates || []
    const summary = feature.properties?.summary || {}

    return {
        coordinates: coords.map(([lon, lat]) => ({ lon, lat })),
        distance: summary.distance || 0, // в метрах
        duration: summary.duration || 0 // в секундах
    }
}