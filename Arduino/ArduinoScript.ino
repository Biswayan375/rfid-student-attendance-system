/* Response Codes (Application Specific defined in serverside)
 *    800 -> Success (Green)
 *    810 -> Unsuccessful (Red)
 *    
 *    Red LED is turned on for unregistered cards and green LED for registered cards
 */
#include<ESP8266WiFi.h>
#include<ESP8266HTTPClient.h>
#include<WiFiClient.h>
#include <SPI.h>
#include <MFRC522.h>

#define ssid "Redmi" // WiFi SSID
#define password "amake jigges korbina" // WiFi Password
#define blueLedPin LED_BUILTIN // Blue LED pin
#define greenLedPin 3
#define redLedPin 1

constexpr uint8_t RST_PIN = D3;
constexpr uint8_t SS_PIN = D4;

MFRC522 mfrc522(SS_PIN, RST_PIN);
MFRC522::MIFARE_Key key;

String tag;

WiFiClient wifiClient;
const int port = 5000;


void setup() {
  pinMode(blueLedPin, OUTPUT);
  
  Serial.begin(9600);
  SPI.begin(); // Init SPI bus
  mfrc522.PCD_Init(); // Init MFRC522
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  pinMode(2, OUTPUT);

  pinMode(greenLedPin, OUTPUT);
  pinMode(redLedPin, OUTPUT);
  
  Serial.print("connecting");
  while (1) {
    /* An infinite wait till the device is connected to some WiFi because without
     * internet it does not work
     * The blue built-in LED is blinked for indication of that the device is trying
     * to connect to the WiFi
     */
    digitalWrite(blueLedPin, HIGH);
    delay(250);
    digitalWrite(blueLedPin, LOW);
    delay(250);
    Serial.print(".");
    if (WiFi.status() == WL_CONNECTED) {
      digitalWrite(blueLedPin, HIGH);
      Serial.println();
      Serial.print("connected to: ");
      Serial.println(ssid);
      Serial.print("IP Address: ");
      Serial.println(WiFi.localIP());
      break;
    }
  }
  /*if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(2, HIGH);
    Serial.println();
    Serial.print("connected to: ");
    Serial.println(ssid);
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else Serial.println("could not connect to network, make sure your SSID and password is correct!");*/
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(blueLedPin, HIGH);
    HTTPClient http;

    // Look for new cards
    if ( ! mfrc522.PICC_IsNewCardPresent()) 
    {
      return;
    }
    // Select one of the cards
    if ( ! mfrc522.PICC_ReadCardSerial()) 
    {
      return;
    }
    
    String content= "";
    byte letter;
    // Getting the Card content/UID
    for (byte i = 0; i < mfrc522.uid.size; i++) 
    {
       content.concat(String(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " "));
       content.concat(String(mfrc522.uid.uidByte[i], HEX));
    }
    content.toUpperCase();
    mfrc522.PICC_HaltA();

    content.replace(" ", "");

    // Sending the card UID to the server with HTTP request
    http.begin(wifiClient, "http://192.168.43.9:5000/attend?uid=" + content);
    int responseCode = http.GET();
    Serial.println(responseCode);
    //Serial.println(http.getString());
    if (responseCode > 0) {
      String payload = http.getString();
      //Serial.println("server has responded with: ");
      Serial.println(responseCode);
      Serial.print("payload: ");
      Serial.println(payload);
      if (responseCode == 800) {
        digitalWrite(greenLedPin, HIGH);
        delay(500);
        digitalWrite(greenLedPin, LOW);
      } else if (responseCode == 810) {
        digitalWrite(redLedPin, HIGH);
        delay(500);
        digitalWrite(redLedPin, LOW);  
      }
    } else {
      Serial.println("server offline");
      digitalWrite(redLedPin, HIGH);
      delay(500);
      digitalWrite(redLedPin, LOW);
    }
    http.end();
  } else {
    // Blinking the blue built in LED when the device gets disconnected from WiFi
    digitalWrite(blueLedPin, LOW);
    delay(500);
    digitalWrite(blueLedPin, HIGH);
    delay(500);
  }
}
