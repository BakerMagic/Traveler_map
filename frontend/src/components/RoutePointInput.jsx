import { useState, useEffect } from "react"
import { getFeatureKindRu } from '../utils/addressType'
import { buildDisplayTitle } from '../utils/displayTitle'
import styles from "../styles/RoutePointInput.module.css"
import loupeSVG from "../assets/loupe.svg"
import crossSVG from "../assets/cross.svg"

export default function RoutePointInput({
    point,
    index,
    routePoints,
    setRoutePoints,
    totalCount,
    onClearOrRemove,
    onMoveUp,
    onMoveDown,
    canMoveUp,
    canMoveDown
}) {
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

    const handleClearClick = () => {
        setResults([])
        onClearOrRemove()
    }

    const clearTitle = totalCount <= 2 ? "Очистить поле" : "Удалить точку"

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <span className={styles.indexBadge}>{index + 1}</span>
                <span className={styles.spacer} />
                <div className={styles.toolbar}>
                <button
                    type="button"
                    className={styles.iconButton}
                    aria-label="Выше"
                    disabled={!canMoveUp}
                    onClick={onMoveUp}
                >
                    ↑
                </button>
                <button
                    type="button"
                    className={styles.iconButton}
                    aria-label="Ниже"
                    disabled={!canMoveDown}
                    onClick={onMoveDown}
                >
                    ↓
                </button>
                <button
                    type="button"
                    className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                    aria-label={clearTitle}
                    title={clearTitle}
                    onClick={handleClearClick}
                >
                    <img className={styles.crossIcon} src={crossSVG} alt="" />
                </button>
                </div>
            </div>
            <div className={styles.inputRow}>
                <div className={styles.field}>
                <input
                    className={styles.input}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault()
                            handleSearch()
                        }
                    }}
                    placeholder="Введите адрес..."
                />
                </div>
                <button
                    type="button"
                    className={`${styles.iconButton} ${styles.searchTrigger}`}
                    aria-label="Поиск"
                    onClick={handleSearch}
                >
                    <img className={styles.loupeIcon} src={loupeSVG} alt="" />
                </button>
            </div>
            {results.length > 0 && (
                <div className={styles.results}>
                    {results.map((result) => {
                        const title = buildDisplayTitle(result)
                        const kind = getFeatureKindRu(result)
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