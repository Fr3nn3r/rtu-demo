import { useState } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useClaims } from '@/context/ClaimContext'
import type { Claim } from '@/types'

interface AssignToClaimPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (targetClaimId: string) => void
}

function matchesSearch(claim: Claim, query: string): boolean {
  if (!query.trim()) return true
  const q = query.toLowerCase()
  return (
    claim.id.toLowerCase().includes(q) ||
    (claim.workflow.spmClaimNumber?.toLowerCase() ?? '').includes(q) ||
    claim.insured.name.toLowerCase().includes(q) ||
    claim.vehicle.registration.toLowerCase().includes(q)
  )
}

export function AssignToClaimPicker({ open, onOpenChange, onPick }: AssignToClaimPickerProps) {
  const { claims } = useClaims()
  const [query, setQuery] = useState('')

  const active = claims.filter(c => c.status !== 'CLOSED' && matchesSearch(c, query))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle>Assign to claim</DialogTitle>
        </DialogHeader>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by claim ID, SPM number, insured name, or vehicle reg…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No matching active claims.</CommandEmpty>
            <CommandGroup>
              {active.map(claim => (
                <CommandItem
                  key={claim.id}
                  value={claim.id}
                  onSelect={() => {
                    onPick(claim.id)
                    onOpenChange(false)
                    setQuery('')
                  }}
                  className="flex flex-col items-start gap-0.5"
                >
                  <div className="text-xs font-medium text-foreground">
                    {claim.id}
                    {claim.workflow.spmClaimNumber && (
                      <span className="text-muted-foreground"> · {claim.workflow.spmClaimNumber}</span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {claim.insured.name} · {claim.vehicle.registration} · {claim.vehicle.make} {claim.vehicle.model}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
