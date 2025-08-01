<script setup>

const Histories = [
    {
        id: 1,
        place: "Home",
        date: "10/7/25 10:26 am",
    },
    {
        id: 2,
        place: "School",
        date: "10/7/25 10:26 am",
    },
    {
        id: 3,
        place: "School",
        date: "10/7/25 10:26 am",
    },
    {
        id: 4,
        place: "School",
        date: "10/7/25 10:26 am",
    },
    {
        id: 5,
        place: "School",
        date: "10/7/25 10:26 am",
    },
    {
        id: 6,
        place: "School",
        date: "10/7/25 10:26 am",
    },
    {
        id: 7,
        place: "School",
        date: "10/7/25 10:26 am",
    },
]

</script>

<template>
    <div class="min-h-screen bg-white flex flex-col justify-between items-center">
        <div class="w-full">
            <!-- กล่องรวม: ต้อง relative -->
            <div class="relative w-full h-72 text-[#035CB2]">
                <!-- รูป background อยู่ข้างล่าง -->
                <img src="/images/background.png" alt="Background Header"
                    class="absolute inset-0 w-full h-full object-cover z-0" />

                <!-- กล่องเนื้อหาซ้อนทับ -->
                <div class="absolute inset-0 flex flex-col items-center justify-center z-10 gap-5">
                    <div class="flex flex-col items-center">
                        <h1 class="text-3xl font-bold text-outline-blue">Kid 1</h1>

                        <p class="">Last updated: 10 mins ago</p>
                    </div>

                    <img src="/images/profile.png" alt="profile"
                        class="w-26 h-26 bg-white rounded-full border-3 border-green-500">

                    <div class="absolute top-54 right-48 px-2 rounded-full text-sm bg-green-500 text-white">
                        Online
                    </div>
                </div>
            </div>

            <div
                class="flex flex-col gap-2 w-full min-w-md px-8 pt-8 pb-6 -mt-10 font-bold bg-white rounded-t-3xl relative z-10 overflow-hidden">
                <div>
                    <div class="flex flex-row justify-between items-center w-full">
                        <div class="flex flex-col">
                            <p class="text-[#035CB2]">Beacon ID</p>

                            <p>12345</p>
                        </div>

                        <img src="/image-icons/trash.png" alt="delete" class="bg-[#E24B4B] w-10 h-10 p-2 rounded-full">

                    </div>

                    <div class="flex flex-col">
                        <p class="text-[#035CB2]">Remark</p>

                        <p>Kisra</p>
                    </div>

                    <div class="flex flex-col">
                        <p class="text-[#035CB2]">Place History</p>

                        <div class="max-h-85 overflow-y-auto space-y-4 mt-2">
                            <HistoryCard v-for="History in Histories" :key="History.id" :place="History.place"
                                :date="History.date" class="min-w-[200px] shrink-0" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex justify-between w-full px-8 gap-4 mb-10 font-bold">
            <NuxtLink to="/users/user_profile" class="w-full">
                <button type="submit"
                    class="flex justify-center w-full bg-white text-[#0198FF] border border-[#0198FF] py-3 rounded-2xl text-lg hover:bg-[#0198FF] hover:text-white transition">
                    Back
                </button>
            </NuxtLink>

            <NuxtLink to="/kids/kid_edit_profile" class="w-full">
                <button type="submit"
                    class="flex justify-center w-full bg-[#0198FF] text-white py-3 rounded-2xl text-lg hover:bg-[#0198FF] transition">
                    Edit
                </button>
            </NuxtLink>
        </div>

    </div>
</template>

<style>
.text-outline-blue {
    color: white;
    -webkit-text-stroke: 1.6px #035CB2;
}
</style>