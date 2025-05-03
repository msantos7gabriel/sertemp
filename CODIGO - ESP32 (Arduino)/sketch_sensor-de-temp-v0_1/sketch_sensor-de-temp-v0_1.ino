#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
// #include <Adafruit_BMP085.h>

// Adafruit_BMP085 bmp;
DHT dht(2, DHT11);

#define WIFI_SSID "Vitor Repetidor "
#define WIFI_PASSWORD "cimentos"

#define FIREBASE_HOST "https://sertemp-651ae-default-rtdb.firebaseio.com/" 
#define FIREBASE_API_KEY "AIzaSyAHZos40wQIftXTDs-1_yFKNhCpnGtTwIA" 

#define USER_EMAIL "admin@gmail.com"
#define USER_PASS "admin1977"

FirebaseData fbdo;

FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;

void setup() {
  Serial.begin(115200);

  // if (!bmp.begin()){
  //   Serial.println("Could not find BMP180. Check wiring!");
  //   delay(100);
  // }

  dht.begin();

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println("Conectando WiFi...");

  while (WiFi.status() != WL_CONNECTED) {
    Serial.print("Status: ");
    Serial.println(WiFi.status());
    Serial.print("Target: ");
    Serial.println(WL_CONNECTED);
    delay(500);
  }
  Serial.println("\nConectado! IP: " + WiFi.localIP().toString());

  config.database_url = "https://" + String(FIREBASE_HOST);
  config.api_key = FIREBASE_API_KEY;

  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASS;

  config.database_url = FIREBASE_HOST;

  Firebase.reconnectNetwork(true);

  Firebase.begin(&config, &auth);

  Firebase.setDoubleDigits(5);

  config.timeout.serverResponse = 10 * 1000;

}

void loop() {
  // Serial.print("Altitude: ");
  // Serial.println(bmp.readAltitude());
  // Serial.print("Pressão: ");
  // Serial.println(bmp.readSealevelPressure());
  if (Firebase.ready() && (millis() - sendDataPrevMillis > 1000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();
    // long int altitude = bmp.readAltitude();
    // long int pressure = bmp.readSealevelPressure();
    float temp = dht.readTemperature();
    float humidity = dht.readHumidity();

    // if (Firebase.RTDB.setInt(&fbdo, "ceraima/Altitude", altitude)){
    //   Serial.print("ALtitude: ");
    //   Serial.println(altitude);
    // } else {
    //   Serial.println(fbdo.errorReason().c_str());
    // }

    // if (Firebase.RTDB.setInt(&fbdo, "ceraima/SealevelPressure", pressure)){
    //   Serial.print("Pressure: ");
    //   Serial.println(pressure);
    // } else {
    //   Serial.println(fbdo.errorReason().c_str());
    // }

    if (Firebase.RTDB.setInt(&fbdo, "ceraima/Temperature", temp)){
      Serial.print("Teperature: ");
      Serial.println(temp);
    } else {
      Serial.println(fbdo.errorReason().c_str());
    }

    if (Firebase.RTDB.setInt(&fbdo, "ceraima/Humidity", humidity)){
      Serial.print("Humidity: ");
      Serial.println(humidity);
    } else {
      Serial.println(fbdo.errorReason().c_str());
    }

  } else {
    Serial.println(".");
  }
  delay(1000);
}