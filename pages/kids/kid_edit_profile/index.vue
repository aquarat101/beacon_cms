<script setup>
import { NuxtLink } from '#components';
import { reactive } from 'vue'

const form = reactive({
    profileName: '',
    beaconId: '',
    remark: '',
})

function handleRegister() {
    console.log('Form submitted:', form)
    // คุณสามารถ fetch ไป backend ได้ที่นี่
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
            <form @submit.prevent="handleRegister" class="space-y-20 font-bold">
                <div>
                    <div class="">
                        <label class="block my-3 text-gray-700">Profile name</label>
                        <input v-model="form.firstName" type="text" placeholder="profile name"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                    </div>

                    <div>
                        <label class="block my-3 text-gray-700">Beacon ID</label>
                        <div class="flex gap-4">
                            <input v-model="form.lastName" type="text" placeholder="beacon id"
                                class="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />

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
                        <input v-model="form.email" type="email" placeholder="remark"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                    </div>

                </div>

                <div class="flex justify-between gap-4 font-bold">
                    <NuxtLink to="/kids/kid_profile" class="w-full">
                        <button type="submit"
                            class="flex justify-center w-full bg-white text-[#0198FF] border border-[#0198FF] py-3 rounded-2xl text-lg hover:bg-[#0198FF] hover:text-white transition">
                            Cancel
                        </button>
                    </NuxtLink>

                    <NuxtLink to="/kids/kid_profile" class="w-full">
                        <button type="submit"
                            class="flex justify-center w-full bg-[#0198FF] text-white py-3 rounded-2xl text-lg hover:bg-[#0198FF] transition">
                            Save
                        </button>
                    </NuxtLink>
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