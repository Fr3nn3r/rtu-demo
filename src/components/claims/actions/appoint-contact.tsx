import { useState } from 'react'
import type { Claim, ContactRole, WorkflowState } from '@/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { BridgeStepBanner } from '../bridge-step-banner'
import { useClaims } from '@/context/ClaimContext'
import { useContacts } from '@/context/ContactContext'
import { User, Phone, Mail } from 'lucide-react'

interface AppointContactProps {
  claim: Claim
  contactRole: ContactRole
  nextState: WorkflowState
  workflowField: 'assessorId' | 'investigatorId' | 'glassRepairerId'
}

const roleLabels: Record<ContactRole, string> = {
  assessor: 'Assessor',
  investigator: 'Investigator',
  repairer: 'Repairer',
  glass_repairer: 'Glass Repairer',
}

export function AppointContact({ claim, contactRole, nextState, workflowField }: AppointContactProps) {
  const { dispatch } = useClaims()
  const { getByRole } = useContacts()
  const contacts = getByRole(contactRole)
  const [selectedId, setSelectedId] = useState(claim.workflow[workflowField] ?? '')

  const selected = contacts.find(c => c.id === selectedId)
  const isBridge = contactRole !== 'glass_repairer'

  function handleConfirm() {
    dispatch({
      type: 'ADVANCE_WORKFLOW',
      claimId: claim.id,
      toState: nextState,
      data: { [workflowField]: selectedId },
    })
  }

  return (
    <div className="space-y-4">
      {isBridge && (
        <BridgeStepBanner
          system="roc"
          instruction={`Select a ${roleLabels[contactRole].toLowerCase()} and confirm the appointment on ROC.`}
        />
      )}

      <div>
        <Label>Select {roleLabels[contactRole]}</Label>
        <div className="mt-2 space-y-2">
          {contacts.map(contact => (
            <button
              key={contact.id}
              type="button"
              onClick={() => setSelectedId(contact.id)}
              className={`w-full flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                selectedId === contact.id
                  ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/50'
                  : 'border-border hover:border-border'
              }`}
            >
              <div className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-muted">
                <User className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{contact.name}</div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Mail className="size-3" />{contact.email}</span>
                  <span className="flex items-center gap-1"><Phone className="size-3" />{contact.phone}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm">
          Selected: <span className="font-medium">{selected.name}</span> ({selected.email})
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleConfirm} disabled={!selectedId}>
          Confirm Appointment
        </Button>
      </div>
    </div>
  )
}
