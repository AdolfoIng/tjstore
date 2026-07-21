import { supabase } from '@/api/supabase'
import type { ProductStockRow, ProductVariantColor, ProductVariantRecord, ProductVariantSize } from '@/types/product-stock'

function toNumberSafe(value: number | string | null | undefined): number {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0
    if (typeof value === 'string') {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : 0
    }
    return 0
}

export const ProductStockService = {
    async getProductStock(productId: string): Promise<ProductStockRow[]> {
        const queryVariants = await supabase
            .from('producto_variantes')
            .select('id, producto_id, color_id, talla_id, stock_actual')
            .eq('producto_id', productId)
            .order('id', { ascending: true })

        if (queryVariants.error) {
            throw queryVariants.error
        }

        const variants = (queryVariants.data ?? []) as ProductVariantRecord[]

        if (!variants.length) {
            return []
        }

        const colorIds = [...new Set(variants.map((variant) => variant.color_id).filter(Boolean) as string[])]
        const tallaIds = [...new Set(variants.map((variant) => variant.talla_id).filter(Boolean) as string[])]

        const [colorsResult, tallasResult] = await Promise.all([
            colorIds.length
                ? supabase.from('colores').select('id, nombre').in('id', colorIds)
                : Promise.resolve({ data: [] as ProductVariantColor[], error: null }),
            tallaIds.length
                ? supabase.from('tallas').select('id, nombre').in('id', tallaIds)
                : Promise.resolve({ data: [] as ProductVariantSize[], error: null })
        ])

        if (colorsResult.error) {
            console.warn('No se pudieron cargar los colores del stock:', colorsResult.error)
        }

        if (tallasResult.error) {
            console.warn('No se pudieron cargar las tallas del stock:', tallasResult.error)
        }

        const colorsMap = new Map<string, ProductVariantColor>()
        for (const color of (colorsResult.data ?? []) as ProductVariantColor[]) {
            if (color?.id) {
                colorsMap.set(color.id, color)
            }
        }

        const tallasMap = new Map<string, ProductVariantSize>()
        for (const talla of (tallasResult.data ?? []) as ProductVariantSize[]) {
            if (talla?.id) {
                tallasMap.set(talla.id, talla)
            }
        }

        return variants.map((variant) => ({
            id: variant.id,
            producto_id: variant.producto_id,
            cantidad: toNumberSafe(variant.stock_actual),
            color: variant.color_id ? colorsMap.get(variant.color_id) ?? null : null,
            talla: variant.talla_id ? tallasMap.get(variant.talla_id) ?? null : null
        }))
    }
}
