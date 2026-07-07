export async function POST(req: Request) {
  const { prompt } = await req.json();

  const response = await fetch("http://127.0.0.1:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "hermes3:8b",
      prompt,
      stream: false
    })
  });

  const data = await response.json();

  return Response.json({
    response: data.response
  });
}
