export async function handler(event, context) {
  // 1. Enable CORS so Salesforce can talk to your Netlify site
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // 2. Handle Schema Discovery (Agentforce asking what tools you have)
    if (event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          tools: [
            {
              name: "get_portfolio_skills",
              description: "Retrieves technical skills, programming languages, and frameworks from Sidhartha's portfolio.",
              inputSchema: {
                type: "object",
                properties: {} // No arguments needed for a simple list fetch
              }
            }
          ]
        })
      };
    }

    // 3. Handle Tool Execution (Agentforce asking for the actual data)
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      
      if (body.method === 'tools/call' && body.params?.name === 'get_portfolio_skills') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  frontend: ["React", "Next.js", "TailwindCSS", "HTML/CSS"],
                  backend: ["Node.js", "Express", "Python"],
                  cloud_tools: ["Netlify", "Salesforce Agentforce", "OpenAI API"]
                })
              }
            ]
          })
        };
      }
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid MCP request" }) };

  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
}
