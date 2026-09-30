# Security and operational boundary

Never commit CMC keys. Set CMC_API_KEY privately in .env.local for development and as a hosted secret for production. If exposed, rotate it at CMC immediately. Raw response evidence does not contain request headers.

Authentication is dispatch-owned ChatGPT sign-in. Private API reads/writes bind the server-authenticated user ID. The public sample does not access anyone’s private workspace. Origin checks protect authenticated mutations and revision checks detect competing saves. Exported HTML escapes user input. CSV imports are bounded to 16 KB and 50 lots.

Local development simulates one identity only on loopback. It is not proof of two independent hosted identities. Production isolation requires a trusted Sites dispatch boundary. No seed phrases, signing permissions or bank credentials are collected.

Report exports include treasury inputs. Store and share them as financial records. The hackathon release does not expose a bulk account deletion control or implement a formal retention policy; those are commercial-launch dependencies. No regulatory, accounting or solvency certification is claimed.

Report a security issue privately to the repository owner through GitHub. Do not publish credentials or sensitive user data in an issue.
