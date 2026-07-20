# Class-Based Voting with Token Codes

Multiple elections run in parallel. Each class has a unique token. Students enter the token to unlock voting for that class. Voting eligibility is enforced at vote time.

## Database changes (new migration)

New table `public.classes`:
- `name` (e.g. "B.Tech 3rd Year - CSE-A")
- `token` (unique, uppercase, e.g. "CS3A-2026")
- `deadline` (timestamptz)
- `is_active` (bool)

Modify existing tables:
- `candidates`: add `class_id` (FK → classes.id, NOT NULL going forward)
- `votes`: add `class_id`; replace the current single-vote-per-student unique with `UNIQUE(student_id, class_id)` so a student can vote once **per class** they belong to.
- `students.has_voted`: keep column but ignore it (voting eligibility now comes from the `votes` table per class). Existing "prevent has_voted update" trigger stays.

Update `increment_votes_trigger`:
- Check "already voted in this class" via `votes` (not `students.has_voted`).
- Stop toggling `students.has_voted`.

Update `restart_voting(_class_id uuid, _new_deadline)`:
- Scope reset to a single class: delete that class's votes, zero its candidates' vote counts, set that class's deadline + is_active.

Deprecate global `election_settings` deadline/is_active/name in favor of per-class fields (keep row for backward-compat but stop reading it).

RLS + GRANTs:
- `classes`: everyone (anon + authenticated) can SELECT (needed to look up token). Only admins INSERT/UPDATE/DELETE.
- `candidates`: policies stay public-read; admin write policies extended to require `class_id` match.
- `votes`: student may INSERT only if `class_id` matches an active, not-past-deadline class; existing admin/self select policies stay.

## Frontend changes

New hook `useClasses()` — list classes (admin) / lookup by token (student).

New hook `useClassAccess()`:
- Reads verified class from `sessionStorage` (`vyc_class_id`).
- Provides `verifyToken(token)` → validates against `classes` table, stores class id.
- Provides `clearClass()`.

Student flow (`/candidates`):
- If no verified class in session → show "Enter Class Token" gate before candidates list.
- Once verified → fetch candidates filtered by `class_id`, show class name + deadline banner.
- Voting checks: token verified AND class active AND deadline not passed AND not already voted for this class (via `votes` lookup).
- `useVoting` sends `class_id` with the insert; `hasVoted` becomes a `votes` lookup per class instead of `profile.has_voted`.

`Results` page:
- Same token gate, or a class picker for admins; shows results for selected class only.

Admin panel (`/admin`):
- New "Classes" section: list, create (name + auto/manual token + deadline), edit, delete, toggle active, restart (per-class).
- Candidate management gets a required "Class" dropdown; candidates list filters by selected class.
- Old global "Voting Active" toggle + "Election Name" fields removed (replaced by per-class controls).

Navbar / Index: keep as-is; election name shown on candidates page becomes the selected class name.

## Data migration

Existing candidates/votes belong to no class. Migration creates one default class ("Legacy Election", token `LEGACY-2026`, inherits current deadline) and assigns all existing candidates/votes to it so nothing breaks.

## Out of scope

- No class rosters of enrollment numbers — the token itself is the gate (per your choice).
- No email/SMS distribution of tokens; admin shares the token out-of-band.
- No per-class admin roles; all admins manage all classes.
