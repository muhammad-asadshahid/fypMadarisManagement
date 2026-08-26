# Firestore Schema — Madaris Management System

This project uses **Cloud Firestore** (NoSQL, part of Firebase) as its database. Each
"table" below is a Firestore **collection**. Every collection is a flat list of
documents; related data is linked by storing the referenced id as a field.

All access goes through the module services in `src/modules/*`. Each service exports a
Firestore-backed implementation when Firebase is configured and a mock fallback otherwise.

---

## Collection map (by Functional Requirement)

| FR | Requirement | Collection(s) |
|----|-------------|---------------|
| 1  | Authentication | `users` |
| 2  | Student management | `students`, `classes` |
| 3  | Teacher management | `teachers` |
| 4  | Attendance | `attendance` |
| 5  | Hifz | `hifzRecords` |
| 6  | Nazra | `nazraRecords` |
| 7  | Dars-e-Nizami | `darsProgressRecords`, `kitab` |
| 8  | Asri Taleem | `subjects`, `marksRecords`, `promotions` |
| 9  | Hostel | `hostelRooms`, `hostelAllocations`, `mealRecords`, `visitorRecords` |
| 10 | Parent monitoring | read-only across `attendance`/`hifzRecords`/`nazraRecords`/`feeRecords` |
| 11 | Donation | `donors`, `donations`, `zakatDistributions` |
| 12 | Salary | `salaryPayments` |
| 13 | Fees | `feeRecords` |
| 14 | Reports | aggregate reads across all collections (see `src/modules/reports/service.ts`) |

---

## Collection: users (FR #1)

Holds every login account. Role controls the navigation the account can access.

| Field | Type | Notes |
|-------|------|-------|
| id | string | e.g. `usr-admin` |
| email | string | lowercase, unique |
| password | string | plain text in this prototype; move to Firebase Auth for production |
| fullName | string | |
| role | "admin" \| "teacher" \| "parent" | role-based access |
| teacherId | string? | set when role=teacher |
| parentStudentIds | string[]? | set when role=parent; ids from `students` |

## Collection: classes (FR #2)

| Field | Type |
|-------|------|
| id | string |
| name | string |
| programType | "noorani_qaida" \| "nazra_quran" \| "hifz_ul_quran" \| "dars_e_nizami" \| "asri_taleem" |

## Collection: students (FR #2)

| Field | Type | Notes |
|-------|------|-------|
| id | string | |
| name, fatherName | string | |
| dateOfBirth, admissionDate | string | `YYYY-MM-DD` |
| address, contactNumber | string | |
| programType | ProgramType | |
| classId | string | FK → `classes` |
| hostelStatus | boolean | |
| photoUri | string? | uploaded student photo |
| email, password | string? | guardian login when parent account created |
| bFormCnic, city, guardianEmail, guardianMobile | string? | |
| createdAt, updatedAt | string | ISO |

## Collection: teachers (FR #3)

| Field | Type |
|-------|------|
| id | string |
| name, contactNumber | string |
| subjects | string[] |
| salary | number |
| classIds | string[] (FK → classes) — drives workload view |

## Collection: attendance (FR #4, #10)

One document per student per day.

| Field | Type | Notes |
|-------|------|-------|
| id | string | |
| studentId | string | FK → `students` |
| classId | string | FK → `classes` |
| date | string | `YYYY-MM-DD` |
| status | "present" \| "absent" \| "leave" | |
| teacherId | string | who marked it |
| note | string? | |
| markedAt | string | ISO |

Service API: mark today (batch per class), history per student, monthly report counts.

## Collection: hifzRecords (FR #5, #10)

| Field | Type | Notes |
|-------|------|-------|
| id | string | |
| studentId | string | FK → `students` |
| date | string | `YYYY-MM-DD` |
| sabaq | string | new lesson |
| sabaqi | string | revision |
| manzil | string | manzil recited |
| mistakeCount | number | |
| grade | "mumtaz" \| "jayyid_jiddan" \| "jayyid" \| "needs_improvement" | quality grading |
| teacherId | string | |
| note, createdAt | string? / ISO | |

## Collection: nazraRecords (FR #6, #10)

| Field | Type | Notes |
|-------|------|-------|
| id | string | |
| studentId | string | |
| date | string | |
| pageFrom, pageTo | number | page progress |
| fluency | number | 0–100 |
| remarks | string? | |
| completionPercentage | number | 0–100 |
| teacherId, createdAt | string | |

## Collection: darsProgressRecords (FR #7)

| Field | Type |
|-------|------|
| id | string |
| studentId | string |
| kitabId | string (FK → `kitab`) |
| date | string |
| chaptersCompleted | number |
| pagesCovered | number |
| takrarAttendance | boolean |
| teacherId, note, createdAt | string |

## Collection: kitab (FR #7)

| Field | Type |
|-------|------|
| id | string |
| name | string |
| totalChapters | number |

## Collection: subjects (FR #8)

| Field | Type |
|-------|------|
| id | string |
| name | string |
| programType | string |

## Collection: marksRecords (FR #8)

| Field | Type |
|-------|------|
| id | string |
| studentId | string |
| subjectId | string (FK → `subjects`) |
| classId | string |
| examType | "mid_term" \| "final" |
| marksObtained, totalMarks | number |
| date, teacherId, createdAt | string |

Results and pass/fail are computed from these records via
`asriTaleemService.generateResults()`. Promotion writes to `promotions`.

## Collection: promotions (FR #8)

| Field | Type |
|-------|------|
| id | string |
| studentId | string |
| fromClassId, toClassId | string |
| promotedAt, promotedBy | string |

## Collection: hostelRooms / hostelAllocations (FR #9)

`hostelRooms`: `{ id, name, capacity, createdAt }`
`hostelAllocations`: `{ id, studentId, roomId, assignedAt }` — occupancy = count per roomId.

## Collection: mealRecords / visitorRecords (FR #9)

`mealRecords`: `{ id, studentId, roomId, date, mealType, notes? }`
`visitorRecords`: `{ id, studentId, visitorName, visitDate, notes? }`

## Collection: donors / donations / zakatDistributions (FR #11)

`donors`: `{ id, name, contactNumber?, category }`
`donations`: `{ id, donorId, amount, category, month?, date, note? }`
`zakatDistributions`: `{ id, donationId, studentId, amount, date, note? }`

## Collection: salaryPayments (FR #12)

`{ id, teacherId, amount, month, date, note? }`

## Collection: feeRecords (FR #13, #10)

`{ id, studentId, month, amount, paid, date, note? }` — parents see `paid` per month.

---

## Adding a new collection

1. Define the interface in `src/types/index.ts`.
2. Create `src/modules/<feature>/service.ts` with a `Firestore<Feature>Service`
   and a `Mock<Feature>Service`, both implementing one shared interface.
3. Export a const that picks the Firestore impl when `FIREBASE_CONFIGURED && db`.

Firestore does not require column DDL — a collection is created the first time a
document is written, or seeded via `src/lib/seed.ts`.