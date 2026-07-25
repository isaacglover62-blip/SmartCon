import { useBLEStore } from '@/store/bleStore'
import type { BLECommand } from '@/types'

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b'
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8'

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
      // acceptAllDevices shows every BLE device in range so ESP32 always appears
      // optionalServices grants access to our service UUID after the user selects the device
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [SERVICE_UUID],
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
      const service = await this.server.getPrimaryService(SERVICE_UUID)
      this.characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID)

      // Only start notifications if the characteristic supports it
      if (this.characteristic.properties.notify) {
        await this.characteristic.startNotifications()
        this.characteristic.addEventListener('characteristicvaluechanged', this.onNotification.bind(this))
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

  async connectById(deviceId: string, _deviceName: string): Promise<void> {
    const store = useBLEStore.getState()
    store.setStatus('connecting')

    try {
      const devices = await navigator.bluetooth.getDevices()
      const device = devices.find((d) => d.id === deviceId)

      if (!device) {
        // getDevices() only returns previously permitted devices.
        // If not found, fall back to a fresh scan so the user can re-select.
        store.setStatus('idle')
        store.setError('Device not found in cache. Tap "Scan & Connect" to reconnect.')
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

    // Use whichever write mode the characteristic supports
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
