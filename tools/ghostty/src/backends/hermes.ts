import type {WiseConfig} from '../types.js';
export async function hermesChat(cfg: WiseConfig, prompt: string, fetchImpl = fetch): Promise<string> {
  if (!cfg.hermesUrl) throw new Error('Hermes is not configured');
  const response = await fetchImpl(`${cfg.hermesUrl.replace(/\/$/, '')}/v1/chat/completions`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({messages:[{role:'user',content:prompt}],stream:false})});
  if (!response.ok) throw new Error(`Hermes request failed (${response.status})`);
  const json = await response.json() as {choices?:Array<{message?:{content?:string}}>};
  return json.choices?.[0]?.message?.content || '';
}
