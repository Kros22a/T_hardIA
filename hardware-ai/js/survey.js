// Funciones para la encuesta

// Preguntas de la encuesta
const surveyQuestions = [
    {
        id: 1,
        question: "¿Qué tipo de hardware te interesa más?",
        options: ["CPU", "GPU", "RAM", "SSD", "Placas base"]
    },
    {
        id: 2,
        question: "¿Cuál es tu presupuesto máximo para una compra de hardware?",
        options: ["Menos de $200", "$200 - $500", "$500 - $1000", "Más de $1000"]
    },
    {
        id: 3,
        question: "¿Con qué frecuencia actualizas tu hardware?",
        options: ["Cada año", "Cada 2-3 años", "Cada 4-5 años", "Solo cuando es necesario"]
    },
    {
        id: 4,
        question: "¿Qué marca prefieres para CPUs?",
        options: ["Intel", "AMD", "Ambas por igual", "Otra"]
    },
    {
        id: 5,
        question: "¿Qué importancia tiene el consumo energético al elegir hardware?",
        options: ["Muy importante", "Importante", "Poco importante", "Nada importante"]
    },
    {
        id: 6,
        question: "¿Qué sistema operativo usas principalmente?",
        options: ["Windows", "Linux", "macOS", "Otros"]
    },
    {
        id: 7,
        question: "¿Qué tipo de uso le das a tu computadora?",
        options: ["Oficina/Básico", "Gaming", "Diseño/Edición", "Programación/Desarrollo"]
    },
    {
        id: 8,
        question: "¿Qué tan importante es la compatibilidad con software específico?",
        options: ["Muy importante", "Importante", "Poco importante", "Nada importante"]
    },
    {
        id: 9,
        question: "¿Prefieres hardware nuevo o de segunda mano?",
        options: ["Siempre nuevo", "Nuevo la mayoría del tiempo", "Mezcla de ambos", "Prefiero segunda mano"]
    },
    {
        id: 10,
        question: "¿Qué tan importante es la garantía al comprar hardware?",
        options: ["Muy importante", "Importante", "Poco importante", "Nada importante"]
    },
    {
        id: 11,
        question: "¿Qué tipo de almacenamiento prefieres?",
        options: ["Solo SSD", "Solo HDD", "Combinación SSD+HDD", "Depende del uso"]
    },
    {
        id: 12,
        question: "¿Qué tan importante es el overclocking para ti?",
        options: ["Muy importante", "Importante", "Poco importante", "Nada importante"]
    },
    {
        id: 13,
        question: "¿Qué marca prefieres para GPUs?",
        options: ["NVIDIA", "AMD", "Ambas por igual", "Otra"]
    },
    {
        id: 14,
        question: "¿Qué tan importante es el factor de forma (tamaño) del hardware?",
        options: ["Muy importante", "Importante", "Poco importante", "Nada importante"]
    },
    {
        id: 15,
        question: "¿Qué tan importante es la refrigeración al elegir componentes?",
        options: ["Muy importante", "Importante", "Poco importante", "Nada importante"]
    }
];

// Obtener preguntas aleatorias
function getRandomQuestions(count = 5) {
    const shuffled = [...surveyQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Generar HTML para las preguntas
function generateSurveyHTML(questions) {
    return questions.map((q, index) => `
        <div class="survey-question">
            <div class="question-text">${index + 1}. ${q.question}</div>
            <div class="survey-options">
                ${q.options.map((option, optIndex) => `
                    <label class="survey-option">
                        <input type="radio" name="q${q.id}" value="${option}" required>
                        ${option}
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Procesar respuestas de la encuesta
function processSurveyResponses(formData) {
    const responses = {};
    for (let [key, value] of formData.entries()) {
        responses[key] = value;
    }
    return responses;
}

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        surveyQuestions,
        getRandomQuestions,
        generateSurveyHTML,
        processSurveyResponses
    };
}
