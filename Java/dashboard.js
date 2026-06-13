// ── FECHA ACTUAL ──────────────────────────────────────────────────
const dias  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const meses = ['enero','febrero','marzo','abril','mayo','junio','julio',
               'agosto','septiembre','octubre','noviembre','diciembre'];
const hoy   = new Date();
document.getElementById('fechaHoy').textContent =
    `${dias[hoy.getDay()]}, ${hoy.getDate()} de ${meses[hoy.getMonth()]} ${hoy.getFullYear()}`;

// ── SELECTOR DE PERÍODO ───────────────────────────────────────────
function setPeriod(btn, period) {
    document.querySelectorAll('.period-selector button')
            .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// ── GRÁFICA BARRAS: Ingresos vs Egresos ──────────────────────────
const ctxVentas = document.getElementById('chartVentas').getContext('2d');
new Chart(ctxVentas, {
    type: 'bar',
    data: {
        labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
        datasets: [
            {
                label: 'Ingresos',
                data: [3200, 4100, 3800, 5100, 5972, 4700, 6200, 5500, 4900, 6800, 5300, 7100],
                backgroundColor: 'rgba(25, 135, 84, 0.82)',
                borderRadius: 5,
                borderSkipped: false,
            },
            {
                label: 'Egresos',
                data: [1800, 2200, 1900, 2700, 3100, 2500, 3300, 2900, 2600, 3500, 2800, 3800],
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderRadius: 5,
                borderSkipped: false,
            }
        ]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 11 } }
            },
            y: {
                grid: { color: '#f0f4f1' },
                ticks: {
                    font: { size: 11 },
                    callback: val => 'S/ ' + val.toLocaleString()
                }
            }
        }
    }
});

// ── GRÁFICA DONA: Ventas por categoría ───────────────────────────
const ctxCat = document.getElementById('chartCategoria').getContext('2d');
new Chart(ctxCat, {
    type: 'doughnut',
    data: {
        labels: ['Bombas', 'Tuberías', 'Válvulas', 'Aspersores', 'Filtros'],
        datasets: [{
            data: [35, 22, 18, 15, 10],
            backgroundColor: ['#198754','#3b82f6','#f59e0b','#8b5cf6','#ef4444'],
            borderWidth: 3,
            borderColor: '#fff',
        }]
    },
    options: {
        responsive: true,
        cutout: '65%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: { size: 12 },
                    padding: 14,
                    usePointStyle: true,
                    pointStyleWidth: 9
                }
            }
        }
    }
});
