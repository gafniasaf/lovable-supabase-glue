Param(
  [Parameter(Mandatory=$true)] [string]$Title,
  [Parameter(Mandatory=$true)] [string]$Body,
  [Parameter(Mandatory=$false)] [string]$Branch,
  [Parameter(Mandatory=$false)] [string]$Base = 'main',
  [Parameter(Mandatory=$false)] [string]$Repo = 'gafniasaf/lovable-supabase-glue'
)

$ErrorActionPreference = 'Stop'

if (-not $Branch) {
  $Branch = (git rev-parse --abbrev-ref HEAD).Trim()
}

$remotes = git remote | ForEach-Object { $_.Trim() }
$remote = if ($remotes -contains 'lovable') { 'lovable' } elseif ($remotes -contains 'origin') { 'origin' } else { '' }
if (-not $remote) { throw 'No git remotes found (expected lovable or origin).' }

Write-Host "Pushing $Branch to $remote ..."
git push -u $remote $Branch 2>&1 | Out-String | Write-Host

Write-Host "Creating PR on $Repo from $Branch -> $Base ..."
gh pr create -R $Repo -H $Branch -B $Base -t $Title -b $Body 2>&1 | Out-String | Write-Host

Write-Host 'PR details:'
gh pr list -R $Repo --head $Branch --state open --json number,url,headRefName 2>&1 | Out-String | Write-Host


