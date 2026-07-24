<template>
    <div class="navbar-shell">
        <button class="mobile-menu-button" @click="emit('toggle-sidebar')" aria-label="Abrir menú">
            <Menu class="menu-icon" />
        </button>

        <div class="welcome-block">
            <p class="label">Dashboard</p>
            <h3>{{ authStore.fullName || 'Usuario' }}</h3>
        </div>

        <div class="user-menu" ref="dropdownRef">
            <button class="user-trigger" @click.stop="toggleMenu" aria-haspopup="true" :aria-expanded="isMenuOpen">
                <div class="avatar-badge" aria-hidden="true">{{ initials }}</div>
                <span class="user-meta">
                    <span class="user-name">{{ authStore.fullName || 'Usuario' }}</span>
                    <span class="user-role">{{ roleLabel }}</span>
                </span>
                <ChevronDown class="chevron-icon" :class="{ rotated: isMenuOpen }" />
            </button>

            <div v-if="isMenuOpen" class="dropdown-menu">
                <button class="dropdown-item" @click="handleSettings">
                    <Settings class="item-icon" />
                    <span>Ajustes</span>
                </button>
                <button class="dropdown-item danger" @click="handleLogout">
                    <LogOut class="item-icon" />
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ChevronDown, LogOut, Menu, Settings } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useRouter } from 'vue-router'

const emit = defineEmits<{
    (event: 'toggle-sidebar'): void
}>()

const authStore = useAuthStore()
const router = useRouter()
const isMenuOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const initials = computed(() => {
    const fullName = authStore.fullName || 'Usuario'
    const initialsValue = fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')

    return initialsValue || 'U'
})

const roleLabel = computed(() => {
    const role = authStore.role?.toLowerCase()

    if (role === 'admin') {
        return 'Administrador'
    }

    return 'Usuario'
})

function toggleMenu() {
    isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
    isMenuOpen.value = false
}

function handleSettings() {
    closeMenu()
}

async function handleLogout() {
    closeMenu()
    await authStore.logout()
    await router.push({ name: 'Login' })
}

function handleOutsideClick(event: MouseEvent) {
    if (!dropdownRef.value?.contains(event.target as Node)) {
        closeMenu()
    }
}

onMounted(() => {
    document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleOutsideClick)
})
</script>

<style scoped>
.navbar-shell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.mobile-menu-button {
    display: none;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border: 1px solid rgba(148, 163, 184, 0.22);
    border-radius: 0.9rem;
    background: rgba(15, 23, 42, 0.7);
    color: #f8fafc;
    cursor: pointer;
}

.menu-icon {
    width: 1.15rem;
    height: 1.15rem;
}

.welcome-block {
    min-width: 0;
}

.label {
    margin: 0 0 0.2rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #94a3b8;
}

h3 {
    margin: 0;
    color: #f8fafc;
    font-size: 1rem;
}

.user-menu {
    position: relative;
}

.user-trigger {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.4rem 0.6rem;
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.72);
    color: #f8fafc;
    cursor: pointer;
}

.avatar-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 50%;
    background: linear-gradient(135deg, #38bdf8, #2563eb);
    color: #eff6ff;
    font-size: 0.85rem;
    font-weight: 800;
}

.user-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
}

.user-name {
    font-size: 0.92rem;
    font-weight: 700;
}

.user-role {
    font-size: 0.72rem;
    color: #94a3b8;
}

.chevron-icon {
    width: 1rem;
    height: 1rem;
    color: #cbd5e1;
    transition: transform 0.2s ease;
}

.chevron-icon.rotated {
    transform: rotate(180deg);
}

.dropdown-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 0.6rem);
    min-width: 12rem;
    display: flex;
    flex-direction: column;
    padding: 0.4rem;
    gap: 0.25rem;
    border: 1px solid rgba(148, 163, 184, 0.14);
    border-radius: 0.85rem;
    background: rgba(15, 23, 42, 0.98);
    box-shadow: 0 18px 40px rgba(2, 6, 23, 0.34);
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    width: 100%;
    padding: 0.72rem 0.85rem;
    border: none;
    border-radius: 0.75rem;
    background: transparent;
    color: #e2e8f0;
    font-weight: 600;
    cursor: pointer;
    text-align: left;
}

.dropdown-item:hover {
    background: rgba(148, 163, 184, 0.1);
}

.dropdown-item.danger {
    color: #fda4af;
}

.item-icon {
    width: 1rem;
    height: 1rem;
}

@media (max-width: 768px) {
    .navbar-shell {
        gap: 0.75rem;
    }

    .mobile-menu-button {
        display: inline-flex;
    }

    .welcome-block {
        flex: 1;
    }

    .user-meta {
        display: none;
    }
}
</style>