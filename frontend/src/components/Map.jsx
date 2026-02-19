import { useEffect, useRef } from "react"
import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM"
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import Feature from "ol/Feature"
import Point from "ol/geom/Point"
import { Style, Icon } from "ol/style"
import { fromLonLat, toLonLat } from "ol/proj"
import "ol/ol.css"

export default function MapComponent({ setWeather, location }) {
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

            const marker = new Feature({
                geometry: new Point(coordinates)
            })

            marker.setStyle(
                new Style({
                    image: new Icon({
                        src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                        scale: 0.05
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

        mapRef.current.getView().animate({
            center: coords,
            zoom: 17,
            duration: 1000
        })
    }, [location])

    return (
        <div
            ref={mapRef}
            style={{ height: "100vh", width: "100%"}}
        />
    )
}