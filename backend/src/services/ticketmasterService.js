import fetch from "node-fetch"

const TM_BASE_URL = "https://app.ticketmaster.com/discovery/v2"

export async function fetchEventsByLocationTicketmaster({ lat, lon, radiusKm = 50, size = 20 }) {
    const apiKey = process.env.TICKETMASTER_API_KEY
    if (!apiKey) {
        throw new Error("TICKETMASTER_API_KEY is not set")
    }

    const url = new URL(`${TM_BASE_URL}/events.json`)
    url.searchParams.set("apikey", apiKey)
    url.searchParams.set("latlong", `${lat},${lon}`)
    url.searchParams.set("radius", String(radiusKm))
    url.searchParams.set("unit", "km")
    url.searchParams.set("size", String(size))
    url.searchParams.set("sort", "date,asc")

    const response = await fetch(url.toString())
    if (!response.ok) {
        const text = await response.text()
        throw new Error(`Ticketmaster HTTP ${response.status}: ${text}`)
    }

    const data = await response.json()
    const rawEvents = data._embedded?.events ?? []

    const now = new Date()
    
    const normalizedEvents = rawEvents
        .map((event) => {
            const start = event.dates.start
            const dateStr = start?.dateTime || start?.localDate || null

            let startDate = null
            if (dateStr) {
                startDate = new Date(dateStr)
                if (isNaN(startDate.getTime())) {
                    startDate = null
                }
            }

            return {
                id: event.id,
                name: event.name,
                url: event.url,
                date: start?.localDate || start?.dateTime || "",
                time: start?.localTime || "",
                venueName: event._embedded?.venues?.[0]?.name || "",
                address: event._embedded?.venues?.[0]?.address?.line1 || "",
                city: event._embedded?.venues?.[0]?.city?.name || "",
                country: event._embedded?.venues?.[0]?.country?.name || "",
                lat: event._embedded?.venues?.[0]?.location?.latitude,
                lon: event._embedded?.venues?.[0]?.location?.longitude,
                _startDateObj: startDate, // служебное для фильтрации
            }
        })
        .filter((ev) => {
            // выкидываем без даты
            if (!ev._startDateObj) return false
            // оставляем только будущие
            return ev._startDateObj <= now
        })
        .map(({ _startDateObj, ...ev }) => ev ) // убираем служебное поле

    console.log("Ticketmaster:", normalizedEvents)

    return normalizedEvents
}