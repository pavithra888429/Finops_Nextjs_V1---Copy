const fs = require('fs');
let content = fs.readFileSync('workflow-1789984112558.json', 'utf8');
if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
const wf = JSON.parse(content);
const analyticsNode = wf.nodes.find(n => n.id === 'httpRequest-1789974964346001');
console.log('Analytics HTTP Request node inputs:');
console.log(JSON.stringify(analyticsNode.data.inputs, null, 2));
