<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { public: config } = useRuntimeConfig()

const userId = route.params.userId
const kidId = route.params.id

const previewImage = ref(null)
const fileInputRef = ref(null)
const selectedFile = ref(null)

const form = reactive({
    name: '',
    beaconId: '',
    remark: '',
})

const data = reactive({
    name: '',
    beaconId: '',
    remark: '',
})

const errors = reactive({
    name: '',
    beaconId: '',
    remark: '',
})

const loadingKid = ref(true)
const saving = ref(false) // ✅ ใช้ตอนกด Save
const isLoading = computed(() => loadingKid.value || saving.value)

const validateForm = () => {
    let valid = true
    errors.name = ''
    errors.beaconId = ''
    errors.remark = ''

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

async function fetchKid() {
    try {
        const res = await fetch(`${config.apiDomain}/kids/getKid/${userId}/${kidId}`)
        if (!res.ok) throw new Error('Failed to fetch kid')
        const json = await res.json()
        Object.assign(data, json)
        Object.assign(form, json)
        previewImage.value = json.avatarUrl || null
    } catch (error) {
        console.error(error)
        alert('Failed to load kid profile')
    } finally {
        loadingKid.value = false
    }
}

const updateKidProfile = async () => {
    if (!validateForm()) return

    saving.value = true
    try {
        const formData = new FormData()
        let hasChanges = false

        for (const key in form) {
            if (form[key] !== data[key]) {
                formData.append(key, form[key])
                hasChanges = true
            }
        }
        if (selectedFile.value) {
            formData.append('avatar', selectedFile.value)
            hasChanges = true
        }

        if (!hasChanges) {
            alert('No data to update')
            saving.value = false
            return
        }

        const res = await fetch(`${config.apiDomain}/kids/update/${userId}/${kidId}`, {
            method: 'PATCH',
            body: formData,
        })
        if (!res.ok) throw new Error('Failed to update kid profile')

        router.push(`/kids/kid_profile/${userId}/${kidId}`)
    } catch (err) {
        console.error(err)
        alert('An error occurred while updating the profile')
    } finally {
        saving.value = false
    }
}

function goToQRcode() {
    router.push({
        path: `/kids/qrcode/${userId}`,
        query: { page: "edit", kidId }
    })
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

onMounted(() => {
    fetchKid()
})
</script>

<template>
    <div class="min-h-screen bg-white flex flex-col items-center text-[#035CB2]">

        <!-- ✅ Popup Loading -->
        <div v-if="isLoading" class="fixed inset-0 bg-gray-400 bg-opacity-40 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center space-y-4">
                <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-lg font-semibold text-[#035CB2]">
                    {{ loadingKid ? 'Loading...' : 'Saving...' }}
                </p>
            </div>
        </div>

        <!-- Header & Avatar -->
        <div v-else class="relative w-full h-72">
            <img src="/images/background.png" alt="Background Header"
                class="absolute inset-0 w-full h-full object-cover z-0" />
            <div class="absolute inset-0 flex flex-col items-center justify-center z-10 gap-5">
                <h1 class="text-3xl font-bold text-outline-blue">Edit Kid Profile</h1>

                <div class="relative w-24 h-24">
                    <img :src="previewImage || '/images/profile.png'" alt="Profile"
                        class="w-full h-full bg-white rounded-full object-cover" />

                    <button
                        class="absolute bottom-0 right-0 bg-[#035CB2] text-sm text-black rounded-full p-2 shadow z-10"
                        @click="triggerFileInput">
                        <img src="/image-icons/edit.png" alt="edit" class="w-5 h-5">
                    </button>

                    <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="onFileChange" />
                </div>
            </div>
        </div>

        <!-- Form -->
        <div v-if="!isLoading"
            class="w-full lg:p-8 md:p-8 sm:p-8 max-sm:p-8 -mt-10 bg-white rounded-t-3xl relative z-10 overflow-hidden">
            <form @submit.prevent="updateKidProfile" class="space-y-20 font-bold">
                <div>
                    <div>
                        <label class="block my-3 text-gray-700">Profile name</label>
                        <input v-model="form.name" type="text" placeholder="profile name"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                        <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
                    </div>

                    <div>
                        <label class="block my-3 text-gray-700">Beacon ID</label>
                        <div class="flex gap-4">
                            <input v-model="form.beaconId" type="text" placeholder="beacon id"
                                class="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                            <button type="button" @click="goToQRcode">
                                <img src="/image-icons/qrcode.png" alt="qrcode"
                                    class="w-14 h-12 p-2 -mb-1 border-2 border-[#0198FF] rounded-md">
                            </button>
                        </div>
                        <p v-if="errors.beaconId" class="text-red-500 text-sm mt-1">{{ errors.beaconId }}</p>
                    </div>

                    <div>
                        <label class="block my-3 text-gray-700">Remark</label>
                        <input v-model="form.remark" type="text" placeholder="remark"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                        <p v-if="errors.remark" class="text-red-500 text-sm mt-1">{{ errors.remark }}</p>
                    </div>
                </div>

                <div class="flex justify-between gap-4 font-bold w-full">
                    <button type="button" @click="router.push(`/kids/kid_profile/${userId}/${kidId}`)"
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

    </div>
</template>

<style>
.text-outline-blue {
    color: white;
    -webkit-text-stroke: 1.6px #035CB2;
}
</style>
