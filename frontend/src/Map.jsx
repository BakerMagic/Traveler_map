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

export default function MapComponent() {
    const mapRef = useRef()
    const vectorSourceRef = useRef(new VectorSource())

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

        // Обработчик клика на карте
        map.on("click", (event) => {
            const coordinates = event.coordinate
            const lonlat = toLonLat(coordinates)

            console.log("Координаты:", lonlat)

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
        })

        return () => map.setTarget(null)
    }, [])

    return (
        <div
        ref={mapRef}
        style={{ height: '100vh', width: '100%' }}
        />
    )
}