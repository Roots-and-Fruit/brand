# Copy DESIGN.md into index.html Agent contract <code> block (local file friendly).
# Canonical contract stays DESIGN.md. Re-run after every DESIGN.md edit.
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$mdPath = Join-Path $root "DESIGN.md"
$htmlPath = Join-Path $root "index.html"

if (-not (Test-Path $mdPath)) { throw "Missing DESIGN.md at $mdPath" }
if (-not (Test-Path $htmlPath)) { throw "Missing index.html at $htmlPath" }

$md = Get-Content -Raw -Encoding UTF8 $mdPath
# Normalize to LF so the HTML snapshot matches the markdown file on disk.
$md = $md -replace "`r`n", "`n" -replace "`r", "`n"
$md = $md.TrimEnd() + "`n"

$escaped = [System.Net.WebUtility]::HtmlEncode($md)
$html = Get-Content -Raw -Encoding UTF8 $htmlPath

$pattern = '(?s)(<code id="design-md-source">).*?(</code>)'
if ($html -notmatch 'id="design-md-source"') {
  throw 'index.html is missing <code id="design-md-source">'
}

$updated = [regex]::Replace($html, $pattern, "`${1}$escaped`${2}", 1)

Set-Content -Path $htmlPath -Value $updated -Encoding UTF8 -NoNewline
$lines = ($md -split "`n").Count
Write-Host "Wrote DESIGN.md into index.html #design-md-source ($lines lines)."
