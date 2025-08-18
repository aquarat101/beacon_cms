<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { public: config } = useRuntimeConfig()

const userId = route.params.userId
const placeId = route.params.placeId || "placeId"
const status = route.params.status

const name = route.query.name
const address = ref(route.query.address || "Loading...")
const type = route.query.type
const remark = route.query.remark
const showP = route.query.status
const latitude = route.query.lat
const longitude = route.query.lng
const noPin = route.query.state || true

const searchQuery = ref('')
const showPlace = ref(false)
const showResults = ref(false)
const searchResults = ref([])

const currentLocationMarker = ref(null)  // หมุดตำแหน่งปัจจุบันสีน้ำเงิน
const selectedMarker = ref(null)         // หมุดตำแหน่งที่เลือก สีแดง
const circle = ref(null)

const mapRef = ref(null)
const map = ref(null)

const isClearing = ref(false)
const isInputFocused = ref(false)
const loadingPage = ref(true)
const isSaving = ref(false)

const selectedPosition = ref(null)

// ปรับ onMapClick เรียกฟังก์ชันนี้แทน
// function onMapClick(event) {
//     const latLng = event.latLng
//     updateSelectedPosition(latLng)
// }

// watcher ดู selectedPosition เพื่อสร้าง marker เท่านั้น (ไม่แก้ค่า selectedPosition ในนี้)
watch(selectedPosition, (val) => {
    if (isClearing.value || noPin === 'false') return

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
        // console.log('Created new selectedMarker', selectedMarker.value)
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
    let userLocation = {}
    const lat = Number(latitude)
    const lng = Number(longitude)
    // console.log(latitude, longitude)

    if (!map.value) return
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {

                // const userLocation = ({})
                // console.log("noPin : ", noPin)
                if (noPin === "false") {
                    userLocation = {
                        lat: lat,
                        lng: lng,
                    }
                } else {
                    userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    }

                    // console.log(position.coords.latitude, position.coords.longitude)
                    try {
                        const geoResult = await reverseGeocode(position.coords.latitude, position.coords.longitude)
                        address.value = geoResult.formatted_address
                        // console.log(address.value)
                    } catch (err) {
                        address.value = 'Unable to find address'
                    }
                }

                // ✅ แปลงตำแหน่งให้เลื่อนขึ้นไปบนจอ
                const projection = map.value.getProjection()
                if (projection) {
                    const point = projection.fromLatLngToPoint(
                        new google.maps.LatLng(userLocation.lat, userLocation.lng)
                    )
                    // console.log(position.coords.latitude, position.coords.longitude)
                    // ขยับขึ้น (ค่า y น้อยลง) เช่น 100 พิกเซล
                    const scale = Math.pow(2, map.value.getZoom())
                    const pixelOffset = -120 / scale // แปลงพิกเซลเป็นหน่วย world coordinates
                    const newPoint = new google.maps.Point(point.x, point.y - pixelOffset)

                    const newLatLng = projection.fromPointToLatLng(newPoint)
                    map.value.panTo(newLatLng)
                } else {
                    map.value.panTo(userLocation)
                }

                map.value.setZoom(14)

                // สร้างหรือย้ายหมุดตำแหน่งปัจจุบัน (สีน้ำเงิน)
                if (currentLocationMarker.value) {
                    currentLocationMarker.value.setPosition(userLocation)
                    // console.log(userLocation.lat, userLocation.lng)

                } else {
                    currentLocationMarker.value = new google.maps.Marker({
                        position: userLocation,
                        map: map.value,
                        title: 'Current Location',
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: '#4285F4',  // สีน้ำเงิน
                            fillOpacity: 0.8,
                            strokeColor: 'white',
                            strokeWeight: 2,
                        },
                    })
                }

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

// ฟังก์ชันสำหรับกด enter ในช่อง search ให้แผนที่ไปตำแหน่งนั้น
async function handleEnterKey(event) {
    if (event.key === 'Enter' && searchQuery.value.trim()) {
        try {
            const res = await fetch(`${config.apiDomain}/places/searchPlaces/search?query=${encodeURIComponent(searchQuery.value)}`)
            const data = await res.json()

            if (data.results && data.results.length > 0) {
                const place = data.results[0]  // ใช้ผลลัพธ์แรกเหมือนเดิม
                const location = place.geometry.location

                router.push({
                    path: `/places/add_place/${userId}/${placeId}`,
                    query: {
                        address: place.formatted_address,
                        lat: location.lat,
                        lng: location.lng,
                        status: false
                    }
                })

            } else {
                alert('No results found')
            }
        } catch (err) {
            console.error('Search error:', err)
        }
    }
}

async function selectPlace(place) {
    console.log('INTO CLICK SEARCH')
    const location = place.geometry.location

    try {
        router.push({
            path: `/places/add_place/${userId}/${placeId}`,
            query: {
                address: place.formatted_address,
                lat: location.lat,
                lng: location.lng,
                status: false
            }
        })
    } catch (e) {
        console.log(e)
    }

}

function sendData() {
    let addr = ""
    let lt = ""
    let lg = ""
    if (selectedPosition.value === null) {
        addr = address.value
        lt = latitude
        lg = longitude
    } else {
        addr = selectedPosition.value.address
        lt = selectedPosition.value.lat
        lg = selectedPosition.value.lng
    }
    router.push({
        path: `/places/add_place/${userId}/${placeId}`,
        query: {
            address: addr,
            lat: lt,
            lng: lg,
            status: false
        }
    })
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
async function savePlace() {
    console.log("INTO SAVE PLACE")
    if (!name || !type) {
        alert('Please fill in place name and type')
        return
    }

    try {
        isSaving.value = true

        const response = await fetch(`${config.apiDomain}/places/add/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                name: name,
                address: address.value,
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

        // alert('✅ Place saved successfully!')

        router.push({
            path: `/places/my_place/${userId}`
        })

    } catch (error) {
        console.error('❌ Error:', error)
        alert('❌ Failed to save place')
    } finally {
        isSaving.value = false  // ปิด loading
    }
}

function backToAddPlace() {
    // console.log("backToAddPlace : false")
    router.push({
        path: `/places/add_place/${userId}/${placeId}`,
        query: {
            name: name,
            address: address.value,
            type: type,
            remark: remark,
            lat: latitude,
            lng: longitude,
            status: false,
        }
    })
}

function clearSearch() {
    if (searchQuery.value) searchQuery.value = ''
    showResults.value = false
}

onMounted(async () => {
    console.log("INTO [USERID]")
    // console.log(showP, status, showPlace.value)
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
            zoom: !showPlace.value ? 14 : 17,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            rotateControl: false,
            scaleControl: false,
            draggable: !showPlace.value,
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

        if (!showPlace.value) {
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
            map.value.addListener('idle', async () => {
                const markerPos = selectedMarker.value.getPosition() // เอาตำแหน่งหมุดจริง
                try {
                    const geoResult = await reverseGeocode(markerPos.lat(), markerPos.lng())
                    address.value = geoResult.formatted_address
                    selectedPosition.value = {
                        lat: markerPos.lat(),
                        lng: markerPos.lng(),
                        address: geoResult.formatted_address
                    }
                } catch (err) {
                    address.value = 'Unable to find address'
                }
            })

            goToCurrentLocation()
        }


    } catch (error) {
        console.error(error)
    } finally {
        loadingPage.value = false
    }
})

</script>

<template>
    <div class="flex flex-col min-h-screen bg-[#E0F3FF]">

        <!-- Loading overlay -->
        <transition name="fade">
            <div v-if="loadingPage || isSaving"
                class="fixed inset-0 bg-gray-400 bg-opacity-40 flex items-center justify-center z-50">
                <div class="bg-white rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center space-y-4">
                    <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin">
                    </div>
                    <p class="text-lg font-semibold text-[#035CB2]">{{ isSaving ? 'Saving...' : 'Loading map...' }}</p>
                </div>
            </div>
        </transition>

        <div v-show="!loadingPage">
            <!-- Header -->
            <div v-if="!showPlace" class="px-4 pt-4 pb-2 text-center bg-[#92DBFF]">
                <p class="text-2xl font-bold text-outline-blue">Drag the map or search location name</p>

                <!-- Search Input -->
                <div class="mt-3 mb-4 mx-4 relative">
                    <input v-model="searchQuery" @keydown.enter.prevent="handleEnterKey" type="text"
                        placeholder="Search location" @focus="isInputFocused = true" @blur="isInputFocused = false"
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
                </div>

            </div>

            <!-- Map Section -->
            <div class="relative flex-1">
                <div ref="mapRef" style="width: 100%; height: 83vh;"></div>

                <img src="/image-icons/piyopin.png" alt="pin point"
                    class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-13 h-13">

                <!-- ปุ่มเลื่อนไปตำแหน่งปัจจุบัน -->
                <button @click="goToCurrentLocation"
                    class="absolute top-3 right-2 bg-white p-2 rounded-full shadow-md text-blue-600 text-xl">
                    📍
                </button>

                <!-- <button @click.stop="clearPin"
                class="absolute top-15 right-2.5 bg-white p-3 rounded-full text-sm text-red-500 underline mt-2">
                <img src="/image-icons/x.png" alt="clear pin" class="w-4 h-4">
            </button> -->
            </div>

            <!-- Pin Place Section (ซ่อนเมื่อค้นหา) -->
            <div v-if="!showResults && !showPlace && !isInputFocused"
                class="fixed bottom-0 left-0 w-full bg-white text-xl rounded-t-3xl p-6 shadow-lg">
                <p class="font-bold mb-2 text-[#035CB2] text-3xl">Pin place</p>
                <div class="flex items-center justify-between space-x-4">
                    <div class="flex-1 min-w-0">
                        <p class="font-semibold whitespace-normal break-words">
                            {{ selectedPosition && selectedPosition.address ? selectedPosition.address : address }}
                        </p>
                    </div>
                    <button @click="sendData"
                        class="bg-[#035CB2] text-blue-500 rounded-full p-3 flex justify-center flex-shrink-0">
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
                    <div>
                        <p class="font-bold text-3xl text-[#035CB2]">{{ name }}</p>
                        <p class="text-gray-700 break-words w-full">
                            {{ address }}
                        </p>
                    </div>
                </div>

                <div class="mt-2">
                    <p class="font-bold">Place type</p>
                    <div class="mt-1 px-4 py-1 bg-[#92DBFF] w-fit rounded-full text-md">{{ type }}</div>
                </div>

                <div class="mt-2">
                    <p class="font-bold">Remark</p>
                    <p>{{ remark }}</p>
                </div>

                <div class="flex justify-between gap-4 font-bold mt-6">
                    <button type="button" @click="backToAddPlace"
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

    </div>
</template>

<style scoped>
.text-outline-blue {
    color: white;
    -webkit-text-stroke: 1.6px #035CB2;
}
</style>
