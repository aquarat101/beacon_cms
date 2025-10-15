<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { public: config } = useRuntimeConfig()

const userId = route.params.userId
const kidId = route.params.id
const map_beacons = route.query.map_beacons

// avatar list
const avatars = [
    '/image-avatars/1.png',
    '/image-avatars/2.png',
    '/image-avatars/3.png',
    '/image-avatars/4.png',
    '/image-avatars/5.png',
    '/image-avatars/6.png'
]

const showAvatarPopup = ref(false)
const selectedAvatar = ref('')

const form = reactive({
    name: '',
    beaconId: '',
    remark: '',
    avatar: '',
})

const data = reactive({})
const errors = reactive({
    name: '',
    beaconId: '',
    remark: '',
})

const loadingKid = ref(true)
const saving = ref(false)
const isLoading = computed(() => loadingKid.value || saving.value)
const completed = ref(false)

// ✅ Fetch kid
async function fetchKid() {
    try {
        const res = await fetch(`${config.apiDomain}/kids/getKid/${userId}/${kidId}`)
        if (!res.ok) throw new Error('Failed to fetch kid')
        const json = await res.json()
        Object.assign(data, json)
        Object.assign(form, json)
        selectedAvatar.value = json.avatar || avatars[0]
        form.avatar = json.avatar || avatars[0]
    } catch (error) {
        console.error(error)
        alert('Failed to load kid profile')
    } finally {
        loadingKid.value = false
    }
}

// ✅ Validate
const validateForm = () => {
    let valid = true
    errors.name = ''
    errors.beaconId = ''

    if (!form.name.trim()) {
        errors.name = 'Please enter profile name'
        valid = false
    }
    if (!form.beaconId.trim()) {
        errors.beaconId = 'Please enter Beacon ID'
        valid = false
    }
    return valid
}

// ✅ Update
const updateKidProfile = async () => {
    if (!validateForm()) return

    saving.value = true
    try {
        const body = {
            name: form.name,
            beaconId: form.beaconId,
            remark: form.remark,
            avatarUrl: form.avatar || avatars[0],
        }

        const res = await fetch(`${config.apiDomain}/kids/update/${userId}/${kidId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })

        if (!res.ok) throw new Error('Failed to update kid profile')

        completed.value = true
        setTimeout(() => {
            completed.value = false
            if (map_beacons === 'map_beacons') {
                router.push({
                    path: `/map_beacons/${userId}/${kidId}`,
                    query: {
                        openDetail: "openKidDetail"
                    }
                })
            } else {
                router.push(`/kids/kid_profile/${userId}/${kidId}`)
            }
        }, 800)

    } catch (err) {
        console.error(err)
        alert('An error occurred while updating the profile')
    } finally {
        saving.value = false
    }
}

// ✅ Confirm avatar selection
function confirmAvatar() {
    if (!selectedAvatar.value) return
    form.avatar = selectedAvatar.value
    showAvatarPopup.value = false
}

function scanQRCode() {
    router.push({
        path: `/kids/qrcode/${userId}`,
        query: {
            page: "edit"
        }
    })
}

onMounted(fetchKid)
</script>

<template>
    <div class="min-h-screen bg-white flex flex-col items-center text-[#035CB2]">

        <!-- Popup Loading -->
        <div v-if="isLoading" class="fixed inset-0 bg-gray-400 bg-opacity-40 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center space-y-4">
                <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-lg font-semibold text-[#035CB2]">
                    {{ loadingKid ? 'Loading...' : 'Saving...' }}
                </p>
            </div>
        </div>

        <!-- Popup Completed -->
        <div v-if="completed" class="fixed inset-0 bg-gray-400 bg-opacity-40 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center space-y-4">
                <div class="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-lg font-semibold text-[#20854f]">Completed!!</p>
            </div>
        </div>

        <!-- Header -->
        <div v-else class="relative w-full h-72">
            <img src="/images/background.png" alt="Background Header"
                class="absolute inset-0 w-full h-full object-cover z-0" />
            <div class="absolute inset-0 flex flex-col items-center justify-center z-10 gap-5">
                <h1 class="text-3xl font-bold text-outline-blue">Edit Kid Profile</h1>

                <!-- Avatar -->
                <div class="relative w-24 h-24 cursor-pointer" @click="showAvatarPopup = true">
                    <img :src="form.avatar || avatars[0]" alt="Avatar"
                        class="w-full h-full bg-white rounded-full object-cover border-2 border-[#035CB2]" />
                    <img src="/image-icons/plus_blue.png" alt="plus_blue"
                        class="absolute bottom-1 right-1 w-7 h-7 bg-white rounded-full">
                </div>
            </div>
        </div>

        <!-- Form -->
        <div v-if="!isLoading" class="w-full p-8 -mt-10 bg-white rounded-t-3xl relative z-10 overflow-hidden">
            <form @submit.prevent="updateKidProfile" class="space-y-10 font-bold">
                <div>
                    <label class="block my-3 text-gray-700">Profile name</label>
                    <input v-model="form.name" type="text" placeholder="profile name"
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                    <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
                </div>

                <div>
                    <label class="block my-3 text-gray-700">Beacon ID</label>
                    <div class="flex justify-between gap-2 ">
                        <input v-model="form.beaconId" type="text" placeholder="beacon id"
                            class="w-2/3 rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />

                        <div class="flex gap-3">
                            <!-- ปุ่ม Search -->
                            <button type="button" class="p-2 rounded-md border-1 border-blue-500 hover:bg-blue-700"
                                @click="searchBeacon">
                                <img src="/image-icons/search_beacon.png" alt="qrcode" class="w-6 h-6">
                            </button>

                            <!-- ปุ่ม QR Code Scan -->
                            <button type="button" class="p-2 rounded-md border-1 border-blue-500 hover:bg-blue-700"
                                @click="scanQRCode">
                                <img src="/image-icons/qrcode.png" alt="qrcode" class="w-7 h-7">
                            </button>
                        </div>
                    </div>
                    <p class="text-red-500 text-sm mt-1">{{ errors.beaconId }}</p>
                </div>

                <div>
                    <label class="block my-3 text-gray-700">Remark</label>
                    <input v-model="form.remark" type="text" placeholder="remark"
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                </div>

                <div class="flex justify-between gap-4 font-bold w-full">
                    <button type="button" @click="() => {
                        if (map_beacons === 'map_beacons') {
                            router.push({ path: `/map_beacons/${userId}/${kidId}`,
                                query: {
                                    openDetail: "openKidDetail"
                                }
                             })
                        } else {
                            router.push(`/kids/kid_profile/${userId}/${kidId}`)
                        }
                    }"
                        class="w-full bg-white text-[#0198FF] border border-[#0198FF] py-3 rounded-md text-lg hover:bg-[#0198FF] hover:text-white transition">
                        Cancel
                    </button>

                    <button type="submit"
                        class="w-full bg-[#0198FF] text-white py-3 rounded-md text-lg hover:bg-[#0177cc] transition">
                        Save
                    </button>
                </div>
            </form>
        </div>

        <!-- ✅ Avatar popup -->
        <div v-if="showAvatarPopup" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-4 w-80">
                <h2 class="font-bold text-lg text-center mb-4">Select Avatar</h2>
                <div class="grid grid-cols-3 gap-4">
                    <div v-for="avatar in avatars" :key="avatar"
                        class="relative cursor-pointer p-1 rounded-full border-2 transition-all duration-200 hover:border-blue-400 hover:border-4"
                        :class="{ 'border-blue-600 border-4': avatar === selectedAvatar }"
                        @click="selectedAvatar = avatar">
                        <img :src="avatar" class="w-full h-full rounded-full object-cover" />

                        <div v-if="avatar === selectedAvatar"
                            class="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                            <img src="/image-avatars/selected_avatar.png" alt="selected_avatar"
                                class="w-1/2 h-1/2 opacity-70" />
                        </div>
                    </div>
                </div>

                <div class="flex justify-between mt-6">
                    <button class="px-4 py-2 rounded bg-gray-200" @click="showAvatarPopup = false">Cancel</button>
                    <button class="px-4 py-2 rounded bg-blue-600 text-white" @click="confirmAvatar">Select</button>
                </div>
            </div>
        </div>
    </div>
</template>
