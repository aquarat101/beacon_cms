<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRuntimeConfig } from '#app'

const searchQuery = ref('')
const showResults = ref(false)
const showPlace = ref(false)
const searchResults = ref([])
const result = ref('')
const marker = ref(null)
const mapRef = ref(null)
const map = ref(null)
const circle = ref(null)

// เพิ่ม ref สำหรับตำแหน่งที่เลือก
const selectedPosition = ref(null)

function onMapClick(event) {
    const latLng = event.latLng

    // เก็บตำแหน่งที่กดปัก
    selectedPosition.value = {
        lat: latLng.lat(),
        lng: latLng.lng()
    }

    // ลบ marker เก่า ถ้ามี
    if (marker.value) {
        marker.value.setMap(null)
    }

    // สร้าง marker ใหม่ที่ตำแหน่งคลิก
    marker.value = new google.maps.Marker({
        position: latLng,
        map: map.value,
        title: 'Selected Location',
    })

}

function clearPin() {
    if (marker.value) {
        marker.value.setMap(null)
        marker.value = null
    }
    selectedPosition.value = null
}

function loadGoogleMaps(apiKey) {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            resolve(window.google.maps)
            return
        }
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
        script.async = true
        script.onload = () => resolve(window.google.maps)
        script.onerror = () => reject('Failed to load Google Maps API')
        document.head.appendChild(script)
    })
}

function selectPlace(place) {
    const location = place.geometry.location
    result.value = place.name
    showPlace.value = true

    map.value.panTo(location)

    if (marker.value) {
        marker.value.setMap(null)
    }

    marker.value = new google.maps.Marker({
        position: location,
        map: map.value,
        title: place.name,
    })
    console.log('selectPlace called, showResults set to', showResults.value)

    searchQuery.value = place.name
    showResults.value = false
}

async function goToCurrentLocation() {
    if (!map.value) return
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                }

                map.value.panTo(userLocation)
                map.value.setZoom(14)

                if (marker.value) marker.value.setMap(null)
                marker.value = new google.maps.Marker({
                    position: userLocation,
                    map: map.value,
                    title: 'Current Location',
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#4285F4',
                        fillOpacity: 0.8,
                        strokeColor: 'white',
                        strokeWeight: 2,
                    },
                })

                if (circle.value) circle.value.setMap(null)
                circle.value = new google.maps.Circle({
                    strokeColor: '#4285F4',
                    strokeOpacity: 0.6,
                    strokeWeight: 2,
                    fillColor: '#4285F4',
                    fillOpacity: 0.2,
                    map: map.value,
                    center: userLocation,
                    radius: 500,
                })
            },
            (error) => {
                console.warn('Geolocation error:', error.message)
            }
        )
    }
}

// ฟังก์ชันสำหรับกด enter ในช่อง search ให้แผนที่ไปตำแหน่งนั้น
function handleEnterKey(event) {
    if (event.key === 'Enter' && searchQuery.value.trim()) {
        const service = new google.maps.places.PlacesService(map.value)
        const request = {
            query: searchQuery.value,
            fields: ['name', 'geometry', 'place_id'],
        }
        service.textSearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                selectPlace(results[0])
                result.value = results[0].name
                showResults.value = false;
                showPlace.value = true;
            }
        })
    }
}

function clearSearch() {
    if (searchQuery.value) searchQuery.value = ''
    showResults.value = false
}

onMounted(async () => {
    const config = useRuntimeConfig()
    try {
        const googleMaps = await loadGoogleMaps(config.public.googleMapsApiKey)

        const initialCenter = { lat: 13.7563, lng: 100.5018 }

        map.value = new googleMaps.Map(mapRef.value, {
            center: initialCenter,
            zoom: 14,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            rotateControl: false,
            scaleControl: false,
            scrollwheel: false,
            draggable: true,
            keyboardShortcuts: false,
            styles: [
                {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }]
                }
            ]
        })

        map.value.addListener('click', onMapClick)

        goToCurrentLocation() // เรียกให้เลื่อนไปตำแหน่งปัจจุบันถ้ามีสิทธิ์

    } catch (error) {
        console.error(error)
    }
})

watch(searchQuery, (val) => {
    if (!val.trim()) {
        showResults.value = false
        return
    }

    const service = new google.maps.places.PlacesService(map.value)
    const request = {
        query: val,
        fields: ['name', 'geometry', 'place_id'],
    }

    service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            searchResults.value = results.slice(0, 5)
            showResults.value = true
            showPlace.value = false
        }
    })
})
</script>

<template>
    <div class="flex flex-col min-h-screen bg-[#E0F3FF]">
        <!-- Header -->
        <div class="px-4 pt-4 pb-2 text-center bg-[#92DBFF]">
            <p class="text-2xl font-bold text-outline-blue">Tap the map or search location name</p>

            <!-- Search Input -->
            <div class="mt-3 mb-4 mx-4 relative">
                <input v-model="searchQuery" @keydown="handleEnterKey" type="text" placeholder="Search location"
                    class="w-full rounded-full px-4 pl-10 py-2 text-xl shadow-sm bg-white border border-white placeholder-gray-400" />
                <span class="absolute left-4 top-3.5 text-gray-400">
                    <img src="/icons/search.png" alt="search" class="w-4 h-5" />
                </span>

                <button @click="clearSearch" class="absolute top-0 right-3 text-sm bg-white pl-3 w-8 h-7 mt-2 z-5">
                    <img src="/icons/x.png" alt="clear search" class="w-3 h-3">
                </button>

            </div>

            <!-- Search Results -->
            <div v-if="showResults"
                class="absolute top-35 -left-4 w-full mt-3 mx-4 text-left text-lg bg-white rounded-xl p-4 shadow z-50">
                <p class="font-bold mb-2 text-gray-700">Results for "{{ searchQuery }}"</p>
                <ul class="space-y-2 text-gray-800">
                    <li v-for="place in searchResults" :key="place.place_id" @click="selectPlace(place)"
                        class="cursor-pointer hover:underline">
                        <div class="flex justify-between">
                            <p>📍 {{ place.name }}</p>

                            <NuxtLink to="/places/add_place">
                                <button class="bg-blue-100 text-blue-500 rounded-full p-3 flex justify-center">
                                    <img src="/icons/plus.png" alt="plus" class="w-4 h-4" />
                                </button>
                            </NuxtLink>
                        </div>
                    </li>
                </ul>
            </div>
        </div>

        <!-- Map Section -->
        <div class="relative flex-1">
            <div ref="mapRef" style="width: 100%; height: 84vh;"></div>

            <!-- ปุ่มเลื่อนไปตำแหน่งปัจจุบัน -->
            <button @click="goToCurrentLocation"
                class="absolute top-3 right-2 bg-white p-2 rounded-full shadow-md text-blue-600 text-xl">
                📍
            </button>

            <button @click="clearPin"
                class="absolute top-15 right-2.5 bg-white p-3 rounded-full text-sm text-red-500 underline mt-2">
                <img src="/icons/x.png" alt="clear pin" class="w-4 h-4">
            </button>
        </div>

        <!-- Pin Place Section (ซ่อนเมื่อค้นหา) -->
        <div v-if="!showResults && !showPlace"
            class="absolute bottom-0 w-full bg-white text-xl rounded-t-3xl p-6 shadow-lg">
            <p class="font-bold mb-2 text-[#035CB2] text-3xl">Pin place</p>
            <div class="flex items-center justify-between">
                <div class="">
                    <p class="font-semibold">Kisra</p>
                    <p class="text-gray-500 truncate max-w-[220px]">1845/5-8 Phaholyothin Road, Laty...</p>
                </div>
                <NuxtLink to="/places/add_place">
                    <button class="bg-blue-100 text-blue-500 rounded-full p-3 flex justify-center">
                        <img src="/icons/plus.png" alt="plus" class="w-4 h-4" />
                    </button>
                </NuxtLink>
            </div>

            <button class="mt-10 w-full border-2 border-blue-400 text-blue-500 font-semibold py-2 rounded-xl">
                Back to My Places
            </button>
        </div>

        <!-- Pin Result Place Section (ซ่อนเมื่อค้นหา) -->
        <div v-if="showPlace" class="absolute bottom-0 w-full bg-white rounded-t-3xl text-lg p-6 shadow-lg">
            <!-- <p class="font-bold mb-2">Result place</p> -->
            <div class="flex items-start justify-between">
                <div class="">
                    <p class="font-bold text-xl text-[#035CB2]">{{ result }}</p>
                    <p class="text-gray-500 truncate max-w-[220px]">1845/5-8 Phaholyothin Road, Laty...</p>
                </div>

                <div class="flex items-start gap-2">
                    <img src="/icons/edit.png" alt="edit" class="bg-[#035CB2] w-9 h-9 p-2 rounded-full">
                    <img src="/icons/trash.png" alt="delete" class="bg-[#E24B4B] w-9 h-9 p-2 rounded-full">
                </div>
            </div>

            <div class="mt-2">
                <p class="font-bold">Place type</p>

                <div class="mt-1 px-4 py-1 bg-[#92DBFF] w-fit rounded-full text-sm">Work</div>
            </div>

            <div class="mt-2">
                <p class="font-bold">Remark</p>

                <P>Kisra</P>
            </div>

            <div class="flex justify-between gap-4 font-bold mt-6">
                <button type="submit"
                    class="flex justify-center w-full bg-white text-[#0198FF] border border-[#0198FF] py-3 rounded-2xl text-lg hover:bg-[#0198FF] hover:text-white transition">
                    Back
                </button>

                <button type="submit"
                    class="flex justify-center w-full bg-[#0198FF] text-white py-3 rounded-2xl text-lg hover:bg-[#0198FF] transition">
                    Save
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.text-outline-blue {
    color: white;
    -webkit-text-stroke: 1.6px #035CB2;
}
</style>
