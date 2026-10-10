import { cx, useKit } from '../kit/controls';
import { Frame, s, usePageTitle } from '../site/Shell';
import OutpostMap from './OutpostMap';

// The big frame on the right of the outpost pages: the live map, a one-line
// readout in its header, and a notice when the settings cannot be built.
export function PreviewFrame({ readout }: { readout: string }) {
  const { o, t } = useKit();
  const outcome = o.outcome;
  const heading =
    outcome?.errorScope === 'input'
      ? t('ui.err_input', 'Cannot use this blueprint')
      : outcome?.errorScope === 'balancer'
      ? t('ui.err_balancer', 'Balancer required')
      : t('ui.err_settings', 'Invalid settings');

  return (
    <Frame
      title={usePageTitle()}
      className={s.previewFrame}
      aside={<span className={s.readout}>{readout || ' '}</span>}
    >
      <div className={s.mapFrame}>
        <OutpostMap
          map={o.map}
          ore={o.ore}
          className={cx(s.map, o.stale && s.stale)}
          padding={36}
          maxScale={20}
          wheelZoom
          toolsClassName={s.mapTools}
          toolClassName={s.mapTool}
        />
        {outcome && !outcome.ok && (
          <div className={s.mapAlert} role="alert">
            <strong>{heading}</strong>
            <span>{outcome.error}</span>
          </div>
        )}
        {outcome?.ok && !outcome.usable && (
          <div className={s.mapNote}>
            {t('ui.sample_note', 'This is a sample. Paste your own blueprint to get one you can copy.')}
          </div>
        )}
      </div>
    </Frame>
  );
}
