import { useParams, Navigate } from 'react-router-dom'
import { useClaims } from '@/context/ClaimContext'
import { ClaimHeader } from '@/components/claims/claim-header'
import { WorkflowStepper } from '@/components/claims/workflow-stepper'
import { ActionPanel } from '@/components/claims/action-panel'
import { SlaBanner } from '@/components/claims/sla-banner'
import { ClaimDetailsPanel } from '@/components/claims/panels/claim-details-panel'
import { DocumentsPanel } from '@/components/claims/panels/documents-panel'
import { CommunicationsPanel } from '@/components/claims/panels/communications-panel'
import { AuditTrailPanel } from '@/components/claims/panels/audit-trail-panel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'

export function ClaimDetailPage() {
  const { claimId } = useParams<{ claimId: string }>()
  const { getClaimById } = useClaims()
  const claim = getClaimById(claimId ?? '')

  if (!claim) {
    return <Navigate to="/claims" replace />
  }

  return (
    <div className="space-y-5">
      <ClaimHeader claim={claim} />
      <WorkflowStepper claim={claim} />
      <SlaBanner claim={claim} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main action area */}
        <div className="lg:col-span-2">
          <ActionPanel claim={claim} />
        </div>

        {/* Sidebar tabs */}
        <div className="lg:col-span-1">
          <Card>
            <Tabs defaultValue="details">
              <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent px-1">
                <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
                <TabsTrigger value="documents" className="text-xs">
                  Documents
                  {claim.documents.some(d => d.status === 'pending') && (
                    <span className="ml-1 size-1.5 rounded-full bg-accent-foreground inline-block" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="communications" className="text-xs">
                  Communications
                  {claim.communications.some(c => !c.sentAt) && (
                    <span className="ml-1 size-1.5 rounded-full bg-primary inline-block" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="audit" className="text-xs">Audit</TabsTrigger>
              </TabsList>

              <div className="p-3 max-h-[600px] overflow-y-auto">
                <TabsContent value="details" className="mt-0">
                  <ClaimDetailsPanel claim={claim} />
                </TabsContent>
                <TabsContent value="documents" className="mt-0">
                  <DocumentsPanel claim={claim} />
                </TabsContent>
                <TabsContent value="communications" className="mt-0">
                  <CommunicationsPanel claim={claim} />
                </TabsContent>
                <TabsContent value="audit" className="mt-0">
                  <AuditTrailPanel claim={claim} />
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  )
}
