Param(
  [Parameter(Mandatory=$true)] [string]$RepoRoot,
  [string]$Owner = 'gafniasaf',
  [string]$Repo = 'education-system-5',
  [string]$Branch = 'fix/per-app-vercel'
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $RepoRoot)) {
  throw "RepoRoot not found: $RepoRoot"
}

$token = $env:GITHUB_PAT
if ([string]::IsNullOrWhiteSpace($token)) { $token = $env:GITHUB_TOKEN }
if ([string]::IsNullOrWhiteSpace($token)) { throw 'No token found in GITHUB_PAT or GITHUB_TOKEN' }

Push-Location $RepoRoot
try {
  # Ensure a branch exists
  git checkout -B $Branch | Out-Null

  # Set a minimal user if not present
  try { git config user.email | Out-Null } catch { git config user.email "bot@example.com" | Out-Null }
  try { git config user.name  | Out-Null } catch { git config user.name  "automation-bot" | Out-Null }

  # Push using HTTPS with basic auth (owner as username)
  $remoteUrl = "https://$Owner:$token@github.com/$Owner/$Repo.git"
  git push $remoteUrl "HEAD:refs/heads/$Branch" -u
}
finally {
  Pop-Location
}


