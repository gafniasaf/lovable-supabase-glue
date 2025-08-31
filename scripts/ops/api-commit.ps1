Param(
  [string]$Owner = 'gafniasaf',
  [string]$Repo = 'education-system-5',
  [string]$Branch = 'push/verification',
  [string]$TargetPath = 'ops/verify-push.txt',
  [string]$CommitMessage = 'chore: verify automated push',
  [string]$RawContent
)

$ErrorActionPreference = 'Stop'

function Get-Token {
  $t = $env:GITHUB_TOKEN
  if ([string]::IsNullOrWhiteSpace($t)) { $t = $env:GH_TOKEN }
  if ([string]::IsNullOrWhiteSpace($t)) { $t = [Environment]::GetEnvironmentVariable('GITHUB_TOKEN','User') }
  if ([string]::IsNullOrWhiteSpace($t)) { $t = [Environment]::GetEnvironmentVariable('GH_TOKEN','User') }
  if ([string]::IsNullOrWhiteSpace($t)) { throw 'No token found in env (GITHUB_TOKEN/GH_TOKEN)' }
  return $t
}

$token = Get-Token
$headers = @{ Authorization = 'token ' + $token; 'User-Agent' = 'ps-api-commit'; Accept = 'application/vnd.github+json' }

# Identify default branch and ensure target branch exists
$repoInfo = Invoke-RestMethod -Headers $headers -Uri "https://api.github.com/repos/$Owner/$Repo" -Method Get
$base = $repoInfo.default_branch
$ref = Invoke-RestMethod -Headers $headers -Uri "https://api.github.com/repos/$Owner/$Repo/git/ref/heads/$base" -Method Get
$sha = $ref.object.sha

try { Invoke-RestMethod -Headers $headers -Uri "https://api.github.com/repos/$Owner/$Repo/git/refs" -Method Post -Body (@{ref="refs/heads/$Branch"; sha=$sha} | ConvertTo-Json) -ContentType 'application/json' | Out-Null } catch {}

if (-not $RawContent) { $RawContent = "verify push at $(Get-Date -Format o)" }
$b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($RawContent))

$existingSha = $null
try {
  $cur = Invoke-RestMethod -Headers $headers -Uri "https://api.github.com/repos/$Owner/$Repo/contents/$TargetPath?ref=$Branch" -Method Get
  $existingSha = $cur.sha
} catch {}

$body = @{ message=$CommitMessage; content=$b64; branch=$Branch }
if ($existingSha) { $body.sha = $existingSha }
Invoke-RestMethod -Headers $headers -Uri "https://api.github.com/repos/$Owner/$Repo/contents/$TargetPath" -Method Put -Body ($body | ConvertTo-Json) -ContentType 'application/json' | Out-Null

Write-Host "PUSH_OK branch=$Branch path=$TargetPath"


