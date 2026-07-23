<template>
    <div class="navbar-shell">
        <div>
            <p class="label">Dashboard</p>
            <h3>{{ authStore.fullName || 'Usuario' }}</h3>
        </div>

        <button class="logout-button" @click="handleLogout">Cerrar sesión</button>
    </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth/auth.store'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
    await authStore.logout()
    await router.push({ name: 'Login' })
}
</script>

<style scoped>
.navbar-shell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.label {
    margin: 0 0 0.2rem;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #94a3b8;
}

h3 {
    margin: 0;
    color: #f8fafc;
}

.logout-button {
    border: none;
    border-radius: 10px;
    background: #e11d48;
    color: white;
    padding: 0.7rem 1rem;
    font-weight: 700;
    cursor: pointer;
}
</style>