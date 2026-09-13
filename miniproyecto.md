# PROMPT MAESTRO — PLATAFORMA MODULAR DE SOPAS DE LETRAS ONLINE

## 0. ROL DEL AGENTE

Actúa simultáneamente como:

* Product Manager senior.
* Software Architect.
* UX/UI Designer senior.
* Full-Stack Engineer.
* Backend Engineer.
* Frontend Engineer.
* Database Architect.
* Game/Gameplay Engineer.
* QA Engineer.
* DevOps Engineer.
* Security Engineer.

Tu misión es analizar, diseñar y especificar una plataforma web de **Sopas de Letras online**, inicialmente orientada a ejecutarse en un mini servidor, pero diseñada desde el comienzo para poder escalar posteriormente.

NO debes pensar la aplicación como una única pieza monolítica difícil de mantener.

Piensa el sistema como un **rompecabezas modular**: cada módulo tiene una responsabilidad clara, entradas y salidas bien definidas, y puede evolucionar o sustituirse sin afectar innecesariamente a los demás.

---

# 1. VISIÓN DEL PRODUCTO

Construir una plataforma donde cualquier usuario pueda:

1. Crear una sopa de letras desde cero.
2. Definir un título.
3. Definir un tema.
4. Escribir una descripción/instrucciones.
5. Introducir una lista de palabras.
6. Configurar el tamaño de la cuadrícula.
7. Definir las direcciones permitidas.
8. Permitir palabras horizontales.
9. Permitir palabras verticales.
10. Permitir palabras diagonales.
11. Permitir palabras de izquierda a derecha.
12. Permitir palabras de derecha a izquierda.
13. Permitir palabras de arriba hacia abajo.
14. Permitir palabras de abajo hacia arriba.
15. Permitir combinaciones de las anteriores.
16. Configurar el nivel de dificultad.
17. Generar automáticamente la posición de las palabras.
18. Permitir cruces entre palabras cuando sea válido.
19. Completar automáticamente las celdas restantes.
20. Regenerar aleatoriamente la sopa manteniendo las mismas palabras.
21. Visualizar una previsualización antes de guardar.
22. Editar manualmente la sopa cuando sea necesario.
23. Guardar la sopa en una base de datos.
24. Publicarla.
25. Compartirla mediante un enlace.
26. Invitar amigos/jugadores.
27. Jugar online.
28. Medir el tiempo de resolución.
29. Detectar cuándo un usuario encuentra una palabra correctamente.
30. Registrar errores.
31. Registrar el tiempo de resolución.
32. Registrar resultados por jugador.
33. Mostrar un ranking Top 10.
34. Permitir competir contra otros jugadores.
35. Permitir descubrir sopas creadas por otros usuarios.
36. Permitir reutilizar/copiar una sopa existente.
37. Permitir compartir sopas.
38. Mantener estadísticas de juego.
39. Permitir posteriormente retos privados o públicos.

La plataforma debe tener una experiencia suficientemente sencilla para un usuario casual, pero con una base técnica capaz de crecer hacia una plataforma educativa/social.

---

# 2. PRINCIPIO FUNDAMENTAL DE ARQUITECTURA

Diseña el proyecto bajo el principio:

> "Separar responsabilidades, minimizar acoplamiento y maximizar reutilización."

No crear una aplicación donde:

* la lógica del juego esté mezclada con la UI;
* la generación de tableros esté mezclada con la persistencia;
* los rankings estén calculados directamente desde componentes visuales;
* las reglas estén codificadas directamente en botones;
* el frontend dependa de detalles internos de la base de datos;
* un cambio visual obligue a modificar el motor del juego.

La arquitectura debe permitir reemplazar una pieza sin romper las demás.

Ejemplo conceptual:

USER
↓
AUTH MODULE

PUZZLE CREATOR
↓
PUZZLE ENGINE
↓
PUZZLE VALIDATOR
↓
PUZZLE REPOSITORY

PLAYER
↓
GAME SESSION
↓
GAME ENGINE
↓
RESULT
↓
LEADERBOARD

DISCOVERY
↓
PUZZLE REPOSITORY

SHARING
↓
PUBLIC PUZZLE / CHALLENGE

Cada módulo debe tener responsabilidades independientes.

---

# 3. REQUISITOS FUNCIONALES PRINCIPALES

## 3.1 Usuarios

El sistema debe soportar inicialmente:

* usuario invitado;
* usuario registrado;
* creador;
* jugador.

Un mismo usuario puede tener todos esos roles.

Diseñar la arquitectura de autenticación para poder soportar posteriormente:

* email/password;
* magic link;
* OAuth;
* Google;
* otros proveedores.

No implementar necesariamente todos en MVP.

---

# 4. IDENTIDAD DE UNA SOPA DE LETRAS

Cada sopa debe ser una entidad independiente.

Debe tener como mínimo:

* id;
* slug;
* título;
* descripción;
* tema;
* idioma;
* creador;
* palabras;
* matriz;
* configuración;
* dificultad;
* estado;
* visibilidad;
* fecha de creación;
* fecha de actualización;
* versión;
* estadísticas.

Estados posibles:

* draft;
* published;
* archived.

Visibilidad:

* private;
* unlisted;
* public.

Preparar la arquitectura para agregar posteriormente:

* classroom/private group;
* protected;
* scheduled;
* challenge-only.

---

# 5. CREACIÓN DE SOPAS

El creador debe poder comenzar desde cero.

Flujo ideal:

1. Crear nueva sopa.
2. Introducir título.
3. Introducir tema.
4. Introducir instrucciones.
5. Seleccionar idioma.
6. Introducir palabras.
7. Configurar tamaño.
8. Configurar dificultad.
9. Configurar direcciones.
10. Generar sopa.
11. Validar.
12. Previsualizar.
13. Regenerar.
14. Ajustar.
15. Guardar.
16. Publicar.

---

# 6. LISTA DE PALABRAS

El usuario podrá introducir múltiples palabras.

Características:

* añadir palabra;
* eliminar palabra;
* editar palabra;
* ordenar;
* detectar duplicados;
* detectar palabras demasiado largas;
* detectar palabras inválidas;
* normalizar mayúsculas/minúsculas;
* definir tratamiento de tildes;
* definir tratamiento de ñ;
* definir si espacios son ignorados;
* definir si caracteres especiales se eliminan.

Ejemplo:

"ÁRBOL"

internamente puede normalizarse como:

ARBOL

pero conservar la versión original:

ÁRBOL

Esto permite mostrar correctamente la palabra al usuario mientras el motor utiliza una representación estable.

---

# 7. GENERADOR DE SOPA DE LETRAS

Crear un motor independiente:

PuzzleGenerator

Responsabilidad:

Convertir:

* lista de palabras;
* configuración;
* tamaño;
* reglas;

en:

* matriz válida;
* posiciones de palabras;
* metadata de solución.

NO debe depender del frontend.

---

# 8. DIRECCIONES

El motor debe soportar inicialmente estas direcciones:

HORIZONTAL →
HORIZONTAL ←
VERTICAL ↓
VERTICAL ↑
DIAGONAL ↘
DIAGONAL ↙
DIAGONAL ↖
DIAGONAL ↗

Permitir seleccionar:

* solo horizontal;
* horizontal + vertical;
* horizontal + vertical + diagonal;
* todas las direcciones.

Permitir posteriormente reglas diferentes.

---

# 9. PALABRAS INVERTIDAS

Una opción configurable:

allowReverseWords = true / false

Cuando está activada:

Una palabra puede aparecer:

CASA

o:

ASAC

El sistema debe seguir identificando correctamente la palabra original.

La dificultad debe aumentar cuando se habilitan:

* diagonales;
* palabras invertidas;
* palabras cruzadas;
* mayor densidad de letras;
* palabras similares;
* ausencia de lista visible.

Estas características deben ser configuraciones del motor, no comportamientos incrustados en la interfaz.

---

# 10. ALGORITMO DE GENERACIÓN

Diseña un algoritmo robusto de generación.

El algoritmo debe:

1. ordenar las palabras estratégicamente;
2. intentar colocar primero las palabras más difíciles;
3. intentar cruzar palabras cuando sea válido;
4. evitar conflictos;
5. validar límites de la matriz;
6. comprobar todas las colocaciones;
7. retroceder cuando una decisión produzca un tablero inválido;
8. completar espacios vacíos;
9. validar que las palabras originales continúan siendo localizables;
10. comprobar que no existen estados inconsistentes.

Considerar un algoritmo tipo:

* backtracking;
* constraint satisfaction;
* heurísticas;
* randomización controlada.

La generación debe poder utilizar una semilla aleatoria:

seed

para permitir reproducibilidad.

Ejemplo:

same seed + same words + same configuration = same puzzle.

Esto es importante para pruebas, debugging y reproducibilidad.

---

# 11. AUTOAYUDA / ASISTENTE DE CREACIÓN

El creador debe recibir ayuda durante la generación.

Ejemplos:

"La palabra ELECTROENCEFALOGRAMA no cabe en una cuadrícula 10x10."

"La cuadrícula recomendada para estas 15 palabras es 15x15."

"Actualmente 8 de 12 palabras pueden colocarse."

"Se recomienda habilitar diagonales para mejorar la distribución."

"No fue posible generar una configuración válida con estas restricciones."

El sistema debe ofrecer acciones como:

* aumentar cuadrícula;
* reducir dificultad;
* permitir diagonales;
* permitir palabras invertidas;
* regenerar;
* ajustar automáticamente;
* eliminar conflicto;
* sugerir configuración.

---

# 12. GENERACIÓN INTELIGENTE

Crear un concepto:

PuzzleAdvisor

El Advisor analiza:

* número de palabras;
* longitud;
* longitud máxima;
* longitud promedio;
* cantidad de letras;
* tamaño disponible;
* direcciones;
* dificultad;
* densidad;
* posibles conflictos.

Y recomienda:

* tamaño de cuadrícula;
* dificultad;
* configuraciones;
* cambios necesarios.

Ejemplo:

"Con 20 palabras y una longitud máxima de 16 caracteres, se recomienda una cuadrícula de 18x18."

Las recomendaciones deben ser heurísticas configurables, no valores mágicos dispersos por el código.

---

# 13. RELLENO AUTOMÁTICO

Una vez colocadas las palabras:

Completar las celdas restantes con letras aleatorias.

Pero hacerlo inteligentemente.

Evitar, cuando sea posible, crear demasiadas palabras accidentales.

Crear un componente:

FillerEngine

Responsabilidad:

* generar letras restantes;
* reducir palabras accidentales;
* mantener diversidad;
* respetar idioma.

Preparar arquitectura para motores futuros.

---

# 14. SOLUCIÓN

Nunca almacenar únicamente la matriz.

Guardar también explícitamente la solución.

Cada palabra debe almacenar:

* palabra original;
* palabra normalizada;
* dirección;
* startRow;
* startColumn;
* endRow;
* endColumn;
* encontrada;
* metadata necesaria.

Esto permite:

* validar respuestas;
* mostrar soluciones;
* calcular resultados;
* generar ayudas;
* revisar partidas;
* evitar depender de inferencias posteriores.

---

# 15. JUEGO

Separar totalmente el "juego" del "editor".

Crear:

GameEngine

Debe manejar:

* inicio;
* pausa;
* selección;
* validación;
* palabras encontradas;
* errores;
* tiempo;
* finalización;
* puntuación;
* estado.

El frontend solamente representa el estado.

---

# 16. GAME SESSION

Cada partida debe tener una entidad:

GameSession

Debe registrar:

* id;
* puzzleId;
* playerId;
* startedAt;
* completedAt;
* elapsedMs;
* mistakes;
* wordsFound;
* wordsTotal;
* score;
* status.

Estados:

* waiting;
* playing;
* paused;
* completed;
* abandoned;
* expired.

---

# 17. COMPETENCIA

El sistema debe soportar dos escenarios.

## Modo individual

El jugador intenta obtener el mejor tiempo.

## Modo desafío

Un creador comparte una sopa y otros jugadores intentan superarse.

Posteriormente:

## Modo competencia en tiempo real

Varios jugadores participan simultáneamente.

No implementar necesariamente todo en MVP.

Pero diseñar la arquitectura para permitirlo posteriormente.

---

# 18. RANKING

Cada sopa puede tener su propio ranking.

Ejemplo:

TOP 10

1. Carlos — 18.43 s
2. Ana — 19.15 s
3. Juan — 20.02 s

El ranking debe considerar:

* tiempo;
* penalizaciones;
* errores;
* fecha;
* estado válido de la partida.

No confiar únicamente en datos enviados desde el cliente.

El servidor debe validar el resultado.

---

# 19. ANTICHEAT

El usuario puede intentar manipular:

* timer;
* respuestas;
* score;
* requests.

Por lo tanto:

Nunca confiar ciegamente en:

* elapsedMs enviado por frontend;
* score enviado por frontend;
* palabras encontradas enviadas sin validación.

Crear un sistema de validación del lado servidor.

MVP:

Registrar timestamps de servidor.

Posteriormente:

* event sequence;
* rate limiting;
* detección de comportamiento extraño;
* sesiones firmadas;
* validación de movimientos.

El objetivo no es crear seguridad bancaria, sino evitar rankings trivialmente manipulables.

---

# 20. TOP 10

Debe existir:

Top 10 global por sopa.

Posteriormente:

* top global;
* top semanal;
* top mensual;
* top por usuario;
* top por categoría;
* top por dificultad.

---

# 21. DESCUBRIMIENTO DE SOPAS

Crear una sección:

"Explorar"

Debe mostrar:

* populares;
* recientes;
* más jugadas;
* mejor puntuadas;
* tendencia;
* por tema;
* por dificultad;
* por idioma.

Cada tarjeta de sopa debe mostrar:

* título;
* tema;
* creador;
* cantidad de palabras;
* dificultad;
* número de partidas;
* ranking;
* tiempo récord;
* fecha.

---

# 22. BÚSQUEDA

Implementar búsqueda por:

* título;
* tema;
* palabras;
* creador.

Posteriormente:

* tags;
* categorías;
* idioma;
* dificultad.

La búsqueda debe estar desacoplada del componente visual.

---

# 23. COPIAR UNA SOPA

Inspirándose en plataformas educativas que permiten reutilizar actividades, una sopa pública debe poder convertirse en una nueva copia editable del usuario.

Al copiar:

* crear nuevo puzzleId;
* nuevo owner;
* preservar configuración;
* preservar palabras;
* opcionalmente regenerar matriz;
* no compartir resultados de la sopa original con la copia.

Guardar referencia:

sourcePuzzleId

para conocer el origen.

---

# 24. COMPARTIR

Cada sopa debe tener URL amigable.

Ejemplo:

/puzzle/animales-del-bosque/a8fd92

o:

/p/a8fd92

Permitir:

* copiar enlace;
* compartir;
* QR posteriormente;
* challenge link posteriormente.

---

# 25. RETOS

Crear conceptualmente:

Challenge

Un reto puede contener:

* puzzle;
* creador;
* fecha creación;
* fecha expiración;
* máximo de jugadores;
* público/privado;
* ranking independiente.

Ejemplo:

"Supera mi tiempo en 60 segundos."

Esto puede quedar parcialmente implementado para MVP, pero la arquitectura debe contemplarlo.

---

# 26. EXPERIENCIA DEL CREADOR

Crear un editor moderno y sencillo.

Pantalla dividida conceptualmente:

IZQUIERDA:
Configuración

DERECHA:
Preview

Ejemplo:

---

| CONFIGURACIÓN | PREVISUALIZACIÓN     |
|                |                     |
| Título         |   A B C D E F       |
| Tema           |   G H O L A         |
| Palabras       |   ...               |
| Dificultad     |                     |
| Direcciones    |                     |
| Tamaño         |                     |
|                |                     |
| [GENERAR]      |                     |
----------------------------------------

La previsualización debe actualizarse sin obligar al usuario a navegar entre páginas.

---

# 27. UX DE CREACIÓN

No obligar al usuario a comprender algoritmos.

La UX debe traducir conceptos técnicos a decisiones simples.

Por ejemplo:

Dificultad:

🟢 Fácil
🟡 Media
🔴 Difícil
⚫ Experto

Pero internamente cada dificultad debe mapear a parámetros configurables.

Ejemplo:

Easy:

* sin reversas;
* horizontal/vertical;
* baja densidad.

Medium:

* horizontal;
* vertical;
* diagonal.

Hard:

* todas las direcciones;
* reversas;
* cruces;
* mayor densidad.

Expert:

* todas las direcciones;
* reversas;
* palabras similares;
* lista opcionalmente oculta.

No asumir que estos parámetros son definitivos. Diseñarlos como presets configurables.

---

# 28. UX DE JUEGO

Debe sentirse como un juego.

Pantalla:

---

| Sopa de Letras                               |
|                                              |
| Tema: Animales                               |
|                                              |
|             GRID                             |
|                                              |
|                                              |
|                                              |
| Palabras:                                    |
| 🟢 PERRO                                     |
| 🟢 GATO                                      |
| ⚪ TIGRE                                     |
| ⚪ LEON                                      |
|                                              |
| Tiempo: 00:32                                |
------------------------------------------------

En escritorio:

* mouse;
* click + drag;
* selección visual.

En móvil:

* touch;
* drag;
* gestos robustos;
* evitar que la página haga scroll accidentalmente.

---

# 29. INTERACCIÓN DE SELECCIÓN

La selección debe permitir:

* iniciar en una celda;
* arrastrar;
* determinar dirección;
* determinar longitud;
* validar palabra.

Debe soportar:

* mouse;
* touch;
* teclado posteriormente.

La selección visual no debe depender de un simple DOM overlay frágil.

Idealmente representar el tablero mediante una estructura que permita:

* canvas;
* SVG;
* DOM grid;
* WebGL futuro.

Abstraer el renderizador del GameEngine.

Crear concepto:

GridRenderer

---

# 30. ESTADO DEL JUEGO

No crear un estado duplicado innecesario.

Definir claramente:

PuzzleDefinition
GameState
PlayerState
UIState

Separar:

estado persistente;

estado temporal;

estado visual.

---

# 31. MODELO DE DATOS

Diseñar primero el modelo conceptual.

Entidades mínimas:

User
Puzzle
PuzzleVersion
PuzzleWord
PuzzleCell / Grid representation
PuzzleShare
GameSession
GameEvent
LeaderboardEntry
Challenge
Tag
Category

Evitar normalizar excesivamente la matriz si no es necesario.

Evaluar si la grid completa puede almacenarse eficientemente como:

JSON estructurado.

Pero las palabras y posiciones importantes deben ser entidades/datos consultables.

---

# 32. PUZZLE VERSIONING

Cada modificación importante debe poder producir una nueva versión.

Ejemplo:

Puzzle
↓
Version 1
↓
Version 2
↓
Version 3

No destruir innecesariamente la versión anterior.

Esto permite:

* debugging;
* historial;
* reproducibilidad;
* reabrir partidas;
* evitar inconsistencias.

---

# 33. REGLA CRÍTICA DE VERSIONES

Una GameSession debe apuntar siempre a una versión exacta de Puzzle.

Nunca a una sopa mutable.

Ejemplo:

gameSession.puzzleVersionId

Así, si el creador modifica la sopa después, una partida antigua sigue siendo válida.

---

# 34. API

Diseñar una API clara.

Ejemplo conceptual:

POST /api/auth/...

GET /api/puzzles
POST /api/puzzles
GET /api/puzzles/:id
PATCH /api/puzzles/:id
DELETE /api/puzzles/:id

POST /api/puzzles/:id/generate
POST /api/puzzles/:id/publish
POST /api/puzzles/:id/copy
POST /api/puzzles/:id/share

POST /api/game-sessions
POST /api/game-sessions/:id/start
POST /api/game-sessions/:id/move
POST /api/game-sessions/:id/complete

GET /api/puzzles/:id/leaderboard

GET /api/discover
GET /api/search

No implementar endpoints innecesarios.

Cada endpoint debe tener:

* request schema;
* response schema;
* validation;
* authentication requirement;
* authorization;
* error handling.

---

# 35. ARQUITECTURA DE BACKEND

Preferencia inicial:

Modular Monolith.

NO empezar necesariamente con microservicios.

Los módulos deben estar separados internamente.

Ejemplo:

/modules
/auth
/users
/puzzles
/puzzle-generator
/puzzle-validator
/game
/leaderboard
/challenges
/discovery
/sharing
/notifications

Esto permite crecer posteriormente hacia servicios independientes si realmente hace falta.

---

# 36. REGLA DE DEPENDENCIAS

Un módulo no debe conocer detalles internos de otro módulo.

Ejemplo:

Leaderboard no debería consultar directamente tablas internas de GameSession.

Debe consumir un contrato:

GameCompletedEvent

y producir:

LeaderboardUpdated

Esto mantiene bajo acoplamiento.

---

# 37. EVENTOS DE DOMINIO

Diseñar potencialmente:

PuzzleCreated
PuzzleGenerated
PuzzlePublished
PuzzleCopied
GameStarted
WordFound
GameCompleted
GameAbandoned
ChallengeCreated
LeaderboardUpdated

No necesariamente implementar un message broker en MVP.

Puede existir inicialmente un EventBus interno.

Arquitectura:

Application
↓
Domain Event
↓
Internal Event Bus

Posteriormente:

Internal Event Bus
↓
Redis / RabbitMQ / Kafka

---

# 38. BASE DE DATOS

Elegir una base de datos apropiada y justificarla.

Preferencia inicial:

PostgreSQL.

Razón:

* relaciones;
* rankings;
* consultas;
* filtros;
* usuarios;
* juegos;
* integridad;
* extensibilidad.

Redis puede ser opcional para:

* sesiones temporales;
* rate limiting;
* cache;
* rankings rápidos;
* realtime posteriormente.

No añadir Redis solamente por moda.

---

# 39. MINI SERVIDOR

La primera versión debe poder ejecutarse en un mini servidor.

Diseñar pensando en:

* pocos recursos;
* bajo consumo;
* despliegue sencillo;
* Docker;
* backups;
* logs;
* health checks.

Arquitectura inicial potencial:

Internet
↓
Reverse Proxy
↓
Frontend
↓
Backend API
↓
PostgreSQL

Opcional:

Redis

No introducir Kubernetes en el MVP salvo necesidad real.

---

# 40. DOCKER

Preparar contenedores independientes:

frontend
backend
database

Opcional:

redis
worker

Debe existir:

docker-compose.yml

para entorno local y una variante para producción.

---

# 41. FRONTEND

Separar:

* páginas;
* componentes;
* estado;
* servicios;
* modelos;
* lógica del juego.

Nunca colocar la lógica principal de generación dentro de componentes UI.

Estructura conceptual:

/features
/auth
/puzzle-editor
/puzzle-player
/leaderboard
/discovery
/challenges

Cada feature debe poder evolucionar de forma independiente.

---

# 42. DESIGN SYSTEM

Crear un pequeño design system.

Definir:

* colores;
* tipografía;
* spacing;
* radios;
* sombras;
* botones;
* inputs;
* cards;
* dialogs;
* alerts;
* badges;
* progress indicators.

Crear componentes reutilizables.

Ejemplo:

Button
Input
Select
Modal
Card
Badge
Tooltip
Toast
Tabs
Drawer
Grid
WordList
Timer
Leaderboard

---

# 43. UI RESPONSIVE

Mobile-first.

Breakpoints:

* mobile;
* tablet;
* desktop.

No diseñar primero solo escritorio.

La cuadrícula debe adaptarse al viewport.

Nunca permitir que una sopa 20x20 destruya la UX en móvil.

---

# 44. ACCESIBILIDAD

Considerar:

WCAG.

Soportar:

* contraste;
* focus;
* teclado;
* aria labels;
* navegación;
* lectores de pantalla cuando sea viable.

No depender únicamente del color para indicar:

* palabra encontrada;
* error;
* estado.

---

# 45. INTERNACIONALIZACIÓN

Preparar desde el comienzo para múltiples idiomas.

Inicial:

* español.

Arquitectura preparada para:

* inglés;
* portugués;
* francés;
* etc.

No hardcodear todos los textos en componentes.

---

# 46. NORMALIZACIÓN DE PALABRAS

Definir claramente:

originalWord
normalizedWord
searchWord

Ejemplo:

Original:
"Árbol de Navidad"

Normalizado:
ARBOL DE NAVIDAD

Search representation:
ARBOLDENAVIDAD

Decidir de forma configurable cómo tratar:

* espacios;
* tildes;
* Ñ;
* caracteres especiales.

---

# 47. ESTADÍSTICAS

Por sopa:

* total de partidas;
* completadas;
* abandonadas;
* tiempo promedio;
* mejor tiempo;
* errores promedio;
* porcentaje de éxito.

Por usuario:

* sopas creadas;
* sopas resueltas;
* mejor tiempo;
* partidas;
* victorias;
* posiciones en ranking.

No implementar analítica avanzada todavía, pero dejar el modelo preparado.

---

# 48. PRIVACIDAD

Definir:

* qué datos son públicos;
* qué datos son privados;
* si el nombre del jugador aparece en rankings;
* opción de alias;
* eliminación de cuenta;
* eliminación de contenido.

Nunca publicar datos personales innecesarios.

---

# 49. MODERACIÓN

Como cualquier usuario podrá crear contenido, considerar desde arquitectura:

* report puzzle;
* hide puzzle;
* delete puzzle;
* moderation status.

No hace falta un sistema de moderación complejo en MVP.

Pero la entidad debe existir conceptualmente.

---

# 50. SEO Y COMPARTIBILIDAD

Una sopa pública debe tener:

* URL estable;
* título;
* descripción;
* metadata;
* Open Graph;
* preview para redes sociales.

Ejemplo:

"Descubre esta sopa de letras sobre animales"

Debe poder compartirse fácilmente.

---

# 51. PANEL DEL USUARIO

Crear dashboard.

Secciones:

Mis sopas
Mis partidas
Favoritos
Retos
Estadísticas

Una sopa debe mostrar:

* estado;
* visibilidad;
* partidas;
* mejor tiempo;
* última modificación.

---

# 52. HOMEPAGE

La página principal debe responder inmediatamente:

"¿Qué puedo hacer aquí?"

Opciones principales:

CREAR SOPA

EXPLORAR SOPAS

JUGAR UN RETO

La experiencia debe reducir al mínimo el número de clics para empezar a jugar.

---

# 53. FLUJO DE USUARIO PRINCIPAL

## Usuario nuevo

Home
↓
Explorar
↓
Seleccionar sopa
↓
Jugar
↓
Completar
↓
Ver resultado
↓
Ver ranking
↓
Crear cuenta opcionalmente

---

# 54. FLUJO DE CREACIÓN

Home
↓
Crear
↓
Título + tema
↓
Palabras
↓
Configuración
↓
Generar
↓
Preview
↓
Ajustar
↓
Publicar
↓
Compartir

---

# 55. PRINCIPIO UX

La primera sopa no debe requerir tutorial obligatorio.

La interfaz debe ser suficientemente intuitiva.

Utilizar:

* defaults inteligentes;
* sugerencias contextuales;
* mensajes de error útiles;
* preview en vivo;
* acciones claras.

---

# 56. MANEJO DE ERRORES

No mostrar:

"Error 500".

Mostrar:

"No fue posible colocar todas las palabras."

Y sugerir:

"Aumentar cuadrícula"

"Permitir diagonales"

"Reducir dificultad"

"Regenerar"

Los errores técnicos sí deben quedar registrados en logs.

---

# 57. OBSERVABILIDAD

Preparar:

* logs estructurados;
* correlation/request ID;
* health endpoint;
* métricas básicas;
* errores;
* duración de requests.

Endpoints:

/health
/ready

---

# 58. SEGURIDAD

Implementar:

* validación de inputs;
* rate limiting;
* sanitización;
* protección contra XSS;
* CSRF cuando corresponda;
* autorización;
* permisos por recurso;
* control de acceso;
* límites sobre tamaño de payload.

No permitir que un usuario edite una sopa que no le pertenece.

---

# 59. TESTING

Crear pruebas independientes para:

### PuzzleGenerator

* palabra cabe;
* palabra no cabe;
* diagonal;
* reversa;
* cruces;
* grid llena;
* múltiples semillas.

### PuzzleValidator

* todas las palabras están;
* ninguna palabra se perdió;
* coordenadas correctas;
* matriz válida.

### GameEngine

* palabra correcta;
* palabra incorrecta;
* completar;
* timer;
* error;
* abandonar.

### Leaderboard

* orden correcto;
* empate;
* penalización.

### API

* autenticación;
* autorización;
* validaciones;
* errores.

### E2E

Crear sopa → jugar → completar → ranking.

---

# 60. REQUISITO MUY IMPORTANTE: DETERMINISMO

El motor debe permitir:

SeededRandomGenerator.

Una sopa generada con la misma:

* seed;
* lista;
* configuración;
* algoritmo;

debe poder reproducirse.

Esto es fundamental para:

* debugging;
* testing;
* soporte;
* generación reproducible.

---

# 61. REQUISITO MUY IMPORTANTE: SEPARAR DEFINICIÓN Y PRESENTACIÓN

PuzzleDefinition ≠ PuzzleUI.

PuzzleDefinition debe ser una estructura independiente del frontend.

Ejemplo conceptual:

{
"title": "Animales",
"size": 15,
"words": [...],
"grid": [...],
"placements": [...],
"rules": {...}
}

El frontend solamente renderiza esa definición.

---

# 62. REQUISITO MUY IMPORTANTE: SEPARAR MOTOR Y PERSISTENCIA

El PuzzleGenerator no debe saber que existe PostgreSQL.

Debe poder ejecutarse así:

input → generator → output

sin DB.

Lo mismo:

GameEngine

debe poder ser probado sin API ni UI.

---

# 63. REGLA ARQUITECTÓNICA

Cada módulo debe responder:

1. ¿Qué responsabilidad tiene?
2. ¿Qué datos recibe?
3. ¿Qué devuelve?
4. ¿Qué otros módulos conoce?
5. ¿Qué otros módulos NO debería conocer?

Crear un diagrama de dependencias.

---

# 64. TECNOLOGÍAS

No asumir tecnologías sin justificar.

Proponer una stack inicial adecuada para:

* mini servidor;
* desarrollo rápido;
* mantenimiento sencillo;
* buena UX;
* tipado;
* testing;
* escalabilidad.

Como posible referencia evaluar:

Frontend:
React / Next.js

Backend:
Node.js / TypeScript

DB:
PostgreSQL

ORM:
Prisma / Drizzle

Realtime futuro:
WebSocket / Socket.IO

Cache futuro:
Redis

Deployment:
Docker + reverse proxy

Pero antes de fijar la stack, comparar alternativas brevemente y elegir en función del proyecto.

---

# 65. MVP

Definir explícitamente qué entra en MVP.

El MVP debe incluir:

* usuarios;
* crear sopa;
* agregar palabras;
* generar automáticamente;
* horizontal;
* vertical;
* diagonal;
* reversas;
* dificultades;
* preview;
* guardar;
* publicar;
* explorar;
* jugar;
* timer;
* resultados;
* top 10;
* compartir URL;
* responsive;
* base de datos.

No incluir inicialmente:

* chat;
* videollamadas;
* sistema educativo completo;
* pagos;
* microservicios;
* Kubernetes;
* IA compleja;
* social network completa.

---

# 66. ROADMAP

Proponer fases:

FASE 1
MVP funcional.

FASE 2
Mejoras de creación + estadísticas.

FASE 3
Retos.

FASE 4
Competencia realtime.

FASE 5
Características educativas.

FASE 6
Escalabilidad.

---

# 67. POSIBLES FUNCIONES FUTURAS

Dejar arquitectura preparada para:

* pistas;
* imágenes;
* audio;
* categorías;
* favoritos;
* comentarios;
* likes;
* perfiles;
* logros;
* badges;
* niveles;
* experiencia;
* torneos;
* ligas;
* retos;
* clases;
* profesores;
* estudiantes;
* grupos privados;
* códigos de acceso;
* QR;
* impresión;
* exportación PDF;
* múltiples idiomas;
* modo accesible;
* analítica educativa;
* IA para sugerir palabras;
* IA para generar temas;
* IA para crear automáticamente sopas;
* generación desde un texto;
* generación desde un PDF/documento.

---

# 68. REFERENCIA FUNCIONAL: EDUCAPLAY

Analiza Educaplay como referencia de producto, no como algo que deba copiarse literalmente.

Tomar como inspiración conceptual:

* búsqueda de palabras mediante arrastre;
* horizontal, vertical y diagonal;
* sentidos inversos;
* lista de palabras;
* penalización de errores;
* límite de tiempo;
* ocultar palabras;
* ranking;
* compartir;
* retos;
* reutilización/copia;
* impresión.

Estas características están presentes en actividades y documentación pública de Educaplay.

No copiar:

* branding;
* textos;
* diseño;
* assets;
* código;
* identidad visual.

Utilizar únicamente como benchmark funcional.

---

# 69. RESULTADO ESPERADO DEL AGENTE

Antes de escribir código, produce obligatoriamente:

## A. Product Requirements Document

Describir:

* problema;
* usuarios;
* objetivos;
* casos de uso;
* MVP;
* no-MVP;
* roadmap.

## B. Arquitectura

Mostrar:

* frontend;
* backend;
* database;
* modules;
* event flow;
* deployment.

## C. Modelo de datos

Mostrar:

* entidades;
* campos;
* relaciones;
* índices;
* constraints.

## D. API Contract

Para cada endpoint:

* method;
* path;
* request;
* response;
* auth;
* errors.

## E. UX

Diseñar:

* sitemap;
* user flows;
* wireframes conceptuales;
* estados vacíos;
* errores;
* loading;
* mobile.

## F. UI

Definir:

* design system;
* componentes;
* layout;
* responsive;
* estados.

## G. Motor de generación

Explicar:

* algoritmo;
* heurísticas;
* backtracking;
* random seed;
* validación;
* complejidad.

## H. Motor de juego

Explicar:

* estados;
* selección;
* timer;
* validación;
* scoring.

## I. Ranking

Explicar:

* cálculo;
* orden;
* seguridad;
* desempates.

## J. Testing

Definir:

* unit;
* integration;
* E2E;
* casos extremos.

## K. DevOps

Definir:

* Docker;
* env variables;
* backups;
* deployment;
* health checks;
* logs.

---

# 70. FORMATO DE RESPUESTA DEL AGENTE

No comiences directamente a programar.

Primero entrega:

1. RESUMEN EJECUTIVO.
2. INTERPRETACIÓN DEL PRODUCTO.
3. SUPUESTOS.
4. REQUISITOS FUNCIONALES.
5. REQUISITOS NO FUNCIONALES.
6. ROLES DE USUARIO.
7. CASOS DE USO.
8. ARQUITECTURA.
9. DIAGRAMA DE MÓDULOS.
10. DIAGRAMA DE FLUJO.
11. MODELO DE DATOS.
12. API.
13. UX.
14. UI.
15. MOTOR DE SOPA.
16. MOTOR DE JUEGO.
17. RANKING.
18. SEGURIDAD.
19. TESTING.
20. DEPLOYMENT.
21. MVP.
22. ROADMAP.
23. RIESGOS.
24. DECISIONES ARQUITECTÓNICAS.

Después de eso:

25. PROPONER ESTRUCTURA DE CARPETAS.
26. PROPONER ORDEN DE IMPLEMENTACIÓN.
27. IMPLEMENTAR POR MÓDULOS.

---

# 71. REGLA CONTRA SOBREINGENIERÍA

No crear infraestructura porque "podría ser útil".

Cada componente tecnológico debe responder:

¿Por qué existe?

¿Qué problema resuelve?

¿Qué coste añade?

¿Es necesario en MVP?

Preferir:

simple + modular + mantenible

sobre:

complejo + distribuido + innecesario.

---

# 72. REGLA DE ESCALABILIDAD

Diseñar para poder evolucionar.

Pero no diseñar como si mañana hubiera 10 millones de usuarios.

El sistema debe ser:

MVP-ready

y

scale-ready.

---

# 73. REGLA DE CALIDAD

No aceptar implementaciones donde:

* la lógica está duplicada;
* existen números mágicos;
* la base de datos es consultada directamente desde componentes;
* el frontend decide arbitrariamente resultados;
* el timer depende del reloj local sin validación;
* el algoritmo de generación está acoplado a React;
* los rankings pueden falsificarse fácilmente;
* no existen validaciones;
* no existen pruebas para el motor.

---

# 74. CRITERIO FINAL DE ÉXITO

La plataforma final debe permitir que una persona sin conocimientos técnicos pueda:

1. Entrar.
2. Crear una sopa.
3. Escribir 10–20 palabras.
4. Elegir dificultad.
5. Pulsar "Generar".
6. Ver inmediatamente una sopa válida.
7. Publicarla.
8. Compartir el enlace.
9. Otra persona abre el enlace.
10. Juega desde celular o PC.
11. Termina.
12. Ve su tiempo.
13. Ve el Top 10.
14. Intenta superar a sus amigos.

Todo este flujo debe sentirse:

* rápido;
* divertido;
* claro;
* moderno;
* responsive;
* confiable.

---

# 75. INSTRUCCIÓN FINAL AL AGENTE

No trates este proyecto como una simple página web.

Trátalo como una **plataforma modular de creación y competición de juegos de palabras**.

La prioridad arquitectónica es:

DOMINIO
→ REGLAS
→ MOTOR
→ CASOS DE USO
→ API
→ UI

y no:

UI
→ lógica improvisada
→ base de datos.

Diseña cada pieza como un bloque independiente.

El sistema debe permitir cambiar:

* el algoritmo de generación;
* el motor de renderizado;
* la base de datos;
* el sistema de autenticación;
* el sistema de ranking;
* el sistema de realtime;

sin reconstruir toda la plataforma.

Cuando debas tomar una decisión arquitectónica, explica:

DECISIÓN
RAZÓN
ALTERNATIVAS
COSTE
BENEFICIO
IMPACTO FUTURO

No inventes funcionalidades que no estén justificadas.

No programes hasta tener clara la arquitectura.

Primero diseña el sistema.

Después implementa el MVP por módulos.

Después valida cada módulo con pruebas.

Finalmente integra todo y realiza pruebas E2E del flujo completo:

CREAR → GENERAR → PUBLICAR → COMPARTIR → JUGAR → COMPLETAR → RANKING.
