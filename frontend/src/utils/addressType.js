export function getFeatureKindRu(item) {
    const src = item.addresstype || item.type || item.class || "";
  
    switch (src) {
        case "city":
        case "town":
        case "village":
        case "hamlet":
            return "населённый пункт";
        case "state":
        case "province":
        case "region":
            return "регион";
        case "country":
            return "страна";
        case "road":
        case "residential":
        case "tertiary":
        case "secondary":
        case "primary":
        case "motorway":
            return "дорога";
        case "river":
        case "stream":
            return "река";
        case "lake":
            return "озеро";
        case "island":
            return "остров";
        case "park":
        case "forest":
            return "парк";
        case "house":
        case "building":
            return "здание";
        case "suburb":
        case "district":
            return "район";
        default:
            return "объект";
    }
}