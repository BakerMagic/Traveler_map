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
  const [reviews, setReviews] = useState([])
  const [activeTab, setActiveTab] = useState("routes")
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
    async function loadProfileData() {
      try {
        const [routesRes, reviewsRes] = await Promise.all([
          fetch("https://traveler-map.onrender.com/api/routes/list", { credentials: "include" }),
          fetch("https://traveler-map.onrender.com/api/reviews/my", { credentials: "include" }),
        ])

        const routesData = await routesRes.json().catch(() => ({}))
        const reviewsData = await reviewsRes.json().catch(() => ({}))

        if (!routesRes.ok) {
          setError(routesData.error || "Не удалось загрузить маршруты");
          return;
        }

        if (!reviewsRes.ok) {
          setError(reviewsData.error || "Не удалось загрузить отзывы");
          return;
        }

        setRoutes(routesData.routes || []);
        setReviews(reviewsData.reviews || []);
      } catch (e) {
        setError("Ошибка сети при загрузке данных профиля");
      } finally {
        setLoading(false);
      }
    }

    if (user) loadProfileData();
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
        <div className={styles.tabsRow}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "routes" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("routes")}
          >
            Маршруты
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "reviews" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            Отзывы
          </button>
        </div>

        {loading && <div>Загрузка...</div>}
        {error && <div className={styles.error}>{error}</div>}

        {activeTab === "routes" && (
          <>
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
          </>
        )}

        {activeTab === "reviews" && (
          <>
            {!loading && !error && reviews.length === 0 && (
              <div>У вас пока нет сохранённых отзывов</div>
            )}

            {!loading && !error && reviews.length > 0 && (
              <div className={styles.routesList}>
                {reviews.map((review) => (
                  <div key={review.id} className={styles.routeCard}>
                    <div className={styles.routeTitle}>
                      <div className={styles.routeName}>Отзыв</div>
                    </div>
                    <div className={styles.routeDate}>
                      {new Date(review.created_at).toLocaleString()} • {Number(review.lat).toFixed(5)}, {Number(review.lon).toFixed(5)}
                    </div>
                    <div className={styles.reviewText}>{review.text}</div>
                    <div className={styles.routeActions}>
                      <button
                        type="button"
                        className={styles.btnPrimary}
                        onClick={async () => {
                          const nextText = window.prompt("Измените текст отзыва:", review.text)
                          if (nextText === null) return
                          if (!nextText.trim()) {
                            alert("Текст отзыва не может быть пустым")
                            return
                          }

                          const res = await fetch(`https://traveler-map.onrender.com/api/reviews/${review.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ text: nextText.trim() }),
                          })
                          const data = await res.json().catch(() => ({}))
                          if (!res.ok) {
                            alert(data.error || "Не удалось обновить отзыв")
                            return
                          }

                          setReviews((prev) => prev.map((r) => (
                            r.id === review.id ? data.review : r
                          )))
                        }}
                      >
                        Редактировать
                      </button>
                      <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={async () => {
                          const confirmDelete = window.confirm("Удалить отзыв?")
                          if (!confirmDelete) return

                          const res = await fetch(`https://traveler-map.onrender.com/api/reviews/${review.id}`, {
                            method: "DELETE",
                            credentials: "include",
                          })
                          if (!res.ok && res.status !== 204) {
                            const data = await res.json().catch(() => ({}))
                            alert(data.error || "Не удалось удалить отзыв")
                            return
                          }

                          setReviews((prev) => prev.filter((r) => r.id !== review.id))
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}