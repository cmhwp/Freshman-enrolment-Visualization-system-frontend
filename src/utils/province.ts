import { provinces } from '@/constants/provinces'

export function getProvinceLabel(value: string): string {
  const province = provinces.find(p => p.value === value)
  return province ? province.label : value
}
