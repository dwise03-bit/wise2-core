function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function gatherAction(baseUrl: string, extra = ''): string {
  const trimmed = baseUrl.replace(/\/$/, '');
  return `${trimmed}/gather${extra}`;
}

export function sayGatherTwiml(baseUrl: string, text: string, sessionId?: string): string {
  const action = gatherAction(baseUrl, sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '');
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech dtmf" action="${escapeXml(action)}" method="POST" speechTimeout="auto" timeout="6">
    <Say voice="Polly.Joanna">${escapeXml(text)}</Say>
  </Gather>
  <Say voice="Polly.Joanna">I did not catch that. Goodbye.</Say>
  <Hangup/>
</Response>`;
}

export function sayHangupTwiml(text: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${escapeXml(text)}</Say>
  <Hangup/>
</Response>`;
}

export function recordVoicemailTwiml(baseUrl: string, text: string): string {
  const action = `${baseUrl.replace(/\/$/, '')}/recording`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${escapeXml(text)}</Say>
  <Record action="${escapeXml(action)}" method="POST" maxLength="90" playBeep="true" transcribe="true"/>
  <Hangup/>
</Response>`;
}

export function transferTwiml(text: string, transferNumber: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${escapeXml(text)}</Say>
  <Dial>${escapeXml(transferNumber)}</Dial>
</Response>`;
}
