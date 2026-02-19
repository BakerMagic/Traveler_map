import { useState, useEffect } from "react"

export default function Events({ location }) {
    const [events, setEvents] = useState([])
    const [eventsLoading, setEventsLoading] = useState(false)
    const [eventsError, setEventsError] = useState(null)

    useEffect(() => {
        if (!location) {
            setEvents([])
            setEventsLoading(false)
            setEventsError(null)
            return
        }

        const fetchEvents = async () => {
            try {
                setEventsLoading(true)
                setEventsError(null)

                const key = import.meta.env.VITE_TICKETMASTER_API_KEY
                if (!key) {
                    setEventsError("Ticketmaster API key не задан")
                    setEvents([])
                    return
                }

                const lat = location.lat
                const lon = location.lon

                // Поиск событий вокруг выбранной точки (Глобально)
                const response = await fetch(
                    `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${key}&latlong=${lat},${lon}&radius=50&unit=km&size=20&sort=date,asc`
                )
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`)
                }

                const normalized = rawEvents.map((event) => ({
                    id: event.id,
                    name: event.name,
                    url: event.url,
                    date: event.dates?.start?.localDate || event.dates?.start?.dateTime || "",
                    time: event.dates?.start?.localTime || "",
                    venueName: event._embedded?.venues?.[0]?.name || "",
                    city: event._embedded?.venues?.[0]?.city?.name || "",
                    country: event._embedded?.venues?.[0]?.country?.name || "",
                }))

                setEvents(normalized)
            } catch (error) {
                console.error("TicketMaster events error:", error)
                setEventsError("Не удалось загрузить события")
                setEvents([])
            } finally {
                setEventsLoading(false)
            }
        }

        fetchEvents()
    }, [location])

    return (
        <div style={{
            borderTop: "2px solid gray",
            marginTop: 16,
            paddingTop: 12,
            width: "100%"
        }}>
            <h3 style={{ marginBottom: 8 }}>События рядом</h3>

            {eventsLoading && <p>Загрузка...</p>}

            {eventsError && !eventsLoading && <p style={{ color: "red" }}>{eventsError}</p>}

            {!eventsLoading && !eventsError && (!events || events.length === 0) && 
                <p>Нет событий поблизости.</p>
            }

            {!eventsLoading && !eventsError && events && events.length > 0 && 
                <div>
                    {events.map((event) => (
                        <button 
                            key={event.id}
                            onClick={() => event.url && window.open(event.url, "_blank")}
                            style={{
                                display: "block",
                                width: "100%",
                                textAlign: "left",
                                marginBottom: 8,
                                padding: 8,
                                border: "1px solid #ddd",
                                borderRadius: 4,
                                cursor: event.url ? "pointer" : "default"
                            }}>
                                <div style={{ fontWeight: "bold" }}>
                                    {event.name}
                                </div>
                                <div style={{ fontSize: 12, color: "#555" }}>
                                    {event.date} {event.time && `в ${event.time}`}
                                </div>
                                <div style={{ fontSize: 12, color: "#777" }}>
                                    {event.venueName && `${event.venueName}, `}{event.city}{event.country && `, ${event.country}`}
                                </div>
                        </button>
                    ))}
                </div>
            }
        </div>
    )
}