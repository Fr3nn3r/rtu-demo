import { useContacts } from '@/context/ContactContext'
import type { ContactRole } from '@/types'
import { User, Mail, Phone } from 'lucide-react'
import { Card } from '@/components/ui/card'

const roleLabels: Record<ContactRole, string> = {
  assessor: 'Assessors',
  investigator: 'Investigators',
  repairer: 'Repairers',
  glass_repairer: 'Glass Repairers',
}

const roleOrder: ContactRole[] = ['assessor', 'investigator', 'repairer', 'glass_repairer']

export function ContactsPage() {
  const { contacts } = useContacts()

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Contacts</h1>

      {roleOrder.map(role => {
        const roleContacts = contacts.filter(c => c.role === role)
        if (roleContacts.length === 0) return null

        return (
          <div key={role}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {roleLabels[role]}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {roleContacts.map(contact => (
                <Card key={contact.id} className="flex items-start gap-3 p-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{contact.name}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Mail className="size-3" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Phone className="size-3" />
                      <span>{contact.phone}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
