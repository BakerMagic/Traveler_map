import express from "express"
import { fetchRouteByPoints } from "../services/openRouteService.js"
import { pool } from "../db.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { v4 as uuidv4 } from "uuid";

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

router.post("/save", requireAuth, async (req, res) => {
    try {
        const { name, points } = req.body;

        if (!name || !points || !Array.isArray(points) || points.length < 2) {
            return res.status(400).json({ error: "Нужно имя и минимум 2 точки" });
        }

        const id = uuidv4();
        await pool.query(
            `INSERT INTO routes (id, profile_id, name, points)
            VALUES ($1, $2, $3, $4)`,
            [id, req.user.id, name, JSON.stringify(points)]
        );

        res.status(201).json({ id, name });
    } catch (err) {
        console.error("Error saving route:", err);
        res.status(500).json({ error: "Ошибка при сохранении маршрута" });
    }
});

router.get("/list", requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, created_at
            FROM routes
            WHERE profile_id = $1
            ORDER BY created_at DESC`,
            [req.user.id]
        );
        res.json({ routes: result.rows });
    } catch (err) {
        console.error("Error loading routes:", err);
        res.status(500).json({ error: "Ошибка при загрузке маршрутов" });
    }
});

router.get("/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
    
        const result = await pool.query(
            `SELECT id, name, points, created_at
            FROM routes
            WHERE id = $1 AND profile_id = $2`,
            [id, req.user.id]
        );
    
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Маршрут не найден" });
        }
    
        res.json({ route: result.rows[0] });
    } catch (err) {
        console.error("Error loading route:", err);
        res.status(500).json({ error: "Ошибка при загрузке маршрута" });
    }
});

router.put("/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, points } = req.body;
    
        if (!points || !Array.isArray(points) || points.length < 2) {
            return res.status(400).json({ error: "Нужно минимум 2 точки" });
        }
    
        const result = await pool.query(
            `UPDATE routes
            SET name = COALESCE($1, name),
                points = $2
            WHERE id = $3 AND profile_id = $4
            RETURNING id, name, created_at`,
            [name || null, JSON.stringify(points), id, req.user.id]
        );
    
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Маршрут не найден" });
        }
    
        res.json({ route: result.rows[0] });
    } catch (err) {
        console.error("Error updating route:", err);
        res.status(500).json({ error: "Ошибка при обновлении маршрута" });
    }
});

router.delete("/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM routes
            WHERE id = $1 AND profile_id = $2`,
            [id, req.user.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Маршрут не найден" });
        }

        res.status(204).end();
    } catch (err) {
        console.error("Error deleting route:", err);
        res.status(500).json({ error: "Ошибка при удалении маршрута" });
    }
});

export default router