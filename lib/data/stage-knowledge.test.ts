import { describe, expect, it } from "vitest";
import {
  AUTOLYSE_KNOWLEDGE_ENTRIES,
  getStageKnowledge,
} from "./stage-knowledge";

describe("stage knowledge data", () => {
  it("exposes knowledge only for the autolyse stage", () => {
    expect(getStageKnowledge(2)).not.toBeNull();

    for (const stageN of [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
      expect(getStageKnowledge(stageN), `stage ${stageN}`).toBeNull();
    }
  });

  it("ships the three approved hub entries in their approved order", () => {
    expect(AUTOLYSE_KNOWLEDGE_ENTRIES).toEqual([
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
    ]);
  });

  it("contains the complete approved learn, FAQ, and troubleshooting content", () => {
    const content = getStageKnowledge(2)!;

    expect(content.learn.title).toBe("מה קורה באוטוליזה?");
    expect(content.learn.sections.map((section) => section.heading)).toEqual([
      "מהי אוטוליזה",
      "מה משתנה בבצק",
      "למה זה עוזר",
      "למה לא מוסיפים עדיין שאור ומלח",
      "למה לצפות — ולמה לא",
    ]);
    expect(content.learn.sections).toHaveLength(5);

    expect(content.faqs).toHaveLength(6);
    expect(content.faqs[0]?.question).toBe("הבצק עדיין גס ודביק. זה תקין?");
    expect(content.faqs[3]?.answer).toContain("לא מוסיפים מים נוספים");
    expect(content.faqs[5]?.question).toBe("צריך מטרפת בצק מיוחדת?");

    expect(content.troubleshooting).toHaveLength(2);
    expect(content.troubleshooting[0]?.title).toBe("נשארו כיסי קמח יבשים");
    expect(content.troubleshooting[0]?.actions).toHaveLength(3);
    expect(content.troubleshooting[1]?.title).toBe(
      "שכחתם את הקערה להרבה יותר משעה",
    );
    expect(content.troubleshooting[1]?.actions).toHaveLength(3);
  });
});
