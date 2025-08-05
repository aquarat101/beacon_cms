<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { public: config } = useRuntimeConfig()
const userId = route.params.userId
// const placeId = route.params.placeId
const name = route.query.name
const address = route.query.address
const type = route.query.type
const remark = route.query.remark
const showP = route.query.status
const latitude = route.query.lat
const longitude = route.query.lng

const searchQuery = ref('')
const showPlace = ref(false)
const showResults = ref(false)
const searchResults = ref([])
const result = ref('')
const resultName = ref('')
const resultAddress = ref('')
const marker = ref(null)
const mapRef = ref(null)
const map = ref(null)
const circle = ref(null)

// เพิ่ม ref สำหรับตำแหน่งที่เลือก
const selectedPosition = ref(null)

function onMapClick(event) {
    const latLng = event.latLng
    setMarker(latLng)
    console.log(result)
}

function clearPin() {
    // if (marker.value) {
    //     marker.value.setMap(null)
    //     marker.value = null
    // }
    console.log("before selectPos: ", selectedPosition.value)
    console.log("before marker: ", marker.value)
    selectedPosition.value = null
    marker.value.setMap(null)
    marker.value = null
    console.log("after selectPos: ", selectedPosition.value)
    console.log("after marker: ", marker.value)
}

function setMarker(position, title = 'Selected Location') {
    if (selectedPosition.value) return

    // ลบ marker เก่า
    // if (marker.value) {
    //     marker.value.setMap(null)
    //     marker.value = null
    // }

    // สร้าง marker ใหม่
    marker.value = new google.maps.Marker({
        position,
        map: map.value,
        title,
    })

    selectedPosition.value = {
        lat: position.lat(),
        lng: position.lng()
    }

    console.log("set selectPos: ", selectedPosition.value)
    console.log("set marker: ", marker.value)
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
    resultName.value = place.name
    resultAddress.value = place.formatted_address
    console.log(place.formatted_address)

    // showPlace.value = true
    map.value.panTo(location)
    setMarker(location, place.name)

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
                router.push({
                    path: `/places/add_place/${userId}`,
                    query: {
                        address: results[0].formatted_address,
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng()
                    }
                })
            }
        })
    }
}

function sendData() {
    if (!selectedPosition.value) {
        const service = new google.maps.places.PlacesService(map.value)
        const request = {
            query: searchQuery.value,
            fields: ['name', 'geometry', 'place_id'],
        }
        service.textSearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                router.push({
                    path: `/places/add_place/${userId}`,
                    query: {
                        address: results[0].formatted_address,
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng()
                    }
                })
            }
        })
    }

    router.push({
        path: `/places/add_place/${userId}`,
        query: {
            address: place.formatted_address,
            lat: selectedPosition.value.lat,
            lng: selectedPosition.value.lng
        }
    })
}

async function savePlace() {
    if (!form.placeName || !form.placeType) {
        alert('Please fill in place name and type')
        return
    }

    try {
        const response = await fetch(`${config.apiDomain}/places/add/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                name: name,
                address: address,
                type: type,
                remark: remark,
                lat: latitude,
                lng: longitude
            })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong')
        }

        alert('✅ Place saved successfully!')

    } catch (error) {
        console.error('❌ Error:', error)
        alert('❌ Failed to save place')
    }
}

async function deletePlace() {
    const confirmDelete = confirm('Are you sure you want to delete this place?')
    if (!confirmDelete) return
    console.log(placeId)
    try {
        const res = await fetch(`${config.apiDomain}/places/delete/${placeId}`, {
            method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete place')

        alert('Place deleted successfully')
        router.push(`/places/my_place/${userId}`)
    } catch (error) {
        console.error(error)
        alert('Error deleting place')
    }
}

function changeState() {
    showPlace.value = false;
    showResults.value = false;
}

function clearSearch() {
    if (searchQuery.value) searchQuery.value = ''
    showResults.value = false
}

onMounted(async () => {
    if (showP) {
        showPlace.value = true;
        showResults.value = false;
    }

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
            // showPlace.value = false
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
                    <img src="/image-icons/search.png" alt="search" class="w-4 h-5" />
                </span>

                <button @click="clearSearch" class="absolute top-0 right-3 text-sm bg-white pl-3 w-8 h-7 mt-2 z-5">
                    <img src="/image-icons/x.png" alt="clear search" class="w-3 h-3">
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

                            <button @click="sendData"
                                class="bg-blue-100 text-blue-500 rounded-full p-3 flex justify-center">
                                <img src="/image-icons/plus.png" alt="plus" class="w-4 h-4" />
                            </button>

                        </div>
                    </li>
                </ul>
            </div>
        </div>

        <!-- Map Section -->
        <div class="relative flex-1">
            <div ref="mapRef" style="width: 100%; height: 83vh;"></div>

            <!-- ปุ่มเลื่อนไปตำแหน่งปัจจุบัน -->
            <button @click="goToCurrentLocation"
                class="absolute top-3 right-2 bg-white p-2 rounded-full shadow-md text-blue-600 text-xl">
                📍
            </button>

            <button @click="clearPin"
                class="absolute top-15 right-2.5 bg-white p-3 rounded-full text-sm text-red-500 underline mt-2">
                <img src="/image-icons/x.png" alt="clear pin" class="w-4 h-4">
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
                <button @click="sendData" class="bg-blue-100 text-blue-500 rounded-full p-3 flex justify-center">
                    <img src="/image-icons/plus.png" alt="plus" class="w-4 h-4" />
                </button>
            </div>

            <NuxtLink :to="`/places/my_place/${userId}`">
                <button class="mt-10 w-full border-2 border-blue-400 text-blue-500 font-semibold py-2 rounded-xl">
                    Back to My Places
                </button>
            </NuxtLink>
        </div>

        <!-- Pin Result Place Section (ซ่อนเมื่อค้นหา) -->
        <div v-if="showPlace" class="absolute bottom-0 w-full bg-white rounded-t-3xl text-lg p-6 shadow-lg">
            <!-- <p class="font-bold mb-2">Result place</p> -->
            <div class="flex items-start justify-between">
                <div class="">
                    <p class="font-bold text-xl text-[#035CB2]">{{ name }}</p>
                    <p class="text-gray-500 truncate max-w-[220px]">{{ address }}</p>
                </div>

                <div class="flex items-start gap-2">
                    <img src="/image-icons/edit.png" alt="edit" class="bg-[#035CB2] w-9 h-9 p-2 rounded-full">
                    <button @click="deletePlace">
                        <img src="/image-icons/trash.png" alt="delete" class="bg-[#E24B4B] w-9 h-9 p-2 rounded-full">

                    </button>
                </div>
            </div>


            <div class="mt-2">
                <p class="font-bold">Place type</p>

                <div class="mt-1 px-4 py-1 bg-[#92DBFF] w-fit rounded-full text-sm">{{ type }}</div>
            </div>

            <div class="mt-2">
                <p class="font-bold">{{ remark }}</p>

                <P>Kisra</P>
            </div>

            <div class="flex justify-between gap-4 font-bold mt-6">
                <button type="button" @click="changeState"
                    class="flex justify-center w-full bg-white text-[#0198FF] border border-[#0198FF] py-3 rounded-2xl text-lg hover:bg-[#0198FF] hover:text-white transition">
                    Back
                </button>

                <button type="button" @click="savePlace"
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
