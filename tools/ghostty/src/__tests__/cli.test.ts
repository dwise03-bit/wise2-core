import { describe, expect, it } from 'vitest';
import { parseArgs } from '../cli.js';
describe('CLI parser', () => {
  it('parses commands and prompts', () => expect(parseArgs(['code', 'review this'])).toMatchObject({ command: 'code', args: ['review this'] }));
  it('supports flags anywhere', () => expect(parseArgs(['status', '--json'])).toMatchObject({ command: 'status', json: true }));
  it('keeps vision path separate from its prompt', () => expect(parseArgs(['vision', './photo.jpg', 'inspect'])).toMatchObject({ command: 'vision', args: ['./photo.jpg', 'inspect'] }));
});
