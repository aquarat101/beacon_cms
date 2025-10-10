<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PlaceCard from '~/components/PlaceCard.vue'
import liff from "@line/liff";

const route = useRoute()
const router = useRouter()
const { public: config } = useRuntimeConfig()
const userId = route.params.id

const places = ref([])
const loadingPage = ref(true) // Loading หน้า

async function fetchPlaces() {
    try {
        const res = await fetch(`${config.apiDomain}/places/get/${userId}`)
        if (!res.ok) throw new Error('Failed to fetch places')
        const data = await res.json()
        places.value = data.sort((a, b) => b.createdAt._seconds - a.createdAt._seconds)

        // console.log(places.value)
    } catch (error) {
        console.error(error)
    } finally {
        loadingPage.value = false // โหลดเสร็จ
    }
}

onMounted(async () => {
    try {
        const profileLine = await liff.getProfile()
        const res = await fetch(`${config.apiDomain}/users/findUserByUserId/${profileLine.userId}`);

        if (res.ok) {
            const data = await res.json();
            if (data) {
                router.push(`/places/my_place/${profileLine.userId}`)
                fetchPlaces()
            } else {
                router.push(`/auth/register`)
            }
        } else {
            router.push(`/auth/register`)
        }
    } catch (err) {
        console.error('Error checking userId:', err);
        console.log("false")
        loadingPage.value = false
    }
})
</script>

<template>
    <div class="h-screen flex flex-col bg-white text-[#035CB2]">

        <!-- Loading หน้า -->
        <div v-if="loadingPage" class="fixed inset-0 bg-gray-400 bg-opacity-40 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center space-y-4">
                <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-lg font-semibold text-[#035CB2]">Loading...</p>
            </div>
        </div>

        <!-- Header -->
        <div class="relative h-30">
            <img src="/images/background.png" alt="Register Header"
                class="absolute inset-0 w-full h-full object-cover z-0" />

            <div class="absolute inset-0 flex flex-col justify-center z-10 gap-5 px-10 mb-5">
                <div class="mt-10 flex justify-between mb-4">
                    <h2 class="text-3xl font-bold text-outline-blue">My Places</h2>

                    <NuxtLink :to="`/places/map/userId/${userId}`">
                        <button
                            class="bg-[#035CB2] text-white rounded-full w-8 h-8 text-4xl flex items-center justify-center">
                            <img src="/image-icons/plus.png" alt="create kid" class="w-4 h-4">
                        </button>
                    </NuxtLink>
                </div>
            </div>
        </div>

        <!-- List กลาง -->
        <div class="flex-1 mt-7 rounded-t-3xl bg-white px-8 overflow-y-auto -mb-8">
            <div class="space-y-4 pr-2">
                <PlaceCard v-for="place in places" :key="place.id" :userId="place.userId" :placeId="place.id"
                    :name="place.name" :address="place.address" :type="place.type" :remark="place.remark"
                    :lat="place.lat" :lng="place.lng" :status="`true`" :state="`true`" class="min-w-[200px] shrink-0"
                    @click="" />
            </div>
        </div>

        <!-- Footer -->
        <img src="/images/footer.png" alt="footer" />
    </div>
</template>
