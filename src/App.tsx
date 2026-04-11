import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ClaimProvider } from '@/context/ClaimContext'
import { ContactProvider } from '@/context/ContactContext'
import { AppShell } from '@/components/layout/app-shell'
import { ClaimsListPage } from '@/pages/claims-list-page'
import { ClaimDetailPage } from '@/pages/claim-detail-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { ContactsPage } from '@/pages/contacts-page'
import { InboxPage } from '@/pages/inbox-page'
import { Toaster } from '@/components/ui/sonner'

function App() {
  return (
    <ClaimProvider>
      <ContactProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Navigate to="/claims" replace />} />
              <Route path="/claims" element={<ClaimsListPage />} />
              <Route path="/claims/:claimId" element={<ClaimDetailPage />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </ContactProvider>
    </ClaimProvider>
  )
}

export default App
