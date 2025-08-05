<script setup>
import { useRoute } from 'vue-router';

const route = useRoute()
const id = route.params.id

</script>

<template>
    <div class="min-h-screen w-full bg-white flex flex-col items-center text-[#035CB2]">
        <!-- กล่องรวม: ต้อง relative -->
        <div class="relative w-full h-64">
            <!-- รูป background อยู่ข้างล่าง -->
            <img src="/images/background.png" alt="Background Header"
                class="absolute inset-0 w-full h-full object-cover z-0" />

            <!-- กล่องเนื้อหาซ้อนทับ -->
            <div class="absolute inset-0 flex flex-col items-center justify-center z-10 gap-5">
                <h1 class="text-3xl font-bold text-outline-blue">Create Kid Profile</h1>

                <h3>Place QR code in frame or select photo</h3>
            </div>
        </div>

        <div class="">
            <p>qrcode</p>
        </div>

        <div class="flex justify-center w-full">
            <img src="/image-icons/qrcode.png" alt="qrcode" class="w-11 h-11 p-2 border-2 border-[#0198FF] rounded-md">
        </div>

        <div class="w-full px-7">
            <NuxtLink :to="`/kids/kid_create_profile/${id}`">
                <button type="submit"
                    class="flex justify-center py-3 w-full bg-white text-[#0198FF] font-bold border-2 border-[#0198FF] rounded-2xl  text-lg hover:bg-[#0198FF] hover:text-white transition">
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