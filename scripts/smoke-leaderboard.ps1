$ErrorActionPreference = 'Stop'
$projectId = 'word-quest-ppeeradet'
$apiKey = 'AIzaSyBCM-kakQvlMg6Y59MR3rSDZq0Ws6to3xk'
$authUrl = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$apiKey"
$baseUrl = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents"
$authA = $null
$authB = $null
$documentPath = $null
$progressPath = $null

function New-TestAuth {
  Invoke-RestMethod -Method Post -Uri $authUrl -ContentType 'application/json' -Body '{"returnSecureToken":true}'
}

function Remove-TestAuth($account) {
  if ($account -and $account.idToken) {
    $body = @{idToken = $account.idToken} | ConvertTo-Json -Compress
    Invoke-RestMethod -Method Post -Uri "https://identitytoolkit.googleapis.com/v1/accounts:delete?key=$apiKey" -ContentType 'application/json' -Body $body | Out-Null
  }
}

try {
  $authA = New-TestAuth
  $authB = New-TestAuth
  if ($authA.localId -notmatch '^[A-Za-z0-9_-]+$') { throw 'Unexpected test UID' }
  $nameKey = 'qa-' + ([Guid]::NewGuid().ToString('N').Substring(0, 8))
  $entryId = $authA.localId + '_' + $nameKey
  $documentPath = "leaderboard/$entryId"
  $documentUrl = "$baseUrl/$documentPath"
  $headersA = @{Authorization = "Bearer $($authA.idToken)"}
  $headersB = @{Authorization = "Bearer $($authB.idToken)"}
  $data = @{fields = @{
    uid = @{stringValue = $authA.localId}
    nameKey = @{stringValue = $nameKey}
    displayName = @{stringValue = 'QA Test'}
    xp = @{integerValue = '25'}
    stars = @{integerValue = '5'}
    lastPlayedAt = @{timestampValue = (Get-Date).ToUniversalTime().ToString('o')}
  }} | ConvertTo-Json -Depth 8 -Compress

  Invoke-RestMethod -Method Patch -Uri $documentUrl -Headers $headersA -ContentType 'application/json' -Body $data | Out-Null
  'Owner write: OK'
  $otherRead = Invoke-RestMethod -Method Get -Uri $documentUrl -Headers $headersB
  if ($otherRead.fields.displayName.stringValue -ne 'QA Test') { throw 'Other player read mismatch' }
  'Other player read: OK'

  $query = @{structuredQuery = @{
    from = @(@{collectionId = 'leaderboard'})
    orderBy = @(@{field = @{fieldPath = 'xp'}; direction = 'DESCENDING'})
    limit = 100
  }} | ConvertTo-Json -Depth 8 -Compress
  $rank = Invoke-RestMethod -Method Post -Uri "$baseUrl`:runQuery" -Headers $headersB -ContentType 'application/json' -Body $query
  if (-not @($rank | Where-Object { $_.document.name -like "*/$documentPath" }).Count) { throw 'QA score missing from shared ranking' }
  'Shared ranking query: OK'

  $otherWriteDenied = $false
  try { Invoke-RestMethod -Method Patch -Uri $documentUrl -Headers $headersB -ContentType 'application/json' -Body $data | Out-Null }
  catch { $otherWriteDenied = $_.Exception.Response.StatusCode.value__ -eq 403 }
  if (-not $otherWriteDenied) { throw 'Another player could overwrite the score' }
  'Other player overwrite: blocked'

  $progressPath = "players/$nameKey"
  $progressUrl = "$baseUrl/$progressPath"
  $progress = @{fields = @{
    displayName = @{stringValue = 'QA Test'}; xp = @{integerValue = '25'}; stars = @{integerValue = '5'}
    streak = @{integerValue = '1'}; completed = @{integerValue = '1'}; missionUnlocked = @{integerValue = '2'}
    petIds = @{arrayValue = @{values = @(@{integerValue = '1'}, @{integerValue = '2'})}}
    completedMissions = @{arrayValue = @{values = @(@{integerValue = '1'})}}
    egg = @{integerValue = '20'}; eggsHatched = @{integerValue = '0'}
    mastery = @{mapValue = @{fields = @{}}}; errors = @{mapValue = @{fields = @{}}}
    lastPlayedAt = @{timestampValue = (Get-Date).ToUniversalTime().ToString('o')}
  }} | ConvertTo-Json -Depth 10 -Compress
  Invoke-RestMethod -Method Patch -Uri $progressUrl -Headers $headersA -ContentType 'application/json' -Body $progress | Out-Null
  $otherProgress = Invoke-RestMethod -Method Get -Uri $progressUrl -Headers $headersB
  if ($otherProgress.fields.missionUnlocked.integerValue -ne '2') { throw 'Other player could not load same-name progress' }
  'Same-name progress on another account: OK'
}
finally {
  if ($progressPath) {
    & .\node_modules\.bin\firebase.CMD firestore:delete $progressPath --project $projectId --force --non-interactive | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Warning "QA progress cleanup failed: $progressPath" }
  }
  if ($documentPath) {
    & .\node_modules\.bin\firebase.CMD firestore:delete $documentPath --project $projectId --force --non-interactive | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Warning "QA document cleanup failed: $documentPath" }
  }
  Remove-TestAuth $authA
  Remove-TestAuth $authB
}
