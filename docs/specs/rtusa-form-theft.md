# RTUSA Motor Theft Claim Form -- Field Specification

**Source:** Zoho Forms (MOTORTHEFTCLAIMFORM)
**Total fields:** 61
**Required:** 40 | **Optional:** 21

---

## Section: Broker

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 1 | Broker Name | Text | Yes | Max 255 chars (Zoho Name.First) |
| 2 | Claim Number | Text | Yes | Max 255 chars (Zoho Name.Last) |
| 3 | Policy Number | Text | Yes | Max 255 chars (Zoho Name.Middle) |
| 4 | Broker's Email Address | Email | No | Email validation |

## Section: Client / insured

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 5 | Client's Email Address | Email | No | Email validation |
| 6 | Title | Dropdown | Yes | Options: Mr., Mrs., Ms. |
| 7 | First Name | Text | Yes | Max 255 chars |
| 8 | Last Name | Text | Yes | Max 255 chars |
| 9 | Policy Number | Text | Yes | Duplicate label, different field from #3 |
| 10 | Company Name/Surname and Initials | Text | Yes | Max 255 chars |
| 11 | Company Registration Number | Text | No | Max 255 chars |
| 12 | VAT Number | Text | No | Max 255 chars |
| 13 | Identity Number | Text | Yes | Max 255 chars |
| 14 | Occupation or Business | Text | Yes | Max 255 chars |
| 15 | Physical Address | Address composite | No | Street, Line 2, City, Region, Zip, Country |
| 16 | Postal Address | Address composite | No | Same structure as Physical |
| 17 | Business Contact Number | Text | Yes | Max 255 chars |
| 18 | Home Contact Number | Text | No | Max 255 chars |
| 19 | Cell Phone Number | Text | Yes | Max 255 chars |

## Section: Vehicle details

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 20 | Vehicle's Year, Make and Model | Text | Yes | Placeholder: "e.g. 2023 VW Polo Vivo" |
| 21 | Registration Number | Text | Yes | Max 255 chars |
| 22 | Vehicle's Value (ZAR) | Currency | Yes | ZAR formatting |
| 23 | Kilometers Completed | Number | Yes | Numeric input |
| 24 | Vehicle Identification Number (VIN) | Text | Yes | Max 255 chars |
| 25 | Chassis Number | Text | Yes | Max 255 chars |
| 26 | Engine Number | Text | Yes | Max 255 chars |
| 27 | Exterior Colour | Text | Yes | Max 255 chars |
| 28 | Interior Colour | Text | Yes | Max 255 chars |

## Section: Finance company

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 29 | Finance Company | Text | No | Max 255 chars |
| 30 | Account Number | Text | No | Max 255 chars |
| 31 | Outstanding Amount (ZAR) | Currency | No | ZAR formatting |
| 32 | Type of Agreement | Text | Yes | Free-text (not a dropdown despite label) |

## Section: Driver details

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 33 | Driver First Name | Text | Yes | Max 255 chars |
| 34 | Driver Last Name | Text | Yes | Max 255 chars |
| 35 | Driver ID No. | Text | Yes | Max 255 chars |

## Section: Theft incident

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 36 | Theft Date and Time | DateTime | Yes | dd-MMM-yyyy HH:MM AM/PM |
| 37 | Place | Text | Yes | Max 255 chars |
| 38 | Police Station Reference Number | Text | Yes | Max 255 chars |
| 39 | Date Reported | Date | Yes | dd-MMM-yyyy |
| 40 | Circumstances | Textarea | Yes | Free text |
| 41 | Was the vehicle locked? If not give reasons | Text | No | Max 255 chars |
| 42 | Details of stolen accessories (attach invoices). Separately insured? | Textarea | No | Free text |

## Section: Document uploads

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 43 | Police Report | Image upload | Yes | With webcam capture option |
| 44 | Owner's ID | Image upload | Yes | With webcam capture |
| 45 | License Disk | Image upload | Yes | With webcam capture |
| 46 | Vehicle Registration Document | Image upload | Yes | With webcam capture |
| 47 | Detailed Trip Log | File upload | No | Upload only (no webcam) |
| 48 | Driver License | Image upload | Yes | With webcam capture |

## Section: Anti-theft / vehicle recovery device

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 49 | Date | Date | No | dd-MMM-yyyy |
| 50 | Fitted by | Text | No | Max 255 chars |
| 51 | Make | Text | No | Max 255 chars |

## Section: Vehicle identification marks

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 52 | Window Markings Number | Text | No | Max 255 chars |
| 53 | Applied by Whom | Text | No | Max 255 chars |
| 54 | Details of scratches, dents, defects | Text | No | Max 255 chars |
| 55 | Details of other features assisting identification | Text | No | Max 255 chars |

## Section: Declaration

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 56 | Insured Signature | E-Signature | Yes | Preceded by declaration/consent text |
| 57 | Date (insured) | Date | Yes | dd-MMM-yyyy |
| 58 | Driver's Name | Text | Yes | Max 255 chars |
| 59 | Driver Signature | E-Signature | Yes | Digital signature pad |
| 60 | Date (driver) | Date | Yes | dd-MMM-yyyy |
| 61 | Terms and Conditions | Checkbox | No* | "N.B. IT IS IMPORTANT THAT YOU NOTIFY THE INSURERS IMMEDIATELY..." (*functionally likely required to submit) |

---

## Key differences from accident form

- Theft form has a Title dropdown (Mr./Mrs./Ms.) not present on accident form
- Theft form has separate Claim Number field in broker section
- Theft form has 61 fields vs 54 on accident form
- Otherwise structurally identical to accident form (same sections, same order)

## Notable observations

- "Policy Number" appears in two places: broker section (#3) and insured section (#9), as different Zoho components
- Broker "Name" component is repurposed: First = Broker Name, Last = Claim Number, Middle = Policy Number
- Driver "Name" component is repurposed: First = First Name, Last = Last Name, Middle = ID No.
- Phone numbers are plain text fields (no phone-type validation)
- All currency fields are ZAR (South African Rand)
- All date fields use dd-MMM-yyyy format
