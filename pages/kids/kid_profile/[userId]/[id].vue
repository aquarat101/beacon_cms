<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const userId = route.params.userId
const kidId = route.params.id
const { public: config } = useRuntimeConfig()

const kid = ref()
const Histories = [
    {
        id: 1,
        place: "Home",
        date: "10/7/25 10:26 am",
    },
    {
        id: 2,
        place: "School",
        date: "10/7/25 10:26 am",
    },
    {
        id: 3,
        place: "School",
        date: "10/7/25 10:26 am",
    },
    {
        id: 4,
        place: "School",
        date: "10/7/25 10:26 am",
    },
    {
        id: 5,
        place: "School",
        date: "10/7/25 10:26 am",
    },
    {
        id: 6,
        place: "School",
        date: "10/7/25 10:26 am",
    },
    {
        id: 7,
        place: "School",
        date: "10/7/25 10:26 am",
    },
]

async function fetchKid() {
    try {
        const res = await fetch(`${config.apiDomain}/kids/getKid/${userId}/${kidId}`)
        if (!res.ok) throw new Error('Failed to fetch kid')
        const data = await res.json()
        console.log("data: ", data)
        kid.value = data
        console.log("kids : ", kid.value)

    } catch (error) {
        console.error(error)
    }
}

onMounted(() => {
    fetchKid()
})

</script>



<template>
    <div class="min-h-screen bg-white flex flex-col justify-between items-center">

        <div>
            <div class="relative w-full h-72 text-[#035CB2]">
                <img src="/images/background.png" alt="Background Header"
                    class="absolute inset-0 w-full h-full object-cover z-0" />

                <div class="absolute inset-0 flex flex-col items-center justify-center z-10 gap-5">
                    <div class="flex flex-col items-center">
                        <h1 class="text-3xl font-bold text-outline-blue mb-2">{{ kid?.name || 'Loading...' }}</h1>
                        <p>Last updated: {{ kid?.updated || '-' }}</p>
                    </div>

                    <img :src="kid?.avatar || '/images/profile.png'" alt="profile"
                        class="w-26 h-26 bg-white rounded-full border-3 border-green-500" />

                    <div class="absolute top-54 right-48 px-2 rounded-full text-sm bg-green-500 text-white"
                        v-if="kid?.status === 'online'">
                        Online
                    </div>
                </div>
            </div>

            <div
                class="flex flex-col w-full min-w-md px-8 pt-8 pb-6 -mt-10 font-bold bg-white rounded-t-3xl relative z-10 overflow-hidden">
                <div>
                    <div class="flex flex-row justify-between items-center w-full">
                        <div class="flex flex-col">
                            <p class="text-[#035CB2]">Beacon ID</p>
                            <p>{{ kid?.beaconId || '-' }}</p>
                        </div>

                        <img src="/image-icons/trash.png" alt="delete" class="bg-[#E24B4B] w-10 h-10 p-2 rounded-full">

                    </div>

                    <div class="flex flex-col">
                        <p class="text-[#035CB2]">Remark</p>
                        <p>{{ kid?.remark || '-' }}</p>
                    </div>

                    <div class="flex flex-col">
                        <p class="text-[#035CB2]">Place History</p>

                        <div class="max-h-85 overflow-y-auto space-y-4 space-x-1.5 mt-2">
                            <HistoryCard v-for="history in Histories" :key="history.id" :place="history.place"
                                :date="history.date" class="min-w-[200px] shrink-0" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex justify-between w-full px-8 gap-4 mb-10 font-bold">
            <button type="button" @click="router.push(`/users/user_profile/${userId}`)"
                class="w-full bg-white text-[#0198FF] border border-[#0198FF] py-3 rounded-md text-lg hover:bg-[#0198FF] hover:text-white transition">
                Cancel
            </button>

            <button type="button" @click="router.push(`/kids/kid_edit_profile/${userId}/${kidId}`)"
                class="w-full bg-[#0198FF] text-white py-3 rounded-md text-lg hover:bg-[#0177cc] transition">
                Edit
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