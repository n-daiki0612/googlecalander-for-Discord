param(
  [Parameter(Mandatory = $true)] [string]$AppId,
  [Parameter(Mandatory = $true)] [string]$GuildId,
  [Parameter(Mandatory = $true)] [string]$BotToken,
  [string]$CommandsFile = ".\commands.json"
)

if (-not (Test-Path $CommandsFile)) {
  throw "commands file not found: $CommandsFile"
}

$raw = Get-Content -Path $CommandsFile -Raw -Encoding UTF8

# JSONとして妥当か先に検証
$null = $raw | ConvertFrom-Json

$uri = "https://discord.com/api/v10/applications/$AppId/guilds/$GuildId/commands"

$headers = @{
  Authorization = "Bot $BotToken"
  "Content-Type" = "application/json"
}

$response = Invoke-RestMethod -Method Put -Uri $uri -Headers $headers -Body $raw

Write-Host "Registered commands:" -ForegroundColor Green
$response | ForEach-Object { Write-Host "- /$($_.name)" }