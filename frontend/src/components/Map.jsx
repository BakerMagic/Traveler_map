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
import { useAuth } from "../context/AuthContext"
import AuthModal from "./AuthModal"
import ProfilePage from "./ProfilePage"
import styles from "../styles/Map.module.css"
import { getProfileForMode } from "../utils/routeProfiles"
import carSVG from "../assets/car.svg"
import truckSVG from "../assets/truck.svg"
import bikeSVG from "../assets/bike.svg"
import walkSVG from "../assets/walk.svg"

export default function MapComponent({
    setWeather,
    setForecast,
    location,
    setLocation,
    routePoints,
    routeGeometry,
    routeSummary,
    setRouteSummary,
    currentRouteId,
    setCurrentRouteId,
    setRoutePoints,
    setRouteGeometry,
    setCurrentRouteName,
    setRouteMode,
    selectedEvent
}) {
    const mapRef = useRef()
    const vectorSourceRef = useRef(new VectorSource())
    const { user, isAuthenticated, logout } = useAuth()
    const [authOpen, setAuthOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const [routeDialogPos, setRouteDialogPos] = useState(null)
    const [activeEvent, setActiveEvent] = useState(null)
    const [eventDialogPos, setEventDialogPos] = useState(null)
    const [reviewDraft, setReviewDraft] = useState("")
    const [nearbyReviews, setNearbyReviews] = useState([])
    const [reviewsLoading, setReviewsLoading] = useState(false)
    const [activeReview, setActiveReview] = useState(null)
    const [isReviewPanelOpen, setIsReviewPanelOpen] = useState(false)

    const LARGE_PLACE_TYPES = new Set([
        "country",
        "state",
        "region",
        "county",
        "city",
        "town",
        "village",
        "hamlet",
        "suburb",
        "district",
        "road",
        "street",
        "residential",
        "highway",
    ]);
      
    function getLocationKind(location) {
        return location?.addresstype || location?.type || location?.class || "";
    }
      
    function shouldFitByPolygon(location) {
        if (!location?.polygon) return false;
        return LARGE_PLACE_TYPES.has(getLocationKind(location));
    }

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

    function createEventMarkerFeature(eventItem) {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="42" height="92">
                <circle cx="21" cy="21" r="15" fill="#A855F7"/>
                <path d="M 11 32 Q 19 38 21 46 Q 23 38 31 32" fill="#A855F7"/>
                <circle cx="21" cy="21" r="6" fill="white"/>
            </svg>
        `

        const feature = new Feature({
            geometry: new Point(fromLonLat([eventItem.lon, eventItem.lat])),
        })

        feature.set("type", "eventMarker")
        feature.set("eventData", eventItem)
        feature.setStyle(new Style({
            image: new Icon({
                src: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg),
                scale: 1,
            }),
        }))

        return feature
    }

    function createReviewMarkerFeature(review) {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="66">
                <circle cx="15" cy="15" r="10" fill="#2B6CB0"/>
                <path d="M 7 22 Q 13 28 15 34 Q 17 28 23 22" fill="#2B6CB0"/>
                <circle cx="15" cy="15" r="4" fill="white"/>
            </svg>
        `

        const feature = new Feature({
            geometry: new Point(fromLonLat([Number(review.lon), Number(review.lat)])),
        })

        feature.set("type", "reviewMarker")
        feature.set("reviewData", review)
        feature.setStyle(new Style({
            image: new Icon({
                src: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg),
                scale: 1,
            }),
        }))

        return feature
    }

    async function loadNearbyReviews(lat, lon, radius = 100) {
        if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) return

        setReviewsLoading(true)
        try {
            const res = await fetch(
                `http://localhost:4000/api/reviews/nearby?lat=${lat}&lon=${lon}&radius=${radius}`,
                { credentials: "include" }
            )
            const data = await res.json().catch(() => ({}))

            if (!res.ok) {
                console.error("Nearby reviews error:", data.error || res.status)
                setNearbyReviews([])
                return
            }

            setNearbyReviews(data.reviews || [])
        } catch (error) {
            console.error("Nearby reviews fetch error:", error)
            setNearbyReviews([])
        } finally {
            setReviewsLoading(false)
        }
    }

    async function handleSaveReviewAtMarker() {
        const lat = Number(location?.lat)
        const lon = Number(location?.lon)
        const text = reviewDraft.trim()

        if (!isAuthenticated) {
            alert("Чтобы сохранить отзыв, войдите в аккаунт")
            return
        }

        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
            alert("Сначала поставьте метку на карте")
            return
        }

        if (!text) {
            alert("Введите текст отзыва")
            return
        }

        const res = await fetch("http://localhost:4000/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ lat, lon, text }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
            alert(data.error || "Не удалось сохранить отзыв")
            return
        }

        setReviewDraft("")
        await loadNearbyReviews(lat, lon)
    }

    function formatReviewDistance(distanceMeters) {
        const d = Number(distanceMeters) || 0
        if (d < 1000) return `${Math.round(d)} м`
        return `${(d / 1000).toFixed(1)} км`
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
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok || !data.route) {
                alert(data.error || "Не удалось загрузить маршрут")
                return
            }
        
            const route = data.route

            const transportMode = route.transport_mode || "car"
            setRouteMode?.(transportMode)
        
            setRoutePoints(route.points || [])
            setCurrentRouteId(route.id)
            setCurrentRouteName(route.name || "")
        
            // Строим путь по этим точкам
            const buildRes = await fetch("http://localhost:4000/api/routes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                points: route.points,
                profile: getProfileForMode(transportMode)
                }),
            })
        
            const buildData = await buildRes.json().catch(() => ({}))
            if (!buildRes.ok || !buildData.route) {
                console.error("Route build error:", buildRes.status, buildData.error)
                alert(buildData.error || "Не удалось построить маршрут")
                return
            }
        
            setRouteGeometry(buildData.route.coordinates || [])
            setRouteSummary?.({
                distance: buildData.route.distance,
                duration: buildData.route.duration,
                transportMode,
            })
        } catch (e) {
            console.error("loadRouteAndShowOnMap error", e)
            alert("Ошибка при загрузке маршрута")
        }
    }
      
    async function deleteRouteById(routeId) {
        const res = await fetch(`http://localhost:4000/api/routes/${routeId}`, {
            method: "DELETE",
            credentials: "include",
        })
        if (!res.ok && res.status !== 204) {
            const data = await res.json().catch(() => ({}))
            alert(data.error || "Не удалось удалить маршрут")
            return
        }
      
        // Если удаляем текущий редактируемый маршрут, то сбрасываем состояние
        if (currentRouteId === routeId) {
            setCurrentRouteId(null)
            setCurrentRouteName("")
            setRoutePoints([])
            setRouteGeometry(null)
        }
    }

    function formatDistance(distanceMeters) {
        const d = Number(distanceMeters) || 0

        if (d < 1000) return `${Math.round(d)} м`

        return `${(d / 1000).toFixed(1)} км`
    }
      
    function formatDuration(durationSeconds) {
        const s = Number(durationSeconds) || 0
        const totalMinutes = Math.round(s / 60)
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60

        if (hours > 0) return `${hours} ч ${minutes} мин`

        return `${minutes} мин`
    }

    function getTransportIcon(modeKey) {
        switch (modeKey) {
            case "truck":
                return truckSVG
            case "bike":
                return bikeSVG
            case "walk":
                return walkSVG
            case "car":
            default:
                return carSVG
        }
    }

    useEffect(() => { // Карта и погода
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

            const featureAtPixel = map.forEachFeatureAtPixel(event.pixel, (f) => f)

            if (featureAtPixel?.get("type") === "eventMarker") {
                const eventData = featureAtPixel.get("eventData")
                
                setActiveEvent(eventData)

                return
            }

            if (featureAtPixel?.get("type") === "reviewMarker") {
                const reviewData = featureAtPixel.get("reviewData")
                setActiveReview(reviewData)
                return
            }

            // Проверка клика по пользовательскому маркеру
            if (featureAtPixel?.get("type") === "searchMarker") {
                vectorSourceRef.current.removeFeature(featureAtPixel)

                setLocation(null)
                setWeather(null)
                setForecast(null)
                setNearbyReviews([])
                setActiveReview(null)
                setReviewDraft("")
                setIsReviewPanelOpen(false)

                return
            }
            
            // Приверка клика по маркеру маршрута
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

            setLocation({
                lat: lonlat[1],
                lon: lonlat[0],
                type: "searchMarker",
                source: "userClick"
            })

            // Запрос к OpenWeather
            getWeather(lonlat[1], lonlat[0], setWeather, setForecast)
            loadNearbyReviews(lonlat[1], lonlat[0])
            setActiveReview(null)
        })

        return () => map.setTarget(null)
    }, [setWeather])

    useEffect(() => { // Поиск
        if (!location || !mapRef.current || location.type === "routePoint") return

        const features = vectorSourceRef.current.getFeatures()
        features
            .filter(f => f.get("isSearchPolygon") || f.get("type") === "searchMarker")
            .forEach(f => vectorSourceRef.current.removeFeature(f))
        
        let feature = null
        
        if (location.polygon) {
            const format = new GeoJSON()
    
            feature = format.readFeature(
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

        const view = mapRef.current.getView()

        if (location.source === "userClick") {
            return
        }

        if (feature && shouldFitByPolygon(location)) {
            const geom = feature.getGeometry?.()

            if (geom) {
                view.fit(geom, {
                    duration: 900,
                    padding: [40, 40, 40, 40],
                    maxZoom: 15
                })

                return
            }
        }

        const coords = fromLonLat([location.lon, location.lat])
        const zoom = getZoomByLocation(location)

        view.animate({
            center: coords,
            zoom,
            duration: 1000
        })

    }, [location])

    useEffect(() => { // Маркеры-отзывы
        if (!mapRef.current) return

        const features = vectorSourceRef.current.getFeatures()
        features
            .filter((f) => f.get("type") === "reviewMarker")
            .forEach((f) => vectorSourceRef.current.removeFeature(f))

        nearbyReviews.forEach((review) => {
            const marker = createReviewMarkerFeature(review)
            vectorSourceRef.current.addFeature(marker)
        })
    }, [nearbyReviews])

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


    // ???????
//     nearbyReviews.forEach((review) => {
//         const marker = createReviewMarkerFeature(review)
//         vectorSourceRef.current.addFeature(marker)
//     })
// }, [routePoints, nearbyReviews])

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

    useEffect(() => { // Диалоговое окно с расстоянием и временем маршрута
        if (!mapRef.current || !routeGeometry || routeGeometry.length === 0 || !routeSummary ) {
            setRouteDialogPos(null)
            return
        }

        let rafId = null
      
        const update = () => {
            if (!mapRef.current) return

            if (!routeGeometry?.length) return

            if (!routeSummary) return

            const mid = routeGeometry[Math.floor(routeGeometry.length / 2)]
            if (!mid?.lon || !mid?.lat) {
                setRouteDialogPos(null)
                return
            }

            const pointCoords = (routePoints || []).filter((p) => p.lat && p.lon)
            if (!pointCoords.length) {
                setRouteDialogPos({ x: mapRef.current.getPixelFromCoordinate(fromLonLat([mid.lon, mid.lat]))[0], y: mapRef.current.getPixelFromCoordinate(fromLonLat([mid.lon, mid.lat]))[1] - 40 })
                return
            }

            const midPx = mapRef.current.getPixelFromCoordinate(fromLonLat([mid.lon, mid.lat]))
            if (!midPx) {
                setRouteDialogPos(null)
                return
            }

            const pointPixels = pointCoords.map((p) => {
                const coords = fromLonLat([p.lon, p.lat])
                return mapRef.current.getPixelFromCoordinate(coords)
            })

            const baseX = midPx[0]
            const baseY = midPx[1]
            const radius = 38
            const step = 28
            const collidesAt = (x, y) => {
                return pointPixels.some(([px, py]) => {
                    if (typeof px !== "number" || typeof py !== "number") return false
                    return Math.hypot(px - x, py - y) < radius
                })
            }

            const offsetsUp = [-40, -40 - step, -40 - 2 * step, -40 - 3 * step]
            const offsetsDown = [40, 40 + step, 40 + 2 * step, 40 + 3 * step]
            const candidates = [
                ...offsetsUp.map((dy) => ({ x: baseX, y: baseY + dy })),
                ...offsetsDown.map((dy) => ({ x: baseX, y: baseY + dy })),
            ]
            const best = candidates.find((c) => !collidesAt(c.x, c.y)) || candidates[0]

            setRouteDialogPos(best)
        }

        const handler = () => {
            if (rafId) cancelAnimationFrame(rafId)
            rafId = requestAnimationFrame(update)
        }
        
        mapRef.current.on("postrender", handler)
        
        update()
        return () => {
            if (mapRef.current) {
                mapRef.current.un("postrender", handler)
            }
            if (rafId) cancelAnimationFrame(rafId)
        }
    }, [routeGeometry, routePoints, routeSummary])

    useEffect(() => { // Мероприятия
        if (!mapRef.current) return

        console.log(selectedEvent)
        
        const features = vectorSourceRef.current.getFeatures();

        features
            .filter((f) => f.get("type") === "eventMarker")
            .forEach((f) => vectorSourceRef.current.removeFeature(f))

        if (!selectedEvent) return

        const marker = createEventMarkerFeature(selectedEvent)
        vectorSourceRef.current.addFeature(marker)

        mapRef.current.getView().animate({
            center: fromLonLat([selectedEvent.lon, selectedEvent.lat]),
            duration: 600
        })

        setActiveEvent(selectedEvent)
    }, [selectedEvent])

    useEffect(() => { // Позиционирование диалога мероприятия
        if (!mapRef.current || !activeEvent) {
            setEventDialogPos(null)
            return
        }
    
        let rafId = null
    
        const update = () => {
            if (!mapRef.current || !activeEvent) return
    
            const map = mapRef.current
            const size = map.getSize()
            if (!size) return
    
            const [mapWidth, mapHeight] = size
            const px = map.getPixelFromCoordinate(
                fromLonLat([activeEvent.lon, activeEvent.lat])
            )
            if (!px) {
                setEventDialogPos(null)
                return
            }
    
            const markerX = px[0]
            const markerY = px[1]
    
            // примерные размеры диалога (можно подправить под реальный CSS)
            const dialogW = 260
            const dialogH = 135
            const pad = 12
    
            // сначала пробуем над маркером
            let x = markerX
            let y = markerY - 46
            let placement = "top"
    
            // если сверху не помещается — ставим под маркер
            if (y - dialogH < pad) {
                y = markerY + 54
                placement = "bottom"
            }
    
            // clamp по горизонтали (чтобы не выходил за карту)
            const half = dialogW / 2
            if (x < half + pad) x = half + pad
            if (x > mapWidth - half - pad) x = mapWidth - half - pad
    
            // clamp по вертикали
            if (placement === "top") {
                if (y < dialogH + pad) y = dialogH + pad
                if (y > mapHeight - pad) y = mapHeight - pad
            } else {
                if (y < pad) y = pad
                if (y > mapHeight - dialogH - pad) y = mapHeight - dialogH - pad
            }
    
            setEventDialogPos({ x, y, placement })
        }
    
        const onRender = () => {
            if (rafId) cancelAnimationFrame(rafId)
            rafId = requestAnimationFrame(update)
        }
    
        mapRef.current.on("postrender", onRender)
        update()
    
        return () => {
            if (mapRef.current) {
                mapRef.current.un("postrender", onRender)
            }
            if (rafId) cancelAnimationFrame(rafId)
        }
    }, [activeEvent])

    return (
        <div className={styles.root}>
            <div
                ref={mapRef}
                className={styles.mapCanvas}
            />

            {/* Итоговая информация о маршруте */}
            {routeSummary && routeDialogPos && (
                <div
                    className={styles.routeInfoDialog}
                    style={{ left: routeDialogPos.x, top: routeDialogPos.y }}
                >
                    <div className={styles.routeInfoModeIcon}>
                        <img
                            className={styles.routeInfoModeImg}
                            src={getTransportIcon(routeSummary.transportMode)}
                            alt=""
                        />
                    </div>

                    <div className={styles.routeInfoTitle}>Маршрут</div>
                    <div className={styles.routeInfoRow}>
                        <span className={styles.routeInfoLabel}>Расстояние</span>
                        <span className={styles.routeInfoValue}>
                            {formatDistance(routeSummary.distance)}
                        </span>
                    </div>
                    <div className={styles.routeInfoRow}>
                        <span className={styles.routeInfoLabel}>Время</span>
                        <span className={styles.routeInfoValue}>
                            {formatDuration(routeSummary.duration)}
                        </span>
                    </div>
                </div>
            )}

            {/* Информация о событии */}
            {activeEvent && eventDialogPos && (
                <div
                    className={`${styles.eventDialog} ${
                        eventDialogPos?.placement === "bottom" ? styles.eventDialogBottom : styles.eventDialogTop
                    }`}
                    style={{ left: eventDialogPos.x, top: eventDialogPos.y }}
                >
                    <button className={styles.eventDialogClose} onClick={() => setActiveEvent(null)}>×</button>
                    <div className={styles.eventDialogTitle}>
                        {activeEvent.name}
                    </div>
                    <div className={styles.eventDialogMeta}>
                        {activeEvent.date} {activeEvent.time ? `в ${activeEvent.time}` : ""}
                    </div>
                    <div className={styles.eventDialogVenue}>
                        {activeEvent.venueName && `${activeEvent.venueName}, `}
                        {activeEvent.address}
                        {activeEvent.city && `, ${activeEvent.city}`}
                    </div>
                    {activeEvent.url && (
                        <a
                            href={activeEvent.url}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.eventDialogLink}
                        >
                            Сайт события
                        </a>
                    )}
                </div>
            )}

            {/* Активный отзыв */}
            {activeReview && (
                <div className={styles.reviewDialog}>
                    <button className={styles.reviewDialogClose} onClick={() => setActiveReview(null)}>×</button>
                    <div className={styles.reviewDialogAuthor}>
                        {activeReview.username || "Пользователь"}
                    </div>
                    <div className={styles.reviewDialogText}>{activeReview.text}</div>
                    <div className={styles.reviewDialogMeta}>
                        {formatReviewDistance(activeReview.distance_m)} • {new Date(activeReview.created_at).toLocaleString()}
                    </div>
                </div>
            )}

            {/* Окно добавления нового отзыва */}
            {location?.type === "searchMarker" && location?.source === "userClick" && (
                <div
                    className={`${styles.reviewPanelDrawer} ${isReviewPanelOpen ? styles.reviewPanelDrawerOpen : ""}`}
                >
                    <button
                        type="button"
                        className={styles.reviewPanelToggle}
                        onClick={() => setIsReviewPanelOpen((prev) => !prev)}
                        aria-label={isReviewPanelOpen ? "Свернуть панель отзывов" : "Развернуть панель отзывов"}
                        title={isReviewPanelOpen ? "Свернуть" : "Развернуть"}
                    >
                        {isReviewPanelOpen ? "<" : ">"}
                    </button>

                    <div className={styles.reviewPanel}>
                        <div className={styles.reviewPanelTitle}>Отзыв по вашей метке</div>
                        <textarea
                            className={styles.reviewInput}
                            value={reviewDraft}
                            onChange={(e) => setReviewDraft(e.target.value)}
                            placeholder={isAuthenticated ? "Напишите отзыв об этом месте..." : "Войдите в аккаунт, чтобы оставить отзыв"}
                            disabled={!isAuthenticated}
                        />
                        <button
                            type="button"
                            className={styles.reviewSaveBtn}
                            onClick={handleSaveReviewAtMarker}
                            disabled={!isAuthenticated || !reviewDraft.trim()}
                        >
                            Сохранить отзыв
                        </button>
                        <div className={styles.reviewNearbyTitle}>
                            Отзывы рядом ({nearbyReviews.length})
                        </div>
                        {reviewsLoading && <div className={styles.reviewNearbyHint}>Загрузка...</div>}
                        {!reviewsLoading && nearbyReviews.length === 0 && (
                            <div className={styles.reviewNearbyHint}>Рядом пока нет отзывов</div>
                        )}
                        {!reviewsLoading && nearbyReviews.length > 0 && (
                            <div className={styles.reviewNearbyList}>
                                {nearbyReviews.slice(0, 5).map((review) => (
                                    <div key={review.id} className={styles.reviewNearbyItem}>
                                        <div className={styles.reviewNearbyUser}>{review.username || "Пользователь"}</div>
                                        <div className={styles.reviewNearbyText}>{review.text}</div>
                                        <div className={styles.reviewNearbyMeta}>{formatReviewDistance(review.distance_m)}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Кнопка профиля */}
            <div className={styles.toolbar}>
                {isAuthenticated ? (
                    <>
                    <button
                        type="button"
                        onClick={() => setProfileOpen(true)}
                        className={styles.avatarBtn}
                    >
                        {user.username?.[0]?.toUpperCase() || "P"}
                    </button>
                    <button
                        type="button"
                        onClick={logout}
                        className={styles.logoutBtn}
                    >
                        Выйти
                    </button>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => setAuthOpen(true)}
                        className={styles.loginBtn}
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