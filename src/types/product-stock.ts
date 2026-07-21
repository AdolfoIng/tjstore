export interface ProductVariantRecord {
    id: string
    producto_id: string
    color_id?: string | null
    talla_id?: string | null
    stock_actual?: number | null
    stock?: number | null
}

export interface ProductVariantColor {
    id: string
    nombre: string
    codigo_hex?: string | null
}

export interface ProductVariantSize {
    id: string
    nombre: string
}

export interface ProductStockRow {
    id: string
    producto_id: string
    cantidad: number
    color: ProductVariantColor | null
    talla: ProductVariantSize | null
}
