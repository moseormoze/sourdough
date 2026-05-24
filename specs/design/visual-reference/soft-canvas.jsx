// Kikar Soft — canvas assembly
const { DesignCanvas: DCS, DCSection: DCSecS, DCArtboard: DCArtS } = window;

function KikarSoftCanvas() {
  return (
    <DCS storageKey="kikar-soft">
      <DCSecS id="flag" title="כיכר · Soft Bake — Full Build" subtitle="Direction 2 with deep education + media. Every stage now answers ‘what / why / how / what if’.">
      </DCSecS>

      {/* Flagship stage screen first — it's the meat */}
      <DCSecS id="stage" title="🍞 Flagship — Stage 4 · תסיסה ראשונית" subtitle="The kitchen-sink screen showing every education + media pattern in context. Tall artboard — scroll inside the focus overlay.">
        <DCArtS id="stage-bulk" label="Stage 4 · with briefing, gallery, video, Q&A" width={375} height={2300}>
          <window.StageBulk/>
        </DCArtS>
        <DCArtS id="sheet-open" label="Bottom sheet open · ‘הבצק לא תופח’" width={375} height={812}>
          <window.SheetOpen/>
        </DCArtS>
        <DCArtS id="stage-timer" label="Stage 7 · timer-driven (retard)" width={375} height={1620}>
          <window.StageTimerCold/>
        </DCArtS>
      </DCSecS>

      <DCSecS id="home" title="Home — Fresh & Resuming" subtitle="Two states. Empty-state hero photo. Resuming card with peach gradient + ‘why are we doing this?’ educational nudge.">
        <DCArtS id="home-fresh" label="Fresh" width={375} height={812}>
          <window.HomeFresh/>
        </DCArtS>
        <DCArtS id="home-resume" label="Resuming a bake" width={375} height={812}>
          <window.HomeResume/>
        </DCArtS>
      </DCSecS>

      <DCSecS id="starter" title="2 · בדיקת סטארטר" subtitle="Reference photo + checklist + expand explaining the float test + 4 Q&A entries.">
        <DCArtS id="starter" label="Starter check" width={375} height={1240}>
          <window.StarterSoft/>
        </DCArtS>
      </DCSecS>

      <DCSecS id="presets" title="3 · בחירת מתכון" subtitle="Photo-led preset cards. Inline term tooltips. ‘How to choose?’ explainer at the bottom.">
        <DCArtS id="presets" label="Preset gallery" width={375} height={1320}>
          <window.PresetsSoft/>
        </DCArtS>
      </DCSecS>

      <DCSecS id="recipe" title="4 · מתכון מותאם" subtitle="Recipe form with inline term tooltips + ‘what does hydration do?’ expandable + recommendation chip pattern.">
        <DCArtS id="recipe" label="Recipe form" width={375} height={1480}>
          <window.RecipeSoft/>
        </DCArtS>
      </DCSecS>

      <DCSecS id="cheat" title="צ׳יט שיט · Cheat sheet" subtitle="Full journey overview. Each stage tappable to jump-preview.">
        <DCArtS id="cheat" label="Vertical timeline" width={375} height={1280}>
          <window.CheatSheetSoft/>
        </DCArtS>
      </DCSecS>

      <DCSecS id="done" title="12 · הלחם מוכן" subtitle="Recap + photo placeholder + reflection note ‘pinned’ to this bake for next time.">
        <DCArtS id="complete" label="Completion" width={375} height={1100}>
          <window.CompletionSoft/>
        </DCArtS>
      </DCSecS>

      <DCSecS id="patterns" title="📐 Patterns reference" subtitle="The 8 building blocks every stage screen composes from. Drop-in components.">
        <DCArtS id="patterns" label="Education + media primitives" width={760} height={1320}>
          <window.PatternsShowcase/>
        </DCArtS>
      </DCSecS>
    </DCS>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<KikarSoftCanvas/>);
