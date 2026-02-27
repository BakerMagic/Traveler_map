import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import eventsRouter from "./routes/events.js"
import routeRouter from "./routes/route.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Разрешаем запросы с фронта
app.use(cors({
    origin: "http://localhost:5173"
}))

app.use(express.json())

app.use("/api/events", eventsRouter)
app.use("/api/route", routeRouter)

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" })
})

app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`)
})