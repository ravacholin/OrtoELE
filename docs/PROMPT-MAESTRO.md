# ORTOGRAFÍA LAB — Plan maestro profundizado (100% procedural, sin IA)

> **Actualización (Fase 2 — dictado con alineación por distancia de edición).**
> El dictado dejó de evaluarse con un cotejo posicional/palabra-a-cadena que se
> desalineaba en cuanto el estudiante omitía o agregaba una palabra. Ahora se
> alinea la transcripción con el texto correcto **token a token** mediante
> programación dinámica (Needleman–Wunsch), de forma 100 % procedural y
> determinista:
> - **`src/utils/dictationAlignment.ts`** (nuevo): `alignDictation()` clasifica
>   cada token como *correcto · solo tilde · error de grafía · palabra cambiada ·
>   omitida · de más*, con una precisión ponderada (la tilde penaliza poco; la
>   grafía, a medias; omitir/cambiar, del todo) y deriva veredicto + calidad SRS.
> - **`DictationExercise.tsx`** (sesión adaptativa) y la pestaña **Dictado** de
>   `TrainingHub.tsx` muestran ahora el **diff palabra por palabra** y consumen
>   la misma alineación en lugar de comparar índice contra índice.
>
> Próximas fases (previstas): cablear la **escritura libre** (`analyzeText`) y
> los **escape rooms** ya existentes; ampliar contenido **B2/C1/C2**; y
> gamificación honesta.

> **Actualización (Fase 1 — motor de sesión honesto y adaptativo).** Se
> reconstruyó de raíz la lógica de aprendizaje sin abandonar el diseño
> procedural/offline:
> - **Sesiones finitas y adaptativas** (`src/utils/sessionEngine.ts`,
>   `src/components/SessionRunner.tsx`): reemplazan los bucles infinitos
>   `item[i % length]`. Cada sesión tiene principio → ejercicios paso a paso
>   (con barra de progreso) → **pantalla de resultados real**. La selección
>   prioriza repasos vencidos (SRS) → errores recurrentes → ítems nuevos
>   filtrados por el **nivel MCER** del estudiante, e interleava categorías.
> - **Todos los ejercicios alimentan el SRS**: cada paso llama
>   `srsManager.recordAttempt`.
> - **Más variedad de formatos** desde los mismos metadatos
>   (`proceduralEngine.ts`): completar la grafía dudosa
>   (`tryGenerateFillGrapheme`), cazar el error en contexto
>   (`generateErrorSpotting`), marcar la sílaba tónica
>   (`generateAccentPlacement`) y evaluación tolerante que distingue el
>   "casi por tilde" del error de grafía (`evaluateAnswer`).
> - **Honestidad de datos**: se eliminaron el perfil por defecto inflado, los
>   estados SRS sembrados y las curvas/métricas fabricadas. Un usuario nuevo
>   arranca en cero y la UI muestra estados vacíos honestos hasta tener datos
>   reales.
> - **Desafío del día jugable**: se ejecuta como secuencia real y solo se marca
>   cumplido al terminarlo.
>
> Próximas fases (previstas): cablear la **escritura libre** (`analyzeText`) y
> los **escape rooms** ya existentes; dictado con alineación por distancia de
> edición; ampliar contenido **B2/C1/C2**; y gamificación honesta.

> **Actualización (foco en grafías).** La app se reorganizó para que **el
> centro sea la ortografía de las palabras** (cómo se escriben: b/v, s/c/z,
> g/j, h, ll/y, r/rr…). El entrenamiento abre en un módulo dedicado de
> **Grafías** (elección de la forma correcta en contexto, vía
> `generateSpellingChoice`), y las pestañas se agrupan en **Núcleo · Grafías**
> (grafías, memoria visual, familias & sufijos, dictado) y **Secundario**
> (tildes, puntuación, mayúsculas). Se retiraron de la interfaz funciones que
> «se iban de mambo» o que sin IA daban una falsa sensación de corrección:
> **Escritura libre**, **Escape Orto**, **Analytics / Curva de olvido** y
> **Modo Docente**. El antiguo «Orto Coach socrático» se mantiene como panel
> de **Pistas** escalonadas (sin disfraz de IA). Las estructuras de datos y el
> motor de estas funciones siguen en el repositorio pero ya no se exponen.

> Este documento profundiza el prompt maestro original y lo **contrasta con la
> implementación real**. La aplicación es un laboratorio de adquisición
> ortográfica ELE (A1–C2) **completamente procedural**: no usa ningún motor de
> IA, ninguna clave de API ni ninguna llamada de inferencia externa. Toda la
> lógica (análisis de texto, feedback, generación de ejercicios, repetición
> espaciada, desafío del día) se deriva de **reglas del español** y de los
> **metadatos curados** del banco léxico, y se ejecuta localmente en el navegador.

## 1. Principio rector: honestidad procedural

El corrector **solo señala lo que puede verificarse por regla**. Nunca "adivina"
la intención del estudiante. La "regla de oro" del motor (`analyzeText`,
`getMisspellingIndex`) es no marcar como error ninguna forma que sea una palabra
válida del español (por eso se excluyen homógrafos verbales como *publico*,
*practico*, *numero*, *medico*…). Esto evita falsos positivos y mantiene la
confianza pedagógica.

## 2. Arquitectura de datos (curada y estática)

- `src/data/orthographyBank.ts` — **barrel** que agrega el banco base y los
  módulos de ampliación.
- `src/data/bank/words.ts`, `words2.ts` — banco léxico curado (≈100 ítems y
  creciendo), con `syllables` + `stressedSyllable` escritos y verificados a mano.
- `src/data/bank/supporting.ts` — contrastes mínimos, input estructurado,
  descubrimiento, familias, dictados, diagnóstico, escape y prompts de escritura.
- `src/data/bank/punctuation.ts` — ejercicios de **Puntuación** (§24).
- `src/data/bank/capitals.ts` — ejercicios de **Mayúsculas** (§25).
- `scripts/validateBank.ts` — validador **solo de desarrollo/CI** (no runtime):
  comprueba coherencia silábica, tildes de esdrújulas, ids únicos, etc. Corre en
  `npm run lint`. **No** introduce ningún silabador en tiempo de ejecución: el
  repertorio sigue siendo curado y estático.

## 3. Progresión MCER (§40 completada — A1 a C2)

**A1** — correspondencia sonido/grafía; mayúscula inicial y punto; signos de
interrogación/exclamación de apertura y cierre; b/v y h de alta frecuencia;
c/qu/k, r/rr; palabras muy frecuentes; días, meses e idiomas en minúscula.

**A2** — agudas, llanas y esdrújulas frecuentes; tildes de -ción/-sión de uso
común; b/v, g/j, h, c/s/z; dictado contextualizado; nombres propios de países y
ciudades.

**B1** — tilde diacrítica (monosílabos); interrogativos/exclamativos con tilde;
hiatos y diptongos; sufijos (-ción/-sión, -dad, -aje, -mente); coma de conectores
y de subordinada antepuesta; revisión de textos breves.

**B2** — palabras derivadas y compuestas; adverbios en -mente; acentuación
compleja (tríadas verbo/sustantivo: público/publico/publicó); puntuación
discursiva (punto y coma, dos puntos, incisos); mayúsculas de instituciones y
acontecimientos.

**C1** *(completado aquí)* — **Acentuación:** esdrújulas cultas y tecnicismos
(análisis, hipótesis, régimen, parámetro), cambios de acentuación en el plural
(examen/exámenes, joven/jóvenes, régimen/regímenes), hiatos cultos (continúa,
garantía). **Grafías:** h intercalada y muda en cultismos (exhaustivo, cohesión),
x/s (contexto/contento), gü. **Puntuación:** incisos explicativos vs.
especificativos, vocativos, punto y coma entre oraciones relacionadas, raya de
inciso. **Mayúsculas:** títulos de obras (solo la primera palabra), cargos vs.
instituciones, uso tras dos puntos. **Morfología:** cultismos con -sión/-ción,
prefijación culta (des-, re-, in-, sub-). Objetivo de dominio: automatización de
la mayoría de las formas de frecuencia media-alta.

**C2** *(completado aquí)* — **Dominio ortográfico integral:** convenciones
editoriales avanzadas (comillas latinas «», rayas, sangrías de cita); puntuación
discursiva de textos largos (cohesión, conectores complejos, incisos anidados);
tilde diacrítica en contextos ambiguos (solo/sólo histórico, aun/aún, este/éste);
mayúsculas de matiz (usos expresivos, antonomasia); extranjerismos y su marcado;
homófonos cultos (a ver/haber, halla/haya/aya, rebelar/revelar). Objetivo:
representación ortográfica **estable y automatizada**, distinguiendo *conocer la
regla* de *dominar la forma* (ambas se miden por separado: `ruleKnowledgeScore` y
`automatedSpellingScore` en el estado SRS).

## 4. Distinción CONOCER vs. DOMINAR

El estado SRS de cada ítem guarda dos puntuaciones separadas:
`ruleKnowledgeScore` (puede explicar la regla) y `automatedSpellingScore` (escribe
la forma sin detenerse a pensar). El motor adaptativo cambia el **tipo** de
actividad (reconocimiento → discriminación → contexto → familia léxica → memoria
visual → producción → recuperación diferida) en lugar de repetir mecánicamente la
misma tarjeta.

## Apéndice A — Reemplazos procedurales de las funciones que el prompt planteaba con IA

| Función del prompt (originalmente IA) | Reemplazo procedural determinista | Dónde |
|---|---|---|
| **Tutor socrático "ORTO COACH"** (§30) | Pistas escalonadas (nivel 1/2/3) + microanálisis (silabación, ancla visual, confusables, recuperación activa) derivados de los **metadatos del ítem**. No hay generación de texto libre. | `SocraticCoachDrawer.tsx`, `socraticClues` en el banco |
| **Evaluación de escritura libre** (§28–29) | `analyzeText()`: índice de formas mal escritas conocidas + reglas verificables (mayúscula inicial, ¿?/¡! de apertura, coma de conectores, días/meses/idiomas en minúscula, nombres propios, uniones indebidas). Marca `[ORT] [TIL] [PUN] [MA] [SEG]` con la "regla de oro" anti-falsos-positivos. | `proceduralEngine.ts` |
| **Dictado inteligente** (§26–27) | Reproducción con `speechSynthesis` (voz del navegador) + **alineación por distancia de edición** (Needleman–Wunsch) que clasifica cada token (exacta / solo tilde / grafía / palabra cambiada / omitida / de más) tolerando inserciones y omisiones. | `dictationAlignment.ts`, `DictationExercise.tsx`, `TrainingHub.tsx` (Dictado), `speech.ts` |
| **Generación de ejercicios** (§10) | Generadores deterministas sembrados por PRNG (`generateSpellingChoice`, `buildContrastChallenge`, `generateExerciseBatch`) a partir del banco. Mismo ítem → mismas opciones. | `proceduralEngine.ts` |
| **Motor adaptativo / SRS** (§32–33) | SRS propio basado en recuperación activa (estados NUEVO→APRENDIENDO→INCIERTO→ESTABLE→DOMINADO). | `srsEngine.ts` |
| **Desafío del día** (§37) | `assembleDailyChallenge()`: selección reproducible por fecha (PRNG sembrado con `YYYY-MM-DD`) priorizando las categorías más débiles del perfil de error. | `proceduralEngine.ts`, `Dashboard.tsx` |
| **Corrección de puntuación/mayúsculas** (§24–25) | Comparación normalizada contra la forma canónica curada (sin inferencia). | `TrainingHub.tsx` (tabs Puntuación/Mayúsculas), `bank/punctuation.ts`, `bank/capitals.ts` |

**Todo lo que requería IA se descartó o se reemplazó por lógica de reglas.** El
endpoint `GET /api/health` lo refleja: `{ engine: "procedural-local", ai: false }`.

## Apéndice B — Verificación

```bash
bun install
bun run lint     # tsc --noEmit && tsx scripts/validateBank.ts
bun run dev      # servidor Express en :3000  (GET /api/health → ai:false)
```
