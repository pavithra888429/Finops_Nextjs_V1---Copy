const fs = require('fs');
const path = require('path');

const code1 = fs.readFileSync(path.join(__dirname, 'code_node_1_cost_explorer.js'), 'utf8');
const code2 = fs.readFileSync(path.join(__dirname, 'code_node_2_cur_region.js'), 'utf8');
const code3 = fs.readFileSync(path.join(__dirname, 'code_node_3_merge.js'), 'utf8');

const workflow = {
  "_platform": "agentbuilder",
  "_version": 1,
  "_exportedAt": new Date().toISOString(),
  "_fingerprint": "YWN0aW9uOmNvZGUuZXhlY3V0ZXxhY3Rpb246bW9uZ29kYi5maW5kX2RvY3VtZW50",
  "nodes": [
    {
      "id": "webhook-1790843991079001",
      "data": {
        "label": "Webhook Trigger",
        "inputs": {
          "path": "7c53bda3-c369-4e08-bb54-c645901b89c2",
          "method": "POST",
          "options": {},
          "responseMode": "lastNode",
          "authentication": "none"
        },
        "toolId": "webhook",
        "toolData": {
          "id": "webhook",
          "displayName": "Webhook Trigger",
          "category": "Input /  Output"
        },
        "isTrigger": true,
        "isPrimaryTrigger": true
      },
      "type": "webhook",
      "position": { "x": 100, "y": 250 }
    },
    {
      "id": "mongo-ce-doc",
      "data": {
        "label": "Find Document (Cost Explorer)",
        "inputs": {
          "database": "finops_3",
          "collection": "awscostexplorer",
          "credentialId": "692b7c41-2b38-462c-b30b-d6f3e3ceff96",
          "query": "{}"
        },
        "toolId": "mongodb.find_document",
        "toolData": {
          "id": "mongodb.find_document",
          "displayName": "Find Document",
          "category": "Memory & State"
        }
      },
      "type": "action",
      "position": { "x": 400, "y": 120 }
    },
    {
      "id": "code-ce-process",
      "data": {
        "label": "Code: Process Cost Explorer",
        "inputs": {
          "code": code1,
          "mode": "all",
          "language": "javascript"
        },
        "toolId": "code.execute",
        "toolData": {
          "id": "code.execute",
          "displayName": "Code",
          "category": "Data  Processing"
        }
      },
      "type": "action",
      "position": { "x": 700, "y": 120 }
    },
    {
      "id": "mongo-cur-doc",
      "data": {
        "label": "Find Document (Cost Records)",
        "inputs": {
          "database": "finops_3",
          "collection": "finopscostrecords",
          "credentialId": "692b7c41-2b38-462c-b30b-d6f3e3ceff96",
          "query": "{}",
          "projection": "{\"billingPeriod\": 1, \"records.service\": 1, \"records.usageType\": 1, \"records.unblendedCost\": 1}",
          "sort": "{\"completedAt\": -1}",
          "limit": 1
        },
        "toolId": "mongodb.find_document",
        "toolData": {
          "id": "mongodb.find_document",
          "displayName": "Find Document",
          "category": "Memory & State"
        }
      },
      "type": "action",
      "position": { "x": 400, "y": 380 }
    },
    {
      "id": "code-cur-process",
      "data": {
        "label": "Code: Process CUR Region",
        "inputs": {
          "code": code2,
          "mode": "all",
          "language": "javascript"
        },
        "toolId": "code.execute",
        "toolData": {
          "id": "code.execute",
          "displayName": "Code",
          "category": "Data  Processing"
        }
      },
      "type": "action",
      "position": { "x": 700, "y": 380 }
    },
    {
      "id": "code-merge-process",
      "data": {
        "label": "Code: Merge Final Response",
        "inputs": {
          "code": code3,
          "mode": "all",
          "language": "javascript"
        },
        "toolId": "code.execute",
        "toolData": {
          "id": "code.execute",
          "displayName": "Code",
          "category": "Data  Processing"
        }
      },
      "type": "action",
      "position": { "x": 1000, "y": 250 }
    },
    {
      "id": "webhook-response-001",
      "data": {
        "label": "Webhook Response",
        "inputs": {
          "options": {},
          "responseCode": 200,
          "responseMode": "lastNode"
        },
        "toolId": "respondToWebhook",
        "toolData": {
          "id": "respondToWebhook",
          "displayName": "Respond to Webhook",
          "category": "Input / Output"
        }
      },
      "type": "action",
      "position": { "x": 1300, "y": 250 }
    }
  ],
  "edges": [
    {
      "id": "edge-wh-to-ce",
      "source": "webhook-1790843991079001",
      "target": "mongo-ce-doc",
      "sourceHandle": "output",
      "targetHandle": "input"
    },
    {
      "id": "edge-ce-to-code1",
      "source": "mongo-ce-doc",
      "target": "code-ce-process",
      "sourceHandle": "output",
      "targetHandle": "input"
    },
    {
      "id": "edge-wh-to-cur",
      "source": "webhook-1790843991079001",
      "target": "mongo-cur-doc",
      "sourceHandle": "output",
      "targetHandle": "input"
    },
    {
      "id": "edge-cur-to-code2",
      "source": "mongo-cur-doc",
      "target": "code-cur-process",
      "sourceHandle": "output",
      "targetHandle": "input"
    },
    {
      "id": "edge-code1-to-merge",
      "source": "code-ce-process",
      "target": "code-merge-process",
      "sourceHandle": "output",
      "targetHandle": "input"
    },
    {
      "id": "edge-code2-to-merge",
      "source": "code-cur-process",
      "target": "code-merge-process",
      "sourceHandle": "output",
      "targetHandle": "input"
    },
    {
      "id": "edge-merge-to-resp",
      "source": "code-merge-process",
      "target": "webhook-response-001",
      "sourceHandle": "output",
      "targetHandle": "input"
    }
  ]
};

fs.writeFileSync(path.join(__dirname, '..', 'workflow-split-cur-ce.json'), JSON.stringify(workflow, null, 2), 'utf8');
console.log('Saved workflow-split-cur-ce.json successfully!');
