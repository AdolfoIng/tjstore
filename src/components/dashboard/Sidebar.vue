<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Boxes, Home, Package } from '@/lib/icons'

const emit = defineEmits<{
    (event: 'close-sidebar'): void
}>()

const route = useRoute()

const navigationItems = [
    { name: 'Home', label: 'Inicio', to: '/dashboard', icon: Home },
    { name: 'Products', label: 'Productos', to: '/dashboard/products', icon: Boxes },
    { name: 'Sales', label: 'Ventas', to: '/dashboard/sales', icon: Package },
] as const

const isActiveRoute = computed(() => (routeName: string) => route.name === routeName)

function handleNavigate() {
    emit('close-sidebar')
}
</script>

<template>
    <nav class="sidebar-shell">
        <div class="brand-block">
            <div class="brand-badge">Tj</div>
            <div>
                <p class="eyebrow">Panel</p>
                <h3>Inventory</h3>
            </div>
        </div>

        <ul class="nav-list">
            <li v-for="item in navigationItems" :key="item.name">
                <router-link :to="item.to" :class="{ 'is-active': isActiveRoute(item.name) }"
                    exact-active-class="is-active" class="nav-link" @click="handleNavigate">
                    <component :is="item.icon" class="nav-icon" />
                    <span>{{ item.label }}</span>
                </router-link>
            </li>
        </ul>
    </nav>
</template>

<style scoped>
.sidebar-shell {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    height: 100%;
}

.brand-block {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.35rem 0.25rem 0.75rem;
    border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.brand-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.4rem;
    height: 2.4rem;
    border-radius: 0.8rem;
    background: linear-gradient(135deg, #38bdf8, #2563eb);
    color: #eff6ff;
    font-weight: 800;
}

.eyebrow {
    margin: 0 0 0.15rem;
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #94a3b8;
}

h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #f8fafc;
}

.nav-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.nav-link {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.9rem 0.95rem;
    color: #cbd5e1;
    text-decoration: none;
    border-radius: 1rem;
    font-weight: 600;
    transition:
        background 0.2s ease,
        color 0.2s ease,
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

.nav-link:hover {
    background: rgba(59, 130, 246, 0.12);
    color: #f8fafc;
    transform: translateX(2px);
}

.nav-link.is-active {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.24), rgba(14, 165, 233, 0.18));
    color: #f8fafc;
    box-shadow: inset 0 0 0 1px rgba(96, 165, 250, 0.36), 0 10px 24px rgba(37, 99, 235, 0.18);
}

.nav-icon {
    width: 1.1rem;
    height: 1.1rem;
    flex-shrink: 0;
}
</style>