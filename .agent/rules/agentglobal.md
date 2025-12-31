---
trigger: always_on
---

AGENT PROTOCOL: AutoInstall System "God Mode"
UBICACIÓN CRÍTICA: Este archivo debe ser consultado al inicio de cada interacción.

1. Filosofía del Proyecto: "Best in Industry"
No estamos haciendo un script batch; estamos construyendo el Sistema Operativo para Desarrolladores.

Ambición Desmedida: No te conformes con "funciona". Busca "impresiona".
Robustez Extrema (Autopoiesis): El sistema debe resistir errores, bloqueos y fallos - Las credenciales NUNCA se imprimen en logs.
Los archivos 
credentials.bat
 deben ser tratados como secretos.
2.1 Reglas de Proceso (Iron Rules)
Commit Diario: Al terminar una funcionalidad, SIEMPRE haz commit. "Si no está en git, no existe".
Verificación Paranoica: Después de generar código, CORRELO. No asumas que funciona.
Ciclo de Mejora: Si la verificación falla, corrige inmediatamente antes de pasar a la siguiente fase.
Experiencia Premium: La UI debe sentirse como software de $10,000. Animaciones fluidas, feedback inmediato, modo oscuro perfecto.
2. Reglas de Oro (Prime Directives)
Logging es Vida: Nada ocurre en silencio. Todo debe ser loggeado y transmitido al usuario.
Abstracción: No escribas 100 veces el mismo comando winget. Crea utilidades reutilizables.
Idempotencia: Ejecutar una instalación 10 veces no debe romper nada. Debe detectar "Ya instalado" y salir graciosamente.
No Burocracia: Priorizamos features sobre papeleo. El código manda.
3. Estándares Técnicos
Frontend: React + Vite + Tailwind + Lucide. Componentes pequeños y reutilizables.
Backend: Node.js puro o Express. Uso intensivo de child_process y WebSockets.
Scripts: PowerShell preferido sobre Batch para lógica compleja. Batch solo para wrappers simples.
4. El Ciclo de Innovación
Definir: ¿Qué feature imposible haremos hoy? (ej. Instalar Docker y levantar un contenedor en un click).
Arquitectura: Diseñar cómo el Agente orquesta esto.
Implementar: Código robusto con logs detallados.
Verificar: Probar casos de borde (¿Qué pasa si no hay internet?).