try {
    $procs = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like '*apps\web*' }
    if ($procs) {
        foreach ($p in $procs) {
            try { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue } catch {}
        }
    }
} catch {}

exit 0


