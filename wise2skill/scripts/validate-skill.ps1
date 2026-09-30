param([string]$SkillRoot = (Split-Path -Parent $PSScriptRoot))

$ErrorActionPreference = 'Stop'
$required = @('SKILL.md','README.md','references/visual_standard.md','references/reference-implementations.md','templates/production_handoff.md','templates/asset_manifest.md','templates/qa_checklist.md','schemas/project.schema.json','schemas/asset.schema.json','schemas/visual_board.schema.json','tests/skill_validation.md','tests/regression_cases.md')
$missing = $required | Where-Object { -not (Test-Path (Join-Path $SkillRoot $_)) }
if ($missing) { throw "Missing required files: $($missing -join ', ')" }

$skill = Get-Content -Raw (Join-Path $SkillRoot 'SKILL.md')
if ($skill -notmatch '(?ms)^---\s*\nname: wise2-cinematic-website-handoff\s*\ndescription:') { throw 'SKILL.md frontmatter is missing or invalid.' }
if ($skill -notmatch 'Never introduce crowns') { throw 'The global no-crown rule is missing.' }
$handoff = Get-Content -Raw (Join-Path $SkillRoot 'templates/production_handoff.md')
1..20 | ForEach-Object {
  $heading = '## {0:d2}' -f $_
  if ($handoff -notmatch [regex]::Escape($heading)) { throw "Handoff section $($_) is missing." }
}

Get-ChildItem -Recurse -Filter '*.json' (Join-Path $SkillRoot 'schemas') | ForEach-Object { Get-Content -Raw $_.FullName | ConvertFrom-Json | Out-Null }
Write-Host "PASS: $($required.Count) required files, 20 handoff sections, and JSON schemas validated."
