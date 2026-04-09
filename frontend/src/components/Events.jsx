import { useState, useEffect } from "react"
import styles from "../styles/Events.module.css"

export default function Events({
    location,
    setLocation,
    setSelectedEvent
}) {
    const [events, setEvents] = useState([])
    const [eventsLoading, setEventsLoading] = useState(false)
    const [eventsError, setEventsError] = useState(null)

    const handleShowOnMap = (event) => {
        setSelectedEvent?.({
            id: event.id,
            name: event.name,
            lat: Number(event.lat),
            lon: Number(event.lon),
            date: event.date,
            time: event.time,
            venueName: event.venueName,
            address: event.address,
            city: event.city,
            country: event.country,
            url: event.url
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
        <div className={styles.root}>
            <h3 className={styles.title}>События рядом</h3>

            {eventsLoading && <p>Загрузка...</p>}

            {eventsError && !eventsLoading && <p className={styles.error}>{eventsError}</p>}

            {!eventsLoading && !eventsError && (!events || events.length === 0) && 
                <p>Нет событий поблизости.</p>
            }

            {!eventsLoading && !eventsError && events && events.length > 0 && 
                <div>
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className={styles.eventCard}>
                                <button
                                    type="button"
                                    onClick={() => handleShowOnMap(event)}
                                    className={styles.showOnMapBtn}
                                >
                                    <div className={styles.eventName}>
                                        {event.name}
                                    </div>
                                    <div className={styles.eventMeta}>
                                        {event.date} {event.time && `в ${event.time}`}
                                    </div>
                                    <div className={styles.eventVenue}>
                                        {event.venueName && `${event.venueName}, `}
                                        {event.address && `${event.address}, `}
                                        {event.city}
                                        {event.country && `, ${event.country}`}
                                    </div>
                                </button>
                                {event.url && (
                                    <a 
                                        href={event.url}
                                        className={styles.eventLink}
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