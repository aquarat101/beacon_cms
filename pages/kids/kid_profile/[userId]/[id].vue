<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const userId = route.params.userId
const kidId = route.params.id
const { public: config } = useRuntimeConfig()

const beaconId = ref("")
const type = ref("")
const time = ref("")

const kid = ref(null)
const Histories = ref([])

async function fetchKid() {
    try {
        const res = await fetch(`${config.apiDomain}/kids/getKid/${userId}/${kidId}`)
        if (!res.ok) throw new Error('Failed to fetch kid')
        const data = await res.json()
        kid.value = data
        beaconId.value = kid.value.beaconId
        fetchZoneHits()
    } catch (error) {
        console.error(error)
    }
}

async function fetchZoneHits() {
    try {
        const res = await fetch(`${config.apiDomain}/beacons/getZoneHits/${beaconId.value}/${userId}`)
        const json = await res.json()
        if (!json.data || json.data.length === 0) {
            Histories.value = []
            return
        }

        // แปลงข้อมูลทุกตัวใน json.data เป็น object สำหรับ Histories
        Histories.value = json.data.map((item, index) => {
            let placeType = item.type || '-'
            let dateStr = '-'

            if (item.timestamp && item.timestamp._seconds) {
                const date = new Date(item.timestamp._seconds * 1000)
                dateStr = date.toLocaleString('th-TH', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })
            }

            return {
                id: index + 1,
                place: placeType,
                date: dateStr
            }
        })

        // อัปเดต kid.updated เป็นเวลาของ history ตัวล่าสุด (ตัวแรก)
        if (Histories.value.length > 0) {
            kid.value.updated = Histories.value[0].date
        }

        // ถ้าต้องการเก็บล่าสุดไว้ใน type, time ก็อัพเดตจากตัวแรกด้วย
        const first = json.data[0]
        type.value = first.type || '-'
        if (first.timestamp && first.timestamp._seconds) {
            const date = new Date(first.timestamp._seconds * 1000)
            time.value = date.toLocaleString('th-TH', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        } else {
            time.value = '-'
        }

    } catch (error) {
        console.error(error)
    }
}

async function deleteKid() {
    const confirmDelete = confirm('Are you sure you want to delete this kid?')
    if (!confirmDelete) return

    try {
        const res = await fetch(`${config.apiDomain}/kids/delete/${kidId}`, {
            method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete kid')

        alert('Kid deleted successfully')
        router.push(`/users/user_profile/${userId}`)
    } catch (error) {
        console.error(error)
        alert('Error deleting kid')
    }
}

fetchKid()
</script>


<template>
    <div class="min-h-screen bg-white flex flex-col justify-between items-center">

        <div class="w-full">
            <div class="relative w-full h-72 text-[#035CB2]">
                <img src="/images/background.png" alt="Background Header"
                    class="absolute inset-0 w-full h-full object-cover z-0" />

                <div class="absolute inset-0 flex flex-col items-center justify-center z-10 gap-5">
                    <div class="flex flex-col items-center">
                        <h1 class="text-3xl font-bold text-outline-blue mb-2">{{ kid?.name || 'Loading...' }}</h1>
                        <p>Last updated: {{ kid?.updated || '-' }}</p>
                    </div>

                    <img :src="kid?.avatarUrl || '/images/profile.png'" alt="profile"
                        class="w-26 h-26 bg-white rounded-full border-4 object-cover"
                        :class="kid?.status === 'online' ? 'border-green-500' : 'border-gray-400'" />

                    <div class="absolute top-55 px-3 pb-1 rounded-full text-sm text-white"
                        :class="kid?.status === 'online' ? 'bg-green-500' : 'bg-gray-400'">
                        {{ kid?.status === 'online' ? 'Online' : 'Offline' }}
                    </div>

                </div>
            </div>

            <div
                class="flex flex-col w-full  px-8 pt-8 pb-6 -mt-8 font-bold bg-white rounded-t-3xl relative z-10 overflow-hidden">
                <div>
                    <div class="flex flex-row justify-between items-center w-full">
                        <div class="flex flex-col">
                            <p class="text-[#035CB2]">Beacon ID</p>
                            <p>{{ kid?.beaconId || '-' }}</p>
                        </div>

                        <img src="/image-icons/trash.png" alt="delete"
                            class="bg-[#E24B4B] w-10 h-10 p-2 rounded-full cursor-pointer hover:opacity-80"
                            @click="deleteKid" />
                    </div>

                    <div class="flex flex-col">
                        <p class="text-[#035CB2]">Remark</p>
                        <p>{{ kid?.remark || '-' }}</p>
                    </div>

                    <div class="flex flex-col">
                        <p class="text-[#035CB2]">Place History</p>
                        <div v-if="Histories.length === 0" class="flex justify-center text-gray-500 mt-5 ">
                            No place history
                        </div>

                        <div v-else class="max-h-85 overflow-y-auto space-y-4 space-x-1.5 mt-2">
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