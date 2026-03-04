export const getCurrencySymbol = (country: string) => {
    const symbols: Record<string, string> = {
        "Thailand": "฿",
        "Indonesia": "Rp",
        "Japan": "¥",
        "China": "¥",
        "Vietnam": "₫",
        "South Korea": "₩",
        "France": "€",
        "Italy": "€",
        "Spain": "€",
        "Germany": "€",
        "UK": "£",
        "United Kingdom": "£",
        "USA": "$",
        "United States": "$",
        "Singapore": "S$",
        "Malaysia": "RM",
        "Philippines": "₱",
    };
    return symbols[country] || "$";
};
