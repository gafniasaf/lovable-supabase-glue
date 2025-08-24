$ErrorActionPreference = 'Stop'

$uri = 'http://localhost:3022/api/ef/assessments'
$headers = @{ 'x-test-auth' = 'teacher'; 'origin' = 'http://localhost:3022'; 'referer' = 'http://localhost:3022/x' }
$body = '{"programId":"11111111-1111-1111-1111-111111111111","epaId":"22222222-2222-2222-2222-222222222222"}'

try {
  $r = Invoke-WebRequest -UseBasicParsing -Method POST -Uri $uri -Headers $headers -ContentType 'application/json' -Body $body
  $status = [string]$r.StatusCode
  $content = $r.Content
} catch {
  if ($_.Exception.Response -ne $null) {
    try { $status = [string][int]$_.Exception.Response.StatusCode } catch { $status = '0' }
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $content = $reader.ReadToEnd()
  } else {
    $status = '0'
    $content = ($_.ToString())
  }
}

Set-Content -Encoding ascii -NoNewline 'artifacts\ef-status.txt' $status
Set-Content -Encoding ascii 'artifacts\ef-body.txt' $content


