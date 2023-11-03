export interface createReqBody {
  email: string
  name: string
  phone: string
  type: string
  deviceSn: string
  deviceName: string
  deviceCat: string
  deviceProducer: string
  deviceAccessories: Array<number>
  issue: string
  lines: string
  postCode: string
  city: string
  damageType: number
  damageDescription: string
}
