<script setup>
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'
// import liff from '@line/liff'

import KidCard from '~/components/KidCard.vue'

const route = useRoute()
// const getProfile = await liff.getProfile()
const userId = route.params.userId

const { public: config } = useRuntimeConfig()

const profile = ref(null)
const kids = ref([])

async function fetchUserProfile() {
    try {
        const res = await fetch(`${config.apiDomain}/users/get/${userId}`)
        if (!res.ok) throw new Error('Failed to fetch profile')
        const data = await res.json()
        console.log("data:", data)
        profile.value = data
    } catch (error) {
        console.error(error)
    }
}

async function fetchKids() {
    try {
        const res = await fetch(`${config.apiDomain}/kids/getUserKids/${userId}`)
        if (!res.ok) throw new Error('Failed to fetch kids')
        const data = await res.json()
        kids.value = data.kids
        console.log("kids : ", kids.value)
    } catch (error) {
        console.error(error)
    }
}

onMounted(async () => {
    fetchUserProfile()
    fetchKids()

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
                <div class="flex justify-between w-full">
                    <h1 class="text-3xl font-bold text-outline-blue">Your Profile</h1>

                    <NuxtLink :to="`/users/user_edit_profile/${userId}`">
                        <button class="mr-8 mt-1 bg-[#035CB2] text-sm text-black rounded-full p-2 shadow z-10">
                            <img src="/image-icons/edit.png" alt="edit" class="w-5 h-5">
                        </button>
                    </NuxtLink>
                </div>

                <div class="flex flex-row gap-5">
                    <img :src="`${profile?.avatarUrl}`" alt="user profile" class="w-20 h-20 bg-white rounded-full">

                    <div class="">
                        <p class="font-bold text-lg">{{ profile?.firstName }} {{ profile?.lastName }}</p>
                        <p class="text-sm">{{ profile?.email }}</p>
                        <p class="text-sm">{{ profile?.phone }}</p>
                    </div>
                </div>
            </div>
        </div>


        <!-- กล่องล่าง -->
        <div class="-mt-7 rounded-t-3xl bg-white px-8 py-6 w-full relative z-10">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-bold text-blue-800">All Kids</h2>
                <NuxtLink :to="`/kids/kid_create_profile/${userId}`">
                    <button
                        class="bg-[#035CB2] text-white rounded-full w-8 h-8 text-4xl flex items-center justify-center">
                        <img src="/image-icons/plus.png" alt="create kid" class="w-4 h-4">
                    </button>
                </NuxtLink>
            </div>

            <!-- ทำแนวตั้งด้วย flex + scroll -->
            <div class="max-h-154 overflow-y-auto space-y-3 space-x-1.5">
                <template v-if="kids.length">
                    <KidCard v-for="kid in kids" :key="kid.id" :userId="userId" :id="kid.id" :name="kid.name"
                        :status="kid.status" :updated="kid.updated" :avatarUrl="kid.avatarUrl"
                        class="min-w-[200px] shrink-0" />
                </template>
                <p v-else class="mt-2 text-gray-500 text-center">No kids data</p>

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