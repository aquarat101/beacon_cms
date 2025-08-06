<script setup>
import { useRoute } from 'vue-router';

const route = useRoute()
const id = route.params.id
</script>

<template>
    <div class="min-h-screen w-full h-full bg-white flex flex-col items-center text-[#035CB2] relative">
        <!-- ส่วนหัว -->
        <div class="relative w-full h-64">
            <img src="/images/background.png" alt="Background Header"
                class="absolute inset-0 w-full h-full object-cover z-0" />

            <!-- ข้อความตรงกลาง -->
            <div class="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3">
                <h1 class="text-3xl font-bold text-outline-blue">Create Kid Profile</h1>
                <h3 class="text-sm text-white">Place QR code in frame or select photo</h3>
            </div>
        </div>

        <!-- กล้องตรงกลาง -->
        <div class="flex justify-center items-center w-full h-full ">
            <div
                class="w-full h-110 m-10 border-4 border-dashed border-[#0198FF] flex items-center justify-center rounded-lg">
                <!-- ใส่ไอคอนกล้องหรือ QR -->
                <img src="/image-icons/qrcode.png" alt="QR Code" class="w-12 h-12 opacity-50" />
            </div>
        </div>

        <div class="absolute bottom-32 right-10 z-20">
            <div class="cursor-pointer bg-white border-2 border-[#0198FF] text-[#0198FF] p-2 rounded-xl text-sm hover:bg-[#0198FF] hover:text-white transition">
                <img src="/image-icons/gallery.png" alt="gallery" class="w10 h-10">
                <input type="file" accept="image/*" class="hidden" />
            </div>
        </div>

        <!-- ปุ่ม Cancel -->
        <div class="absolute bottom-12 z-20 w-full px-7 mt-12">
            <NuxtLink :to="`/kids/kid_create_profile/${id}`">
                <button type="submit"
                    class="flex justify-center py-3 w-full bg-white text-[#0198FF] font-bold border-2 border-[#0198FF] rounded-2xl text-lg hover:bg-[#0198FF] hover:text-white transition">
                    Cancel
                </button>
            </NuxtLink>
        </div>
    </div>
</template>

<style>
.text-outline-blue {
    color: white;
    -webkit-text-stroke: 1.6px #035CB2;
}
</style>
