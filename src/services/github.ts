export interface Issue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
}

const GITHUB_API_URL = 'https://api.github.com/repos/DhrubaDC1/ecoutons/issues';

export const fetchIssues = async (): Promise<Issue[]> => {
  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.status}`);
    }

    const data = await response.json();
    // Filter out pull requests if necessary, though the issues endpoint returns both.
    // GitHub API returns PRs as issues, but they have a 'pull_request' key.
    return data.filter((item: any) => !item.pull_request);
  } catch (error) {
    console.error("Failed to fetch GitHub issues", error);
    return [];
  }
};
