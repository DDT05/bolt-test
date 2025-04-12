import type { FlowiseResponse } from './types';

async function query(data: { question: string }): Promise<FlowiseResponse> {
  const response = await fetch(
    import.meta.env.VITE_FLOWISE_API_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: `The mission is to describe the given url, describe an image as final output. Url is: ${data.question}`
      })
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to get response from Flowise AI');
  }
  
  return response.json();
}

export { query }