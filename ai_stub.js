#!/usr/bin/env node
// Simple AI stub: interactive CLI or single-arg usage
const readline = require('readline');

function getResponse(input) {
  const msg = input.trim().toLowerCase();
  if (msg === 'hi' || msg === 'hi!') return 'hello';
  if (msg === 'exit' || msg === 'quit') return null;
  if (msg.includes('?') || /^(who|what|why|how|when|where)\b/.test(msg)) return 'we are very sorry, the ai will be coming soon';
  return 'we are very sorry, the ai will be coming soon';
}

// If arguments provided, treat as single message
const args = process.argv.slice(2);
if (args.length > 0) {
  const input = args.join(' ').trim();
  console.log('You:', input);
  const resp = getResponse(input);
  if (resp !== null) console.log('AI:', resp);
  process.exit(0);
}

// Interactive mode
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'You: '
});

console.log('Interactive AI stub. Type a message, or "exit" to quit.');
rl.prompt();
rl.on('line', (line) => {
  const input = line.trim();
  if (!input) { rl.prompt(); return; }
  console.log('You:', input);
  const resp = getResponse(input);
  if (resp === null) {
    rl.close();
    return;
  }
  console.log('AI:', resp);
  rl.prompt();
}).on('close', () => {
  console.log('Goodbye.');
  process.exit(0);
});
