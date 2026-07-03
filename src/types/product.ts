import type { Brand } from './brand'

export interface Product {
    id: string
    nombre: string
    descripcion: string
    precio_venta: number
    marca_id: string
    activo: boolean
    created_at?: string
    marcas?: Brand  // Relación con marca (single object)
}

export interface ProductForm {
    nombre: string
    descripcion: string
    precio_venta: number
    marca_id: string | null
}
