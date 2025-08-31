Param()

$ErrorActionPreference = 'Stop'

Write-Host "Paste GitHub token (input hidden):" -ForegroundColor Cyan
$secure = Read-Host -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
$plain = [Runtime.InteropServices.Marshal]::PtrToStringUni($bstr)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)

$plain = $plain.Trim()
$plain = $plain -replace '^["\'']|["\'']$', ''
$plain = ($plain.ToCharArray() | Where-Object { [int]$_ -ge 32 -and [int]$_ -ne 127 } | ForEach-Object { [string]$_ }) -join ''

if ([string]::IsNullOrWhiteSpace($plain)) {
  Write-Error "Empty token provided after sanitization. Aborting."
  exit 1
}

$temp = New-TemporaryFile
Set-Content -Path $temp -Value $plain -Encoding UTF8 -NoNewline

try {
  (Get-Content $temp -Raw) | gh auth login --with-token | Out-Null
  gh auth setup-git | Out-Null
  gh auth refresh -h github.com -s repo -s workflow | Out-Null
  Write-Host "GitHub CLI authenticated and refreshed with repo,workflow scopes." -ForegroundColor Green
} finally {
  Remove-Item $temp -ErrorAction SilentlyContinue
}


