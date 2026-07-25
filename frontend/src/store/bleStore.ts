import { create } from 'zustand'
import type { BLEDevice } from '@/types'

export type BLEStatus = 'idle' | 'scanning' | 'connecting' | 'connected' | 'disconnected' | 'error'

interface BLEState {
  status: BLEStatus
  connectedDevice: BLEDevice | null
  scannedDevices: BLEDevice[]
  savedDevices: BLEDevice[]
  lastCommand: string | null
  lastResponse: Record<string, unknown> | null
  errorMessage: string | null
  setStatus: (status: BLEStatus) => void
  setConnectedDevice: (device: BLEDevice | null) => void
  setScannedDevices: (devices: BLEDevice[]) => void
  addScannedDevice: (device: BLEDevice) => void
  setSavedDevices: (devices: BLEDevice[]) => void
  addSavedDevice: (device: BLEDevice) => void
  removeSavedDevice: (deviceId: string) => void
  setLastCommand: (cmd: string | null) => void
  setLastResponse: (res: Record<string, unknown> | null) => void
  setError: (msg: string | null) => void
}

export const useBLEStore = create<BLEState>()((set, get) => ({
  status: 'idle',
  connectedDevice: null,
  scannedDevices: [],
  savedDevices: JSON.parse(localStorage.getItem('ble-saved-devices') ?? '[]') as BLEDevice[],
  lastCommand: null,
  lastResponse: null,
  errorMessage: null,

  setStatus: (status) => set({ status }),
  setConnectedDevice: (device) => set({ connectedDevice: device }),
  setScannedDevices: (devices) => set({ scannedDevices: devices }),
  addScannedDevice: (device) =>
    set((s) => {
      const exists = s.scannedDevices.some((d) => d.deviceId === device.deviceId)
      return exists ? s : { scannedDevices: [...s.scannedDevices, device] }
    }),
  setSavedDevices: (devices) => {
    localStorage.setItem('ble-saved-devices', JSON.stringify(devices))
    set({ savedDevices: devices })
  },
  addSavedDevice: (device) => {
    const devices = get().savedDevices
    if (!devices.some((d) => d.deviceId === device.deviceId)) {
      const updated = [...devices, device]
      localStorage.setItem('ble-saved-devices', JSON.stringify(updated))
      set({ savedDevices: updated })
    }
  },
  removeSavedDevice: (deviceId) => {
    const updated = get().savedDevices.filter((d) => d.deviceId !== deviceId)
    localStorage.setItem('ble-saved-devices', JSON.stringify(updated))
    set({ savedDevices: updated })
  },
  setLastCommand: (cmd) => set({ lastCommand: cmd }),
  setLastResponse: (res) => set({ lastResponse: res }),
  setError: (msg) => set({ errorMessage: msg }),
}))
