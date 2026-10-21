# Board brief: Citadino

This brief stands on its own. The board members cannot see the conversation with the founder.

## The idea

- What it is: a mobile-first, multi-tenant web platform (PWA) to run municipal futsal championships end to end: team and athlete registration (coaches self-register, athletes join via invite link/QR code), live match sheets with minute-by-minute events, automatic standings (round-robin or groups + knockout bracket), top-scorer ranking with yellow-card accumulation and suspension flags, athlete public profiles, a "best player of the round" poll, the championship rules as a PDF, and push notifications per category or team (no login needed for fans).
- Who it is for: municipal governments in Brazil (prefeituras) and their sports departments (secretarias de esporte) that organise the city's futsal championship. End users are the organiser's staff (admin panel), coaches (coach panel to manage their squads, documents and proof of residence), athletes (public profile) and the local public following the games (public feed styled like Sofascore, light/dark theme).
- What it sells, at what price: the hosted platform, one tenant (subdomain/path) per championship or city, with a super-admin to manage many tenants. First signed contract: R$ 500/month for 12 months (R$ 6,000/year) with one municipality. The general pricing model for further cities is not defined yet.
- Where and how: Brazil, online. Sold directly to municipalities. Fans, coaches and athletes reach the public site through the championship itself (the organiser publishes the link). The product is already built and working (Next.js 16, Prisma, Auth.js with ADMIN/COACH roles, web push, file uploads for athlete documents and rules PDFs, visual identity adapted per municipality).
- Budget and constraints: one paid contract signed (R$ 500/month, 12 months) with a municipality for a championship that starts in a few days. The live match sheet is filled in during games by the championship organiser (the municipality's person responsible for the app), not by the founder. No other budget, team size, runway or revenue figures were stated. Assume a solo or very small founding team unless stated otherwise.

## Facts the founder did NOT provide (treat as open questions, do not invent)

- Number of municipalities in the target market and how they buy software (procurement rules, bidding thresholds, who signs).
- Existing competitors or substitutes (spreadsheets, WhatsApp groups, generic tournament apps, federation systems).
- Cost to acquire a municipal customer and the sales cycle length.
- Hosting and support costs per tenant.
- Whether the founder works on this full time.
