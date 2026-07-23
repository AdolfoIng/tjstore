import { supabase } from "@/api/supabase"
import type { SaleCreatePayload, VentaForm } from "@/types/venta"

function normalizeNumber(value: number | string | null | undefined): number {
    const parsed = typeof value === 'number' ? value : Number(value ?? 0)
    return Number.isFinite(parsed) ? parsed : 0
}

export const VentaService = {
    async createVenta(venta: SaleCreatePayload): Promise<any> {
        const safeTotal = normalizeNumber(venta.total)
        const safeItems = Array.isArray(venta.items) ? venta.items : []

        if (!safeItems.length) {
            throw new Error('La venta debe tener al menos un producto en el carrito')
        }

        const { data: ventaData, error: ventaError } = await supabase
            .from('ventas')
            .insert({
                usuario_id: venta.usuario_id,
                nombre_cliente: venta.nombre_cliente,
                metodo_pago: venta.metodo_pago,
                total: safeTotal,
                observaciones: venta.observaciones
            })
            .select('id, usuario_id, nombre_cliente, metodo_pago, total')
            .single()

        if (ventaError || !ventaData) {
            console.error(ventaError)
            throw ventaError ?? new Error('No se pudo registrar la cabecera de la venta')
        }

        const ventaId = ventaData.id as string

        for (const item of safeItems) {
            const quantity = normalizeNumber(item.cantidad)
            const unitPrice = normalizeNumber(item.precio_unitario)
            const subtotal = normalizeNumber(item.subtotal)

            const { data: detalleData, error: detalleError } = await supabase
                .from('venta_detalle')
                .insert({
                    venta_id: ventaId,
                    producto_variante_id: item.producto_variante_id,
                    cantidad: quantity,
                    precio_unitario: unitPrice,
                    subtotal
                })
                .select('id')
                .single()

            if (detalleError || !detalleData) {
                console.error(detalleError)
                throw detalleError ?? new Error('No se pudo registrar el detalle de la venta')
            }

            const ventaDetalleId = detalleData.id as string

            const { data: variantData, error: stockReadError } = await supabase
                .from('producto_variantes')
                .select('id, stock_actual')
                .eq('id', item.producto_variante_id)
                .single()

            if (stockReadError || !variantData) {
                console.error(stockReadError)
                throw stockReadError ?? new Error('No se encontró la variante para actualizar stock')
            }

            const currentStock = normalizeNumber(variantData.stock_actual)

            console.log('stock Actual en DB = ', currentStock);

            if (currentStock < quantity) {
                throw new Error(`La variante ${item.producto_variante_id} no tiene stock suficiente para vender ${quantity} unidades.`)
            }

            const { error: stockError } = await supabase
                .from('producto_variantes')
                .update({
                    stock_actual: currentStock - quantity
                })
                .eq('id', item.producto_variante_id)

            if (stockError) {
                console.error(stockError)
                throw stockError
            }

            const { error: movementError } = await supabase
                .from('movimientos_stock')
                .insert({
                    producto_variante_id: item.producto_variante_id,
                    venta_detalle_id: ventaDetalleId,
                    tipo_movimiento: 'VENTA DE PRODUCTO',
                    cantidad: quantity,
                    stock_anterior: currentStock,
                    stock_nuevo: currentStock - quantity,
                    observaciones: `Venta registrada para ${venta.nombre_cliente || 'cliente'}`
                })

            if (movementError) {
                console.error(movementError)
                throw movementError
            }
        }

        return ventaData
    },

    async createVentaSimple(venta: VentaForm): Promise<any> {
        return this.createVenta({
            ...venta,
            items: []
        } as SaleCreatePayload)
    }
}