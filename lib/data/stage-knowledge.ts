export type StageKnowledgeKind = "learn" | "faq" | "troubleshooting";

export interface StageKnowledgeEntrySummary {
  kind: StageKnowledgeKind;
  label: string;
  description: string;
  icon: "book-open" | "circle-help" | "life-buoy";
  tone: "accent" | "neutral" | "warn";
}

export interface KnowledgeSection {
  heading: string;
  body: string;
}

export interface StageFaq {
  question: string;
  answer: string;
}

export interface TroubleshootingScenario {
  title: string;
  signs: readonly string[];
  actions: readonly string[];
}

export interface StageKnowledgeContent {
  learn: {
    title: string;
    intro: string;
    sections: readonly KnowledgeSection[];
  };
  faqs: readonly StageFaq[];
  troubleshooting: readonly TroubleshootingScenario[];
}

export const AUTOLYSE_KNOWLEDGE_ENTRIES = [
  {
    kind: "learn",
    label: "מה קורה לבצק בזמן המנוחה?",
    description: "המדע, המטרה ולמה זה עוזר",
    icon: "book-open",
    tone: "accent",
  },
  {
    kind: "faq",
    label: "שאלות נפוצות",
    description: "6 תשובות קצרות",
    icon: "circle-help",
    tone: "neutral",
  },
  {
    kind: "troubleshooting",
    label: "משהו לא מסתדר?",
    description: "2 תרחישים וצעדים מעשיים",
    icon: "life-buoy",
    tone: "warn",
  },
] as const satisfies readonly StageKnowledgeEntrySummary[];

const AUTOLYSE_KNOWLEDGE: StageKnowledgeContent = {
  learn: {
    title: "מה קורה באוטוליזה?",
    intro:
      "זו לא סתם המתנה: בזמן שהקערה עומדת, הקמח סופג מים, רשת הגלוטן מתחילה להתפתח ואנזימים טבעיים מתחילים לפעול.",
    sections: [
      {
        heading: "מהי אוטוליזה",
        body:
          "אוטוליזה היא מנוחה קצרה של קמח ומים בלבד. בשיטה שכיכר מלמדת, השאור והמלח נשארים בחוץ ונכנסים בשלב הבא.",
      },
      {
        heading: "מה משתנה בבצק",
        body:
          "המים נספגים בעמילנים ובחלבוני הקמח, וחלבוני הקמח מתחילים ליצור רשת גלוטן גם בלי לישה ממושכת. במקביל פועלים אנזימים טבעיים: פרוטאזות מרככות חלק מקשרי החלבון, ועמילאזות מפרקות חלק מהעמילן לסוכרים שיהיו זמינים בהמשך.",
      },
      {
        heading: "למה זה עוזר",
        body:
          "אחרי המנוחה הבצק בדרך כלל נמתח בקלות רבה יותר וקל יותר לערבב אותו באופן אחיד. כך נדרשת פחות לישה פעילה, אבל האוטוליזה לא מבטיחה לבדה נפח או פירור (מבנה פנימי) פתוח.",
      },
      {
        heading: "למה לא מוסיפים עדיין שאור ומלח",
        body:
          "מלח מהדק את רשת הגלוטן וממתן את פעילות האנזימים. שאור כבר מתחיל תסיסה ומוסיף חומציות. קיימת שיטה קרובה בשם פרמנטוליזה שבה מוסיפים שאור מוקדם יותר, אבל היא משנה את התזמון ואינה השיטה שהבייק הזה מלמד.",
      },
      {
        heading: "למה לצפות — ולמה לא",
        body:
          "בתחילת המנוחה הבצק גס ולא אחיד. בסופה הוא עשוי להיות רך ומחובר יותר, אבל הוא לא צריך להיות חלק, לעבור מבחן חלון, לתפוח או להראות בועות. מנוחה חמה וארוכה יותר אינה תמיד טובה יותר ועלולה להחליש את הבצק, במיוחד עם הרבה קמח מלא או שיפון.",
      },
    ],
  },
  faqs: [
    {
      question: "הבצק עדיין גס ודביק. זה תקין?",
      answer:
        "כן. אוטוליזה אינה לישה, ולכן לא מצפים לבצק חלק. אל תוסיפו קמח; המשיכו אם כל הקמח רטוב והבצק התרכך מעט.",
    },
    {
      question: "עברו 60 דקות והוא לא נראה חלק. לחכות עוד?",
      answer:
        "לא. חלקות אינה סימן הסיום של השלב. עברו ללישה; הבצק ימשיך להתפתח בערבוב ובקיפולים.",
    },
    {
      question: "אוטוליזה ארוכה יותר תמיד טובה יותר?",
      answer:
        "לא. בבייק הזה עובדים 30–60 דקות. קמחים מלאים עשויים ליהנות ממנוחה ארוכה יותר במתכונים אחרים, אבל מנוחה חמה וארוכה מדי עלולה להחליש את המבנה.",
    },
    {
      question: "הכנסתי בטעות את כל המים. מה עושים?",
      answer:
        "לא מוסיפים מים נוספים. בשלב הבא הוסיפו את השאור והמלח ישירות ועבדו ביד רטובה עד שהמלח נטמע. סך המים במתכון כבר נכון.",
    },
    {
      question: "למה אין בועות או תפיחה?",
      answer:
        "כי השאור עדיין לא נכנס. באוטוליזה בודקים ספיגת מים ושינוי במרקם, לא פעילות תסיסה.",
    },
    {
      question: "צריך מטרפת בצק מיוחדת?",
      answer:
        "לא. אפשר לערבב ביד, בכף רגילה או במטרפת בצק; המטרה היא רק להרטיב את כל הקמח. מטרפת בצק יכולה להקל על הערבוב, אבל אינה משנה את התוצאה.",
    },
  ],
  troubleshooting: [
    {
      title: "נשארו כיסי קמח יבשים",
      signs: ["כתמי קמח לבנים או גושים יבשים וקשים גם אחרי המנוחה."],
      actions: [
        "ביד רטובה, צבטו וקפלו את הבצק 30–60 שניות — רק עד שהכיסים נפתחים.",
        "אם צריך, השתמשו במעט מיתרת המים של המתכון; אל תוסיפו מים מעבר למתכון.",
        "כסו לעוד 5–10 דקות ואז עברו לשלב הבא.",
      ],
    },
    {
      title: "שכחתם את הקערה להרבה יותר משעה",
      signs: ["המנוחה התארכה בחדר חם, והבצק נעשה רפוי מאוד או נקרע בקלות."],
      actions: [
        "אל תחכו יותר — עברו מיד לשלב הבא.",
        "הוסיפו את השאור, המלח ויתרת המים וערבבו בעדינות רק עד שהכול אחיד.",
        "אל תוסיפו קמח כדי ׳לתקן׳. המשיכו לעקוב אחר המרקם בקיפולים הבאים.",
      ],
    },
  ],
};

export function getStageKnowledge(stageN: number): StageKnowledgeContent | null {
  return stageN === 2 ? AUTOLYSE_KNOWLEDGE : null;
}
