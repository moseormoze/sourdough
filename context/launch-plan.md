# Launch Plan

> **Status (2026-07-05)**: Phase 0 (Deploy) הושלם — האפליקציה חיה ב-Vercel עם PostHog. Phase 1 (Self-test) הושלם בפועל — כמה בייקים אמיתיים עם איטרציות שיפור. **Phase 2 (Closed beta) מדולג בהחלטה** — אין מאגר חברים שיאפו איתה. הבא: **Phase 3 (Open beta)** — פוסט בקבוצות מחמצת בפייסבוק. שער לפוסט: פיצ'ר `21-open-beta-onboarding` (זיהוי משתמשים דרך PostHog identify + חוויית התקנה למסך הבית). עדיין ללא auth וללא דאטה בצד שרת — הכל ב-`localStorage`.

מסמך זה מתעד את **התכנית של איך לקחת את האפליקציה ממקומית-בלבד למוצר משלם**, את ה-**מחסנית הטכנית** שתשרת את התכנית, ואת **הסדר של מה להוסיף מתי**. הוא לא תכנית מוצר — לזה יש [`vision.md`](./vision.md) ו-[`goals.md`](./goals.md).

## The 5 Phases

| # | Phase | What | Entry criteria | Exit criteria |
|---|---|---|---|---|
| **0** | **Deploy** | להעלות את האפליקציה ל-Vercel + analytics | MVP end-to-end עובד מקומית | URL חי, deploy אוטומטי מ-`main`, PostHog רושם events |
| **1** | **Self-test** | המפתח (Eilon) אופה לפחות 1-2 בייקים שלמים עם האפליקציה | Phase 0 done | רשימת פערים מתועדת + תוקנה |
| **2** | **Closed beta** | 5-10 חברים/משפחה אופים איתה | Phase 1 done | פידבק מ-3+ משתמשים פעילים + iteration קטן |
| **3** | **Open beta** | פוסט בקבוצת פייסבוק → 50-100 משתמשים אקראיים | Phase 2 done | testimonials/reviews, engagement data, מצא bugs רחבים |
| **4** | **Partnership** | פנייה למדריך סדנאות מוכר עם traction data | Phase 3 done | shipping deal — מדריך מסכים להציע לסטודנטים שלו |
| **5** | **Monetize** | trial של 14 יום → subscription | Phase 4 done **או** Phase 3 שירותי | ראשונה משלמת על subscription |

**הערה חשובה על הסדר**: בנושא ההצעה למדריך, **קודם Phase 3 (open beta) ואז Phase 4 (partnership)**, לא הפוך. הסיבה: עם traction data ביד, השיחה עם המדריך עוברת מ-״יש לי רעיון״ ל-״הנה N משתמשים happy, הנה engagement״. עמדת כוח שונה לחלוטין.

## Tooling Stack

עיקרון: **חינם עד שיש סיבה אמיתית לשלם**. כל שירות נכנס רק כשהפיצ׳ר שצריך אותו מגיע.

| שכבה | בחירה | מתי להוסיף | חינם עד | למה הבחירה הזו |
|---|---|---|---|---|
| **Hosting** | Vercel | Phase 0 | ~100GB bandwidth/חודש | תאימות 100% עם Next.js (אותו צוות), zero-config, KV/Postgres natively. חיסרון: vendor lock-in קל; ניתן לעקור ל-Cloudflare Pages או Fly.io במידת הצורך |
| **Analytics** | PostHog | Phase 0 (יום ראשון של deploy) | 1M events/חודש | Product analytics + session replays + feature flags + A/B tests בחבילה. Plausible נחמד אבל רק pageviews — אנחנו צריכים events ספציפיים (״סיים שלב X״, ״בחר שיטה Y״) |
| **Error tracking** | Sentry | Phase 1-2 (אופציונלי) | 5k errors/חודש | סטנדרט. מתחבר ל-Next.js תוך 5 דקות |
| **Auth + DB** | **Supabase** | Phase 4 (התחלת monetization) | 500MB DB, 50k MAU | Auth + Postgres באותו שירות. Postgres תקני (לא vendor-specific) — קל לעקור. RLS = security דרך DB. דחיית Clerk כי: $25/חודש אחרי 10k MAU + עוד DB נפרד = יותר תלויות |
| **Payments** | Stripe | Phase 5 | 0 (2.9% מהעסקאות) | סטנדרט תעשייתי. תומך ב-ILS + Stripe Tax מטפל ב-VAT 17% אוטומטית |
| **Email** | Resend | Phase 5 (טרנזקציוני) | 100 emails/יום | API פשוט, מחיר זול, dev experience טוב |

### Important: when does `localStorage` → server-side DB happen?

**Phase 4** — כשאנחנו מוסיפים Auth, אנחנו גם מעבירים את ה-data לתוך Supabase. ב-Phase 4 כל בייקר שיוצר חשבון מקבל גם:
- Migration flow: ״עכשיו תיכנס וה-recipes שלך יזרמו ל-cloud״
- Multi-device sync (אופציונלי)
- Backup אוטומטי

עד אז, `localStorage` עובד מצוין. כל בייקר על המכשיר שלו, אין צורך להתחבר, אין anxiety של ״איפה הנתונים שלי״.

## Cost Trajectory

| Phase | Users | Monthly cost | Notes |
|---|---|---|---|
| **0-3** | 0-100 | **$0** | הכל ב-free tier |
| **4-5** | 100-1000 משלמים @ ~$5/חודש → revenue $5k-25k/year | **$65-100** | Vercel Pro + Supabase Pro + Resend. בטל ביחס להכנסה |
| **6+** | 1000+ | **$200-500** | אופציה לעקור Vercel ל-Cloudflare/Fly.io לחיסכון של 30-50% |

עד $500/חודש זה לא דורש decision של עזיבת מחסנית. מעבר לזה — נשקול.

## Pre-Launch Checklist (Phase 0 → 1)

### Phase 0 — Deploy
- [ ] Vercel account + connect git repo
- [ ] Deploy from `main` branch
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` env var
- [ ] PostHog SDK installed + capture page views + key events
  - Events to track from day 1: `bake_started`, `stage_advanced` (with `from`/`to`), `bake_completed`, `bake_abandoned`, `recipe_created`
- [ ] Domain (or Vercel subdomain) — `kikar.{something}` או `vercel.app` מספיק להתחלה
- [ ] Basic PWA manifest.json + icons (so it installs to home screen)

### Phase 1 — Self-test
- [ ] בייק שלם אחד, מתחילה עד סוף, עם תיעוד פערים (notes app / Notion)
- [ ] תיקון פערים שמתגלים
- [ ] In-app feedback button (״ספר לנו״) — שולח email/Linear/Notion

### Phase 2 — Closed beta
- [ ] WhatsApp group ל-5-10 חברים שאופים
- [ ] תיעוד מובנה של פידבק (Notion/Linear)
- [ ] Sentry installed (אם עדיין לא)

### Phase 3 — Open beta
- [ ] פוסט בקבוצת פייסבוק (לבדוק שלא נגד הכללים — אחרת לבקש מהמנהל)
- [ ] In-app testimonial/review collection
- [ ] Privacy policy + Terms of service (חובה ל-collection of personal data ולקראת monetization)

### Phase 4-5 — Monetization preparation
- [ ] Define paid tier — מה משלמים עליו?
- [ ] Supabase setup + auth flow
- [ ] localStorage → DB migration logic
- [ ] Stripe account + subscription product
- [ ] Stripe webhook → Supabase (subscription status sync)
- [ ] Resend account + transactional emails (welcome, receipt, trial-ending)
- [ ] Pricing decision: ILS 15-25/month or 150-200/year (test later)
- [ ] Israeli VAT (17%) configured via Stripe Tax

## Open Strategic Decisions (TBD)

1. **מה בדיוק יהיה בתשלום?** עוד לא נסגר. אופציות:
   - Premium מתכונים / presets (chef-curated)
   - יומן בייק עם הערות + תמונות (פיצ׳ר שדחיתי — חוזר רלוונטי כאן)
   - שיתוף + קהילה (סוציאלי)
   - חישובים מתקדמים (סוגי קמח, שמרים, multi-loaf)
   - **המלצה**: trial של 14 יום, אחרי זה subscription על הכל — קל יותר למכור מ-freemium

2. **מחיר**. אל לקבע עכשיו. בדוק ב-Phase 5 עם A/B test.

3. **פרטנרשיפ — מה ה-deal?**
   - Revenue split? (10-20% מהמשתמשים שמגיעים דרכו?)
   - Co-branded landing? (״כיכר ✕ {שם המדריך}״)
   - Content rights? (אם המדריך רוצה את המתכונים שלו ב-app)
   - **בלי exclusivity** — מסוכן ב-stage כל כך מוקדם

4. **multi-language (English)**. ב-CLAUDE.md מוזכר כאופציה עתידית. נדחה ל-post-monetization, אלא אם פתאום יש פנייה מ-non-Hebrew קהל.

## What this doc is NOT

- לא תכנית מוצר (זה ב-[`vision.md`](./vision.md))
- לא specs של פיצ׳רים (זה ב-[`specs/features/`](../specs/features/))
- לא רשימת tasks אופרציונליים — זה מסמך **כיוון אסטרטגי**. tasks קונקרטיים נכנסים ל-feature folders כשנגיע אליהם

## When to revisit this doc

- אחרי כל Phase — לעדכן status + מה למדנו
- אם החלטה אסטרטגית גדולה משתנה (מחיר, פרטנר, מחסנית)
- אם הצריכה (cost trajectory) רחוקה ממה שהערכנו
