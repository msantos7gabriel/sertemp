import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getDatabase, ref, set, child, get, update, remove, onValue } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

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

function getData(){
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

getData();