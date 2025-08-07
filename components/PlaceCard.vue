<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router';

const router = useRouter()

// ✅ Destructure props ออกมาแบบนี้
const { userId, placeId, name, address, type, remark, lat, lng, status } = defineProps<{
    userId: string,
    placeId: string,
    name: string,
    address: string,
    type: string,
    remark: string,
    lat: string,
    lng: string,
    status: string,
}>()

const types = [
    { label: 'Home', value: 'Home', icon: '/image-icons/home.png' },
    { label: 'School', value: 'School', icon: '/image-icons/school.png' },
    { label: 'Work', value: 'Work', icon: '/image-icons/work.png' },
    { label: 'Other', value: 'Other', icon: '/image-icons/other.png' },
]

function sendData() {
    router.push({
        path: `/places/map/placeId/${userId}/${placeId}`,
        query: {
            name: name,
            address: address,
            type: type,
            remark: remark,
            lat: lat,
            lng: lng,
            status: status,
        }
    })
}

const iconSrc = computed(() => {
    const found = types.find((t) => t.value === type)
    return found?.icon || '/image-icons/other.png'
})

</script>


<template>
    <button @click="sendData" class="w-full">
        <div class="flex items-center bg-white w-full border border-gray-200 rounded-xl shadow-sm p-3 cursor-pointer">
            <img :src="iconSrc" class="bg-blue-300 p-2 w-12 h-12 rounded-full mr-3" />
            <div class="flex-1">
                <p class="flex justify-start ml-2 text-xl text-gray-800">
                    {{ name }}
                </p>
            </div>
        </div>
    </button>
</template>
