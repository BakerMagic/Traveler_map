import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ error: "Требуется авторизация" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, username, ... }
    next();
  } catch {
    return res.status(401).json({ error: "Неверный или просроченный токен" });
  }
}