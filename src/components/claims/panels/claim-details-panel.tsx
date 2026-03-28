import type { Claim } from '@/types'
import { formatZAR } from '@/lib/utils'
import { useContacts } from '@/context/ContactContext'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function ClaimDetailsPanel({ claim }: { claim: Claim }) {
  return (
    <div className="space-y-1">
      <Section title="Insured Information" defaultOpen>
        <Field label="Name" value={claim.insured.name} />
        <Field label="Company" value={claim.insured.company} />
        <Field label="ID Number" value={claim.insured.idNumber} />
        <Field label="Phone" value={claim.insured.phone} />
        <Field label="Email" value={claim.insured.email} />
        <Field label="Address" value={claim.insured.address} />
      </Section>

      <Section title="Vehicle Information" defaultOpen>
        <Field label="Vehicle" value={`${claim.vehicle.year} ${claim.vehicle.make} ${claim.vehicle.model}`} />
        <Field label="Registration" value={claim.vehicle.registration} />
        <Field label="VIN" value={claim.vehicle.vin} />
        <Field label="Engine No." value={claim.vehicle.engineNumber} />
        <Field label="Colour" value={claim.vehicle.colour} />
        {claim.vehicle.value && <Field label="Value" value={formatZAR(claim.vehicle.value)} />}
        {claim.vehicle.km && <Field label="Kilometres" value={claim.vehicle.km.toLocaleString()} />}
      </Section>

      <Section title="Incident Information">
        <Field label="Date" value={new Date(claim.incident.date).toLocaleDateString()} />
        <Field label="Location" value={claim.incident.location} />
        <Field label="Circumstances" value={claim.incident.circumstances} />
        <Field label="Police Reference" value={claim.incident.policeReference} />
      </Section>

      <Section title="Broker">
        <Field label="Name" value={claim.broker.name} />
        <Field label="Email" value={claim.broker.email} />
      </Section>

      <WorkflowSection claim={claim} />
    </div>
  )
}

function WorkflowSection({ claim }: { claim: Claim }) {
  const { getById } = useContacts()

  const assessor = claim.workflow.assessorId ? getById(claim.workflow.assessorId) : null
  const investigator = claim.workflow.investigatorId ? getById(claim.workflow.investigatorId) : null

  return (
    <Section title="Workflow">
      <Field label="Policy Number" value={claim.workflow.policyNumber} />
      <Field label="SPM Claim Number" value={claim.workflow.spmClaimNumber} />
      {claim.workflow.excessAmount != null && (
        <Field label="Excess" value={formatZAR(claim.workflow.excessAmount)} />
      )}
      {claim.workflow.assessedAmount != null && (
        <Field label="Assessed Amount" value={formatZAR(claim.workflow.assessedAmount)} />
      )}
      {assessor && <Field label="Assessor" value={assessor.name} />}
      {investigator && <Field label="Investigator" value={investigator.name} />}
      {claim.workflow.routeType && (
        <Field label="Route" value={claim.workflow.routeType === 'repair' ? 'Repair' : 'Total Loss'} />
      )}
      {claim.workflow.finalCostAmount != null && (
        <Field label="Final Cost" value={formatZAR(claim.workflow.finalCostAmount)} />
      )}
      {claim.workflow.rejectionReason && (
        <Field label="Rejection Reason" value={claim.workflow.rejectionReason} />
      )}
    </Section>
  )
}

function Section({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? false)

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-2 text-xs font-semibold text-text-muted uppercase tracking-wide hover:text-text-primary"
      >
        {title}
        <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="pb-2 space-y-1.5">{children}</div>}
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="w-28 flex-shrink-0 text-text-muted">{label}</span>
      <span className="text-text-primary">{value}</span>
    </div>
  )
}
