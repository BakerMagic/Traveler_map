import { useState } from "react"

export default function Search({ setLocation }) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState([])

    const handlePick = (item) => {
        setLocation({
            lon: Number(item.lon),
            lat: Number(item.lat),
            type: item.type,
            class: item.class,
            addresstype: item.addresstype,
            display_name: item.display_name
        })

        // setResults([])
    }

    const handleSearch = async () => {
        if (!query.trim()) return

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&accept-language="browser language string"&namedetails=1&limit=10`
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

    return (
        <div className="sidebar">
            <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Введите запрос"
            />
            <button onClick={handleSearch}>Найти</button>

            {results.length > 0 && (
                <div style={{ marginTop: 12 }}>
                    {results.map((item) => (
                        <button 
                            key={`${item.osm_type}-${item.osm_id}`}
                            onClick={() => handlePick(item)}
                            style={{
                                display: "block",
                                width: "100%",
                                textAlign: "left",
                                marginBottom: 8
                            }}>
                                {item.display_name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}