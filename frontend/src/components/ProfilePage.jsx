import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import styles from "../styles/ProfilePage.module.css";
import carSVG from "../assets/car.svg";
import truckSVG from "../assets/truck.svg";
import bikeSVG from "../assets/bike.svg";
import walkSVG from "../assets/walk.svg";

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

  function getTransportIcon(modeKey) {
    switch (modeKey) {
      case "truck":
        return truckSVG;
      case "bike":
        return bikeSVG;
      case "walk":
        return walkSVG;
      case "car":
      default:
        return carSVG;
    }
  }

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
    <div className={styles.overlay}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Профиль</h2>
        <button
          type="button"
          onClick={onClose}
          className={styles.closeBtn}
        >
          ×
        </button>
      </div>

      <div className={styles.userRow}>
        <div className={styles.avatar}>
          {user.username?.[0]?.toUpperCase() || "P"}
        </div>
        <div>
          <div className={styles.userName}>{user.username}</div>
          <div className={styles.userEmail}>{user.email}</div>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Сохранённые маршруты</h3>

        {loading && <div>Загрузка маршрутов...</div>}
        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && routes.length === 0 && (
          <div>У вас пока нет сохранённых маршрутов</div>
        )}

        {!loading && !error && routes.length > 0 && (
          <div className={styles.routesList}>
            {routes.map((route) => (
              <div
                key={route.id}
                className={styles.routeCard}
              >
                <div className={styles.routeTitle}>
                  <div className={styles.routeName} title={route.name}>{route.name}</div>
                  <div className={styles.routeInfoModeIcon}>
                    <img
                      className={styles.routeInfoModeImg}
                      src={getTransportIcon(route.transport_mode)}
                      alt=""
                    />
                  </div>
                </div>
                <div className={styles.routeDate}>
                  {new Date(route.created_at).toLocaleString()}
                </div>
                <div className={styles.routeActions}>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={() => {
                      onSelectRouteForEdit?.(route.id);
                    }}
                  >
                    Редактировать
                  </button>
                  <button
                    type="button"
                    className={styles.btnSecondary}
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