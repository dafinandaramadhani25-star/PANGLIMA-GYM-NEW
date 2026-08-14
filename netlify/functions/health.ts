export const handler = async (event: any) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: 'ok',
      app: 'PANGLIMA Gym & Workout Progress Tracker',
      platform: 'Netlify Serverless',
      aiEnabled: Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY),
    }),
  };
};
