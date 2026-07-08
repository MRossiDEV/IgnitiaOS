# Clean and restart Next.js development server
Write-Host "Cleaning Next.js cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Write-Host "Cache cleared!" -ForegroundColor Green

Write-Host "`nStarting development server..." -ForegroundColor Yellow
npm run dev

