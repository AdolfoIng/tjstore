<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { ProductStockService } from '@/services/productos/product-stock.service'
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

function getSizeSortValue(sizeName: string): number {
    const normalized = sizeName.trim().toUpperCase().replace(/\s+/g, '')

    const directOrder = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL']
    const directIndex = directOrder.indexOf(normalized)
    if (directIndex >= 0) return directIndex + 1

    if (normalized === 'XXL' || normalized === '2XL') return 5
    if (normalized === 'XXXL' || normalized === '3XL') return 6
    if (normalized === 'XXXXL' || normalized === '4XL') return 7
    if (normalized === 'XXXXXL' || normalized === '5XL') return 8

    const numericMatch = normalized.match(/^(\d+)XL$/)
    if (numericMatch) {
        return 4 + Number(numericMatch[1])
    }

    return 1000
}

const sizeColumns = computed(() => {
    const sizes = new Map<string, { id: string; nombre: string }>()

    stockRows.value.forEach((row) => {
        const sizeId = row.talla?.id ?? 'sin-talla'
        const sizeName = row.talla?.nombre ?? 'Sin talla'

        if (!sizes.has(sizeId)) {
            sizes.set(sizeId, { id: sizeId, nombre: sizeName })
        }
    })

    return Array.from(sizes.values()).sort((a, b) => {
        const aValue = getSizeSortValue(a.nombre)
        const bValue = getSizeSortValue(b.nombre)

        if (aValue !== bValue) {
            return aValue - bValue
        }

        return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
    })
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
                <div class="header-main">
                    <div v-if="props.product?.imagen_url" class="product-image-preview-wrap">
                        <img :src="props.product.imagen_url" :alt="`Imagen de ${props.product?.nombre ?? 'producto'}`"
                            class="product-image-preview" />
                    </div>

                    <div>
                        <p class="modal-eyebrow">Inventario</p>
                        <h2 id="stock-modal-title" class="modal-title">
                            Stock de {{ props.product?.nombre ?? 'producto' }}
                        </h2>
                    </div>
                </div>

                <button type="button" class="close-btn" aria-label="Cerrar modal" @click="handleClose">
                    ✕
                </button>
            </div>

            <div class="modal-body">
                <div class="summary-grid" aria-label="Resumen de stock">
                    <article class="summary-card summary-card--full">
                        <span class="summary-label">Total Unidades</span>
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
                                <td class="sticky-col" data-label="Color">
                                    <div class="color-cell">
                                        <span v-if="colorRow.codigo_hex" class="color-dot"
                                            :style="{ backgroundColor: colorRow.codigo_hex }" />
                                        <span>{{ colorRow.nombre }}</span>
                                    </div>
                                </td>
                                <td v-for="size in sizeColumns" :key="`${colorRow.id}-${size.id}`" class="stock-cell"
                                    :data-label="size.nombre">
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

.header-main {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    min-width: 0;
}

.product-image-preview-wrap {
    flex-shrink: 0;
    width: 64px;
    height: 64px;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid #243041;
    background: #111827;
    display: grid;
    place-items: center;
}

.product-image-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
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

.summary-card--full {
    grid-column: 1 / -1;
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

    .header-main {
        align-items: center;
    }

    .product-image-preview-wrap {
        width: 56px;
        height: 56px;
    }

    .summary-grid {
        grid-template-columns: 1fr;
    }

    .modal-title {
        font-size: 1rem;
    }

    .table-wrap {
        overflow-x: visible;
        border: none;
    }

    .stock-table {
        display: block;
        min-width: 0;
        border-collapse: separate;
        border-spacing: 0 0.7rem;
    }

    .stock-table thead {
        display: none;
    }

    .stock-table tbody,
    .stock-table tr,
    .stock-table th,
    .stock-table td {
        display: block;
    }

    .stock-table tr {
        margin-bottom: 0.7rem;
        border: 1px solid #243041;
        border-radius: 12px;
        overflow: hidden;
        background: #0b1220;
    }

    .stock-table th,
    .stock-table td {
        padding: 0.8rem 0.9rem;
        border: none;
        text-align: left;
        background: transparent;
    }

    .stock-table td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
        border-bottom: 1px solid #1f2b3e;
    }

    .stock-table td:last-child {
        border-bottom: none;
    }

    .stock-table td::before {
        content: attr(data-label);
        color: #94a3b8;
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        white-space: nowrap;
    }

    .sticky-col {
        position: static;
        left: auto;
        background: transparent;
    }

    .stock-cell {
        justify-content: flex-end;
        font-weight: 700;
    }
}
</style>
