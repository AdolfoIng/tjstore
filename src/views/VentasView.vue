<script lang="ts" setup>
import { VentaService } from '@/services/ventas/venta.service';
import type { VentaForm } from '@/types/venta';
import { reactive } from 'vue';


const formVenta = reactive<VentaForm>({
    usuario_id: null,
    nombre_cliente: '',
    metodo_pago: '',
    total: 0,
    observaciones: ''
})

async function handleSave() {
    console.log('saved ..');
    formVenta.usuario_id = 'd62d8171-0cd2-41c1-a551-e1847bc9fc6e';

    const data = await VentaService.createVenta(formVenta);
    console.log('Add');
    console.log(data);
}

</script>

<template>
    <div>
        <h3>Registrar Ventas 🤑</h3>
        <div>
            <div class="form-group">
                <!-- Cliente -->
                <label for="cliente" class="form-label">
                    Cliente
                    <span class="required" aria-label="requerido">*</span>
                </label>
                <input id="cliente" v-model="formVenta.nombre_cliente" type="text" class="form-input" autocomplete="off"
                    maxlength="100" />

                <!-- Personal -->
                <label for="personal" class="form-label">
                    Personal
                    <span class="required" aria-label="requerido">*</span>
                </label>
                <input id="personal" v-model="formVenta.usuario_id" type="text" class="form-input" autocomplete="off"
                    maxlength="100" />

                <!-- Metodo de Pago -->
                <label for="metodo-pago" class="form-label">
                    Metodo de Pago
                    <span class="required" aria-label="requerido">*</span>
                </label>
                <select id="metodo-pago" v-model="formVenta.metodo_pago" class="form-input form-select">
                    <option :value="null">
                        Selecciona una categoria
                    </option>
                    <option>
                        EFECTIVO
                    </option>
                    <option>
                        QR
                    </option>
                </select>

                <!-- TABLA -->
                <h3>Tabla here ....</h3>

                <!-- Total -->
                <label for="total" class="form-label">
                    Total
                    <span class="required" aria-label="requerido">*</span>
                </label>
                <input id="total" v-model="formVenta.total" type="number" class="form-input" />

                <!-- Observaciones -->
                <label for="observaciones" class="form-label">
                    Observaciones
                    <span class="required" aria-label="requerido">*</span>
                </label>
                <input id="observaciones" v-model="formVenta.observaciones" type="text" class="form-input"
                    autocomplete="off" maxlength="150" />

            </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary">
                Cancelar
            </button>
            <button type="button" class="btn btn-primary" @click="handleSave">
                Guardar
            </button>
        </div>
    </div>
</template>


<style scoped>
.form-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-label {
    font-size: 0.95rem;
    font-weight: 500;
    color: #353636;
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
    width: 250px;
    color: #e2e8f0;
    border: 1px solid #334155;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.2s ease;
}
</style>