$ErrorActionPreference = "Stop"

# Configuration
$Version = "1.0.0"
$TimeStamp = Get-Date -Format "yyyyMMdd-HHmm"
$ZipName = "DeveloperOS_Offline_v$Version-$TimeStamp.zip"
$SourceDir = (Get-Location).Path
$ReleaseDir = Join-Path -Path $SourceDir -ChildPath "Release"
$StagingDir = Join-Path -Path $ReleaseDir -ChildPath "Staging"

Write-Host "Starting Offline Bundle Builder..." -ForegroundColor Cyan

# 1. Clean/Create Release Directories
if (Test-Path -Path $ReleaseDir) { 
    Remove-Item -Path $ReleaseDir -Recurse -Force 
}
New-Item -ItemType Directory -Path $StagingDir | Out-Null

# 2. Files to Copy
$Items = @("agent", "scripts", "Portables", "devtools", "start-agent.bat", "setup-system.bat", "package.json", "universal_manifest.json", "README.md")

foreach ($Item in $Items) {
    try {
        $Src = Join-Path -Path $SourceDir -ChildPath $Item
        $Dst = Join-Path -Path $StagingDir -ChildPath $Item
        
        if (Test-Path -Path $Src) {
            Write-Host "Copying $Item..." -ForegroundColor Yellow
            Copy-Item -Path $Src -Destination $Dst -Recurse -Force
        }
    }
    catch {
        Write-Warning "Failed to copy $Item : $_"
    }
}

# 3. Zip
$ZipPath = Join-Path -Path $ReleaseDir -ChildPath $ZipName
Write-Host "Compressing to $ZipPath..." -ForegroundColor Yellow
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($StagingDir, $ZipPath)

# 4. Cleanup
Remove-Item -Path $StagingDir -Recurse -Force

Write-Host "SUCCESS! Bundle created at $ZipPath" -ForegroundColor Green
