import RoutePointInput from "./RoutePointInput"
import { useAuth } from "../context/AuthContext";
import styles from "../styles/RouteBuilder.module.css";

export default function RouteBuilder({
    routePoints,
    setRoutePoints,
    setRouteGeometry,
    currentRouteId,
    setCurrentRouteId,
    currentRouteName,
    setCurrentRouteName,
    setIsRouteBuilderActive
}) {
    const { isAuthenticated } = useAuth()

    const addPoint = () => {
        setRoutePoints(prev => [
            ...prev,
            {
                id: Date.now(),
                name: "",
                lat: null,
                lon: null
            }
        ])
    }

    const buildRoute = async () => {
        const points = routePoints.filter(p => p.lat && p.lon)

        if (points.length< 2) {
            alert("Нужно минимум 2 точки")
            return
        }

        const response = await fetch("http://localhost:4000/api/routes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ points, profile: "driving-car" })
        })

        if (!response.ok) {
            console.error("Route error:", response.status)
            return
        }

        const data = await response.json()
        console.log("route data:", data)

        setRouteGeometry(data.route.coordinates || [])
    }

    async function handleSaveAsNew() {
        if (!isAuthenticated) {
            alert("Сначала войдите в профиль");
            return;
        }
    
        if (!routePoints || routePoints.length < 2) {
            alert("Сначала постройте маршрут (минимум 2 точки)");
            return;
        }
    
        const defaultName = currentRouteName
        ? `${currentRouteName} (копия)`
        : "";
        const name = window.prompt("Название нового маршрута:", defaultName);
        if (!name) return;
    
        const res = await fetch("http://localhost:4000/api/routes/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // важно для secure cookie
            body: JSON.stringify({
                name,
                points: routePoints,
            }),
        });
    
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            alert(data.error || "Не удалось сохранить маршрут");
            return;
        }
    
        alert("Новый маршрут сохранён!");

        resetRouteBuilderState()
    }
    
    async function handleUpdateExisting() {
        if (!isAuthenticated) {
            alert("Сначала войдите в профиль");
            return;
        }
      
        if (!currentRouteId) {
            alert("Нет выбранного маршрута для редактирования");
            return;
        }
      
        if (!routePoints || routePoints.length < 2) {
            alert("Сначала постройте маршрут (минимум 2 точки)");
            return;
        }
      
        const confirmUpdate = window.confirm(
            `Сохранить изменения в маршруте "${currentRouteName || "Без имени"}"?`
        );
        if (!confirmUpdate) return;
      
        const nameInput = window.prompt(
            "Название маршрута:",
            currentRouteName || ""
        );
        const finalName = nameInput || currentRouteName || "Без имени";
      
        const res = await fetch(
            `http://localhost:4000/api/routes/${currentRouteId}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name: finalName,
                    points: routePoints,
                }),
            }
        );
      
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            alert(data.error || "Не удалось обновить маршрут");
            return;
        }
      
        setCurrentRouteName(data.route.name || finalName);
        alert("Изменения маршрута сохранены");

        resetRouteBuilderState()
    }

    const resetRouteBuilderState = () => {
        const t = Date.now()
        setRoutePoints([
            { id: `${t}-0`, name: "", lat: null, lon: null },
            { id: `${t}-1`, name: "", lat: null, lon: null },
        ])
        setRouteGeometry(null)
        setCurrentRouteId && setCurrentRouteId(null)
        setCurrentRouteName && setCurrentRouteName("")
    }

    return (
        <>
            <div>
                {routePoints.map((point, index) => (
                    <RoutePointInput
                        key={point.id}
                        point={point}
                        index={index}
                        routePoints={routePoints}
                        setRoutePoints={setRoutePoints}
                    />
                ))}
            </div>

            <button onClick={buildRoute}>
                Построить
            </button>

            <div className={styles.actionsRow}>
                <button
                    type="button"
                    onClick={handleUpdateExisting} 
                    disabled={!currentRouteId}
                >
                    Сохранить изменения
                </button>
                <button
                    type="button"
                    onClick={handleSaveAsNew}
                >
                    Сохранить как новый
                </button>
            </div>

            <div className={styles.footerRow}>
                <p
                    className={`${styles.textAction} addPointBtn`}
                    onClick={addPoint} 
                >
                    + Добавить точку
                </p>
                <p
                    className={styles.textAction}
                    onClick={() => resetRouteBuilderState()}
                >
                    Сбросить
                </p>
            </div>
        </>
    )
}