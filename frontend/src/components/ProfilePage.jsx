import { useAuth } from "../context/AuthContext";

export default function ProfilePage({ onClose }) {
  const { user } = useAuth();

  if (!user) return null;

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
        К сожалению "Сохранённые маршруты" пока не доступны
      </div>
    </div>
  );
}