<script setup>
defineProps({
    userId: String,
    id: String,
    name: String,
    status: {
        type: String,
        default: 'offline',
    },
    updated: String,
    avatarUrl: {
        type: String,
        default: '/images/profile.png',
    },
})
</script>

<template>
    <NuxtLink :to="`/kids/kid_profile/${userId}/${id}`">
        <div class="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm p-3">
            <img :src="avatarUrl" class="w-12 h-12 rounded-full mr-3 object-cover" />
            <div class="flex-1">
                <p class="font-semibold text-gray-800">
                    {{ name }}
                    <span :class="[
                        'text-sm ml-2',
                        status === 'online' ? 'text-green-500' : 'text-gray-400'
                    ]">
                        ● {{ status.charAt(0).toUpperCase() + status.slice(1) }}
                    </span>
                </p>
                <p class="text-sm text-gray-500">Last updated: {{ updated }}</p>
            </div>
        </div>
    </NuxtLink>

</template>
