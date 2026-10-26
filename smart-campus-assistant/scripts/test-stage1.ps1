# test-stage1.ps1
# Run this from the smart-campus-assistant/ root after setting DB_PASSWORD in server/.env
# It creates the database, starts the server, tests /api/health, then stops the server.

$PSQL = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$ErrorActionPreference = "Stop"

Write-Host "`n=== Stage 1 Verification Script ===" -ForegroundColor Cyan

# ── Step 1: Read DB credentials from server/.env ──────────────────────────────
$envFile = Join-Path $PSScriptRoot "..\server\.env"
$envVars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match "^([^#=]+)=(.*)$") {
        $envVars[$Matches[1].Trim()] = $Matches[2].Trim()
    }
}
$env:PGPASSWORD = $envVars["DB_PASSWORD"]
$dbUser = $envVars["DB_USER"]
$dbName = $envVars["DB_NAME"]
$dbHost = $envVars["DB_HOST"]
$dbPort = $envVars["DB_PORT"]

Write-Host "`n[1] DB credentials loaded from server/.env" -ForegroundColor Green
Write-Host "    Host: $dbHost`:$dbPort  User: $dbUser  DB: $dbName"

# ── Step 2: Create database if it doesn't exist ───────────────────────────────
Write-Host "`n[2] Checking / creating database '$dbName'..." -ForegroundColor Yellow
$exists = & $PSQL -h $dbHost -p $dbPort -U $dbUser -t -c "SELECT 1 FROM pg_database WHERE datname='$dbName'" 2>&1
if ($exists -match "1") {
    Write-Host "    Database already exists." -ForegroundColor Green
} else {
    & $PSQL -h $dbHost -p $dbPort -U $dbUser -c "CREATE DATABASE $dbName" 2>&1
    Write-Host "    Database created." -ForegroundColor Green
}

# ── Step 3: Start the Express server in background ────────────────────────────
Write-Host "`n[3] Starting Express server..." -ForegroundColor Yellow
$serverDir = Join-Path $PSScriptRoot "..\server"
$serverJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    node dist/index.js 2>&1
} -ArgumentList $serverDir

# Wait up to 10 seconds for the server to be ready
$ready = $false
for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Milliseconds 500
    try {
        $resp = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($resp.StatusCode -eq 200) { $ready = $true; break }
    } catch { }
}

# ── Step 4: Test /api/health ──────────────────────────────────────────────────
if ($ready) {
    Write-Host "`n[4] Server is up. Testing GET /api/health..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/health" -Method GET
    Write-Host "    Response:" -ForegroundColor Green
    $response | ConvertTo-Json | Write-Host

    if ($response.success -eq $true -and $response.database -eq "connected") {
        Write-Host "`n[PASS] Health endpoint returned success=true, database=connected" -ForegroundColor Green
    } else {
        Write-Host "`n[FAIL] Unexpected response from health endpoint" -ForegroundColor Red
        Write-Host ($response | ConvertTo-Json)
    }
} else {
    Write-Host "`n[FAIL] Server did not become ready within 10s. Job output:" -ForegroundColor Red
    Receive-Job $serverJob | Write-Host
}

# ── Step 5: Stop the server ───────────────────────────────────────────────────
Stop-Job $serverJob
Remove-Job $serverJob
Write-Host "`n[5] Server stopped." -ForegroundColor Cyan
Write-Host "`n=== Test complete. To start for real: open two terminals and run ===" -ForegroundColor Cyan
Write-Host "    Terminal 1 (server): cd server && npm run dev" -ForegroundColor White
Write-Host "    Terminal 2 (client): cd client && npm run dev" -ForegroundColor White
Write-Host "    Then open http://localhost:3000 in your browser" -ForegroundColor White
