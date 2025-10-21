<script setup>
defineProps({
    placeType: String,
    date: String,
    state: String
})

</script>

<template>
    <div class="flex items-center bg-white border border-gray-300 text-gray-800 rounded-xl shadow-sm px-4 py-3">
        <div class="flex-">
            <div class="flex items-center gap-2">
                <img :src="state === 'inside' ? '/image-icons/inside.png' : '/image-icons/outside.png'" alt="state"
                    class="w-6 h-6">

                <p class="text-md font-bold">
                    At {{ placeType }}
                </p>
            </div>
            <p class="text-sm text-gray-500">{{ date }}</p>
        </div>
    </div>
</template>
