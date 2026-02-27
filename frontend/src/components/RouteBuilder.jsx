import { useState } from "react"
import RoutePointInput from "./RoutePointInput"
import destinationSVG from "../assets/destination.svg"

export default function RouteBuilder({ routePoints, setRoutePoints, setRouteGeometry }) {
    const [isRouteBuilderActive, setIsRouteBuilderActive] = useState(false)

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

        const response = await fetch("http://localhost:4000/api/route", {
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