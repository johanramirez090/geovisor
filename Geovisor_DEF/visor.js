// === Restricción del mapa ===
const boundsCali = L.latLngBounds([3.32, -76.62], [3.52, -76.45]);
const map = L.map('map', {
    center: [3.4190, -76.5630],
    zoom: 14,
    minZoom: 12,
    maxZoom: 18,
    maxBounds: boundsCali,
    maxBoundsViscosity: 1.0
});

// === Capas base ===
const baseOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
const baseSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
const baseTopographic = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png');
const baseCarto = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png');

const baseMaps = {
    osm: baseOSM,
    satellite: baseSat,
    topo: baseTopographic,
    carto: baseCarto
};

document.getElementById('basemap-btn').addEventListener('click', () => {
    const panel = document.getElementById('basemap-panel');
    panel.style.display = (panel.style.display === 'none' || panel.style.display === '') ? 'block' : 'none';
});
document.querySelectorAll('#basemap-panel li').forEach(item => {
    item.addEventListener('click', () => {
        const selected = item.getAttribute('data-map');
        Object.values(baseMaps).forEach(layer => map.removeLayer(layer));
        baseMaps[selected].addTo(map);
        document.getElementById('basemap-panel').style.display = 'none';
    });
});

// === Capas WMS ===
const url = "http://localhost:8080/geoserver/Movilidad_y_acceso_COMUNA_20/wms";
const capaBarrios = L.tileLayer.wms(url, { layers: 'Movilidad_y_acceso_COMUNA_20:barrios', format: 'image/png', transparent: true });
const capaComuna = L.tileLayer.wms(url, { layers: 'Movilidad_y_acceso_COMUNA_20:comuna', format: 'image/png', transparent: true });
const capaEncuestas = L.tileLayer.wms(url, { layers: 'Movilidad_y_acceso_COMUNA_20:encuestas_de_movilidad', format: 'image/png', transparent: true });
const capaParadas = L.tileLayer.wms(url, { layers: 'Movilidad_y_acceso_COMUNA_20:op_paradas_rutas', format: 'image/png', transparent: true });
const capaSenderos = L.tileLayer.wms(url, { layers: 'Movilidad_y_acceso_COMUNA_20:senderos_peatonales', format: 'image/png', transparent: true });
const capaSITM = L.tileLayer.wms(url, { layers: 'Movilidad_y_acceso_COMUNA_20:sistema_integrado_transporte_masivo', format: 'image/png', transparent: true });
const capaVias = L.tileLayer.wms(url, { layers: 'Movilidad_y_acceso_COMUNA_20:vias', format: 'image/png', transparent: true });
const capaZonas = L.tileLayer.wms(url, { layers: 'Movilidad_y_acceso_COMUNA_20:zonas_inaccesibles', format: 'image/png', transparent: true });

L.control.groupedLayers({}, {
    "Movilidad": {
        "Encuestas de Movilidad": capaEncuestas,
        "Paradas de Rutas": capaParadas,
        "Senderos Peatonales": capaSenderos,
        "Transporte Masivo (SITM)": capaSITM,
        "Vías": capaVias
    },
    "Zonificación": {
        "Zonas Inaccesibles": capaZonas,
        "Barrios": capaBarrios,
        "Comuna": capaComuna
    }
}, { collapsed: false, groupCheckboxes: true }).addTo(map);

// === Coordenadas en tiempo real ===
map.on("mousemove", e => {
    const lat = e.latlng.lat.toFixed(5);
    const lng = e.latlng.lng.toFixed(5);
    document.getElementById("coords").innerText = `Latitud: ${lat} | Longitud: ${lng}`;
});

// === Escala ===
L.control.scale({ position: 'bottomleft', metric: true, imperial: false }).addTo(map);
// === Botón HOME  ===
L.Control.Home = L.Control.extend({
    onAdd: () => {
        const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom btn-home');
        btn.innerHTML = '🏠';
        btn.title = "Volver a Comuna 20";
        btn.onclick = () => map.setView([3.4190, -76.5630], 14);

        btn.style.width = '40px';
        btn.style.height = '40px';
        btn.style.fontSize = '20px';

        return btn;
    }
});
L.control.home = opts => new L.Control.Home(opts);
L.control.home({ position: 'topleft' }).addTo(map);

// === Localizador GPS ===
L.control.locate({ position: 'topleft', strings: { title: "Mostrar mi ubicación" }, keepCurrentZoomLevel: true }).addTo(map);

// === Geocoder ===
L.Control.geocoder({
    defaultMarkGeocode: true,
    placeholder: "Buscar dirección...",
    position: 'topleft'
}).addTo(map);

// === Botón metadatos ===
document.getElementById("metadata-btn").addEventListener("click", () => {
    const contenido = `
        <div style="max-height:300px; overflow-y:auto; font-size:12px;">
            <b>Nombre:</b> GeoVisor de acceso y movilidad en la comuna 20 de la ciudad Santiago de Cali<br><br>
            <b>Autores:</b> Giselly Daniela Molina, Angie Vanesa Sepúlveda, Johan Camilo Ramírez<br><br>
            <b>Fecha de creación:</b> Julio 2025<br><br>
            <b>Escala:</b> 1:5000<br><br>
            <b>Cobertura geográfica:</b> Comuna 20 de Santiago de Cali<br><br>
            <b>CRS:</b> WGS 84 (EPSG:4326)<br><br>
            <b>Norma:</b> ISO 19115<br><br>
            <b>Resumen:</b> Este visor permite analizar movilidad y acceso en la comuna 20. Incluye transporte, senderos, SITM, encuestas, vías y zonas inaccesibles.<br><br>
            <b>Fuente:</b> Trabajo SIG y fuentes oficiales<br><br>
            <b>Palabras clave:</b> movilidad, acceso, comuna 20, Cali, SIG<br><br>
            <b>Licencia:</b> Uso académico<br><br>
            <b>Organización:</b> Universidad del Valle
        </div>`;
    const center = map.getCenter();
    const adjustedLatLng = L.latLng(center.lat - 0.01, center.lng);
    L.popup({ maxWidth: 400 }).setLatLng(adjustedLatLng).setContent(contenido).openOn(map);
});

// === Compartir mapa (PDF) ===
document.getElementById("share-btn").addEventListener("click", () => {
    html2canvas(document.getElementById("map")).then(canvas => {
        const imgData = canvas.toDataURL("image/png");
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "px",
            format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save("mapa_comuna20.pdf");
    });
});

// === Herramienta de medición ===
L.control.measure({
    position: 'topleft',
    primaryLengthUnit: 'meters',
    secondaryLengthUnit: 'kilometers',
    primaryAreaUnit: 'sqmeters',
    secondaryAreaUnit: 'hectares',
    activeColor: '#3b82f6',
    completedColor: '#10b981'
}).addTo(map);

// === MiniMap ===
fetch('geojson/ciudad.geojson')
    .then(res => res.json())
    .then(data => {
        const capaCiudad = L.geoJSON(data, {
  style: { color: '#1b00b1ff', weight: 2, fillOpacity: 0.1 }
});

const miniMapBase = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

const miniMap = new L.Control.MiniMap(miniMapBase, {
  toggleDisplay: true,
  minimized: false,
  position: 'bottomleft',
  width: 150,
  height: 150,
  aimingRectOptions: { color: '#f00', weight: 2, fillOpacity: 0 },
  shadowRectOptions: { color: '#000', weight: 1, fillOpacity: 0.2 }
}).addTo(map);

// Agrega el contorno encima del OSM
capaCiudad.addTo(miniMap._miniMap);


        setTimeout(() => {
            const container = document.querySelector('.leaflet-control-minimap');
            if (container) {
                const title = document.createElement('div');
                title.textContent = 'Santiago de Cali';
                title.style.cssText = `position:absolute; top:4px; left:4px; right:4px;
                    background:rgba(255,255,255,0.8); font-size:12px;
                    text-align:center; font-weight:bold; z-index:999;
                    pointer-events:none;`;
                container.appendChild(title);
            }
        }, 500);
    });

// === FORMULARIO CICLOVÍA ===
let puntoSeleccionado = null;

document.getElementById("ciclovia-btn").onclick = function () {
    document.getElementById("ciclovia-form").style.display = "block";
};

function cerrarFormulario() {
    document.getElementById("ciclovia-form").style.display = "none";
    puntoSeleccionado = null;
}

function activarSeleccion() {
    cerrarFormulario(); // Oculta el formulario
    alert("Haz clic en el mapa para seleccionar la ubicación");

    map.once("click", function (e) {
        puntoSeleccionado = e.latlng;
        alert("📍 Ubicación seleccionada: " + puntoSeleccionado.lat.toFixed(5) + ", " + puntoSeleccionado.lng.toFixed(5));
        document.getElementById("ciclovia-form").style.display = "block";
    });
}

function enviarReporte() {
  const tipo = document.getElementById("tipo-reporte").value;
  const descripcion = document.getElementById("descripcion-reporte").value.trim(); // Observaciones

  if (!puntoSeleccionado) {
    alert("Por favor selecciona una ubicación en el mapa.");
    return;
  }

  fetch("http://127.0.0.1:5000/agregar_reporte", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tipo: tipo,
      lat: puntoSeleccionado.lat,
      lng: puntoSeleccionado.lng,
      descripcion: descripcion
    })
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || "Error al guardar el reporte.");
        });
      }
      return response.json();
    })
    .then(data => {
      alert("✅ " + data.mensaje);
      cerrarFormulario();
    })
    .catch(error => {
      alert("❌ " + error.message);
    });
}
// === Mostrar puntos reportados desde la BDG ===
let capaReportes = null;

function cargarReportes() {
  fetch("http://127.0.0.1:5000/reportes_geojson")
    .then(res => res.json())
    .then(data => {
      if (capaReportes) map.removeLayer(capaReportes);

      capaReportes = L.geoJSON(data, {
        onEachFeature: function (feature, layer) {
          const props = feature.properties;
          const id = props.id;
          const tipo = props.tipo;
          const descripcion = props.descripcion || "Sin descripción";

          layer.bindPopup(`
            <b>ID:</b> ${id}<br>
            <b>Tipo:</b> ${tipo}<br>
            <b>Descripción:</b> ${descripcion}<br><br>
            <button onclick="editarReporte(${id})">✏️ Editar</button>
            <button onclick="eliminarReporte(${id})">🗑️ Eliminar</button>
          `);
        },
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
          radius: 7,
          fillColor: "#f44336",
          color: "#222",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.85
        })
      }).addTo(map);
    });
}

// === Función para eliminar un reporte ===
function eliminarReporte(id) {
  if (!confirm(`¿Estás seguro de eliminar el reporte ${id}?`)) return;

  fetch(`http://127.0.0.1:5000/eliminar_reporte/${id}`, {
    method: "DELETE"
  })
    .then(res => res.json())
    .then(data => {
      alert(data.mensaje);
      cargarReportes();  // 
    });
}

// === Función para editar un reporte ===
function editarReporte(id) {
  const nuevoTipo = prompt("Nuevo tipo de reporte:");
  const nuevaDesc = prompt("Nueva descripción:");

  if (!nuevoTipo) {
    alert("El tipo de reporte no puede estar vacío.");
    return;
  }

  fetch(`http://127.0.0.1:5000/actualizar_reporte/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tipo: nuevoTipo,
      descripcion: nuevaDesc
    })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.mensaje);
      cargarReportes();  // refresca
    });
}

// === Llamar a cargar los puntos una vez cargado todo ===
cargarReportes();
// === Agrega leyendas gráficas debajo del control de capas existente ===
map.on('layeradd', function () {
  setTimeout(() => {
    const contenedorControl = document.querySelector('.leaflet-control-layers');
    if (!contenedorControl) return;

   
    if (document.getElementById('leyenda-auto')) return;

    const leyenda = document.createElement('div');
    leyenda.id = 'leyenda-auto';
    leyenda.style.padding = '5px';
    leyenda.style.fontSize = '10px';
    leyenda.style.background = '#f8f8f8';
    leyenda.style.borderTop = '1px solid #ccc';
    leyenda.style.marginTop = '15px';

    leyenda.innerHTML = `<strong>Leyenda:</strong><br>`;

    const capasConLeyenda = [
      { nombre: "Barrios", layerName: "Movilidad_y_acceso_COMUNA_20:barrios" },
      { nombre: "Comuna", layerName: "Movilidad_y_acceso_COMUNA_20:comuna" },
      { nombre: "Vías", layerName: "Movilidad_y_acceso_COMUNA_20:vias" },
      { nombre: "Zonas Inaccesibles", layerName: "Movilidad_y_acceso_COMUNA_20:zonas_inaccesibles" },
      { nombre: "Paradas de Rutas", layerName: "Movilidad_y_acceso_COMUNA_20:op_paradas_rutas" },
      { nombre: "Senderos Peatonales", layerName: "Movilidad_y_acceso_COMUNA_20:senderos_peatonales" },
      { nombre: "Transporte Masivo (SITM)", layerName: "Movilidad_y_acceso_COMUNA_20:sistema_integrado_transporte_masivo" },
      { nombre: "Encuestas de Movilidad", layerName: "Movilidad_y_acceso_COMUNA_20:encuestas_de_movilidad" }
    ];

    capasConLeyenda.forEach(capa => {
      leyenda.innerHTML += `
        <div style="margin: 6px 0;">
          <div><strong>${capa.nombre}</strong></div>
          <img src="http://localhost:8080/geoserver/Movilidad_y_acceso_COMUNA_20/wms?REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=${capa.layerName}" 
               alt="Leyenda ${capa.nombre}" 
               style="max-width: 180px; border:1px solid #ccc; background:#fff; padding:2px; border-radius:4px;" />
        </div>
      `;
    });

    contenedorControl.appendChild(leyenda);
  }, 1000); // Espera para que cargue el panel original
});




