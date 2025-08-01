<script setup>
import KidCard from '~/components/KidCard.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const id = route.params.id

const profile = ref(null)
const kids = ref([])
console.log(id)
async function fetchProfile() {
    try {
        const res = await fetch(`http://localhost:3001/users/${id}`)
        // if (!res.ok) throw new Error('Failed to fetch profile')
        const data = await res.json()
        console.log("data:", data)
        profile.value = data
    } catch (error) {
        console.error(error)
    }
}


// async function fetchKids() {
//     try {
//         const res = await fetch('http://localhost:3001/kids')
//         if (!res.ok) throw new Error('Failed to fetch kids')
//         const data = await res.json()
//         kids.value = data
//     } catch (error) {
//         console.error(error)
//     }
// }

onMounted(() => {
    fetchProfile()
    // fetchKids()
})
</script>

<template>
    <div class="min-h-screen bg-white flex flex-col items-center text-[#035CB2]">
        <!-- กล่องรวม: ต้อง relative -->
        <div class="relative w-full h-64">
            <!-- รูป background อยู่ข้างล่าง -->
            <img src="/images/background.png" alt="Register Header"
                class="absolute inset-0 w-full h-full object-cover z-0" />

            <!-- กล่องเนื้อหาซ้อนทับ -->
            <div class="absolute inset-0 flex flex-col items-start justify-center pl-10 z-10 gap-5">
                <h1 class="text-3xl font-bold text-outline-blue">Your Profile</h1>

                <button class="absolute top-15 right-7 bg-white text-black rounded-full p-2.5 pb-3 pl-3">
                    ✏️
                </button>

                <div class="flex flex-row gap-5">
                    <img src="/images/profile.png" alt="" class="w-20 h-20 bg-white rounded-full">

                    <div class="">
                        <p class="font-bold text-lg">{{ profile?.firstName }} {{ profile?.lastName }}</p>
                        <p class="text-sm">{{ profile?.email }}</p>
                        <p class="text-sm">{{ profile?.phone }}</p>

                    </div>
                </div>
            </div>
        </div>


        <!-- กล่องล่าง -->
        <div class="-mt-10 rounded-t-3xl bg-white px-8 py-6 w-full relative z-10">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold text-blue-800">All Kids</h2>
                <button class="bg-[#0198FF] text-white rounded-full w-8 h-8 text-4xl flex items-end justify-center">
                    +
                </button>
            </div>

            <!-- ทำแนวตั้งด้วย flex + scroll -->
            <div class="max-h-154 overflow-y-auto space-y-4 space-x-1.5">
                <KidCard v-for="kid in kids" :key="kid.id" :name="kid.name" :status="kid.status" :updated="kid.updated"
                    :avatar="kid.avatar" class="min-w-[200px] shrink-0" />
            </div>
        </div>

    </div>
</template>

<style>
.text-outline-blue {
    color: white;
    -webkit-text-stroke: 1.6px #035CB2;
}
</style>