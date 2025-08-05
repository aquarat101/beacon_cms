<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const userId = route.params.userId
const kidId = route.params.id
const { public: config } = useRuntimeConfig()

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
    let valid = true

    // Clear all errors first
    errors.profileName = ''
    errors.beaconId = ''
    errors.remark = ''

    if (!form.profileName.trim()) {
        errors.profileName = 'Please enter profile name'
        valid = false
    }

    if (!form.beaconId.trim()) {
        errors.beaconId = 'Please enter Beacon ID'
        valid = false
    }

    if (!form.remark.trim()) {
        errors.remark = 'Please enter remark'
        valid = false
    }

    return valid
}

const updateKidProfile = async () => {
    if (!validateForm()) return

    try {
        await fetch(`${config.apiDomain}/kids/update/${userId}/${kidId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form),
        })
        router.push(`/kids/kid_profile/${userId}/${kidId}`)
    } catch (err) {
        console.error(err)
        alert('An error occurred while updating the profile')
    }
}
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
                <h1 class="text-2xl font-bold drop-shadow-md">Edit Kid Profile</h1>

                <button class="absolute top-45 right-42 bg-white text-sm text-black rounded-full p-2.5 pb-3 pl-3">
                    ✏️
                </button>

                <div class="flex flex-row gap-5">
                    <img src="/images/profile.png" alt="" class="w-24 h-24 bg-white rounded-full">

                </div>
            </div>
        </div>


        <!-- ฟอร์ม -->
        <div class="w-full min-w-md p-5 px-7 -mt-10 bg-white rounded-t-3xl relative z-10 overflow-hidden">
            <form @submit.prevent="updateKidProfile" class="space-y-20 font-bold">
                <div class="">
                    <div class="">
                        <label class="block my-3 text-gray-700">Profile name</label>
                        <input v-model="form.profileName" type="text" placeholder="profile name"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                        <p v-if="errors.profileName" class="text-red-500 text-sm mt-1">{{ errors.profileName }}</p>

                    </div>

                    <div>
                        <label class="block my-3 text-gray-700">Beacon ID</label>
                        <div class="flex gap-4">
                            <input v-model="form.beaconId" type="text" placeholder="beacon id"
                                class="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                            <p v-if="errors.beaconId" class="text-red-500 text-sm mt-1">{{ errors.beaconId }}</p>

                            <NuxtLink to="/kids/qrcode">
                                <button type="submit">
                                    <img src="/image-icons/qrcode.png" alt="qrcode"
                                        class="w-14 h-12 p-2 -mb-1 border-2 border-[#0198FF] rounded-md">
                                </button>
                            </NuxtLink>
                        </div>
                    </div>

                    <div>
                        <label class="block my-3 text-gray-700">Remark</label>
                        <input v-model="form.remark" type="text" placeholder="remark"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                        <p v-if="errors.remark" class="text-red-500 text-sm mt-1">{{ errors.remark }}</p>
                    </div>

                </div>

                <div class="flex justify-between gap-4 font-bold w-full">
                    <div class="flex justify-between w-full gap-4 mb-10 font-bold">
                        <button type="button" @click="router.push(`/users/user_profile/${userId}`)"
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

<style>
.text-outline-blue {
    color: white;
    -webkit-text-stroke: 1.6px #035CB2;
}
</style>