const usuarioInfo =
    "Nombre: Juan Esteban, " +
    "Objetivo: Aumentar masa muscular, Quemar grasa, Tener hombros anchos";

function generarRutina() {
    fetch("/generar_rutina", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_info: usuarioInfo })
    })
    .then(res => res.json())
    .then(data => renderRutina(data));
}

function generarReceta() {
    fetch("/generar_receta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_info: usuarioInfo })
    })
    .then(res => res.json())
    .then(data => renderReceta(data));
}

function renderRutina(data) {
    const card = document.getElementById("resultado");
    card.style.display = "block";

    let html = `<h2>${data.saludo}</h2><ul>`;
    data.ejercicios.forEach(e => {
        html += `<li><strong>${e.ejercicio}</strong>: ${e.series} x ${e.repeticiones}</li>`;
    });
    html += "</ul>";

    card.innerHTML = html;
}

function renderReceta(data) {
    const card = document.getElementById("resultado");
    card.style.display = "block";

    let html = `
        <h2>${data.titulo}</h2>
        <p>${data.descripcion}</p>

        <h4>Ingredientes</h4>
        <ul>${data.ingredientes.map(i => `<li>${i}</li>`).join("")}</ul>

        <h4>Preparación</h4>
        <ol>${data.preparacion.map(p => `<li>${p}</li>`).join("")}</ol>

        <p><strong>Calorías:</strong> ${data.calorias_aproximadas}</p>
    `;

    card.innerHTML = html;
}
