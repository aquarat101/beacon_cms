<script setup>
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import liff from '@line/liff'
import KidCard from '~/components/KidCard.vue'

const route = useRoute()
const getProfile = await liff.getProfile()
const userId = getProfile.userId
const { public: config } = useRuntimeConfig()

const profile = ref(null)
const kids = ref([])

// โหลดดิ้ง
const loadingProfile = ref(true)
const loadingKids = ref(true)

async function fetchUserProfile() {
    try {
        const res = await fetch(`${config.apiDomain}/users/get/${userId}`)
        if (!res.ok) throw new Error('Failed to fetch profile')
        const data = await res.json()
        profile.value = data
    } catch (error) {
        console.error(error)
    } finally {
        loadingProfile.value = false
    }
}

async function fetchKids() {
    try {
        const res = await fetch(`${config.apiDomain}/kids/getUserKids/${userId}`)
        if (!res.ok) throw new Error('Failed to fetch kids')
        const data = await res.json()
        kids.value = data.kids
    } catch (error) {
        console.error(error)
    } finally {
        loadingKids.value = false
    }
}

onMounted(async () => {
    await Promise.all([fetchUserProfile(), fetchKids()])
})
</script>

<template>
    <div class="min-h-screen bg-white flex flex-col items-center text-[#035CB2]">

        <!-- โหลดดิ้งโปรไฟล์ -->
        <div v-if="loadingProfile" class="flex justify-center items-center h-64 w-full">
            <p class="text-gray-500">Loading profile...</p>
        </div>
        <div v-else class="relative w-full h-64">
            <img src="/images/background.png" alt="Register Header"
                class="absolute inset-0 w-full h-full object-cover z-0" />
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
                    <div>
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
                    <button class="bg-[#0198FF] text-white rounded-full w-8 h-8 flex items-center justify-center">
                        <img src="/image-icons/plus.png" alt="create kid">
                    </button>
                </NuxtLink>
            </div>

            <!-- โหลดดิ้ง kids -->
            <div v-if="loadingKids" class="text-center text-gray-500 py-5">
                Loading kids...
            </div>
            <div v-else class="max-h-154 overflow-y-auto space-y-3 space-x-1.5">
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
