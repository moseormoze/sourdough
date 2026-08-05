# דלתא: שער קליטה חד־פעמי (Welcome Gate)

שפה ויזואלית בלבד. אפס שינוי בזרימת ה־identify, אחסון
(`sourdough:v1:identity`), ולידציה, קופי, analytics, סדר ה־DOM, roles,
‏aria או מקלדת/focus. כל המחרוזות בעברית נשארו בית־לבית.

## קומפוזיציה

- **קנבס**: ‏`WelcomeGate` צובע את שני מצבי המסך המלא (`checking` ו־
  `gate`/`leaving`) ב־`AMBIENT_CANVAS` ‏full-bleed, במקום `bg-bg`.
- **כרטיס glass**: הלוגו, הכותרת, תת־הכותרת והטופס כולם עברו לתוך כרטיס
  ‏`AMBIENT_GLASS` יחיד בעמודת התוכן (`max-w-md`) — זה ״כרטיס הזיהוי״
  שהחוזה מתייחס אליו; אין תוכן שיושב על הקנבס מחוץ לכרטיס (בשונה ממתכנן/בוחר,
  כאן כל המסך הוא כרטיס אחד).
- **ה־CTA הראשי ״מתחילים לאפות״ הוא charcoal** — ‏`Button variant="primary"`
  במקום `variant="accent"`; אין orange בשום משטח במסך.
- **שדות הטקסט (שם, אימייל) עברו ל־inset** — ‏`TextInput` קיבל prop חדש,
  ‏`appearance="inset"` (תוסף, לא הורס; ברירת המחדל `outline` נשארת זהה
  לחלוטין למסכים שלא הומרו — ראו בדיקות `text-input.test.tsx`). המראה: פיל
  ‏`bg-paper/70` בלי גבול, רדיוס 16px, ‏focus ring `ink/20`, שגיאה ‏ring
  ‏`danger/40` + הודעה מתחת (ללא מסגרת). התנהגות, ולידציה, ו־`aria-invalid`
  ללא שינוי.

## פער במילון שנסגר ב־PR הזה

חלק ד׳ של [language.md](./language.md) לא כלל שדה טקסט חופשי (`TextInput`) —
רק סטפר מספרי (`NumberInput`). נוסף כאן שורה למילון (״שדה טקסט (TextInput)״)
לפי אותו עקרון inset של הסטפר, כדי שמסכים עתידיים עם שדה טקסט לא יאלתרו
וריאציה חדשה.

## אימות מרונדר

- ‏viewports: ‏375×812 (top + fullPage), ‏320px; מצבים: ברירת מחדל, ‏CTA
  פעיל (שני השדות תקינים), שגיאת ולידציה (אימייל לא תקין לאחר blur).
- לפני/אחרי: BEFORE מ־`sourdough-chi.vercel.app` (production, לפני הרידזיין),
  ‏AFTER מ־`localhost:3012` (הענף הזה) — שני הצדדים עם `localStorage` נקי כדי
  שהשער יוצג.
- נבדק: היעדר overflow אופקי בשני הרוחבים (375, 320), אפס שגיאות קונסול,
  ניגודיות על הגרדיאנט. צילומים ב־
  `specs/features/30-redesign-rollout/qa/welcome-gate/`.
