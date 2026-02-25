#!/usr/bin/env pwsh
# Script de deploy automatico para tardo-web
# Ejecutar: .\deploy.ps1 "Mensaje del commit"
# O simplemente: .\deploy.ps1 (usa mensaje automatico)

param(
    [string]$Message = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  TARDO WEB - DEPLOY AUTOMATICO" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path ".git")) {
    Write-Host "[ERROR] No estas en el directorio del repositorio" -ForegroundColor Red
    Write-Host "Ejecuta: cd tardo-web" -ForegroundColor Yellow
    exit 1
}

Write-Host "[1/3] Agregando archivos..." -ForegroundColor Yellow
git add .

Write-Host "[2/3] Creando commit: $Message" -ForegroundColor Yellow
git commit -m "$Message"

if ($LASTEXITCODE -ne 0) {
    Write-Host "[INFO] No hay cambios para commitear" -ForegroundColor Yellow
    exit 0
}

Write-Host "[3/3] Subiendo a GitHub..." -ForegroundColor Yellow
git push

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] DEPLOY EXITOSO" -ForegroundColor Green
    Write-Host "Tu sitio se actualizara en 1-2 minutos" -ForegroundColor Gray
    Write-Host "URL: https://damisav.github.io/tardo-web/" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[ERROR] Fallo el push" -ForegroundColor Red
    Write-Host "Verifica tu conexion o permisos de GitHub" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
