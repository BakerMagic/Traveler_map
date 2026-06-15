import RoutePointInput from "./RoutePointInput"
import { useAuth } from "../context/AuthContext";
import styles from "../styles/RouteBuilder.module.css";
import { DEFAULT_ROUTE_MODE, ROUTE_MODES, getProfileForMode } from "../utils/routeProfiles";
import carSVG from "../assets/car.svg"
import truckSVG from "../assets/truck.svg"
import bikeSVG from "../assets/bike.svg"
import walkSVG from "../assets/walk.svg"

export default function RouteBuilder({
    routePoints,
    setRoutePoints,
    setRouteGeometry,
    setRouteSummary,
    currentRouteId,
    setCurrentRouteId,
    currentRouteName,
    setCurrentRouteName,
    setIsRouteBuilderActive,
    routeMode,
    setRouteMode
}) {
    const { isAuthenticated } = useAuth()

    const addPoint = () => {
        setRoutePoints(prev => [
            ...prev,
            {
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                name: "",
                lat: null,
                lon: null
            }
        ])
    }

    const buildRoute = async () => {
        const points = routePoints.filter(p => p.lat && p.lon)

        if (points.length < 2) {
            alert("Нужно минимум 2 точки")
            return
        }

        const response = await fetch("https://traveler-map.onrender.com/api/routes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                points,
                profile: getProfileForMode(routeMode)
            })
        })

        if (!response.ok) {
            console.error("Route error:", response.status)
            return
        }

        const data = await response.json()
        console.log("route data:", data)

        setRouteGeometry(data.route.coordinates || [])
        setRouteSummary?.({
            distance: data.route.distance,   // метры
            duration: data.route.duration,   // секунды
            transportMode: routeMode
        })
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
    
        const res = await fetch("https://traveler-map.onrender.com/api/routes/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // важно для secure cookie
            body: JSON.stringify({
                name,
                points: routePoints,
                transportMode: routeMode,
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
            `https://traveler-map.onrender.com/api/routes/${currentRouteId}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name: finalName,
                    points: routePoints,
                    transportMode: routeMode,
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
        setRouteSummary?.(null)
        setCurrentRouteId && setCurrentRouteId(null)
        setCurrentRouteName && setCurrentRouteName("")
        setRouteMode?.(DEFAULT_ROUTE_MODE)
    }

    const movePoint = (index, delta) => {
        const newIndex = index + delta
        if (newIndex < 0 || newIndex >= routePoints.length) return
        setRoutePoints((prev) => {
        const next = [...prev]
        const [removed] = next.splice(index, 1)
        next.splice(newIndex, 0, removed)
        return next
        })
    }
    
    const clearOrRemovePoint = (index) => {
        setRoutePoints((prev) => {
        if (prev.length <= 2) {
            return prev.map((p, i) =>
            i === index ? { ...p, name: "", lat: null, lon: null } : p
            )
        }
        return prev.filter((_, i) => i !== index)
        })
    }

    function ModeIcon({ mode }) {
        switch (mode) {
            case "car":
                return (
                    <img className={styles.SVGIcon} src={carSVG}/>
                );
            case "truck":
                return (
                    <img className={styles.SVGIcon} src={truckSVG}/>
                );
            case "bike":
                return (
                    <img className={styles.SVGIcon} src={bikeSVG}/>
                );
            case "walk":
                return (
                    <img className={styles.SVGIcon} src={walkSVG}/>
                );
            default:
                return null;
        }
    }

    return (
        <div className={styles.routeBuilder}>
            <div className={styles.profileToolbarWrap}>
                <span className={styles.profileToolbarLabel}>Как доберётесь</span>
                <div className={styles.profileToolbar} role="group" aria-label="Способ передвижения">
                    {ROUTE_MODES.map(({ key, label }) => (
                        <button
                            type="button"
                            key={key}
                            aria-label={label}
                            aria-pressed={routeMode === key}
                            className={`${styles.profileModeBtn} ${routeMode === key ? styles.profileModeBtnActive : ""}`}
                            onClick={() => setRouteMode(key)}
                        >
                            <span className={styles.profileModeIcon}>
                                <ModeIcon mode={key} />
                            </span>
                        </button>
                    ))}
                </div>
            </div>
            <div className={styles.pointsList}>
                {routePoints.map((point, index) => (
                    <RoutePointInput
                        key={point.id}
                        point={point}
                        index={index}
                        routePoints={routePoints}
                        setRoutePoints={setRoutePoints}
                        totalCount={routePoints.length}
                        onClearOrRemove={() => clearOrRemovePoint(index)}
                        onMoveUp={() => movePoint(index, -1)}
                        onMoveDown={() => movePoint(index, 1)}
                        canMoveUp={index > 0}
                        canMoveDown={index < routePoints.length - 1}
                    />
                ))}
            </div>

            <div className={styles.buildRow}>
                <button type="button" className={styles.buildButton} onClick={buildRoute}>
                    Построить
                </button>
            </div>

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
                <p className={`${styles.textAction} addPointBtn`} onClick={addPoint}>
                    + Добавить точку
                </p>
                <p className={styles.textAction} onClick={() => resetRouteBuilderState()}>
                    Сбросить
                </p>
            </div>
        </div>
    )
}