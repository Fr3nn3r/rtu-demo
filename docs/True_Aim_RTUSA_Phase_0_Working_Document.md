**True Aim x RTUSA**  
Pilot Implementation – Phase 0

Alignment & Scope Definition Working Document

| Client | RTUSA (Renasa) |
| :---- | :---- |
| **Programme** | Structured Pilot & Validation Programme |
| **Service Provider** | True Aim  |
| **Target Conversion** | 8 weeks |
| **Phase** | Phase 0 – Alignment & Scope Definition (Week 0–1) |
| **Document Owner** | Mike Mgodeli |
| **Tactical Project Owner** | Vassen Moodley |
| **Last Updated** | 30/03/2026 |
| **Version** | 1.1 – Updated from Workflow Overview meeting 26/03/2026 |

**1\. Programme Timeline**

*8-week structured pilot from alignment through to production conversion.*

| Phase | Timeline | Objective | Status |
| :---- | :---- | :---- | :---- |
| Phase 0 | Week 0–1 | Alignment & Scope Definition | **In Progress** |
| Phase 1 | Weeks 1–4 | Tailored Build & Structured Validation | **Not Started** |
| Phase 2 | Weeks 5–6 | Controlled Live Pilot | **Not Started** |
| Phase 3 | Weeks 7–8 | Evaluation & Production Conversion | **Not Started** |

**2\. Governance & Initial Requirements**

*Foundational governance elements to confirm before build work begins.*

**2.1 Mutual NDA**

| NDA Status | *Signed*  |
| :---- | :---- |
| **Date Signed** | *25/03/2026* |
| **Signatories** | *Mike Mgodeli & Reuben John* |

[RTUSA\_NDA with Non Circumvention - Execution Copy - 17.03.2026 - Copy - 3\_17\_26, 8\_57 AM.pdf](https://drive.google.com/file/d/1ajqYlsg0EU500-CUpNgSJIf5fPqZzAFE/view?usp=drive_link)

**2.2 Tactical Project Owner**

The client must appoint a tactical internal owner responsible for co-ordinating workflow documentation, managing dataset preparation, reviewing validation outputs, and providing operational clarification.

*Source: RTUSA-True Aim Workflow Overview meeting, 26/03/2026 (39:21)*

| Name | *Vassen Moodley* |
| :---- | :---- |
| **Role / Title** | Operations Oversight, RTU |
| **Email** | *\[Enter email\]* |
| **Phone** | *\[Enter phone\]* |
| **Availability Confirmed** | *\[Yes / No\]* |

**2.3 Stakeholder Alignment**

*Stakeholders identified from the Workflow Overview meeting on 26/03/2026.*

| Stakeholder | Role / Function | Authority Level | Contact |
| :---- | :---- | :---- | :---- |
| Mike Mgodeli | Business Ops, Commercial Lead | Decision | mike@rtusa.co.za |
| Vassen Moodley | Operations Oversight (RTU) | Decision | *[Vassen Moodley](mailto:vassen@rtusa.co.za)* |
| Steve Cory | Shareholder / Technical Lead | Decision | *steve@oaksure.co.za* |
| Reuben John | True Aim – Project Lead | Advisory / Build | *[rjohn@trueaim.ai](mailto:rjohn@trueaim.ai)* |
| Frederic Brunner | True Aim – Technical | Advisory / Build | fbrunner@trueaim.ai |

*Source: RTUSA-True Aim Workflow Overview meeting, 26/03/2026 (00:00–02:55)*

**3\. Workflow Mapping**

*End-to-end claims workflow as discussed in the Workflow Overview session.*

**3.1 Current Claims Process Flow**

*Captured from Mike Mgodeli’s walkthrough – manual, multi-system, limited tracking.*

| \# | Process Step | System | SLA | Owner |
| :---- | :---- | :---- | :---- | :---- |
| 1 | Policyholder submits digital claim form | Zoho CRM | — | Policyholder |
| 2 | Towing trigger initiates claim (if applicable) | Zoho CRM | — | Consultant |
| 3 | Claim registered on policy admin system | Nimbis | 12 hours | Claims handler |
| 4 | Policy validation (cover, asset, status) | Nimbis | Within step 3 | Claims handler |
| 5 | Claim submitted to insurer claims system | ROC | 4 hours | Claims handler |
| 6 | Assessor appointed on claims system | ROC | 12 hours | Claims handler |
| 7 | Assessor inspects vehicle and submits report | ROC | 48 hours | Assessor |
| 8 | Excess determination – within excess \= notify and close | ROC / Manual | 4 hours | Claims handler |
| 9 | Claims under R50,000 – internal approval | Internal | 4 hours | Claims handler |
| 10 | Claims over R50,000 – QA appointed on ROC | ROC | 4 hours  | Claims handler |
| 11 | QA review and decision (approve/reject) | ROC | 12 hours  | QA |
| 12 | Rejection letter generated (if rejected) | ROC | 12 hours  | QA |
| 13 | Approval – repairer authorised, payment processed | ROC | 48 hours | Claims handler |

*Source: RTUSA-True Aim Workflow Overview meeting, 26/03/2026 (02:55–15:45)*

**3.2 Workflow Walkthrough Recording**

| Video Recording Status | Pending – Mike to record screen walkthrough of assessor managing claims on ROC and Nimbis |
| :---- | :---- |
| **Recording Date** | *\[DD/MM/YYYY\]* |
| **Duration** | *\[HH:MM\]* |
| **Link / Location** | *\[Enter link or file path\]* |

*Source: RTUSA-True Aim Workflow Overview meeting, 26/03/2026 (39:21)*

The walkthrough must cover:

| ☐ | Claim intake from Zoho CRM digital form |
| :---: | :---- |
| ☐ | Policy validation on Nimbis |
| ☐ | Claim registration on Nimbis and submission to ROC |
| ☐ | Assessor appointment process on ROC (drop-down selection) |
| ☐ | Assessor report upload and review on ROC |
| ☐ | QA appointment process on ROC |
| ☐ | Excess determination and claim closure flow |
| ☐ | Communication steps with policyholders/brokers |

**3.3 Workflow Diagram**

*Illustrate stakeholders, system interactions, claim information flow, and decision/escalation points.*

*[RTU Optimised Claims Flow  - Claims Flow.pdf](https://drive.google.com/file/d/1tqlkKNkzfbWV-IT4ntnmDgrPEB27II8o/view?usp=drive_link)*

**3.4 Multi-System Environment**

*Systems identified from the Workflow Overview meeting.*

| System | Function | Data Transfer | Manual Entry? |
| :---- | :---- | :---- | :---- |
| Zoho CRM | Claim intake, digital form management, policyholder communication | Manual | Yes |
| Nimbis | Policy administration – premium collection, amendments, policy validation, claim registration | Manual | Yes |
| ROC | Claims administration – assessor/QA appointment, supplier payment, claims record | Manual | Yes |
| SQL Server | Data warehouse – dumps from ROC and Nimbis for reporting | Automated dump | No |
| Radx | Part sourcing – benchmarking repairer quotes against OEM/alt/secondhand pricing | Manual lookup | Partial |

*Source: RTUSA-True Aim Workflow Overview meeting, 26/03/2026 (02:55–09:23, 31:04–46:27)*

**4\. Identified Pain Points**

*Key operational gaps and inefficiencies raised during the Workflow Overview session.*

| \# | Pain Point | Impact | Raised By |
| :---- | :---- | :---- | :---- |
| 1 | No workflow tracking across systems – manual spreadsheets only | Claims fall through cracks, no visibility | Steve Cory |
| 2 | No SLA breach alerts or automated escalation | Assessors breach 48hr SLA undetected | Mike Mgodeli |
| 3 | No automated reminders to assessors or QA | Delays compound, client frustration | Mike Mgodeli |
| 4 | No client-facing notifications (appointment, approval, rejection) | Poor client experience | Steve Cory |
| 5 | Manual data transfer between Zoho, Nimbis, and ROC | Duplication, errors, time wasted | Mike Mgodeli |
| 6 | Cannot identify which assessors are out of SLA at a glance | Reactive not proactive management | Mike Mgodeli |
| 7 | Claims within excess still require unnecessary approval steps | Slows simple claims | Steve Cory |
| 8 | No leakage monitoring – parts unrelated to accident, cost creep | Financial exposure | Vassen Moodley |
| 9 | Limited fraud detection capability | Insured, repairer, and document fraud undetected | Mike Mgodeli |
| 10 | ROC and Nimbis have no broker/UMA-facing interface | Forces manual workarounds | Steve Cory |

*Source: RTUSA-True Aim Workflow Overview meeting, 26/03/2026 (18:15–31:01)*

**5\. Operational SLA Requirements**

*Internal SLAs confirmed by Mike Mgodeli during the meeting. Insurer/broker SLAs to be confirmed separately.*

| SLA Checkpoint | Target | Source | Automation Action |
| :---- | :---- | :---- | :---- |
| Claim form received to Nimbis registration | 12 hours | Internal RTU SLA | Monitor \+ countdown alerts |
| Nimbis registration to assessor appointment on ROC | 12 hours | Internal RTU SLA | Monitor \+ countdown alerts |
| Assessor appointment to report submission | 48 hours | Internal RTU SLA | Reminders at 36hr, 24hr, breach alert |
| QA appointment to QA decision | 48 hours | Internal RTU SLA | Reminders at 36hr, 24hr, breach alert |
| Claim decision to client notification | 12 hours | Internal RTU SLA | Monitor \+ countdown alerts |
| Approval to payment/repairer authorisation | 48 hours | Internal RTU SLA | Reminders at 36hr, 24hr, breach alert |

*Source: RTUSA-True Aim Workflow Overview meeting, 26/03/2026 (10:00–15:45, 28:29–31:01)*

**6\. Initial Automation Scope**

*Priority areas identified from the meeting. Phase 1 avoids direct Nimbis/ROC integration – workflow tool with manual system updates.*

**6.1 Agreed Phase 1 Approach**

Build a workflow management tool that tracks claim progress end-to-end. Users continue to manually update Nimbis and ROC while the tool manages SLAs, notifications, and visibility. Direct system integration to follow in later phases.

*Source: RTUSA-True Aim Workflow Overview meeting, 26/03/2026 (09:23–14:45)*

**6.2 Automation Area Selection**

| \# | Automation Area | Priority | Data Available? | Selected? |
| :---- | :---- | :---- | :---- | :---- |
| 1 | Workflow tracking and SLA monitoring dashboard | High | Yes (SQL dump) | Yes |
| 2 | Automated assessor/QA reminders and breach alerts | High | Yes | Yes |
| 3 | Automated client communications (status updates) | High | Yes | Yes |
| 4 | Fraud detection module (document analysis) | High | Pending dataset | Yes – modular |
| 5 | Part sourcing price verification (Radx integration) | Medium | Partial | Scoping |
| 6 | Coverage validation checks | Medium | *\[Pending\]* | *\[To confirm\]* |
| 7 | Claim routing – auto-approve under R50k when within excess | Medium | Yes | Scoping |

*Source: RTUSA-True Aim Workflow Overview meeting, 26/03/2026 (22:30–27:55, 31:04–46:27)*

**7\. Decision Routing Framework**

*Decision routing principles discussed – detail to be refined once dataset is received.*

| Bucket | Description | Threshold | Override Rule |
| :---- | :---- | :---- | :---- |
| Within Excess | Claim value within policyholder excess – notify and close | Predefined excess | Steve: should not need human approval |
| Under R50k | Internal approval without QA referral | R50,000 | *\[To be confirmed\]* |
| Over R50k | QA appointment required on ROC | R50,000+ | Mandatory QA review |
| Fraud Flagged | Routed to investigation before any decision | Fraud module score | *\[To be defined\]* |

*Source: RTUSA-True Aim Workflow Overview meeting, 26/03/2026 (32:30–33:55)*

**Acceptable Error Categories**

| Acceptable Error Types | *\[To be defined once fraud module is scoped\]* |
| :---- | :---- |
| **Unacceptable Error Types** | *\[To be defined\]* |
| **Error Escalation Path** | *\[To be defined\]* |

**8\. Fraud Detection & Part Sourcing**

*Critical modules discussed during the meeting – modular, customisable based on RTUSA claim documents.*

**8.1 Fraud Detection Module**

| Module Status | Scoping – True Aim to send demo video |
| :---- | :---- |
| **Fraud Types to Cover** | Insured fraud, repairer fraud, document manipulation |
| **Input Documents** | Accident reports, police reports, photos, repair invoices |
| **Customisation Basis** | Based on RTUSA’s specific claim document set |
| **Modular?** | Yes – can be added/removed like a Lego block (Reuben) |
| **Demo Video** | *\[Pending from Reuben John\]* |

*Source: RTUSA-True Aim Workflow Overview meeting, 26/03/2026 (40:14–44:45)*

**8.2 Radx Part Sourcing Integration**

| Platform | Radx – RTUSA’s part sourcing solution |
| :---- | :---- |
| **Function** | Compares repairer quotes against benchmark prices (OEM, alternate, secondhand) |
| **Current Process** | Manual lookup – assessors adjust based on Radx output |
| **Automation Opportunity** | Automated price reasonableness checks, flagging overpricing |
| **Integration Status** | Scoping – True Aim to assess how to automate lookup |

*Source: RTUSA-True Aim Workflow Overview meeting, 26/03/2026 (31:04–46:27)*

*Sample Radx pricing file, when a quotation is submitted, the pricing is looked up against this for OEM, and 2nd hand/Alternative manually confirmed, this is the check for the assessor to base their pricing off, ie if repairer quote is more expensive, only use the Radx pricing.*

[Radx Parts Pricing Engine - Master List.xlsx](https://docs.google.com/spreadsheets/d/1A7RZ9HaIT9vWkv4V-EBcjyS-oAlAbH_z/edit?usp=drive_link&ouid=112027149472820206498&rtpof=true&sd=true)

**9\. System Access Model**

*Access confirmed as constrained by legacy systems. Phase 1 \= no direct integration.*

| Tier | Description | Selected? |
| :---- | :---- | :---- |
| Tier 1 – Data Export | SQL Server dump from ROC/Nimbis, manual upload where needed | Yes (Phase 1\) |
| Tier 2 – Read-Only API | Auto-retrieve from Nimbis/ROC – requires integration work | Future phase |
| Tier 3 – Sandbox Access | Test environment, max delivery speed | Not available currently |

*Source: RTUSA-True Aim Workflow Overview meeting, 26/03/2026 (09:23–14:45)*

| Access Notes | ROC and Nimbis are insurer legacy systems – RTUSA tied to these for foreseeable future with Renasa |
| :---- | :---- |
| **SQL Server** | RTUSA has own SQL Server with data dumps from ROC and Nimbis |
| **Integration Constraints** | Nimbis integration will take time – accepted as later phase |
| **Assessor/QA List** | Fixed list managed in ROC – Mike to share with True Aim |

**10\. Dataset Requirements**

*Minimum 50 historical claims required. Recommended: \~45% approved, \~45% rejected, \~10% edge cases.*

**Dataset Composition**

| Category | Target % | Actual Count | Status |
| :---- | :---- | :---- | :---- |
| Approved claims | \~45% | *\[Count\]* | *\[Pending\]* |
| Rejected claims | \~45% | *\[Count\]* | *\[Pending\]* |
| Edge cases | \~10% | *\[Count\]* | *\[Pending\]* |
| **TOTAL** | 100% | ***\[Total\]*** |  |

**Data Elements Checklist**

| ☐ | Claim documentation (forms, photos, reports) |
| :---: | :---- |
| ☐ | Decision outcome (approved/rejected/within excess) |
| ☐ | Decision reasoning and rejection codes |
| ☐ | Payout amount and calculation details |
| ☐ | Assessor reports |
| ☐ | Radx part sourcing output (if available) |

**Supporting Operational Data**

*Metrics identified during the meeting – exact values to be supplied by Vassen Moodley.*

| Metric | Value |
| :---- | :---- |
| Monthly claim volume | Est. 80–100 (what information is required?) |
| Handler/assessor structure | *\[Pending from Vassen\]* |
| Average handling time per claim | *\[Pending from Vassen\]* |
| Approval vs rejection rate | *\[Pending from Vassen\]* |
| Average payout values | *\[Pending from Vassen\]* |
| Most common rejection reasons | *\[Pending from Vassen\]* |
| SLA compliance rate | *\[Pending – not currently tracked\]* |
| Leakage / cost trending | *\[Pending from Vassen\]* |

*Source: RTUSA-True Aim Workflow Overview meeting, 26/03/2026 (48:00–49:08)*

**11\. Success Metrics**

*Agreed measures of success – operationally meaningful. Metrics to be baselined once data received.*

| Metric | Baseline | Target | Measurement Method |
| :---- | :---- | :---- | :---- |
| SLA compliance rate (per step) | *\[Not tracked\]* | *\[To define\]* | Dashboard monitoring |
| Assessor report turnaround | *\[Not tracked\]* | \< 48 hours | Automated SLA tracking |
| Claims within excess – auto-close rate | *\[Manual\]* | *\[To define\]* | System routing |
| Manual touches per claim | *\[High\]* | Reduction TBC | Workflow audit |
| Client notification turnaround | *\[Manual/slow\]* | Automated | System timestamps |
| Fraud detection rate | *\[None\]* | *\[To define\]* | Fraud module output |
| Claims leakage (cost creep) | *\[Not monitored\]* | *\[To define\]* | Radx \+ analytics |

**12\. Phase 0 Deliverables Tracker**

*Master tracker – updated from action items agreed in the 26/03/2026 meeting.*

**Governance**

| Deliverable | Status | Owner | Due Date | Notes |
| :---- | :---- | :---- | :---- | :---- |
| Signed mutual NDA | **Not Started** |  |  |  |
| Assigned tactical project owner | **Not Started** | Mike |  | Likely Vassen |

**Workflow Documentation**

| Deliverable | Status | Owner | Due Date | Notes |
| :---- | :---- | :---- | :---- | :---- |
| Word document with detailed process data | **In Progress** | Mike |  | \~90% complete |
| Screen-recorded video walkthrough (ROC \+ Nimbis) | **Not Started** | Mike |  | Assessor workflow |
| Workflow diagram (system interactions) | **Completed** |  |  |  |
| Process flow docs (stage, SLA, interaction logging) | **Not Started** | Vassen |  | For management tool |

**System & Data**

| Deliverable | Status | Owner | Due Date | Notes |
| :---- | :---- | :---- | :---- | :---- |
| Fixed list of assessors (email/phone) | **Not Started** | Mike |  | From ROC |
| Operational metrics list for dashboard | **Not Started** | Vassen |  | SLA, leakage, cost |
| Minimum 50 historical claims | **Not Started** |  |  |  |

**True Aim Deliverables**

| Deliverable | Status | Owner | Due Date | Notes |
| :---- | :---- | :---- | :---- | :---- |
| Fraud module demo video | **Not Started** | Reuben |  | Short 1–2 min demo |
| Review Word doc \+ video upon receipt | **Not Started** | Reuben |  | Before next workshop |
| Follow-up workshop (all core teams) | **Not Started** | Reuben |  | After digesting RTU inputs |

**13\. Notes & Decision Log**

*Key decisions and notes captured from the Workflow Overview meeting and ongoing.*

| Date | Decision / Note / Action | Owner | Status |
| :---- | :---- | :---- | :---- |
| 26/03/2026 | Phase 1 will not integrate directly with ROC/Nimbis – workflow tool with manual updates | All | Agreed |
| 26/03/2026 | Claims within excess should auto-close without human approval (Steve) | Steve | Agreed |
| 26/03/2026 | Fraud module is modular – add/remove as needed. Customised to RTU’s document set | Reuben | Agreed |
| 26/03/2026 | Core claim number \= ROC SPM number – used throughout all systems | Mike | Confirmed |
| 26/03/2026 | RTUSA tied to ROC and Nimbis for foreseeable future with Renasa | Mike | Confirmed |
| 26/03/2026 | Reuben to send fraud module demo video | Reuben | Open |
| 26/03/2026 | Mike to complete Word doc (\~40% done) and send with video walkthrough | Mike | Open |
| 26/03/2026 | Vassen to supply process flows, operational metrics, and KPI list | Vassen | Open |
| *\[DD/MM/YYYY\]* | *\[Enter note\]* | *\[Name\]* | *\[Open / Closed\]* |
| *\[DD/MM/YYYY\]* | *\[Enter note\]* | *\[Name\]* | *\[Open / Closed\]* |
| *\[DD/MM/YYYY\]* | *\[Enter note\]* | *\[Name\]* | *\[Open / Closed\]* |

**14\. Document & Process Embed Register**

*Central register of all embedded or linked documents and processes.*

| \# | Document / Process | Section | Format | Attached? |
| :---- | :---- | :---- | :---- | :---- |
| 1 | Mutual NDA | 2.1 | PDF | Yes |
| 2 | Workflow walkthrough video | 3.2 | Video / Link | No – Pending Mike |
| 3 | Workflow diagram | 3.3 | Visio / PDF / Image | Yes |
| 4 | SLA source documents | 5 | PDF / Doc | No |
| 5 | Fraud module demo video | 8.1 | Video / Link | No – Pending Reuben |
| 6 | Radx documentation | 8.2 | PDF / Doc | Yes |
| 7 | Dataset files (50+ claims) | 10 | CSV / Excel / Export | No |
| 8 | Assessor contact list (from ROC) | 9 | Excel / CSV | No – Pending Mike |
| 9 | Vassen’s process flow docs | 3.2 / 5 | PDF / Doc | No – Pending Vassen |
| 10 | Word doc with detailed process data | 3.1 | DOCX | No – \~90% complete |
| *\[11\]* | *\[Add more as needed\]* |  |  |  |

