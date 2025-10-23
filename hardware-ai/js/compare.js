// js/compare.js - Versión completa y actualizada con integración OpenAI

// Inicializar Firebase
const firebaseConfig = {
    apiKey: "AIzaSyClzzRrxUOTwd_dfOBE6dVv3V1G6xrTXuE",
    authDomain: "t-hardia.firebaseapp.com",
    projectId: "t-hardia",
    storageBucket: "t-hardia.firebasestorage.app",
    messagingSenderId: "462770565143",
    appId: "1:462770565143:web:d6de124051899b9c742c52",
    measurementId: "G-YQ9D6T371T"
};

firebase.initializeApp(firebaseConfig);

// Verificar autenticación
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        document.getElementById('user-name').textContent = user.displayName || user.email.split('@')[0];
        loadCategories();
        loadDatabaseItems();
    } else {
        window.location.href = 'index.html';
    }
});

// Cerrar sesión
document.getElementById('logout-btn').addEventListener('click', function() {
    firebase.auth().signOut().then(function() {
        window.location.href = 'index.html';
    }).catch(function(error) {
        console.error('Error al cerrar sesión:', error);
        alert('Error al cerrar sesión: ' + error.message);
    });
});

// Toggle tema
document.getElementById('theme-toggle').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    const icon = this.querySelector('i');
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
    }
});

// Cargar tema guardado
window.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const icon = document.getElementById('theme-toggle').querySelector('i');
        if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }
});

// Variables para almacenar selecciones
let selectedItemA = null;
let selectedItemB = null;
let currentFilter = 'all';
let currentSearch = '';
let isLoading = false;

// Cargar categorías
function loadCategories() {
    fetch('http://localhost:5000/api/categories')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const categorySelect = document.getElementById('category');
            categorySelect.innerHTML = '<option value="">Selecciona una categoría</option>';
            
            data.categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                categorySelect.appendChild(option);
            });
            
            // Configurar filtros
            const filterContainer = document.querySelector('.mb-3');
            filterContainer.innerHTML = '<button class="btn btn-outline filter-btn active" data-category="all">Todos</button>';
            
            data.categories.forEach(cat => {
                const filterBtn = document.createElement('button');
                filterBtn.className = 'btn btn-outline filter-btn';
                filterBtn.textContent = cat.name.split(' ')[0]; // Solo la primera palabra
                filterBtn.dataset.category = cat.id;
                filterBtn.addEventListener('click', function() {
                    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    filterDatabase(cat.id);
                });
                filterContainer.appendChild(filterBtn);
            });
        })
        .catch(error => {
            console.error('Error cargando categorías:', error);
            document.getElementById('category').innerHTML = '<option value="">Error al cargar categorías</option>';
        });
}

// Configurar búsqueda para ambos campos
setupSearch('A');
setupSearch('B');

// Configurar búsqueda en base de datos
document.getElementById('search-database').addEventListener('input', function() {
    currentSearch = this.value;
    loadDatabaseItems(currentSearch, currentFilter);
});

// Cargar items de la base de datos
function loadDatabaseItems(searchTerm = '', category = 'all') {
    if (isLoading) return;
    isLoading = true;
    
    const resultsContainer = document.getElementById('database-results');
    if (!searchTerm && category === 'all') {
        resultsContainer.innerHTML = '<div class="text-center" style="grid-column: 1/-1;"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Cargando componentes...</p></div>';
    }
    
    let apiUrl = 'http://localhost:5000/api/search?limit=24';
    if (searchTerm) apiUrl += `&q=${encodeURIComponent(searchTerm)}`;
    if (category !== 'all') apiUrl += `&category=${category}`;
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            resultsContainer.innerHTML = '';
            
            if (data.results && data.results.length > 0) {
                data.results.forEach(item => {
                    const itemCard = createItemCard(item);
                    resultsContainer.appendChild(itemCard);
                });
            } else {
                resultsContainer.innerHTML = '<div class="text-center" style="grid-column: 1/-1;">No se encontraron componentes</div>';
            }
            
            isLoading = false;
        })
        .catch(error => {
            console.error('Error cargando componentes:', error);
            resultsContainer.innerHTML = `<div class="text-center text-danger" style="grid-column: 1/-1;">Error al cargar componentes: ${error.message}</div>`;
            isLoading = false;
        });
}

// Crear tarjeta de componente
function createItemCard(item) {
    const itemCard = document.createElement('div');
    itemCard.className = 'card';
    itemCard.style = 'padding: 1rem; cursor: pointer; transition: transform 0.2s;';
    itemCard.innerHTML = `
        <h4 style="margin-bottom: 0.5rem; color: var(--primary);">${item.name}</h4>
        <p style="font-size: 0.9rem; color: var(--gray); margin-bottom: 0.5rem;">
            ${getCategoryName(item.category)} • ${item.brand || 'Marca desconocida'} • $${item.price || 'N/A'}
        </p>
        <div style="font-size: 0.8rem;">
            ${getItemPreview(item)}
        </div>
        <div style="font-size: 0.7rem; color: #666; margin-top: 0.5rem;">
            Fuente: ${item.source || 'Base de datos'}
        </div>
    `;
    
    itemCard.addEventListener('click', () => {
        document.getElementById('category').value = item.category;
        triggerCategoryChange();
        setTimeout(() => {
            document.getElementById('searchA').value = item.name;
            selectItem('A', item);
        }, 100);
    });
    
    return itemCard;
}

// Filtrar base de datos
function filterDatabase(category) {
    currentFilter = category;
    loadDatabaseItems(currentSearch, category);
}

// Obtener nombre de categoría
function getCategoryName(category) {
    const names = {
        'cpu': 'CPU',
        'gpu': 'GPU',
        'ram': 'RAM',
        'ssd': 'SSD',
        'motherboard': 'Placa Base',
        'psu': 'Fuente',
        'cooler': 'Refrigeración'
    };
    return names[category] || category.toUpperCase();
}

// Obtener preview del item
function getItemPreview(item) {
    const specs = [];
    
    if (item.cores) specs.push(`${item.cores} núcleos`);
    if (item.threads) specs.push(`${item.threads} hilos`);
    if (item.vramGB) specs.push(`${item.vramGB}GB VRAM`);
    if (item.capacityGB) specs.push(`${item.capacityGB}GB`);
    if (item.speedMHz) specs.push(`${item.speedMHz}MHz`);
    if (item.wattage) specs.push(`${item.wattage}W`);
    if (item.rating) specs.push(`★ ${item.rating}`);
    
    return specs.length > 0 ? specs.join(', ') : 'Componente de hardware';
}

// Configurar búsqueda para un campo
function setupSearch(field) {
    const searchInput = document.getElementById(`search${field}`);
    const suggestionsDiv = document.getElementById(`suggestions${field}`);
    const loadingIndicator = document.getElementById(`loading${field}`);
    
    let debounceTimer;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value;
        const category = document.getElementById('category').value;
        
        clearTimeout(debounceTimer);
        
        if (!category) {
            suggestionsDiv.innerHTML = '<div class="suggestion-item" style="padding: 0.5rem; color: #666;">Selecciona una categoría primero</div>';
            suggestionsDiv.style.display = 'block';
            return;
        }
        
        if (searchTerm.length < 2) {
            suggestionsDiv.style.display = 'none';
            loadingIndicator.style.display = 'none';
            return;
        }
        
        loadingIndicator.style.display = 'block';
        suggestionsDiv.style.display = 'none';
        
        debounceTimer = setTimeout(() => {
            fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(searchTerm)}&category=${category}&limit=8`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    loadingIndicator.style.display = 'none';
                    
                    if (data.results && data.results.length > 0) {
                        suggestionsDiv.innerHTML = '';
                        data.results.forEach(item => {
                            const suggestion = document.createElement('div');
                            suggestion.className = 'suggestion-item';
                            suggestion.style = 'padding: 0.75rem; cursor: pointer; border-bottom: 1px solid #eee;';
                            suggestion.innerHTML = `
                                <div style="font-weight: 500;">${item.name}</div>
                                <div style="font-size: 0.85rem; color: #666;">${item.brand || 'Marca desconocida'} • $${item.price || 'N/A'} • ${getItemPreview(item)}</div>
                            `;
                            suggestion.addEventListener('click', () => {
                                selectItem(field, item);
                                searchInput.value = item.name;
                                suggestionsDiv.style.display = 'none';
                            });
                            suggestionsDiv.appendChild(suggestion);
                        });
                    } else {
                        suggestionsDiv.innerHTML = '<div class="suggestion-item" style="padding: 0.5rem; color: #666;">No se encontraron resultados</div>';
                    }
                    
                    suggestionsDiv.style.display = 'block';
                })
                .catch((error) => {
                    console.error('Error buscando componentes:', error);
                    loadingIndicator.style.display = 'none';
                    suggestionsDiv.innerHTML = '<div class="suggestion-item" style="padding: 0.5rem; color: #d9534f;">Error en la búsqueda: ' + error.message + '</div>';
                    suggestionsDiv.style.display = 'block';
                });
        }, 300);
    });
    
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.style.display = 'none';
            loadingIndicator.style.display = 'none';
        }
    });
}

// Seleccionar un item
function selectItem(field, item) {
    if (field === 'A') {
        selectedItemA = item;
        document.getElementById('selectedA').value = item.id;
        document.getElementById('selected-itemA').innerHTML = `
            <div class="card" style="padding: 1rem; margin-top: 1rem;">
                <h4 style="margin-bottom: 0.5rem; color: var(--primary);">${item.name}</h4>
                <p style="font-size: 0.9rem; color: var(--gray);">Marca: ${item.brand || 'N/A'} • Precio: $${item.price || 'N/A'}</p>
                <div style="font-size: 0.85rem; margin-top: 0.5rem;">${getItemPreview(item)}</div>
                ${item.rating ? `<div style="margin-top: 0.5rem; color: #ffc107;">★ ${item.rating}</div>` : ''}
            </div>
        `;
    } else {
        selectedItemB = item;
        document.getElementById('selectedB').value = item.id;
        document.getElementById('selected-itemB').innerHTML = `
            <div class="card" style="padding: 1rem; margin-top: 1rem;">
                <h4 style="margin-bottom: 0.5rem; color: var(--primary);">${item.name}</h4>
                <p style="font-size: 0.9rem; color: var(--gray);">Marca: ${item.brand || 'N/A'} • Precio: $${item.price || 'N/A'}</p>
                <div style="font-size: 0.85rem; margin-top: 0.5rem;">${getItemPreview(item)}</div>
                ${item.rating ? `<div style="margin-top: 0.5rem; color: #ffc107;">★ ${item.rating}</div>` : ''}
            </div>
        `;
    }
}

// Trigger cambio de categoría
function triggerCategoryChange() {
    const event = new Event('change');
    document.getElementById('category').dispatchEvent(event);
}

// Cuando cambia la categoría
document.getElementById('category').addEventListener('change', function() {
    document.getElementById('searchA').value = '';
    document.getElementById('searchB').value = '';
    document.getElementById('selected-itemA').innerHTML = '';
    document.getElementById('selected-itemB').innerHTML = '';
    document.getElementById('selectedA').value = '';
    document.getElementById('selectedB').value = '';
    selectedItemA = null;
    selectedItemB = null;
    document.getElementById('comparison-result').style.display = 'none';
});

// Comparar componentes
document.getElementById('compare-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const category = document.getElementById('category').value;
    const itemAId = document.getElementById('selectedA').value;
    const itemBId = document.getElementById('selectedB').value;

    if (!category || !itemAId || !itemBId) {
        alert('Por favor selecciona una categoría y ambos componentes');
        return;
    }

    if (itemAId === itemBId) {
        alert('No puedes comparar el mismo componente consigo mismo');
        return;
    }

    const componentA = selectedItemA;
    const componentB = selectedItemB;

    if (!componentA || !componentB) {
        alert('Error al obtener los componentes seleccionados');
        return;
    }

    document.getElementById('itemA-name').textContent = componentA.name;
    document.getElementById('itemB-name').textContent = componentB.name;

    const specTableBody = document.getElementById('spec-table-body');
    specTableBody.innerHTML = '';

    const allKeys = new Set([...Object.keys(componentA), ...Object.keys(componentB)]);
    ['id', 'searchName', 'createdAt', 'updatedAt', 'source'].forEach(key => allKeys.delete(key));

    allKeys.forEach(key => {
        const row = document.createElement('tr');
        const valueA = componentA[key] !== undefined ? componentA[key] : 'N/A';
        const valueB = componentB[key] !== undefined ? componentB[key] : 'N/A';

        row.innerHTML = `
            <td>${formatKey(key)}</td>
            <td>${valueA}</td>
            <td>${valueB}</td>
        `;
        specTableBody.appendChild(row);
    });

    // Mostrar recomendación local (fallback)
    const aiRecommendation = document.getElementById('ai-recommendation');
    aiRecommendation.innerHTML = generateAIRecommendation(category, componentA, componentB);

    document.getElementById('comparison-result').style.display = 'block';
    document.getElementById('comparison-result').scrollIntoView({ behavior: 'smooth' });

    saveComparisonToFirestore(componentA, componentB, category);
    
    // Llamar a la función de análisis IA
    obtenerAnalisisIA(category, componentA, componentB);
});

// Formatear nombres de claves
function formatKey(key) {
    const keyMap = {
        'name': 'Nombre', 'brand': 'Marca', 'price': 'Precio (USD)', 'cores': 'Núcleos', 'threads': 'Hilos',
        'baseGHz': 'Frecuencia Base (GHz)', 'boostGHz': 'Frecuencia Boost (GHz)', 'tdp': 'TDP (W)', 'socket': 'Socket',
        'vramGB': 'VRAM (GB)', 'boostMHz': 'Frecuencia Boost (MHz)', 'capacityGB': 'Capacidad (GB)', 'speedMHz': 'Velocidad (MHz)',
        'timings': 'Timings', 'voltage': 'Voltaje (V)', 'sequentialReadMBs': 'Lectura Secuencial (MB/s)',
        'sequentialWriteMBs': 'Escritura Secuencial (MB/s)', 'wattage': 'Potencia (W)', 'efficiency': 'Eficiencia',
        'formFactor': 'Factor de Forma', 'chipset': 'Chipset', 'rating': 'Calificación'
    };
    return keyMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

// Guardar comparación en Firestore
function saveComparisonToFirestore(componentA, componentB, category) {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const db = firebase.firestore();
    db.collection('comparaciones').add({
        userId: user.uid,
        usuarioNombre: user.displayName || user.email.split('@')[0],
        fecha: firebase.firestore.FieldValue.serverTimestamp(),
        componenteA: componentA.id,
        componenteB: componentB.id,
        categoria: category,
        nombres: { componenteA: componentA.name, componenteB: componentB.name }
    })
    .then(() => console.log('Comparación guardada en Firestore'))
    .catch((error) => console.error('Error guardando comparación:', error));
}

// Generar recomendación AI (simulada)
function generateAIRecommendation(category, a, b) {
    let recommendation = `<p>Comparando <strong>${a.name}</strong> y <strong>${b.name}</strong>:</p><ul>`;
    const priceA = parseFloat(a.price) || 0;
    const priceB = parseFloat(b.price) || 0;
    const priceDiff = priceA - priceB;
    const winnerPrice = priceDiff < 0 ? a.name : b.name;
    
    switch(category) {
        case 'cpu':
            const coreDiff = (a.cores || 0) - (b.cores || 0);
            const performanceDiff = a.boostGHz && b.boostGHz ? ((a.boostGHz / b.boostGHz) - 1) * 100 : 0;
            recommendation += `
                <li>${a.name} tiene ${a.cores || 'N/A'} núcleos vs ${b.cores || 'N/A'} núcleos en ${b.name}</li>
                <li>Frecuencia máxima: ${a.boostGHz || 'N/A'}GHz vs ${b.boostGHz || 'N/A'}GHz (${performanceDiff > 0 ? '+' : ''}${performanceDiff.toFixed(1)}%)</li>
                <li>La diferencia de precio es de $${Math.abs(priceDiff).toFixed(2)} USD</li>
                <li>En términos de precio por núcleo, <strong>${winnerPrice}</strong> ofrece mejor valor</li>
            `; 
            break;
        case 'gpu':
            const vramDiff = (a.vramGB || 0) - (b.vramGB || 0);
            const performanceDiffGPU = a.boostMHz && b.boostMHz ? ((a.boostMHz / b.boostMHz) - 1) * 100 : 0;
            recommendation += `
                <li>${a.name} tiene ${a.vramGB || 'N/A'}GB de VRAM vs ${b.vramGB || 'N/A'}GB en ${b.name}</li>
                <li>Frecuencia de boost: ${a.boostMHz || 'N/A'}MHz vs ${b.boostMHz || 'N/A'}MHz (${performanceDiffGPU > 0 ? '+' : ''}${performanceDiffGPU.toFixed(1)}%)</li>
                <li>La diferencia de precio es de $${Math.abs(priceDiff).toFixed(2)} USD</li>
                <li>Para gaming de alta resolución, <strong>${winnerPrice}</strong> ofrece mejor relación calidad-precio</li>
            `; 
            break;
        case 'ram':
            const capacityDiff = (a.capacityGB || 0) - (b.capacityGB || 0);
            const speedDiff = (a.speedMHz || 0) - (b.speedMHz || 0);
            recommendation += `
                <li>${a.name} tiene ${a.capacityGB || 'N/A'}GB vs ${b.capacityGB || 'N/A'}GB en ${b.name}</li>
                <li>Velocidad: ${a.speedMHz || 'N/A'}MHz vs ${b.speedMHz || 'N/A'}MHz (${speedDiff > 0 ? '+' : ''}${speedDiff}MHz)</li>
                <li>La diferencia de precio es de $${Math.abs(priceDiff).toFixed(2)} USD</li>
                <li>Para multitarea intensiva, <strong>${winnerPrice}</strong> ofrece mejor valor</li>
            `; 
            break;
        case 'ssd':
            const capacityDiffSSD = (a.capacityGB || 0) - (b.capacityGB || 0);
            const readDiff = (a.sequentialReadMBs || 0) - (b.sequentialReadMBs || 0);
            const readPerformance = a.sequentialReadMBs && b.sequentialReadMBs ? ((a.sequentialReadMBs / b.sequentialReadMBs) - 1) * 100 : 0;
            recommendation += `
                <li>${a.name} tiene ${a.capacityGB || 'N/A'}GB vs ${b.capacityGB || 'N/A'}GB en ${b.name}</li>
                <li>Lectura secuencial: ${a.sequentialReadMBs || 'N/A'}MB/s vs ${b.sequentialReadMBs || 'N/A'}MB/s (${readPerformance > 0 ? '+' : ''}${readPerformance.toFixed(1)}%)</li>
                <li>La diferencia de precio es de $${Math.abs(priceDiff).toFixed(2)} USD</li>
                <li>Para almacenamiento de alto rendimiento, <strong>${winnerPrice}</strong> ofrece mejor relación calidad-precio</li>
            `; 
            break;
        default:
            recommendation += `
                <li>La diferencia de precio es de $${Math.abs(priceDiff).toFixed(2)} USD</li>
                <li>Basado en el precio, <strong>${winnerPrice}</strong> ofrece mejor valor</li>
            `;
    }
    if (a.rating && b.rating) {
        const ratingDiff = a.rating - b.rating;
        const winnerRating = ratingDiff > 0 ? a.name : b.name;
        recommendation += `<li>Calificación: ${a.name} (${a.rating}★) vs ${b.name} (${b.rating}★) - <strong>${winnerRating}</strong> tiene mejor calificación</li>`;
    }
    recommendation += `</ul><p class="mt-2"><strong>Recomendación AI:</strong> Basado en tu perfil de uso, recomendamos <strong>${winnerPrice}</strong> por su mejor relación precio-rendimiento.</p>`;
    return recommendation;
}

// ---- VERSIÓN CORREGIDA: pedir análisis real al backend ----
async function obtenerAnalisisIA(category, componentA, componentB) {
    const container = document.getElementById('ai-compare-remote');
    const loading = document.getElementById('ai-compare-loading');
    const resultDiv = document.getElementById('ai-compare-result');
    const errorDiv = document.getElementById('ai-compare-error');

    // Mostrar contenedor y loading
    container.style.display = 'block';
    loading.style.display = 'inline-block';
    resultDiv.innerHTML = '';
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    try {
        console.log('Enviando datos a IA:', { category, componentA, componentB }); // Para debugging
        
        const res = await fetch('http://127.0.0.1:5000/api/compare', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                category: category,
                componentA: componentA,  // Enviar objeto completo
                componentB: componentB   // Enviar objeto completo
            })
        });

        loading.style.display = 'none';

        if (!res.ok) {
            let errorMessage = `Error del servidor: ${res.status}`;
            try {
                const errorData = await res.json();
                errorMessage += ` - ${errorData.error || 'Sin detalles del servidor'}`;
            } catch (e) {
                errorMessage += ` - ${res.statusText}`;
            }
            throw new Error(errorMessage);
        }

        const data = await res.json();
        console.log('Respuesta de IA:', data); // Para debugging

        if (data.analysis) {
            resultDiv.innerHTML = `<div class="ai-analysis-card"><h4>Análisis con Inteligencia Artificial</h4><p>${escapeHtml(data.analysis).replace(/\n/g, '<br>')}</p></div>`;
        } else {
            resultDiv.innerHTML = `<div class="ai-analysis-card">La IA no devolvió un análisis válido.</div>`;
        }
    } catch (err) {
        loading.style.display = 'none';
        console.error('Error llamando a /api/compare:', err);
        errorDiv.style.display = 'block';
        errorDiv.textContent = `Error: ${err.message}`;
    }
}

// Escape para evitar inyección simple
function escapeHtml(unsafe) {
    return (unsafe + '').replace(/[&<"']/g, function(m) {
        return {'&':'&amp;','<':'&lt;','"':'&quot;',"'":'&#039;'}[m];
    });
}

// Agregar estilos dinámicamente
const style = document.createElement('style');
style.textContent = `
    .suggestions-dropdown { 
        position: absolute; 
        top: 100%; 
        left: 0; 
        right: 0; 
        background: white; 
        border: 1px solid #ddd; 
        border-radius: 4px; 
        max-height: 200px; 
        overflow-y: auto; 
        z-index: 1000; 
        display: none; 
        box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
    }
    .dark-mode .suggestions-dropdown { 
        background: var(--darker); 
        border-color: #444; 
    }
    .suggestion-item:hover { 
        background-color: #f5f5f5; 
    }
    .dark-mode .suggestion-item:hover { 
        background-color: rgba(255,255,255,0.1); 
    }
    .selected-item-display { 
        margin-top: 0.5rem; 
    }
    .loading-indicator { 
        position: absolute; 
        right: 10px; 
        top: 50%; 
        transform: translateY(-50%); 
        color: var(--primary); 
    }
    .filter-btn.active { 
        background-color: var(--primary); 
        color: white; 
        border-color: var(--primary); 
    }
    .ai-analysis-card { 
        background-color: #eef7ff; 
        border-left: 4px solid var(--primary); 
        padding: 1rem; 
        border-radius: 4px; 
        margin-top: 1rem; 
        font-style: italic; 
        color: #333; 
        white-space: pre-wrap; 
    }
    .ai-analysis-card h4 {
        color: var(--primary);
        margin-bottom: 0.5rem;
        font-style: normal;
    }
    .dark-mode .ai-analysis-card { 
        background-color: #1a2f3f; 
        color: #e0e0e0; 
    }
    @media (max-width: 768px) { 
        .compare-grid { 
            grid-template-columns: 1fr; 
        } 
        .suggestions-dropdown { 
            position: fixed; 
            left: 1rem; 
            right: 1rem; 
            top: auto; 
        } 
    }
`;
document.head.appendChild(style);
