#include <WiFi.h>
#include <Firebase_ESP_Client.h>

#define WIFI_SSID "Prosperidade"
#define WIFI_PASSWORD "agente12"
#define FIREBASE_HOST "tempo-beijaflor-default-rtdb.firebaseio.com" // SEM https://
#define FIREBASE_API_KEY "AIzaSyCjcZwMu1ZTrBKuGbqNEWGl029r-RHKEQc" // Mesmo que esteja correta!

FirebaseData fbdo;
FirebaseConfig config;

void setup() {
  Serial.begin(115200);
  
  // 1. Conexão WiFi sem firulas
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println("Conectando WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConectado! IP: " + WiFi.localIP().toString());

  // 2. Configuração FIREBASE SEM autenticação
  config.database_url = "http://" + String(FIREBASE_HOST);
  config.api_key = FIREBASE_API_KEY;

  // 3. Força conexão sem callbacks
  Firebase.begin(&config, nullptr);
  delay(2000); // Delay crítico!

  // 4. Teste BRUTO de escrita
  if (Firebase.RTDB.setInt(&fbdo, "/teste_conexao", 123)) {
    Serial.println("✅ Escrita no Firebase OK!");
  } else {
    Serial.println("❌ FALHA GRAVE: " + fbdo.errorReason());
    Serial.println("Código de erro: " + String(fbdo.httpCode()));
  }
}

void loop() {}