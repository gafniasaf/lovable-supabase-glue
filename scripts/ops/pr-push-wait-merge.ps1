Param(
  [Parameter(Mandatory=$false)] [string]$Title,
  [Parameter(Mandatory=$false)] [string]$Body,
  [Parameter(Mandatory=$false)] [string]$Branch,
  [Parameter(Mandatory=$false)] [string]$Base = 'main',
  [Parameter(Mandatory=$false)] [string]$Repo = 'gafniasaf/lovable-supabase-glue',
  [Parameter(Mandatory=$false)] [int]$WaitSeconds = 30,
  [Parameter(Mandatory=$false)] [switch]$AdminMerge,
  [Parameter(Mandatory=$false)] [ValidateSet('squash','merge','rebase')] [string]$Method = 'squash'
)

$ErrorActionPreference = 'Stop'

# Utilities
function New-ArtifactPath([string]$label, [string]$ext) {
  $null = New-Item -ItemType Directory -Force -Path "artifacts/ops" 2>$null
  $ts = Get-Date -Format 'yyyyMMdd-HHmmss'
  $safe = ($label -replace "[^a-zA-Z0-9_-]", "_")
  return "artifacts/ops/$ts-$safe.$ext"
}

function Write-Artifact([string]$label, [string]$content, [string]$ext='txt') {
  $path = New-ArtifactPath -label $label -ext $ext
  $content | Out-File -Encoding utf8 $path
  Write-Host "WROTE $path"
  Get-Content $path
}

if (-not $Branch) {
  $Branch = (git rev-parse --abbrev-ref HEAD).Trim()
}

$remotes = git remote | ForEach-Object { $_.Trim() }
$remote = if ($remotes -contains 'lovable') { 'lovable' } elseif ($remotes -contains 'origin') { 'origin' } else { '' }
if (-not $remote) { throw 'No git remotes found (expected lovable or origin).' }

Write-Host "Pushing $Branch -> $remote ..."
$pushOut = (git push -u $remote $Branch 2>&1 | Out-String)
Write-Artifact -label "push-$Branch" -content $pushOut

# Create PR (fill if Title not provided)
try {
  if ($Title) {
    $createOut = (gh pr create -R $Repo -H $Branch -B $Base -t $Title -b ($Body ? $Body : '') 2>&1 | Out-String)
  } else {
    $createOut = (gh pr create -R $Repo -H $Branch -B $Base -f 2>&1 | Out-String)
  }
  Write-Artifact -label "pr-create-$Branch" -content $createOut
} catch {
  Write-Artifact -label "pr-create-error-$Branch" -content ($_.ToString())
}

# Resolve PR number
$prJson = (gh pr list -R $Repo --head $Branch --state open --json number,url 2>&1 | Out-String)
Write-Artifact -label "pr-list-$Branch" -content $prJson -ext 'json'
try { $pr = $prJson | ConvertFrom-Json | Select-Object -First 1 } catch {}
if (-not $pr) { throw "Unable to determine PR for $Branch" }

Write-Host "Waiting $WaitSeconds seconds before merge ..."
Start-Sleep -Seconds $WaitSeconds

$mergeArgs = @('pr','merge',"$($pr.number)", '--delete-branch')
switch ($Method) {
  'squash' { $mergeArgs += '--squash' }
  'merge'  { $mergeArgs += '--merge' }
  'rebase' { $mergeArgs += '--rebase' }
}
if ($AdminMerge) { $mergeArgs += '--admin' }

$mergeOut = (gh @mergeArgs 2>&1 | Out-String)
Write-Artifact -label "pr-merge-$($pr.number)" -content $mergeOut
Write-Host "Done. PR #$($pr.number): $($pr.url)"


