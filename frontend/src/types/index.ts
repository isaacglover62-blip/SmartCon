export type UserRole = 'USER' | 'ADMIN'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  role: UserRole
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export interface Home {
  id: string
  name: string
  description?: string
  address?: string
  timezone: string
  icon: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface Room {
  id: string
  homeId: string
  name: string
  icon: string
  color: string
  floor: number
  sortOrder: number
  createdAt: string
}

export type DeviceType =
  | 'LIGHT'
  | 'FAN'
  | 'SOCKET'
  | 'RGB_LIGHT'
  | 'CURTAIN'
  | 'DOOR'
  | 'GARAGE'
  | 'TEMPERATURE_SENSOR'
  | 'HUMIDITY_SENSOR'
  | 'MOTION_SENSOR'
  | 'POWER_MONITOR'

export interface Device {
  id: string
  homeId: string
  roomId?: string
  name: string
  type: DeviceType
  bleDeviceId?: string
  bleDeviceName?: string
  icon: string
  online: boolean
  favorite: boolean
  firmwareVersion?: string
  batteryLevel?: number
  lastSeenAt?: string
  createdAt: string
}

export interface DeviceState {
  power?: boolean
  brightness?: number
  speed?: number
  r?: number
  g?: number
  b?: number
  position?: number
  temperature?: number
  humidity?: number
  motion?: boolean
  watts?: number
}

export interface BLEDevice {
  deviceId: string
  name: string
  rssi?: number
}

export type TriggerType = 'TIME' | 'DEVICE_STATE' | 'BLE_CONNECT' | 'BLE_DISCONNECT' | 'SUNRISE' | 'SUNSET'

export interface Automation {
  id: string
  homeId: string
  name: string
  description?: string
  enabled: boolean
  triggerType: TriggerType
  triggerConfig: Record<string, unknown>
  conditionConfig: Record<string, unknown>
  actionConfig: Record<string, unknown>
  lastTriggeredAt?: string
  createdAt: string
}

export interface Scene {
  id: string
  homeId: string
  name: string
  icon: string
  color: string
  active: boolean
  createdAt: string
}

export interface Notification {
  id: string
  title: string
  body: string
  type: 'INFO' | 'WARNING' | 'ERROR' | 'DEVICE' | 'AUTOMATION' | 'SECURITY'
  read: boolean
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  errors?: Record<string, string>
  timestamp: string
}

export type BLECommand =
  | 'LIGHT_1_ON' | 'LIGHT_1_OFF'
  | 'LIGHT_2_ON' | 'LIGHT_2_OFF'
  | 'LIGHT_3_ON' | 'LIGHT_3_OFF'
  | 'LIGHT_4_ON' | 'LIGHT_4_OFF'
  | 'FAN_0' | 'FAN_1' | 'FAN_2' | 'FAN_3'
  | `RGB_${number}_${number}_${number}`
  | 'SOCKET_1_ON' | 'SOCKET_1_OFF'
  | 'SOCKET_2_ON' | 'SOCKET_2_OFF'
  | 'CURTAIN_OPEN' | 'CURTAIN_CLOSE'
  | 'STATUS' | 'ALL_OFF'
