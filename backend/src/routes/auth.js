import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../db.js";

const router = express.Router();

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function setAuthCookie(res, token) {
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: false,          // локально false, в проде true
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

// Регистрация
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email и password обязательны" });
    }

    const existing = await pool.query(
      "SELECT id FROM profiles WHERE email = $1",
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Пользователь с таким email уже существует" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const result = await pool.query(
      `INSERT INTO profiles (id, username, email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email`,
      [id, username, email, passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    setAuthCookie(res, token);
    res.status(201).json({ user });
  } catch (err) {
    console.error("Error in /api/auth/register:", err);
    res.status(500).json({ error: "Ошибка при регистрации" });
  }
});

// Логин
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email и password обязательны" });
    }

    const result = await pool.query(
      "SELECT id, username, email, password_hash FROM profiles WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const token = generateToken(user);

    setAuthCookie(res, token);

    // не возвращаем password_hash
    delete user.password_hash;

    res.json({ user });
  } catch (err) {
    console.error("Error in /api/auth/login:", err);
    res.status(500).json({ error: "Ошибка при входе" });
  }
});

router.get("/me", (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: "Нет токена" });
  
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      res.json({ user: { id: payload.id, email: payload.email, username: payload.username } });
    } catch {
      return res.status(401).json({ error: "Неверный токен" });
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("auth_token");
    res.status(204).end();
});

export default router;