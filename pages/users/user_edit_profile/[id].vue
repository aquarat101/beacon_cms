<script setup>
import { reactive, onMounted, ref } from 'vue'
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

async function fetchUserProfile() {
    try {
        const res = await fetch(`${config.apiDomain}/users/get/${id}`)
        if (!res.ok) throw new Error('Failed to fetch profile')
        let json = await res.json()
        Object.assign(data, json)
        Object.assign(form, json)
                previewImage.value = json.avatarUrl || null  // สมมุติ backend ส่ง avatarUrl มา

    } catch (error) {
        console.error(error)
    }
}

async function updateUserProfile() {
    const formData = new FormData()

    // เพิ่มเฉพาะฟิลด์ที่เปลี่ยนแปลงจากข้อมูลเดิม
    for (const key in form) {
        if (form[key] !== data[key]) {
            formData.append(key, form[key])
        }
    }

    if (selectedFile.value) {
        formData.append('avatar', selectedFile.value)
    }

    try {
        const res = await fetch(`${config.apiDomain}/users/update/${id}`, {
            method: 'PUT',
            body: formData,
        })

        if (!res.ok) throw new Error('Failed to update')

        router.push(`/users/user_profile/${id}`)
    } catch (err) {
        console.error(err)
        alert('Failed to update profile.')
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

onMounted(async () => {
    await fetchUserProfile()
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
                        class="w-full h-full bg-white rounded-full object-cover" />

                    <!-- ปุ่มดินสอ -->
                    <button
                        class="absolute bottom-0 right-0 bg-[#035CB2] text-sm text-black rounded-full p-2 shadow z-10"
                        @click="triggerFileInput">
                        <img src="/image-icons/edit.png" alt="edit" class="w-5 h-5">
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
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]"></input>
                    </div>

                    <div>
                        <label class="block my-3 text-gray-700">Last Name</label>
                        <input v-model="form.lastName" type="text" placeholder="last name"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]"></input>
                    </div>

                    <div>
                        <label class="block my-3 text-gray-700">E-mail</label>
                        <input v-model="form.email" type="email" placeholder="email"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]"></input>
                    </div>

                    <div>
                        <label class="block my-3 text-gray-700">Phone Number</label>
                        <input v-model="form.phone" type="tel" placeholder="phone number"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]"></input>
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