<script setup>
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import liff from '@line/liff'
import KidCard from '~/components/KidCard.vue'

const route = useRoute()
const router = useRouter()
const userId = route.params.userId
const { public: config } = useRuntimeConfig()

const profile = ref(null)
const kids = ref([])
const isLoading = ref(true) // ✅ state สำหรับ popup โหลด

const activeTab = ref('profile') // default tab

function switchTab(tab) {
    activeTab.value = tab
    if (tab === 'map') router.push(`/map_beacons/${userId}/${0}`)
    if (tab === 'profile') router.push(`/users/user_profile/${userId}`)
}

async function fetchUserProfile() {
    try {
        const res = await fetch(`${config.apiDomain}/users/get/${userId}`)
        if (!res.ok) throw new Error('Failed to fetch profile')
        const data = await res.json()
        profile.value = data
    } catch (error) {
        router.push(`/auth/register`)
        console.error(error)
    }
}

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

onMounted(async () => {
    try {
        const profileLine = await liff.getProfile()
        const res = await fetch(`${config.apiDomain}/users/findUserByUserId/${profileLine.userId}`)

        if (res.ok) {
            await Promise.all([
                fetchUserProfile(),
                fetchKids()
            ])
        } else {
            router.push(`/auth/register`)
        }
    } catch (err) {
        console.error('Error checking userId:', err)
    } finally {
        isLoading.value = false // ✅ ปิดโหลดเมื่อทุกอย่างเสร็จ
    }
})
</script>

<template>
    <div class="min-h-screen max-h-screen bg-white flex flex-col items-center text-[#035CB2]">
        <!-- ✅ Popup Loading -->
        <div v-if="isLoading" class="fixed inset-0 bg-gray-400 bg-opacity-40 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center space-y-4">
                <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-lg font-semibold text-[#035CB2]">Loading...</p>
            </div>
        </div>

        <div class="relative w-full h-64">
            <img src="/images/background.png" alt="Register Header"
                class="absolute inset-0 w-full h-full object-cover z-0" />

            <div class="absolute inset-0 flex flex-col items-start justify-center pl-10 z-10 gap-5">
                <div class="-mt-5 flex justify-between w-full">
                    <h1 class="text-3xl font-bold text-outline-blue">Your Profile</h1>

                    <NuxtLink :to="`/users/user_edit_profile/${userId}`">
                        <button class="mr-8 mt-1 bg-[#035CB2] text-sm text-black rounded-full p-2 shadow z-10">
                            <img src="/image-icons/edit.png" alt="edit" class="w-5 h-5">
                        </button>
                    </NuxtLink>
                </div>

                <div class="flex flex-row gap-5">
                    <div class="relative min-w-24 max-w-24 h-24">
                        <img :src="`${profile?.avatarUrl}`" alt="user profile"
                            class="w-full h-full bg-white rounded-full object-cover">
                    </div>

                    <div class="mt-2">
                        <p class="font-bold text-md">{{ profile?.firstName }} {{ profile?.lastName }}</p>
                        <p class="text-md">{{ profile?.email }}</p>
                        <p class="text-md">{{ profile?.phone }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="-mt-7 rounded-t-3xl bg-white px-8 py-6 w-full relative z-10">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-bold text-blue-800">All Kids</h2>
                <NuxtLink :to="`/kids/kid_create_profile/${userId}`">
                    <button class="bg-[#035CB2] text-white rounded-full w-8 h-8 flex items-center justify-center">
                        <img src="/image-icons/plus.png" alt="create kid" class="w-4 h-4">
                    </button>
                </NuxtLink>
            </div>
            <div class="min-h-60 max-h-120 overflow-y-auto space-y-3 space-x-1.5">
                <template v-if="kids.length">
                    <KidCard v-for="kid in kids" :key="kid.id" :userId="userId" :id="kid.id"
                        :name="kid.name" :status="kid.status" :updated="kid.updated" :avatarUrl="kid.avatarUrl"
                        :lastLat="kid.lastLat" :lastLng="kid.lastLng" :zoneId="kid.lastZoneId"
                        :lastOfflineAt="kid.lastOfflineAt" state="-" />
                </template>
                <p v-else class="mt-2 text-gray-500 text-center">No kids data</p>
            </div>
        </div>

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
                <img src="/image-icons/profile.png" alt="profile" class="w-6 h-6"
                    :class="activeTab === 'profile' ? 'opacity-100' : 'opacity-60'" />
                <span class="text-base font-medium">Profile</span>
            </button>
        </div>

    </div>
</template>