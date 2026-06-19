<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useBrandStore } from '@/stores/brand.store'
import type { Brand } from '@/types/brand'

const brandStore = useBrandStore()
const name = ref('')
const editingBrand = ref<Brand | null>(null)

onMounted(() => {
    brandStore.loadBrands()
})

function startEdit(brand: Brand) {
    editingBrand.value = { ...brand }
    name.value = brand.nombre
}

function cancelEdit() {
    editingBrand.value = null
    name.value = ''
}

async function submitForm() {
    if (!name.value.trim()) {
        return
    }

    if (editingBrand.value) {
        await brandStore.updateBrand(editingBrand.value.id, name.value.trim())
    } else {
        await brandStore.addBrand(name.value.trim())
    }

    cancelEdit()
}

function removeBrand(id: number) {
    if (window.confirm('¿Eliminar esta marca?')) {
        brandStore.deleteBrand(id)
    }
}

function searchBrands(e: Event) {
    const query = (e.target as HTMLInputElement).value
    //brandStore.searchBrands(query)

    if (query.trim() === '' || query.length < 2) {
        brandStore.loadBrands()
        return
    }
    console.log('valor:', query.trim());
    brandStore.searchBrands(query.trim());

    // Agrega un pequeño retraso para evitar búsquedas excesivas
}
</script>

<template>
    <div class="brand-page container">


        <section class="brand-form card">
            <form @submit.prevent="submitForm" class="form-row">
                <input id="brand-name" type="text" v-model="name" placeholder="Escribe el nombre de la marca"
                    :disabled="brandStore.loading" />

                <div class="button-group">
                    <button type="submit" class="primary" :disabled="brandStore.loading || !name.trim()">
                        {{ editingBrand ? 'Actualizar' : 'Agregar' }}
                    </button>
                    <button type="button" class="secondary" @click="cancelEdit" v-if="editingBrand">
                        Cancelar
                    </button>
                </div>
            </form>

            <p v-if="brandStore.error" class="error-message">{{ brandStore.error }}</p>
        </section>

        <section class="brand-search">
            <h2>Buscar Marcas:</h2>
            <input type="text" placeholder="Buscar por nombre..." @input="(e) => searchBrands(e)" />
        </section>

        <section class="brand-table card">
            <div class="table-status">
                <span v-if="brandStore.loading">Cargando marcas...</span>
                <span v-else>Marcas disponibles: {{ brandStore.brands.length }}</span>
            </div>

            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Creación</th>
                            <th class="actions">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="brand in brandStore.brands" :key="brand.id">
                            <td>{{ brand.id }}</td>
                            <td>{{ brand.nombre }}</td>
                            <td>{{ brand.created_at ? new Date(brand.created_at).toLocaleDateString() : '-' }}</td>
                            <td class="actions">
                                <button type="button" class="edit" @click="startEdit(brand)">Editar</button>
                                <button type="button" class="delete" @click="removeBrand(brand.id)">Eliminar</button>
                            </td>
                        </tr>
                        <tr v-if="!brandStore.loading && brandStore.brands.length === 0">
                            <td colspan="4" class="empty-state">No hay marcas registradas.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</template>

<style scoped>
.brand-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background: #0f172a;
    color: #e2e8f0;
    /* min-height: 100vh; */
    padding-top: 2rem;
    margin-top: 1rem;
    font-family: 'Courier New', Courier, monospace;
}

.brand-form,
.brand-table {
    padding: 1.5rem;
    background: #111827;
    border: 1px solid rgba(148, 163, 184, 0.15);
    border-radius: 1rem;
    box-shadow: 0 20px 45px rgba(15, 23, 42, 0.35);
}

.brand-header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.brand-header h2,
.brand-header p {
    margin: 0;
}

.brand-header h2 {
    color: #ffffff;
}

.brand-header p {
    color: #94a3b8;
}

.form-row {
    display: grid;
    gap: 0.75rem;
}

.form-row input {
    width: 100%;
    padding: 0.85rem 1rem;
    border: 1px solid #334155;
    border-radius: 0.75rem;
    background: #0f172a;
    color: #e2e8f0;
    font-size: 1rem;
}

.form-row input::placeholder {
    color: #64748b;
}

.button-group {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

button {
    border: none;
    border-radius: 0.75rem;
    padding: 0.85rem 1.15rem;
    cursor: pointer;
    font-weight: 600;
    transition: transform 0.15s ease, background 0.15s ease;
}

button:hover:not(:disabled) {
    transform: translateY(-1px);
}

button.primary {
    background: #22c55e;
    color: #0f172a;
}

button.secondary {
    background: #1f2937;
    color: #e2e8f0;
}

button.edit {
    background: #2563eb;
    color: white;
}

button.delete {
    background: #ef4444;
    color: white;
}

button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.table-responsive {
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
    color: #e2e8f0;
}

th,
td {
    text-align: left;
    padding: 0.95rem 1rem;
    border-bottom: 1px solid #334155;
}

thead {
    background: #0f172a;
}

th {
    color: #94a3b8;
    font-weight: 700;
}

tbody tr:hover {
    background: rgba(148, 163, 184, 0.08);
}

.actions {
    min-width: 180px;
}

.empty-state {
    text-align: center;
    padding: 1.5rem;
    color: #94a3b8;
}

.error-message {
    margin-top: 0.5rem;
    color: #f87171;
}

.table-status {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
    color: #cbd5e1;
}

@media (min-width: 768px) {
    .brand-page {
        gap: 2rem;
    }

    .brand-header {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .form-row {
        grid-template-columns: 1fr auto auto;
        align-items: end;
    }
}
</style>
