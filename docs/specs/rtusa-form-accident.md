# RTUSA Motor Accident Claim Form -- Field Specification

**Source:** Zoho Forms (MOTORACCIDENTCLAIMFORM)
**Total fields:** 54 (52 input + 2 signature)
**Required:** 34 | **Optional:** 20

---

## Section: Broker / contact information

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 1 | Broker (First/Last/Middle) | Name composite | Yes | All 3 sub-fields required, max 255 chars each |
| 2 | Broker's Email Address | Email | No | Email validation |
| 3 | Client's Email Address | Email | No | Email validation |

## Section: Insured details

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 4 | Insured (First/Last/Middle) | Name composite | Yes | All 3 sub-fields required |
| 5 | Company Name/Surname and Initials | Text | Yes | Max 255 chars |
| 6 | Company Registration Number | Text | No | Max 255 chars |
| 7 | VAT Number | Text | No | Max 255 chars |
| 8 | Identity Number | Text | Yes | Max 255 chars |
| 9 | Occupation or Business | Text | Yes | Max 255 chars |
| 10 | Physical Address | Address composite | No | Street, Line 2, City, Region, Zip, Country |
| 11 | Postal Address | Address composite | No | Same sub-fields as Physical |
| 12 | Business Contact Number | Text | Yes | Max 255 chars |
| 13 | Home Contact Number | Text | No | Max 255 chars |
| 14 | Cell Phone Number | Text | Yes | Max 255 chars |

## Section: Vehicle details

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 15 | Vehicle's Year, Make and Model | Text | Yes | Max 255 chars |
| 16 | Registration Number | Text | Yes | Max 255 chars |
| 17 | Vehicle's Value (ZAR) | Currency | Yes | Numeric with currency formatting |
| 18 | Kilometers Completed | Number | Yes | Numeric input |
| 19 | Vehicle Identification Number (VIN) | Text | Yes | Max 255 chars |
| 20 | Chassis Number | Text | Yes | Max 255 chars |
| 21 | Engine Number | Text | Yes | Max 255 chars |
| 22 | Exterior Colour | Text | Yes | Max 255 chars |
| 23 | Interior Colour | Text | Yes | Max 255 chars |

## Section: Finance details

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 24 | Finance Company | Text | No | Max 255 chars |
| 25 | Account Number | Text | No | Max 255 chars |
| 26 | Outstanding Amount (ZAR) | Currency | No | Numeric with currency formatting |
| 27 | Type of Agreement | Text | Yes | Free-text, max 255 chars |

## Section: Driver details

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 28 | Driver (First/Last/Middle) | Name composite | Yes | All 3 sub-fields required |

## Section: Incident details

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 29 | Theft Date and Time | DateTime | Yes | Combined date + time picker |
| 30 | Place | Text | Yes | Max 255 chars |
| 31 | Police Station Reference Number | Text | Yes | Max 255 chars |
| 32 | Date Reported | Date | Yes | Date picker |
| 33 | Circumstances | Textarea | Yes | Free-text, max 65535 chars |
| 34 | Was the vehicle locked? If not give reasons | Text | No | Max 255 chars |
| 35 | Details of stolen accessories (attach invoices). Separately insured? | Textarea | No | Free-text |

## Section: Document uploads

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 36 | Police Report | Image upload | Yes | Up to 5 files |
| 37 | Owner's ID | Image upload | Yes | 1 file |
| 38 | License Disk | Image upload | Yes | 1 file |
| 39 | Vehicle Registration Document | Image upload | Yes | 1 file |
| 40 | Detailed Trip Log | File upload | No | 1 file |
| 41 | Driver License | Image upload | Yes | 1 file |

## Section: Anti-theft / vehicle recovery device

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 42 | Date | Date | No | Date picker |
| 43 | Fitted by | Text | No | Max 255 chars |
| 44 | Make | Text | No | Max 255 chars |
| 45 | Window Markings Number | Text | No | Max 255 chars |
| 46 | Applied by Whom | Text | No | Max 255 chars |
| 47 | Details of scratches, dents, defects | Text | No | Max 255 chars |
| 48 | Details of other features assisting identification | Text | No | Max 255 chars |

## Section: Declaration and signatures

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 49 | Insured Signature | E-Signature | Yes | Preceded by declaration/consent text |
| 50 | Date (insured signature) | Date | Yes | Date picker |
| 51 | Driver's Name | Text | Yes | Max 255 chars |
| 52 | Driver Signature | E-Signature | Yes | Drawn signature |
| 53 | Date (driver signature) | Date | Yes | Date picker |
| 54 | Terms and Conditions | Checkbox | No | "N.B. IT IS IMPORTANT THAT YOU NOTIFY THE INSURERS IMMEDIATELY..." |

---

## Field type summary

| Type | Count |
|------|-------|
| Text (single line) | 28 |
| Image upload | 5 |
| Date | 4 |
| Name composite | 3 |
| Email | 2 |
| Address composite | 2 |
| Currency (ZAR) | 2 |
| Textarea | 2 |
| E-Signature | 2 |
| Number | 1 |
| DateTime | 1 |
| File upload | 1 |
| Checkbox (T&C) | 1 |
