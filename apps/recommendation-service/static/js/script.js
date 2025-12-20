const chat = document.getElementById("chat");

const usuarioInfo =
    "Nombre: Juan Esteban, " +
    "Objetivo: Aumentar masa muscular, Quemar grasa, Tener hombros anchos";

function addMessage(text, type = "ai") {
    const div = document.createElement("div");
    div.className = `message ${type}`;
    div.innerHTML = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function generarRutina() {
    const metas = getMetasSeleccionadas();

    addMessage("Quiero una rutina de entrenamiento para hoy.", "user");
    showLoader();

    fetch("/recomendacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            tipo: "rutina",
            metas: metas
        })
    })
    .then(res => res.json())
    .then(data => {
        hideLoader();

        if (data.error) {
            addMessage(`⚠️ ${data.message}`, "error");
            return;
        }

        let html = `<strong>${data.saludo}</strong><ul>`;
        data.ejercicios.forEach(e => {
            html += `<li>${e.ejercicio}: ${e.series} x ${e.repeticiones}</li>`;
        });
        html += "</ul>";

        addMessage(html, "ai");
    })
    .catch(() => {
        hideLoader();
        addMessage("⚠️ Error de conexión.", "error");
    });
}



function generarReceta() {
    const metas = getMetasSeleccionadas();

    addMessage("¿Qué debería comer hoy?", "user");
    showLoader();

    fetch("/recomendacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            tipo: "nutricion",
            metas: metas
        })
    })
    .then(res => res.json())
    .then(data => {
        hideLoader();

        if (data.error) {
            addMessage(`⚠️ ${data.message}`, "error");
            return;
        }

        let html = `
            <strong>${data.titulo}</strong>
            <p>${data.descripcion}</p>

            <strong>Ingredientes</strong>
            <ul>
                ${data.ingredientes.map(i => `<li>${i}</li>`).join("")}
            </ul>

            <strong>Preparación</strong>
            <ol>
                ${data.preparacion.map(p => `<li>${p}</li>`).join("")}
            </ol>

            <strong>Calorías aproximadas:</strong> ${data.calorias_aproximadas} kcal
        `;

        addMessage(html, "ai");
    })
    .catch(() => {
        hideLoader();
        addMessage("⚠️ Error de conexión con el servidor.", "error");
    });
}


function showLoader() {
    document.getElementById("loader").classList.remove("hidden");
}

function hideLoader() {
    document.getElementById("loader").classList.add("hidden");
}

function getMetasSeleccionadas() {
    const checkboxes = document.querySelectorAll(".preferences input:checked");

    if (checkboxes.length > 3) {
        alert("Puedes seleccionar máximo 3 metas.");
        checkboxes[checkboxes.length - 1].checked = false;
        return [];
    }

    return Array.from(checkboxes).map(cb => cb.value);
}
