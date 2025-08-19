<script setup>
import { ref } from 'vue'
const open1 = ref(false)
const open2 = ref(false)
const open3 = ref(false)
</script>

<template>
    <div class="min-h-screen bg-white flex flex-col justify-between items-center text-[#035CB2]">
        <!-- กล่องรวม: ต้อง relative -->
        <div class="relative w-full h-40">
            <!-- รูป background อยู่ข้างล่าง -->
            <img src="/images/background.png" alt="Register Header"
                class="absolute inset-0 w-full h-full object-cover z-0" />

            <!-- กล่องเนื้อหาซ้อนทับ -->
            <div class="absolute inset-0 flex justify-center items-center mb-5 z-10 gap-5 px-10">
                <h2 class="text-3xl font-bold text-outline-blue">Other</h2>
            </div>
        </div>

        <div class="-mt-6 bg-white rounded-t-3xl px-6 py-6 flex-1 max-h-200 overflow-y-auto w-full z-10 space-y-4">
            <div class="bg-white rounded-xl shadow p-4">
                <div class="flex justify-between items-center cursor-pointer" @click="open1 = !open1">
                    <div class="flex items-center gap-2">
                        <img src="/image-icons/faq.png" class="w-6 h-6" />
                        <span class="font-semibold">FAQ</span>
                    </div>
                    <span>{{ open1 ? '▲' : '▼' }}</span>
                </div>

                <div v-if="open1" class="mt-2 text-sm text-gray-600 space-y-2">
                    <div>
                        <span class="text-blue-800 font-bold">1. Lorem Ipsum</span><br>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </div>
                    <div>
                        <span class="text-blue-800 font-bold">2. Lorem Ipsum</span><br>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow p-4">
                <div class="flex justify-between items-center cursor-pointer" @click="open2 = !open2">
                    <div class="flex items-center gap-2">
                        <img src="/image-icons/policy.png" class="w-6 h-6" />
                        <span class="font-semibold">Privacy Policy</span>
                    </div>
                    <span>{{ open2 ? '▲' : '▼' }}</span>
                </div>

                <div v-if="open2" class="mt-2 text-sm text-gray-600 space-y-2">
                    <p>Dorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a,
                        mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut
                        interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus. Class
                        aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent
                        auctor purus luctus enim egestas, ac scelerisque ante pulvinar. Donec ut rhoncus ex. Suspendisse
                        ac rhoncus nisl, eu tempor urna. Curabitur vel bibendum lorem. Morbi convallis convallis diam
                        sit amet lacinia. Aliquam in elementum tellus.
                    </p>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow p-4">
                <div class="flex justify-between items-center cursor-pointer" @click="open3 = !open3">
                    <div class="flex items-center gap-2">
                        <img src="/image-icons/about.png" class="w-6 h-6" />
                        <span class="font-semibold">About us</span>
                    </div>
                    <span>{{ open3 ? '▲' : '▼' }}</span>
                </div>

                <div v-if="open3" class="mt-2 text-sm text-gray-600 space-y-2">
                    <p>Dorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a,
                        mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut
                        interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus. Class
                        aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent
                        auctor purus luctus enim egestas, ac scelerisque ante pulvinar. Donec ut rhoncus ex. Suspendisse
                        ac rhoncus nisl, eu tempor urna. Curabitur vel bibendum lorem. Morbi convallis convallis diam
                        sit amet lacinia. Aliquam in elementum tellus.
                    </p>
                </div>
            </div>
        </div>

        <div class="relative w-full">
          <img src="/images/footer.png" alt="footer" class="z-10 object-cover w-full">
        </div>
    </div>

</template>
