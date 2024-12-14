document.addEventListener('DOMContentLoaded', () => {
    // Загрузка мероприятий
    loadEvents();

    // Обновляем погоду
    updateWeather();

    // Обновляем время каждую секунду
    setInterval(updateTime, 1000);
    updateTime();

    // Фильтры событий
    document.getElementById('filter-date').addEventListener('change', applyFilters);
    document.getElementById('filter-type').addEventListener('change', applyFilters);

    // Переключение языка
    const langSelect = document.getElementById('lang-select');
    langSelect.addEventListener('change', () => {
        changeLanguage(langSelect.value);
    });

    // Устанавливаем язык по умолчанию (ru)
    changeLanguage('ru');
});

let myMap;
let allEvents = [];
let placemarks = [];
let currentLanguage = 'ru';

function loadEvents() {
    fetch('events.json')
        .then(response => response.json())
        .then(data => {
            allEvents = data;
            initMap();
            displayEvents(allEvents);
            setTimeout(() => {
              addMapMarkers(allEvents);
            }, 1000);
        })
        .catch(err => console.error('Ошибка загрузки событий:', err));
}

function initMap() {
    ymaps.ready(function() {
        myMap = new ymaps.Map("map-container", {
            center: [51.169392, 71.449074],
            zoom: 12
        });
    });
}

function addMapMarkers(events) {
    if (placemarks.length > 0) {
        placemarks.forEach(pm => myMap.geoObjects.remove(pm));
        placemarks = [];
    }

    events.forEach(ev => {
        let dateObj = new Date(ev.date);
        let dateStr = dateObj.toLocaleString(currentLanguage === 'ru' ? 'ru-RU' : (currentLanguage === 'kk' ? 'kk-KZ' : 'en-US'), {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit'
        });
        let placemark = new ymaps.Placemark([ev.lat, ev.lng], {
            hintContent: ev.title,
            balloonContent: `<strong>${ev.title}</strong><br>${ev.location}<br>${dateStr}<br>Тип: ${ev.type}`
        });
        placemarks.push(placemark);
        myMap.geoObjects.add(placemark);
    });
}

function displayEvents(events) {
    const eventList = document.querySelector('.event-list');
    eventList.innerHTML = '';
    events.forEach(ev => {
        let dateObj = new Date(ev.date);
        let dateStr = dateObj.toLocaleString(currentLanguage === 'ru' ? 'ru-RU' : (currentLanguage === 'kk' ? 'kk-KZ' : 'en-US'), {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit'
        });

        let li = document.createElement('li');
        li.innerHTML = `
            <h3>${ev.title}</h3>
            <p>${getTranslatedLabel("date")}: ${dateStr}</p>
            <p>${getTranslatedLabel("address")}: ${ev.location}</p>
            <p>${getTranslatedLabel("event_type")}: ${ev.type}</p>
        `;
        eventList.appendChild(li);
    });
}

// Простая функция для получения переведенных слов, которые не вынесены в translations.js
function getTranslatedLabel(key) {
    const dict = {
        "date": {
            "ru": "Дата",
            "en": "Date",
            "kk": "Күні"
        },
        "address": {
            "ru": "Адрес",
            "en": "Address",
            "kk": "Мекенжай"
        },
        "event_type": {
            "ru": "Тип мероприятия",
            "en": "Event type",
            "kk": "Іс-шара түрі"
        }
    };
    return dict[key][currentLanguage];
}

function applyFilters() {
    const selectedDate = document.getElementById('filter-date').value;
    const selectedType = document.getElementById('filter-type').value;

    let filteredEvents = allEvents.filter(ev => {
        let pass = true;
        if (selectedDate) {
            let evDate = new Date(ev.date);
            let filterDate = new Date(selectedDate);
            pass = pass && (evDate.toDateString() === filterDate.toDateString());
        }
        if (selectedType) {
            pass = pass && (ev.type === selectedType);
        }
        return pass;
    });

    displayEvents(filteredEvents);
    addMapMarkers(filteredEvents);
}

function updateWeather() {
    const apiKey = '649d502c84c9d70785ce7ec263adabbb'; 
    const cityId = '1526273'; // ID Астаны в OpenWeatherMap
    fetch(`https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${apiKey}&units=metric&lang=${currentLanguage === 'ru' ? 'ru' : (currentLanguage === 'kk' ? 'en' : 'en')}`)
      .then(response => response.json())
      .then(data => {
        // Если выбран казахский язык, OpenWeatherMap не поддерживает kk-KZ, используем en.
        let tempLabel = currentLanguage === 'ru' ? 'Температура' : (currentLanguage === 'en' ? 'Temperature' : 'Температура');
        let condLabel = currentLanguage === 'ru' ? 'Условия' : (currentLanguage === 'en' ? 'Conditions' : 'Жағдайлар');

        document.getElementById('temperature').textContent = `${tempLabel}: ${data.main.temp} °C`;
        document.getElementById('conditions').textContent = `${condLabel}: ${data.weather[0].description}`;
      })
      .catch(error => console.error('Ошибка при получении погоды:', error));
}

function updateTime() {
    let now = new Date();
    document.getElementById('local-time').textContent = now.toLocaleTimeString(currentLanguage === 'ru' ? 'ru-RU' : (currentLanguage === 'kk' ? 'kk-KZ' : 'en-US'), {timeZone: 'Asia/Almaty'});
}

function changeLanguage(lang) {
    currentLanguage = lang;
    // Применяем переводы к элементам
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key] && translations[key][lang]) {
            el.textContent = translations[key][lang];
        }
    });

    // Обновляем динамические данные
    displayEvents(allEvents);
    addMapMarkers(allEvents);
    updateWeather();
    updateTime();
}

function displayEvents(events) {
    const eventList = document.querySelector('.event-list');
    eventList.innerHTML = '';
    events.forEach(ev => {
        let dateObj = new Date(ev.date);
        let dateStr = dateObj.toLocaleString(currentLanguage === 'ru' ? 'ru-RU' : (currentLanguage === 'kk' ? 'kk-KZ' : 'en-US'), {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit'
        });

        let li = document.createElement('li');
        li.innerHTML = `
            <h3>${ev.title}</h3>
            <p>${getTranslatedLabel("date")}: ${dateStr}</p>
            <p>${getTranslatedLabel("address")}: ${ev.location}</p>
            <p>${getTranslatedLabel("event_type")}: ${ev.type}</p>
            <a href="details.html?id=${ev.id}" class="details-button" data-i18n="more_details">Подробнее</a>
        `;
        eventList.appendChild(li);
    });
}