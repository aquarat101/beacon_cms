<script setup>
import { reactive } from 'vue'

const selectedType = ref('')

const types = [
    { label: 'Home', value: 'Home', icon: '/icons/home.png' },
    { label: 'School', value: 'School', icon: '/icons/school.png' },
    { label: 'Work', value: 'Work', icon: '/icons/work.png' },
    { label: 'Other', value: 'Other', icon: '/icons/other.png' },
]


const form = reactive({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
})

function handleRegister() {
    console.log('Form submitted:', form)
    // คุณสามารถ fetch ไป backend ได้ที่นี่
}

</script>

<template>
    <div class="min-h-screen bg-white flex flex-col items-center text-[#035CB2] font-bold">
        <!-- กล่องรวม: ต้อง relative -->
        <div class="relative w-full h-48">
            <!-- รูป background อยู่ข้างล่าง -->
            <img src="/images/background.png" alt="Register Header"
                class="absolute inset-0 w-full h-full object-cover z-0" />

            <!-- กล่องเนื้อหาซ้อนทับ -->
            <div class="absolute inset-0 flex justify-center items-center mb-5 z-10 gap-5 px-10">
                <h2 class="text-3xl font-bold text-outline-blue">Add new place</h2>
            </div>
        </div>

        <!-- ฟอร์ม -->
        <div class="w-full min-w-md p-5 px-7 -mt-10 bg-white rounded-t-3xl relative z-10 overflow-hidden">
            <form @submit.prevent="handleRegister" class="space-y-5 font-bold">
                <div>
                    <div class="">
                        <label class="block my-3 text-gray-700">Place name</label>
                        <input v-model="form.firstName" type="text" placeholder="place name"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                    </div>

                    <div>
                        <label class="block my-3 text-gray-700">Address</label>
                        <input v-model="form.lastName" type="text"
                            placeholder="1845/5-8 Phaholyothin Road, Latyao, Chatuchak Bangkok 10900" disabled
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                    </div>
                </div>

                <!-- กล่องล่าง -->
                <div class="">
                    <div class="max-w-sm mx-auto">
                        <label class="block mb-4 text-gray-700">Places type</label>
                        <div class="space-y-4">
                            <div v-for="type in types" :key="type.value" @click="selectedType = type.value" :class="[
                                'flex items-center px-4 py-3 rounded-xl border cursor-pointer hover:bg-blue',
                                selectedType === type.value
                                    ? 'border-[#0198FF] border-2 bg-blue-50'
                                    : 'border-gray-200 bg-white hover:bg-gray-50'
                            ]">
                                <div :class="[
                                    'w-10 h-10 flex items-center justify-center rounded-full mr-3',
                                    selectedType === type.value ? 'bg-blue-500 text-white' : 'bg-[#0099FF] text-gray-500'
                                ]">
                                    <img :src="type.icon" alt="icon" class="w-5 h-5 bg-[#0099FF]">
                                </div>
                                <span class="text-sm font-medium text-gray-800">{{ type.label }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-between gap-4 font-bold">
                    <NuxtLink to="/places/map" class="w-full">
                        <button type="submit"
                            class="flex justify-center w-full bg-white text-[#0198FF] border border-[#0198FF] py-3 rounded-2xl text-lg hover:bg-[#0198FF] hover:text-white transition">
                            Back
                        </button>
                    </NuxtLink>

                    <NuxtLink to="/places/map" class="w-full">
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