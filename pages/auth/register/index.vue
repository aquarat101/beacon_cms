<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
})

async function handleRegister() {
    try {
        const res = await fetch('http://localhost:3001/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(form),
        })

        const data = await res.json()
        console.log('Registered user id:', data.id)

        if (res.ok) {
            router.push(`/users/user_profile/${data.id}`)
        } else {
            alert(data.error || 'Registration failed')
        }

        // เคลียร์ฟอร์ม
        form.firstName = ''
        form.lastName = ''
        form.email = ''
        form.phone = ''
    } catch (err) {
        alert('เกิดข้อผิดพลาด: ' + err.message)
    }
}
</script>

<template>
    <div class="min-h-screen bg-white flex flex-col items-center">
        <!-- ส่วนบน: รูป header -->
        <img src="/images/header_register.png" alt="Register Header"
            class="w-full min-w-md max-h-100 object-cover z-0" />

        <!-- ฟอร์ม -->
        <div class="w-full min-w-md p-5 px-7 -mt-10 bg-white rounded-t-3xl relative z-10 overflow-hidden">
            <form @submit.prevent="handleRegister" class="space-y-20 font-bold">
                <div>
                    <div class="">
                        <label class="block my-3 text-gray-700">First Name</label>
                        <input v-model="form.firstName" type="text" placeholder="first name"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                    </div>

                    <div>
                        <label class="block my-3 text-gray-700">Last Name</label>
                        <input v-model="form.lastName" type="text" placeholder="last name"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                    </div>

                    <div>
                        <label class="block my-3 text-gray-700">E-mail</label>
                        <input v-model="form.email" type="email" placeholder="email"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                    </div>

                    <div>
                        <label class="block my-3 text-gray-700">Phone Number</label>
                        <input v-model="form.phone" type="tel" placeholder="phone number"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                    </div>
                </div>

                <button type="submit"
                    class="flex justify-center w-full bg-[#0198FF] font-bold text-white py-3 rounded-2xl text-lg hover:bg-[#0198FF] transition">
                    Register
                </button>
            </form>
        </div>
    </div>
</template>

<style>
.text-outline-blue {
    color: white;
    -webkit-text-stroke: 1.6px #035CB2;
}
</style>