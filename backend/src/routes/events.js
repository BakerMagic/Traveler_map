import express from "express"
import { fetchEventsByLocationTicketmaster } from "../services/ticketmasterService.js"
import { fetchEventsByLocationKudaGo } from "../services/kudaGoService.js"

const router = express.Router()

router.get("/", async (req, res) => {
    try {
        const { lat, lon } = req.query

        if (!lat || !lon) {
            return res.status(400).json({ error: "lat and lon are required" })
        }

        const latNum = Number(lat)
        const lonNum = Number(lon)

        let ticketmasterEvents = []
        let kudagoEvents = []

        await Promise.all([
            (async () => {
                try {
                    ticketmasterEvents = await fetchEventsByLocationTicketmaster({
                        lat: latNum,
                        lon: lonNum,
                    })
                } catch (error) {
                    console.error("Ticketmaster error:", error.message)
                }
            })(),
            (async () => {
                try {
                    kudagoEvents = await fetchEventsByLocationKudaGo({
                        lat: latNum,
                        lon: lonNum,
                    })
                } catch (error) {
                    console.error("kudaGo error:", error.message)
                }
            })(),
        ])

        const events = [...ticketmasterEvents, ...kudagoEvents]

        res.json({ events })
    } catch (error) {
        console.error("Error in /api/events:", error)
        res.status(500).json({ error: "Failed to fetch events" })
    }
})

export default router
