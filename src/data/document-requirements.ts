import type { ClaimType, DocumentType } from '@/types'

export const REQUIRED_DOCUMENTS: Record<ClaimType, DocumentType[]> = {
  accident: [
    'claim_form',
    'id_copy',
    'drivers_license',
    'license_disk',
    'police_report',
    'damage_photos',
    'assessment_report',
  ],
  theft: [
    'claim_form',
    'id_copy',
    'drivers_license',
    'license_disk',
    'police_report',
    'investigation_report',
  ],
  glass: [
    'claim_form',
    'id_copy',
    'license_disk',
    'damage_photos',
  ],
}

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  claim_form: 'Claim Form',
  police_report: 'Police Report',
  id_copy: 'ID Copy',
  license_disk: 'License Disk',
  vehicle_registration: 'Vehicle Registration',
  drivers_license: "Driver's License",
  trip_log: 'Trip Log',
  damage_photos: 'Damage Photos',
  assessment_report: 'Assessment Report',
  investigation_report: 'Investigation Report',
  rejection_docs: 'Rejection Documents',
  other: 'Other',
}
