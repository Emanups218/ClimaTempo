const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const weatherCard = document.getElementById('weather-card');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const body = document.body;
const cloudsContainer = document.getElementById('clouds-container');

// Dicionário de Códigos Climáticos da WMO para Português, Ícones e Classes CSS
const weatherCodes = {
    0: { desc: "Céu limpo", icon: "☀️", bgClass: "bg-clear" },
    1: { desc: "Principalmente limpo", icon: "🌤️", bgClass: "bg-clear" },
    2: { desc: "Parcialmente nublado", icon: "⛅", bgClass: "bg-cloudy" },
    3: { desc: "Nublado", icon: "☁️", bgClass: "bg-cloudy" },
    45: { desc: "Nevoeiro", icon: "🌫️", bgClass: "bg-cloudy" },
    48: { desc: "Nevoeiro com geada", icon: "🌫️", bgClass: "bg-cloudy" },
    51: { desc: "Chuvisco leve", icon: "🌦️", bgClass: "bg-rain" },
    53: { desc: "Chuvisco moderado", icon: "🌧️", bgClass: "bg-rain" },
    55: { desc: "Chuvisco forte", icon: "🌧️", bgClass: "bg-rain" },
    61: { desc: "Chuva leve", icon: "🌦️", bgClass: "bg-rain" },
    63: { desc: "Chuva moderada", icon: "🌧️", bgClass: "bg-rain" },
    65: { desc: "Chuva forte", icon: "🌧️", bgClass: "bg-rain" },
    71: { desc: "Neve leve", icon: "🌨️", bgClass: "bg-snow" },
    73: { desc: "Neve moderada", icon: "❄️", bgClass: "bg-snow" },
    75: { desc: "Neve forte", icon: "❄️", bgClass: "bg-snow" },
    80: { desc: "Pancadas de chuva", icon: "🌦️", bgClass: "bg-rain" },
    95: { desc: "Tempestade", icon: "⛈️", bgClass: "bg-storm" }
};

// Eventos de Busca
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

async function handleSearch() {
    const city = cityInput.value.trim();
    
    // Impedir busca vazia
    if (!city) {
        alert("Por favor, digite o nome de uma cidade.");
        return;
    }

    // Resetar UI
    weatherCard.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        // 1. Buscar Coordenadas da Cidade (Geocoding API)
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("Cidade não encontrada");
        }

        const location = geoData.results[0];
        const { latitude, longitude, name, admin1, country } = location;

        // 2. Buscar Dados Climáticos (Weather API)
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`);
        const weatherData = await weatherRes.json();
        
        const current = weatherData.current;
        
        // 3. Atualizar Interface
        updateUI(name, admin1, country, current);

    } catch (error) {
        errorMessage.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
}

function updateUI(city, state, country, data) {
    // Definir textos
    const region = state ? `${city}, ${state}` : city;
    document.getElementById('location-name').textContent = region;
    document.getElementById('country-name').textContent = country || "Localização Global";
    
    document.getElementById('temperature').textContent = `${Math.round(data.temperature_2m)}°C`;
    document.getElementById('feels-like').textContent = `${Math.round(data.apparent_temperature)}°C`;
    document.getElementById('humidity').textContent = `${data.relative_humidity_2m}%`;
    document.getElementById('wind-speed').textContent = `${data.wind_speed_10m} km/h`;

    // Descobrir condição atual baseado no código WMO
    const conditionCode = data.weather_code;
    const condition = weatherCodes[conditionCode] || { desc: "Desconhecido", icon: "🌍", bgClass: "bg-default" };

    document.getElementById('weather-description').textContent = condition.desc;
    document.getElementById('weather-icon').textContent = condition.icon;

    // Atualizar Fundo e Nuvens
    body.className = condition.bgClass;
    generateClouds(conditionCode);

    // Mostrar Cartão
    weatherCard.classList.remove('hidden');
}

// Gerador de Nuvens Animadas no Fundo
function generateClouds(weatherCode) {
    cloudsContainer.innerHTML = ''; // Limpar nuvens antigas
    
    // Determinar quantidade de nuvens pelo clima (chuvoso/nublado = mais nuvens)
    let cloudCount = 3; 
    if ([2, 3, 45, 48].includes(weatherCode)) cloudCount = 8;
    if ([51, 53, 55, 61, 63, 65, 80, 95].includes(weatherCode)) cloudCount = 12;

    for (let i = 0; i < cloudCount; i++) {
        const cloud = document.createElement('div');
        cloud.classList.add('cloud');
        
        // Tamanho e posição aleatórios
        const width = Math.random() * 100 + 50; 
        const height = width * 0.4;
        const top = Math.random() * 50; // Concentrar na metade superior
        const duration = Math.random() * 20 + 15; // Velocidade

        cloud.style.width = `${width}px`;
        cloud.style.height = `${height}px`;
        cloud.style.top = `${top}%`;
        cloud.style.animationDuration = `${duration}s`;
        cloud.style.animationDelay = `-${Math.random() * 10}s`;

        cloudsContainer.appendChild(cloud);
    }
}

// Inicializar com algumas nuvens
generateClouds(1);