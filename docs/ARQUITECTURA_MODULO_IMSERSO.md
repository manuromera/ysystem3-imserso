# Arquitectura recomendada del módulo IMSERSO

## Objetivo
El módulo no debe ser un fork del sistema, sino una capa de especialización 100% compatible con `ysystem3-srd`.

## Estrategia recomendada
1. **Dependencia de sistema**: el módulo exige `ysystem3-srd`.
2. **Subclase de hojas**:
   - Extender las hojas de PJ y PNJ del sistema, no reescribir la lógica de tiradas.
   - Registrar las hojas del módulo como hojas por defecto cuando el módulo esté activo.
3. **Terminología contextual**:
   - Cargar `lang/es.json` del módulo.
   - Registrar helpers `imsTerm`, `imsUI`, `imsHelp`.
   - Sustituir labels hardcodeados por helpers.
4. **Apariencia**:
   - Añadir una `themeClass` propia: `ysystem3-imserso-theme`.
   - Aplicarla a hojas, chat cards, panel de ayuda, generadores y diálogos.
5. **Generadores**:
   - Si el sistema ya tiene generador, envolverlo o sustituir solo su fuente de datos.
   - Si no lo tiene, crear uno con `data/imserso-generator-tables.json`.
6. **Ayuda contextual**:
   - Debe cambiar no solo los títulos, también las descripciones.
7. **Ítems**:
   - Mantener tipos internos del sistema (`arma`, `armadura`, etc.).
   - Cambiar solo presentación, iconografía y labels visibles.

## Tipos de ítems visibles
- `arma` -> Arma improvisada
- `armadura` -> Protección
- `escudo` -> Cobertura
- `objeto` -> Cachivache
- `poder` -> Travesura
- `talento` -> Talento
- `arquetipo` -> Tipo de jubilado

## Requisito de compatibilidad
No tocar el modelo de datos salvo que sea imprescindible. El módulo debe poder activarse y desactivarse sin corromper actores ni items existentes.
