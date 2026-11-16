# Run from the root of the Style Studio Photography repo:
#   powershell -ExecutionPolicy Bypass -File .\showcase-integration\apply-showcase.ps1
# Does NOT commit, push, merge or deploy.
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$pkg = Get-Content package.json -Raw | ConvertFrom-Json
if ($pkg.name -ne "style-studio-photography") { throw "Not the style-studio-photography repo (package name: $($pkg.name)). Stopping." }
if (-not (Test-Path "src/pages/PhotographySite.tsx")) { throw "src/pages/PhotographySite.tsx not found. Stopping." }

Write-Host "== git status BEFORE ==" ; git status --short

git apply --check --ignore-whitespace "$here/PhotographySite.patch"
if ($LASTEXITCODE -ne 0) { throw "Patch does not apply cleanly: your PhotographySite.tsx differs from the version I was given. Nothing was changed." }
git apply --ignore-whitespace "$here/PhotographySite.patch"
Copy-Item "$here/PhotographyShowcase.tsx" "src/pages/PhotographyShowcase.tsx" -Force
Copy-Item "$here/photography-showcase.css" "src/pages/photography-showcase.css" -Force

Write-Host "== file check =="
foreach ($f in "src/pages/PhotographySite.tsx","src/pages/PhotographyShowcase.tsx","src/pages/photography-showcase.css") {
  "{0}  exists={1}" -f $f, (Test-Path $f)
}

Write-Host "== npm run build =="
npm.cmd run build
$buildExit = $LASTEXITCODE

Write-Host "== git status AFTER ==" ; git status --short
Write-Host "BUILD EXIT CODE: $buildExit   (0 = success)"
