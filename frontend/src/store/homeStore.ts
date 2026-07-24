import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Home, Room, Device } from '@/types'

interface HomeState {
  homes: Home[]
  activeHomeId: string | null
  rooms: Room[]
  devices: Device[]
  setHomes: (homes: Home[]) => void
  setActiveHome: (id: string) => void
  setRooms: (rooms: Room[]) => void
  setDevices: (devices: Device[]) => void
  addHome: (home: Home) => void
  updateHome: (home: Home) => void
  removeHome: (id: string) => void
  addRoom: (room: Room) => void
  updateRoom: (room: Room) => void
  removeRoom: (id: string) => void
  addDevice: (device: Device) => void
  updateDevice: (device: Device) => void
  removeDevice: (id: string) => void
  getActiveHome: () => Home | null
  getRoomDevices: (roomId: string) => Device[]
}

export const useHomeStore = create<HomeState>()(
  persist(
    (set, get) => ({
      homes: [],
      activeHomeId: null,
      rooms: [],
      devices: [],

      setHomes: (homes) => set({ homes }),
      setActiveHome: (id) => set({ activeHomeId: id }),
      setRooms: (rooms) => set({ rooms }),
      setDevices: (devices) => set({ devices }),

      addHome: (home) => set((s) => ({ homes: [...s.homes, home] })),
      updateHome: (home) => set((s) => ({ homes: s.homes.map((h) => (h.id === home.id ? home : h)) })),
      removeHome: (id) => set((s) => ({ homes: s.homes.filter((h) => h.id !== id) })),

      addRoom: (room) => set((s) => ({ rooms: [...s.rooms, room] })),
      updateRoom: (room) => set((s) => ({ rooms: s.rooms.map((r) => (r.id === room.id ? room : r)) })),
      removeRoom: (id) => set((s) => ({ rooms: s.rooms.filter((r) => r.id !== id) })),

      addDevice: (device) => set((s) => ({ devices: [...s.devices, device] })),
      updateDevice: (device) => set((s) => ({ devices: s.devices.map((d) => (d.id === device.id ? device : d)) })),
      removeDevice: (id) => set((s) => ({ devices: s.devices.filter((d) => d.id !== id) })),

      getActiveHome: () => {
        const { homes, activeHomeId } = get()
        return homes.find((h) => h.id === activeHomeId) ?? null
      },

      getRoomDevices: (roomId) => get().devices.filter((d) => d.roomId === roomId),
    }),
    { name: 'smarthome-home' }
  )
)
