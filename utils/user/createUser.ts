import { apiUrl } from "../../config.ts";

export default async function createUser(
  data
) {
  const url = `${apiUrl}/registration`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}