import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ProductService, type ProductPaginationParams } from '@/services/productos/product.service'
import { ProductStockService } from '@/services/productos/product-stock.service'
import { VentaService } from '@/services/ventas/venta.service'
import type { SaleCartItem, SaleCatalogProduct, SaleCreatePayload, SaleVariantOption } from '@/types/venta'

interface SaleLoadOptions extends ProductPaginationParams {
    resetPage?: boolean
}

function buildVariantLabel(variant: SaleVariantOption): string {
    const color = variant.color?.nombre ?? 'Sin color'
    const size = variant.talla?.nombre ?? 'Sin talla'
    return `${color} / ${size}`
}

export const useSaleStore = defineStore('sale', () => {
    const catalog = ref<SaleCatalogProduct[]>([])
    const cart = ref<SaleCartItem[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const currentPage = ref(1)
    const pageSize = ref(8)
    const totalItems = ref(0)
    const searchTerm = ref('')

    const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize.value)))
    const subtotal = computed(() => cart.value.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0))
    const itemCount = computed(() => cart.value.reduce((sum, item) => sum + item.quantity, 0))

    async function loadCatalog(options: SaleLoadOptions = {}) {
        const nextPage = options.resetPage ? 1 : (options.page ?? currentPage.value)
        const requestedPageSize = options.pageSize ?? pageSize.value
        const requestedSearchTerm = options.searchQuery ?? searchTerm.value

        loading.value = true
        error.value = null

        try {
            const result = await ProductService.getProductsPage({
                page: nextPage,
                pageSize: requestedPageSize,
                searchQuery: requestedSearchTerm
            })

            const enrichedCatalog = await Promise.all(
                result.items.map(async (product) => {
                    const variants = await ProductStockService.getProductStock(product.id)
                    return {
                        ...product,
                        imagen_url: product.imagen_url,
                        variants: variants.map((variant) => ({
                            id: variant.id,
                            producto_id: variant.producto_id,
                            stock_actual: variant.cantidad,
                            color_id: variant.color?.id ?? null,
                            talla_id: variant.talla?.id ?? null,
                            color: variant.color,
                            talla: variant.talla
                        }))
                    } as SaleCatalogProduct
                })
            )

            catalog.value = enrichedCatalog
            totalItems.value = result.totalCount
            currentPage.value = result.page
            pageSize.value = result.pageSize
            searchTerm.value = requestedSearchTerm

            return result
        } catch (err) {
            error.value = (err as Error)?.message ?? 'Error al cargar productos para ventas'
            throw err
        } finally {
            loading.value = false
        }
    }

    function ensureCartItem(product: SaleCatalogProduct, variant: SaleVariantOption, quantity: number): void {
        const foundItem = cart.value.find((item) => item.variantId === variant.id)

        if (foundItem) {
            const newQuantity = foundItem.quantity + quantity
            if (newQuantity > variant.stock_actual) {
                throw new Error(`La variante seleccionada solo tiene ${variant.stock_actual} unidades disponibles.`)
            }

            foundItem.quantity = newQuantity
            return
        }

        if (quantity > variant.stock_actual) {
            throw new Error(`La variante seleccionada solo tiene ${variant.stock_actual} unidades disponibles.`)
        }

        cart.value.push({
            id: `${product.id}-${variant.id}`,
            productId: product.id,
            productName: product.nombre,
            productImage: product.imagen_url,
            brandName: product.marcas?.nombre ?? 'Sin marca',
            variantId: variant.id,
            variantLabel: buildVariantLabel(variant),
            quantity,
            unitPrice: product.precio_venta,
            availableStock: variant.stock_actual
        })
    }

    function addToCart(product: SaleCatalogProduct, variant: SaleVariantOption, quantity = 1): void {
        if (!product?.id || !variant?.id) {
            throw new Error('Debe seleccionar un producto y una variante válidos')
        }

        ensureCartItem(product, variant, quantity)
    }

    function removeFromCart(itemId: string): void {
        cart.value = cart.value.filter((item) => item.id !== itemId)
    }

    function updateItemQuantity(itemId: string, quantity: number): void {
        const item = cart.value.find((saleItem) => saleItem.id === itemId)
        if (!item) return

        const safeQuantity = Math.max(1, quantity)
        if (safeQuantity > item.availableStock) {
            throw new Error(`La variante solo tiene ${item.availableStock} unidades disponibles.`)
        }

        item.quantity = safeQuantity
    }

    function clearCart(): void {
        cart.value = []
    }

    async function submitSale(payload: SaleCreatePayload): Promise<any> {
        loading.value = true
        error.value = null

        try {
            const result = await VentaService.createVenta(payload)
            clearCart()
            return result
        } catch (err) {
            error.value = (err as Error)?.message ?? 'Error al registrar la venta'
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        catalog,
        cart,
        loading,
        error,
        currentPage,
        pageSize,
        totalItems,
        searchTerm,
        totalPages,
        subtotal,
        itemCount,
        loadCatalog,
        addToCart,
        removeFromCart,
        updateItemQuantity,
        clearCart,
        submitSale
    }
})
