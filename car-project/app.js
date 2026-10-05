// ========================================
// BLE UUID
// ========================================

const SERVICE_UUID =
  "4fafc201-1fb5-459e-8fcc-c5c9c331914b";

const CHARACTERISTIC_UUID =
  "beb5483e-36e1-4688-b7f5-ea07361b26a8";

// ========================================
// BLE VARIABLES
// ========================================

let device = null;
let characteristic = null;

// ========================================
// CONNECT BLUETOOTH
// ========================================

async function connectBluetooth() {
  try {
    console.clear();
    console.log("========== BLE CONNECT ==========");

    if (!navigator.bluetooth) {
      throw new Error("เบราว์เซอร์นี้ไม่รองรับ Web Bluetooth");
    }

    console.log("Web Bluetooth: OK");
    console.log("1. Requesting device...");

    // ค้นหาอุปกรณ์ที่ประกาศ SERVICE_UUID นี้
    device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [SERVICE_UUID] }]
    });

    console.log("2. Device:", device.name || "(ไม่มีชื่อ)");

    device.addEventListener(
      "gattserverdisconnected",
      disconnected
    );

    console.log("3. Connecting GATT...");
    const server = await device.gatt.connect();

    if (!device.gatt.connected) {
      throw new Error("เชื่อมต่อ GATT ไม่สำเร็จ");
    }

    console.log("4. GATT connected");

    console.log("5. Getting service...");
    const service = await server.getPrimaryService(SERVICE_UUID);

    console.log("6. Service:", service.uuid);

    console.log("7. Getting characteristic...");
    characteristic = await service.getCharacteristic(
      CHARACTERISTIC_UUID
    );

    console.log("8. Characteristic:", characteristic.uuid);

    // เริ่มรับสถานะจาก ESP32
    characteristic.addEventListener(
      "characteristicvaluechanged",
      handleStatus
    );

    await characteristic.startNotifications();

    console.log("9. Notifications enabled");

    updateStatus("🟢 Connected", "#16a34a");
    console.log("BLE CONNECTED SUCCESSFULLY");
  } catch (error) {
    console.error(
      "Bluetooth Error:",
      error.name,
      error.message
    );

    characteristic = null;

    if (device?.gatt?.connected) {
      device.gatt.disconnect();
    }

    updateStatus("🔴 Disconnected", "#ef4444");
  }
}

// ========================================
// SEND COMMAND
// ========================================

async function sendCommand(command) {
  if (!characteristic || !device?.gatt?.connected) {
    console.log("Bluetooth not connected");
    updateStatus("🔴 Disconnected", "#ef4444");
    return;
  }

  try {
    const data = new TextEncoder().encode(command);

    // ใช้ writeValueWithResponse ถ้ารองรับ
    if (characteristic.writeValueWithResponse) {
      await characteristic.writeValueWithResponse(data);
    } else {
      await characteristic.writeValue(data);
    }

    console.log("Command sent:", command);
  } catch (error) {
    console.error("Send error:", error.name, error.message);
  }
}

// ========================================
// RECEIVE STATUS FROM ESP32
// ========================================

function handleStatus(event) {
  const value = event.target.value;
  const status = new TextDecoder().decode(value);

  console.log("ESP32:", status);
}

// ========================================
// DISCONNECTED
// ========================================

function disconnected() {
  console.warn("Bluetooth disconnected");
  characteristic = null;
  updateStatus("🔴 Disconnected", "#ef4444");
}

// ========================================
// UPDATE STATUS ELEMENT
// ต้องมี <div id="status"> ในไฟล์ HTML
// ========================================

function updateStatus(text, background) {
  const statusElement = document.getElementById("status");

  if (!statusElement) {
    console.warn('ไม่พบ element ที่มี id="status"');
    return;
  }

  statusElement.innerText = text;
  statusElement.style.background = background;
}

// ========================================
// STOP WHEN PAGE IS HIDDEN
// ========================================

document.addEventListener("visibilitychange", () => {
  if (
    document.hidden &&
    characteristic &&
    device?.gatt?.connected
  ) {
    sendCommand("S");
  }
});

console.log(navigator.userAgent);
console.log("Bluetooth:", navigator.bluetooth);
console.log("Secure:", window.isSecureContext);
console.log("Protocol:", location.protocol);

async function connectBluetooth() {

  console.clear();

  console.log("========== BLE DEBUG ==========");
  console.log("URL:", location.href);
  console.log("Protocol:", location.protocol);
  console.log("Secure:", window.isSecureContext);
  console.log("navigator.bluetooth:", navigator.bluetooth);
  console.log("Bluetooth type:", typeof navigator.bluetooth);
  console.log("User Agent:", navigator.userAgent);

  if (typeof navigator.bluetooth === "undefined") {
    console.error("❌ navigator.bluetooth ไม่มีในหน้านี้");
    return;
  }

  console.log("✅ Web Bluetooth พร้อมใช้งาน");

  try {

    console.log("1. Requesting device...");

    device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
      ]
    });

    console.log("2. Device:", device.name);

    device.addEventListener(
      "gattserverdisconnected",
      disconnected
    );

    console.log("3. Connecting GATT...");

    const server = await device.gatt.connect();

    console.log("4. GATT connected:", device.gatt.connected);

    const service = await server.getPrimaryService(
      "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
    );

    console.log("5. Service found:", service.uuid);

    characteristic = await service.getCharacteristic(
      "beb5483e-36e1-4688-b7f5-ea07361b26a8"
    );

    console.log("6. Characteristic found:", characteristic.uuid);

    await characteristic.startNotifications();

    characteristic.addEventListener(
      "characteristicvaluechanged",
      handleStatus
    );

    console.log("7. Notifications enabled");
    console.log("========== BLE CONNECTED ==========");

  } catch (error) {

    console.error("❌ Bluetooth Error");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error(error);

  }
}