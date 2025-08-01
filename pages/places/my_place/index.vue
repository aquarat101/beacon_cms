<script setup>
import PlaceCard from '~/components/PlaceCard.vue'

const places = [
    {
        id: 1,
        place: 'Home',
        avatar: '/images/profile.png',
    },
    {
        id: 2,
        place: 'School',
        avatar: '/images/profile.png',
    },
    {
        id: 3,
        place: 'Kisra',
        avatar: '/images/profile.png',
    },
    {
        id: 4,
        place: 'KU',
        avatar: '/images/profile.png',
    },
    {
        id: 5,
        place: 'Major',
        avatar: '/images/profile.png',
    },

]
</script>

<template>
    <div class="min-h-screen bg-white flex flex-col justify-between items-center text-[#035CB2]">
        <!-- กล่องรวม: ต้อง relative -->
        <div class="relative w-full h-48">
            <!-- รูป background อยู่ข้างล่าง -->
            <img src="/images/background.png" alt="Register Header"
                class="absolute inset-0 w-full h-full object-cover z-0" />

            <!-- กล่องเนื้อหาซ้อนทับ -->
            <div class="absolute inset-0 flex flex-col justify-center z-10 gap-5 px-10 mb-5">
                <div class="flex justify-between mb-4">
                    <h2 class="text-3xl font-bold text-outline-blue">My Places</h2>
                    <NuxtLink to="/places/map">
                        <button
                            class="bg-[#0198FF] text-white rounded-full w-8 h-8 text-4xl flex items-end justify-center">
                            +
                        </button>
                    </NuxtLink>
                </div>
            </div>
        </div>

        <!-- กล่องล่าง -->
        <div class="-mt-40 rounded-t-3xl bg-white px-8 py-6 w-full relative z-10">
            <!-- ทำแนวตั้งด้วย flex + scroll -->
            <div class="max-h-120 overflow-y-auto space-y-4 space-x-1.5">
                <PlaceCard v-for="place in places" :key="place.id" :place="place.place" :avatar="place.avatar"
                    class="min-w-[200px] shrink-0" />
            </div>
        </div>

        <img src="/images/footer.png" alt="footer">
    </div>
</template>

<style>
.text-outline-blue {
    color: white;
    -webkit-text-stroke: 1.6px #035CB2;
}
</style>