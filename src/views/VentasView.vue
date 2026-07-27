<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Package, Plus, Search, Trash2 } from '@/lib/icons'
import { useSaleStore } from '@/stores/sale.store'
import AlertService from '@/services/sweetalert2/alert.service'
import ProductPagination from '@/components/products/ProductPagination.vue'
import { useDebounce } from '@/composables/useDebounce'
import type { SaleCartItem, SaleCatalogProduct, SaleCreatePayload, SaleVariantOption } from '@/types/venta'
import { useAuthStore } from '@/stores/auth/auth.store'


const saleStore = useSaleStore()
// Usuario autenticado
const authStore = useAuthStore()
const searchQuery = ref('')
const usuario_id = ref('')
const customerForm = reactive({
    //usuario_id: '',
    nombre_cliente: '',
    metodo_pago: 'EFECTIVO',
    observaciones: ''
})

const [debouncedLoadProducts] = useDebounce((page: number) => {
    void saleStore.loadCatalog({
        page,
        pageSize: saleStore.pageSize,
        searchQuery: searchQuery.value,
        resetPage: page === 1
    })
}, 300)

const total = computed(() => saleStore.subtotal)

onMounted(() => {
    void saleStore.loadCatalog({ page: 1, searchQuery: '' })
})

watch(searchQuery, () => {
    void debouncedLoadProducts(1)
})

function buildVariantLabel(variant: SaleVariantOption): string {
    const color = variant.color?.nombre ?? 'Sin color'
    const talla = variant.talla?.nombre ?? 'Sin talla'
    return `${color} • ${talla}`
}

function addToCart(product: SaleCatalogProduct, variant: SaleVariantOption): void {
    try {
        saleStore.addToCart(product, variant, 1)
        AlertService.toastSuccess(`Se agregó ${product.nombre} al carrito`)
    } catch (error) {
        AlertService.toastError((error as Error).message)
    }
}

function changeQuantity(itemId: string, amount: number): void {
    const item = saleStore.cart.find((cartItem) => cartItem.id === itemId)
    if (!item) return

    const nextQuantity = item.quantity + amount
    try {
        saleStore.updateItemQuantity(itemId, nextQuantity)
    } catch (error) {
        AlertService.toastError((error as Error).message)
    }
}

function removeFromCart(itemId: string): void {
    saleStore.removeFromCart(itemId)
}

async function handleSaveSale(): Promise<void> {
    if (!customerForm.nombre_cliente.trim()) {
        AlertService.toastError('Ingrese el nombre del cliente')
        return
    }

    if (saleStore.cart.length === 0) {
        AlertService.toastError('Agregue al menos un producto al carrito')
        return
    }

    if (!authStore.isAuthenticated) {
        AlertService.toastError('Usuario no autenticado')
        return
    }

    usuario_id.value = authStore.user?.id ?? '';

    const payload: SaleCreatePayload = {
        usuario_id: usuario_id.value,
        nombre_cliente: customerForm.nombre_cliente.trim(),
        metodo_pago: customerForm.metodo_pago,
        total: Number(total.value),
        observaciones: customerForm.observaciones.trim(),
        items: saleStore.cart.map((item: SaleCartItem) => ({
            producto_id: item.productId,
            producto_variante_id: item.variantId,
            cantidad: item.quantity,
            precio_unitario: item.unitPrice,
            subtotal: item.unitPrice * item.quantity
        }))
    }

    try {
        await saleStore.submitSale(payload)
        AlertService.toastSuccess('Venta registrada correctamente')
        customerForm.nombre_cliente = ''
        customerForm.observaciones = ''
    } catch (error) {
        AlertService.toastError((error as Error).message)
    }
}

function handlePageChange(page: number): void {
    void debouncedLoadProducts(page)
}
</script>

<template>
    <div class="sales-shell">
        <header class="sales-header">
            <div>
                <p class="eyebrow">Modulo de ventas</p>
                <h1>Registrar venta</h1>
            </div>
            <div class="pill-box">
                <span>{{ saleStore.itemCount }} artículos</span>
            </div>
        </header>

        <div class="sales-layout">

            <!-- Parte de Select Productos -->
            <section class="catalog-card">
                <div class="toolbar">
                    <label class="search-field">
                        <Search class="icon" />
                        <input v-model="searchQuery" type="text" placeholder="Buscar producto o marca" />
                    </label>
                </div>

                <div v-if="saleStore.loading" class="empty-state">Cargando productos...</div>
                <div v-else-if="saleStore.catalog.length === 0" class="empty-state">No hay productos disponibles</div>

                <div v-else class="product-grid">
                    <article v-for="product in saleStore.catalog" :key="product.id" class="product-card">
                        <div class="product-card__media">
                            <img v-if="product.imagen_url" :src="product.imagen_url" :alt="product.nombre" />
                            <div v-else class="product-card__placeholder">
                                <Package class="icon" />
                            </div>
                        </div>

                        <div class="product-card__body">
                            <h3>{{ product.nombre }}</h3>
                            <p class="product-card__brand">{{ product.marcas?.nombre ?? 'Sin marca' }}</p>
                            <p class="product-card__price">${{ product.precio_venta.toFixed(2) }}</p>

                            <div class="variant-list">
                                <button v-for="variant in product.variants" :key="variant.id" type="button"
                                    class="variant-chip" :disabled="variant.stock_actual <= 0"
                                    @click="addToCart(product, variant)">
                                    <span>{{ buildVariantLabel(variant) }}</span>
                                    <small>{{ variant.stock_actual }} disp.</small>
                                </button>
                            </div>
                        </div>
                    </article>
                </div>

                <ProductPagination v-if="saleStore.totalItems > 0" :current-page="saleStore.currentPage"
                    :total-pages="saleStore.totalPages" :total-items="saleStore.totalItems"
                    :page-size="saleStore.pageSize" :is-loading="saleStore.loading" @page-change="handlePageChange" />
            </section>

            <!-- Detalle de Venta -->
            <aside class="cart-card">
                <div class="cart-card__header">
                    <h2>Carrito</h2>
                    <span>{{ saleStore.itemCount }} items</span>
                </div>

                <div v-if="saleStore.cart.length === 0" class="empty-state">Aún no agregas productos</div>

                <!-- Lista del carrito -->
                <div v-else class="cart-list">
                    <article v-for="item in saleStore.cart" :key="item.id" class="cart-item">
                        <div>
                            <h3>{{ item.productName }}</h3>
                            <p>MARCA: {{ item.brandName }}</p>
                            <p>{{ item.variantLabel }}</p>
                            <p>CANTIDAD: {{ item.quantity }}</p>
                            <p class="cart-item__price">${{ item.unitPrice.toFixed(2) }}</p>
                        </div>

                        <div class="cart-item__actions">
                            <div class="qty-control">
                                <button type="button" @click="changeQuantity(item.id, -1)">−</button>
                                <span>{{ item.quantity }}</span>
                                <button type="button" @click="changeQuantity(item.id, 1)">+</button>
                            </div>
                            <button type="button" class="icon-button" @click="removeFromCart(item.id)">
                                <Trash2 class="icon" />
                            </button>
                        </div>
                    </article>
                </div>

                <div class="summary-block">
                    <div class="summary-row">
                        <span>Subtotal</span>
                        <strong>${{ total.toFixed(2) }}</strong>
                    </div>
                    <div class="summary-row">
                        <span>Total</span>
                        <strong>${{ total.toFixed(2) }}</strong>
                    </div>
                </div>

                <div class="form-grid">
                    <label>
                        <span>Cliente</span>
                        <input v-model="customerForm.nombre_cliente" type="text" placeholder="Nombre del cliente" />
                    </label>
                    <label>
                        <span>Pago</span>
                        <select v-model="customerForm.metodo_pago">
                            <option value="EFECTIVO">Efectivo</option>
                            <option value="QR">QR</option>
                            <option value="TRANSFERENCIA">Transferencia</option>
                        </select>
                    </label>
                    <label class="full-span">
                        <span>Observaciones</span>
                        <textarea v-model="customerForm.observaciones" rows="3"
                            placeholder="Ej: entrega a domicilio, nota del cliente..." />
                    </label>
                </div>

                <button type="button" class="primary-button" @click="handleSaveSale">
                    <Plus class="icon" />
                    Confirmar venta
                </button>
            </aside>
        </div>
    </div>
</template>

<style scoped>
.sales-shell {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
}

.sales-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    background: #0f172a;
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 8px;
    padding: 10px;
}

.eyebrow {
    margin: 0 0 0.25rem;
    color: #8b5cf6;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 0.78rem;
}

.sales-header h1,
.cart-card__header h2,
.product-card__body h3,
.cart-item h3 {
    margin: 0;
    color: rgb(188, 185, 185);
}

.pill-box {
    padding: 0.55rem 0.9rem;
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.16);
    color: #bfdbfe;
    font-weight: 600;
}

.sales-layout {
    display: grid;
    grid-template-columns: 1.0fr 1.0fr;
    gap: 1rem;
}

.catalog-card,
.cart-card {
    background: #0f172a;
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 18px;
    padding: 1rem;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.25);
}

.toolbar {
    margin-bottom: 1rem;
}

.search-field {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.9rem 1rem;
    border-radius: 12px;
    background: rgba(15, 23, 42, 0.75);
    border: 1px solid rgba(148, 163, 184, 0.2);
}

.search-field input,
.form-grid input,
.form-grid select,
.form-grid textarea {
    width: 100%;
    background: transparent;
    color: #e2e8f0;
    border: none;
    outline: none;
    font: inherit;
}

.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 0.9rem;
}

.product-card {
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: rgba(15, 23, 42, 0.65);
    border-radius: 16px;
    overflow: hidden;
}

.product-card__media {
    margin-top: 0.5rem;
    height: 180px;
    background: #111827;
    display: flex;
    justify-content: center;
    align-items: center;
}

.product-card__media img,
.product-card__placeholder {
    max-width: 80%;
    max-height: 100%;
    object-fit: cover;
    border-radius: 16px;
}

.product-card__media img {
    width: auto;
    height: auto;
}

.product-card__placeholder {
    display: grid;
    place-items: center;
    color: #94a3b8;
}

.product-card__body {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    padding: 0.9rem;
}

.product-card__brand,
.product-card__price,
.cart-item p {
    margin: 0;
    color: #94a3b8;
}

.product-card__price {
    color: #34d399;
    font-weight: 700;
}

.variant-list {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
}

.variant-chip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.6rem 0.75rem;
    border-radius: 10px;
    border: 1px solid rgba(148, 163, 184, 0.24);
    background: rgba(30, 41, 59, 0.8);
    color: #e2e8f0;
    cursor: pointer;
}

.variant-chip:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.cart-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.cart-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    color: #93c5fd;
}

.cart-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.cart-item {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.8rem;
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 14px;
    background: rgba(15, 23, 42, 0.7);
}

.cart-item__actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.6rem;
}

.qty-control {
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.qty-control button,
.icon-button,
.primary-button {
    border: none;
    cursor: pointer;
}

.qty-control button {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #1d4ed8;
    color: white;
    font-size: 1rem;
}

.icon-button {
    padding: 0.35rem;
    border-radius: 10px;
    background: rgba(239, 68, 68, 0.14);
    color: #fca5a5;
}

.summary-block {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.9rem;
    border-radius: 14px;
    background: rgba(30, 41, 59, 0.75);
}

.summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #34d399;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;
}

.form-grid label {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.full-span {
    grid-column: 1 / -1;
}

.form-grid span {
    font-size: 0.85rem;
    color: #93c5fd;
}

.form-grid input,
.form-grid select,
.form-grid textarea {
    border: 1px solid rgba(148, 163, 184, 0.24);
    border-radius: 10px;
    padding: 0.72rem 0.8rem;
    background: rgba(2, 6, 23, 0.8);
}

.primary-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.9rem 1rem;
    border-radius: 12px;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    color: white;
    font-weight: 700;
}

.empty-state {
    padding: 1rem;
    text-align: center;
    color: #94a3b8;
}

.icon {
    width: 16px;
    height: 16px;
}

@media (max-width: 920px) {
    .sales-layout {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {

    .sales-header,
    .cart-item,
    .cart-card__header {
        flex-direction: column;
        align-items: stretch;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }
}
</style>