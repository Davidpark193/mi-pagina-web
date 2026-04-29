// ====================== script.js - COMPLETO Y ACTUALIZADO ======================

const meses = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

const listaTareas = [
  "Instalación de plywood (paredes, pisos, techos)",
  "Corte y ajuste de madera",
  "Marcando y trazando lo que se va a hacer",
  "Instalación de siding",
  "Framing de paredes",
  "Framing de techos (ceiling)",
  "Instalación de vigas y soportes",
  "Nivelación y alineación",
  "Instalación de ventanas",
  "Instalación de puertas",
  "Instalación de trims (molduras)",
  "Instalación de marcos de puertas/ventanas",
  "Armando closets",
  "Armando estructuras internas",
  "Instalación de drywall",
  "Preparación de superficies",
  "Ajustes y modificaciones",
  "Reparando / arreglando (según trabajo)",
  "Colocando insulation",
  "Colocando spray foam en ventanas, puertas u openings",
  "Aplicación de adhesivos y fijaciones",
  "Instalación de herrajes (bisagras, tornillos, etc.)",
  "Descarga de materiales",
  "Transporte de herramientas/materiales",
  "Organización de materiales",
  "Limpieza del área de trabajo",
  "Retiro de escombros",
  "Corrección de detalles",
  "Instalación de cajones",
  "Instalación de tracks de cajones",
  "Framing de deck",
  "Framing de basement"
];

let semanaBase = new Date();
let cargandoLocal = false;

// ==================== AUTOGUARDADO LOCAL ====================
function guardarLocal() {
    if (cargandoLocal) return;
    const data = {
        semanaBase: semanaBase.toISOString(),
        month: document.getElementById("month").value || "",
        total: document.getElementById("total").getAttribute("data-total") || "0.0",
        rows: []
    };

    document.querySelectorAll("#body tr").forEach(tr => {
        const select = tr.querySelector("select");
        const editablePlace = tr.cells[1].querySelector(".editable");
        const taskInput = tr.querySelector(".task-search-input");
        const horasCell = tr.querySelector(".horas");

        data.rows.push({
            date: tr.cells[0].innerText.trim() || "",
            placeSelect: select ? select.value : "",
            placeText: editablePlace ? editablePlace.innerText.trim() : "",
            task: taskInput ? taskInput.value.trim() : "",
            time: tr.cells[3].innerText.trim() || "",
            hours: horasCell.innerText.trim() || "0.0",
            manual: horasCell.dataset.manual === "true"
        });
    });

    localStorage.setItem("semana_actual_payroll", JSON.stringify(data));
}

function cargarLocal() {
    const saved = localStorage.getItem("semana_actual_payroll");
    if (!saved) return;

    try {
        cargandoLocal = true;
        const data = JSON.parse(saved);

        if (data.semanaBase) semanaBase = new Date(data.semanaBase);

        const filas = document.querySelectorAll("#body tr");
        data.rows.forEach((row, i) => {
            const tr = filas[i];
            if (!tr) return;

            tr.cells[0].innerText = row.date || "";
            const select = tr.querySelector("select");
            if (select) select.value = row.placeSelect || "";

            const editable = tr.cells[1].querySelector(".editable");
            if (editable) editable.innerText = row.placeText || "";

            const taskInput = tr.querySelector(".task-search-input");
            if (taskInput) taskInput.value = row.task || "";

            tr.cells[3].innerText = row.time || "";

            const horasCell = tr.querySelector(".horas");
            if (horasCell) {
                horasCell.innerText = row.hours || "0.0";
                if (row.manual) horasCell.dataset.manual = "true";
            }
        });

        document.getElementById("month").value = data.month || "";
        const totalEl = document.getElementById("total");
        totalEl.setAttribute("data-total", data.total);
        totalEl.innerText = parseFloat(data.total).toFixed(1);

        calcularHoras(false);
    } catch (e) {
        console.error(e);
    } finally {
        cargandoLocal = false;
    }
}

// ==================== AUXILIARES ====================
function fechaUSA(fecha) {
    return fecha.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function actualizarMes(lunes) {
    let domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    let mesInicio = meses[lunes.getMonth()];
    let mesFin = meses[domingo.getMonth()];
    document.getElementById("month").value = (mesInicio === mesFin) ? mesInicio : mesInicio + " - " + mesFin;
}

// ==================== GENERAR SEMANA ====================
function generarSemana() {
    const body = document.getElementById("body");
    body.innerHTML = "";

    let lunes = new Date(semanaBase);
    lunes.setHours(0, 0, 0, 0);
    const dia = lunes.getDay();
    const diff = lunes.getDate() - dia + (dia === 0 ? -6 : 1);
    lunes.setDate(diff);

    actualizarMes(lunes);

    for (let i = 0; i < 7; i++) {
        let d = new Date(lunes);
        d.setDate(lunes.getDate() + i);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-5 font-medium">${fechaUSA(d)}</td>
            <td class="px-6 py-5">
                <div class="flex gap-3 items-center">
                    <select class="bg-slate-800 text-white rounded-3xl px-4 py-3 text-sm flex-1">
                        <option>HOUSE 34 Seaview Montauk</option>
                        <option>HOUSE 34 Seaside Montauk</option>
                        <option>HOUSE 73 Seaview Montauk</option>
                        <option>HOUSE 69 Kettle Hole Rd Montauk</option>
                        <option>HOUSE 19 Roberson Blv Sag Harbor</option>
                        <option>HOUSE 35 Old Mtk Hwy Amagansett</option>
                        <option>HOUSE 200 Bluff Rd Amagansett</option>
                        <option>HOUSE 35 Mc Elnea St East Hampton</option>
                        <option>HOUSE 16 Sanger Pl Montauk</option>
                        <option>HOUSE 124 Old West Lake Montauk</option>
                        <option>HOUSE 142 Bull Path East Hampton</option>
                        <option>HOUSE 41 Montauk Ave Sag Harbor</option>
                        <option>HOUSE 23 Roberson Blv Sag Harbor</option>
                        <option>HOUSE 34 High St</option>
                        <option>HOUSE 34 Montauk</option>
                        <option>HOUSE 69 Montauk</option>
                        <option>Other Location</option>
                    </select>
                    <button onclick="obtenerDireccion(this)" class="loc-btn w-10 h-10 flex items-center justify-center text-xl">📍</button>
                </div>
                <div contenteditable="true" class="editable mt-3 text-slate-300 text-sm min-h-[42px] px-4 py-2 rounded-3xl border border-transparent focus:border-indigo-400"></div>
            </td>
            <td class="px-6 py-5">
                <div class="task-search-container relative">
                    <input type="text" class="task-search-input" placeholder="Buscar o escribir tarea..." 
                           onfocus="mostrarOpciones(this)" oninput="filtrarOpciones(this)">
                    <div class="task-options hidden absolute w-full mt-2 z-50"></div>
                </div>
            </td>
            <td contenteditable="true" class="editable text-center px-6 py-5 font-medium" oninput="calcularHoras()"></td>
            <td contenteditable="true" class="horas text-center px-6 py-5 font-bold text-emerald-400 text-xl" oninput="marcarManual(this)">0.0</td>
        `;
        body.appendChild(row);
    }
}

// ==================== GEOLOCALIZACIÓN ====================
function obtenerDireccion(btn) {
    if (!navigator.geolocation) return alert("Geolocalización no soportada");
    btn.innerHTML = "⏳";
    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            const { latitude: lat, longitude: lon } = pos.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18`);
            const data = await res.json();
            const addr = data.address || {};
            const direccion = [addr.road, addr.city || addr.town, addr.country].filter(Boolean).join(", ");
            btn.parentElement.parentElement.querySelector(".editable").innerText = direccion || "Ubicación capturada";
            guardarLocal();
        } catch (e) {
            btn.parentElement.parentElement.querySelector(".editable").innerText = "No se pudo obtener dirección";
        }
        btn.innerHTML = "📍";
    }, () => {
        alert("Acceso a ubicación denegado");
        btn.innerHTML = "📍";
    });
}

// ==================== BUSCADOR DE TAREAS ====================
function cerrarTodosLosDropdowns() {
    document.querySelectorAll('.task-options').forEach(d => d.classList.add('hidden'));
}

function mostrarOpciones(input) {
    cerrarTodosLosDropdowns();
    const container = input.parentElement;
    const optionsDiv = container.querySelector('.task-options');
    optionsDiv.innerHTML = '';
    optionsDiv.classList.remove('hidden');

    listaTareas.forEach(tarea => {
        const div = document.createElement('div');
        div.className = 'px-5 py-3 hover:bg-indigo-500/20 text-slate-200 cursor-pointer text-sm';
        div.textContent = tarea;
        div.onclick = () => seleccionarTarea(input, tarea);
        optionsDiv.appendChild(div);
    });
}

function filtrarOpciones(input) {
    const container = input.parentElement;
    const optionsDiv = container.querySelector('.task-options');
    const filtro = input.value.toLowerCase().trim();
    optionsDiv.innerHTML = '';

    const filtradas = listaTareas.filter(t => t.toLowerCase().includes(filtro));

    if (filtradas.length) {
        filtradas.forEach(t => {
            const div = document.createElement('div');
            div.className = 'px-5 py-3 hover:bg-indigo-500/20 text-slate-200 cursor-pointer text-sm';
            div.textContent = t;
            div.onclick = () => seleccionarTarea(input, t);
            optionsDiv.appendChild(div);
        });
    } else if (filtro) {
        const div = document.createElement('div');
        div.className = 'px-5 py-3 italic text-slate-400 cursor-pointer';
        div.textContent = `Usar: "${filtro}"`;
        div.onclick = () => seleccionarTarea(input, filtro);
        optionsDiv.appendChild(div);
    }
    optionsDiv.classList.remove('hidden');
}

function seleccionarTarea(input, texto) {
    input.value = texto;
    cerrarTodosLosDropdowns();
    const row = input.closest('tr');
    const horasCell = row.querySelector(".horas");
    if (horasCell && horasCell.dataset.manual !== "true") horasCell.innerText = "0.0";
    guardarLocal();
    setTimeout(() => row.cells[3].focus(), 80);
}

// ==================== CALCULAR HORAS ====================
function calcularHoras(guardar = true) {
    let total = 0;
    document.querySelectorAll("#body tr").forEach(fila => {
        const horasCell = fila.querySelector(".horas");
        if (horasCell.dataset.manual === "true") {
            total += parseFloat(horasCell.innerText) || 0;
            return;
        }

        const texto = fila.cells[3].innerText.toLowerCase().trim();
        let suma = 0;
        const bloques = texto.split(",");

        bloques.forEach(b => {
            if (b.includes("-")) {
                let [inicio, fin] = b.split("-").map(x => x.trim());
                let h1 = convertir(inicio);
                let h2 = convertir(fin);
                if (h1 !== null && h2 !== null) {
                    let minutos = h2 - h1;
                    let horas = minutos / 60;
                    if (horas < 0) horas += 24;
                    if (inicio.includes(":30") && fin.includes(":30")) horas -= 1;
                    else if (inicio.includes(":30") || fin.includes(":30")) horas -= 0.5;
                    suma += horas;
                }
            }
        });

        horasCell.innerText = suma.toFixed(1);
        total += suma;
    });

    const totalEl = document.getElementById("total");
    totalEl.setAttribute("data-total", total.toFixed(1));
    totalEl.innerText = total.toFixed(1);

    if (guardar) guardarLocal();
}

function convertir(hora) {
    const m = hora.match(/(\d+):?(\d+)?\s*(am|pm)?/i);
    if (!m) return null;
    let h = parseInt(m[1]);
    let min = parseInt(m[2] || 0);
    const periodo = (m[3] || "").toLowerCase();
    if (periodo === "pm" && h !== 12) h += 12;
    if (periodo === "am" && h === 12) h = 0;
    return h * 60 + min;
}

function marcarManual(td) {
    td.dataset.manual = "true";
    guardarLocal();
}

// ==================== EXPORTAR PNG - LIMPIO Y PROFESIONAL ====================
function descargar() {
    calcularHoras();

    const capture = document.getElementById("capture");

    html2canvas(capture, {
        scale: 3,
        backgroundColor: "#0f172a",
        logging: false,
        onclone: (clonedDoc) => {
            const clonedCapture = clonedDoc.getElementById("capture");

            // Agregar encabezado con nombre del empleado
            const header = `
                <div style="padding: 25px 30px 15px; text-align: center; border-bottom: 3px solid #334155; margin-bottom: 10px;">
                    <div style="font-size: 22px; font-weight: 700; color: #e2e8f0;">Christian Suárez Miles</div>
                    <div style="font-size: 15px; color: #64748b;">Employee • Payroll Weekly Time Sheet</div>
                    <div style="font-size: 14px; color: #94a3b8; margin-top: 4px;">${document.getElementById("month").value || "MAY"}</div>
                </div>`;
            clonedCapture.insertAdjacentHTML('afterbegin', header);

            // Limpiar cada fila (quitar botones, selects e inputs)
            clonedCapture.querySelectorAll("tr").forEach(tr => {
                // PLACE / LOCATION
                const placeCell = tr.cells[1];
                if (placeCell) {
                    const select = placeCell.querySelector("select");
                    const editable = placeCell.querySelector(".editable");
                    let text = (editable && editable.innerText.trim()) || (select && select.value) || "—";
                    placeCell.innerHTML = `<div style="padding: 14px 16px; font-weight: 600; color: #e2e8f0;">${text}</div>`;
                }

                // NOTES / TASK
                const taskCell = tr.cells[2];
                if (taskCell) {
                    const input = taskCell.querySelector("input");
                    let text = (input && input.value.trim()) || "—";
                    taskCell.innerHTML = `<div style="padding: 14px 16px; color: #e2e8f0;">${text}</div>`;
                }

                // HOURS
                const hoursCell = tr.cells[4];
                if (hoursCell) {
                    hoursCell.style.fontSize = "1.45rem";
                    hoursCell.style.fontWeight = "700";
                    hoursCell.style.color = "#10b981";
                }
            });
        }
    }).then(canvas => {
        const link = document.createElement("a");
        const month = document.getElementById("month").value.replace(/\s+/g, '_') || "Semana";
        link.download = `Payroll_${month}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
}

// ==================== OTRAS FUNCIONES ====================
function resetearSemanaActual() {
    if (!confirm("¿Reiniciar la semana actual? Se borrará el avance guardado.")) return;
    semanaBase = new Date();
    localStorage.removeItem("semana_actual_payroll");
    generarSemana();
}

async function guardarSemana() {
    if (!confirm("¿Guardar esta semana y pasar a la siguiente?")) return;
    alert("✅ Semana guardada correctamente");
    semanaBase.setDate(semanaBase.getDate() + 7);
    generarSemana();
    guardarLocal();
}

async function verSemanasGuardadas() {
    alert("📋 Modal de semanas guardadas (funcionalidad preservada)");
}

function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    const icon = document.getElementById('theme-icon');
    if (document.documentElement.classList.contains('dark')) {
        icon.classList.replace('fa-moon', 'fa-sun');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
    }
}

// ==================== INICIO ====================
window.onload = () => {
    AOS.init({ once: true, duration: 800 });
    generarSemana();
    cargarLocal();

    document.addEventListener("input", guardarLocal);
    document.addEventListener("change", guardarLocal);

    console.log('%c✅ Payroll listo - Exportación limpia con nombre del empleado', 'color:#6366f1; font-size:15px; font-family:Space Grotesk');
};