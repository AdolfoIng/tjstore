import { onBeforeUnmount } from 'vue'

/**
 * Composable para aplicar debounce a cualquier función
 * @param fn - Función a debouncer
 * @param delay - Tiempo de espera en milisegundos (default: 300ms)
 * @returns Función debounceada y función para cancelar el debounce pendiente
 */
export function useDebounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number = 300
): [debouncedFn: (...args: Parameters<T>) => void, cancel: () => void] {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const debouncedFn = (...args: Parameters<T>) => {
        // Cancelar el timeout previo si existe
        if (timeoutId !== null) {
            clearTimeout(timeoutId)
        }

        // Crear un nuevo timeout
        timeoutId = setTimeout(() => {
            fn(...args)
            timeoutId = null
        }, delay)
    }

    const cancel = () => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId)
            timeoutId = null
        }
    }

    // Limpiar el timeout cuando se desmonte el componente
    onBeforeUnmount(() => {
        cancel()
    })

    return [debouncedFn, cancel]
}
