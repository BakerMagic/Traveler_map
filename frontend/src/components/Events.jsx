import { useState, useEffect } from "react"

export default function Events({ location, setLocation }) {
    const [events, setEvents] = useState([])
    const [eventsLoading, setEventsLoading] = useState(false)
    const [eventsError, setEventsError] = useState(null)

    const handlePick = (lat, lon) => {
        setLocation({
            lon: Number(lon),
            lat: Number(lat),
            type: "tourism",
        })
    }

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

                // Поиск событий вокруг выбранной точки (Глобально)
                const response = await fetch(
                    `http://localhost:4000/api/events?lat=${location.lat}&lon=${location.lon}`
                )
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`)
                }

                const data = await response.json()

                setEvents(data.events || [])
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
                        <div
                            key={event.id}
                            style={{
                                display: "block",
                                width: "100%",
                                textAlign: "left",
                                marginBottom: 8,
                                padding: 8,
                                border: "1px solid #ddd",
                                borderRadius: 4,
                            }}>
                                <button
                                    type="button"
                                    onClick={() => handlePick(event.lat, event.lon)}
                                    style={{
                                        display: "block",
                                        width: "100%",
                                        textAlign: "left",
                                        padding: 0,
                                        border: "none",
                                        background: "transparent",
                                        cursor: "pointer"
                                    }}
                                >
                                    <div style={{ fontWeight: "bold" }}>
                                        {event.name}
                                    </div>
                                    <div style={{ fontSize: 12, color: "#555" }}>
                                        {event.date} {event.time && `в ${event.time}`}
                                    </div>
                                    <div style={{ fontSize: 12, color: "#777" }}>
                                        {event.venueName && `${event.venueName}, `}
                                        {event.address && `${event.address}, `}
                                        {event.city}
                                        {event.country && `, ${event.country}`}
                                    </div>
                                </button>
                                {event.url && (
                                    <a 
                                        href={event.url}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = "#777")}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                                        style={{
                                            fontSize: 12,
                                            color: "#555",
                                            display: "inline-block",
                                            marginTop: 6,
                                        }}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Посетить сайт...
                                    </a>
                                )}
                        </div>
                    ))}
                </div>
            }
        </div>
    )
}