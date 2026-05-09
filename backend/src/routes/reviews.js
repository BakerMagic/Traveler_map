import express from "express"
import { v4 as uuidv4 } from "uuid"
import { pool } from "../db.js"
import { requireAuth } from "../middleware/authMiddleware.js"

const router = express.Router()

function toNumber(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

router.post("/", requireAuth, async (req, res) => {
  try {
    const { lat, lon, text } = req.body
    const normalizedLat = toNumber(lat)
    const normalizedLon = toNumber(lon)
    const normalizedText = String(text || "").trim()

    if (normalizedLat === null || normalizedLon === null || !normalizedText) {
      return res.status(400).json({ error: "lat, lon и text обязательны" })
    }

    const id = uuidv4()

    const result = await pool.query(
      `INSERT INTO reviews (id, profile_id, lat, lon, text)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, profile_id, lat, lon, text, created_at, updated_at`,
      [id, req.user.id, normalizedLat, normalizedLon, normalizedText]
    )

    return res.status(201).json({ review: result.rows[0] })
  } catch (err) {
    console.error("Error creating review:", err)
    return res.status(500).json({ error: "Ошибка при сохранении отзыва" })
  }
})

router.get("/nearby", async (req, res) => {
  try {
    const lat = toNumber(req.query.lat)
    const lon = toNumber(req.query.lon)
    const radiusMeters = Math.max(1, Math.min(5000, toNumber(req.query.radius) || 100))

    if (lat === null || lon === null) {
      return res.status(400).json({ error: "lat и lon обязательны" })
    }

    // Быстрый бокс-фильтр + расстояние по формуле гаверсинуса.
    const latDelta = radiusMeters / 111320
    const cosLat = Math.max(Math.cos((lat * Math.PI) / 180), 0.000001)
    const lonDelta = radiusMeters / (111320 * cosLat)

    const result = await pool.query(
      `SELECT
          r.id,
          r.profile_id,
          r.lat,
          r.lon,
          r.text,
          r.created_at,
          r.updated_at,
          p.username,
          (
            6371000 * 2 * ASIN(
              SQRT(
                POWER(SIN(RADIANS((r.lat - $1) / 2)), 2) +
                COS(RADIANS($1)) * COS(RADIANS(r.lat)) *
                POWER(SIN(RADIANS((r.lon - $2) / 2)), 2)
              )
            )
          ) AS distance_m
        FROM reviews r
        JOIN profiles p ON p.id = r.profile_id
        WHERE r.lat BETWEEN $1 - $3 AND $1 + $3
          AND r.lon BETWEEN $2 - $4 AND $2 + $4
        ORDER BY distance_m ASC, r.created_at DESC`,
      [lat, lon, latDelta, lonDelta]
    )

    const reviews = result.rows
      .filter((row) => Number(row.distance_m) <= radiusMeters)
      .map((row) => ({
        ...row,
        distance_m: Number(row.distance_m),
      }))

    return res.json({ reviews })
  } catch (err) {
    console.error("Error loading nearby reviews:", err)
    return res.status(500).json({ error: "Ошибка при загрузке отзывов" })
  }
})

router.get("/my", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, profile_id, lat, lon, text, created_at, updated_at
       FROM reviews
       WHERE profile_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    )

    return res.json({ reviews: result.rows })
  } catch (err) {
    console.error("Error loading my reviews:", err)
    return res.status(500).json({ error: "Ошибка при загрузке ваших отзывов" })
  }
})

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const text = String(req.body.text || "").trim()

    if (!text) {
      return res.status(400).json({ error: "Текст отзыва не может быть пустым" })
    }

    const result = await pool.query(
      `UPDATE reviews
       SET text = $1,
           updated_at = NOW()
       WHERE id = $2 AND profile_id = $3
       RETURNING id, profile_id, lat, lon, text, created_at, updated_at`,
      [text, id, req.user.id]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Отзыв не найден" })
    }

    return res.json({ review: result.rows[0] })
  } catch (err) {
    console.error("Error updating review:", err)
    return res.status(500).json({ error: "Ошибка при обновлении отзыва" })
  }
})

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `DELETE FROM reviews
       WHERE id = $1 AND profile_id = $2`,
      [id, req.user.id]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Отзыв не найден" })
    }

    return res.status(204).end()
  } catch (err) {
    console.error("Error deleting review:", err)
    return res.status(500).json({ error: "Ошибка при удалении отзыва" })
  }
})

export default router