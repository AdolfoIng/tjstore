<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
    currentPage: number
    totalPages: number
    totalItems: number
    pageSize: number
    isLoading?: boolean
}>()

const emit = defineEmits<{
    (event: 'page-change', page: number): void
}>()

const startItem = computed(() => {
    if (props.totalItems === 0) return 0
    return (props.currentPage - 1) * props.pageSize + 1
})

const endItem = computed(() => {
    if (props.totalItems === 0) return 0
    return Math.min(props.currentPage * props.pageSize, props.totalItems)
})

const visiblePages = computed<Array<number | string>>(() => {
    if (props.totalPages <= 7) {
        return Array.from({ length: props.totalPages }, (_, index) => index + 1)
    }

    if (props.currentPage <= 4) {
        return [1, 2, 3, 4, 5, '...', props.totalPages]
    }

    if (props.currentPage >= props.totalPages - 3) {
        return [1, '...', props.totalPages - 4, props.totalPages - 3, props.totalPages - 2, props.totalPages - 1, props.totalPages]
    }

    return [1, '...', props.currentPage - 1, props.currentPage, props.currentPage + 1, '...', props.totalPages]
})

function changePage(page: number): void {
    if (page < 1 || page > props.totalPages || page === props.currentPage || props.isLoading) {
        return
    }

    emit('page-change', page)
}
</script>

<template>
    <div class="pagination" v-if="totalPages > 1">
        <div class="pagination__summary" aria-live="polite">
            <span v-if="totalItems > 0">
                Mostrando {{ startItem }}-{{ endItem }} de {{ totalItems }} productos
            </span>
            <span v-else>No hay productos para mostrar</span>
        </div>

        <div class="pagination__controls">
            <button type="button" class="pagination__button" :disabled="currentPage === 1 || isLoading"
                @click="changePage(currentPage - 1)">
                Anterior
            </button>

            <div class="pagination__pages">
                <button v-for="(page, index) in visiblePages" :key="`${page}-${index}`" type="button"
                    class="pagination__button" :class="{ 'is-active': page === currentPage }"
                    :disabled="page === '...' || isLoading" @click="typeof page === 'number' && changePage(page)">
                    {{ page }}
                </button>
            </div>

            <button type="button" class="pagination__button" :disabled="currentPage === totalPages || isLoading"
                @click="changePage(currentPage + 1)">
                Siguiente
            </button>
        </div>
    </div>
</template>

<style scoped>
.pagination {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-top: 1px solid rgba(148, 163, 184, 0.2);
    background: rgba(15, 23, 42, 0.5);
}

.pagination__summary {
    font-size: 0.9rem;
    color: #94a3b8;
}

.pagination__controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
}

.pagination__pages {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
}

.pagination__button {
    min-width: 2.5rem;
    padding: 0.45rem 0.7rem;
    border: 1px solid #334155;
    border-radius: 999px;
    background: #0f172a;
    color: #e2e8f0;
    cursor: pointer;
    transition: all 0.2s ease;
}

.pagination__button:hover:not(:disabled) {
    border-color: #3b82f6;
    color: #3b82f6;
}

.pagination__button.is-active {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
}

.pagination__button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

@media (max-width: 640px) {
    .pagination {
        flex-direction: column;
        align-items: stretch;
    }

    .pagination__summary {
        text-align: center;
    }

    .pagination__controls {
        justify-content: center;
    }
}
</style>
