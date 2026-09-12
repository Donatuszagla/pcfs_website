export async function uploadMediaFile(file: File, alt: string, accessToken?: string): Promise<{ url: string; alt: string }> {
  const baseApi = (import.meta.env.VITE_API_URL ?? "http://localhost:4000/graphql").replace(/\/graphql\/?$/, "");
  const uploadEndpoint = `${baseApi}/api/uploads`;
  const formData = new FormData();
  formData.append("file", file);
  const cleanAlt = (alt && alt.trim()) || file.name.replace(/\.[^/.]+$/, "").trim() || "Uploaded Asset";
  formData.append("alt", cleanAlt);

  const response = await fetch(uploadEndpoint, {
    method: "POST",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(errJson.error || `Upload failed with status ${response.status}`);
  }

  const data = await response.json();
  return { url: data.asset.url, alt: data.asset.alt };
}
