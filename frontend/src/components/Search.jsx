import { useState } from "react"

export default function Search({ setLocation }) {
    const [query, setQuery] = useState("")

    const handleSearch = async () => {
        if (!query) return

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10`
        )

        const geoData = await response.json()

        console.log("geoData:", geoData)

        if (geoData.length > 0) {
            const firstResult = geoData[0]
            setLocation({
                lon: firstResult.lon,
                lat: firstResult.lat
            })
        } else {
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
                placeholder="Введите город..."
            />
            <button onClick={handleSearch}>
                Найти
            </button>
        </div>
    )
}