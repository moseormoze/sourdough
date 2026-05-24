// Kikar DS — canvas assembly
const { DesignCanvas: DSC, DCSection: DSCSec, DCArtboard: DSCArt } = window;

function DSCanvas() {
  return (
    <DSC storageKey="kikar-ds">
      <DSCSec id="overview" title="כיכר · Design System" subtitle="Tokens, atoms, molecules, organisms — with full state coverage. Hand to Claude Code along with tokens.json.">
      </DSCSec>

      <DSCSec id="tokens" title="01 · Tokens" subtitle="Source of truth. tokens.json mirrors these exactly — wire it into your build (CSS vars / Tailwind theme.extend / Style Dictionary).">
        <DSCArt id="t-color"   label="Color"            width={1180} height={1380}><window.ColorPalette/></DSCArt>
        <DSCArt id="t-type"    label="Typography"       width={920}  height={920}><window.TypeRamp/></DSCArt>
        <DSCArt id="t-space"   label="Spacing"          width={920}  height={420}><window.SpacingScale/></DSCArt>
        <DSCArt id="t-radius"  label="Radius & Shadow"  width={920}  height={680}><window.RadiusShadow/></DSCArt>
        <DSCArt id="t-motion"  label="Motion"           width={1100} height={780}><window.MotionTokens/></DSCArt>
      </DSCSec>

      <DSCSec id="atoms" title="02 · Atoms" subtitle="Indivisible building blocks. Each shown across every state: default · hover · pressed · focus · disabled.">
        <DSCArt id="a-button"   label="Button"     width={1100} height={1620}><window.ButtonsCard/></DSCArt>
        <DSCArt id="a-input"    label="Input"      width={1100} height={780}><window.InputsCard/></DSCArt>
        <DSCArt id="a-pill"     label="Pill / Chip" width={1100} height={520}><window.PillsCard/></DSCArt>
        <DSCArt id="a-term"     label="Term (?)"   width={1100} height={620}><window.TermCard/></DSCArt>
        <DSCArt id="a-controls" label="Selection controls (check, switch, radio)" width={1100} height={800}><window.ControlsCard/></DSCArt>
        <DSCArt id="a-icons"    label="Icons"      width={1100} height={680}><window.IconLibrary/></DSCArt>
        <DSCArt id="a-progress" label="Progress"   width={1100} height={620}><window.ProgressCard/></DSCArt>
      </DSCSec>

      <DSCSec id="molecules" title="03 · Molecules" subtitle="Atoms composed into meaningful units. Each appears verbatim across the screens.">
        <DSCArt id="m-photo"     label="Photo"             width={1100} height={1020}><window.PhotoCard/></DSCArt>
        <DSCArt id="m-gallery"   label="Reference gallery" width={1100} height={760}><window.GalleryCard/></DSCArt>
        <DSCArt id="m-expand"    label="Expand"            width={1100} height={620}><window.ExpandCard/></DSCArt>
        <DSCArt id="m-briefing"  label="Briefing"          width={1100} height={540}><window.BriefingCard/></DSCArt>
        <DSCArt id="m-video"     label="Video card"        width={1100} height={620}><window.VideoMolecule/></DSCArt>
        <DSCArt id="m-questions" label="Questions module"  width={1100} height={620}><window.QuestionsMolecule/></DSCArt>
        <DSCArt id="m-toast"     label="Toast"             width={1100} height={420}><window.ToastCard/></DSCArt>
      </DSCSec>

      <DSCSec id="organisms" title="04 · Organisms" subtitle="Screen-level structures. The chrome that wraps every flow.">
        <DSCArt id="o-topbar"  label="Top bar"        width={1100} height={760}><window.OrgTopBar/></DSCArt>
        <DSCArt id="o-tabbar"  label="Tab bar"        width={1100} height={460}><window.OrgTabBar/></DSCArt>
        <DSCArt id="o-stage"   label="Stage header"   width={1100} height={620}><window.OrgStageHeader/></DSCArt>
        <DSCArt id="o-sheet"   label="Bottom sheet"   width={1100} height={620}><window.OrgBottomSheet/></DSCArt>
      </DSCSec>

      <DSCSec id="appendix" title="05 · RTL & A11y" subtitle="Implementation rules every component honors.">
        <DSCArt id="a-a11y" label="Rules of the road" width={1100} height={640}><window.A11yAppendix/></DSCArt>
      </DSCSec>
    </DSC>
  );
}

const dsroot = ReactDOM.createRoot(document.getElementById('root'));
dsroot.render(<DSCanvas/>);
