const fs = require('fs');
const transcript = fs.readFileSync('C:/Users/HP/.gemini/antigravity-ide/brain/f7607841-41ab-42cf-9781-993b9107ede6/.system_generated/logs/transcript_full.jsonl', 'utf8');
const lines = transcript.split('\n');
for (const line of lines) {
  if (line.includes('PF 1 - Aug 04')) {
    const step = JSON.parse(line);
    const content = typeof step.content === 'string' ? step.content : JSON.stringify(step);
    // Find the keys JSON array
    const match = content.match(/"data":\s*(\[\s*\{[\s\S]*?\}\s*\])/);
    if (match) {
      try {
        const keys = JSON.parse(match[1]);
        console.log('ALL 11 KEYS FROM OPENROUTER:');
        keys.forEach((k, idx) => {
          console.log(`${idx+1}. "${k.name}" - Usage: ${k.usage}, Limit: ${k.limit}, Remaining: ${k.limit_remaining}, Label: ${k.label}`);
        });
      } catch(e) {
        console.log('JSON parse err:', e.message);
      }
    }
    break;
  }
}
