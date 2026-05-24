// Kikar — data: presets + stages
window.KIKAR_PRESETS = [
  { id: "country", name: "כפרי קלאסי", flours: "80% לבן · 20% מלא", hydration: 75, salt: 2.0, levain: 20, blurb: "הקלאסיקה. קרום פריך, פירור פתוח, חמיצות עדינה.", art: "country" },
  { id: "wholewheat70", name: "70% מלא", flours: "30% לבן · 70% מלא", hydration: 78, salt: 2.2, levain: 22, blurb: "עשיר, אגוזי, פירור צפוף יותר. בריא ומשביע.", art: "wheat" },
  { id: "rye50", name: "שיפון 50%", flours: "50% לבן · 50% שיפון", hydration: 78, salt: 2.2, levain: 25, blurb: "טעם עמוק וקצת חמצמץ. מעולה עם גבינות.", art: "rye" },
  { id: "white", name: "לבן בסיסי", flours: "100% לבן", hydration: 72, salt: 2.0, levain: 20, blurb: "פירור פתוח, קרום זהוב. בייק רך וחגיגי.", art: "white" },
  { id: "whole100", name: "מלא 100%", flours: "100% מלא", hydration: 82, salt: 2.2, levain: 22, blurb: "מאתגר אך מתגמל. ארומה עזה, צבע כהה.", art: "wholedark" },
  { id: "beginner", name: "כפרי קל למתחילים", flours: "90% לבן · 10% מלא", hydration: 70, salt: 2.0, levain: 18, blurb: "הידרציה נמוכה — קל לעיצוב, סלחני יחסית.", art: "beginner" },
];

window.KIKAR_USER_PRESETS = [
  { id: "shishi", name: "לחם של שישי", flours: "85% לבן · 15% מלא", hydration: 76, salt: 2.0, levain: 20, blurb: "הגרסה האישית שלי לסוף שבוע — אגוזים וקצת דבש.", art: "country", mine: true },
];

window.KIKAR_STAGES = [
  { n: 1,  short: "שאור",         name: "בניית שאור",                hint: "(levain)",          time: "כ-10–12 שעות", type: "check",  art: "jar-build",
    todo: "ערבבו סטארטר פעיל עם קמח ומים ביחס 1:1:1. מכסים בעדינות ומשאירים בטמפ׳ החדר עד שהשאור מכפיל את עצמו.",
    checks: ["השאור הוכפל בנפח", "רואים בועות בפנים", "ריח קצת חמצמץ ומתוק"]
  },
  { n: 2,  short: "אוטוליזה",     name: "אוטוליזה",                  hint: "",                  time: "30–60 דקות",    type: "check",  art: "mix-flour",
    todo: "מערבבים קמח ומים בלבד (בלי מלח ובלי שאור) עד שאין כיסי קמח יבש. מכסים ונותנים מנוחה.",
    checks: ["כל הקמח הורטב", "אין גושים יבשים", "הבצק מתחיל להירגע"]
  },
  { n: 3,  short: "לישה",         name: "לישה והוספת שאור ומלח",     hint: "",                  time: "15 דקות",       type: "check",  art: "knead",
    todo: "מוסיפים שאור ומלח (אפשר כפית מים). מקפלים בידיים רטובות עד שהכל מתאחד והבצק חלק.",
    checks: ["המלח והשאור משולבים", "הבצק חלק וגמיש", "לא נדבק חזק לכף היד"]
  },
  { n: 4,  short: "תסיסה",        name: "תסיסה ראשונית",             hint: "(Bulk fermentation)", time: "כ-4 שעות",     type: "bulk",   art: "dough-bowl",
    todo: "מתפיחים בטמפ׳ החדר. כל 30 דקות מבצעים קיפול (stretch & fold). אחרי 3–4 קיפולים מניחים בשקט עד שהבצק תופח ב-50–70%.",
    checks: ["הבצק תפח בכ-60%", "רואים בועות על פני השטח", "מרגיש קליל וגמיש"],
    subSteps: 4
  },
  { n: 5,  short: "עיצוב ראשוני", name: "עיצוב ראשוני",              hint: "(pre-shape)",       time: "20–30 דקות",    type: "check",  art: "preshape",
    todo: "מקמחים שיש בעדינות, מוציאים את הבצק, מעצבים לכדור רפוי ונותנים מנוחה מכוסה.",
    checks: ["הבצק מחזיק צורת כדור", "פני השטח חלקים", "אין קרעים גסים"]
  },
  { n: 6,  short: "עיצוב סופי",   name: "עיצוב סופי",                hint: "",                  time: "10 דקות",       type: "check",  art: "shape",
    todo: "מעצבים בעיצוב סופי (בולה / באטארד), מקמחים סלסלת התפחה ומניחים את הבצק עם התפר כלפי מעלה.",
    checks: ["הבצק מתוח אך לא קרוע", "התפר מכלפי מעלה בסלסלה", "מקומחים מספיק כדי שלא ידבק"]
  },
  { n: 7,  short: "התפחה",        name: "התפחה במקרר",               hint: "(retard)",          time: "12 שעות",       type: "timer", art: "fridge", duration: 12*60*60,
    todo: "מכסים את הסלסלה ומכניסים למקרר ללינה. ההתפחה הקרה מפתחת טעם ומקלה על עבודה עם הבצק למחרת.",
  },
  { n: 8,  short: "חימום תנור",   name: "חימום תנור",                hint: "(preheat)",         time: "45 דקות",       type: "timer", art: "oven", duration: 45*60,
    todo: "מחממים את התנור ל-250°C עם סיר ברזל יצוק (dutch oven) בפנים. הסיר חייב להיות לוהט לפני האפייה.",
  },
  { n: 9,  short: "אפייה מכוסה",  name: "אפייה — מכוסה",             hint: "",                  time: "20 דקות",       type: "timer", art: "bake-lid-on", duration: 20*60,
    todo: "מוציאים את הבצק על נייר אפייה, חורצים בסכין חדה, מעבירים בזהירות לסיר הלוהט ומכסים מיד.",
  },
  { n: 10, short: "אפייה גלויה",  name: "אפייה — לא מכוסה",          hint: "",                  time: "22 דקות",       type: "timer", art: "bake-lid-off", duration: 22*60,
    todo: "מסירים את המכסה. הקרום (crust) יתחיל להזהיב ולקבל צבע. עוקבים שלא יישרף.",
  },
  { n:11,  short: "קירור",        name: "קירור",                     hint: "",                  time: "שעה",           type: "timer", art: "cool", duration: 60*60,
    todo: "מוציאים את הלחם על רשת ומשאירים להתקרר לפחות שעה לפני חיתוך. הפירור (crumb) ממשיך להיווצר בזמן הזה.",
  },
  { n:12,  short: "מוכן!",        name: "הלחם מוכן",                 hint: "",                  time: "",              type: "done",  art: "loaf-done" },
];
