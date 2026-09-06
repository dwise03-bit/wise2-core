const test = require('node:test');
const assert = require('node:assert/strict');
const { extractText, config } = require('../lib/grok');
const { splitMessage } = require('../grok-command');

test('uses safe configurable defaults', () => {
  const c = config({});
  assert.equal(c.model, 'grok-4.6');
  assert.equal(c.baseUrl, 'https://api.x.ai');
});
test('never exposes malformed response as success', () => assert.equal(extractText({ output: [] }), ''));
test('extracts Responses API output text', () => assert.equal(extractText({ output_text: ' hello ' }), 'hello'));
test('splits Discord messages below the content limit', () => {
  const chunks = splitMessage('x'.repeat(4000));
  assert.equal(chunks.length, 3);
  assert.ok(chunks.every((chunk) => chunk.length <= 1900));
});
