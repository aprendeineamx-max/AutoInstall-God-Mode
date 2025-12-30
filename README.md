# AutoInstall Entorno GitHub

Este repositorio contiene un script automatizado para instalar y configurar todo el entorno de desarrollo de GitHub en una nueva PC con Windows.

## ¿Qué instala?

El script `setup.bat` descargará e instalará automáticamente las últimas versiones de:

*   **Git**: Sistema de control de versiones.
*   **GitHub CLI (`gh`)**: Herramienta de línea de comandos de GitHub.
*   **GitHub Desktop**: Interfaz gráfica para Git.
*   **Visual Studio Code**: Editor de código.

## ¿Qué configura?

*   **Git Global**: Configura tu nombre de usuario y correo electrónico.
*   **Autenticación**: Inicia sesión automáticamente en GitHub CLI usando tu token personal.

## Instrucciones de Uso

1.  **Descarga**: Copia la carpeta completa a tu nueva PC (por ejemplo, en el Escritorio).
2.  **Credenciales**: Verifica que el archivo `credentials.bat` esté en la misma carpeta. Este archivo ya contiene tus claves.
    > **IMPORTANTE**: No compartas el archivo `credentials.bat` con nadie, ya que contiene tus tokens de acceso privados.
3.  **Ejecución**: Haz doble clic en el archivo `setup.bat`.
4.  **Confirmación**: Si Windows solicita permisos de administrador, acéptalos. Verás una ventana negra (consola) ejecutando los pasos uno a uno.

## Solución de Problemas

*   **Error "winget is not recognized"**: Asegúrate de tener Windows 10 (versión 1709 o superior) o Windows 11. Normalmente `winget` viene instalado por defecto. Si no, actualiza Windows.
*   **La consola se cierra muy rápido**: Si hay un error crítico (como falta de credenciales), la consola se pausará para que puedas leerlo. Si todo sale bien, al final te pedirá presionar una tecla para salir.
