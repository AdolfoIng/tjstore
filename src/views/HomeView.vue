<template>
    <main class="home">
        <section class="welcome-card">
            <div class="welcome-icon-badge">
                <Package class="welcome-icon" />
            </div>

            <h1 class="title">
                ¡Bienvenido al Sistema de Inventario!
            </h1>

            <p class="subtitle">
                Administra productos, controla el stock, registra ventas
                y consulta información en tiempo real desde un solo lugar.
            </p>

            <div class="info-grid">
                <article class="info-card">
                    <div class="icon-box">
                        <Package class="card-icon" />
                    </div>
                    <h3>Productos</h3>
                    <p>Gestiona tu catálogo de productos.</p>
                </article>

                <article class="info-card">
                    <div class="icon-box">
                        <BarChart3 class="card-icon" />
                    </div>
                    <h3>Stock</h3>
                    <p>Controla las existencias de manera sencilla.</p>
                </article>

                <article class="info-card">
                    <div class="icon-box">
                        <Wallet class="card-icon" />
                    </div>
                    <h3>Ventas</h3>
                    <p>Registra ventas y actualiza el inventario automáticamente.</p>
                </article>
            </div>
        </section>
    </main>
</template>

<script setup lang="ts">
import { BarChart3, Package, Wallet } from '@lucide/vue'
// Pantalla de bienvenida.
// En el futuro aquí se podrán cargar estadísticas,
// accesos rápidos y gráficos.
</script>

<style scoped>
.home {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 90px);
    padding: 2rem;
}

.welcome-card {
    max-width: 960px;
    width: 100%;
    background:
        linear-gradient(180deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.82));
    border-radius: 24px;
    padding: 3rem;
    text-align: center;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(148, 163, 184, 0.2);
    backdrop-filter: blur(10px);
}

.welcome-icon-badge {
    width: 84px;
    height: 84px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 22px;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #247a9f, #704ac7);
    color: #fff;
    box-shadow: 0 12px 30px rgba(39, 87, 164, 0.35);
}

.welcome-icon {
    width: 2.4rem;
    height: 2.4rem;
}

.eyebrow {
    display: inline-block;
    margin-bottom: 0.85rem;
    padding: 0.35rem 0.8rem;
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.16);
    color: #93c5fd;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.title {
    font-size: 2rem;
    font-weight: 500;
    color: #f8fafc;
    margin-bottom: 0.85rem;
}

.subtitle {
    max-width: 700px;
    margin: auto;
    color: #cbd5e1;
    line-height: 1.7;
    margin-bottom: 2.5rem;
    font-size: 1rem;
}

.info-grid {
    display: grid;
    gap: 1.25rem;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.info-card {
    padding: 1.5rem;
    border-radius: 18px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    background: rgba(15, 23, 42, 0.6);
    text-align: left;
}

.info-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.25);
    border-color: rgba(96, 165, 250, 0.45);
}

.icon-box {
    width: 52px;
    height: 52px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    margin-bottom: 1rem;
    background: rgba(56, 189, 248, 0.15);
    color: #7dd3fc;
}

.card-icon {
    width: 1.45rem;
    height: 1.45rem;
}

.info-card h3 {
    margin: 0 0 0.5rem;
    color: #f8fafc;
    font-size: 1.1rem;
}

.info-card p {
    color: #cbd5e1;
    font-size: 0.95rem;
    line-height: 1.6;
    margin: 0;
}

@media (max-width: 768px) {
    .home {
        padding: 1rem;
    }

    .welcome-card {
        padding: 2rem;
    }

    .title {
        font-size: 1.6rem;
    }
}
</style>