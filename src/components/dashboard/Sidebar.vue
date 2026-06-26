<script lang="ts" setup>

</script>

<template>
    <nav>
        <div>
            <h3>Inventory</h3>
        </div>
        <ul>
            <li><router-link to="/">Home</router-link></li>
            <li><router-link to="/products">Productos</router-link></li>
            <li><router-link to="/sales">Ventas</router-link></li>
        </ul>
    </nav>
</template>

<style scoped>
ul {
    list-style-type: none;
    padding: 0;
}

li {
    margin-bottom: 0.8rem;
}

a {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    padding: 0.75rem 1rem;
    color: var(--text-muted, #cbd5e1);
    text-decoration: none;
    border-radius: 0.9rem;
    transition:
        background 0.2s ease,
        color 0.2s ease,
        transform 0.2s ease;
}

a:hover {
    background: rgba(148, 163, 184, 0.12);
    color: var(--text-main, #f8fafc);
    transform: translateX(1px);
}
</style>