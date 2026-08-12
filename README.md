# DRAXIS Client Portal

Everyday employee workspace for DRAXIS. Light theme. CRM feel. **Not** the Admin intelligence console.

Admin is the eye in the dark. Client is the desk in the light.

## Admin vs Client

| | **DRAXIS Admin** (`drenix-draxis`) | **DRAXIS Client** (this app) |
|---|---|---|
| Audience | Owners, super admins, Head HR / Head Safety guests | Employees (accounts issued by Head HR / Head Safety) |
| Theme | Dark control UX | Light CRM UX |
| Scope | Company-wide Command Center, peer comparison, RingCentral dumps, SMS threads, cameras / monitoring (roadmap), employee CRUD | **My** day, **my** KPIs, **my** leads (HR), **my** profile |
| Forbidden here | — | Cameras, break warnings, talk dumps, chat spy, salaries of others, admin access approval |

## Stack

- Next.js App Router + TypeScript
- TanStack Query
- Chart.js (`react-chartjs-2`)
- `react-day-picker` + `date-fns`
- Tailwind CSS v4 with light design tokens
- Laravel Sanctum Bearer via `NEXT_PUBLIC_API_URL` (same API host as Admin)

## Setup

```bash
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Auth storage

Client-specific keys (do not collide with Admin’s `draxis_token` on the same browser origin):

- `draxis_client_token` — Sanctum bearer
- `draxis_client_user_type` — `employee`
- `draxis_client_employee` — cached profile JSON

## APIs this app expects

Verified against `drenix-draxis-backend` (paths match; Winston Smith HR seed works).

Admin also has `/admin/login` and `/access/login`. Client uses employee Sanctum only:

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/employee/login` | `{ username, password }` → `{ data: { token, user_type: "employee", employee } }` |
| `POST` | `/employee/logout` | Invalidate token |
| `GET` | `/me/profile` | Name, phone, email, shift, department, company, position |
| `POST` | `/me/password` | `{ current_password, password, password_confirmation }` |
| `GET` | `/me/metrics?from=&to=` | Self KPI totals (calls, talk minutes, text counts, Monday counts) |
| `GET` | `/me/metrics/daily?from=&to=` | Daily series for charts |
| `GET` | `/me/leads?from=&to=` | HR-only leads attributed to the authenticated employee |

### Hard server-side rules

An employee token must **not** be able to call:

- `/users/{otherId}/…`
- `/companies/{code}/hr/analytics`
- Admin/access management routes

Until `/me/*` exists, pages show clear empty/error states naming the missing endpoint.

### Password change note

`POST /me/password` revokes all employee tokens. Client clears local session and redirects to `/?passwordUpdated=1`.

### Suggested employee shape (client-safe)

```json
{
  "id": 1,
  "username": "j.smith",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "...",
  "email": "...",
  "shift": "morning",
  "department": "hr",
  "position": "Recruiter",
  "company": "JM"
}
```

Do **not** return salary, charges, close-monitor flags, or admin roles to this portal.

## Date periods

Same calendar rules as Admin (`src/utils/date-ranges.ts`):

- **Day** — today → today  
- **Week** — Monday of this week → today  
- **Month** — 1st of this month → today (not rolling 30 days)  
- **Year** — Jan 1 → today  
- **Custom** — picked `from` / `to`

## Routes

| Path | Who | What |
|------|-----|------|
| `/` | Public | Login |
| `/my-day` | All employees | Greeting, shift, self KPIs |
| `/performance` | All employees | Self charts |
| `/leads` | HR only | My leads + detail drawer |
| `/profile` | All employees | Profile + password change |
| `/help` | All employees | Product boundaries |

## Explicitly out of scope (V1)

- Full RingCentral call lists / recordings / SMS thread content
- Company lead boards, driver enrichment
- Cameras, Face ID, desk green/red, break warnings
- Peer leaderboards
- Creating/editing other employees
- Dark DRAXIS eye-loading brand

## Project layout

```
src/
  app/                 # App Router pages + light tokens
  components/          # Auth, Layout, FormItems, MyDay, Performance, Leads, Profile
  hooks/               # TanStack Query wrappers
  lib/                 # api client, auth storage, types
  utils/               # date ranges, formatters
```
