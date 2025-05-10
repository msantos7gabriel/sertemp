#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <time.h>
#include <Adafruit_BMP085.h>

#define WIFI_SSID "Vitor Repetidor "
#define WIFI_PASSWORD "cimentos"
#define FIREBASE_HOST "https://sertemp-651ae-default-rtdb.firebaseio.com/" 
#define FIREBASE_API_KEY "AIzaSyAHZos40wQIftXTDs-1_yFKNhCpnGtTwIA" 
#define USER_EMAIL "admin@gmail.com"
#define USER_PASS "admin1977"

DHT dht(4, DHT11);
Adafruit_BMP085 bmp;

const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = -3 * 3600;
const int daylightOffset_sec = 0;

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;

void setup() {
  Serial.begin(115200);
  dht.begin();
  bmp.begin();

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println("Conectando WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConectado! IP: " + WiFi.localIP().toString());

  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  
  config.database_url = FIREBASE_HOST;
  config.api_key = FIREBASE_API_KEY;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASS;
  
  Firebase.reconnectNetwork(true);
  Firebase.begin(&config, &auth);
  Firebase.setDoubleDigits(5);
  config.timeout.serverResponse = 10 * 1000;
}

void loop() {
  if (Firebase.ready() && (millis() - sendDataPrevMillis > 60000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();
    
    float temp = dht.readTemperature();
    float humidity = dht.readHumidity();
    const int altitude = bmp.readAltitude();
    const int pressure = bmp.readSealevelPressure();
    
    if (isnan(temp) || isnan(humidity)) {
      Serial.println("Falha na leitura do sensor DHT!");
      return;
    }
    
    struct tm timeinfo;
    if(!getLocalTime(&timeinfo)){
      Serial.println("Falha ao obter o horário");
      return;
    }
    
    char dateTime[30];
    strftime(dateTime, sizeof(dateTime), "%Y-%m-%d_%H:%M:%S", &timeinfo);
    
    char dateOnly[15];
    strftime(dateOnly, sizeof(dateOnly), "%Y-%m-%d", &timeinfo);
    
    char timeOnly[10];
    strftime(timeOnly, sizeof(timeOnly), "%H", &timeinfo);
    
    Serial.print("Data e hora: ");
    Serial.println(dateTime);
    
    FirebaseJson json;
    json.set("temperature", temp);
    json.set("humidity", humidity);
    json.set("timestamp", dateTime);
    json.set("pressure", pressure);
    
    String path = "ceraima/historico/" + String(dateOnly) + "/" + String(timeOnly);
    
    if (Firebase.RTDB.setJSON(&fbdo, path.c_str(), &json)) {
      Serial.println("Dados gravados com sucesso em: " + path);
    } else {
      Serial.println("ERRO: " + fbdo.errorReason());
    }
    
    Firebase.RTDB.setFloat(&fbdo, "ceraima/Temperature", temp);
    Firebase.RTDB.setFloat(&fbdo, "ceraima/Humidity", humidity);
    Firebase.RTDB.setString(&fbdo, "ceraima/lastUpdate", dateTime);
    Firebase.RTDB.setString(&fbdo, "ceraima/Altitude", altitude);
    Firebase.RTDB.setString(&fbdo, "ceraima/SealevelPressure", pressure);

    Serial.println("Temperatura: " + String(temp) + "°C");
    Serial.println("Umidade: " + String(humidity) + "%");
  }

  const int sec = 1000;
  const int min = 60 * sec;
  const int hour = 60 * min;
  const int delay_in_sec = hour;
  
  delay(delay_in_sec);
}