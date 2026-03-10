import { useState, useEffect } from "react"

export default function RoutePointInput({ point, index, routePoints, setRoutePoints }) {
    const [query, setQuery] = useState(point.name || "")
    const [results, setResults] = useState([])

    const handleSearch = async () => {
        if (!query.trim()) return

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&accept-language="browser language string"&namedetails=1&limit=5`
        )

        const data = await response.json()
        setResults(data)
    }

    const selectLocation = (result) => {
        const updated = routePoints.map(p => 
            p.id === point.id
            ? {
                ...p,
                name: result.display_name,
                lat: Number(result.lat),
                lon: Number(result.lon)
            }
            : p
        )

        setRoutePoints(updated)
        setResults([])
        setQuery(result.display_name)
    }

    useEffect(() => {
        setQuery(point.name || "");
    }, [point.name]);

    return (
        <div style={{ marginBottom: "20px" }}>
            <label>{index + 1} </label>

            <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Введите адрес..."
            />

            <button onClick={handleSearch}>Поиск</button>

            {results.length > 0 && (
                <div>
                    {results.map(result => (

                        <button 
                            key={result.place_id}
                            onClick={() => selectLocation(result)}
                            style={{
                                display: "block",
                                width: "100%",
                                textAlign: "left",
                                marginBottom: 8
                            }}
                        >
                            {result.display_name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}