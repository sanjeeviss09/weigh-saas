# SetupLogiRatePrinter.ps1
# Requires Administrator privileges

Write-Host "--- LOGIRATE VIRTUAL PRINTER SETUP ---" -ForegroundColor Gold

# 1. Check for Admin
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "Please run this script as Administrator!"
    Write-Host "Right-click your PowerShell icon and select 'Run as Administrator', then run this script again."
    Pause
    Exit
}

$targetFolder = "C:\Weighments"
$portName = "$targetFolder\slip.pdf"

# 2. Create Target Folder
if (-not (Test-Path $targetFolder)) {
    New-Item -ItemType Directory -Path $targetFolder | Out-Null
    Write-Host "[+] Created folder: $targetFolder" -ForegroundColor Green
}

# 3. Create Local Port
Write-Host "[*] Configuring printer port..." -ForegroundColor Cyan
try {
    # Check if port exists first to avoid error spam
    $existingPort = Get-PrinterPort | Where-Object { $_.Name -eq $portName }
    if (-not $existingPort) {
        Add-PrinterPort -Name $portName -ErrorAction Stop
        Write-Host "[+] Port created: $portName" -ForegroundColor Green
    } else {
        Write-Host "[i] Port already exists, skipping." -ForegroundColor Yellow
    }
} catch {
    Write-Error "Failed to create port: $($_.Exception.Message)"
    Pause
    Exit
}

# 4. Install Printer
Write-Host "[*] Installing 'LogiRate PDF Creator'..." -ForegroundColor Cyan
try {
    $existingPrinter = Get-Printer | Where-Object { $_.Name -eq "LogiRate PDF Creator" }
    if (-not $existingPrinter) {
        Add-Printer -Name "LogiRate PDF Creator" -DriverName "Microsoft Print to PDF" -PortName $portName -ErrorAction Stop
        Write-Host "[+] SUCCESS: 'LogiRate PDF Creator' is now in your printer list!" -ForegroundColor Gold
    } else {
        Write-Host "[i] Printer 'LogiRate PDF Creator' already exists." -ForegroundColor Yellow
    }
} catch {
    Write-Error "Failed to add printer: $($_.Exception.Message)"
    Pause
    Exit
}

Write-Host "`n--- SETUP COMPLETE ---" -ForegroundColor Green
Write-Host "Instructions:"
Write-Host "1. Open your weighbridge software."
Write-Host "2. Select 'LogiRate PDF Creator' as your printer."
Write-Host "3. Print any bill. A PDF will automatically appear in $targetFolder"
Write-Host "4. The LogiRate Agent will detect it and upload it instantly."
Write-Host "`nPress any key to exit..."
[void][System.Console]::ReadKey($true)
