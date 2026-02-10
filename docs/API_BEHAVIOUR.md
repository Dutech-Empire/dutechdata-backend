# DutechData API Behavior — Phase I

## Core Principles
- Server is the single source of truth
- Clients never mutate wallet or data balances
- Every balance change creates a ledger transaction
- Calm UX, no dark patterns

## Core Features

### User Entry
- Users are identified by phone (OTP later)
- First entry creates user
- Repeated entry returns same user

### Buy Data
- Client sends bundle ID only
- Wallet is debited first
- Borrowed MB is auto-repaid
- Remaining MB is credited as usable
- Reserved MB is untouched

### Earn Data
- Small MB rewards
- Daily cap enforced server-side
- Ledger-backed credits
- No abuse loops

### Emergency Borrow MB
- Allowed only at 0 usable MB
- Fixed borrow amount
- One borrow at a time
- Treated as debt
- Auto-repaid on next purchase

## Ethics & Trust
- No OS-level tracking claims
- No hidden rules
- No fake rewards
- Transparency over growth hacks
