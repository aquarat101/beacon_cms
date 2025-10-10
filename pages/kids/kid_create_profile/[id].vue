<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const userId = route.params.id
const { public: config } = useRuntimeConfig()

const isLoading = ref(false)
const completed = ref(false)
const errorMessage = ref('') // ข้อความ error จาก server เช่น beaconId ซ้ำ

const map_beacons = route.query.map_beacons

// form data
const form = reactive({
    profileName: '',
    beaconId: '',
    remark: '',
    avatar: '', // 🔹 เลือก avatar
})

const errors = reactive({
    profileName: '',
    beaconId: '',
    remark: '',
})

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
const selectedAvatar = ref('') // ตัวเลือกชั่วคราว

// validate
const validateForm = () => {
    let isValid = true
    errors.profileName = ''
    errors.beaconId = ''
    errorMessage.value = ''

    if (!form.profileName.trim()) {
        errors.profileName = 'Profile name is required.'
        isValid = false
    }
    if (!form.beaconId.trim()) {
        errors.beaconId = 'Beacon ID is required.'
        isValid = false
    }
    return isValid
}

// create profile
const createKidProfile = async () => {
    if (!validateForm()) return

    isLoading.value = true
    try {
        const body = {
            profileName: form.profileName,
            beaconId: form.beaconId,
            remark: form.remark,
            avatar: form.avatar || avatars[0]
        }

        const res = await fetch(`${config.apiDomain}/kids/create/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })

        const data = await res.json()

        if (!res.ok) {
            // ✅ แสดง error จาก server
            if (data.code === 'duplicate_beacon') {
                errorMessage.value = 'Beacon ID นี้ถูกใช้ไปแล้ว กรุณาเลือก Beacon อื่น'
            } else {
                errorMessage.value = data.message || 'Failed to create kid profile.'
            }
            return
        }

        completed.value = true
        setTimeout(() => {
            completed.value = false
            if (map_beacons === "map_beacons") {
                router.push(`/map_beacons/${userId}/${0}`)
            } else {
                router.push(`/users/user_profile/${userId}`)
            }
        }, 800)

    } catch (err) {
        console.error(err)
        errorMessage.value = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
    } finally {
        isLoading.value = false
    }
}

// confirm avatar selection
function confirmAvatar() {
    if (!selectedAvatar.value) return
    form.avatar = selectedAvatar.value
    showAvatarPopup.value = false
}

// set default avatar
onMounted(() => {
    selectedAvatar.value = avatars[0]
    form.avatar = avatars[0]
})
</script>

<template>
    <div class="min-h-screen bg-white flex flex-col items-center text-[#035CB2]">

        <!-- Loading overlay -->
        <div v-if="isLoading" class="fixed inset-0 bg-gray-400 bg-opacity-40 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center space-y-4">
                <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-lg font-semibold text-[#035CB2]">Creating kid profile...</p>
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
        <div class="relative w-full h-72">
            <img src="/images/background.png" alt="Background Header"
                class="absolute inset-0 w-full h-full object-cover z-0" />
            <div class="absolute inset-0 flex flex-col items-center justify-center z-10 gap-5">
                <h1 class="text-3xl font-bold text-outline-blue">Create Kid Profile</h1>

                <!-- Avatar selection -->
                <div class="relative w-24 h-24 cursor-pointer" @click="showAvatarPopup = true">
                    <img :src="form.avatar || avatars[0]" alt="Avatar"
                        class="w-full h-full bg-white rounded-full object-cover border-2 border-[#035CB2]" />
                </div>
            </div>
        </div>

        <!-- Form -->
        <div class="w-full lg:p-8 md:p-8 sm:p-8 max-sm:p-8 -mt-10 bg-white rounded-t-3xl relative z-10 overflow-hidden">
            <form @submit.prevent="createKidProfile" class="space-y-6 font-bold">
                <div>
                    <label class="block my-3 text-gray-700">Profile name</label>
                    <input v-model="form.profileName" type="text" placeholder="profile name"
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                    <p class="text-red-500 text-sm mt-1">{{ errors.profileName }}</p>
                </div>

                <div>
                    <label class="block my-3 text-gray-700">Beacon ID</label>
                    <input v-model="form.beaconId" type="text" placeholder="beacon id"
                        class="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                    <p class="text-red-500 text-sm mt-1">{{ errors.beaconId }}</p>
                </div>

                <div>
                    <label class="block my-3 text-gray-700">Remark</label>
                    <input v-model="form.remark" type="text" placeholder="remark"
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                </div>

                <!-- Error message -->
                <p v-if="errorMessage" class="text-red-500 text-sm font-bold">{{ errorMessage }}</p>

                <div class="flex justify-between gap-4 font-bold">
                    <button type="button"
                        class="w-full bg-white text-[#0198FF] border border-[#0198FF] py-3 rounded-2xl text-lg hover:bg-[#0198FF] hover:text-white transition"
                        @click="router.push(`/users/user_profile/${userId}`)">
                        Cancel
                    </button>
                    <button type="submit"
                        class="w-full bg-[#0198FF] text-white py-3 rounded-2xl text-lg hover:bg-[#0198FF] transition">
                        Save
                    </button>
                </div>
            </form>
        </div>

        <!-- Avatar popup -->
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
