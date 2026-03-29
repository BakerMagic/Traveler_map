import { useState, useEffect } from "react"
import { getFeatureKindRu } from '../utils/addressType'
import { buildDisplayTitle } from '../utils/displayTitle'
import styles from "../styles/RoutePointInput.module.css"

export default function RoutePointInput({ point, index, routePoints, setRoutePoints }) {
    const [query, setQuery] = useState(point.name || "")
    const [results, setResults] = useState([])

    const handleSearch = async () => {
        if (!query.trim()) return

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&accept-language=ru,en&namedetails=1&limit=5`
        )

        const data = await response.json()
        setResults(data)
    }

    const selectLocation = (result) => {
        const updatedName = buildDisplayTitle(result);

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
        <div className={styles.root}>
            <label>{index + 1} </label>

            <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Введите адрес..."
            />

            <button onClick={handleSearch}>Поиск</button>

            {results.length > 0 && (
                <div>
                    {results.map(result => {
                        const title = buildDisplayTitle(result);
                        const kind = getFeatureKindRu(result);

                        return (
                            <button 
                                key={result.place_id}
                                type="button"
                                onClick={() => selectLocation(result)}
                                className={styles.resultBtn}
                            >
                                <div className={styles.resultTitle}>{title}</div>
                                <div className={styles.resultKind}>{kind}</div>
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}