#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* WIFI_SSID = "YOUR_WIFI";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";
const char* COMPANION_URL = "https://wise2.net/api/k10/nq";

String lastSide = "WAIT";

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
  }
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(COMPANION_URL);
    int code = http.GET();
    if (code == 200) {
      DynamicJsonDocument doc(1024);
      deserializeJson(doc, http.getString());
      const char* side = doc["side"] | "WAIT";
      const char* symbol = doc["symbol"] | "NQ";
      double price = doc["price"] | 0.0;
      double ema13 = doc["ema13"] | 0.0;
      double ema48 = doc["ema48"] | 0.0;
      double ema60 = doc["ema60"] | 0.0;
      Serial.printf("LIVE %s %s %.2f EMA %.2f/%.2f/%.2f\n", symbol, side, price, ema13, ema48, ema60);
      if (lastSide != side) {
        lastSide = side;
        Serial.printf("AUDIO %s\n", side);
      }
    }
    http.end();
  }
  delay(2000);
}
