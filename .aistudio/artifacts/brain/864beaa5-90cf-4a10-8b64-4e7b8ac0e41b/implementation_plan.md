# Cinemática Introductoria en Tiempo Real — The Blood Of The Bird

Secuencia cinematográfica inmersiva interactiva en tiempo real (20–25 segundos) que narra la transición del pato comando desde la ciudad nocturna hacia la pesadilla infinita de The Backrooms mediante un noclip accidental, con renderizado procedural 2.5D, cámara cinematográfica, efectos VHS/glitch, diseño sonoro analógico y transición fluida al gameplay en primera persona.

### Decisiones Críticas y Preferencias Confirmadas

> [!IMPORTANT]
> Decisiones de diseño confirmadas por el usuario durante la fase de consulta:
> - **Estilo de Diálogos**: Subtítulos cinematográficos estilo VHS con efectos de radio militar (distorsión sutil, texto fósforo ámbar/verde, beeps de transmisión táctica).
> - **Ritmo y Duración**: Secuencia inmersiva completa de 20 a 25 segundos, respetando la atmósfera de terror psicológico con botón **SALTAR** interactivo disponible desde el frame 0.
> - **Integración con Gameplay**: Al finalizar o saltar, la transición sitúa la cámara exactamente en la posición del pato en el Nivel 1 de The Backrooms, activando los controles de primera persona y el sistema de combate sin recargar la pantalla.

---

## 1. Visión General y Concepto

La cinemática introductoria transforma el inicio de *The Blood Of The Bird* de un salto directo a un prólogo cinematográfico coherente:
- **Atmósfera**: Terror analógico y soledad urbana que desemboca en horror liminal.
- **Protagonista**: Pato blanco antropomórfico con chaqueta militar, boina/gorro militar y escopeta corredera, modelado y animado en tiempo real aprovechando la arquitectura de `PlayerRenderer`.
- **Narrativa visual**: La normalidad inquietante de un callejón nocturno húmedo se desmorona cuando una anomalía en un muro de ladrillos atrae al pato; al tocarlo, su ala atraviesa la materia física provocando un fallo catastrófico de la realidad (noclip) y arrojándolo al abismo amarillo infinito de The Backrooms (Nivel 1).

---

## 2. Experiencia de Usuario y Dirección Visual

### Fases de la Secuencia Cinematográfica

1. **Escena 1 — La Ciudad Nocturna (0.0s – 5.5s)**:
   - Cámara en tercera persona cinematográfica en plano medio-largo siguiendo al pato caminando lentamente por una calle mojada y oscura.
   - Iluminación de farolas titilantes, asfalto reflectante, siluetas de edificios y viento lejano.
2. **Escena 2 — El Ruido Anómalo (5.5s – 10.0s)**:
   - Un sonido sordo y orgánico resuena desde el interior de una pared lateral.
   - El pato detiene su marcha, gira la cabeza con tensión y baja el arma un instante.
   - Subtítulo VHS táctico: *"¿Qué fue eso...?"* acompañado de estática de radio militar.
   - La cámara cambia a un plano medio lateral mientras el pato avanza cautelosamente hacia el muro.
3. **Escena 3 — La Pared y el Noclip Accidental (10.0s – 14.5s)**:
   - El pato alza su ala derecha con plumaje blanco y palpa la textura de la pared.
   - El ala no colisiona: se hunde y atraviesa la solidez de la pared como si fuera líquido o espacio vacío.
4. **Escena 4 — Ruptura de Realidad y Glitch (14.5s – 17.0s)**:
   - Aberración cromática violenta, desgarros horizontales (tearing), salto de frames y caída de texturas.
   - El pato pierde el equilibrio, es absorbido por la fisura dimensional y el audio colapsa en ruido analógico blanco.
5. **Escena 5 — Despertar en The Backrooms (17.0s – 21.0s)**:
   - Silencio absoluto, seguido del nacimiento del zumbido eléctrico monofónico (60Hz) característico de las luces fluorescentes.
   - La cámara muestra al pato incorporándose en el Nivel 1 de The Backrooms: alfombra húmeda, papel tapiz amarillo enfermo y pasillos infinitos.
   - Diálogos subtitulados: *"¿Dónde... estoy?"* y *"Esto no estaba aquí..."*.
6. **Escena 6 — Preparación de la Escopeta y Transición (21.0s – 24.5s)**:
   - El pato toma su escopeta, revisa la recámara, acciona el mecanismo con un chasquido metálico contundente.
   - La cámara retrocede para mostrar su soledad en la inmensidad del laberinto, y a continuación realiza un zoom cinemático en travelling continuo que entra en los ojos del pato, cambiando a la perspectiva en 1ª persona.
   - Se activan los controles del jugador y comienza la partida.

### Botón SALTAR
- Ubicado permanentemente en la esquina superior derecha (`top-4 right-4 z-50`).
- Estilo táctico minimalista: marco ámbar/rojo con tipografía retro `Share Tech Mono`, efecto scanline y hover reactivo.
- Accesible tanto para ratón como pantalla táctil móvil (`touch-manipulation`).
- Al activarse: apaga los audios de la cinemática con fade-out de 100ms, inicializa el Nivel 1 y coloca al jugador listo en 1ª persona.

---

## 3. Decisiones Técnicas y de Diseño

- **Renderizado Dinámico Dual**:
  - Para la sección de la ciudad: Canvas procedural retro 2.5D que recrea un callejón nocturno con perspectiva raycasting/vectorial sincronizada con las proporciones y paleta del juego.
  - Para la sección de The Backrooms: Utilización directa del motor de raycasting del Nivel 1 (`RaycasterEngine`), asegurando que las luces, texturas de alfombra y empapelado amarillo coincidan exactamente con el inicio del juego.
- **Modelo del Protagonista**:
  - Reutilización y extensión de `PlayerRenderer`, añadiendo estados de animación específicos de la cinemática (`inspect_wall`, `noclip_fall`, `backrooms_dazed`, `shotgun_pump`).
- **Sistema de Audio Cinematográfico**:
  - Ampliación de `SoundManager` con un canal dedicado para sintetizadores de radio militar, zumbido de vacío dimensional, eco de pasos en asfalto húmedo, chasquido de corredera de escopeta y glitch de frecuencia.

---

## 4. Arquitectura del Sistema

```
┌────────────────────────────────────────────────────────┐
│                      StartMenu                         │
│             [JUGAR] Button Trigger                     │
└──────────────────────────┬─────────────────────────────┘
                           │ setGameView('cinematic')
                           ▼
┌────────────────────────────────────────────────────────┐
│                 IntroCinematic Component               │
│  - Timeline & Sequencer (0s -> 24.5s)                  │
│  - Cinematic Camera Interpolation (Pos / Angle / FOV)  │
│  - Animated Duck Commando (`PlayerRenderer`)           │
│  - City / Noclip / Backrooms Dual Canvas Pipeline      │
│  - VHS Glitch, Subtitles & Military Radio Audio        │
│  - Skip Button ("SALTAR")                              │
└──────────────────────────┬─────────────────────────────┘
                           │ onFinish() or onSkip()
                           ▼
┌────────────────────────────────────────────────────────┐
│                   App.tsx Coordinator                  │
│  - initLevel(1) in Level 1 Backrooms                   │
│  - Seamless Camera Transition to 1st Person            │
│  - Enable Player Controls & HUD                        │
│  - setGameView('playing')                              │
└────────────────────────────────────────────────────────┘
```

### Componentes y Módulos a Crear / Modificar
1. `src/types.ts`: Añadir `'cinematic'` a `GameView` y estados de animación cinematográfica al pato.
2. `src/game/cinematicAudio.ts`: Generador procedural Web Audio de ambiente urbano nocturno, crujido de pared anómala, distorsión dimensional de noclip, radio militar militarizada y chasquido de escopeta corredera.
3. `src/components/IntroCinematic.tsx`: Controlador visual y de tiempo en tiempo real, con botón SALTAR, renderizado del callejón, noclip glitch, revelación de Backrooms y subtítulos VHS.
4. `src/game/playerRenderer.ts`: Soporte para poses cinematográficas de palpación de pared, desorientación y recarga manual.
5. `src/App.tsx`: Enlace del botón JUGAR con la cinemática, gestión del botón SALTAR y transición limpia a primera persona.
