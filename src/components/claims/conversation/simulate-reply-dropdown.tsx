import type { Claim, MessageRole, OutboundMessage } from '@/types'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MessageSquareReply, ChevronDown } from 'lucide-react'
import { useClaims } from '@/context/ClaimContext'
import { getContactById } from '@/data/seed-contacts'
import { toast } from 'sonner'

interface SimulateReplyDropdownProps {
  claim: Claim
}

type Participant = { role: MessageRole; label: string; sublabel?: string }

function getThreadParticipants(claim: Claim): Participant[] {
  const sentOutbound = claim.messages.filter(
    (m): m is OutboundMessage => m.direction === 'outbound' && m.state === 'sent'
  )
  if (sentOutbound.length === 0) return []

  const participants: Participant[] = []
  const seenRoles = new Set<MessageRole>()

  function addOnce(role: MessageRole, label: string, sublabel?: string) {
    if (seenRoles.has(role)) return
    seenRoles.add(role)
    participants.push({ role, label, sublabel })
  }

  // Check which roles have been sent to by looking at recipient emails
  for (const msg of sentOutbound) {
    const toLower = msg.to.join(',').toLowerCase()
    if (claim.insured.email && toLower.includes(claim.insured.email.toLowerCase())) {
      addOnce('insured', claim.insured.name, 'Policyholder')
    }
    if (claim.broker.email && toLower.includes(claim.broker.email.toLowerCase())) {
      addOnce('broker', claim.broker.name, 'Broker')
    }
  }

  if (claim.workflow.assessorId) {
    const c = getContactById(claim.workflow.assessorId)
    if (c) addOnce('assessor', c.name, 'Assessor')
  }
  if (claim.workflow.investigatorId) {
    const c = getContactById(claim.workflow.investigatorId)
    if (c) addOnce('investigator', c.name, 'Investigator')
  }
  if (claim.workflow.repairerId) {
    const c = getContactById(claim.workflow.repairerId)
    if (c) addOnce('repairer', c.name, 'Repairer')
  }
  if (claim.workflow.glassRepairerId) {
    const c = getContactById(claim.workflow.glassRepairerId)
    if (c) addOnce('glass_repairer', c.name, 'Glass repairer')
  }

  return participants
}

export function SimulateReplyDropdown({ claim }: SimulateReplyDropdownProps) {
  const { dispatch } = useClaims()
  const participants = getThreadParticipants(claim)
  const disabled = participants.length === 0

  function handlePick(role: MessageRole, label: string) {
    dispatch({ type: 'SIMULATE_INBOUND_REPLY', claimId: claim.id, fromRole: role })
    toast.success(`Simulated reply from ${label}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" disabled={disabled}>
            <MessageSquareReply className="size-3.5 mr-1.5" />
            Simulate reply
            <ChevronDown className="size-3.5 ml-1" />
          </Button>
        }
      />
      {!disabled && (
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>From which participant?</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {participants.map(p => (
            <DropdownMenuItem
              key={p.role}
              onClick={() => handlePick(p.role, p.label)}
              className="flex flex-col items-start"
            >
              <span className="text-xs font-medium">{p.label}</span>
              {p.sublabel && <span className="text-[11px] text-muted-foreground">{p.sublabel}</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  )
}
