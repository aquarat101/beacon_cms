<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { public: config } = useRuntimeConfig()

const form = reactive({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
})

const errors = reactive({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
})

async function handleRegister() {
    // เคลียร์ error เดิมก่อน
    errors.firstName = ''
    errors.lastName = ''
    errors.email = ''
    errors.phone = ''

    try {
        const res = await fetch(`${config.apiDomain}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(form),
        })

        const data = await res.json()
        console.log("res", res)

        if (res.ok) {
            router.push(`/users/user_profile/${data.id}`)
        } else {
            // สมมุติ API ส่ง error กลับมาแบบนี้:
            // { error: { email: "Email already exists", phone: "Invalid format" } }
            if (data.error && typeof data.error === 'object') {
                Object.assign(errors, data.error)
            } else {
                alert(data.error || 'Registration failed')
            }
        }

        // เคลียร์ฟอร์มถ้าสำเร็จ
        if (res.ok) {
            form.firstName = ''
            form.lastName = ''
            form.email = ''
            form.phone = ''
        }
    } catch (err) {
        alert('เกิดข้อผิดพลาด: ' + err.message)
    }
}
</script>

<template>
    <div class="min-h-screen bg-white flex flex-col items-center">
        <img src="/images/header_register.png" alt="Register Header"
            class="w-full min-w-md max-h-100 object-cover z-0" />

        <div class="w-full min-w-md p-7 -mt-10 bg-white rounded-t-3xl relative z-10 overflow-hidden">
            <form @submit.prevent="handleRegister" class="space-y-20 font-bold max-w-[60rem] m-auto">
                <div class="flex flex-col gap-4">
                    <div>
                        <label class="block mb-2 text-gray-700">First Name</label>
                        <input v-model="form.firstName" type="text" placeholder="First Name"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                        <p v-if="errors.firstName" class="text-red-500 text-sm mt-1">{{ errors.firstName }}</p>
                    </div>

                    <div>
                        <label class="block mb-2 text-gray-700">Last Name</label>
                        <input v-model="form.lastName" type="text" placeholder="Last Name"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                        <p v-if="errors.lastName" class="text-red-500 text-sm mt-1">{{ errors.lastName }}</p>
                    </div>

                    <div>
                        <label class="block mb-2 text-gray-700">E-mail</label>
                        <input v-model="form.email" type="email" placeholder="Email"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                        <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
                    </div>

                    <div>
                        <label class="block mb-2 text-gray-700">Phone Number</label>
                        <input v-model="form.phone" type="tel" placeholder="Phone number"
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0198FF] focus:ring-[#0198FF]" />
                        <p v-if="errors.phone" class="text-red-500 text-sm mt-1">{{ errors.phone }}</p>
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
