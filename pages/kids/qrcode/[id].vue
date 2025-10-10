<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import jsQR from 'jsqr'

const route = useRoute()
const router = useRouter()
const userId = route.params.id
const kidId = route.query.kidId
const page = route.query.page
const name = route.query.name || ""
const beaconId = route.query.beaconId || ""
const remark = route.query.remark || ""

const videoRef = ref(null)
const canvasRef = ref(null)
const previewImage = ref(null)
const scanning = ref(true)
const processingQR = ref(false)
const qrResult = ref("")
const loadingPage = ref(true)

let videoStream = null
let scanAnimationFrame = null

function backPage() {
    if (page === "create") {
        router.push(`/kids/kid_create_profile/${userId}`)
        router.push({
            path: `/kids/kid_create_profile/${userId}`,
            query: {
                name: name,
                beaconId: beaconId,
                remark: remark
            }
        })
    } else {
        router.push(`/kids/kid_edit_profile/${userId}/${kidId}`)
    }
}

function onFileChange(event) {
    const file = event.target.files[0]
    if (file) {
        previewImage.value = URL.createObjectURL(file)
        scanning.value = false
        stopCamera()
        scanQRCodeFromFile(file)
    }
}

function triggerFileInput() {
    document.getElementById('fileInput').click()
}

async function startCamera() {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        videoRef.value.srcObject = videoStream
        videoRef.value.setAttribute('playsinline', true) // iOS
        await videoRef.value.play()
        scanning.value = true
        loadingPage.value = false // โหลดเสร็จ
        scanFrame()
    } catch (err) {
        console.error('Camera error:', err)
        scanning.value = false
        loadingPage.value = false
    }
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop())
        videoStream = null
    }
    if (scanAnimationFrame) cancelAnimationFrame(scanAnimationFrame)
}

function scanFrame() {
    if (!videoRef.value || !scanning.value) return

    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')
    canvas.width = videoRef.value.videoWidth
    canvas.height = videoRef.value.videoHeight
    ctx.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    if (code) {
        scanning.value = false
        processingQR.value = true
        qrResult.value = code.data // ผลลัพธ์
        stopCamera()
        previewImage.value = canvas.toDataURL('image/png')
        setTimeout(() => { processingQR.value = false }, 2000)
    } else {
        scanAnimationFrame = requestAnimationFrame(scanFrame)
    }
}

function scanQRCodeFromFile(file) {
    processingQR.value = true
    const img = new Image()
    img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        if (code) {
            qrResult.value = code.data
        } else {
            qrResult.value = "No QR code found"
        }
        processingQR.value = false
    }
    img.src = URL.createObjectURL(file)
}

onMounted(() => {
    startCamera()
})

onBeforeUnmount(() => {
    stopCamera()
})
</script>

<template>
    <div class="min-h-screen w-full h-full bg-white flex flex-col items-center text-[#035CB2] relative">

        <!-- Loading หน้า -->
        <div v-if="loadingPage" class="fixed inset-0 bg-gray-400 bg-opacity-40 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center space-y-4">
                <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-lg font-semibold text-[#035CB2]">Loading...</p>
            </div>
        </div>

        <!-- Header -->
        <div class="relative w-full h-48">
            <img src="/images/background.png" alt="Background Header"
                class="absolute inset-0 w-full h-full object-cover z-0" />
            <div class="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3">
                <h1 class="text-3xl font-bold text-outline-blue">Scan QR Code</h1>
                <h3 class="text-md text-white">Place QR code in frame or select photo</h3>
            </div>
        </div>

        <!-- Camera / Preview เต็มจอจริง -->
        <div class="absolute inset-0 top-48 border-t-4 border-dashed border-[#0198FF] overflow-hidden">
            <video v-if="scanning" ref="videoRef" class="object-cover w-full h-full" autoplay playsinline></video>
            <img v-if="previewImage && !scanning" :src="previewImage" class="object-contain w-full h-full" />
            <canvas ref="canvasRef" class="hidden"></canvas>

            <!-- Gallery Button -->
            <div class="absolute bottom-32 right-6">
                <div @click="triggerFileInput"
                    class="cursor-pointer bg-white border-2 border-[#0198FF] p-2 rounded-xl hover:bg-[#0198FF] hover:text-white transition flex items-center gap-2">
                    <img src="/image-icons/gallery.png" alt="gallery" class="w-10 h-10" />
                    <input id="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
                </div>
            </div>

            <!-- Cancel Button -->
            <div class="absolute bottom-6 w-full px-6">
                <button type="button" @click="backPage"
                    class="w-full py-3 bg-white text-[#0198FF] font-bold border-2 border-[#0198FF] rounded-2xl hover:bg-[#0198FF] hover:text-white transition">
                    Cancel
                </button>
            </div>
        </div>


        <!-- QR Processing Popup -->
        <div v-if="processingQR" class="fixed inset-0 bg-gray-400 bg-opacity-40 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center space-y-4">
                <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-lg font-semibold text-[#035CB2]">
                    {{ qrResult ? qrResult : 'Scanning...' }}
                </p>
            </div>
        </div>
    </div>
</template>
