export async function fetchQuote() {
    const categories = ["inspiration", "excellence", "truth", "success"]
    const category = categories[Math.floor(Math.random() * categories.length)]

    try {
        const response = await fetch(
            `https://zenquotes.io/api/random/${category}`,
        )
        const data = await response.json()
        if (data && data[0] && data[0].q && data[0].a) {
            return `"${data[0].q}" — ${data[0].a}`
        }
    } catch (e) {
        // Fallback or silence
    }
    return null
}
