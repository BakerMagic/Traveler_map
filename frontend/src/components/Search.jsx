import { useState } from "react"
import { getFeatureKindRu } from '../utils/addressType'
import { buildDisplayTitle } from '../utils/displayTitle'
import RouteBuilder from "./RouteBuilder"
import destinationSVG from "../assets/destination.svg"
import crossSVG from "../assets/cross.svg"

export default function Search({
    setLocation,
    routePoints, 
    setRoutePoints,
    setRouteGeometry,
    currentRouteId,
    setCurrentRouteId,
    currentRouteName,
    setCurrentRouteName
}) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState([])
    const [isRouteBuilderActive, setIsRouteBuilderActive] = useState(false)
    const hasSearchData = query.trim().length > 0 || results.length > 0;

    const handlePick = (item) => {
        setLocation({
            lon: Number(item.lon),
            lat: Number(item.lat),
            type: item.type,
            class: item.class,
            addresstype: item.addresstype,
            display_name: item.display_name,
            polygon: item.geojson || null
        })
    }

    const handleSearch = async () => {
        if (!query.trim()) return

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&accept-language=ru,en&namedetails=1&polygon_geojson=1&limit=10`
        )

        const geoData = await response.json()

        console.log("geoData:", geoData)

        if (geoData.length === 1) {
            handlePick(geoData[0])
            setResults(geoData)
        } else if (geoData.length > 1) {
            setResults(geoData)
        } else {
            setResults([])
            // TODO: переделать вывод сообщения об ошибке
            alert("Место не найдено")
        }
    }
    const handleClearAll = () => {
        setQuery("")
        setResults([])

        setLocation && setLocation(null)

        setRoutePoints && setRoutePoints([])
        setRouteGeometry && setRouteGeometry(null)
        setCurrentRouteId && setCurrentRouteId(null)
        setCurrentRouteName && setCurrentRouteName("")
        setIsRouteBuilderActive(false)
    };

    return (
        <div className="sidebar">
            <div
                style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 8,
                }}
            >
                <input 
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Введите запрос"
                />
                <button onClick={handleSearch}>Найти</button>

                {hasSearchData || isRouteBuilderActive ? (
                    <button 
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: 7
                        }}
                        className="crossBtn"
                        onClick={() => handleClearAll()}
                    >
                        <img src={crossSVG} width="25" height="25"></img>
                    </button>
                ) : (
                    <button 
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: 7
                        }}
                        className="destinationBtn"
                        onClick={() => setIsRouteBuilderActive(true)}
                    >
                        <img src={destinationSVG} width="25" height="25"></img>
                    </button>
                )}
            </div>
            {isRouteBuilderActive && (
                <div style={{ marginTop: 8 }}>
                    <RouteBuilder
                        routePoints={routePoints}
                        setRoutePoints={setRoutePoints}
                        setRouteGeometry={setRouteGeometry}
                        currentRouteId={currentRouteId}
                        setCurrentRouteId={setCurrentRouteId}
                        currentRouteName={currentRouteName}
                        setCurrentRouteName={setCurrentRouteName}
                        setIsRouteBuilderActive={setIsRouteBuilderActive}
                    />
                </div>
            )}

            {results.length > 0 && (
                <div style={{ marginTop: 12 }}>
                    {results.map((item) => {
                        const title = buildDisplayTitle(item);
                        const kind = getFeatureKindRu(item);

                        return (
                            <button 
                                key={`${item.osm_type}-${item.osm_id}`}
                                onClick={() => handlePick(item)}
                                style={{
                                    display: "block",
                                    width: "100%",
                                    textAlign: "left",
                                    marginBottom: 8,
                                    padding: "6px 8px",
                                    borderRadius: 6,
                                    border: "1px solid #ddd",
                                    cursor: "pointer",
                                }}
                            >
                                <div style={{ fontWeight: 500 }}>{title}</div>
                                <div style={{ fontSize: 12, color: "#666" }}>{kind}</div>
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}