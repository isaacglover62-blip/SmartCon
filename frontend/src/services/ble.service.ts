import { useBLEStore } from '@/store/bleStore'
import type { BLECommand } from '@/types'

// All common ESP32 BLE service UUIDs used in Arduino sketches
const CANDIDATE_SERVICES = [
  '4fafc201-1fb5-459e-8fcc-c5c9c331914b', // Espressif default example
  '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART Service
  '0000ffe0-0000-1000-8000-00805f9b34fb', // HM-10 style
  '0000fff0-0000-1000-8000-00805f9b34fb', // Generic custom
  '0000ab00-0000-1000-8000-00805f9b34fb', // Another common one
]

const CANDIDATE_CHARACTERISTICS = [
  'beb5483e-36e1-4688-b7f5-ea07361b26a8', // Espressif default example
  '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART TX (write)
  '6e400003-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART RX (notify)
  '0000ffe1-0000-1000-8000-00805f9b34fb', // HM-10 characteristic
  '0000fff1-0000-1000-8000-00805f9b34fb', // Generic write char
]

class BLEService {
  private device: BluetoothDevice | null = null
  private server: BluetoothRemoteGATTServer | null = null
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private isReconnecting = false

  isSupported(): boolean {
    return 'bluetooth' in navigator
  }

  async scan(): Promise<void> {
    if (!this.isSupported()) throw new Error('Web Bluetooth is not supported in this browser')

    const store = useBLEStore.getState()
    store.setStatus('scanning')
    store.setScannedDevices([])

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: CANDIDATE_SERVICES,
      })

      store.addScannedDevice({
        deviceId: device.id,
        name: device.name ?? 'Unknown Device',
      })

      await this.connectToDevice(device)
    } catch (err) {
      if ((err as Error).name !== 'NotFoundError') {
        store.setStatus('error')
        store.setError((err as Error).message)
      } else {
        store.setStatus('idle')
      }
    }
  }

  async connectToDevice(device: BluetoothDevice): Promise<void> {
    const store = useBLEStore.getState()
    store.setStatus('connecting')

    try {
      this.device = device
      this.device.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this))

      if (!this.device.gatt) throw new Error('GATT server not available on this device')

      this.server = await this.device.gatt.connect()

      // Discover the first working service + writable characteristic
      const { characteristic } = await this.discoverCharacteristic(this.server)
      this.characteristic = characteristic

      // Only start notifications if supported
      if (this.characteristic.properties.notify || this.characteristic.properties.indicate) {
        try {
          await this.characteristic.startNotifications()
          this.characteristic.addEventListener('characteristicvaluechanged', this.onNotification.bind(this))
        } catch {
          // Notifications not available — commands still work
        }
      }

      store.setStatus('connected')
      store.setConnectedDevice({ deviceId: device.id, name: device.name ?? 'Unknown Device' })
      store.addSavedDevice({ deviceId: device.id, name: device.name ?? 'Unknown Device' })
      store.setError(null)
    } catch (err) {
      store.setStatus('error')
      store.setError((err as Error).message)
      throw err
    }
  }

  // Try each candidate service/characteristic until one works
  private async discoverCharacteristic(
    server: BluetoothRemoteGATTServer
  ): Promise<{ service: BluetoothRemoteGATTService; characteristic: BluetoothRemoteGATTCharacteristic }> {
    for (const serviceUuid of CANDIDATE_SERVICES) {
      let service: BluetoothRemoteGATTService
      try {
        service = await server.getPrimaryService(serviceUuid)
      } catch {
        continue // this service not on device, try next
      }

      for (const charUuid of CANDIDATE_CHARACTERISTICS) {
        try {
          const characteristic = await service.getCharacteristic(charUuid)
          const p = characteristic.properties
          if (p.write || p.writeWithoutResponse) {
            console.info(`[BLE] Connected via service ${serviceUuid} / char ${charUuid}`)
            return { service, characteristic }
          }
        } catch {
          continue
        }
      }

      // No matching characteristic in candidates — get ALL characteristics from this service
      try {
        const allChars = await service.getCharacteristics()
        const writable = allChars.find(
          (c) => c.properties.write || c.properties.writeWithoutResponse
        )
        if (writable) {
          console.info(`[BLE] Connected via service ${serviceUuid} / discovered char ${writable.uuid}`)
          return { service, characteristic: writable }
        }
      } catch {
        continue
      }
    }

    throw new Error(
      'Could not find a writable BLE characteristic on this device. ' +
      'Make sure the ESP32 is running the SmartCon sketch and is advertising correctly.'
    )
  }

  async connectById(deviceId: string, _deviceName: string): Promise<void> {
    const store = useBLEStore.getState()
    store.setStatus('connecting')

    try {
      const devices = await navigator.bluetooth.getDevices()
      const device = devices.find((d) => d.id === deviceId)

      if (!device) {
        store.setStatus('idle')
        store.setError('Device not in cache. Tap "Scan & Connect" to reconnect.')
        return
      }

      await this.connectToDevice(device)
    } catch (err) {
      store.setStatus('error')
      store.setError((err as Error).message)
    }
  }

  disconnect(): void {
    this.isReconnecting = false
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect()
    }
    this.cleanup()
  }

  async sendCommand(command: BLECommand): Promise<void> {
    if (!this.characteristic) throw new Error('Not connected to any device')

    const encoder = new TextEncoder()
    const data = encoder.encode(command)

    if (this.characteristic.properties.writeWithoutResponse) {
      await this.characteristic.writeValueWithoutResponse(data)
    } else {
      await this.characteristic.writeValueWithResponse(data)
    }

    useBLEStore.getState().setLastCommand(command)
  }

  async requestStatus(): Promise<void> {
    await this.sendCommand('STATUS')
  }

  private onNotification(event: Event): void {
    const target = event.target as BluetoothRemoteGATTCharacteristic
    const decoder = new TextDecoder()
    const text = decoder.decode(target.value)

    try {
      const json = JSON.parse(text) as Record<string, unknown>
      useBLEStore.getState().setLastResponse(json)
    } catch {
      useBLEStore.getState().setLastResponse({ raw: text })
    }
  }

  private onDisconnected(): void {
    const store = useBLEStore.getState()
    store.setStatus('disconnected')

    if (this.isReconnecting) return
    this.isReconnecting = true
    this.scheduleReconnect()
  }

  private scheduleReconnect(attempt = 1): void {
    if (!this.device || attempt > 5) {
      this.isReconnecting = false
      useBLEStore.getState().setStatus('error')
      return
    }

    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 16000)
    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connectToDevice(this.device!)
        this.isReconnecting = false
      } catch {
        this.scheduleReconnect(attempt + 1)
      }
    }, delay)
  }

  private cleanup(): void {
    this.server = null
    this.characteristic = null
    useBLEStore.getState().setStatus('disconnected')
    useBLEStore.getState().setConnectedDevice(null)
  }

  getConnectionStatus() {
    return useBLEStore.getState().status
  }

  isConnected(): boolean {
    return this.device?.gatt?.connected === true
  }
}

export const bleService = new BLEService()
