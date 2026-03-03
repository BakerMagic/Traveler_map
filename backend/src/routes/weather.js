import express from "express"
import { fetchCurrentWeather, fetchForecast } from "../services/openWeatherService.js"

const router = express.Router()

router.get("/current", async (req, res) => {
    try {
        const { lat, lon } = req.query
        if (!lat || !lon) {
            return res.status(400).json({ error: "lat and lon are required" })
        }

        const data = await fetchCurrentWeather({ lat: Number(lat), lon: Number(lon) })
        res.json({ weather: data })
    } catch (error) {
        console.error("Error in /api/weather/current:", error)
        res.status(500).json({ error: "Failed to fetch current weather" })
    }
})

router.get("/forecast", async (req, res) => {
    try {
        const { lat, lon } = req.query
        if (!lat || !lon) {
            return res.status(400).json({ error: "lat and lon are required" })
        }

        const data = await fetchForecast({ lat: Number(lat), lon: Number(lon) })
        res.json({ forecast: data })
    } catch (error) {
        console.error("Error in /api/weather/forecast:", error)
        res.status(500).json({ error: "Failed to fetch forecast" })
    }
})

export default router