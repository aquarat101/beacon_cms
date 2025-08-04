<script setup>
defineProps({
    place: String,
    avatar: {
        type: String,
        default: '/images/profile.png',
    },
})
</script>

<template>
    <div class="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm p-3 cursor-pointer">
        <img :src="avatar" class="w-12 h-12 rounded-full mr-3" />
        <div class="flex-1">
            <p class="font-semibold text-gray-800">
                {{ place }}
            </p>
        </div>
    </div>
</template>
