import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function ProfilePage({ 
  onClose,
  onSelectRouteForEdit,
  onDeleteRoute
}) {
  const { user } = useAuth()
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  if (!user) return null;

  useEffect(() => {
    async function loadRoutes() {
      try {
        const res = await fetch("http://localhost:4000/api/routes/list", {
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || "Не удалось загрузить маршруты");
          return;
        }
        setRoutes(data.routes || []);
      } catch (e) {
        setError("Ошибка сети при загрузке маршрутов");
      } finally {
        setLoading(false);
      }
    }
    if (user) loadRoutes();
  }, [user]);

  return (
    <div
      style={{
        position: "fixed",
        right: 24,
        top: 72,
        width: 320,
        background: "rgba(18,18,18,0.96)",
        color: "white",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 16px 40px rgba(0,0,0,0.7)",
        zIndex: 1800,
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Профиль</h2>
        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "transparent",
            color: "#aaa",
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#1976d2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: 20,
          }}
        >
          {user.username?.[0]?.toUpperCase() || "P"}
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>{user.username}</div>
          <div style={{ fontSize: 14, color: "#aaa" }}>{user.email}</div>
        </div>
      </div>

      <div style={{ fontSize: 14, color: "#ccc" }}>
        <h3>Сохранённые маршруты</h3>

        {loading && <div>Загрузка маршрутов...</div>}
        {error && <div style={{ color: "#f44336" }}>{error}</div>}

        {!loading && !error && routes.length === 0 && (
          <div>У вас пока нет сохранённых маршрутов</div>
        )}

        {!loading && !error && routes.length > 0 && (
          <div style={{ maxHeight: 240, overflowY: "auto", marginTop: 8 }}>
            {routes.map((route) => (
              <div
                key={route.id}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.05)",
                  marginBottom: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div style={{ fontWeight: 500 }}>{route.name}</div>
                <div style={{ fontSize: 12, color: "#999" }}>
                  {new Date(route.created_at).toLocaleString()}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button
                    style={{
                      flex: 1,
                      border: "none",
                      padding: "4px 6px",
                      borderRadius: 999,
                      background: "#1976d2",
                      color: "white",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                    onClick={() => {
                      onSelectRouteForEdit?.(route.id);
                    }}
                  >
                    Редактировать
                  </button>
                  <button
                    style={{
                      border: "none",
                      padding: "4px 6px",
                      borderRadius: 999,
                      background: "#444",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                    onClick={async () => {
                      const confirmDelete = window.confirm(
                        `Удалить маршрут "${route.name}"?`
                      );
                      if (!confirmDelete) return;
                      await onDeleteRoute?.(route.id);
                      // локально убрать из списка
                      setRoutes((prev) => prev.filter((r) => r.id !== route.id));
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}