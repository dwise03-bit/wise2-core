const API = process.env.NEXT_PUBLIC_API_URL;

export async function getStats() {
  const res = await fetch(`${API}/admin/stats`);
  return res.json();
}

export async function createWorkspace(data:any) {
  const res = await fetch(`${API}/create-workspace`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
}
