import { useState } from 'react'
import type { Claim } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CopyableField } from '../copyable-field'
import { BridgeStepBanner } from '../bridge-step-banner'
import { useClaims } from '@/context/ClaimContext'

export function PolicyValidation({ claim }: { claim: Claim }) {
  const { dispatch } = useClaims()
  const isTheft = claim.type === 'theft'
  const [policyNumber, setPolicyNumber] = useState(claim.workflow.policyNumber ?? '')
  const [excessAmount, setExcessAmount] = useState(claim.workflow.excessAmount?.toString() ?? '')

  function handleValid() {
    dispatch({
      type: 'ADVANCE_WORKFLOW',
      claimId: claim.id,
      toState: 'REGISTERED',
      data: {
        policyNumber,
        ...(isTheft ? {} : { excessAmount: Number(excessAmount) }),
      },
    })
  }

  function handleInvalid() {
    dispatch({
      type: 'ADVANCE_WORKFLOW',
      claimId: claim.id,
      toState: 'INVALID',
    })
  }

  return (
    <div className="space-y-4">
      <BridgeStepBanner
        system="nimbis"
        instruction={isTheft
          ? "Look up the insured on Nimbis using the details below. Verify the policy is active, then enter the policy number."
          : "Look up the insured on Nimbis using the details below. Verify the policy is active, then enter the policy number and excess amount."
        }
      />

      <div className="grid grid-cols-2 gap-2">
        <CopyableField label="Insured Name" value={claim.insured.name} />
        <CopyableField label="ID Number" value={claim.insured.idNumber} />
        <CopyableField label="Vehicle Reg." value={claim.vehicle.registration} />
        <CopyableField label="VIN" value={claim.vehicle.vin} />
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <h4 className="text-sm font-medium">Enter from Nimbis</h4>
        <div className={`grid ${isTheft ? 'grid-cols-1 max-w-xs' : 'grid-cols-2'} gap-3`}>
          <div className="space-y-2">
            <Label htmlFor="policyNumber">Policy Number</Label>
            <Input
              id="policyNumber"
              value={policyNumber}
              onChange={e => setPolicyNumber(e.target.value)}
              placeholder="POL-..."
            />
          </div>
          {!isTheft && (
            <div className="space-y-2">
              <Label htmlFor="excessAmount">Excess Amount (ZAR)</Label>
              <Input
                id="excessAmount"
                type="number"
                value={excessAmount}
                onChange={e => setExcessAmount(e.target.value)}
                placeholder="e.g. 5000"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="destructive" onClick={handleInvalid}>
          Mark Invalid
        </Button>
        <Button onClick={handleValid} disabled={!policyNumber || (!isTheft && !excessAmount)}>
          Confirm Valid — Proceed
        </Button>
      </div>
    </div>
  )
}
