<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PlaceCard from '~/components/PlaceCard.vue'

const route = useRoute()
const { public: config } = useRuntimeConfig()
const userId = route.params.id

const places = ref([])

async function fetchPlaces() {
    try {
        const res = await fetch(`${config.apiDomain}/places/get/${userId}`)
        if (!res.ok) throw new Error('Failed to fetch places')
        places.value = await res.json()
        console.log(places.value)
    } catch (error) {
        console.error(error)
    }
}

onMounted(() => {
    fetchPlaces()
})
</script>

<template>
    <div class="min-h-screen bg-white flex flex-col justify-between text-[#035CB2]">
        <div>
            <!-- กล่องรวม: ต้อง relative -->
            <div class="relative w-full h-40">
                <!-- รูป background อยู่ข้างล่าง -->
                <img src="/images/background.png" alt="Register Header"
                    class="absolute inset-0 w-full h-full object-cover z-0" />

                <!-- กล่องเนื้อหาซ้อนทับ -->
                <div class="absolute inset-0 flex flex-col justify-center z-10 gap-5 px-10 mb-5">
                    <div class="flex justify-between mb-4">
                        <h2 class="text-3xl font-bold text-outline-blue">My Place</h2>
                        <NuxtLink :to="`/places/map/${userId}`">
                            <button
                                class="bg-[#0198FF] text-white rounded-full w-8 h-8 text-4xl flex items-center justify-center leading-5.5">
                                <div class="h-full w-full mt-1">+</div>
                            </button>
                        </NuxtLink>
                    </div>
                </div>
            </div>

            <!-- กล่องล่าง -->
            <div class="-mt-6 rounded-t-3xl bg-white px-8 py-6 w-full relative z-10">
                <!-- ทำแนวตั้งด้วย flex + scroll -->
                <div class="max-h-120 overflow-y-auto space-y-4 pr-2">
                    <PlaceCard v-for="place in places" :key="place.id" :userId="place.userId" :placeId="place.id" :name="place.name"
                        :address="place.address" :type="place.type" :remark="place.remark" :lat="place.lat"
                        :lng="place.lng" :status="`true`" :state="true" class="min-w-[200px] shrink-0" @click="" />
                </div>
            </div>
        </div>

        <img src="/images/footer.png" alt="footer" />
    </div>
</template>

<style>
.text-outline-blue {
    color: white;
    -webkit-text-stroke: 1.6px #035CB2;
}
</style>
