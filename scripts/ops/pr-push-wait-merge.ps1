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

function New-ArtifactPath([string]$label, [string]$ext) {
  $null = New-Item -ItemType Directory -Force -Path "artifacts/ops" 2>$null
  $ts = Get-Date -Format 'yyyyMMdd-HHmmss'
  $safe = ($label -replace "[^a-zA-Z0-9_-]", "_")
  return "artifacts/ops/$ts-$safe.$ext"
}

function Invoke-CmdCapture([string]$command, [string]$label, [string]$ext='txt', [switch]$Return) {
  $path = New-ArtifactPath -label $label -ext $ext
  cmd /c "$command 2>&1" | Out-File -Encoding utf8 $path
  Write-Host "WROTE $path"
  Get-Content $path
  if ($Return) {
    return Get-Content -Raw $path
  }
}

if (-not $Branch) {
  $Branch = (Invoke-CmdCapture "git rev-parse --abbrev-ref HEAD" "branch" -Return).Trim()
}

$remotesText = Invoke-CmdCapture "git remote" "remotes" -Return
$remotes = $remotesText -split "\r?\n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
$remote = if ($remotes -contains 'lovable') { 'lovable' } elseif ($remotes -contains 'origin') { 'origin' } else { '' }
if (-not $remote) { throw 'No git remotes found (expected lovable or origin).' }

Invoke-CmdCapture "git push -u $remote $Branch" "push-$Branch"

# Create PR
if ($Title) {
  $titleEsc = $Title -replace '"','\"'
  $bodyFile = $null
  if ($Body) {
    $bodyFile = New-ArtifactPath -label "pr-body-$Branch" -ext 'md'
    $Body | Out-File -Encoding utf8 $bodyFile
    Write-Host "WROTE $bodyFile"
  }
  $cmd = if ($bodyFile) {
    "gh pr create -R $Repo -H $Branch -B $Base -t `"$titleEsc`" -F `"$bodyFile`""
  } else {
    "gh pr create -R $Repo -H $Branch -B $Base -t `"$titleEsc`""
  }
  Invoke-CmdCapture $cmd "pr-create-$Branch"
} else {
  Invoke-CmdCapture "gh pr create -R $Repo -H $Branch -B $Base -f" "pr-create-$Branch"
}

$prJson = Invoke-CmdCapture "gh pr list -R $Repo --head $Branch --state open --json number,url" "pr-list-$Branch" 'json' -Return
try { $pr = $prJson | ConvertFrom-Json | Select-Object -First 1 } catch {}
if (-not $pr) { throw "Unable to determine PR for $Branch" }

Write-Host "Waiting $WaitSeconds seconds before merge ..."
Start-Sleep -Seconds $WaitSeconds

$mergeFlags = switch ($Method) {
  'merge'  { '--merge' }
  'rebase' { '--rebase' }
  default  { '--squash' }
}
$adminFlag = if ($AdminMerge) { '--admin' } else { '' }
$mergeCmd = "gh pr merge $($pr.number) $mergeFlags --delete-branch $adminFlag"
Invoke-CmdCapture $mergeCmd "pr-merge-$($pr.number)"
Write-Host "Done. PR #$($pr.number): $($pr.url)"


