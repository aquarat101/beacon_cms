<script setup>
defineProps({
    place: String,
    date: String,
})
</script>

<template>
    <div class="flex items-center bg-white border border-gray-300 text-gray-800 rounded-xl shadow-sm px-4 py-3">
        <div class="flex-">
            <p class="font-bold">
                At {{ place }}
            </p>
            <p class="text-sm">{{ date }}</p>
        </div>
    </div>
</template>
