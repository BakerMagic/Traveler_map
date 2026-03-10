import { useEffect, useRef, useState } from "react"
import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM"
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import Feature from "ol/Feature"
import Point from "ol/geom/Point"
import { Style, Icon, Stroke, Fill } from "ol/style"
import { fromLonLat, toLonLat } from "ol/proj"
import "ol/ol.css"
import { getZoomByLocation } from '../utils/zoomMap'
import { LineString } from "ol/geom"
import GeoJSON from "ol/format/GeoJSON"
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import ProfilePage from "./ProfilePage"

export default function MapComponent({
    setWeather,
    setForecast,
    location,
    setLocation,
    routePoints,
    routeGeometry,
    currentRouteId,
    setCurrentRouteId,
    setRoutePoints,
    setRouteGeometry,
    setCurrentRouteName
}) {
    const mapRef = useRef()
    const vectorSourceRef = useRef(new VectorSource())
    const { user, isAuthenticated, logout } = useAuth()
    const [authOpen, setAuthOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)

    function generateNumberedMarkerSVG(number) {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="90">
                <circle cx="20" cy="20" r="15" fill="#ff5722"/>
                <path d="M 10 31 Q 18 37 20 45 Q 22 37 30 31" fill="#ff5722"/>
                <circle cx="20" cy="20" r="7" fill="white"/>              
                <text x="20" y="25" text-anchor="middle" font-size="12" fill="black">${number}</text>
            </svg>
        `
    
        return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)
    }
    
    function setDefaultMarkerSVG(lat, lon) {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="90">
                <circle cx="20" cy="20" r="15" fill="red"/>
                <path d="M 10 31 Q 18 37 20 45 Q 22 37 30 31" fill="red"/>
                <circle cx="20" cy="20" r="6" fill="white"/>              
            </svg>
        `
    
        const marker = new Feature({
            geometry: new Point(fromLonLat([lon, lat]))
        })
    
        marker.set("type", "searchMarker")
    
        marker.setStyle(
            new Style({
                image: new Icon({
                    src: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg),
                    scale: 1
                })
            })
        )
    
        return marker
    }
    
    async function getWeather(lat, lon, setWeather, setForecast) {
        try {
            const [currentResponse, forecastResponse] = await Promise.all([
                fetch(`http://localhost:4000/api/weather/current?lat=${lat}&lon=${lon}`),
                fetch(`http://localhost:4000/api/weather/forecast?lat=${lat}&lon=${lon}`)
            ])
    
            if (currentResponse.ok) {
                const { weather } = await currentResponse.json()
                setWeather(weather)
            } else {
                console.error("Current weather error", currentResponse.status)
            }
    
            if (forecastResponse.ok) {
                const { forecast } = await forecastResponse.json()
                setForecast(forecast)
            } else {
                console.error("Forecast error", forecastResponse.status)
            }
        } catch (error) {
            console.error("Weather fetch error", error)
        }
    }
    
    async function loadRouteAndShowOnMap(routeId) {
        try {
            const res = await fetch(`http://localhost:4000/api/routes/${routeId}`, {
                credentials: "include",
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.route) {
                alert(data.error || "Не удалось загрузить маршрут");
                return;
            }
        
            const route = data.route;
        
            setRoutePoints(route.points || []);
            setCurrentRouteId(route.id);
            setCurrentRouteName(route.name || "");
        
            // Строим путь по этим точкам
            const buildRes = await fetch("http://localhost:4000/api/routes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                points: route.points,
                profile: "driving-car",
                }),
            });
        
            const buildData = await buildRes.json().catch(() => ({}));
            if (!buildRes.ok || !buildData.route) {
                console.error("Route build error:", buildRes.status, buildData.error);
                alert(buildData.error || "Не удалось построить маршрут");
                return;
            }
        
            setRouteGeometry(buildData.route.coordinates || []);
        } catch (e) {
            console.error("loadRouteAndShowOnMap error", e);
            alert("Ошибка при загрузке маршрута");
        }
      }
      
    async function deleteRouteById(routeId) {
        const res = await fetch(`http://localhost:4000/api/routes/${routeId}`, {
            method: "DELETE",
            credentials: "include",
        });
        if (!res.ok && res.status !== 204) {
            const data = await res.json().catch(() => ({}));
            alert(data.error || "Не удалось удалить маршрут");
            return;
        }
      
        // Если удаляем текущий редактируемый маршрут, то сбрасываем состояние
        if (currentRouteId === routeId) {
            setCurrentRouteId(null);
            setCurrentRouteName("");
            setRoutePoints([]);
            setRouteGeometry(null);
        }
    }

    useEffect(() => { // Карта и погода
        console.log("1")
        const vectorLayer = new VectorLayer({
            source: vectorSourceRef.current
        })

        const map = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM()
                }),
                vectorLayer
            ],
            view: new View({
                center: [0, 0],
                zoom: 2
            })
        })

        mapRef.current = map

        map.on("click", async (event) => { // Обработчик клика на карте
            const features = vectorSourceRef.current.getFeatures()

            // Приверка клика по маркеру маршрута
            const featureAtPixel = map.forEachFeatureAtPixel(event.pixel, (f) => f)
            const routePointData = featureAtPixel && featureAtPixel.get("routePoint")
            
            if (routePointData) {
                const { lat, lon, index } = routePointData

                setLocation({
                    lat,
                    lon,
                    type: "routePoint"
                })

                getWeather(lat, lon, setWeather, setForecast)

                features
                    .filter(f => f.get("routePoint"))
                    .forEach(f => {
                        const routePoint = f.get("routePoint")
                        const isSelected = routePoint.index === index

                        f.setStyle(
                            new Style({
                                image: new Icon({
                                    src: generateNumberedMarkerSVG(routePoint.index + 1),
                                    scale: isSelected ? 1.5 : 1
                                })
                            })
                        )
                    })

                return
            }

            features
                .filter(f => f.get("routePoint"))
                .forEach(f => {
                    const rp = f.get("routePoint")
                    f.setStyle(
                        new Style({
                            image: new Icon({
                                src: generateNumberedMarkerSVG(rp.index + 1),
                                scale: 1,
                            }),
                        })
                    )
                })

            const coordinates = event.coordinate
            const lonlat = toLonLat(coordinates)

            // Очистка старого маркера
            features
                .filter(f => f.get("isSearchPolygon") || f.get("type") === "searchMarker")
                .forEach(f => vectorSourceRef.current.removeFeature(f))

            const marker = setDefaultMarkerSVG(lonlat[1], lonlat[0])

            vectorSourceRef.current.addFeature(marker)

            // Запрос к OpenWeather
            getWeather(lonlat[1], lonlat[0], setWeather, setForecast)
        })

        return () => map.setTarget(null)
    }, [setWeather])

    useEffect(() => { // Поиск
        if (!location || !mapRef.current || location.type === "routePoint") return

        const features = vectorSourceRef.current.getFeatures()
        features
            .filter(f => f.get("isSearchPolygon") || f.get("type") === "searchMarker")
            .forEach(f => vectorSourceRef.current.removeFeature(f))
        
        // features
        //     .filter(f => )
        //     .forEach(f => vectorSourceRef.current.removeFeature(f))
        
        if (location.polygon) {
            const format = new GeoJSON()
    
            const feature = format.readFeature(
                {
                    type: "Feature",
                    geometry: location.polygon,
                    properties: {}
                },
                {
                    dataProjection: "EPSG:4326",
                    featureProjection: "EPSG:3857"
                }
            )
    
            feature.set("isSearchPolygon", true)
    
            feature.setStyle(
                new Style({
                    stroke: new Stroke({
                        color: "rgba(25, 118, 210, 0.9)",
                        width: 2,
                    }),
                    fill: new Fill({
                        color: "rgba(25, 118, 210, 0.15)"
                    })
                })
            )
    
            vectorSourceRef.current.addFeature(feature)
        }

        const marker = setDefaultMarkerSVG(location.lat, location.lon)

        vectorSourceRef.current.addFeature(marker)

        const coords = fromLonLat([location.lon, location.lat])
        const zoom = getZoomByLocation(location)

        mapRef.current.getView().animate({
            center: coords,
            zoom: zoom,
            duration: 1000
        })
    }, [location])

    useEffect(() => { // Построение маршрута (точки)
        if (!mapRef) return

        // Очищаем всё для удобного построения маршрута
        vectorSourceRef.current.clear()

        routePoints.forEach((point, index) => {
            if (!point.lat || !point.lon) return

            const marker = new Feature({
                geometry: new Point(fromLonLat([point.lon, point.lat]))
            })

            marker.set("routePoint", {
                lat: point.lat,
                lon: point.lon,
                index
            })

            marker.setStyle(
                new Style({
                    image: new Icon({
                        src: generateNumberedMarkerSVG(index + 1),
                        scale: 1
                    })
                })
            )

            vectorSourceRef.current.addFeature(marker)
        })
    }, [routePoints])

    useEffect(() => { // Построение маршрута (путь)
        if (!mapRef.current || !routeGeometry || routeGeometry.length === 0) return

        // удаление старых линий маршрута
        const features = vectorSourceRef.current.getFeatures()
        features
            .filter(f => f.get("isRoute"))
            .forEach(f => vectorSourceRef.current.removeFeature(f))

        const projected = routeGeometry.map(p => fromLonLat([p.lon, p.lat]))
        const line = new LineString(projected)

        const routeFeature = new Feature({ geometry: line })
        routeFeature.set("isRoute", true)

        routeFeature.setStyle(
            new Style({
                stroke: new Stroke({
                    color: "#1976d2",
                    width: 4
                })
            })
        )

        vectorSourceRef.current.addFeature(routeFeature)
    }, [routeGeometry])

    return (
        <div style={{ position: "relative", height: "100vh", width: "100%" }}>
            <div
                ref={mapRef}
                style={{ height: "100%", width: "100%" }}
            />

            {/* Кнопка профиля */}
            <div
                style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    zIndex: 1500,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                }}
            >
                {isAuthenticated ? (
                    <>
                    <button
                        onClick={() => setProfileOpen(true)}
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            border: "none",
                            background: "#1976d2",
                            color: "white",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        {user.username?.[0]?.toUpperCase() || "P"}
                    </button>
                    <button
                        onClick={logout}
                        style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            border: "none",
                            background: "#333",
                            color: "white",
                            cursor: "pointer",
                            fontSize: 12,
                        }}
                    >
                        Выйти
                    </button>
                    </>
                ) : (
                    <button
                        onClick={() => setAuthOpen(true)}
                        style={{
                            padding: "6px 12px",
                            borderRadius: 999,
                            border: "none",
                            background: "rgba(0,0,0,0.6)",
                            color: "white",
                            cursor: "pointer",
                            backdropFilter: "blur(6px)",
                        }}
                    >
                    Войти
                    </button>
                )}
            </div>

            <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
            {profileOpen && (
            <ProfilePage
                onClose={() => setProfileOpen(false)}
                onSelectRouteForEdit={loadRouteAndShowOnMap}
                onDeleteRoute={deleteRouteById}
            />
            )}
        </div>
    )
}