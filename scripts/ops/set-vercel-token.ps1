Param()

$ErrorActionPreference = 'Stop'

Write-Host "Paste Vercel token (input hidden):" -ForegroundColor Cyan
$secure = Read-Host -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
$plain = [Runtime.InteropServices.Marshal]::PtrToStringUni($bstr)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)

# Sanitize: trim, strip quotes, remove control chars
$plain = $plain.Trim()
$plain = $plain -replace '^["\'']|["\'']$', ''
$plain = ($plain.ToCharArray() | Where-Object { [int]$_ -ge 32 -and [int]$_ -ne 127 } | ForEach-Object { [string]$_ }) -join ''

if ([string]::IsNullOrWhiteSpace($plain)) {
  Write-Error "Empty token provided after sanitization. Aborting."
  exit 1
}

[Environment]::SetEnvironmentVariable('VERCEL_TOKEN', $plain, 'User')
$env:VERCEL_TOKEN = $plain
Write-Host ("VERCEL_TOKEN set for current session and persisted (length: {0})." -f $plain.Length) -ForegroundColor Green


