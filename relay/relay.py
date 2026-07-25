"""
SmartCon HC-06 Relay
---------------------
Bridges the SmartCon web app to an HC-06 (Bluetooth Classic) Arduino.

Requirements:
    pip install pyserial websockets

Usage:
    python relay.py

Windows: HC-06 appears as a COM port after pairing (e.g. COM3, COM4).
         Check Device Manager > Ports to find the right one.
Mac/Linux: Usually /dev/rfcomm0 or /dev/tty.HC-06
"""

import asyncio
import json
import serial
import serial.tools.list_ports
import websockets
import threading
import sys

# ── Configuration ──────────────────────────────────────────────────────────────
WS_PORT = 8765          # Port the web app connects to
BAUD_RATE = 9600        # HC-06 default baud rate
COM_PORT = None         # Set to e.g. "COM4" or "/dev/rfcomm0" to skip auto-detect
# ────────────────────────────────────────────────────────────────────────────────

serial_port: serial.Serial | None = None
connected_clients: set = set()


def find_hc06_port() -> str | None:
    """Try to auto-detect the HC-06 serial port."""
    ports = serial.tools.list_ports.comports()
    for p in ports:
        desc = (p.description or "").lower()
        if any(x in desc for x in ["bluetooth", "hc-06", "hc06", "serial", "rfcomm"]):
            return p.device
    # Fall back to first available port if only one exists
    if len(ports) == 1:
        return ports[0].device
    return None


def open_serial(port: str) -> serial.Serial:
    s = serial.Serial(port, BAUD_RATE, timeout=1)
    print(f"[relay] Connected to HC-06 on {port} at {BAUD_RATE} baud")
    return s


def read_from_arduino(ser: serial.Serial):
    """Background thread: reads responses from Arduino and broadcasts to all WS clients."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    async def broadcast(message: str):
        if connected_clients:
            payload = json.dumps({"raw": message})
            await asyncio.gather(*[c.send(payload) for c in list(connected_clients)])

    while True:
        try:
            if ser.in_waiting:
                line = ser.readline().decode("utf-8", errors="ignore").strip()
                if line:
                    print(f"[arduino → app] {line}")
                    loop.run_until_complete(broadcast(line))
        except Exception as e:
            print(f"[relay] Serial read error: {e}")
            break


async def ws_handler(websocket):
    """Handle a web app WebSocket connection."""
    connected_clients.add(websocket)
    remote = websocket.remote_address
    print(f"[relay] Web app connected from {remote}")

    try:
        await websocket.send(json.dumps({"status": "connected", "message": "Relay ready"}))

        async for message in websocket:
            print(f"[app → arduino] {message}")
            if serial_port and serial_port.is_open:
                serial_port.write((message + "\n").encode("utf-8"))
            else:
                await websocket.send(json.dumps({"error": "Serial port not open"}))
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        connected_clients.discard(websocket)
        print(f"[relay] Web app disconnected from {remote}")


async def main():
    global serial_port

    port = COM_PORT or find_hc06_port()

    if not port:
        print("\n[relay] ERROR: Could not find HC-06 port automatically.")
        print("         Please set COM_PORT at the top of relay.py")
        print("         Windows: check Device Manager > Ports (COM & LPT)")
        print("         Mac/Linux: ls /dev/tty.* or ls /dev/rfcomm*\n")
        sys.exit(1)

    try:
        serial_port = open_serial(port)
    except serial.SerialException as e:
        print(f"\n[relay] ERROR opening serial port: {e}")
        print("         Make sure HC-06 is paired and not in use by another app.\n")
        sys.exit(1)

    # Start background thread to read Arduino responses
    reader = threading.Thread(target=read_from_arduino, args=(serial_port,), daemon=True)
    reader.start()

    print(f"\n[relay] WebSocket server running on ws://0.0.0.0:{WS_PORT}")
    print(f"[relay] Web app should connect to ws://<YOUR-LAPTOP-IP>:{WS_PORT}")
    print("[relay] Press Ctrl+C to stop\n")

    async with websockets.serve(ws_handler, "0.0.0.0", WS_PORT):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[relay] Stopped.")
        if serial_port:
            serial_port.close()
