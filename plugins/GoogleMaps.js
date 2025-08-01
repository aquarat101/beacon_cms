export default defineNuxtPlugin((nuxtApp) => {
    if (import.meta.client && !window.google) {
        const config = useRuntimeConfig()
        const apiKey = config.public.googleMapsApiKey

        return new Promise((resolve) => {
            const script = document.createElement('script')
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
            script.async = true
            script.defer = true
            script.onload = () => resolve()
            document.head.appendChild(script)
        })
    }
})
