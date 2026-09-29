# ⚡ WISE² K10 — QUICK START GUIDE

**Get up and running in 2 minutes!**

---

## 🔌 Step 1: Connect Hardware

```
Plug K10 into USB port via USB-C cable
Wait 3 seconds
Green LED lights up ✅
```

---

## 🎤 Step 2: Activate Voice Recognition

**Say any of these wake words:**
```
"Hi Telly"
"Jarvis"
```

**Device response:**
- Blue LED lights up
- Display shows: "LISTENING"
- Ready for your command

---

## 💬 Step 3: Give a Command

**Say one of these:**

| Command | Display shows | LED color |
|---------|---------------|-----------|
| "Switch on" | Switch ON (green text) | White (bright) |
| "Switch off" | Switch OFF (red text) | Red (dim) |
| "Hello" | HELLO! (yellow text) | Yellow |

---

## 📱 Step 4: Back to Ready

Device automatically returns to:
- Green LED
- Display: "READY"
- Waiting for next wake word

---

## 🎯 Complete Demo Loop

```
READY (green LED)
    ↓
Say "Hi Telly"
    ↓
LISTENING (blue LED)
    ↓
Say "Switch on"
    ↓
RECOGNIZED (white LED, green text)
    ↓
READY (green LED) - repeat!
```

---

## ❌ If Something Goes Wrong

**Device not responding?**
1. Check USB connection
2. Try unplugging and replugging
3. Wait 5 seconds for boot

**Colors wrong?**
1. This was fixed - if still wrong, check USB cable connection

**No wake word response?**
1. Speak clearly
2. Speak near the microphone (top of device)
3. Try different wake word

**Can't upload new firmware?**
1. In Arduino IDE: **Tools → Model → English** (critical!)
2. Then: **Compile** then **Upload**

---

## 📊 What You're Seeing

### Display States

| State | Shows | LED | Meaning |
|-------|-------|-----|---------|
| Boot | Booting... | Green→Blue | Initializing |
| Ready | READY | Green | Waiting for voice |
| Listening | LISTENING | Blue | Hearing audio |
| Processing | Recognizing... | White | Processing command |
| Result | RECOGNIZED + command | Color | Command executed |

### LED Meanings

- 🟢 **Green** = Ready (waiting)
- 🔵 **Blue** = Listening (processing audio)
- ⚪ **White** = Processing (command active)
- 🔴 **Red** = Off/Error (dimmed)
- 🟡 **Yellow** = Special state

---

## 💡 Pro Tips

1. **Speak clearly** - Microphones are sensitive
2. **Use full wake word** - Say "Hi Telly" not just "Hi"
3. **Wait for blue LED** - Device needs to hear the wake word
4. **Watch the display** - Visual feedback shows what device heard
5. **LED color matches state** - Green=ready, Blue=listening

---

## 📞 Still Need Help?

See the full documentation:
- **CLIENT_DEMO_READY.md** - Comprehensive guide
- **AUDIT_REPORT.md** - Technical details
- **FLASH_K10_README.md** - Firmware flashing guide

---

## ✅ Ready to Demo!

That's it! The K10 is production-ready and fully operational.

**Enjoy the demo!** 🚀

