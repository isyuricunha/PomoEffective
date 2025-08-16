export function compareSemver(a: string, b: string): number {
  const pa = a.replace(/^v/, '').split('.').map((n) => parseInt(n, 10))
  const pb = b.replace(/^v/, '').split('.').map((n) => parseInt(n, 10))
  const len = Math.max(pa.length, pb.length)
  for (let i = 0; i < len; i++) {
    const na = pa[i] || 0
    const nb = pb[i] || 0
    if (na > nb) return 1
    if (na < nb) return -1
  }
  return 0
}

export interface LatestInfo {
  latestVersion: string
  htmlUrl: string
}

export async function fetchLatestRelease(owner: string, repo: string): Promise<LatestInfo | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, { headers: { 'Accept': 'application/vnd.github+json' } })
    if (!res.ok) return null
    const data = await res.json() as { tag_name?: string; html_url?: string }
    if (!data.tag_name || !data.html_url) return null
    return { latestVersion: data.tag_name.replace(/^v/, ''), htmlUrl: data.html_url }
  } catch {
    return null
  }
}
