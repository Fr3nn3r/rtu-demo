# RTUSA Glass Claim Form -- Field Specification

**Source:** Zoho Forms (GlassClaim)
**Total fields:** 21
**Required:** 16 | **Optional:** 5

---

## Section: Broker / policy

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 1 | Policy Number | Text | Yes | Free text |
| 2 | Broker's Email Address | Email | No | Email validation |
| 3 | Client's Email Address | Email | No | Email validation |

## Section: Insured / address

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 4 | Address | Address composite | No | Street, Line 2, City, Region, Zip, Country |

## Section: Loss details

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 5 | Place of loss | Text | Yes | Free text |
| 6 | Date of loss | Date | Yes | dd-MMM-yyyy |
| 7 | Time of loss | Time | Yes | HH:MM with AM/PM |
| 8 | Cause of loss | Dropdown | Yes | Options loaded dynamically (not extractable from static HTML) |
| 9 | Which glass to be replaced | Dropdown | Yes | Options loaded dynamically |

## Section: Vehicle details

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 10 | Vehicle description | Text | Yes | Placeholder: "E.g. VW polo vivo" |
| 11 | VIN no | Text | Yes | Vehicle Identification Number |
| 12 | Engine no | Text | Yes | |
| 13 | Vehicle Registration Number | Text | Yes | |

## Section: Contact details

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 14 | Insured's contact number | Phone | Yes | Min 5 / max 15 digits, country code dropdown |
| 15 | Email | Email | No | General email field |
| 16 | Driver's contact number | Phone | Yes | Min 5 / max 15 digits, country code dropdown |
| 17 | Driver's ID number | Text | Yes | National ID |

## Section: Vehicle location

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 18 | Current Vehicle Location | Text | Yes | Where the vehicle is now (for dispatch) |

## Section: Document uploads

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 19 | Photos of damages | Image upload (multi) | Yes | Multiple damage photos |
| 20 | Driver's License | File upload | Yes | Single file |

## Section: Declaration

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 21 | Signature of Insured | E-Signature | Yes | Draw-on-screen signature pad |

---

## Key differences from accident/theft forms

- Much shorter form (21 fields vs 54-61)
- No finance details section
- No anti-theft device section
- No separate driver name/details (only contact number + ID)
- Has glass-specific fields: "Cause of loss" and "Which glass to be replaced" (dropdowns)
- Has "Current Vehicle Location" field (relevant for glass replacement dispatch)
- Fewer document uploads (damage photos + license only, no police report)
- No policyholder name field (just policy number and contact details)
- Phone fields use proper phone type with country code selector (vs plain text on other forms)
- Single signature only (no driver signature)
