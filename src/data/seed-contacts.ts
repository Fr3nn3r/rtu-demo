import type { Contact } from '@/types'

export const seedContacts: Contact[] = [
  // Assessors
  {
    id: 'CON-001',
    name: 'Pieter van der Merwe',
    email: 'pieter@assessments.co.za',
    phone: '082-555-0101',
    role: 'assessor',
  },
  {
    id: 'CON-002',
    name: 'Thandiwe Nkosi',
    email: 'thandiwe@motorassess.co.za',
    phone: '083-555-0202',
    role: 'assessor',
  },
  {
    id: 'CON-003',
    name: 'Rajesh Govender',
    email: 'rajesh@autoassess.co.za',
    phone: '084-555-0303',
    role: 'assessor',
  },
  // Investigators
  {
    id: 'CON-004',
    name: 'Sipho Dlamini',
    email: 'sipho@investigate.co.za',
    phone: '072-555-0404',
    role: 'investigator',
  },
  {
    id: 'CON-005',
    name: 'Jacques Fourie',
    email: 'jacques@claimsinvest.co.za',
    phone: '076-555-0505',
    role: 'investigator',
  },
  // Repairers
  {
    id: 'CON-006',
    name: "Vusi's Auto Repairs",
    email: 'vusi@autorepairs.co.za',
    phone: '011-555-0606',
    role: 'repairer',
  },
  {
    id: 'CON-007',
    name: 'Peninsula Panel Beaters',
    email: 'info@peninsulapanel.co.za',
    phone: '021-555-0707',
    role: 'repairer',
  },
  // Glass repairers
  {
    id: 'CON-008',
    name: 'PG Glass Johannesburg',
    email: 'claims@pgglass.co.za',
    phone: '011-555-0808',
    role: 'glass_repairer',
  },
  {
    id: 'CON-009',
    name: 'Autoglass Durban',
    email: 'service@autoglass.co.za',
    phone: '031-555-0909',
    role: 'glass_repairer',
  },
]

export function getContactsByRole(role: Contact['role']): Contact[] {
  return seedContacts.filter(c => c.role === role)
}

export function getContactById(id: string): Contact | undefined {
  return seedContacts.find(c => c.id === id)
}
