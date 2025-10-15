<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import KidCard from '~/components/KidCard.vue'
import HistoryCard from '~/components/HistoryCard.vue'

const route = useRoute()
const router = useRouter()
const { public: config } = useRuntimeConfig()

// route params
const userId = route.params.userId
const kidId = route.params.id
const placeId = route.query.placeId || "placeId"
const status = route.params.status

// query params
const name = route.query.name
const address = ref(route.query.address || "Loading...")
const backAddress = address.value
const check = ref(route.query.check)
const type = ref(route.query.type)
const remark = route.query.remark
const showP = route.query.status
const latitude = route.query.lat
const longitude = route.query.lng
const noPin = route.query.state || true
const openDetail = route.query.openDetail || ""

// search & place
const searchQuery = ref('')
const searchResults = ref([])

const showPlace = ref(false)
const showResults = ref(false)
const showKidDetail = ref(false)
const showPlaceDetail = ref(false)
const showDeleteKidModal = ref(false)
const showDeletePlaceModal = ref(false)

// map & markers
const currentLocationMarker = ref(null)
const selectedMarker = ref(null)
const circle = ref(null)
const mapRef = ref(null)
const map = ref(null)

// UI state
const isClearing = ref(false)
const isInputFocused = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)

const loadingPage = ref(true)

const completed = ref(false)
const selectedPosition = ref(null)

const distance = ref(route.query.distance) || "No distance"
const lastLat = route.query.lastLat
const lastLng = route.query.lastLng

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
    if (!lastLat || !lastLng) return

    if (!navigator.geolocation) {
        console.warn('Geolocation not supported')
        return
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude
            const lng = pos.coords.longitude
            const dist = calculateDistance(
                Number(lastLat),
                Number(lastLng),
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
    // 🔹 คำนวณระยะทางตอนโหลด
    computeDistanceFromDevice()
})

const activeTab = ref('map') // default tab

function switchTab(tab) {
    activeTab.value = tab
    if (tab === 'map') router.push(`/map_beacons/${userId}/${0}`)
    if (tab === 'profile') router.push(`/users/user_profile/${userId}`)
}

const beaconId = ref("")
const kid = ref(null)

async function fetchKid() {
    try {
        const res = await fetch(`${config.apiDomain}/kids/getKid/${userId}/${kidId}`)
        if (!res.ok) throw new Error('Failed to fetch kid')
        const data = await res.json()
        kid.value = data
        beaconId.value = kid.value.beaconId
        // fetchZoneHits()
    } catch (error) {
        console.error(error)
    } finally {
        loadingKid.value = false
    }
}

// kids data
const kids = ref([])  // ✅ เพิ่ม kids list

async function fetchKids() {
    try {
        const res = await fetch(`${config.apiDomain}/kids/getUserKids/${userId}`)
        if (!res.ok) throw new Error('Failed to fetch kids')
        const data = await res.json()
        kids.value = data.kids.sort((a, b) => b.createdAt._seconds - a.createdAt._seconds)

    } catch (error) {
        console.error(error)
    }
}

async function deleteKid() {
    try {
        isDeleting.value = true

        const res = await fetch(`${config.apiDomain}/kids/delete/${kidId}`, {
            method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete kid')

        completed.value = true
        setTimeout(() => {
            completed.value = false
            router.push(`/map_beacons/${userId}/${0}`)
        }, 800)

    } catch (error) {
        console.error(error)
        alert('Error deleting kid')
    } finally {
        isDeleting.value = false
        showDeleteKidModal.value = false
    }
}

function confirmDeleteKid() {
    showDeleteKidModal.value = true
}

const userPlace = ref()  // list ของ places ของ user

async function fetchUserPlace() {
    try {
        const res = await fetch(`${config.apiDomain}/places/getPlace/${userId}/${placeId}`)
        if (!res.ok) throw new Error('Failed to fetch places')
        const data = await res.json()
        userPlace.value = data || null
        console.log(data)
    } catch (err) {
        console.error('Fetch user places error:', err)
    }
}

const userPlaces = ref([])  // list ของ places ของ user

async function fetchUserPlaces() {
    try {
        const res = await fetch(`${config.apiDomain}/places/get/${userId}`)
        if (!res.ok) throw new Error('Failed to fetch places')
        const data = await res.json()
        userPlaces.value = data || []
    } catch (err) {
        console.error('Fetch user places error:', err)
    }
}

async function deletePlace() {
    try {
        isDeleting.value = true

        const res = await fetch(`${config.apiDomain}/places/delete/${placeId}`, {
            method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete place')

        // alert('Place deleted successfully')

        completed.value = true
        setTimeout(() => {
            completed.value = false
            router.push(`/map_beacons/${userId}/${0}`)
        }, 800)

        // router.push(`/places/my_place/${userId}`)
    } catch (error) {
        console.error(error)
        alert('Error deleting place')
    } finally {
        isDeleting.value = false
        showDeletePlaceModal.value = false
    }
}

function confirmDeletePlace() {
    showDeletePlaceModal.value = true
}

const Histories = ref([])
const loadingKid = ref(true)
const loadingHistories = ref(true)
const isLoading = computed(() => loadingKid.value || loadingHistories.value)

async function fetchZoneEvents() {
    if (!beaconId.value) {
        Histories.value = []
        loadingHistories.value = false
        return
    }

    try {
        const [eventsRes, placesRes] = await Promise.all([
            fetch(`${config.apiDomain}/beacons/getZoneEvents/${beaconId.value}/${userId}`),
            fetch(`${config.apiDomain}/places/get/${userId}`)
        ])

        const eventsJson = await eventsRes.json()
        const placesJson = await placesRes.json()

        const events = eventsJson.data || []
        const places = placesJson || []

        // 🔹 สร้าง map ของ placeId → type
        const placeTypeMap = {}
        places.forEach(p => {
            if (p.id || p.placeId) {
                placeTypeMap[p.id || p.placeId] = p.type || 'other'
            }
        })

        // 🔹 แปลงข้อมูลให้อยู่ในรูปพร้อมแสดง
        Histories.value = events.map((item, index) => {
            const date = item.timestamp?._seconds
                ? new Date(item.timestamp._seconds * 1000)
                : null
            const dateStr = date
                ? date.toLocaleString('th-TH', {
                    day: '2-digit', month: '2-digit', year: '2-digit',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                })
                : '-'

            const placeType = placeTypeMap[item.zoneId] || 'other'
            console.log("EVENT TYPE : ", item.eventType)
            const eventLabel = item.eventType === 'hit' ? 'inside' :
                item.eventType === 'exit' ? 'outside' : 'Nowhere'

            return {
                id: index + 1,
                place: item.zoneName || '-',
                type: placeType || 'Other',
                event: eventLabel,
                date: dateStr
            }
        })

        console.log("Histories value : ", Histories.value)

        // 🔹 อัปเดตข้อมูลล่าสุดใน kid
        if (Histories.value.length > 0) {
            const first = events[0]
            const latestPlaceType = placeTypeMap[first.zoneId] || 'other'
            type.value = latestPlaceType
            kid.value.updated = Histories.value[0].date
        }

    } catch (error) {
        console.error('Fetch zone events error:', error)
    } finally {
        loadingHistories.value = false
    }
}


// watcher for selectedPosition to update marker
watch(selectedPosition, (val) => {
    if (isClearing.value || noPin === 'false') return

    if (val) {
        setMarker(new google.maps.LatLng(val.lat, val.lng), val.address || 'Selected Location')
    } else if (selectedMarker.value) {
        selectedMarker.value.setMap(null)
        selectedMarker.value = null
    }
})

// set marker function
async function setMarker(position, title = 'Selected Location') {
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
    }
}

// load Google Maps
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

// go to current location
async function goToCurrentLocation() {
    let userLocation = {}
    const lat = Number(latitude)
    const lng = Number(longitude)

    if (!map.value) return
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                if (noPin === "false" || check.value) {
                    userLocation = { lat, lng }
                } else {
                    userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    }
                    try {
                        const geoResult = await reverseGeocode(position.coords.latitude, position.coords.longitude)
                        address.value = geoResult.formatted_address
                    } catch {
                        address.value = 'Unable to find address'
                    }
                }

                const projection = map.value.getProjection()
                if (projection) {
                    const point = projection.fromLatLngToPoint(
                        new google.maps.LatLng(userLocation.lat, userLocation.lng)
                    )
                    const scale = Math.pow(2, map.value.getZoom())
                    const pixelOffset = -120 / scale
                    const newPoint = new google.maps.Point(point.x, point.y - pixelOffset)
                    const newLatLng = projection.fromPointToLatLng(newPoint)
                    map.value.panTo(newLatLng)
                } else {
                    map.value.panTo(userLocation)
                }

                map.value.setZoom(14)

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

// reverse geocode
async function reverseGeocode(lat, lng) {
    const geocoder = new google.maps.Geocoder()
    return new Promise((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) resolve(results[0])
            else reject(status)
        })
    })
}

// search
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

// เพิ่มตัวแปรเพื่อเก็บข้อมูล place ที่เลือก
const selectedPlace = ref(null)

// ฟังก์ชันปิดรายละเอียด
function closeDetail() {
    showKidDetail.value = false
    showPlaceDetail.value = false
    selectedPlace.value = null
}

// After map is initialized
function addKidMarkers() {
    if (!map.value || !kids.value.length) {
        console.log("FAIL")
        return
    }

    kids.value.forEach(kid => {
        if (!kid.lastLat || !kid.lastLng) return
        const marker = new google.maps.Marker({
            position: { lat: Number(kid.lastLat), lng: Number(kid.lastLng) },
            map: map.value,
            title: kid.name,
            zIndex: 100,
            icon: {
                url: kid.avatarUrl || '/image-avatars/1.png', // avatar icon
                scaledSize: new google.maps.Size(40, 40),
            },
        })

        marker.addListener('click', () => {
            // ✅ เมื่อคลิก marker ให้ไปอีกหน้า
            // ส่ง place.id หรือ object เป็น params / query
            router.push({
                path: `/map_beacons/${userId}/${kid.id}`, // ชื่อ route
                query: {
                    lastLat: kid.lastLat,
                    lastLng: kid.lastLng,
                    openDetail: "openKidDetail"
                }
            }).then(() => {
                // รีโหลดหน้าใหม่หลัง navigation
                window.location.reload();
            });
        });
    })
}

function addPlaceMarker(place) {
    if (!map.value || !place) return;

    // กำหนดสี background และ Base64 ของ icon ตาม type
    let bgColor = '#C3EBFF';
    let iconBase64 = ''; // default

    switch ((place.type || '').toLowerCase()) {
        case 'home':
            bgColor = '#035CB2';
            iconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAASTSURBVHgB7Z3xkdM6EMY3b97/L3TgqwBeBS9XAY8KgAoOKoipgLsKDipgqCB0AFQgU8EdFXxokRkCWJZkS1o72d/MTm5MJNn6HO1qJRsiRVEURVEURVEURVEU5VzY0MoAsLMfD61dWPunP/zVmrH2ebPZfIis56n9uLa2pTg6a62t/y2dG7azGmvX1u4Qxli75TKBOg3SuaNzwl7w1tprTOfWJwScoMnQuWCvdYdpd+nvGLhha6iNFonQOWCv8wr52XvaeoQEoemUgRtyblEOHs62A+2yjzExFdCp0nfCR5THYIZfoFMEbryPiXByYTDRL9CpgTLjfSzJfoFOBZQf72NJ8gt0CqDeeB+LQaRfoLWD+uN9LAYRfoHWDGTH+1hG/QKtESxnvI/F6xcoM8Wzof1Jv7P2iNZFZ+3SZj87KshfVBC4MfUj5ev8e2s31p5Yu9j0kEtNX1rjVHFHeWisHeDxC4sHecd7dtrt0LDgaTs5yRZgT2sB+cd7gwljLxLyO5EM+oVFgfzxvcEMx4f8IhgUcMRZQJn4vqGZwImQ87wMluYXUCa+bykTyO8TGHm/gHLxvQm0y7+2A37e2fz308B5lph9y/kFlM3n3I60ux8ptx8pN2kNOAKD2n4B5fM5O0+7z2aU/R/lMKjlF1Ann9N42j5ElD14yjYoTzm/gIr5nJFziOFuZvm5JPmFqFwQKudz+vTC0Hlw5wYvbqR8rXRyR5F5pGAuCPnzOUHgd2qfKMyHxDpL0FBkHmlUAFvBFVdE8fsnc/HQc/wVhXnjOd5QXRpyIkzzC5DN31+PnNfYpKodKfcGcrymxM6fsx8zBxzibkfOj8PRw9F3+e9d4JoMZGkpQYAlrNnGn3D4evaQZzA6S12Q4QWRS6oDzzcamklfR0t14L7pUgr4BLgZOMYRyL+xD0BkgIegA2amo8kFEVXo+8Ynwg2lgJ8PRPyxGoW6GCxjQSbIUds8af2l/3znOWlR/rixivDjQcEwFO5G4fD5BVUOn30TwNEyNAEhAZiO3ETr++L7j5lm/wvhieLOGqelRVLE5yDAopkiQNFtKUoYFUAYFUCYv2m5dNbek5t/sPEk8N4Os/ehgr1TZkfMnztrj6l+Mq4cKItBgeU9uCVJg4LQBJYWBfGdfhlzl08Bbo7AM+MiaxtrD0M7cqmOIp3/g14EXmBqKDNrD0Nflu58pm/jOS2EpfwCeFZ7QRWB2/zVUEbW/At47/sHuFz+oXegMesUd/13uczVlDZrspQw1LeXhxNqLaWxpaMQ1NbxwN6Y7cD3Yhb4i7OUX8AXz/HHNJ//PMdVgCN8zreh+TSU1mZVFiHAyAamHGllXx2LEGARUVDpnWy1dsppOnqFqADCqADCqADCqADCqADCqADCqADCqADCqADCqADCqADCqADCqADCqADCqADCqADCqADCqADCqADCeAXod6QN7kSjzPi2uFEmStcfaIf70PuuCN9uAS7wgpScvBraoTfrxUhKEvx0z4PfD6oPECblXRHKPAb/E1DvTi64lyaJPXV+Qnx/5b5nh7aiKIqiKFJ8A4gH/Fn2JTZJAAAAAElFTkSuQmCC';
            break;
        case 'school':
            bgColor = '#0099FF';
            iconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAATnSURBVHgB7Z3tceM2EIZXmSvA6YCpIE4FkStIUoHVga+D01VwvgokV5BLBdBV4KQCMhWcO3ize6BiS0OQAAjwc5+ZHf0wQEHvEsDi00SKoiiKoiiKoiiKoijKWtjQTACw5Y9f2W5ru6lNeGGr6s+vbKfNZnMipR8iOtsj2zeEU7Id2ApSwqiFN0jHAbYGKW1kEP4aw3ZPyiUsyg55hb+mXL0jWIAbtg+1GGNRYm2OwKvwMR1rLkrYMhW0VDBN4a8psbTISX4M2xHTFr6JA+bsCOSPaIbigIyO+IHyIaPSJ7YvNG92bCXsy7SlxAwyFVG/QYatoPlTse15quOJEjDYXBA7QeZtxAm3tAwqSuCIQSfjaic80zJqwpmKbc/2FzvjhQIZfDa0bkcNLY+K7cj2xI6ofDONMh0tHRp/bGmZVGx/sBP+9kmcLArC5dSx2KeW5Ek6sIlSsBkMNYZAe7y/d+QpsHy8mtmoJgi2M31ge0+vq1JNvHBV/NHxDNDyuetamXtHAcBWKxFdZhBvSOlCdDq1JfByQC38vn5gCE+O5y1lLNDFtitBZyfMYklTI7F7iPgSD3/k6vfe8fe1OKDoStBaA1j8A9m5EF9E+M9sjx2Dkt9IaYfF/+Tf4X+Pgn73fO4aIqAzz116vHOItCPb2XZxJDvyO3mkfTsftBb+7UrgaoI+uLN4NzMXvBG/oPXwJ4UCO7ByVilEjPDqZ5ZYF6WPNk1RkKstr8gOLCoKE17e+rW9+dIy3PkkbGqCfnak3fs0ObBNjYSsO1pPuPmWiuxkXOWTuMkBrhHuP9QCbNMkwndNTyyVqL4xxAGND4Wd35dOe0vrJEr4M00OKJoStlSpgtbVvp+pqMdKmBNXl+6Rb4d1RDoGOXdau741IP9S9gNdYzDEFnfXt1MgeN0RN3cMhjxb4CoFRYJ5OkKWVA8YY2uiq0TUE7w6osR0EeH3sGOZQdg0CNUoNvf0SXZQwL5VO7JjhoKmQa9QMimuV4MygPEjpxIDv/GduEoakL+gQDC8IwwiTsZgCEe5ShyY/4B4RxjkwyAiooENrY8hOkTjKnlk/kPfHzwB4U2MDtG4fkHP/AZxVb5P5CQRzWMq4UN18CV5FNRRyIoit3TXQorJdQXSFhd0eVWBmOzHlFnbqKsKYJdi76llYjFVNNhWiBw14JoSEzkeisDjspSbvl+MMEq2B4ww4kTkqU3KTd8vRhwlBhr6o+dxWcqNo2DfAvL35YAMjuBn3iL+5pX/odzAjgyveQzInwrDdo8ezoB92x+QcGxBidk4Ci6CnzvJz9zx78mTHIUkG918v4iJ6suZrlfoakdJVHS+0Ol8uVNSUkdByUOqTA6YDKkdkPOgtuKBOmBk1AEjow4YmRwOGHdFaWaoA8LwOnwdQg4HfKXlMgsHHGm5fKHEZJnbhj2cUNCykNH3T5SYXFHQR1oee8pAFgfwm3KkZV3IcUx1Q9Y12ZbXsJwbsqTjvcu1YSvbQEwKzPYL2R1nc0XKnk38wYBdDCkxHwyWeNs6pn+Iw2AN19xjeo4wWONt6hj+2vom4be0dmD7iJRbEds4H77YknIJ7FZEqRXPSI+BXaDXm758qJ3Rd0eDgd3lUdBEmcW/sarf2i3ZQZ1cpVCQe2+oXBFzIrs/VNcmFEVRFEVRFEVRFEVRlMnwHyQO/3dDnGR8AAAAAElFTkSuQmCC';
            break;
        case 'work':
            bgColor = '#92DBFF';
            iconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAKuSURBVHgB7d3vbdswFATwaydwJqg2SEbQCN2gK7QTRJ2gzQidoN0g6ARtJog3SDZw+RALKRxLIhmSR4b3Ax4C+EP05ySKegRsQEREREREevMO7du5+ujqytWH418zIK29q8dj3bn64+r38fMu2Ym/dvXg6kCsb+iUXYGHSsr2ZYeO2FVXy8mfa0InBtR38q1sKAy+C96jPSPqNE8GgryFWdBs+O+vnQybDV3iKbBS4/ONq8+QF+zK/In8w9AvyKrR1T3yBXAP2WTDUa67QQEEyBWCeLI7wa5YagApZkGlejFb9gjv1YyubpFWsZllLb2Yrdrq1dwm3l4xNfVitmqtVzMm3lYRNfZitmpaOZ6Ud3F2A5BsZ0vWWq8m5YwoSEwvaESb1no1dyCJCeAK7Vra9z1IYgK4RLuGhc//giQmgJZXfpYunkeQ5Azgq6sLPL2Y5Czbxhd0xGcmwOiJT3jdLIUyC4rhsxOMYWqHBgNocUnyTckVAGMI+oRO+N6KFkKJoWhuCr52iKAMQTGt0+CNVGbpmFMdV9A51TOATAGQKQAyBUCmAMhyBqBeUCa+7wClTWjwPSCGz06oF+RJzwAy9YIa5HsrqhfkQb2gZ+oF9UgBkCkAMgVApgDI1AtqkO87QGkTGnwPiOGzE+oFedIzgEy9oAb53orqBXlQL+iZekE9UgBkCoBMAZApADIFQKYAyBQAmQIgUwBkCoBMAZApALKaApjXkLtb4w11yFDnFnCmTNvKfVxBalkPsKv+9CtjbKHlAelVtR5QSwC5T0rJbWlBpiUKgEwBkCkAMgVApgDIFACZAiBbC+Aa579VPIckr/WVbOv0/9o5DP69yRa/nr72mnDG0mtz1M/yySrrdV2cfqhnANlSADeQ1H4g0HfU/wM9LZSdwwkiIiJSl39/fHX0ImecQAAAAABJRU5ErkJggg==';
            break;
        case 'other':
        default:
            bgColor = '#C3EBFF';
            iconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAS1SURBVHgB7Z3hceM2EIVfMvkfpwOkgqiDsIO4A2w6uA7EDu46sDq46wBJBb4O4FTgSwUMMRYnZ90NAWJ3CcDEN/NGtodaLt6jKREkJaDT6XQ6nU6n0+kcjR+gz90sM+s06+dZv14f7270NQY6PK38Hn7+Z9bz9fHpqi9QRCOAYOb9rN9nDdAzcy8+X/XXrL/xbYjVMMxys6Y3LjfLoiIGHMP4W/nr2IvyHm2ZpqEzChD28w7tmiYth2/fSKji0L5pGiHswhnA1PVdvYcyA4Cpa1UDFPEApq5VOShBAKauJA1QwAGYupLkkEjqVITBy+6nk84vSJhH+hFpDOhs5ZSy0E9IY4A8YesIk1yf8P8k17LFhIOaMIDfruu+R1v8iZfJOzEeIbd/DNO9I7YdOZrrc7xgH1oiCHMHueY+gnfIbmZdBPup3vzACTLNjZBjFOqpevMD9+A3N0KeERAxrmrzA+/Aa26EHh8ATIVFUGZEfnMeutyh7AszRfozEOCC/AYt9BkATAVEkb7C2B8ggENegz6xftiKzzfrecS28J7BM1PD/LDcJwjgkNfkh4TaBuu7EI+0f+Mxs0dN84McBHDIa3RIqO0T6oRlYscOA/J61DQ/6BECpJj0PcVMow21xkgtg7weNc1fNh42HnkNx9gyveES6tVmfvUBlK6nbX7xAGK7IMkAJOerpMwXCyC3eROp6zbUir2YSc1XSZqfsuEkoTWAcUMtG6klMV+lYX7RAGLHAanTCB5xJOeEKLIuu7Eem9yBuITaBjIHYlInjCiyHptRkw1nQKknXwivTXRIP2tmwOtR0/ziAYzQhztdrml+8QCeoY8Hr0eK1LfM+mwmpiz0IPB6o0h9y6xfRQAeetfOe0ZfFKltGbWrCiBI47LtM6MfitS2jNpVBhA0QA7OkS9FaltG7aoD8JA5R2qQv+uhSG2bWbeJAILCe33O6wHnJDxFatvMuk0FsIRgsB2D/CNeitS2mXWbDCDIY1sIJ7S35VcdwKIz1ndJyxUTufUJ61hG7TcRwPLfcMbr6+lP179xLjchrGMZtd9UABoirGN37IXN1JhofTi7mh8NIPUWpVYId6ZcIsvs8RlJokyNiJAO7dgXm6kBEbZDO/XGxmOfRvc0f4EU+5pQ+LqgGsy3iJ+PIOj15yGAh16D2uYvy5YKwUMAr9TcXuaXDMFDAMl7hEuZXyoEBwGccFOlzC8RgoMAHwUbKm3+3iE4CHARaqYW8/cM4QEClL4XlyL9WUZt7RBGCCBx5VmN5u8RwjsIQIwGajdfO4Q/IIDGzQ81ma8ZQtKHNsXQuv2nJvO1QhC7ItAjf1CtmC8dgsg9wgsX5A+oJfMlQ3iAIASwBtSS+VIhxJ6/Cc3XAYqs2yquWzMEA2EcjmU+JwQHBQYcz/zcEGLLZ+NwPPO3huChyIBjmr8lhAHKcCbnKFLbMmrXEsIuOBzT/GpC2PolPhSpZ5FvxmFDCIw4pvlVhbB28wRFnmvRpvFBDpV9rD/h9W6JIstbtGd6lcbfYhCfB7dox3CPl4k1gsIN5yUu1Q6DCDdum6/+Zm6WMdDh6eb3Lzf6Fy+Gh8fP2OHrbDudTqfT6XQ6nc7x+A/EGdoKQs32ywAAAABJRU5ErkJggg==';
            break;
    }

    // สร้าง SVG inline แบบ Base64
    const svgIcon = `
    <svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="28" fill="${bgColor}" />
      <image href="data:image/png;base64,${iconBase64}" x="15" y="15" height="30" width="30"/>
    </svg>`;

    const svgUrl = 'data:image/svg+xml;base64,' + btoa(svgIcon);

    const marker = new google.maps.Marker({
        position: { lat: Number(place.lat), lng: Number(place.lng) },
        map: map.value,
        title: place.name,
        zIndex: 1,
        icon: {
            url: svgUrl,
            scaledSize: new google.maps.Size(30, 30),
        },
    });

    // ✅ เมื่อคลิก marker ให้ไปอีกหน้า
    marker.addListener('click', () => {
        // ส่ง place.id หรือ object เป็น params / query
        router.push({
            path: `/map_beacons/${userId}/${0}`, // ชื่อ route
            query: {
                placeId: place.id,
                openDetail: "openPlaceDetail"
            }
        }).then(() => {
            // รีโหลดหน้าใหม่หลัง navigation
            window.location.reload();
        });
    });
}

// mounted
onMounted(async () => {
    await fetchKid()
    await fetchKids()
    await fetchZoneEvents()
    await fetchUserPlace()
    await fetchUserPlaces()

    // if (showP || status) showPlace.value = true

    if (openDetail === "openKidDetail") {
        showKidDetail.value = true
        showPlace.value = false
    } else if (openDetail === "openPlaceDetail") {
        showKidDetail.value = false
        showPlaceDetail.value = true
    } else {
        showKidDetail.value = false
        showPlaceDetail.value = false
    }

    try {
        loadingPage.value = true

        const googleMaps = await loadGoogleMaps(config.googleMapsApiKey)
        map.value = new google.maps.Map(mapRef.value, {
            center: { lat: 13.7563, lng: 100.5018 },
            zoom: 14,
            styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }],
            gestureHandling: 'greedy',      // ✅ ให้ลาก, pinch, scroll ได้เต็มที่
            draggable: true,                // ✅ เปิดการลาก map
            scrollwheel: true,              // ✅ ให้ scroll zoom ได้
            disableDoubleClickZoom: false,  // ✅ เปิด double click zoom
            mapTypeControl: false,          // ❌ ปิด map type control
            streetViewControl: false,       // ❌ ปิด street view
        })

        goToCurrentLocation()

        addKidMarkers()

        userPlaces.value.forEach(place => addPlaceMarker(place))

    } catch (error) {
        console.error(error)
    } finally {
        loadingPage.value = false
    }
})


const sheetRef = ref(null)
const translateY = ref(100) // start ย่อ
const startY = ref(0)
const sheetStart = ref(0)
const minTranslate = -70   // สูงสุดที่ลากขึ้น
const maxTranslate = 100   // ต่ำสุดที่ลากลง

function onDragStart(e) {
    startY.value = e.touches[0].clientY
    sheetStart.value = translateY.value
}

function onDrag(e) {
    const dy = e.touches[0].clientY - startY.value
    let newY = sheetStart.value + dy
    newY = Math.max(minTranslate, Math.min(maxTranslate, newY))
    translateY.value = newY
}

function onDragEnd() {
    // snap: ถ้าลากเกินครึ่ง ให้เลื่อนเต็ม
    translateY.value = translateY.value < (minTranslate + maxTranslate) / 2 ? minTranslate : maxTranslate
}

</script>

<template>
    <div class="flex flex-col min-h-screen bg-white">

        <!-- Loading overlay -->
        <div v-if="isLoading" class="fixed inset-0 bg-gray-400 bg-opacity-40 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center space-y-4">
                <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-lg font-semibold text-[#035CB2]">Loading...</p>
            </div>
        </div>

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

        <!-- Completed popup -->
        <div v-if="completed" class="fixed inset-0 bg-gray-400 bg-opacity-40 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center space-y-4">
                <div class="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-lg font-semibold text-[#20854f]">Completed!!</p>
            </div>
        </div>

        <div v-show="!loadingPage">
            <!-- Map Section -->
            <div class="relative flex-1">
                <div ref="mapRef" style="width: 100%; height: 83vh;"></div>
                <!-- <img v-show="!showPlace" src="/image-icons/piyopin.png" alt="pin point"
                    class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-13 h-13"> -->
                <button v-if="!showPlace" @click="goToCurrentLocation"
                    class="absolute top-3 right-2 bg-white p-2 rounded-full shadow-md text-blue-600 text-xl">📍</button>
            </div>

            <!-- All kid Section -->
            <!-- Bottom Sheet -->
            <div v-if="!showKidDetail && !showPlaceDetail" ref="sheetRef"
                class="absolute bottom-0 left-0 w-full h-screen bg-white rounded-t-2xl transition-transform duration-200 ease-out"
                :style="{ transform: `translateY(${translateY}px)`, maxHeight: '100vh', height: 'auto' }"
                @touchstart="onDragStart" @touchmove.prevent="onDrag" @touchend="onDragEnd">

                <!-- Drag handle -->
                <div class="h-3"></div>
                <div class="w-30 h-2 bg-gray-300 rounded-full mx-auto mb-2"></div>

                <!-- Header -->
                <div class="flex items-center justify-between px-6">
                    <h2 class="text-2xl font-bold text-blue-800">All Kids</h2>
                    <NuxtLink
                        :to="{ path: `/kids/kid_create_profile/${userId}`, query: { map_beacons: 'map_beacons' } }">
                        <button class="bg-[#035CB2] text-white rounded-full w-8 h-8 flex items-center justify-center">
                            <img src="/image-icons/plus.png" alt="create kid" class="w-4 h-4">
                        </button>
                    </NuxtLink>
                </div>

                <!-- Kids list -->
                <div class="p-4 overflow-y-auto space-y-3" style="max-height: calc(70vh - 80px)">
                    <template v-if="kids.length">
                        <KidCard v-for="kid in kids.slice(0, 4)" :key="kid.id" :userId="userId" :id="kid.id"
                            :name="kid.name" :status="kid.status" :updated="kid.updated" :avatarUrl="kid.avatarUrl"
                            :lastLat="kid.lastLat" :lastLng="kid.lastLng" :zoneId="kid.lastZoneId"
                            :lastOfflineAt="kid.lastOfflineAt" state="kidDetail" />
                    </template>
                    <p v-else class="mt-2 text-gray-500 text-center">No kids data</p>
                </div>

            </div>


            <!-- Kid's Detail Section -->
            <div v-if="showKidDetail" class="absolute bottom-0 w-full z-50">
                <div ref="sheetRef" class="w-full bg-white rounded-t-2xl transition-transform duration-200 ease-out"
                    :style="{ transform: `translateY(${translateY}px)`, maxHeight: '100vh', height: 'auto' }"
                    @touchstart="onDragStart" @touchmove.prevent="onDrag" @touchend="onDragEnd">

                    <!-- drag handle -->
                    <div class="h-3"></div>
                    <div class="w-30 h-2 bg-gray-300 rounded-full mx-auto mb-2"></div>

                    <!-- header -->
                    <div class="flex items-center justify-between px-6">
                        <div class="">
                            <div class="flex items-center gap-2">
                                <h2 class="text-2xl font-bold text-blue-800"> {{ kid.name }} </h2>
                                <div class="w-3 h-3 rounded-full"
                                    :class="kid?.status === 'online' ? 'bg-green-500' : 'bg-gray-400'"></div>
                                <div class="-ml-1 text-md"
                                    :class="kid?.status === 'online' ? 'text-green-600' : 'text-gray-600'">
                                    {{ kid?.status === 'online' ? 'Now' : 'Out' }}
                                </div>
                            </div>
                            <p>{{ distance }}</p>
                        </div>

                        <NuxtLink :to="`/map_beacons/${userId}/${0}`">
                            <button class="text-white rounded-full w-8 h-8 flex items-center justify-center"
                                @click="closeDetail">
                                <img src="/image-icons/cancel.png" alt="cancel" class="w-full h-full">
                            </button>
                        </NuxtLink>
                    </div>

                    <!-- content -->
                    <div class="px-6 pt-3 overflow-y-auto" style="max-height: calc(80vh - 100px)">
                        <p class="text-gray-500">Beacon ID</p>
                        <p>{{ kid.beaconId }}</p>

                        <div class="h-2"></div>

                        <p class="text-gray-500">Remark</p>
                        <p>{{ kid.remark }}</p>

                        <div class="flex flex-col mt-2">
                            <div class="flex justify-between">
                                <p class="text-blue-800 text-xl font-bold">Place History</p>
                                <div class="text-blue-500 text-md underline" @click="router.push({
                                    path: `/kids/kid_profile/${userId}/${kidId}`,
                                    query: { map_beacons: 'map_beacons' }
                                })">
                                    See All
                                </div>
                            </div>

                            <div v-if="Histories.length === 0" class="flex justify-center text-gray-500 mt-5">
                                <p>No place history</p>
                            </div>
                            <div v-else class="max-h-64 overflow-y-auto space-y-4 mt-2">
                                <HistoryCard v-for="history in Histories.slice(0, 3)" :key="history.id"
                                    :placeType="history.type" :date="history.date" :state="history.event" />
                            </div>
                        </div>

                        <div class="flex justify-between gap-3 mt-3">
                            <button @click="confirmDeleteKid"
                                class="w-1/3 px-4 py-2 rounded-lg border-2 border-red-400 text-red-500 font-normal">
                                Delete
                            </button>

                            <button @click="() => router.push({
                                path: `/kids/kid_edit_profile/${userId}/${kidId}`,
                                query: { map_beacons: 'map_beacons' }
                            })" class="w-2/3 px-4 py-2 rounded-lg bg-blue-500 text-white font-normal">
                                Edit Profile
                            </button>
                        </div>

                        <div class="h-5"></div>
                    </div>
                </div>
            </div>

            <!-- Place's Detail Section -->
            <div v-if="showPlaceDetail && !showKidDetail" class="fixed bottom-0 w-full z-50"> <!-- sheet container -->
                <div class='bg-white p-5 rounded-t-3xl shadow-lg'> <!-- แถวชื่อ + ปุ่ม -->
                    <div class="flex items-center justify-between gap-4">
                        <p class="font-bold text-2xl text-[#035CB2] break-words flex-1 min-w-0"> {{ userPlace.name }}
                        </p>
                        <NuxtLink :to="`/map_beacons/${userId}/${0}`"> <button
                                class=" text-white rounded-full w-8 h-8 flex items-center justify-center"
                                @click="closeDetail"> <img src="/image-icons/cancel.png" alt="create kid"
                                    class="w-full h-full"> </button> </NuxtLink>

                    </div> <!-- แถว address เต็มแนวนอน -->
                    <p class="mt-3 font-semibold text-gray-600">Address</p>
                    <div class="w-fit text-sm">
                        <p class="break-words w-full mt-2 line-clamp-3"> {{ userPlace.address }} </p>
                    </div>

                    <div class="mt-2">
                        <p class="font-semibold text-gray-600">Place type</p>
                        <div class="mt-1 px-4 py-1 bg-[#92DBFF] w-fit rounded-full text-sm"> {{ userPlace.type }} </div>
                    </div>

                    <div class="mt-2">
                        <p class="font-semibold text-gray-600">Remark</p>
                        <p>{{ userPlace.remark }}</p>
                    </div>

                    <div class="flex justify-between gap-3 mt-6"> <button @click="confirmDeletePlace"
                            class="w-1/3 px-4 py-2 rounded-lg border-2 border-red-400 text-red-500 font-normal"> Delete
                        </button>

                        <button
                            @click="() => router.push({ path: `/places/add_place / ${userId} / ${placeId}`, query: { name: userPlace.name, address: userPlace.address, type: userPlace.type, remark: userPlace.remark, lat: userPlace.latitude, lng: userPlace.longitude, status: true, map_beacons: 'map_beacons' } })"
                            class="w-2/3 px-4 py-2 rounded-lg bg-blue-500 text-white font-normal"> Edit place </button>
                    </div>

                    <div class="h-20"> </div>
                </div>
            </div>

        </div>

        <transition name="fade" enter-active-class="transition ease-out duration-55"
            enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-55" leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95">
            <div v-if="showDeleteKidModal" class="fixed inset-0 flex items-center justify-center z-50">
                <!-- overlay โปร่งบาง ไม่บัง map มาก -->
                <div class="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>

                <!-- modal ลอยหน้า overlay -->
                <div class="relative bg-white rounded-2xl shadow-lg p-6 w-80 flex flex-col items-center space-y-4 z-10">
                    <p class="text-lg font-semibold text-gray-800 text-center">
                        Are you sure you want to delete this kid?
                    </p>
                    <div class="flex gap-4 w-full">
                        <button @click="showDeleteKidModal = false"
                            class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-xl hover:bg-gray-300">
                            Cancel
                        </button>
                        <button @click="deleteKid"
                            class="flex-1 bg-red-500 text-white py-2 rounded-xl hover:bg-red-600">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </transition>

        <transition name="fade" enter-active-class="transition ease-out duration-55"
            enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-55" leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95">
            <div v-if="showDeletePlaceModal" class="fixed inset-0 flex items-center justify-center z-50">
                <!-- overlay โปร่งบาง ไม่บัง map มาก -->
                <div class="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>

                <!-- modal ลอยหน้า overlay -->
                <div class="relative bg-white rounded-2xl shadow-lg p-6 w-80 flex flex-col items-center space-y-4 z-10">
                    <p class="text-lg font-semibold text-gray-800 text-center">
                        Are you sure you want to delete this place?
                    </p>
                    <div class="flex gap-4 w-full">
                        <button @click="showDeletePlaceModal = false"
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

        <!-- Floating bottom tab -->
        <div
            class="fixed bottom-5 left-1/2 -translate-x-1/2 bg-blue-200 backdrop-blur-md shadow-lg rounded-full flex justify-between items-center px-2 py-2 w-80 border border-blue-200 z-50">
            <!-- Map Tab -->
            <button @click="switchTab('map')"
                class="flex-1 mx-2 rounded-full flex items-center justify-center gap-3 px-6 py-3 transition-all duration-200"
                :class="activeTab === 'map' ? 'bg-white text-[#035CB2] font-semibold text-lg' : 'text-gray-500 text-lg'">
                <img src="/image-icons/map_pointer.png" alt="map" class="w-6 h-6"
                    :class="activeTab === 'map' ? 'opacity-100' : 'opacity-60'" />
                <span class="text-base font-medium">Map</span>
            </button>

            <!-- Profile Tab -->
            <button @click="switchTab('profile')"
                class="flex-1 mx-2 rounded-full flex items-center justify-center gap-3 px-6 py-3 transition-all duration-200"
                :class="activeTab === 'profile' ? 'bg-[#035CB2] text-white font-semibold text-lg' : 'text-gray-500 text-lg'">
                <img src="/image-icons/profile.png" alt="profile" class="w-6 h-6 bg-blue-400 rounded-full"
                    :class="activeTab === 'profile' ? 'opacity-100' : 'opacity-60'" />
                <span class="text-base font-medium">Profile</span>
            </button>
        </div>
    </div>
</template>

<style scoped>
/* ป้องกันไม่ให้ text หรือ scroll ภายในดึงแทน */
.fixed {
    touch-action: none;
}
</style>