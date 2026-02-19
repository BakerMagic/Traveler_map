export const ZOOM_MAP = {
    // Страны
    'country': 5,

    // Города и крупные населённые пункты
    'city': 13,
    'town': 14,
    'village': 15,
    'hamlet': 16,

    // Улицы и дороги
    'road': 17,
    'residential': 17,
    'street': 17,
    'highway': 16,

    // Здания и точки интереса
    'building': 18,
    'house': 18,
    'place': 15,
    'shop': 18,
    'amenity': 18,

    // Природные объекты
    'peak': 14,
    'bay': 13,
    'island': 12,
}

export function getZoomByLocation(location) {
    if (!location) return 10

    const type = location.addresstype || location.type || location.class

    if (ZOOM_MAP[type]) {
        console.log("type:", type)
        console.log("zoom:", ZOOM_MAP[type])

        return ZOOM_MAP[type]
    }

    // Дефолтный zoom
    return 15
}