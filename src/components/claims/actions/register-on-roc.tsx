import { useState } from 'react'
import type { Claim } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CopyableField } from '../copyable-field'
import { BridgeStepBanner } from '../bridge-step-banner'
import { useClaims } from '@/context/ClaimContext'
import { formatZAR } from '@/lib/utils'

export function RegisterOnROC({ claim }: { claim: Claim }) {
  const { dispatch } = useClaims()
  const [spmNumber, setSpmNumber] = useState(claim.workflow.spmClaimNumber ?? '')

  function handleConfirm() {
    const nextState = claim.type === 'accident'
      ? 'ASSESSOR_APPOINTED' as const
      : claim.type === 'theft'
        ? 'INVESTIGATOR_APPOINTED' as const
        : 'GLASS_REPAIRER_APPOINTED' as const

    dispatch({
      type: 'ADVANCE_WORKFLOW',
      claimId: claim.id,
      toState: nextState,
      data: { spmClaimNumber: spmNumber },
    })
  }

  return (
    <div className="space-y-4">
      <BridgeStepBanner
        system="roc"
        instruction="Register this claim on ROC using the data below. Enter the SPM claim number once registration is complete."
      />

      <div className="grid grid-cols-2 gap-2">
        <CopyableField label="Policy Number" value={claim.workflow.policyNumber ?? '—'} />
        <CopyableField label="Claim Type" value={claim.type.charAt(0).toUpperCase() + claim.type.slice(1)} />
        <CopyableField label="Insured Name" value={claim.insured.name} />
        <CopyableField label="ID Number" value={claim.insured.idNumber} />
        <CopyableField label="Vehicle" value={`${claim.vehicle.year} ${claim.vehicle.make} ${claim.vehicle.model}`} />
        <CopyableField label="Registration" value={claim.vehicle.registration} />
        <CopyableField label="VIN" value={claim.vehicle.vin} />
        {claim.type !== 'theft' && (
          <CopyableField label="Excess" value={claim.workflow.excessAmount ? formatZAR(claim.workflow.excessAmount) : '—'} />
        )}
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <h4 className="text-sm font-medium">Enter from ROC</h4>
        <div className="max-w-xs">
          <Label htmlFor="spmNumber">SPM Claim Number</Label>
          <Input
            id="spmNumber"
            value={spmNumber}
            onChange={e => setSpmNumber(e.target.value)}
            placeholder="SPM-..."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleConfirm} disabled={!spmNumber}>
          Confirm Registration
        </Button>
      </div>
    </div>
  )
}
