# Helfa mobile (Expo)

The mobile-first companion to the Helfa backend. Per the Phase 5 migration
plan this is the primary user-facing surface; `frontend-web/` is the
desktop-companion thin client.

## Stack
- Expo SDK 54 + expo-router (file-based routing)
- React Native 0.81 + React 19
- TanStack Query for server state
- Zustand for the auth store
- axios + expo-secure-store for the JWT
- TypeScript everywhere

## Run it locally
```sh
cd frontend-mobile
npm install
npm start             # Metro bundler + QR code
# in another shell, on a real phone with Expo Go:
#   scan the QR
# or run an emulator:
npm run ios           # macOS only
npm run android
npm run web           # browser preview
```

The default API base URL is the deployed Railway backend
(`https://immigration-helper-production.up.railway.app/api/v1`); it lives
in `app.json`'s `expo.extra.apiBaseUrl`. To point at a local backend,
edit that field to `http://10.0.2.2:8080/api/v1` for Android emulator or
`http://localhost:8080/api/v1` for iOS simulator.

## Screens (current)
- `app/(auth)/login.tsx`, `register.tsx`
- `app/onboarding.tsx` — 6-step wizard (mirrors web)
- `app/(tabs)/tasks.tsx` — primary loop, filterable
- `app/task/[id].tsx` — detail with Complete + Skip
- `app/(tabs)/marketplace.tsx` — partner cards
- `app/(tabs)/settings.tsx` — logout + version

## Not yet implemented (future sessions)
- Document vault (upload/list)
- Postpone with date picker (currently date-text-input only on web)
- Push notifications via FCM/APNS
- Stripe checkout web-view
- Offline cache + optimistic updates beyond TanStack defaults

## File-based routing reference
```
app/
  _layout.tsx            ← auth gate + React Query provider
  index.tsx              ← smart router (onboarding vs tasks)
  onboarding.tsx
  (auth)/
    _layout.tsx          ← Stack with no header
    login.tsx
    register.tsx
  (tabs)/
    _layout.tsx          ← Tabs nav
    tasks.tsx
    marketplace.tsx
    settings.tsx
  task/
    [id].tsx             ← dynamic route
```
