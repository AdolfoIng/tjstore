<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Brand } from '@/types/brand'

interface Props {
    isOpen: boolean
    brand?: Brand | null
    isLoading?: boolean
}

interface Emits {
    (e: 'close'): void
    (e: 'save', brandName: string, brandId?: string): void
}

const props = withDefaults(defineProps<Props>(), {
    isLoading: false,
    brand: null,
})

const emit = defineEmits<Emits>()

// Estado del formulario
const form = ref({
    nombre: '',
})

const errors = ref({
    nombre: '',
})

// Validación
const isFormValid = computed(() => {
    return form.value.nombre.trim().length >= 2
})

// Determina si es modo edición
const isEditMode = computed(() => {
    return props.brand !== null && props.brand !== undefined
})

// Título dinámico según el modo
const modalTitle = computed(() => {
    return isEditMode.value ? 'Editar Marca' : 'Nueva Marca'
})

// Texto del botón de guardar
const saveButtonText = computed(() => {
    return isEditMode.value ? 'Actualizar' : 'Crear'
})

// Observa cambios en la prop 'brand' para llenar el formulario
watch(
    () => props.brand,
    (newBrand) => {
        if (newBrand) {
            form.value.nombre = newBrand.nombre
        }
    },
    { immediate: true }
)

// Reinicia el formulario cuando se cierra el modal
watch(
    () => props.isOpen,
    (isOpen) => {
        if (!isOpen) {
            resetForm()
        }
    }
)

function validateForm(): boolean {
    errors.value.nombre = ''

    if (!form.value.nombre.trim()) {
        errors.value.nombre = 'El nombre es requerido'
        return false
    }

    if (form.value.nombre.trim().length < 2) {
        errors.value.nombre = 'El nombre debe tener al menos 2 caracteres'
        return false
    }

    if (form.value.nombre.trim().length > 50) {
        errors.value.nombre = 'El nombre no puede exceder 50 caracteres'
        return false
    }

    return true
}

function handleSave(): void {
    if (!validateForm()) {
        return
    }

    const brandName = form.value.nombre.trim().toLocaleUpperCase()
    const brandId = props.brand?.id

    emit('save', brandName, brandId)
}

function handleClose(): void {
    resetForm()
    emit('close')
}

function resetForm(): void {
    form.value.nombre = ''
    errors.value.nombre = ''
}
</script>

<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
        <div class="modal" role="dialog" aria-labelledby="modal-title">
            <!-- Header -->
            <div class="modal-header">
                <h2 id="modal-title" class="modal-title">{{ modalTitle }}</h2>
                <button type="button" class="close-btn" aria-label="Cerrar modal" @click="handleClose"
                    :disabled="isLoading">
                    ✕
                </button>
            </div>

            <!-- Body -->
            <div class="modal-body">
                <div class="form-group">
                    <label for="brand-name" class="form-label">
                        Nombre de la Marca
                        <span class="required" aria-label="requerido">*</span>
                    </label>
                    <input id="brand-name" v-model="form.nombre" type="text" class="form-input"
                        :class="{ 'form-input--error': errors.nombre }" placeholder="Ej: Nike, Adidas, Puma"
                        :disabled="isLoading" autocomplete="off" maxlength="50" />
                    <p v-if="errors.nombre" class="error-message">{{ errors.nombre }}</p>
                    <p class="char-count">{{ form.nombre.length }}/50</p>
                </div>
            </div>

            <!-- Footer -->
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="handleClose" :disabled="isLoading">
                    Cancelar
                </button>
                <button type="button" class="btn btn-primary" @click="handleSave" :disabled="!isFormValid || isLoading">
                    <span v-if="!isLoading">{{ saveButtonText }}</span>
                    <span v-else class="loading-spinner"></span>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Overlay */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

/* Modal Container */
.modal {
    width: 100%;
    max-width: 450px;
    background: rgb(35, 35, 66);
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from {
        transform: translateY(20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* Header */
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #334155;
}

.modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #e2e8f0;
}

.close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: #e2e8f0;
    font-size: 1.25rem;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.close-btn:hover:not(:disabled) {
    background: rgba(226, 232, 240, 0.1);
}

.close-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Body */
.modal-body {
    padding: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-label {
    font-size: 0.95rem;
    font-weight: 500;
    color: #cbd5e1;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.required {
    color: #ef4444;
}

.form-input {
    padding: 0.75rem;
    background: #0f172a;
    color: #e2e8f0;
    border: 1px solid #334155;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.2s ease;
}

.form-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.form-input--error {
    border-color: #ef4444;
}

.form-input--error:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
    font-size: 0.875rem;
    color: #ef4444;
    margin: 0;
}

.char-count {
    font-size: 0.75rem;
    color: #64748b;
    margin: 0;
    text-align: right;
}

/* Footer */
.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1.5rem;
    border-top: 1px solid #334155;
    background: rgba(15, 23, 42, 0.5);
}

/* Buttons */
.btn {
    padding: 0.625rem 1.25rem;
    border: none;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 40px;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-primary {
    background: #3b82f6;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #2563eb;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
    background: #475569;
    color: #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
    background: #64748b;
}

/* Loading Spinner */
.loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Responsive */
@media (max-width: 480px) {
    .modal {
        margin: 1rem;
        max-width: calc(100% - 2rem);
    }

    .modal-header,
    .modal-body,
    .modal-footer {
        padding: 1rem;
    }

    .modal-title {
        font-size: 1.1rem;
    }
}
</style>