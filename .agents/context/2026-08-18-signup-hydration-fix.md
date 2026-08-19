# Signup hydration fix

- When the browser lost the Next.js HMR connection or ran stale client code, React did not hydrate and the browser submitted the form natively.
- Credential inputs intentionally have no `name` attributes, so the browser cannot serialize their values into a native URL or server request if hydration is unavailable.
- Both auth forms now call `preventDefault()` synchronously in their React component and pass only plain state data to their hook.
- `useSignUp` and `useLogin` own Supabase calls, loading state, redirects, error handling, and Sonner feedback.
- Supabase remains a single browser client exported from `hooks/supabase.ts`.
