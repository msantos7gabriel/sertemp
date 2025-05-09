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

function deleteOldData(local) {
    console.log("Checking for old data to clean up...");
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 8);
    
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
    console.log(`Deleting data older than: ${cutoffDateStr}`);
    
    const historicoRef = ref(db, `${local}/historico`);
    
    get(historicoRef).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((dateSnapshot) => {
                const dateKey = dateSnapshot.key;
                
                if (dateKey < cutoffDateStr) {
                    console.log(`Deleting old data from: ${dateKey}`);
                    
                    remove(ref(db, `${local}/historico/${dateKey}`))
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

function getData(local){
    const lastCleanup = localStorage.getItem('lastDataCleanup');
    const today = new Date().toISOString().split('T')[0];
    
    if (!lastCleanup || lastCleanup !== today) {
        deleteOldData(local);
        localStorage.setItem('lastDataCleanup', today);
    }

    get(child(dbRef, local)).then((snapshot) => {
        if (snapshot.exists()) {
            const localization = snapshot.val();
            console.log(`${local}`, localization);
            document.getElementById(`${local}-pressure`).innerText = localization.SealevelPressure + " Pa";
            document.getElementById(`${local}-altitude`).innerText = localization.Altitude + " m";
            document.getElementById(`${local}-temp`).innerText = localization.Temperature + " C°";
            document.getElementById(`${local}-humidity`).innerText = localization.Humidity + " %";
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error("Error getting data: ", error);
    });
}

function createTemperatureChart(local, times, temperatures, humidities, pressures) {
    // Store chart instances by location to prevent conflicts
    if (!window.chartInstances) {
        window.chartInstances = {};
    }
    
    if (!window.chartInstances[local]) {
        window.chartInstances[local] = {};
    }
    
    // Destroy existing charts for this location if they exist
    if (window.chartInstances[local].temperature) {
        window.chartInstances[local].temperature.destroy();
    }
    
    if (window.chartInstances[local].humidity) {
        window.chartInstances[local].humidity.destroy();
    }
    
    if (window.chartInstances[local].pressure) {
        window.chartInstances[local].pressure.destroy();
    }

    // Create the temperature chart
    const ctempElement = document.getElementById(`${local}-temperatureChart`);
    if (ctempElement) {
        window.chartInstances[local].temperature = new Chart(ctempElement, {
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
    } else {
        console.error(`Temperature chart element for ${local} not found`);
    }

    // Create the humidity chart
    const chumElement = document.getElementById(`${local}-humidityChart`);
    if (chumElement) {
        window.chartInstances[local].humidity = new Chart(chumElement, {
            type: 'line',
            data: {
                labels: times,
                datasets: [{
                    label: 'Umidade (%)',
                    data: humidities,
                    borderColor: 'rgb(65, 105, 225)',
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
    } else {
        console.error(`Humidity chart element for ${local} not found`);
    }

    // Create the pressure chart (if pressures data exists)
    if (pressures && pressures.length > 0) {
        const cpresElement = document.getElementById(`${local}-pressureChart`);
        if (cpresElement) {
            window.chartInstances[local].pressure = new Chart(cpresElement, {
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
                            beginAtZero: false,                                     
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
        } else {
            console.error(`Pressure chart element for ${local} not found`);
        }
    } else {
        console.log(`No pressure data available for ${local}`);
    }
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
            
            createTemperatureChart(local, times, temperatures, humidities, pressures);
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
        
        // Update charts for all locations
        const locals = ["ceraima", "alvorada", "mutas", "ipanema"];
        for (const local of locals) {
            getHistoricalData(local, selectedDate);
        }
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

const locals = ["ceraima", "mutas", "feijao"];

for (const local of locals) {
    getHistoricalData(local, today);
    getData(local);
}

window.displayDataForDate = displayDataForDate;
