# Run from the root of the Style Studio Photography repo:
#   powershell -ExecutionPolicy Bypass -File .\stage2\apply-stage2.ps1
# Applies Stage 2 (pinned blue-to-arch sequence) on top of Stage 1. Does NOT commit, push, merge or deploy.
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$pkg = Get-Content package.json -Raw | ConvertFrom-Json
if ($pkg.name -ne "style-studio-photography") { throw "Not the style-studio-photography repo (package name: $($pkg.name)). Stopping." }
foreach ($f in "src/pages/PhotographySite.tsx","src/pages/PhotographyShowcase.tsx","src/pages/photography-showcase.css") {
  if (-not (Test-Path $f)) { throw "$f not found - Stage 1 must be applied first. Stopping." }
}

Write-Host "== git status BEFORE ==" ; git status --short
git apply --check --ignore-whitespace "$here/Stage2.patch"
if ($LASTEXITCODE -ne 0) { throw "Stage 2 patch does not apply cleanly: your files differ from the Stage 1 versions. Nothing was changed." }
git apply --ignore-whitespace "$here/Stage2.patch"

Write-Host "== file check =="
foreach ($f in "src/pages/PhotographySite.tsx","src/pages/PhotographyShowcase.tsx","src/pages/photography-showcase.css") {
  "{0}  exists={1}" -f $f, (Test-Path $f)
}
Write-Host "== npm run build =="
npm.cmd run build
$buildExit = $LASTEXITCODE
Write-Host "== git status AFTER ==" ; git status --short
Write-Host "BUILD EXIT CODE: $buildExit   (0 = success)"
