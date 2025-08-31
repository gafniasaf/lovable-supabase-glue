Param(
  [string]$Owner = 'gafniasaf',
  [string]$Repo = 'education-system-5',
  [string]$Branch = 'fix/vercel-next-defaults'
)

$ErrorActionPreference = 'Stop'

function Write-Note($msg) { Write-Host $msg -ForegroundColor Cyan }

Write-Note "Fetching main ref"
$mainRefJson = gh api "repos/$Owner/$Repo/git/ref/heads/main"
$mainRef = $mainRefJson | ConvertFrom-Json
$baseSha = $mainRef.object.sha

Write-Note "Ensuring branch $Branch from $baseSha"
try {
  gh api "repos/$Owner/$Repo/git/refs" -X POST -f ref="refs/heads/$Branch" -f sha=$baseSha | Out-Null
} catch {
  # If already exists, ignore
}

Write-Note "Reading vercel.json metadata"
$vcJson = gh api "repos/$Owner/$Repo/contents/vercel.json?ref=main"
$vc = $vcJson | ConvertFrom-Json
$currentSha = $vc.sha

Write-Note "Preparing new vercel.json content"
$newObj = [ordered]@{
  version = 2
  framework = 'nextjs'
  installCommand = 'npm ci --ignore-scripts'
  outputDirectory = 'apps/web/.next'
}
$newJson = ($newObj | ConvertTo-Json -Depth 4)
$b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($newJson))

Write-Note "Updating vercel.json on $Branch"
$update = gh api "repos/$Owner/$Repo/contents/vercel.json" -X PUT -f message="fix(vercel): remove workspace buildCommand; use Next.js defaults" -f content="$b64" -f branch="$Branch" -f sha="$currentSha"

Write-Note "Creating PR"
gh pr create -R "$Owner/$Repo" -H $Branch -B main -t "fix(vercel): remove workspace buildCommand; use Next.js defaults" -b "This removes the repo-level buildCommand that forced 'npm --workspace apps/web run build'. With this change, Vercel project settings can use Root Directory apps/web, Build 'npm run build', Output '.next'."

Write-Host "Done." -ForegroundColor Green


