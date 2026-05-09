import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import eventsRouter from "./routes/events.js"
import routesRouter from "./routes/routes.js"
import weatherRouter from "./routes/weather.js"
import { testDbConnection } from "./db.js"
import authRouter from "./routes/auth.js"
import cookieParser from "cookie-parser"
import reviewsRouter from "./routes/reviews.js"

testDbConnection().catch((error) => {
    console.error("Failed to connect to DB:", error);
});

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Разрешаем запросы с фронта
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(cookieParser());

app.use(express.json())

app.use("/api/events", eventsRouter)
app.use("/api/routes", routesRouter)
app.use("/api/weather", weatherRouter)
app.use("/api/auth", authRouter)
app.use("/api/reviews", reviewsRouter)

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" })
})

app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`)
})