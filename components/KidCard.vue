<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { public: config } = useRuntimeConfig()

const props = defineProps({
    userId: String,
    id: String,
    name: String,
    status: {
        type: String,
        default: 'offline',
    },
    lastOfflineAt: {
        type: [String, Object],
        default: null,
    },
    avatarUrl: {
        type: String,
        default: '/images/profile.png',
    },
    state: String,
    zoneId: String,
    lastLat: String,
    lastLng: String,
})

const placeName = ref('')
const isLoading = ref(true)
const distance = ref(null)

/* 🕒 ฟังก์ชันแปลงเวลา */
function formatLastSeen(status, lastOfflineAt) {
    if (status === 'online') return 'Now'
    if (!lastOfflineAt) return 'No time found'

    let timestamp
    if (typeof lastOfflineAt === 'object' && lastOfflineAt._seconds) {
        timestamp = new Date(lastOfflineAt._seconds * 1000)
    } else {
        timestamp = new Date(lastOfflineAt)
    }

    if (isNaN(timestamp.getTime())) return 'Invalid time'

    const diffMs = Date.now() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)

    if (diffMins < 1) return 'Just left'
    if (diffMins < 5) return 'A few mins ago'
    if (diffMins < 60) return `${diffMins} mins ago`
    if (diffHours < 2) return '1 hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffWeeks === 1) return '1 week ago'
    return `${diffWeeks} weeks ago`
}

const timeAgo = computed(() => formatLastSeen(props.status, props.lastOfflineAt))

/* ✅ แปลงพิกัดเป็นชื่อสถานที่ */
async function reverseGeocode(lat, lng) {
    try {
        const apiKey = config.googleApiKey
        const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
        )
        const data = await res.json()
        if (data.status === 'OK' && data.results.length > 0) {
            return data.results[0].formatted_address
        } else {
            return 'Unknown location'
        }
    } catch (err) {
        console.error('Reverse geocode error:', err)
        return 'Unknown location'
    }
}

/* ✅ ดึงชื่อสถานที่จาก zoneId */
async function fetchPlaceName(userId, zoneId) {
    try {
        const res = await fetch(`${config.apiDomain}/places/getPlace/${userId}/${zoneId}`)
        if (!res.ok) throw new Error('Failed to fetch places')
        const data = await res.json()
        placeName.value = data.name || 'No location found'
    } catch (err) {
        console.error('Fetch place error:', err)
        placeName.value = 'No location found'
    } finally {
        isLoading.value = false
    }
}

/* ✅ คำนวณระยะทาง (Haversine formula) */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3 // metres
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // in metres
    return d
}

/* ✅ หาตำแหน่งมือถือและคำนวณระยะทาง */
async function computeDistanceFromDevice() {
    if (!props.lastLat || !props.lastLng) return

    if (!navigator.geolocation) {
        console.warn('Geolocation not supported')
        return
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude
            const lng = pos.coords.longitude
            const dist = calculateDistance(
                Number(props.lastLat),
                Number(props.lastLng),
                lat,
                lng
            )

            console.log(dist)
            if (dist < 500) {
                distance.value = "With you"
            }
            else if (dist < 1000) {
                distance.value = `${Math.round(dist)} m`
            } else {
                distance.value = `${(dist / 1000).toFixed(1)} km`
            }
        },
        (err) => {
            console.warn('GPS error:', err.message)
        }
    )
}

/* ✅ เงื่อนไขหลัก */
onMounted(async () => {
    if (props.zoneId) {
        await fetchPlaceName(props.userId, props.zoneId)
    } else if (props.lastLat && props.lastLng) {
        placeName.value = await reverseGeocode(props.lastLat, props.lastLng)
        isLoading.value = false
    } else {
        placeName.value = 'No location found'
        isLoading.value = false
    }

    // 🔹 คำนวณระยะทางตอนโหลด
    computeDistanceFromDevice()
})

/* ✅ ลิงก์ปลายทาง */
const linkTo = computed(() => {
    if (props.state === 'kidDetail') {
        return `/map_beacons/${props.userId}/${props.id}?openDetail=openKidDetail`
    } else {
        return `/kids/kid_profile/${props.userId}/${props.id}`
    }
})

function goAndMaybeReload() {
    if (props.state === 'kidDetail') {
        router.push({
            path: `/map_beacons/${props.userId}/${props.id}`,
            query: {
                openDetail: 'openKidDetail',
                distance: distance.value
            }
        })
    } else {
        router.push(`/kids/kid_profile/${props.userId}/${props.id}`)
    }
}

</script>

<template>
    <div @click="goAndMaybeReload"
        class="cursor-pointer flex items-center bg-white border border-gray-200 rounded-xl shadow-md p-3 hover:bg-gray-50 transition">
        <img :src="avatarUrl" class="w-12 h-12 rounded-full mr-3 object-cover" />
        <div class="flex-1">
            <div class="flex justify-between">
                <p class="font-semibold text-gray-800">
                    {{ name }}
                    <span :class="['text-sm ml-2', props.status === 'online' ? 'text-green-500' : 'text-gray-500']">
                        ● {{ timeAgo }}
                    </span>
                </p>

                <p class="text-sm text-gray-500">
                    {{ distance || '...' }}
                </p>
            </div>

            <p class="text-sm text-gray-500">
                <template v-if="!isLoading">
                    {{ placeName || 'No location found' }}
                </template>
                <template v-else>
                    Loading...
                </template>
            </p>
        </div>
    </div>
</template>
