export function buildDisplayTitle(item) {
    const namedetails = item.namedetails || {};
  
    const nameRu = namedetails["name:ru"];
    const nameEn = namedetails["name:en"];
    const baseName = nameRu || nameEn || item.display_name || "";
  
    let tail = "";
    if (item.display_name) {
        const parts = item.display_name.split(",");
        if (parts.length > 1) {
            parts.shift(); // убираем первое «слово» / фрагмент
            tail = parts.join(",").trim();
        }
    }
  
    if (!nameRu && !nameEn) {
        return item.display_name || "";
    }
  
    // Есть ru/en имя
    if (tail) {
        return `${baseName} — ${tail}`;
    }
  
    return baseName;
}