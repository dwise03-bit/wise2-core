import { extractAction, stripActionMarker, validateAction } from '../actions';

describe('validateAction — the allowlist gate', () => {
  it('accepts a navigate action to an allowlisted route', () => {
    const result = validateAction({ type: 'navigate', params: { path: '/consulting' } });
    expect(result).toEqual({ type: 'navigate', params: { path: '/consulting' } });
  });

  it('rejects navigate to a route not on the allowlist', () => {
    expect(validateAction({ type: 'navigate', params: { path: '/admin/secret' } })).toBeNull();
  });

  it('rejects navigate with a non-string path', () => {
    expect(validateAction({ type: 'navigate', params: { path: 123 } })).toBeNull();
  });

  it('accepts open_intake with no category', () => {
    expect(validateAction({ type: 'open_intake', params: {} })).toEqual({ type: 'open_intake', params: {} });
  });

  it('accepts open_intake with a real category id', () => {
    expect(validateAction({ type: 'open_intake', params: { category: 'website-build' } })).toEqual({
      type: 'open_intake',
      params: { category: 'website-build' },
    });
  });

  it('rejects open_intake with an unknown category id', () => {
    expect(validateAction({ type: 'open_intake', params: { category: 'not-a-real-category' } })).toBeNull();
  });

  it('accepts open_contact with empty params', () => {
    expect(validateAction({ type: 'open_contact', params: {} })).toEqual({ type: 'open_contact', params: {} });
  });

  it('accepts request_human_handoff with a non-empty reason', () => {
    expect(validateAction({ type: 'request_human_handoff', params: { reason: 'frustrated visitor' } })).toEqual({
      type: 'request_human_handoff',
      params: { reason: 'frustrated visitor' },
    });
  });

  it('rejects request_human_handoff with an empty reason', () => {
    expect(validateAction({ type: 'request_human_handoff', params: { reason: '   ' } })).toBeNull();
  });

  it('rejects an action type outside the allowlist entirely', () => {
    expect(validateAction({ type: 'delete_everything', params: {} })).toBeNull();
  });

  it('rejects a hallucinated action with a plausible-looking but fabricated shape', () => {
    expect(
      validateAction({ type: 'navigate', params: { path: '/consulting', andAlsoRunThis: 'rm -rf /' } }),
    ).toEqual({ type: 'navigate', params: { path: '/consulting' } }); // extra keys are ignored, not dangerous
  });

  it('rejects non-object input', () => {
    expect(validateAction(null)).toBeNull();
    expect(validateAction('navigate')).toBeNull();
    expect(validateAction(42)).toBeNull();
    expect(validateAction(undefined)).toBeNull();
  });
});

describe('extractAction — parsing the model reply marker', () => {
  it('extracts and validates a well-formed marker', () => {
    const reply =
      'Sure, here you go.\n<<<WISE_IMP_ACTION>>>{"type":"navigate","params":{"path":"/pricing"}}<<<END>>>';
    expect(extractAction(reply)).toEqual({ type: 'navigate', params: { path: '/pricing' } });
  });

  it('returns null when there is no marker', () => {
    expect(extractAction('Just a normal reply with no action.')).toBeNull();
  });

  it('returns null for malformed JSON inside the marker, without throwing', () => {
    const reply = '<<<WISE_IMP_ACTION>>>{not valid json<<<END>>>';
    expect(() => extractAction(reply)).not.toThrow();
    expect(extractAction(reply)).toBeNull();
  });

  it('returns null when the marker contains a disallowed action, without surfacing it', () => {
    const reply = '<<<WISE_IMP_ACTION>>>{"type":"navigate","params":{"path":"/api/admin"}}<<<END>>>';
    expect(extractAction(reply)).toBeNull();
  });
});

describe('stripActionMarker — keeping the marker out of the visible reply', () => {
  it('removes the marker and surrounding whitespace from the reply text', () => {
    const reply =
      'Here you go!\n<<<WISE_IMP_ACTION>>>{"type":"open_contact","params":{}}<<<END>>>';
    expect(stripActionMarker(reply)).toBe('Here you go!');
  });

  it('leaves text without a marker unchanged', () => {
    expect(stripActionMarker('No marker here.')).toBe('No marker here.');
  });
});
