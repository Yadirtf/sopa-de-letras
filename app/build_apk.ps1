param(
  [string]$ApiUrl = "https://wordhive-api.onrender.com/api/v1",
  [string]$SocketUrl = "https://wordhive-api.onrender.com"
)

Write-Host "Compilando APK Release de WordHive..." -ForegroundColor Cyan
Write-Host "API Target: $ApiUrl" -ForegroundColor Yellow
Write-Host "Socket Target: $SocketUrl" -ForegroundColor Yellow

flutter build apk --release `
  --dart-define=API_URL=$ApiUrl `
  --dart-define=SOCKET_URL=$SocketUrl

if ($LASTEXITCODE -eq 0) {
  Write-Host "APK compilada con exito en:" -ForegroundColor Green
  Write-Host "   app/build/app/outputs/flutter-apk/app-release.apk" -ForegroundColor White
} else {
  Write-Host "Error al compilar la APK." -ForegroundColor Red
}
