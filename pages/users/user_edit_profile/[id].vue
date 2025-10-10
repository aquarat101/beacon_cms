<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const { public: config } = useRuntimeConfig()

const previewImage = ref(null)
const fileInputRef = ref(null)
const selectedFile = ref(null)

const form = reactive({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
})

const data = reactive({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
})

const loadingProfile = ref(true)
const saving = ref(false) // ✅ ใช้ตอนกด Save
const completed = ref(false)
const isLoading = computed(() => loadingProfile.value || saving.value)

async function fetchUserProfile() {
    try {
        const res = await fetch(`${config.apiDomain}/users/get/${id}`)
        if (!res.ok) throw new Error('Failed to fetch profile')
        const json = await res.json()
        Object.assign(data, json)
        Object.assign(form, json)
        previewImage.value = json.avatarUrl || null
    } catch (error) {
        console.error(error)
    } finally {
        loadingProfile.value = false
    }
}

async function updateUserProfile() {
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
        return
    }

    saving.value = true
    try {
        const res = await fetch(`${config.apiDomain}/users/update/${id}`, {
            method: 'PUT',
            body: formData,
        })

        if (!res.ok) {
            const errData = await res.json().catch(() => null)
            throw new Error(errData?.message || 'Failed to update')
        }

        completed.value = true
        setTimeout(() => {
            completed.value = false
            router.push(`/users/user_profile/${id}`)
        }, 800)

    } catch (err) {
        console.error(err)
        alert(err.message || 'Failed to update profile.')
    } finally {
        saving.value = false
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

onMounted(() => {
    fetchUserProfile()
})
</script>

<template>
    <div class="min-h-screen bg-white flex flex-col items-center text-[#035CB2]">

        <!-- ✅ Popup Loading -->
        <div v-if="isLoading" class="fixed inset-0 bg-gray-400 bg-opacity-40 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center space-y-4">
                <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-lg font-semibold text-[#035CB2]">
                    {{ loadingProfile ? 'Loading...' : 'Saving...' }}
                </p>
            </div>
        </div>

        <!-- ✅ Popup Completed -->
        <div v-if="completed" class="fixed inset-0 bg-gray-400 bg-opacity-40 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center space-y-4">
                <div class="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-lg font-semibold text-[#20854f]">Completed!!</p>
            </div>
        </div>

        <!-- header -->
        <div v-else class="relative w-full h-72">
            <img src="/images/background.png" alt="Background Header"
                class="absolute inset-0 w-full h-full object-cover z-0" />
            <div class="absolute inset-0 flex flex-col items-center justify-center z-10 gap-5">
                <h1 class="text-3xl font-bold text-outline-blue">Edit Profile</h1>

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

        <!-- form -->
        <div v-if="!loadingProfile"
            class="w-full lg:p-8 md:p-8 sm:p-8 max-sm:p-8 -mt-10 bg-white rounded-t-3xl relative z-10 overflow-hidden">
            <form @submit.prevent="updateUserProfile" class="space-y-20 font-bold">
                <div>
                    <div>
                        <label class="block my-3 text-gray-700">First Name</label>
                        <input v-model="form.firstName" type="text" placeholder="first name"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                    </div>
                    <div>
                        <label class="block my-3 text-gray-700">Last Name</label>
                        <input v-model="form.lastName" type="text" placeholder="last name"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                    </div>
                    <div>
                        <label class="block my-3 text-gray-700">E-mail</label>
                        <input v-model="form.email" type="email" placeholder="email"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                    </div>
                    <div>
                        <label class="block my-3 text-gray-700">Phone Number</label>
                        <input v-model="form.phone" type="tel" placeholder="phone number"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                    </div>

                    <div class="flex justify-between gap-4 mt-10 font-bold w-full">
                        <button type="button" @click="router.push(`/users/user_profile/${id}`)"
                            class="w-full bg-white text-[#0198FF] border border-[#0198FF] py-3 rounded-md text-lg hover:bg-[#0198FF] hover:text-white transition">
                            Cancel
                        </button>
                        <button type="submit"
                            class="w-full bg-[#0198FF] text-white py-3 rounded-md text-lg hover:bg-[#0177cc] transition">
                            Save
                        </button>
                    </div>
                </div>
            </form>
        </div>

    </div>
</template>