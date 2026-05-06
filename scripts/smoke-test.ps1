# Helfa end-to-end smoke test.
#
# Runs through register -> profile -> onboarding -> finalize -> tasks against
# the live Railway backend. Use after a deploy to confirm CORS, auth, and the
# task-generation pipeline are healthy.
#
# Usage:
#   .\scripts\smoke-test.ps1
#   .\scripts\smoke-test.ps1 -ApiUrl http://localhost:8080/api/v1
#
# Exit code: 0 on full pass, non-zero on first failure.

[CmdletBinding()]
param(
    [string]$ApiUrl = "https://immigration-helper-production.up.railway.app/api/v1"
)

$ErrorActionPreference = "Stop"

function Write-Step($n, $msg) {
    Write-Host ""
    Write-Host "─── [$n] $msg" -ForegroundColor Cyan
}
function Write-Pass($msg) { Write-Host "  ✓ $msg" -ForegroundColor Green }
function Write-Fail($msg) { Write-Host "  ✗ $msg" -ForegroundColor Red; exit 1 }

# Unique inputs so the test is rerunnable.
$stamp = [int][double]::Parse((Get-Date -UFormat %s))
$email = "smoke+$stamp@helfa.test"
$password = "SmokeTest!$stamp"
$name = "Smoke Test $stamp"

Write-Host "Helfa smoke test against $ApiUrl" -ForegroundColor Yellow
Write-Host "Test account: $email"

# 1. Register
Write-Step 1 "POST /auth/register"
try {
    $body = @{ name = $name; email = $email; password = $password } | ConvertTo-Json
    $reg = Invoke-RestMethod -Uri "$ApiUrl/auth/register" -Method Post `
        -ContentType "application/json" -Body $body
    if (-not $reg.token) { Write-Fail "no token returned" }
    Write-Pass "registered, token length $($reg.token.Length)"
    $token = $reg.token
} catch {
    Write-Fail "register failed: $($_.Exception.Message)"
}

$auth = @{ Authorization = "Bearer $token" }

# 2. Get current user
Write-Step 2 "GET /users/me"
try {
    $me = Invoke-RestMethod -Uri "$ApiUrl/users/me" -Headers $auth
    if ($me.email -ne $email) { Write-Fail "email mismatch: $($me.email)" }
    Write-Pass "user is $($me.email), tier $($me.subscriptionTier)"
} catch {
    Write-Fail "get user failed: $($_.Exception.Message)"
}

# 3. Onboarding steps 1-5
$steps = @(
    @{ n = 1; body = @{ nationality = "NG"; firstName = "Smoke" } },
    @{ n = 2; body = @{ citySlug = "munich" } },
    @{ n = 3; body = @{ visaPathway = "STUDENT" } },
    @{ n = 4; body = @{ familyStatus = "SINGLE"; familyInGermany = $false } },
    @{ n = 5; body = @{ arrivalDate = (Get-Date).AddDays(30).ToString("yyyy-MM-dd") } }
)
foreach ($s in $steps) {
    Write-Step "3.$($s.n)" "POST /users/me/onboarding/step/$($s.n)"
    try {
        $body = $s.body | ConvertTo-Json
        Invoke-RestMethod -Uri "$ApiUrl/users/me/onboarding/step/$($s.n)" `
            -Method Post -Headers $auth -ContentType "application/json" -Body $body | Out-Null
        Write-Pass "step $($s.n) saved"
    } catch {
        Write-Fail "step $($s.n) failed: $($_.Exception.Message)"
    }
}

# Step 6 finalize signal
Write-Step "3.6" "POST /users/me/onboarding/step/6"
try {
    Invoke-RestMethod -Uri "$ApiUrl/users/me/onboarding/step/6" `
        -Method Post -Headers $auth -ContentType "application/json" -Body "{}" | Out-Null
    Write-Pass "step 6 saved"
} catch {
    Write-Fail "step 6 failed: $($_.Exception.Message)"
}

# 4. Finalize
Write-Step 4 "POST /users/me/onboarding/finalize"
try {
    $fin = Invoke-RestMethod -Uri "$ApiUrl/users/me/onboarding/finalize" `
        -Method Post -Headers $auth
    Write-Pass "finalize ok, tasks generated: $($fin.taskCount)"
} catch {
    Write-Fail "finalize failed: $($_.Exception.Message)"
}

# 5. List tasks
Write-Step 5 "GET /tasks"
try {
    $tasks = Invoke-RestMethod -Uri "$ApiUrl/tasks?size=100" -Headers $auth
    if (-not $tasks.items -or $tasks.items.Count -eq 0) {
        Write-Fail "no tasks returned"
    }
    Write-Pass "$($tasks.items.Count) tasks returned"
    $first = $tasks.items[0]
    Write-Host "    e.g. [$($first.status)] $($first.title)" -ForegroundColor DarkGray
} catch {
    Write-Fail "list tasks failed: $($_.Exception.Message)"
}

# 6. Marketplace (public, but needs CORS to be sane)
Write-Step 6 "GET /marketplace"
try {
    $partners = Invoke-RestMethod -Uri "$ApiUrl/marketplace"
    Write-Pass "$($partners.Count) partners returned"
} catch {
    Write-Fail "marketplace failed: $($_.Exception.Message)"
}

# 7. Offices (public)
Write-Step 7 "GET /offices"
try {
    $offices = Invoke-RestMethod -Uri "$ApiUrl/offices"
    Write-Pass "$($offices.Count) offices returned"
} catch {
    Write-Fail "offices failed: $($_.Exception.Message)"
}

# 8. Cleanup — delete the smoke account
Write-Step 8 "DELETE /users/me (cleanup)"
try {
    Invoke-RestMethod -Uri "$ApiUrl/users/me" -Method Delete -Headers $auth | Out-Null
    Write-Pass "smoke account deleted"
} catch {
    Write-Host "  ! cleanup failed (non-fatal): $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "╔══════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  All checks passed                   ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Green
