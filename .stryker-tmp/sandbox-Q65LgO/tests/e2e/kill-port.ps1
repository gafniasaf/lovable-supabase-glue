param(
    [Parameter(Mandatory=$false)]
    [int]$Port = 3022
)

try {
    $pids = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique
    if ($pids) {
        foreach ($pid in $pids) {
            try { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } catch {}
        }
    }
} catch {}

exit 0


