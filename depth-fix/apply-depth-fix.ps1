# Run from the root of the Style Studio Photography repo:
#   powershell -ExecutionPolicy Bypass -File .\depth-fix\apply-depth-fix.ps1
# Fixes the orbit hero layering/depth/direction. Does NOT commit, push, merge or deploy.
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$pkg = Get-Content package.json -Raw | ConvertFrom-Json
if ($pkg.name -ne "style-studio-photography") { throw "Not the style-studio-photography repo (package name: $($pkg.name)). Stopping." }
foreach ($f in "src/pages/PhotographyOrbitHero.tsx","src/pages/photography-orbit.css") {
  if (-not (Test-Path $f)) { throw "$f not found. Stopping." }
}
Write-Host "== git status BEFORE ==" ; git status --short
git apply --check --ignore-whitespace "$here/OrbitDepth.patch"
if ($LASTEXITCODE -ne 0) { throw "Patch does not apply cleanly: your orbit files differ from the versions I was given. Nothing was changed." }
git apply --ignore-whitespace "$here/OrbitDepth.patch"
Write-Host "== npm run build =="
npm.cmd run build
$buildExit = $LASTEXITCODE
Write-Host "== git status AFTER ==" ; git status --short
Write-Host "BUILD EXIT CODE: $buildExit   (0 = success)"
