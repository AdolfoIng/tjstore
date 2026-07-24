<template>
    <div class="login-shell">
        <div class="login-card">
            <div class="brand-block">
                <p class="eyebrow">Acceso al Sistema</p>
                <h1>System Store TJ</h1>
                <p class="subtitle">Ingresa tu correo y contraseña.</p>
            </div>

            <form class="login-form" @submit.prevent="handleLogin">
                <label class="field">
                    <span>Correo</span>
                    <input v-model="email" type="email" placeholder="usuario@empresa.com" autocomplete="email"
                        required />
                </label>

                <label class="field">
                    <span>Contraseña</span>
                    <input v-model="password" type="password" placeholder="••••••••" autocomplete="current-password"
                        required />
                </label>

                <button class="submit-button" type="submit" :disabled="authStore.loading">
                    <span v-if="authStore.loading">Iniciando sesión...</span>
                    <span v-else>Entrar</span>
                </button>

                <p v-if="authStore.error" class="error-message">{{ authStore.error }}</p>
            </form>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

async function handleLogin() {
    try {
        await authStore.login(email.value, password.value)
        await router.push({ name: 'Home' })
    } catch (error) {
        console.error('Error en login:', error)
    }
}
</script>

<style scoped>
.login-shell {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 1.5rem;
    background:
        radial-gradient(circle at top, rgba(56, 189, 248, 0.15), transparent 35%),
        linear-gradient(135deg, #07111f, #101826 50%, #0a0f18);
}

.login-card {
    width: min(100%, 430px);
    padding: 1.75rem;
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 22px;
    background: rgba(15, 23, 42, 0.86);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(12px);
}

.brand-block {
    margin-bottom: 1.5rem;
}

.eyebrow {
    margin: 0 0 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #38bdf8;
    font-size: 0.72rem;
    font-weight: 700;
}

h1 {
    margin: 0;
    color: #f8fafc;
    font-size: 1.8rem;
}

.subtitle {
    margin: 0.5rem 0 0;
    color: #94a3b8;
    line-height: 1.5;
}

.login-form {
    display: grid;
    gap: 1rem;
}

.field {
    display: grid;
    gap: 0.4rem;
}

.field span {
    color: #cbd5e1;
    font-size: 0.9rem;
}

.field input {
    width: 100%;
    border: 1px solid rgba(148, 163, 184, 0.28);
    border-radius: 12px;
    background: rgba(15, 23, 42, 0.8);
    color: #f8fafc;
    padding: 0.9rem 1rem;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field input:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.16);
}

.submit-button {
    border: none;
    border-radius: 12px;
    padding: 0.95rem 1rem;
    font-weight: 700;
    color: #03121f;
    background: linear-gradient(135deg, #38bdf8, #22c55e);
    cursor: pointer;
    transition: transform 0.18s ease, opacity 0.18s ease;
}

.submit-button:hover {
    transform: translateY(-1px);
}

.submit-button:disabled {
    opacity: 0.7;
    cursor: progress;
}

.error-message {
    margin: 0;
    color: #fda4af;
    font-size: 0.92rem;
}
</style>