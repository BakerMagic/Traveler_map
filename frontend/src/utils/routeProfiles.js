export const ROUTE_MODES = [
    { key: "car", profile: "driving-car", label: "Автомобиль" },
    { key: "truck", profile: "driving-hgv", label: "Грузовой автомобиль" },
    { key: "bike", profile: "cycling-regular", label: "Велосипед" },
    { key: "walk", profile: "foot-walking", label: "Пешком" }
];

export const DEFAULT_ROUTE_MODE = "car";

export function getProfileForMode(modeKey) {
    const found = ROUTE_MODES.find((m) => m.key === modeKey);
    return found?.profile ?? "driving-car";
}