import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getDatabase, ref, child, get, remove } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAHZos40wQIftXTDs-1_yFKNhCpnGtTwIA",
    authDomain: "sertemp-651ae.firebaseapp.com",
    databaseURL: "https://sertemp-651ae-default-rtdb.firebaseio.com",
    projectId: "sertemp-651ae",
    storageBucket: "sertemp-651ae.firebasestorage.app",
    messagingSenderId: "420762965234",
    appId: "1:420762965234:web:1604be664a3ad8118d2c6b",
    measurementId: "G-ZKXDCM6HY1"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db);

function deleteOldData() {
    console.log("Checking for old data to clean up...");
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 8);
    
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
    console.log(`Deleting data older than: ${cutoffDateStr}`);
    
    const historicoRef = ref(db, 'ceraima/historico');
    
    get(historicoRef).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((dateSnapshot) => {
                const dateKey = dateSnapshot.key;
                
                if (dateKey < cutoffDateStr) {
                    console.log(`Deleting old data from: ${dateKey}`);
                    
                    remove(ref(db, `ceraima/historico/${dateKey}`))
                        .then(() => {
                            console.log(`Successfully deleted data for ${dateKey}`);
                        })
                        .catch((error) => {
                            console.error(`Error deleting data for ${dateKey}:`, error);
                        });
                }
            });
        }
    }).catch((error) => {
        console.error("Error checking for old data:", error);
    });
}

function getData(){
    const lastCleanup = localStorage.getItem('lastDataCleanup');
    const today = new Date().toISOString().split('T')[0];
    
    if (!lastCleanup || lastCleanup !== today) {
        deleteOldData();
        localStorage.setItem('lastDataCleanup', today);
    }

    get(child(dbRef, 'ceraima')).then((snapshot) => {
        if (snapshot.exists()) {
            const ceraima = snapshot.val();
            console.log("Ceraima: ", ceraima);
            document.getElementById("ceraima-pressure").innerText = ceraima.SealevelPressure + " Pa";
            document.getElementById("ceraima-altitude").innerText = ceraima.Altitude + " m";
            document.getElementById("ceraima-temp").innerText = ceraima.Temperature + " C°";
            document.getElementById("ceraima-humidity").innerText = ceraima.Humidity + " %";
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error("Error getting data: ", error);
    });
}

function createTemperatureChart(times, temperatures, humidities, pressures) {
    const ctemp = document.getElementById('ceraima-temperatureChart');
    
    if (window.temperatureChartInstance) {
        window.temperatureChartInstance.destroy();
    }
    if (window.humidityChartInstance) {
        window.humidityChartInstance.destroy();
    }
    if (window.pressureChartInstance) {
        window.pressureChartInstance.destroy();
    }
            
    window.temperatureChartInstance = new Chart(ctemp, {
    type: 'line',
    data: {
        labels: times,
        datasets: [{
            label: 'Temperatura (°C)',
            data: temperatures,
            borderColor: 'rgb(218, 34, 34)',
            borderWidth: 1,
            tension: 0.4
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    min: 10,
                    suggestedMax: 45,  
                    title: {
                        display: true,
                        text: '(°C)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Horário'
                    }
                }
            },
            responsive: true
        }
    });

    const chum = document.getElementById('ceraima-humidityChart');
    window.humidityChartInstance = new Chart(chum, {
        type: 'line',
        data: {
            labels: times,
            datasets: [{
                label: 'Umidade (%)',
                data: humidities,
                borderWidth: 1,
                tension: 0.4
                }]
            },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    min: 30,
                    suggestedMax: 70,                                       
                    title: {
                        display: true,
                        text: '(%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Horário'
                    }
                }
            },
            responsive: true
        }
    });

    const cpres = document.getElementById('ceraima-pressureChart');
    window.humidityChartInstance = new Chart(cpres, {
        type: 'line',
        data: {
            labels: times,
            datasets: [{
                label: 'Pressão (Pa)',
                data: pressures,
                borderWidth: 1,
                borderColor: 'rgb(150, 90, 230)',
                tension: 0.4
                }]
            },
        options: {
            scales: {
                y: {
                    beginAtZero: true,                                     
                    title: {
                        display: true,
                        text: '(Pa)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Horário'
                    }
                }
            },
            responsive: true
        }
    });
}

function getHistoricalData(local, date) {
    const historyRef = ref(db, `${local}/historico/${date}`);
    
    get(historyRef).then((snapshot) => {
        if (snapshot.exists()) {
            const times = [];
            const temperatures = [];
            const humidities = [];
            const pressures = [];
            
            snapshot.forEach((childSnapshot) => {
                const timeKey = childSnapshot.key + ":00";
                const data = childSnapshot.val();
                
                times.push(timeKey);
                temperatures.push(data.temperature);
                humidities.push(data.humidity);
                pressures.push(data.pressure);
            });
            
            createTemperatureChart(times, temperatures, humidities, pressures);
        } else {
            console.log("No historical data available for this date");
        }
    }).catch((error) => {
        console.error("Error getting historical data: ", error);
    });
}

// Function to get today's date in GMT-3 (regardless of server timezone)
function getTodayInBrazilTimezone() {
    const now = new Date();
    // Create a date string that forces interpretation in GMT-3
    // First get the UTC time in milliseconds
    const utcMillis = now.getTime() + (now.getTimezoneOffset() * 60000);
    // Then adjust to GMT-3 (subtract 3 hours in milliseconds)
    const brazilTime = new Date(utcMillis - (3 * 60 * 60 * 1000));
    console.log("Brazil time: ", brazilTime);
    return brazilTime.toISOString().split('T')[0];
}

function displayDataForDate() {
    const dateSelector = document.getElementById('dateSelector');
    const selectedDate = dateSelector.value;
    
    if (selectedDate) {
        updateDateDisplay(selectedDate);
        
        getHistoricalData("ceraima", selectedDate);
    } else {
        console.log("No date selected");
        alert("Por favor, selecione uma data");
    }
}

function updateDateDisplay(dateString) {
    const todayElement = document.getElementById('today');
    if (todayElement) {
        // Parse the date and ensure it's displayed in Brazil's timezone format
        const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
        
        // Create date explicitly with year, month, day in local time
        const date = new Date(year, month - 1, day);
        
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Sao_Paulo' };
        const formattedDate = date.toLocaleDateString('pt-BR', options);
        
        todayElement.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    }
}

// Replace the simple today definition with our timezone-aware function
let today = getTodayInBrazilTimezone();

window.addEventListener('DOMContentLoaded', () => {
    const dateSelector = document.getElementById('dateSelector');
    if (dateSelector) {
        dateSelector.value = today;
        dateSelector.max = today;
    }
    
    updateDateDisplay(today);
});

getHistoricalData("ceraima", today);
getData();

window.displayDataForDate = displayDataForDate;
