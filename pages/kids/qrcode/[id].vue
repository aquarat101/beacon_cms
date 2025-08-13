<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const userId = route.params.id
const page = route.query.page

const selectedFile = ref(null)
const previewImage = ref(null)

function backPage() {
    if (page === "create") {
        router.push(`/kids/create/${userId}`)
    } else {
        router.push(`/kids/edit/${userId}`)
    }
}

function onFileChange(event) {
    const file = event.target.files[0]
    if (file) {
        selectedFile.value = file
        previewImage.value = URL.createObjectURL(file)
    }
}

function triggerFileInput() {
    document.getElementById('fileInput').click()
}

</script>

<template>
    <div class="min-h-screen w-full h-full  bg-white flex flex-col items-center text-[#035CB2] relative">
        <!-- ส่วนหัว -->
        <div class="relative w-full h-64">
            <img src="/images/background.png" alt="Background Header"
                class="absolute inset-0 w-full h-64 object-cover z-0" />

            <!-- ข้อความตรงกลาง -->
            <div class="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3">
                <h1 class="text-3xl font-bold text-outline-blue">Scan QR Code</h1>
                <h3 class="text-sm text-white">Place QR code in frame or select photo</h3>
            </div>
        </div>

        <!-- กล้องตรงกลาง / preview รูป -->
        <div class="flex justify-center items-center w-full h-full ">
            <div
                class="w-full h-110 m-10 border-4 border-dashed border-[#0198FF] flex items-center justify-center rounded-lg relative overflow-hidden">
                <!-- ถ้าเลือกไฟล์ ให้แสดง preview -->
                <img v-if="previewImage" :src="previewImage" alt="Selected"
                    class="object-contain max-h-full max-w-full" />
                <img v-else src="/image-icons/qrcode.png" alt="QR Code" class="w-12 h-12 opacity-50" />
            </div>
        </div>

        <div class="absolute bottom-32 right-10 z-20">
            <div class="cursor-pointer bg-white border-2 border-[#0198FF] text-[#0198FF] p-2 rounded-xl text-sm hover:bg-[#0198FF] hover:text-white transition flex items-center gap-2"
                @click="triggerFileInput">
                <img src="/image-icons/gallery.png" alt="gallery" class="w-10 h-10" />

                <!-- input ซ่อน -->
                <input id="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
            </div>
        </div>

        <!-- ปุ่ม Cancel -->
        <div class="absolute bottom-12 z-20 w-full px-7 mt-12">
            <button type="button" @click="backPage"
                class="flex justify-center py-3 w-full bg-white text-[#0198FF] font-bold border-2 border-[#0198FF] rounded-2xl text-lg hover:bg-[#0198FF] hover:text-white transition">
                Cancel
            </button>
        </div>
    </div>
</template>

<style>
.text-outline-blue {
    color: white;
    -webkit-text-stroke: 1.6px #035CB2;
}
</style>
