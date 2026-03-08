import { useState } from "react"
import RoutePointInput from "./RoutePointInput"
import destinationSVG from "../assets/destination.svg"
import { useAuth } from "../context/AuthContext";

export default function RouteBuilder({ routePoints, setRoutePoints, setRouteGeometry }) {
    const [isRouteBuilderActive, setIsRouteBuilderActive] = useState(false)
    const { isAuthenticated } = useAuth();

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

    async function handleSave() {
        if (!isAuthenticated) {
            alert("Сначала войдите в профиль");
            return;
        }
    
        if (!routePoints || routePoints.length < 2) {
            alert("Сначала постройте маршрут (минимум 2 точки)");
            return;
        }
    
        const name = prompt("Название маршрута:");
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
            console.log("data.error:", data.error)
            alert(data.error || "Не удалось сохранить маршрут");
            return;
        }
    
        alert("Маршрут сохранён!");
      }

    return (
        <>
            {!isRouteBuilderActive && (<button 
                style={{
                    display: "block",
                    padding: 7
                }}
                className="destinationBtn"
                onClick={() => setIsRouteBuilderActive(true)}
            >
                <img src={destinationSVG} width="25" height="25"></img>
            </button>)}

            {isRouteBuilderActive && (
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

                        <button onClick={addPoint} className="addPointBtn">
                            + Добавить точку
                        </button>
                    </div>

                    <button onClick={buildRoute}>
                        Построить
                    </button>

                    <button onClick={handleSave}>
                        Сохранить маршрут
                    </button>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "flex-end",
                            textAlign: "right"
                        }}
                    >
                        <p
                            style={{
                                display: "inline-block",
                                margin: 0,
                                fontSize: 12,
                                color: "#777",
                                cursor: "pointer"
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#999")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#777")}
                            onClick={() => {
                                setRoutePoints([])
                                setRouteGeometry(null)
                                setIsRouteBuilderActive(false)
                            }}
                        >
                            Сбросить
                        </p>
                    </div>
                </>
            )}
        </>
    )
}