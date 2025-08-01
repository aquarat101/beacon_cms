<script setup>
defineProps({
    place: String,
    date: String,
})
</script>

<template>
    <div class="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3">
        <div class="flex-1">
            <p class="font-semibold text-gray-800">
                At {{ place }}
            </p>
            <p class="text-sm text-gray-500">{{ date }}</p>
        </div>
    </div>
</template>
