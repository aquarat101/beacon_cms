<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const userId = route.params.id
const { public: config } = useRuntimeConfig()

const previewImage = ref(null)
const fileInputRef = ref(null)
const selectedFile = ref(null)

const form = reactive({
    profileName: '',
    beaconId: '',
    remark: '',
})

const errors = reactive({
    profileName: '',
    beaconId: '',
    remark: '',
})

const validateForm = () => {
    let isValid = true
    errors.profileName = ''
    errors.beaconId = ''
    errors.remark = ''

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

const createKidProfile = async () => {
    if (!validateForm()) return

    try {
        const formData = new FormData()
        formData.append('profileName', form.profileName)
        formData.append('beaconId', form.beaconId)
        formData.append('remark', form.remark)

        if (selectedFile.value) {
            formData.append('avatar', selectedFile.value)
        }   

        const res = await fetch(`${config.apiDomain}/kids/create/${userId}`, {
            method: 'POST',
            body: formData,
            // ไม่ต้องกำหนด Content-Type, fetch จะจัดการให้เอง
        })

        if (!res.ok) throw new Error('Failed to submit')

        router.push(`/users/user_profile/${userId}`)
    } catch (err) {
        console.error('Failed to submit:', err)
    }
}

function onFileChange(event) {
    const file = event.target.files[0]
    if (file) {
        selectedFile.value = file
        previewImage.value = URL.createObjectURL(file)
    }
}

function triggerFileInput() {
    fileInputRef.value?.click()
}
</script>

<template>
    <div class="min-h-screen bg-white flex flex-col items-center text-[#035CB2]">
        <!-- header -->
        <div class="relative w-full h-72">
            <img src="/images/background.png" alt="Background Header"
                class="absolute inset-0 w-full h-full object-cover z-0" />
            <div class="absolute inset-0 flex flex-col items-center justify-center z-10 gap-5">
                <h1 class="text-3xl font-bold text-outline-blue">Create Kid Profile</h1>

                <div class="relative w-24 h-24">
                    <img :src="previewImage || '/images/profile.png'" alt="Profile"
                        class="w-full h-full bg-white rounded-full object-cover" />
                    <button
                        class="absolute bottom-0 right-0 bg-[#035CB2] text-sm text-black rounded-full p-2 shadow z-10"
                        @click="triggerFileInput" type="button">
                        <img src="/image-icons/edit.png" alt="edit" class="w-5 h-5" />
                    </button>
                    <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="onFileChange" />
                </div>
            </div>
        </div>

        <!-- form -->
        <div class="w-full min-w-md p-5 px-7 -mt-10 bg-white rounded-t-3xl relative z-10 overflow-hidden">
            <form @submit.prevent="createKidProfile" class="space-y-20 font-bold">
                <div>
                    <div>
                        <label class="block my-3 text-gray-700">Profile name</label>
                        <input v-model="form.profileName" type="text" placeholder="profile name"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                        <p class="text-red-500 text-sm mt-1">{{ errors.profileName }}</p>
                    </div>

                    <div>
                        <label class="block my-3 text-gray-700">Beacon ID</label>
                        <div class="flex gap-4 items-center">
                            <input v-model="form.beaconId" type="text" placeholder="beacon id"
                                class="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                            <!-- ปุ่มลิงก์ QR Code ต้องไม่เป็น submit -->
                            <NuxtLink :to="`/kids/qrcode/${userId}`" class="inline-block">
                                <button type="button">
                                    <img src="/image-icons/qrcode.png" alt="qrcode"
                                        class="w-14 h-12 p-2 -mb-1 border-2 border-[#0198FF] rounded-md" />
                                </button>
                            </NuxtLink>
                        </div>
                        <p class="text-red-500 text-sm mt-1">{{ errors.beaconId }}</p>
                    </div>

                    <div>
                        <label class="block my-3 text-gray-700">Remark</label>
                        <input v-model="form.remark" type="text" placeholder="remark"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                    </div>
                </div>

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
    </div>
</template>

<style>
.text-outline-blue {
    color: white;
    -webkit-text-stroke: 1.6px #035CB2;
}
</style>
