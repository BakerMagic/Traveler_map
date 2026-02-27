import express from "express"
import { fetchRouteByPoints } from "../services/openRouteService.js"

const router = express.Router()

router.post("/", async (req, res) => {
    try {
        const { points, profile } = req.body

        if (!points || points.length < 2) {
            return res.status(400).json({ error: "Минимум 2 точки" })
        }

        const cleanedPoints = points.map((p) => ({
            lat: Number(p.lat),
            lon: Number(p.lon)
        }))

        const route = await fetchRouteByPoints({
            points: cleanedPoints,
            profile: profile || "driving-car"
        })

        if (!route) {
            return res.status(404).json({ error: "Маршрут не найден" })
        }

        res.json({ route })
    } catch (error) {
        console.error("Error in /api/route:", error)
        res.status(500).json({ error: "Failed to build route" })
    }
})

export default router