import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import type { Contact, ContactRole } from '@/types'
import { seedContacts } from '@/data/seed-contacts'

interface ContactContextValue {
  contacts: Contact[]
  getByRole: (role: ContactRole) => Contact[]
  getById: (id: string) => Contact | undefined
  addContact: (contact: Contact) => void
  removeContact: (id: string) => void
}

const ContactContext = createContext<ContactContextValue | null>(null)

export function ContactProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>(seedContacts)

  const value = useMemo<ContactContextValue>(() => ({
    contacts,
    getByRole: (role: ContactRole) => contacts.filter(c => c.role === role),
    getById: (id: string) => contacts.find(c => c.id === id),
    addContact: (contact: Contact) => setContacts(prev => [...prev, contact]),
    removeContact: (id: string) => setContacts(prev => prev.filter(c => c.id !== id)),
  }), [contacts])

  return (
    <ContactContext.Provider value={value}>
      {children}
    </ContactContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useContacts(): ContactContextValue {
  const ctx = useContext(ContactContext)
  if (!ctx) throw new Error('useContacts must be used within ContactProvider')
  return ctx
}
