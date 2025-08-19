<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { public: config } = useRuntimeConfig()

const userId = route.params.userId
const placeId = route.params.placeId || 'placeId'

const placeName = route.query.name
const address = route.query.address
const placeType = route.query.type
const remark = route.query.remark
const lat = route.query.lat
const lng = route.query.lng
const status = route.query.status
const useFunction = ref(true)

if (status === 'false') {
    useFunction.value = false
}

const isUpdating = ref(false)

const form = reactive({
    userId: '',
    placeName: '',
    address: '',
    placeType: '',
    remark: '',
    lat: '',
    lng: '',
})

const data = reactive({
    userId: userId,
    placeName: placeName,
    placeType: placeType,
    remark: remark,
})

const errors = reactive({
    placeName: '',
    placeType: ''
})

const types = [
    { label: 'Home', value: 'Home', icon: '/image-icons/home.png' },
    { label: 'School', value: 'School', icon: '/image-icons/school.png' },
    { label: 'Work', value: 'Work', icon: '/image-icons/work.png' },
    { label: 'Other', value: 'Other', icon: '/image-icons/other.png' },
]

// --- NEW: Loading overlay ---
const loadingPage = ref(true)

async function updatePlace() {
    try {
        isUpdating.value = true

        const response = await fetch(`${config.apiDomain}/places/update/${placeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                name: form.placeName,
                address: address,
                type: form.placeType,
                remark: form.remark,
                lat: lat,
                lng: lng,
            })
        })

        const json = await response.json()
        console.log(json.data)

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong')
        }

        router.push({
            path: `/places/map/placeId/${userId}/${placeId}`,
            query: {
                name: form.placeName || placeName,
                address: address,
                type: form.placeType || placeType,
                remark: form.remark || remark,
                lat: lat,
                lng: lng,
                status: true,
            }
        })

    } catch (error) {
        console.error('❌ Error updating place:', error)
        alert('❌ Failed to update place')
    } finally {
        isUpdating.value = false
    }
}

async function toSavePlace() {
    errors.placeName = ''
    errors.placeType = ''

    const trimmedName = form.placeName

    if (!trimmedName) {
        errors.placeName = 'Please enter a valid place name'
    }

    if (!form.placeType) {
        errors.placeType = 'Please select a place type'
    }

    if (errors.placeName || errors.placeType) return

    console.log("toSavePlace status : ", status)
    if (status === 'false') {
        router.push({
            path: `/places/map/userId/${userId}`,
            query: {
                name: trimmedName,
                address: address,
                type: form.placeType,
                remark: form.remark || '-',
                lat: lat,
                lng: lng,
                status: status,
                state: false,
            }
        })
    } else {
        router.push({
            path: `/places/map/placeId/${userId}/${placeId}`,
            query: {
                name: trimmedName,
                address: address,
                type: form.placeType,
                remark: form.remark || '-',
                lat: lat,
                lng: lng,
                status: status,
                state: true,
                state: false,
            }
        })
    }
}

function backPage() {
    const trimmedName = form.placeName

    if (status === 'false') {
        router.push({
            path: `/places/map/userId/${userId}`,
            query: { address: address, lat: lat, lng: lng }
        })
    } else {
        router.push({
            path: `/places/map/placeId/${userId}/${placeId}`,
            query: {
                name: trimmedName,
                address: address,
                type: form.placeType,
                remark: form.remark || '-',
                lat: lat,
                lng: lng,
                status: false,
                state: false,
            }
        })
    }
}

onMounted(() => {
    Object.assign(form, data)
    loadingPage.value = false // hide loading เมื่อ data โหลดเสร็จ
})
</script>

<template>
    <div class="relative min-h-screen">

        <!-- Loading / Updating / Deleting overlay -->
        <transition name="fade">
            <div v-if="loadingPage || isUpdating"
                class="fixed inset-0 bg-gray-400 bg-opacity-40 flex items-center justify-center z-50">
                <div class="bg-white rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center space-y-4">
                    <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
                        v-if="!isDeleting">
                    </div>
                    <p class="text-lg font-semibold text-[#035CB2]">
                        {{ isUpdating ? 'Updating...' : 'Loading...' }}
                    </p>
                </div>
            </div>
        </transition>

        <!-- หน้า UI ปกติ -->
        <div v-show="!loadingPage" class="max-w-screen bg-white flex flex-col items-center text-[#035CB2] font-bold">
            <!-- กล่องรวม: ต้อง relative -->
            <div class="relative w-full h-48">
                <img src="/images/background.png" alt="Register Header"
                    class="absolute inset-0 w-full h-full object-cover z-0" />
                <div class="absolute inset-0 flex justify-center items-center mb-5 z-10 gap-5 px-10">
                    <h2 class="text-3xl font-bold text-outline-blue">Add new place</h2>
                </div>
            </div>

            <div
                class="w-full lg:p-8 md:p-8 sm:p-8 max-sm:p-8 -mt-10 bg-white rounded-t-3xl relative z-10 overflow-hidden">
                <form @submit.prevent="" class="space-y-5 font-bold">
                    <div>
                        <div class="">
                            <label class="block my-3 text-gray-700">Place name</label>
                            <input v-model="form.placeName" type="text" placeholder="place name"
                                class="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                            <p :class="errors.placeName ? 'visible' : 'invisible'"
                                class="text-sm text-red-500 mt-1 min-h-[1.25rem]">
                                {{ errors.placeName || ' ' }}
                            </p>
                        </div>

                        <div class="-mt-2">
                            <div class="flex items-center gap-1.5 -mb-2">
                                <label class="block my-3 text-gray-700">Address</label>
                                <label class="text-sm text-gray-400">( *Disabled change here )</label>
                            </div>
                            <input v-model="form.address" type="text" :placeholder="`${address}`" disabled
                                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                        </div>
                    </div>

                    <div class="max-w-sm mx-auto">
                        <label class="block mb-4 text-gray-700">Places type</label>
                        <div class="space-y-4">
                            <div v-for="type in types" :key="type.value" @click="form.placeType = type.value" :class="[
                                'flex items-center px-4 py-3 rounded-xl border cursor-pointer hover:bg-blue',
                                form.placeType === type.value
                                    ? 'border-[#0198FF] border-2 bg-blue-50'
                                    : 'border-gray-200 bg-white hover:bg-gray-50'
                            ]">
                                <div :class="[
                                    'w-10 h-10 flex items-center justify-center rounded-full mr-3',
                                    type.value === 'Home' ? 'bg-[#035CB2]' : type.value === 'School' ? 'bg-[#0099FF]' : type.value === 'Work' ? 'bg-[#92DBFF]' : 'bg-[#C3EBFF]'
                                ]">
                                    <img :src="type.icon" alt="icon"
                                        :class="['w-5 h-5', type.value === 'Home' ? 'bg-[#035CB2]' : type.value === 'School' ? 'bg-[#0099FF]' : type.value === 'Work' ? 'bg-[#92DBFF]' : 'bg-[#C3EBFF]']">
                                </div>
                                <span class="text-sm font-medium text-gray-800">{{ type.label }}</span>
                            </div>
                        </div>
                        <p :class="errors.placeType ? 'visible' : 'invisible'"
                            class="text-sm text-red-500 mt-1 min-h-[1.25rem]">
                            {{ errors.placeType || ' ' }}
                        </p>
                    </div>

                    <div class="-mt-4 mb-7">
                        <label class="block text-gray-700">Remark</label>
                        <input v-model="form.remark" type="text" placeholder="remark"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                    </div>
                    
                    <div class="flex justify-between gap-4 font-bold">
                        <button type="button" @click="backPage"
                            class="flex justify-center w-full bg-white text-[#0198FF] border border-[#0198FF] py-3 rounded-2xl text-lg hover:bg-[#0198FF] hover:text-white transition">
                            Back
                        </button>

                        <button v-if="!useFunction" type="button" @click="toSavePlace"
                            class="flex justify-center w-full bg-[#0198FF] text-white py-3 rounded-2xl text-lg hover:bg-[#0198FF] transition">
                            Next
                        </button>

                        <button v-if="useFunction" type="submit" @click="updatePlace"
                            class="flex justify-center w-full bg-[#0198FF] text-white py-3 rounded-2xl text-lg hover:bg-[#0198FF] transition">
                            Save
                        </button>
                    </div>
                </form>

            </div>
        </div>
    </div>
</template>

<style>
.text-outline-blue {
    color: white;
    -webkit-text-stroke: 1.6px #035CB2;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
