// 1. Configuración de Temas de Tailwind CSS
tailwind.config = {
    theme: {
        extend: {
            colors: {
                brand: '#F79131',   // Naranja
                dark: '#7A2C8E',    // Morado
                accent: '#4DB748',  // Verde claro
            }
        }
    }
};

// 2. Cuenta Regresiva (Timer)
const targetDate = new Date("June 14, 2026 23:59:59").getTime();

const countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
        clearInterval(countdownInterval);
        document.getElementById("countdown").innerHTML = "<span class='text-sm uppercase font-sans'>¡Inscripciones Cerradas!</span>";
        return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = d < 10 ? "0" + d : d;
    document.getElementById("hours").innerText = h < 10 ? "0" + h : h;
    document.getElementById("minutes").innerText = m < 10 ? "0" + m : m;
    document.getElementById("seconds").innerText = s < 10 ? "0" + s : s;
}, 1000);



// ---------
// FINALISTAS
// ----------


document.addEventListener('DOMContentLoaded', async () => {
    // ⚠️ REEMPLAZA ESTA URL CON EL ENLACE DE TU GOOGLE SHEET PUBLICADO COMO CSV
    const sheetCSVUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRm8pZY0HkmM-i6o3UtwLrRLoE4fwRUQOjE9DIpZlzG67v2ywIjNChBogXEtenPxKPspCl_LCoJEFOP/pub?output=csv';
    
    const tbody = document.getElementById('tabla-participantes');

    try {
        const respuesta = await fetch(sheetCSVUrl);
        
        // El formato por defecto de Google Sheets al publicar en web es UTF-8, 
        // lo que garantiza compatibilidad con tildes y eñes.
        const datosCsv = await respuesta.text();
        
        // Dividir el CSV por filas manejando saltos de línea estándar
        const filas = datosCsv.split(/\r?\n/);
        if (filas.length === 0 || !filas[0].trim()) throw new Error("El archivo CSV está vacío.");

        // 1. LEER LOS ENCABEZADOS DE LA HOJA (Primera fila)
        // Usamos una función auxiliar para separar por comas respetando celdas con comillas
        const encabezados = parsearFilaCSV(filas[0]).map(h => h.toLowerCase().trim());

        // 2. BUSCAR LOS ÍNDICES DINÁMICAMENTE
        // Cambia los textos de la derecha si en tu Excel los encabezados se llaman diferente
        const indices = {
            region: encabezados.indexOf('región'),
            institucion: encabezados.indexOf('institución educativa'),
            club: encabezados.indexOf('club de ciencia y tecnología'),
            nombres: encabezados.indexOf('nombres y apellidos'),
            grado: encabezados.indexOf('grado de estudios'),
            titulo: encabezados.indexOf('título del monólogo'),
            condicion: encabezados.indexOf('condición')
        };

        // Intentar búsqueda secundaria más flexible si no se encuentra con tildes
        if (indices.region === -1) indices.region = encabezados.indexOf('region');
        if (indices.institucion === -1) indices.institucion = encabezados.indexOf('institucion educativa');
        if (indices.club === -1) indices.club = encabezados.indexOf('club de ciencia');
        if (indices.titulo === -1) indices.titulo = encabezados.indexOf('titulo del monologo');
        if (indices.condicion === -1) indices.condicion = encabezados.indexOf('condicion');

        tbody.innerHTML = ''; // Limpiar el mensaje de "Cargando..."

        // 3. PROCESAR LAS FILAS DE LOS 8 PARTICIPANTES (omitimos el encabezado fila 0)
        let contadorParticipantes = 0;

        for (let i = 1; i < filas.length; i++) {
            if (!filas[i].trim()) continue; // Ignorar filas vacías
            if (contadorParticipantes >= 8) break; // Limitar estrictamente a 8 participantes

            const columnas = parsearFilaCSV(filas[i]);

            // Extraer la información basándonos en los índices dinámicos detectados
            const valorRegion = indices.region !== -1 ? columnas[indices.region] : '-';
            const valorInstitucion = indices.institucion !== -1 ? columnas[indices.institucion] : '-';
            const valorClub = indices.club !== -1 ? columnas[indices.club] : '-';
            const valorNombres = indices.nombres !== -1 ? columnas[indices.nombres] : '-';
            const valorGrado = indices.grado !== -1 ? columnas[indices.grado] : '-';
            const valorTitulo = indices.titulo !== -1 ? columnas[indices.titulo] : '-';
            const valorCondicion = indices.condicion !== -1 ? columnas[indices.condicion] : 'Registrado';

            // Crear la fila HTML inyectando los datos de forma segura
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-50 transition-colors group';
            
            tr.innerHTML = `
                <td class="py-3 px-4 text-slate-700 font-medium bg-slate-50/30 text-sm">${valorRegion}</td>
                <td class="py-3 px-4 text-slate-600 text-sm">${valorInstitucion}</td>
                <td class="py-3 px-4 text-slate-600 text-sm italic">${valorClub}</td>
                <td class="py-3 px-4 text-dark font-bold text-sm">${valorNombres}</td>
                <td class="py-3 px-4 text-slate-600 font-medium text-center text-sm">${valorGrado}</td>
                <td class="py-3 px-4 text-slate-700 font-medium leading-tight text-sm">${valorTitulo}</td>
                <td class="py-3 px-4 text-center">
                    <span class="inline-block px-3 py-1 bg-brand/10 text-brand font-bold text-[11px] uppercase tracking-wide rounded-full">
                        ${valorCondicion}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
            contadorParticipantes++;
        }

        if (contadorParticipantes === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="py-6 px-6 text-center text-slate-500">No se encontraron registros válidos.</td></tr>`;
        }

    } catch (error) {
        console.error('Error al cargar la hoja de cálculo:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="py-6 px-6 text-center text-red-500 font-medium">
                    Error al cargar los participantes. Verifica el enlace de Google Sheets y los nombres de las columnas.
                </td>
            </tr>
        `;
    }
});

/**
 * Función auxiliar para procesar una línea de CSV correctamente.
 * Respeta comas internas si la celda está envuelta en comillas ("Texto, con comas")
 * y remueve las comillas sobrantes al final.
 */
function parsearFilaCSV(linea) {
    const resultado = [];
    let celdaActual = '';
    let dentroDeComillas = false;

    for (let i = 0; i < linea.length; i++) {
        const caracter = linea[i];

        if (caracter === '"') {
            dentroDeComillas = !dentroDeComillas; // Alternar estado
        } else if (caracter === ',' && !dentroDeComillas) {
            resultado.push(celdaActual.trim());
            celdaActual = '';
        } else {
            celdaActual += caracter;
        }
    }
    resultado.push(celdaActual.trim()); // Añadir la última celda
    return resultado;
}

// 3. Integración con Google Sheets para Galería de Videos
const SHEET_ID = '1zC2Fuzg4avjnql-gENAb-qqXZgoZxsJJIV0gihzCbtA';
const SHEET_NAME = 'Hoja 1'; 
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

fetch(URL)
    .then(res => res.text())
    .then(data => {
        const json = JSON.parse(data.substr(47).slice(0, -2));
        const rows = json.table.rows;
        const contenedor = document.getElementById('contenedor-videos');
        
        let htmlTarjetas = ''; // Guardamos todo el HTML aquí para mayor rendimiento

        rows.slice(1).forEach(row => {
            const idVideo = row.c[0].v;
            const titulo = row.c[1] ? row.c[1].v : "Sin título";
            const descripcion = row.c[2] ? row.c[2].v : "";

            const thumbHD = `https://img.youtube.com/vi/${idVideo}/maxresdefault.jpg`;
            const thumbSD = `https://img.youtube.com/vi/${idVideo}/hqdefault.jpg`;

            // ¡IMPORTANTE! Aquí están las clases shrink-0, w-full, md:w-[calc(50%-12px)] y snap-center
            const card = `
                <div class="shrink-0 w-full md:w-[calc(50%-12px)] snap-center bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 border-t-4 border-brand overflow-hidden flex flex-col">
                    <div class="aspect-video relative group cursor-pointer bg-black overflow-hidden" 
                        id="container-${idVideo}"
                        onclick="loadVideo('${idVideo}')">
                        
                        <img src="${thumbSD}" 
                            onerror="this.src='${thumbHD}'" 
                            alt="${titulo}" 
                            class="w-full h-full object-cover object-center transform group-hover:scale-[1.05] transition duration-500">
                        
                        <div class="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/40 transition duration-300">
                            <div class="bg-red-600 text-white w-14 h-14 flex items-center justify-center rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7 ml-1">
                                    <path fill-rule="evenodd" d="M4.5 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div class="p-6 flex-grow bg-white">
                        <h3 class="text-xl font-bold mb-2 text-dark line-clamp-2">${titulo}</h3>
                        <p class="text-slate-600 text-sm leading-relaxed line-clamp-3">${descripcion}</p>
                    </div>
                </div>
            `;
            htmlTarjetas += card;
        });
        
        // Imprimimos todas las tarjetas de una sola vez
        contenedor.innerHTML = htmlTarjetas;
    })
    .catch(err => {
        console.error(err);
        document.getElementById('contenedor-videos').innerHTML = '<p class="text-red-500 text-center w-full py-12">Error al cargar los videos. Por favor, intenta nuevamente más tarde.</p>';
    });

// 4. Función global para reproducir los vídeos en iFrame al hacer clic
function loadVideo(id) {
    const container = document.getElementById(`container-${id}`);
    container.innerHTML = `
        <iframe 
            class="w-full h-full" 
            src="https://www.youtube.com/embed/${id}?autoplay=1" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>`;
}

// 5. Lógica de las flechas del carrusel
document.addEventListener("DOMContentLoaded", () => {
    const contenedorVideos = document.getElementById('contenedor-videos');
    const btnPrev = document.getElementById('btn-prev-video');
    const btnNext = document.getElementById('btn-next-video');

    if(btnNext && btnPrev && contenedorVideos) {
        btnNext.addEventListener('click', () => {
            // Avanza exactamente la mitad del ancho visible (1 tarjeta y su margen)
            const scrollAmount = contenedorVideos.clientWidth / 2; 
            contenedorVideos.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        btnPrev.addEventListener('click', () => {
            const scrollAmount = contenedorVideos.clientWidth / 2;
            contenedorVideos.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
    }
});
