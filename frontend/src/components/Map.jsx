import { useEffect, useRef } from "react"
import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM"
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import Feature from "ol/Feature"
import Point from "ol/geom/Point"
import { Style, Icon, Stroke } from "ol/style"
import { fromLonLat, toLonLat } from "ol/proj"
import "ol/ol.css"
import { getZoomByLocation } from '../utils/zoomMap'
import { LineString } from "ol/geom"

export default function MapComponent({ setWeather, location, routePoints, routeGeometry }) {
    const mapRef = useRef()
    const vectorSourceRef = useRef(new VectorSource())

    // Карта и погода
    useEffect(() => {
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

        // Обработчик клика на карте
        map.on("click", async (event) => {
            const coordinates = event.coordinate
            const lonLat = toLonLat(coordinates)

            // Очистка старого маркера
            vectorSourceRef.current.clear()

            const svg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="90">
                    <circle cx="20" cy="20" r="15" fill="red"/>
                    <path d="M 10 31 Q 18 37 20 45 Q 22 37 30 31" fill="red"/>
                    <circle cx="20" cy="20" r="6" fill="white"/>              
                </svg>
            `

            const marker = new Feature({
                geometry: new Point(coordinates)
            })

            marker.setStyle(
                new Style({
                    image: new Icon({
                        src: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg),
                        scale: 1
                    })
                })
            )

            vectorSourceRef.current.addFeature(marker)

            // Запрос к OpenWeather
            const key = import.meta.env.VITE_OPEN_WEATHER_API_KEY
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lonLat[1]}&lon=${lonLat[0]}&lang=ru&units=metric&appid=${key}`
            )

            const data = await response.json()
            setWeather(data)
        })

        return () => map.setTarget(null)
    }, [setWeather])

    // Поиск
    useEffect(() => {
        console.log("location:", location)

        if (!location || !mapRef.current) return

        const coords = fromLonLat([location.lon, location.lat])
        const zoom = getZoomByLocation(location)

        mapRef.current.getView().animate({
            center: coords,
            zoom: zoom,
            duration: 1000
        })
    }, [location])

    // Построение маршрута (точки)
    useEffect(() => {
        if (!mapRef) return

        vectorSourceRef.current.clear()

        routePoints.forEach((point, index) => {
            if (!point.lat || !point.lon) return

            const marker = new Feature({
                geometry: new Point(fromLonLat([point.lon, point.lat]))
            })

            marker.setStyle(
                new Style({
                    image: new Icon({
                        src: generateNumberedSVG(index + 1),
                        scale: 1
                    })
                })
            )

            vectorSourceRef.current.addFeature(marker)
        })
    }, [routePoints])

    // Построение маршрута (путь)
    useEffect(() => {
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
        <div
            ref={mapRef}
            style={{ height: "100vh", width: "100%"}}
        />
    )
}

function generateNumberedSVG(number) {
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