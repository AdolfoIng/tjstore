<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { Eye, Pencil, Trash2 } from '@/lib/icons';
import { useProductStore } from '@/stores/product.store';
import AlertService from '@/services/sweetalert2/alert.service';
import ModalProduct from '@/components/products/ModalProduct.vue';
import ProductStockModal from '@/components/products/ProductStockModal.vue';
import ProductPagination from '@/components/products/ProductPagination.vue';
import { useDebounce } from '@/composables/useDebounce';
import type { Product, ProductForm } from '@/types/product';
import { roles } from '@/types/roles';
import { useAuthStore } from '@/stores/auth/auth.store';

const productStore = useProductStore();
const isModalOpen = ref(false)
const isStockModalOpen = ref(false)
const editingProduct = ref<Product | null>(null)
const selectedStockProduct = ref<Product | null>(null)
const searchQuery = ref('')

// ver Rol de usuario
const authStore = useAuthStore()

const [debouncedLoadProducts] = useDebounce((page: number) => {
    void productStore.loadProductos({
        page,
        pageSize: productStore.pageSize,
        searchQuery: searchQuery.value,
        resetPage: page === 1
    })
}, 350)

onMounted(() => {
    void productStore.loadProductos({ page: 1, searchQuery: '' })
})

watch(searchQuery, () => {
    void debouncedLoadProducts(1)
})

async function deleteProduct(product: Product): Promise<void> {
    const confirmed = await AlertService.confirm(
        'Eliminar Producto',
        `¿Está seguro que desea eliminar "${product.nombre}"? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
        await productStore.desactiveProduct(product.id);
        AlertService.toastSuccess('Producto eliminado correctamente');
    } catch (err) {
        AlertService.toastError('Error al eliminar el producto');
        console.error(err);
    }
}

function openCreateModal(): void {
    editingProduct.value = null
    isModalOpen.value = true
}

function openEditModal(product: Product): void {
    editingProduct.value = product;
    isModalOpen.value = true
}

function closeModal(): void {
    isModalOpen.value = false
    editingProduct.value = null
}

function openStockModal(product: Product): void {
    selectedStockProduct.value = product
    isStockModalOpen.value = true
}

function closeStockModal(): void {
    isStockModalOpen.value = false
    selectedStockProduct.value = null
}

async function handleSaveProduct(productForm: ProductForm): Promise<void> {
    try {
        if (editingProduct.value) {
            await productStore.updateProduct(editingProduct.value.id, productForm)
            AlertService.toastSuccess('Producto actualizado correctamente');
        } else {
            await productStore.createProduct(productForm)
            AlertService.toastSuccess('Producto creado correctamente');
        }
        closeModal()
    } catch (err) {
        AlertService.toastError(
            editingProduct.value
                ? 'Error al actualizar el producto'
                : 'Error al crear el producto'
        );
        console.error(err);
    }
}

function handlePageChange(page: number): void {
    void debouncedLoadProducts(page)
}
</script>

<template>
    <div class="products-container">
        <section class="section-search">
            <div class="search-wrapper">
                <label for="search-input" class="search-label">Buscar productos:</label>
                <input id="search-input" v-model="searchQuery" type="text"
                    placeholder="Buscar por nombre, descripción o marca..." class="search-input" />
            </div>

            <div class="actions-bar">
                <button v-if="authStore.role === roles.admin" class="btn btn-primary" @click="openCreateModal">
                    <span class="btn-icon">+</span>
                    <span class="btn-text">Agregar Producto</span>
                </button>
            </div>
        </section>

        <section class="section-table card">
            <div class="table-status">
                <span v-if="productStore.loading" class="loading-text">Cargando productos...</span>
                <span v-else-if="productStore.products.length === 0" class="empty-text">
                    No hay productos disponibles
                </span>
            </div>

            <!-- Tabla Productos -->

            <div v-if="!productStore.loading && productStore.products.length > 0" class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Imagen</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Marca</th>
                            <th>Precio</th>
                            <th class="actions">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(product, index) in productStore.products" :key="product.id">
                            <td class="text-center" data-label="N°">
                                {{ ((productStore.currentPage - 1) * productStore.pageSize) + index + 1 }}
                            </td>
                            <td class="image-cell" data-label="">
                                <img :src="product.imagen_url" width="50" class="product-image">
                            </td>
                            <td data-label="Nombre">{{ product.nombre }}</td>
                            <td class="text-truncate" :title="product.descripcion" data-label="Descripción">
                                {{ product.descripcion }}
                            </td>
                            <td data-label="Marca">{{ product.marcas?.nombre ?? 'N/A' }}</td>
                            <td class="text-right" data-label="Precio">${{ product.precio_venta.toFixed(2) }}</td>
                            <td class="actions" data-label="Acciones">
                                <div class="botones-actions">

                                    <button type="button" class="action-btn view-stock" title="Ver Stock"
                                        @click="openStockModal(product)">
                                        <Eye class="icon" />
                                    </button>
                                    <button v-if="authStore.role === roles.admin" type="button" class="action-btn edit"
                                        title="Editar" @click="openEditModal(product)">
                                        <Pencil class="icon" />
                                    </button>

                                    <button v-if="authStore.role === roles.admin" type="button"
                                        class="action-btn delete" title="Eliminar" @click="deleteProduct(product)">
                                        <Trash2 class="icon" />
                                    </button>

                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <ProductPagination v-if="productStore.totalItems > 0" :current-page="productStore.currentPage"
                :total-pages="productStore.totalPages" :total-items="productStore.totalItems"
                :page-size="productStore.pageSize" :is-loading="productStore.loading" @page-change="handlePageChange" />
        </section>

        <ModalProduct :is-open="isModalOpen" :product="editingProduct" :is-loading="productStore.loading"
            @close="closeModal" @save="handleSaveProduct" />

        <ProductStockModal :is-open="isStockModalOpen" :product="selectedStockProduct" @close="closeStockModal" />
    </div>
</template>

<style scoped>
.products-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
}

.section-search {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.botones-actions {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.search-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.search-label {
    font-size: 0.95rem;
    font-weight: 500;
    color: #8b949e;
}

.search-input {
    width: 100%;
    padding: 0.75rem 1rem;
    background: #0f172a;
    color: #e2e8f0;
    border: 1px solid #334155;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: all 0.2s ease;
}

.search-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.actions-bar {
    display: flex;
    gap: 0.5rem;
}

.btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.7rem 1rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
}

.btn-primary {
    background: #3ecf8e;
    color: white;
}

.btn-primary:hover {
    background: #2fbf7e;
    box-shadow: 0 4px 12px rgba(62, 207, 142, 0.3);
}

.btn-icon {
    font-size: 1.1rem;
    font-weight: bold;
}

.section-table {
    border-radius: 8px;
    background: var(--surface, #0f172a);
    overflow: hidden;
}

.table-status {
    padding: 2rem;
    text-align: center;
    color: #8b949e;
}

.loading-text,
.empty-text {
    display: inline-block;
}

.empty-text {
    color: #8b949e;
}

.table-responsive {
    overflow-x: hidden;
}

table {
    width: 100%;
    border-collapse: collapse;
    background: transparent;
}

thead {
    display: none;
}

tbody tr {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid #1f2937;
    border-radius: 16px;
    overflow: hidden;
    background: #0b1220;
}

td {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 0.5rem;
    padding: 0.9rem 1rem;
    border-bottom: 1px solid #17253a;
    color: #c9d1d9;
}

td:last-child {
    border-bottom: none;
}

td::before {
    content: attr(data-label);
    color: #94a3b8;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    white-space: nowrap;
}

.text-truncate {
    max-width: 100%;
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
}

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: flex-start;
    width: 100%;
}

.actions::before {
    content: attr(data-label);
    display: block;
    width: 100%;
    color: #94a3b8;
    font-size: 0.72rem;
    font-weight: 600;
    margin-bottom: 0.4rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    height: 44px;
    padding: 0 0.75rem;
    border: none;
    background: #111827;
    color: #c9d1d9;
    cursor: pointer;
    border-radius: 12px;
    transition: all 0.2s ease;
}

.action-btn:hover {
    background: #1f2a3a;
}

.action-btn.view-stock {
    background: #111f3d;
    color: #7dd3fc;
    border: 1px solid rgba(125, 211, 252, 0.25);
}

.action-btn.view-stock:hover {
    background: #12305a;
    color: #93c5fd;
}

.action-btn.edit:hover {
    color: #3ecf8e;
}

.action-btn.delete:hover {
    color: #ef4444;
}

.icon {
    width: 18px;
    height: 18px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
}

.card {
    border: 1px solid #30363d;
}

.image-cell {
    min-height: 110px;
    justify-content: center;
}

.product-image {
    width: 100%;
    max-width: 84px;
    height: 84px;
    object-fit: cover;
    border-radius: 10px;
}

@media (min-width: 768px) {
    .table-responsive {
        overflow-x: auto;
    }

    thead {
        display: table-header-group;
    }

    tbody tr {
        display: table-row;
        margin: 0;
        border: none;
        border-radius: 0;
        background: transparent;
    }

    td {
        display: table-cell;
        padding: 1rem;
        border-bottom: 1px solid #30363d;
        grid-template-columns: none;
    }

    td::before,
    .actions::before {
        display: none;
    }

    .actions {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.45rem;
        width: 140px;
        white-space: nowrap;
    }

    .action-btn {
        min-width: 36px;
        width: 36px;
        height: 36px;
        padding: 0;
        border-radius: 6px;
    }

    .product-image {
        width: 65px;
        height: 65px;
        border-radius: 4px;
    }
}

@media (max-width: 768px) {
    .section-search {
        flex-direction: column;
        align-items: stretch;
    }

    .search-wrapper {
        order: 1;
    }

    .actions-bar {
        order: 2;
    }

    .btn {
        width: 100%;
        justify-content: center;
    }
}

@media (max-width: 640px) {
    .products-container {
        padding: 0.75rem;
    }

    .image-cell {
        min-height: 130px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .product-image {
        width: 109px;
        height: 109px;
        max-width: none;
        border-radius: 4px;
    }
}
</style>