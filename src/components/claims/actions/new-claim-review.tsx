import type { Claim } from '@/types'
import { Button } from '@/components/ui/button'
import { useClaims } from '@/context/ClaimContext'

export function NewClaimReview({ claim }: { claim: Claim }) {
  const { dispatch } = useClaims()

  function handleConfirm() {
    dispatch({
      type: 'ADVANCE_WORKFLOW',
      claimId: claim.id,
      toState: 'POLICY_VALIDATION',
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Review the extracted claim data below. Correct any errors and confirm the claim to proceed to policy validation.
      </p>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Field label="Insured" value={claim.insured.name} />
        <Field label="Company" value={claim.insured.company} />
        <Field label="ID Number" value={claim.insured.idNumber} />
        <Field label="Phone" value={claim.insured.phone} />
        <Field label="Vehicle" value={`${claim.vehicle.year} ${claim.vehicle.make} ${claim.vehicle.model}`} />
        <Field label="Registration" value={claim.vehicle.registration} />
        <Field label="VIN" value={claim.vehicle.vin} />
        <Field label="Incident Date" value={new Date(claim.incident.date).toLocaleDateString()} />
        <Field label="Location" value={claim.incident.location} />
        <Field label="Broker" value={claim.broker.name} />
      </div>

      <div className="rounded-lg border border-border bg-surface-secondary p-3 text-sm">
        <div className="font-medium text-text-primary mb-1">Circumstances</div>
        <p className="text-text-secondary">{claim.incident.circumstances}</p>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleConfirm}>
          Confirm & Proceed to Policy Validation
        </Button>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-[11px] font-medium text-text-muted uppercase tracking-wide">{label}</div>
      <div className="text-text-primary">{value || '—'}</div>
    </div>
  )
}
