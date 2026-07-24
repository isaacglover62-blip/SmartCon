import { api } from '@/lib/api'
import type { ApiResponse, Home, Room, Device } from '@/types'

export const homeService = {
  async getHomes() {
    const res = await api.get<ApiResponse<Home[]>>('/homes')
    return res.data.data
  },
  async createHome(data: Partial<Home>) {
    const res = await api.post<ApiResponse<Home>>('/homes', data)
    return res.data.data
  },
  async updateHome(id: string, data: Partial<Home>) {
    const res = await api.put<ApiResponse<Home>>(`/homes/${id}`, data)
    return res.data.data
  },
  async deleteHome(id: string) {
    await api.delete(`/homes/${id}`)
  },

  async getRooms(homeId: string) {
    const res = await api.get<ApiResponse<Room[]>>(`/homes/${homeId}/rooms`)
    return res.data.data
  },
  async createRoom(homeId: string, data: Partial<Room>) {
    const res = await api.post<ApiResponse<Room>>(`/homes/${homeId}/rooms`, data)
    return res.data.data
  },
  async updateRoom(homeId: string, roomId: string, data: Partial<Room>) {
    const res = await api.put<ApiResponse<Room>>(`/homes/${homeId}/rooms/${roomId}`, data)
    return res.data.data
  },
  async deleteRoom(homeId: string, roomId: string) {
    await api.delete(`/homes/${homeId}/rooms/${roomId}`)
  },

  async getDevices(homeId: string) {
    const res = await api.get<ApiResponse<Device[]>>(`/homes/${homeId}/devices`)
    return res.data.data
  },
  async createDevice(homeId: string, data: Partial<Device>) {
    const res = await api.post<ApiResponse<Device>>(`/homes/${homeId}/devices`, data)
    return res.data.data
  },
  async updateDevice(homeId: string, deviceId: string, data: Partial<Device>) {
    const res = await api.put<ApiResponse<Device>>(`/homes/${homeId}/devices/${deviceId}`, data)
    return res.data.data
  },
  async deleteDevice(homeId: string, deviceId: string) {
    await api.delete(`/homes/${homeId}/devices/${deviceId}`)
  },
  async toggleFavorite(homeId: string, deviceId: string) {
    const res = await api.post<ApiResponse<Device>>(`/homes/${homeId}/devices/${deviceId}/favorite`)
    return res.data.data
  },
}
