import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ open, onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const isLogin = mode === "login";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 360,
          background: "#1e1e1e",
          color: "white",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", marginBottom: 16 }}>
          <button
            onClick={() => setMode("login")}
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: isLogin ? "#1976d2" : "#333",
              color: "white",
            }}
          >
            Вход
          </button>
          <button
            onClick={() => setMode("register")}
            style={{
              flex: 1,
              marginLeft: 8,
              padding: 8,
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: !isLogin ? "#1976d2" : "#333",
              color: "white",
            }}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {!isLogin && (
            <input
              placeholder="Имя пользователя"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              style={{ padding: 8, borderRadius: 6, border: "1px solid #555", background: "#111", color: "white" }}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #555", background: "#111", color: "white" }}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #555", background: "#111", color: "white" }}
          />

          {error && <div style={{ color: "#ff5252", fontSize: 14 }}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              padding: 10,
              borderRadius: 8,
              border: "none",
              background: "#1976d2",
              color: "white",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            {loading ? "Загрузка..." : isLogin ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>
      </div>
    </div>
  );
}