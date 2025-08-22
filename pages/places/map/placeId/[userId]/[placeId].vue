<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { public: config } = useRuntimeConfig()

const userId = route.params.userId
const placeId = route.params.placeId || null
const status = route.params.status

const name = route.query.name
const address = ref(route.query.address || 'Loading...')
const type = route.query.type
const remark = route.query.remark
const showP = route.query.status
let latitude = route.query.lat
let longitude = route.query.lng

const searchQuery = ref('')
const showPlace = ref(false)
const showResults = ref(false)
const searchResults = ref([])

const currentLocationMarker = ref(null)
const selectedMarker = ref(null)
const circle = ref(null)

const mapRef = ref(null)
const map = ref(null)

const isMoving = ref(false)
const isClearing = ref(false)
const isInputFocused = ref(false)
const loadingPage = ref(true)
const isUpdating = ref(false)
const isDeleting = ref(false)
const showDeleteModal = ref(false)

const selectedPosition = ref(null)

// watcher ดู selectedPosition เพื่อสร้าง marker เท่านั้น (ไม่แก้ค่า selectedPosition ในนี้)
watch(selectedPosition, (val) => {
    if (isClearing.value) return

    if (val) {
        setMarker(new google.maps.LatLng(val.lat, val.lng), val.address || 'Selected Location')
    } else {
        if (selectedMarker.value) {
            selectedMarker.value.setMap(null)
            selectedMarker.value = null
        }
    }
})

async function setMarker(position, title = 'Selected Location') {
    // console.log('Set marker at', position)
    if (selectedMarker.value) {
        selectedMarker.value.setPosition(position)
        selectedMarker.value.setTitle(title)
    } else {
        selectedMarker.value = new google.maps.Marker({
            position,
            map: map.value,
            title,
            icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            },
        })
        console.log('Created new selectedMarker', selectedMarker.value)
    }
}

function loadGoogleMaps(apiKey) {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            resolve(window.google.maps)
            return
        }
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`
        script.async = true
        script.onload = () => resolve(window.google.maps)
        script.onerror = () => reject('Failed to load Google Maps API')
        document.head.appendChild(script)
    })
}

async function goToCurrentLocation() {
    const lat = Number(latitude)
    const lng = Number(longitude)

    if (!map.value) return

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: lat,
                    lng: lng,
                }

                if (isMoving.value) {
                    console.log("isMoving : ", isMoving.value)
                    // ✅ แปลงตำแหน่งให้เลื่อนขึ้นไปบนจอ
                    const projection = map.value.getProjection()
                    if (projection) {
                        const point = projection.fromLatLngToPoint(
                            new google.maps.LatLng(userLocation.lat, userLocation.lng)
                        )
                        // ขยับขึ้น (ค่า y น้อยลง) เช่น 100 พิกเซล
                        const scale = Math.pow(2, map.value.getZoom())
                        const pixelOffset = -120 / scale // แปลงพิกเซลเป็นหน่วย world coordinates
                        const newPoint = new google.maps.Point(point.x, point.y - pixelOffset)

                        const newLatLng = projection.fromPointToLatLng(newPoint)
                        map.value.panTo(newLatLng)
                    } else {
                        map.value.panTo(userLocation)
                    }

                    return
                }

                // ✅ แปลงตำแหน่งให้เลื่อนขึ้นไปบนจอ
                // const projection = map.value.getProjection()
                // if (projection) {
                //     const point = projection.fromLatLngToPoint(
                //         new google.maps.LatLng(userLocation.lat, userLocation.lng)
                //     )
                //     // ขยับขึ้น (ค่า y น้อยลง) เช่น 100 พิกเซล
                //     const scale = Math.pow(2, map.value.getZoom())
                //     const newPoint = new google.maps.Point(point.x, point.y - pixelOffset)

                //     const newLatLng = projection.fromPointToLatLng(newPoint)
                //     map.value.panTo(newLatLng)
                // } else {
                //     map.value.panTo(userLocation)
                // }

                map.value.panTo(userLocation)
                map.value.setZoom(14)

                // 🔵 หมุดตำแหน่งปัจจุบัน
                if (currentLocationMarker.value) {
                    currentLocationMarker.value.setPosition(userLocation)
                } else {
                    currentLocationMarker.value = new google.maps.Marker({
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
                }

                // 🔵 วงกลม
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


async function reverseGeocode(lat, lng) {
    const geocoder = new google.maps.Geocoder()
    return new Promise((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
                resolve(results[0])
            } else {
                reject(status)
            }
        })
    })
}

async function handleEnterKey(event) {
    if (event.key === 'Enter' && searchQuery.value.trim()) {
        try {
            const res = await fetch(`${config.apiDomain}/places/searchPlaces/search?query=${encodeURIComponent(searchQuery.value)}`)
            const data = await res.json()

            if (data.results && data.results.length > 0) {
                const place = data.results[0]  // ใช้ผลลัพธ์แรกเหมือนเดิม
                const location = place.geometry.location

                selectedPosition.value = {
                    lat: location.lat,
                    lng: location.lng,
                    address: place.formatted_address
                }

                latitude = location.lat
                longitude = location.lng
                address.value = place.formatted_address

                showResults.value = false
                showPlace.value = true
                isMoving.value = true
                clearSearch()
                goToCurrentLocation()
            } else {
                alert('No results found')
            }
        } catch (err) {
            console.error('Search error:', err)
        }
    }
}

function selectPlace(place) {
    const location = place.geometry.location

    selectedPosition.value = {
        lat: location.lat,
        lng: location.lng,
        address: place.formatted_address
    }

    latitude = location.lat
    longitude = location.lng
    address.value = place.formatted_address

    showResults.value = false
    showPlace.value = true
    isMoving.value = true
    clearSearch()
    goToCurrentLocation()
}


watch(searchQuery, async (val) => {
    if (!val.trim()) {
        showResults.value = false
        return
    }

    try {
        const res = await fetch(`${config.apiDomain}/places/searchPlaces/search?query=${encodeURIComponent(val)}`)
        const data = await res.json()
        if (data.results && data.results.length > 0) {
            searchResults.value = data.results.slice(0, 5)
            showResults.value = true
        } else {
            searchResults.value = []
            showResults.value = false
        }
    } catch (err) {
        console.error('Search error:', err)
        searchResults.value = []
        showResults.value = false
    }
})

async function updatePlace() {
    if (selectedPosition.value) {
        latitude = selectedPosition.value.lat
        longitude = selectedPosition.value.lng
        address.value = selectedPosition.value.address
    }

    try {
        isUpdating.value = true

        const response = await fetch(`${config.apiDomain}/places/update/${placeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                name: name,
                address: address.value,
                type: type,
                remark: remark,
                lat: latitude.toString(),
                lng: longitude.toString(),
            })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong')
        }

        router.push({
            path: `/places/my_place/${userId}`
        })

    } catch (error) {
        console.error('❌ Error updating place:', error)
        alert('❌ Failed to update place')
    } finally {
        isUpdating.value = false
    }
}

function toAddPlacePage() {
    console.log("toAddPlacePage : true")
    router.push({
        path: `/places/add_place/${userId}/${placeId}`,
        query: {
            name: name,
            address: address.value,
            type: type,
            remark: remark,
            lat: latitude,
            lng: longitude,
            status: true,
        }
    })
}

async function deletePlace() {
    try {
        isDeleting.value = true

        const res = await fetch(`${config.apiDomain}/places/delete/${placeId}`, {
            method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete place')

        // alert('Place deleted successfully')
        router.push(`/places/my_place/${userId}`)
    } catch (error) {
        console.error(error)
        alert('Error deleting place')
    } finally {
        isDeleting.value = false
        showDeleteModal.value = false
    }
}

function confirmDeletePlace() {
    showDeleteModal.value = true
}

function changeState() {
    router.push(`/places/my_place/${userId}`)
}

function clearSearch() {
    if (searchQuery.value) searchQuery.value = ''
    showResults.value = false
}

onMounted(async () => {
    console.log("INTO [USERID/PLACEID]")
    if (showP || status) {
        // console.log(status)
        showPlace.value = true;
        showResults.value = false;
    }

    try {
        const googleMaps = await loadGoogleMaps(config.googleMapsApiKey)

        const initialCenter = { lat: 13.7563, lng: 100.5018 }

        map.value = new googleMaps.Map(mapRef.value, {
            center: initialCenter,
            zoom: 17,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            rotateControl: false,
            scaleControl: false,
            draggable: false,
            keyboardShortcuts: false,
            gestureHandling: 'greedy',
            styles: [
                {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }]
                }
            ]
        })

        // ✅ สร้างหมุดกลาง map ครั้งเดียว
        selectedMarker.value = new googleMaps.Marker({
            position: initialCenter,
            map: map.value,
            icon: {
                url: '', // รูปใน public folder
                scaledSize: new google.maps.Size(50, 50), // ปรับขนาด icon
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(20, 40) // จุดยึด icon
            }
        })

        // ✅ อัปเดตตำแหน่งหมุดให้ตรง center map เสมอ
        map.value.addListener('center_changed', () => {
            const projection = map.value.getProjection()
            if (!projection) return

            const center = map.value.getCenter()
            const point = projection.fromLatLngToPoint(center)

            // ขยับ marker ขึ้น 50px
            const scale = Math.pow(2, map.value.getZoom())
            const pixelOffset = 120 / scale
            const newPoint = new google.maps.Point(point.x, point.y - pixelOffset)

            const newLatLng = projection.fromPointToLatLng(newPoint)
            selectedMarker.value.setPosition(newLatLng)
        })


        // ✅ เมื่อหยุดเลื่อน map ให้อัปเดต address จากตำแหน่งหมุด (offset แล้ว)
        // map.value.addListener('idle', async () => {
        //     const markerPos = selectedMarker.value.getPosition() // เอาตำแหน่งหมุดจริง
        //     try {
        //         const geoResult = await reverseGeocode(markerPos.lat(), markerPos.lng())
        //         address.value = geoResult.formatted_address
        //         selectedPosition.value = {
        //             lat: markerPos.lat(),
        //             lng: markerPos.lng(),
        //             address: geoResult.formatted_address
        //         }
        //     } catch (err) {
        //         address.value = 'Unable to find address'
        //     }
        // })

        goToCurrentLocation()

    } catch (error) {
        console.error(error)
    } finally {
        loadingPage.value = false
    }
})

</script>

<template>
    <div class="flex flex-col min-h-screen bg-[#E0F3FF]">

        <!-- Loading / Updating / Deleting overlay -->
        <transition name="fade">
            <div v-if="loadingPage || isUpdating || isDeleting"
                class="fixed inset-0 bg-gray-400 bg-opacity-40 flex items-center justify-center z-50">
                <div class="bg-white rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center space-y-4">
                    <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
                        v-if="!isDeleting">
                    </div>
                    <div class="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"
                        v-if="isDeleting">
                    </div>
                    <p class="text-lg font-semibold text-[#035CB2]">
                        {{ isUpdating ? 'Updating...' : isDeleting ? 'Deleting...' : 'Loading map...' }}
                    </p>
                </div>
            </div>
        </transition>

        <transition name="fade" enter-active-class="transition ease-out duration-55"
            enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-55" leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95">
            <div v-if="showDeleteModal" class="fixed inset-0 flex items-center justify-center z-50">
                <!-- overlay โปร่งบาง ไม่บัง map มาก -->
                <div class="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>

                <!-- modal ลอยหน้า overlay -->
                <div class="relative bg-white rounded-2xl shadow-lg p-6 w-80 flex flex-col items-center space-y-4 z-10">
                    <p class="text-lg font-semibold text-gray-800 text-center">
                        Are you sure you want to delete this place?
                    </p>
                    <div class="flex gap-4 w-full">
                        <button @click="showDeleteModal = false"
                            class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-xl hover:bg-gray-300">
                            Cancel
                        </button>
                        <button @click="deletePlace"
                            class="flex-1 bg-red-500 text-white py-2 rounded-xl hover:bg-red-600">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </transition>

        <div v-show="!loadingPage">
            <!-- Header -->
            <div class="px-4 pt-7 pb-2 text-center bg-[#92DBFF] h-23">
                <p class="text-3xl font-bold text-outline-blue">Place Detail</p>

                <!-- Search Input -->
                <!-- <div class="mt-3 mb-4 mx-4 relative">
                    <input v-model="searchQuery" @keydown.enter.prevent="handleEnterKey" type="text"
                        placeholder="Search location" @focus="isInputFocused = true" @blur="isInputFocused = false"
                        class="w-full rounded-full px-4 pl-10 py-2 text-xl shadow-sm bg-white border border-white placeholder-gray-400" />
                    <span class="absolute left-4 top-3.5 text-gray-400">
                        <img src="/image-icons/search.png" alt="search" class="w-4 h-5" />
                    </span>

                    <button @click="clearSearch" class="absolute top-0 right-3 text-sm bg-white pl-3 w-8 h-7 mt-2 z-5">
                        <img src="/image-icons/x.png" alt="clear search" class="w-3 h-3">
                    </button>
                </div> -->

                <!-- Search Results -->
                <!-- <div v-if="showResults"
                    class="absolute top-35 left-0 right-0 mt-3 w-full text-left text-lg bg-white rounded-xl p-4 shadow z-50">
                    <p class="font-bold mb-2 text-gray-700">Results for "{{ searchQuery }}"</p>
                    <ul class="text-gray-800">
                        <li v-for="place in searchResults" :key="place.place_id" @click.stop="selectPlace(place)"
                            class="cursor-pointer hover:bg-gray-100 transition-colors duration-150 p-2 rounded-lg">
                            <div class="flex justify-between items-center space-x-4">
                                <p class="truncate flex-1">📍 {{ place.name }}</p>
                                <button @click.stop="selectPlace(place)"
                                    class="bg-[#035CB2] text-blue-500 rounded-full p-2 flex items-center justify-center flex-shrink-0">
                                    <img src="/image-icons/plus.png" alt="plus" class="w-4 h-4" />
                                </button>
                            </div>
                        </li>
                    </ul>
                </div> -->
            </div>

            <!-- Map Section -->
            <div class="relative flex-1">
                <div ref="mapRef" style="width: 100%; height: 56vh;"></div>

                <!-- <img src="/image-icons/piyopin.png" alt="pin point"
                    class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-13 h-13"> -->

                <!-- ปุ่มเลื่อนไปตำแหน่งปัจจุบัน -->
                <button @click="goToCurrentLocation"
                    class="absolute top-3 right-2 bg-white p-2 rounded-full shadow-md text-blue-600 text-xl">
                    📍
                </button>
            </div>

            <!-- Pin Result Place Section (ซ่อนเมื่อค้นหา) -->
            <div v-if="showPlace && !showResults && !isInputFocused"
                class="fixed bottom-0 left-0 w-full bg-white rounded-t-3xl p-6 shadow-lg">

                <!-- แถวชื่อ + ปุ่ม -->
                <div class="flex items-center justify-between gap-4">
                    <p class="font-bold text-2xl text-[#035CB2] break-words flex-1 min-w-0">
                        {{ name }}
                    </p>
                    <div class="flex items-center gap-2 flex-shrink-0">
                        <button @click="toAddPlacePage">
                            <img src="/image-icons/edit.png" alt="edit" class="bg-[#035CB2] w-9 h-9 p-2 rounded-full">
                        </button>
                        <button @click="confirmDeletePlace">
                            <img src="/image-icons/trash.png" alt="delete"
                                class="bg-[#E24B4B] w-9 h-9 p-2 rounded-full">
                        </button>
                    </div>
                </div>

                <!-- แถว address เต็มแนวนอน -->
                <p class="font-semibold break-words w-full mt-2 line-clamp-3">
                    {{ address }}
                </p>

                <div class="mt-2">
                    <p class="font-bold">Place type</p>
                    <div class="mt-1 px-4 py-1 bg-[#92DBFF] w-fit rounded-full text-sm">
                        {{ type }}
                    </div>
                </div>

                <div class="mt-2">
                    <p class="font-bold">Remark</p>
                    <p>{{ remark }}</p>
                </div>

                <div class="flex gap-4 font-bold mt-6">
                    <button type="button" @click="changeState"
                        class="flex justify-center w-full bg-white text-[#0198FF] border border-[#0198FF] py-3 rounded-2xl text-lg hover:bg-[#0198FF] hover:text-white transition">
                        Back
                    </button>
                    <!-- <button type="button" @click="updatePlace"
                        class="flex justify-center w-full bg-[#0198FF] text-white py-3 rounded-2xl text-lg hover:bg-[#0198FF] transition">
                        Save
                    </button> -->
                </div>
            </div>
        </div>
    </div>
</template>