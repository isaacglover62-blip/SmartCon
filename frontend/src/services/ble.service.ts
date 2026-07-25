import { useBLEStore } from '@/store/bleStore'
import type { BLECommand } from '@/types'

class BLEService {
  private ws: WebSocket | null = null
  private relayUrl: string = ''

  isSupported(): boolean {
    return true
  }

  async scan(): Promise<void> {
    const store = useBLEStore.getState()
    const url = store.relayUrl || localStorage.getItem('relay-url') || ''

    if (!url) {
      store.setStatus('error')
      store.setError('Enter the relay URL (ws://laptop-ip:8765) in the scanner page first.')
      return
    }

    await this.connectToRelay(url)
  }

  async connectToRelay(url: string): Promise<void> {
    const store = useBLEStore.getState()
    store.setStatus('connecting')
    this.relayUrl = url
    localStorage.setItem('relay-url', url)

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url)

        this.ws.onopen = () => {
          store.setStatus('connected')
          store.setConnectedDevice({ deviceId: 'hc06', name: 'HC-06 (Arduino)' })
          store.addSavedDevice({ deviceId: 'hc06', name: 'HC-06 (Arduino)' })
          store.setError(null)
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const json = JSON.parse(event.data) as Record<string, unknown>
            store.setLastResponse(json)
          } catch {
            store.setLastResponse({ raw: event.data })
          }
        }

        this.ws.onclose = () => {
          store.setStatus('disconnected')
          store.setConnectedDevice(null)
        }

        this.ws.onerror = () => {
          const msg = `Cannot reach relay at ${url}. Make sure the Python relay script is running on your laptop.`
          store.setStatus('error')
          store.setError(msg)
          reject(new Error(msg))
        }
      } catch (err) {
        store.setStatus('error')
        store.setError((err as Error).message)
        reject(err)
      }
    })
  }

  async connectToDevice(_device: unknown): Promise<void> {
    await this.scan()
  }

  async connectById(_deviceId: string, _deviceName: string): Promise<void> {
    await this.scan()
  }

  disconnect(): void {
    this.ws?.close()
    this.ws = null
    useBLEStore.getState().setStatus('disconnected')
    useBLEStore.getState().setConnectedDevice(null)
  }

  async sendCommand(command: BLECommand): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to relay. Please connect first.')
    }
    this.ws.send(command)
    useBLEStore.getState().setLastCommand(command)
  }

  async requestStatus(): Promise<void> {
    await this.sendCommand('STATUS')
  }

  getConnectionStatus() {
    return useBLEStore.getState().status
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

export const bleService = new BLEService()
