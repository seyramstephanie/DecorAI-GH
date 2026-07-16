# Runs the Spring Boot API without a globally installed Maven.
# Prefers tools/apache-maven-*/bin/mvn.cmd, then PATH mvn, then java -jar.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Find-Mvn {
  $toolsDir = Join-Path $root "tools"
  if (Test-Path $toolsDir) {
    $local = Get-ChildItem -Path $toolsDir -Filter "mvn.cmd" -Recurse -ErrorAction SilentlyContinue |
      Where-Object { $_.FullName -match 'bin[\\/]mvn\.cmd$' } |
      Select-Object -First 1
    if ($local) { return $local.FullName }
  }

  $fromPath = Get-Command mvn -ErrorAction SilentlyContinue
  if ($fromPath) { return $fromPath.Source }

  $common = @(
    "$env:ProgramFiles\Apache\maven\bin\mvn.cmd",
    "$env:ProgramFiles\Maven\bin\mvn.cmd",
    "$env:USERPROFILE\apache-maven\bin\mvn.cmd"
  )
  foreach ($p in $common) {
    if (Test-Path $p) { return $p }
  }
  return $null
}

if (-not $env:JAVA_HOME) {
  $jdk = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
  if (Test-Path $jdk) { $env:JAVA_HOME = $jdk }
}

$mvn = Find-Mvn
if ($mvn) {
  Write-Host "Using Maven: $mvn"
  & $mvn -f (Join-Path $root "backend\pom.xml") spring-boot:run
  exit $LASTEXITCODE
}

$jar = Join-Path $root "backend\target\decorai-api-1.0.0.jar"
if (Test-Path $jar) {
  Write-Host "Maven not found - starting prebuilt jar: $jar"
  Write-Host "NOTE: rebuild with Maven after backend code changes."
  & java -jar $jar
  exit $LASTEXITCODE
}

Write-Host "Maven is not installed and no jar was found."
Write-Host "Download Apache Maven and extract to:"
Write-Host "  $root\tools\apache-maven-3.9.6"
Write-Host "Or install Maven system-wide and ensure mvn is on PATH."
Write-Host "Then run: npm run server"
exit 1
