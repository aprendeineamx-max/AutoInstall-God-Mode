@echo off
:: Credenciales para la configuración automática de GitHub

:: Usuario de Git (Para los commits)
set GIT_USER_NAME="aprendeinea.mx"
set GIT_USER_EMAIL="aprendeinea.mx@gmail.com"

:: Token Personal de Acceso (Fine-grained)
:: Se usa este por defecto ya que es más seguro y moderno
set GITHUB_TOKEN=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

:: Token Clásico (Como respaldo si fuera necesario, aunque el script usará el principal)
set GITHUB_TOKEN_CLASSIC=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

echo Credenciales cargadas exitosamente...
