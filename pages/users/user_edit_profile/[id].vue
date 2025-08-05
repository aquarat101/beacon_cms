<script setup>
import { reactive, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const { public: config } = useRuntimeConfig()

const previewImage = ref(null)
const fileInputRef = ref(null)

const data = reactive({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
})

const form = reactive({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
})

const errors = reactive({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
})

function validateForm() {
    let isValid = true
    errors.firstName = form.firstName ? '' : 'First name is required'
    errors.lastName = form.lastName ? '' : 'Last name is required'
    errors.email = /^\S+@\S+\.\S+$/.test(form.email) ? '' : 'Email is invalid'
    errors.phone = /^[0-9]{9,}$/.test(form.phone) ? '' : 'Phone must be at least 9 digits'

    if (errors.firstName || errors.lastName || errors.email || errors.phone) {
        isValid = false
    }

    return isValid
}

const updateUserProfile = async () => {
    if (!validateForm()) return

    try {
        await fetch(`${config.apiDomain}/users/update/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
        router.push(`/users/user_profile/${id}`)
    } catch (err) {
        console.error(err)
        alert('Failed to update profile.')
    }
}

async function fetchUserProfile() {
    try {
        const res = await fetch(`${config.apiDomain}/users/get/${id}`)
        if (!res.ok) throw new Error('Failed to fetch profile')
        const json = await res.json()
        Object.assign(data, json)
        Object.assign(form, json)
    } catch (error) {
        console.error(error)
    }
}

function onFileChange(event) {
    const file = event.target.files[0]
    if (file) {
        previewImage.value = URL.createObjectURL(file)
    }
}

function triggerFileInput() {
    fileInputRef.value?.click()
}

onMounted(async () => {
    fetchUserProfile()
    Object.assign(form, data)
})
</script>


<template>
    <div class="min-h-screen bg-white flex flex-col items-center text-[#035CB2]">
        <!-- กล่องรวม: ต้อง relative -->
        <div class="relative w-full h-72">
            <!-- รูป background อยู่ข้างล่าง -->
            <img src="/images/background.png" alt="Background Header"
                class="absolute inset-0 w-full h-full object-cover z-0" />

            <!-- กล่องเนื้อหาซ้อนทับ -->
            <div class="absolute inset-0 flex flex-col items-center justify-center z-10 gap-5">
                <h1 class="text-3xl font-bold text-outline-blue">Edit Profile</h1>

                <div class="relative w-24 h-24">
                    <!-- รูปโปรไฟล์ -->
                    <img :src="previewImage || '/images/profile.png'" alt="Profile"
                        class="w-full h-full bg-white rounded-full object-cover border" />

                    <!-- ปุ่มดินสอ -->
                    <button class="absolute bottom-0 right-0 bg-white text-sm text-black rounded-full p-2 shadow z-10"
                        @click="triggerFileInput">
                        ✏️
                    </button>

                    <!-- ซ่อนไว้ และคลิกผ่านปุ่ม -->
                    <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="onFileChange" />
                </div>
            </div>
        </div>


        <!-- ฟอร์ม -->
        <div class="w-full min-w-md p-5 px-7 -mt-10 bg-white rounded-t-3xl relative z-10 overflow-hidden">
            <form @submit.prevent="updateUserProfile" class="space-y-20 font-bold">
                <div>
                    <div class="">
                        <label class="block my-3 text-gray-700">First Name</label>
                        <input v-model="form.firstName" type="text" placeholder="first name"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]"
                            :class="{ 'border-red-500': errors.firstName }" />
                        <p v-if="errors.firstName" class="text-red-500 text-sm mt-1">{{ errors.firstName }}</p>
                    </div>

                    <div>
                        <label class="block my-3 text-gray-700">Last Name</label>
                        <input v-model="form.lastName" type="text" placeholder="last name"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]"
                            :class="{ 'border-red-500': errors.lastName }" />
                        <p v-if="errors.lastName" class="text-red-500 text-sm mt-1">{{ errors.lastName }}</p>
                    </div>

                    <div>
                        <label class="block my-3 text-gray-700">E-mail</label>
                        <input v-model="form.email" type="email" placeholder="email"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]"
                            :class="{ 'border-red-500': errors.email }" />
                        <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
                    </div>

                    <div>
                        <label class="block my-3 text-gray-700">Phone Number</label>
                        <input v-model="form.phone" type="tel" placeholder="phone number"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]"
                            :class="{ 'border-red-500': errors.phone }" />
                        <p v-if="errors.phone" class="text-red-500 text-sm mt-1">{{ errors.phone }}</p>
                    </div>

                    <div class="flex justify-between gap-4 mt-10 font-bold">
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