import { supabase } from "@/api/supabase"
import type { VentaForm } from "@/types/venta"

export const VentaService = {

    async createVenta(venta: VentaForm): Promise<any> {
        const { data, error } = await supabase
            .from('ventas')
            .insert({
                usuario_id: venta.usuario_id,
                nombre_cliente: venta.nombre_cliente,
                metodo_pago: venta.metodo_pago,
                total: venta.total,
                observaciones: venta.observaciones
            })
            .select('id, usuario_id, nombre_cliente, metodo_pago, total')
            .single()

        if (error) {
            console.log(error); throw error
        }
        return data
    }
}