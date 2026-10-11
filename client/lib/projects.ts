export type Project = {
  id: number;
  title: string;
  category: string;
  short_description: string;
  description: string;
  stack: string[];
  project_number: string;
  thumbnail_url: string | null;
  live_url: string | null;
  is_featured: boolean;
};

export async function fetchProjects(url = "/api/projects"): Promise<Project[]> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Could not load projects.");
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error("The projects response was invalid.");
  }

  return payload as Project[];
}