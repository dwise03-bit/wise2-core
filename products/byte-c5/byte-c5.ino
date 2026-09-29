/*!
 * WISE² BYTE — ESP32-C5 display bring-up and controller probe.
 *
 * Uses LovyanGFX, not TFT_eSPI: the C5 is RISC-V silicon and TFT_eSPI 2.5.43
 * still targets ESP32-classic SPI registers (VSPI, SPI_MOSI_DLEN_REG), which
 * do not exist here. LovyanGFX carries a CONFIG_IDF_TARGET_ESP32C5 path.
 *
 * The panel's controller is genuinely unknown. PROJECT_INVENTORY claims
 * "480x320 (ILI9488 or ST7789)" while the old firmware configured ILI9341 —
 * a 240x320 part. Those cannot all be true, so this ASKS the panel:
 *   0xD3 RDID4  -> ILI-family ID  (…93 41 = ILI9341, …94 88 = ILI9488)
 *   0x04 RDDID  -> manufacturer / version / device
 * MISO is wired on this board (GPIO5), unlike the K10, so read-back works.
 *
 * Then it loops colours forever, so there is no moment to miss.
 *
 * Pins (products/byte-mini-4.0/firmware/main/config/pins.h):
 *   CS 0  RST 1  DC 2  SCK 3  MOSI 4  MISO 5  BL 6
 */
#include <LovyanGFX.hpp>

class LGFX : public lgfx::LGFX_Device {
    lgfx::Panel_ILI9488 _panel;
    lgfx::Bus_SPI       _bus;
    lgfx::Light_PWM     _light;

public:
    LGFX() {
        {   auto cfg = _bus.config();
            cfg.spi_host   = SPI2_HOST;      // the C5's general-purpose SPI
            cfg.spi_mode   = 0;
            cfg.freq_write = 27000000;
            cfg.freq_read  =  8000000;
            cfg.spi_3wire  = false;
            cfg.use_lock   = true;
            cfg.dma_channel = SPI_DMA_CH_AUTO;
            cfg.pin_sclk = 3;
            cfg.pin_mosi = 4;
            cfg.pin_miso = 5;
            cfg.pin_dc   = 2;
            _bus.config(cfg);
            _panel.setBus(&_bus);
        }
        {   auto cfg = _panel.config();
            cfg.pin_cs   = 0;
            cfg.pin_rst  = 1;
            cfg.pin_busy = -1;
            cfg.panel_width  = 320;
            cfg.panel_height = 480;
            cfg.offset_x = 0;
            cfg.offset_y = 0;
            cfg.readable = true;             // MISO wired, so read-back works
            cfg.invert   = false;
            cfg.rgb_order = false;
            cfg.bus_shared = false;
            _panel.config(cfg);
        }
        {   auto cfg = _light.config();
            cfg.pin_bl = 6;                  // plain GPIO here, not an expander
            cfg.invert = false;
            cfg.freq   = 12000;
            cfg.pwm_channel = 0;
            _light.config(cfg);
            _panel.setLight(&_light);
        }
        setPanel(&_panel);
    }
};

LGFX lcd;
static uint32_t cycle = 0;

static void probeId() {
    Serial.println("[PROBE] asking the panel what it is...");
    Serial.flush();

    const uint8_t d1 = lcd.readCommand8(0xD3, 1);
    const uint8_t d2 = lcd.readCommand8(0xD3, 2);
    const uint8_t d3 = lcd.readCommand8(0xD3, 3);
    Serial.printf("[PROBE] RDID4(0xD3): xx %02X %02X %02X\n", d1, d2, d3);

    const uint8_t r0 = lcd.readCommand8(0x04, 0);
    const uint8_t r1 = lcd.readCommand8(0x04, 1);
    const uint8_t r2 = lcd.readCommand8(0x04, 2);
    Serial.printf("[PROBE] RDDID(0x04): %02X %02X %02X\n", r0, r1, r2);

    if      (d2 == 0x93 && d3 == 0x41) Serial.println("[PROBE] => ILI9341 (240x320) - RECONFIGURE");
    else if (d2 == 0x94 && d3 == 0x88) Serial.println("[PROBE] => ILI9488 (320x480) - matches config");
    else if (d2 == 0x94 && d3 == 0x86) Serial.println("[PROBE] => ILI9486 (320x480)");
    else if (d2 == 0x77 && d3 == 0x89) Serial.println("[PROBE] => ST7789");
    else Serial.println("[PROBE] => unknown. all 00 or FF means no read-back on MISO");
    Serial.flush();
}

void setup() {
    Serial.begin(115200);
    delay(700);
    Serial.println();
    Serial.println("=========================================");
    Serial.println(" WISE2 BYTE - ESP32-C5 DISPLAY BRING-UP");
    Serial.println(" CS0 RST1 DC2 SCK3 MOSI4 MISO5 BL6");
    Serial.println("=========================================");
    Serial.flush();

    Serial.println("[INIT] lcd.init()...");
    Serial.flush();
    lcd.init();
    lcd.setRotation(0);
    lcd.setBrightness(255);
    Serial.printf("[INIT] reports %dx%d\n", (int)lcd.width(), (int)lcd.height());
    Serial.flush();

    probeId();
    Serial.println("[INIT] entering colour loop");
    Serial.flush();
}

void loop() {
    ++cycle;
    Serial.printf("=== CYCLE %lu ===\n", (unsigned long)cycle);
    Serial.flush();

    const uint32_t cols[3] = {0xFF0000u, 0x00FF00u, 0x0000FFu};
    const char*    names[3] = {"RED", "GREEN", "BLUE"};
    for (int i = 0; i < 3; ++i) {
        Serial.printf("      %s\n", names[i]);
        Serial.flush();
        lcd.fillScreen(lcd.color888((cols[i] >> 16) & 0xFF,
                                    (cols[i] >> 8) & 0xFF,
                                     cols[i] & 0xFF));
        delay(1500);
    }

    lcd.fillScreen(TFT_BLACK);
    lcd.setTextColor(TFT_CYAN, TFT_BLACK);
    lcd.setTextSize(3);
    lcd.setCursor(16, 60);
    lcd.printf("BYTE C5");
    lcd.setTextSize(2);
    lcd.setCursor(16, 110);
    lcd.printf("cycle %lu", (unsigned long)cycle);
    lcd.setTextSize(1);
    lcd.setCursor(16, 150);
    lcd.printf("%dx%d", (int)lcd.width(), (int)lcd.height());
    delay(2500);
}
