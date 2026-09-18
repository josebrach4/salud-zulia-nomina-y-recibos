$ws = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop 'Nomina Salud Zulia.lnk'
$shortcut = $ws.CreateShortcut($shortcutPath)
$shortcut.TargetPath = 'C:\Users\Usuario\.gemini\antigravity\scratch\nomina-salud-zulia\iniciar-nomina.bat'
$shortcut.WorkingDirectory = 'C:\Users\Usuario\.gemini\antigravity\scratch\nomina-salud-zulia'
$shortcut.Description = 'Plan Medico Salud Zulia - Control de Nomina'
$shortcut.IconLocation = 'C:\Windows\System32\shell32.dll,15'
$shortcut.Save()
Write-Host 'Acceso directo creado exitosamente en el escritorio'
