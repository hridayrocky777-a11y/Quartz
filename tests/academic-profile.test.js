const test = require('node:test');
const assert = require('node:assert/strict');

const { createDefaultProfile, normalizeProfile, getButtonLabel } = require('../js/academic-profile.js');

test('creates a default academic profile', () => {
  assert.deepStrictEqual(createDefaultProfile(), { class: null, board: null });
});

test('normalizes stored profile values', () => {
  assert.deepStrictEqual(normalizeProfile({ class: '7', board: 'ICSE' }), { class: '7', board: 'ICSE' });
  assert.deepStrictEqual(normalizeProfile({ class: null, board: null }), { class: null, board: null });
});

test('builds the expected button label', () => {
  assert.strictEqual(getButtonLabel(createDefaultProfile()), '📚 Select Class');
  assert.strictEqual(getButtonLabel({ class: '10', board: 'CBSE' }), '📚 Class 10 • CBSE');
  assert.strictEqual(getButtonLabel({ class: '7', board: 'ICSE' }), '📚 Class 7 • ICSE');
});
