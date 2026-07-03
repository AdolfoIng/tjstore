import { supabase } from "@/api/supabase"
import type { Product, ProductForm } from "@/types/product"

export const ProductService = {

    async getAllProducts(): Promise<Product[]> {
        const { data, error } = await supabase.from('productos')
            .select(`
            id,
            nombre,
            descripcion,
            precio_venta,
            marca_id,
            activo,
            created_at,
            marcas (
                id,
                nombre
            )
        `)
            .eq('activo', true)
            .order('created_at', { ascending: false })

        if (error) {
            console.log(error)
            throw error
        }
        return (data as unknown as Product[]) ?? []
    },

    async createProduct(product: ProductForm): Promise<Product> {
        const { data, error } = await supabase
            .from('productos')
            .insert({
                nombre: product.nombre,
                descripcion: product.descripcion,
                precio_venta: product.precio_venta,
                categoria_id: '611f3a77-ae4e-496f-8ef2-ae0a0a9a0d45',
                marca_id: product.marca_id,
                activo: true
            })
            .select(`
                id,
                nombre,
                descripcion,
                precio_venta,
                marca_id,
                activo,
                created_at,
                marcas (
                    id,
                    nombre
                )
            `)
            .single()

        if (error) throw error
        return data as unknown as Product
    },

    async updateProduct(id: string, product: ProductForm): Promise<Product> {
        const { data, error } = await supabase
            .from('productos')
            .update({
                nombre: product.nombre,
                descripcion: product.descripcion,
                precio_venta: product.precio_venta,
                marca_id: product.marca_id
            })
            .eq('id', id)
            .select(`
                id,
                nombre,
                descripcion,
                precio_venta,
                marca_id,
                activo,
                created_at,
                marcas (
                    id,
                    nombre
                )
            `)
            .single()

        if (error) throw error
        return data as unknown as Product
    },

    async deleteProduct(idProducto: string): Promise<void> {
        const { error } = await supabase
            .from('productos')
            .update({ activo: false })
            .eq('id', idProducto)

        if (error) throw error
    }

}