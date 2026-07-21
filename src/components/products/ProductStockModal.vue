<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { ProductStockService } from '@/services/product-stock.service'
import type { Product } from '@/types/product'
import type { ProductStockRow } from '@/types/product-stock'

interface Props {
    isOpen: boolean
    product: Product | null
}

interface Emits {
    (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const stockRows = ref<ProductStockRow[]>([])
const isLoading = ref(false)

const sizeColumns = computed(() => {
    const sizes = new Map<string, { id: string; nombre: string }>()

    stockRows.value.forEach((row) => {
        const sizeId = row.talla?.id ?? 'sin-talla'
        const sizeName = row.talla?.nombre ?? 'Sin talla'

        if (!sizes.has(sizeId)) {
            sizes.set(sizeId, { id: sizeId, nombre: sizeName })
        }
    })

    return Array.from(sizes.values())
})

const colorRows = computed(() => {
    const groups = new Map<string, {
        id: string
        nombre: string
        codigo_hex?: string | null
        stockBySize: Record<string, number>
    }>()

    stockRows.value.forEach((row) => {
        const colorId = row.color?.id ?? 'sin-color'
        const colorName = row.color?.nombre ?? 'Sin color'
        const sizeId = row.talla?.id ?? 'sin-talla'

        if (!groups.has(colorId)) {
            groups.set(colorId, {
                id: colorId,
                nombre: colorName,
                codigo_hex: row.color?.codigo_hex ?? null,
                stockBySize: {}
            })
        }

        const group = groups.get(colorId)
        if (group) {
            group.stockBySize[sizeId] = row.cantidad
        }
    })

    return Array.from(groups.values())
})

const totalStock = computed(() => stockRows.value.reduce((sum, item) => sum + item.cantidad, 0))
const totalVariants = computed(() => stockRows.value.length)

async function loadStock(): Promise<void> {
    if (!props.product?.id) {
        stockRows.value = []
        return
    }

    isLoading.value = true

    try {
        stockRows.value = await ProductStockService.getProductStock(props.product.id)
    } catch (error) {
        console.error('Error al cargar stock del producto:', error)
        stockRows.value = []
    } finally {
        isLoading.value = false
    }
}

watch(
    () => [props.isOpen, props.product?.id],
    async ([isOpen, productId]) => {
        if (!isOpen || !productId) {
            stockRows.value = []
            return
        }

        await loadStock()
    },
    { immediate: true }
)

function handleClose(): void {
    emit('close')
}
</script>

<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="stock-modal-title">
            <div class="modal-header">
                <div>
                    <p class="modal-eyebrow">Inventario</p>
                    <h2 id="stock-modal-title" class="modal-title">
                        Stock de {{ props.product?.nombre ?? 'producto' }}
                    </h2>
                </div>

                <button type="button" class="close-btn" aria-label="Cerrar modal" @click="handleClose">
                    ✕
                </button>
            </div>

            <div class="modal-body">
                <div class="summary-grid" aria-label="Resumen de stock">
                    <article class="summary-card">
                        <span class="summary-label">Variantes</span>
                        <strong class="summary-value">{{ totalVariants }}</strong>
                    </article>
                    <article class="summary-card">
                        <span class="summary-label">Unidades</span>
                        <strong class="summary-value">{{ totalStock }}</strong>
                    </article>
                </div>

                <div v-if="isLoading" class="state-box">Cargando stock...</div>
                <div v-else-if="stockRows.length === 0" class="state-box">No hay variantes registradas para este
                    producto.</div>

                <div v-else class="table-wrap">
                    <table class="stock-table">
                        <thead>
                            <tr>
                                <th class="sticky-col">Color</th>
                                <th v-for="size in sizeColumns" :key="size.id" class="size-head">
                                    {{ size.nombre }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="colorRow in colorRows" :key="colorRow.id">
                                <td class="sticky-col">
                                    <div class="color-cell">
                                        <span v-if="colorRow.codigo_hex" class="color-dot"
                                            :style="{ backgroundColor: colorRow.codigo_hex }" />
                                        <span>{{ colorRow.nombre }}</span>
                                    </div>
                                </td>
                                <td v-for="size in sizeColumns" :key="`${colorRow.id}-${size.id}`" class="stock-cell">
                                    {{ colorRow.stockBySize[size.id] ?? 0 }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.72);
    backdrop-filter: blur(4px);
    display: grid;
    place-items: center;
    padding: 1rem;
    z-index: 1000;
}

.modal-card {
    width: min(720px, 100%);
    max-height: 90vh;
    overflow: auto;
    background: #0f172a;
    border: 1px solid #243041;
    border-radius: 18px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
    color: #e2e8f0;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.15rem 1.2rem;
    border-bottom: 1px solid #243041;
}

.modal-eyebrow {
    margin: 0 0 0.2rem;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.12rem;
    color: #60a5fa;
}

.modal-title {
    margin: 0;
    font-size: 1.2rem;
}

.close-btn {
    border: none;
    border-radius: 10px;
    width: 40px;
    height: 40px;
    background: #1e293b;
    color: #f8fafc;
    cursor: pointer;
    font-size: 1.05rem;
}

.modal-body {
    padding: 1rem 1.2rem 1.2rem;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.9rem;
    margin-bottom: 1rem;
}

.summary-card {
    background: #111827;
    border: 1px solid #263245;
    border-radius: 14px;
    padding: 0.9rem 1rem;
}

.summary-label {
    display: block;
    color: #94a3b8;
    font-size: 0.85rem;
    margin-bottom: 0.3rem;
}

.summary-value {
    font-size: 1.4rem;
    color: #f8fafc;
}

.state-box {
    padding: 1.3rem;
    border-radius: 12px;
    background: #111827;
    border: 1px dashed #334155;
    color: #94a3b8;
    text-align: center;
}

.table-wrap {
    overflow-x: auto;
    border-radius: 12px;
    border: 1px solid #243041;
}

.stock-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 500px;
}

.stock-table thead {
    background: #111827;
}

.stock-table th,
.stock-table td {
    padding: 0.9rem 1rem;
    border-bottom: 1px solid #233041;
    text-align: center;
}

.stock-table th {
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05rem;
    font-size: 0.78rem;
}

.stock-table td {
    color: #e2e8f0;
    background: #0b1220;
}

.sticky-col {
    position: sticky;
    left: 0;
    z-index: 1;
    text-align: left;
    background: #0b1220;
}

.size-head {
    min-width: 110px;
}

.color-cell {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
}

.color-dot {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    border: 2px solid rgba(255, 255, 255, 0.6);
    flex: none;
}

.stock-cell {
    font-weight: 700;
    color: #34d399;
}

@media (max-width: 640px) {

    .modal-header,
    .modal-body {
        padding-left: 0.9rem;
        padding-right: 0.9rem;
    }

    .summary-grid {
        grid-template-columns: 1fr;
    }

    .modal-title {
        font-size: 1rem;
    }
}
</style>
