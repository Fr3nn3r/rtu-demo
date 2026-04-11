import { useState, useEffect } from 'react'
import type { ClaimType, Claim } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useClaims } from '@/context/ClaimContext'
import { generateId } from '@/lib/utils'
import { DocumentDropZone } from '@/components/document-drop-zone'

const typeLabels: Record<ClaimType, string> = {
  accident: 'Accident',
  theft: 'Theft',
  glass: 'Glass',
}

// ── Random South African prototype data ──────────────────────
const saNames = [
  'Thandi Mahlangu', 'Willem Joubert', 'Nosipho Sithole', 'Rajan Pillay',
  'Lerato Mokoena', 'Pieter Botha', 'Zanele Dlamini', 'Ahmed Ismail',
  'Lindiwe Nkomo', 'Jacques van Wyk', 'Sibongile Mkhize', 'Farid Cassim',
]
const saCompanies = [
  'Soweto Star Taxis', 'Rea Vaya Fleet Services', 'eThekwini Transport Holdings',
  'Pretoria Shuttle Services', 'KZN Express Taxis', 'Gateway Shuttle Co',
  'Tshwane Minibus Holdings', 'Phoenix Taxi Association', 'Cape Flats Transport',
]
const saVehicles = [
  { make: 'Toyota', model: 'Quantum 2.5D-4D GL', year: 2022 },
  { make: 'Toyota', model: 'HiAce 2.7 VVTI Ses-Fikile', year: 2023 },
  { make: 'VW', model: 'Caddy Maxi 2.0TDI Crew Bus', year: 2021 },
  { make: 'Nissan', model: 'NV350 Impendulo 2.5i', year: 2022 },
  { make: 'Iveco', model: 'Daily 35S14V', year: 2021 },
  { make: 'Toyota', model: 'Quantum GL 14-Seater', year: 2020 },
  { make: 'VW', model: 'Caddy 2.0TDI', year: 2023 },
]
const saLocations = [
  'Cnr Bree & Jeppe St, Johannesburg CBD',
  'N1 Highway, Midrand',
  'Warwick Junction Taxi Rank, Durban',
  'R21 near OR Tambo International',
  'William Nicol Dr, Sandton',
  'M4 Ruth First Highway, Durban North',
  'N12 Highway, Benoni',
  'Church St, Pretoria CBD',
]
const saBrokers = [
  { name: 'David Botha', email: 'david@brokersa.co.za' },
  { name: 'Anesh Naidoo', email: 'anesh@insurancesa.co.za' },
  { name: 'Lisa van Rensburg', email: 'lisa@durbanbrokerage.co.za' },
  { name: 'Johan Kruger', email: 'johan@krugerbrokers.co.za' },
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
function randomReg(): string {
  const provinces = ['GP', 'ND', 'CA', 'NW']
  const num = String(Math.floor(100 + Math.random() * 900))
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const suffix = letters[Math.floor(Math.random() * letters.length)]
    + letters[Math.floor(Math.random() * letters.length)]
    + letters[Math.floor(Math.random() * letters.length)]
  return `${pick(provinces)} ${num} ${suffix}`
}
function randomId(): string {
  const y = String(70 + Math.floor(Math.random() * 30)).padStart(2, '0')
  const m = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')
  const d = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')
  return `${y}${m}${d}5800${String(80 + Math.floor(Math.random() * 10))}`
}
function randomPhone(): string {
  const prefix = pick(['082', '083', '072', '076', '061', '079'])
  return `${prefix}-${String(Math.floor(100 + Math.random() * 900))}-${String(Math.floor(1000 + Math.random() * 9000))}`
}

function generateDefaults() {
  const name = pick(saNames)
  const vehicle = pick(saVehicles)
  const reg = randomReg()
  return { name, vehicle, reg }
}

interface NewClaimDialogProps {
  type: ClaimType | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (claimId: string) => void
}

export function NewClaimDialog({ type, open, onOpenChange, onCreated }: NewClaimDialogProps) {
  const { dispatch } = useClaims()
  const [defaults, setDefaults] = useState(generateDefaults)
  const [insuredName, setInsuredName] = useState('')
  const [registration, setRegistration] = useState('')
  const [vehicleDesc, setVehicleDesc] = useState('')
  const [formUploaded, setFormUploaded] = useState(false)

  // Regenerate defaults when dialog opens
  useEffect(() => {
    if (open) {
      const d = generateDefaults()
      setDefaults(d)
      setInsuredName(d.name)
      setRegistration(d.reg)
      setVehicleDesc(`${d.vehicle.make} ${d.vehicle.model}`)
    }
  }, [open])

  if (!type) return null

  function handleCreate() {
    const claimId = generateId()
    const now = new Date().toISOString()
    const nameParts = insuredName.split(' ')
    const broker = pick(saBrokers)
    const company = pick(saCompanies)
    const location = pick(saLocations)
    const veh = defaults.vehicle

    const claim: Claim = {
      id: claimId,
      type: type!,
      status: 'NEW',
      assignedTo: 'Nikki Pearmain',
      createdAt: now,
      updatedAt: now,
      insured: {
        name: insuredName,
        company,
        idNumber: randomId(),
        phone: randomPhone(),
        email: `${nameParts[0]?.toLowerCase() ?? 'info'}@${company.toLowerCase().replace(/\s+/g, '')}.co.za`,
        address: pick(saLocations),
      },
      broker,
      driver: {
        firstName: nameParts[0] ?? '',
        lastName: nameParts.slice(1).join(' ') ?? '',
        idNumber: randomId(),
        phone: randomPhone(),
      },
      vehicle: {
        year: veh.year,
        make: vehicleDesc.split(' ')[0] || veh.make,
        model: vehicleDesc.split(' ').slice(1).join(' ') || veh.model,
        registration: registration,
        vin: `AHTFR22G${String(Math.floor(100000000 + Math.random() * 900000000))}`,
        engineNumber: `2KD-${String(Math.floor(1000000 + Math.random() * 9000000))}`,
        colour: 'White',
        value: 200_000 + Math.floor(Math.random() * 300_000),
        km: 30_000 + Math.floor(Math.random() * 250_000),
      },
      incident: {
        date: new Date(Date.now() - Math.floor(Math.random() * 48) * 3600000).toISOString(),
        location,
        circumstances: type === 'theft'
          ? 'Vehicle stolen from taxi rank overnight. Driver reported vehicle missing in the morning.'
          : type === 'glass'
            ? 'Stone chip from truck on highway caused windscreen crack.'
            : 'Collision at intersection. Other driver failed to yield.',
        policeReference: type !== 'glass' ? `JHB-CAS-2026/03/${Math.floor(1000 + Math.random() * 9000)}` : undefined,
        policeStation: type !== 'glass' ? 'Johannesburg Central' : undefined,
        vehicleLocation: type === 'glass' ? location : undefined,
        causeOfLoss: type === 'glass' ? 'Stone chip' : undefined,
      },
      workflow: {},
      slaHistory: [],
      documents: type === 'glass'
        ? [
            { id: `D-${Date.now()}-1`, type: 'claim_form', label: 'Glass Claim Form', status: formUploaded ? 'received' : 'pending', updatedAt: now },
            { id: `D-${Date.now()}-2`, type: 'drivers_license', label: "Driver's License", status: 'pending', updatedAt: now },
            { id: `D-${Date.now()}-3`, type: 'damage_photos', label: 'Damage Photos', status: 'pending', updatedAt: now },
          ]
        : [
            { id: `D-${Date.now()}-1`, type: 'claim_form', label: 'Claim Form', status: formUploaded ? 'received' : 'pending', updatedAt: now },
            { id: `D-${Date.now()}-2`, type: 'police_report', label: 'Police Report', status: 'pending', updatedAt: now },
            { id: `D-${Date.now()}-3`, type: 'id_copy', label: "Owner's ID Copy", status: 'pending', updatedAt: now },
            { id: `D-${Date.now()}-4`, type: 'license_disk', label: 'License Disk', status: 'pending', updatedAt: now },
            { id: `D-${Date.now()}-5`, type: 'drivers_license', label: "Driver's License", status: 'pending', updatedAt: now },
          ],
      messages: [],
      auditTrail: [{
        id: `AUD-NEW-${Date.now()}`,
        timestamp: now,
        user: 'Nikki Pearmain',
        actionType: 'claim_created',
        description: 'Claim created from uploaded form',
      }],
    }

    dispatch({ type: 'ADD_CLAIM', claim })
    onCreated(claimId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New {typeLabels[type]} Claim</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <DocumentDropZone
            label="Upload Claim Form"
            fileName={`${typeLabels[type]} Claim Form.pdf`}
            onProcessed={() => {
              const d = generateDefaults()
              setDefaults(d)
              setInsuredName(d.name)
              setRegistration(d.reg)
              setVehicleDesc(`${d.vehicle.make} ${d.vehicle.model}`)
              setFormUploaded(true)
            }}
          />
          <div className="space-y-2">
            <Label htmlFor="insuredName">Insured Name</Label>
            <Input
              id="insuredName"
              value={insuredName}
              onChange={e => setInsuredName(e.target.value)}
              placeholder="e.g. Sipho Mthembu"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="registration">Vehicle Registration</Label>
              <Input
                id="registration"
                value={registration}
                onChange={e => setRegistration(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleDesc">Make & Model</Label>
              <Input
                id="vehicleDesc"
                value={vehicleDesc}
                onChange={e => setVehicleDesc(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Claim</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
