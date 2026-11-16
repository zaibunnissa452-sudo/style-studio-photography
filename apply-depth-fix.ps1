# Applies the orbit depth fix to the CURRENT PhotographyOrbitHero.tsx and photography-orbit.css.
# Run from the root of the Style Studio Photography repo. OrbitDepth.patch must be in the same
# folder as this script (it can live anywhere, e.g. Downloads).
#
# This script does NOT commit, push, merge, stash, reset or deploy. It only:
#   1) backs up the two files to %TEMP%, 2) checks the patch, 3) applies it, 4) runs the build.
$ErrorActionPreference = "Stop"
$here  = Split-Path -Parent $MyInvocation.MyCommand.Path
$patch = Join-Path $here "OrbitDepth.patch"
if (-not (Test-Path $patch)) { throw "OrbitDepth.patch not found next to this script ($here). Stopping." }

$pkg = Get-Content package.json -Raw | ConvertFrom-Json
if ($pkg.name -ne "style-studio-photography") { throw "Not the style-studio-photography repo (package name: $($pkg.name)). Stopping." }

$files = @("src/pages/PhotographyOrbitHero.tsx", "src/pages/photography-orbit.css")
foreach ($f in $files) { if (-not (Test-Path $f)) { throw "$f not found. Stopping." } }

Write-Host "== git status BEFORE =="
git status --short

# Backup (your pause-removal edits may be uncommitted, so git alone cannot restore them)
$backup = Join-Path $env:TEMP ("orbit-depth-backup-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
New-Item -ItemType Directory -Path $backup | Out-Null
foreach ($f in $files) { Copy-Item $f (Join-Path $backup (Split-Path $f -Leaf)) }
Write-Host "Backup of both files saved to: $backup"

# Check first: nothing is modified if this fails
$ErrorActionPreference = "Continue"
git apply --check --ignore-whitespace $patch
$checkExit = $LASTEXITCODE
$ErrorActionPreference = "Stop"
if ($checkExit -ne 0) {
  throw "Patch does NOT apply cleanly: your orbit files differ from the versions the patch was made for. Nothing was changed."
}

git apply --ignore-whitespace $patch
if ($LASTEXITCODE -ne 0) { throw "git apply failed unexpectedly. Restore from the backup above if needed." }
Write-Host "Patch applied to:"
$files | ForEach-Object { Write-Host "  $_" }

Write-Host "== npm run build =="
npm.cmd run build
$buildExit = $LASTEXITCODE

Write-Host "== git status AFTER =="
git status --short
Write-Host "BUILD EXIT CODE: $buildExit   (0 = success)"
Write-Host "Nothing was committed, pushed, merged or deployed."
