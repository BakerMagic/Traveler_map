import fetch from "node-fetch"

const KG_BASE_URL = "https://kudago.com/public-api/v1.4"

export async function fetchEventsByLocationKudaGo({ lat, lon }) {
    const now = new Date()
    const nowSec = Math.floor(now.getTime() / 1000) // unix-время в секундах

    const url = new URL(`${KG_BASE_URL}/events/`)
    url.searchParams.set("lang", "ru")
    url.searchParams.set("fields", "id,dates,place,location,title,site_url")
    url.searchParams.set("actual_since", String(nowSec))
    url.searchParams.set("expand", "place,location")
    url.searchParams.set("lat", String(lat))
    url.searchParams.set("lon", String(lon))
    url.searchParams.set("radius", 50000) // 50 км (указывается в метрах)

    const response = await fetch(url.toString())
    if (!response.ok) {
        const text = await response.text()
        throw new Error(`KudaGo http ${response.status}: ${text}`)
    }

    const data = await response.json()
    const results = data.results || []

    const normalizedEvent = (event) => {
        const dates = Array.isArray(event.dates) ? event.dates : []

        // Превращает даты в нормальный вид и выкидывает явный мусор
        const parsed = dates
            .map(d => {
                const start = typeof d.start === "number" ? d.start : null
                const end = typeof d.end === "number" ? d.end : null
                return { start, end }
            })
            .filter(({ start, end }) => {
                // Выкидывает совсем странные значения по типу -62135433000
                const s = start ?? end
                if (!s || s < nowSec - 60 * 60 * 24 * 365 * 5) {
                    return false
                } 

                return true
            })

        // Оставляем только будущие интервалы
        const future = parsed.filter(({ start, end }) => {
            const s = start ?? end
            const e = end ?? start

            return (s ?? e) >= nowSec
        })

        if (future.length === 0) return null

        const main = future[0]
        const mainTs = main.start ?? main.end

        const mainDate = mainTs ? new Date(mainTs * 1000) : null
        const dateLabel = mainDate
            ? mainDate.toLocaleString("ru-RU", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            })
            : ""
            
        return {
            id: event.id,
            name: event.title,
            url: event.site_url,
            date: dateLabel,
            time: "",
            venueName: event.place?.title || "",
            address: event.place?.address || "",
            city: event.location?.name || "",
            country: "",
            lat: event.place?.coords?.lat,
            lon: event.place?.coords?.lon,
            futureDates: future,
        }
    }

    const test = results
        .map(normalizedEvent)
        .filter(Boolean) // фильтр на null (события без будущих дат)

    console.log("KudaGo:", test)
    
    return test
}