<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
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
    state: String,
})

// ✅ คำนวณลิงก์ตาม state
const linkTo = computed(() => {
    if (props.state === 'kidDetail') {
        return `/map_beacons/${props.userId}/${props.id}?openDetail=openKidDetail`
    } else {
        return `/kids/kid_profile/${props.userId}/${props.id}`
    }
})

// ✅ ฟังก์ชันไปหน้าใหม่ ถ้าเป็น map_beacons ให้ reload
function goAndMaybeReload() {
    if (linkTo.value.includes('/map_beacons/')) {
        // ไปหน้าและรีโหลดจริง
        window.location.href = linkTo.value
    } else {
        // ไปแบบ Nuxt navigation ปกติ
        router.push(linkTo.value)
    }
}
</script>

<template>
    <div @click="goAndMaybeReload"
        class="cursor-pointer flex items-center bg-white border border-gray-200 rounded-xl shadow-md p-3 hover:bg-gray-50 transition">
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

            <p :class="[
                'text-sm',
                status === 'online' ? 'text-gray-800' : 'text-sm text-gray-500'
            ]">
                Last updated:
            </p>

            <p :class="[
                'text-sm',
                status === 'online' ? 'text-gray-800' : 'text-sm text-gray-500'
            ]">
                {{ updated }}
            </p>
        </div>
    </div>
</template>
