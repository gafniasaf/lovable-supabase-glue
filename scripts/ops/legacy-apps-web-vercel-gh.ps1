Param(
  [string]$Owner = 'gafniasaf',
  [string]$Repo = 'education-system-5',
  [string]$Branch = 'fix/apps-web-vercel-json'
)

$ErrorActionPreference = 'Stop'

function Note($m){ Write-Host $m -ForegroundColor Cyan }

Note "Fetching default branch"
$repoInfo = gh api "repos/$Owner/$Repo"
$repo = $repoInfo | ConvertFrom-Json
$base = $repo.default_branch
$refInfo = gh api "repos/$Owner/$Repo/git/ref/heads/$base"
$ref = $refInfo | ConvertFrom-Json
$baseSha = $ref.object.sha

Note "Ensuring branch $Branch from $base@$baseSha"
try { gh api "repos/$Owner/$Repo/git/refs" -X POST -f ref="refs/heads/$Branch" -f sha=$baseSha | Out-Null } catch {}

Note "Reading existing apps/web/vercel.json (if any)"
$sha = ''
try {
  $cur = gh api "repos/$Owner/$Repo/contents/apps/web/vercel.json?ref=$Branch" | ConvertFrom-Json
  $sha = $cur.sha
} catch {}

$content = @"
{
  "version": 2,
  "framework": "nextjs",
  "installCommand": "npm install --ignore-scripts --legacy-peer-deps",
  "buildCommand": "node -e \"require('fs').rmSync('src/app/labs/expertfolio',{recursive:true,force:true})\" && next build",
  "outputDirectory": ".next"
}
"@

$b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($content))

Note "Upserting apps/web/vercel.json on $Branch"
if ($sha) {
  gh api "repos/$Owner/$Repo/contents/apps/web/vercel.json" -X PUT -f message="chore(vercel): add apps/web/vercel.json" -f content="$b64" -f branch="$Branch" -f sha="$sha"
} else {
  gh api "repos/$Owner/$Repo/contents/apps/web/vercel.json" -X PUT -f message="chore(vercel): add apps/web/vercel.json" -f content="$b64" -f branch="$Branch"
}

Note "Creating PR"
gh pr create -R "$Owner/$Repo" -H $Branch -B $base -t "chore(vercel): add apps/web/vercel.json" -b "Adds per-app vercel.json so project with Root Directory apps/web uses Next.js defaults."

Write-Host "Done" -ForegroundColor Green


