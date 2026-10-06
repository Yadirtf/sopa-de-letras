# 🔤 WordHive — Sopa de Letras Multijugador
## Documento Técnico de Proyecto

> **Versión:** 1.0.0  
> **Fecha:** Octubre 2026  
> **Estado:** Planificación / Diseño Inicial  
> **Clasificación:** Documento Técnico Interno

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Visión del Producto](#2-visión-del-producto)
3. [Objetivos](#3-objetivos)
4. [Alcance del Proyecto](#4-alcance-del-proyecto)
5. [Análisis de Usuarios y Público Objetivo](#5-análisis-de-usuarios-y-público-objetivo)
6. [Requerimientos Funcionales](#6-requerimientos-funcionales)
7. [Requerimientos No Funcionales](#7-requerimientos-no-funcionales)
8. [Diseño de Arquitectura del Sistema](#8-diseño-de-arquitectura-del-sistema)
9. [Selección y Diseño de Base de Datos](#9-selección-y-diseño-de-base-de-datos)
10. [Diseño del Backend](#10-diseño-del-backend)
11. [Diseño del Frontend (Flutter)](#11-diseño-del-frontend-flutter)
12. [Diseño de la Landing Page](#12-diseño-de-la-landing-page)
13. [Flujos de Usuario](#13-flujos-de-usuario)
14. [Estrategia de Gamificación y Psicología del Juego](#14-estrategia-de-gamificación-y-psicología-del-juego)
15. [Estrategia de Despliegue en Render](#15-estrategia-de-despliegue-en-render)
16. [Seguridad](#16-seguridad)
17. [Plan de Desarrollo por Fases](#17-plan-de-desarrollo-por-fases)
18. [Riesgos y Mitigaciones](#18-riesgos-y-mitigaciones)
19. [Glosario](#19-glosario)

---

## 1. Introducción

### 1.1 Contexto

**WordHive** es una plataforma de juegos de sopa de letras multijugador en tiempo real, diseñada para ser accesible, adictiva y socialmente conectada. El proyecto nace de la necesidad de modernizar un juego clásico —la sopa de letras— llevándolo al ecosistema digital con mecánicas de competición social, invitaciones entre amigos y progresión en tiempo real.

A diferencia de las implementaciones tradicionales de sopa de letras (offline, sin interacción social y sin progresión), WordHive introduce un loop de juego que combina:

- **Competencia social:** Ver quién encuentra más palabras en tiempo real.
- **Conexión de amigos:** Sistema de amistades, invitaciones y salas privadas.
- **Accesibilidad sin fricción:** Los visitantes pueden explorar sopas de letras sin registrarse; el registro se requiere solo para jugar y socializar.
- **Diseño adictivo:** Aplicación de principios psicológicos de gamificación para mantener al usuario enganchado.

### 1.2 Problemática

Los juegos de sopa de letras digitales existentes presentan los siguientes problemas:

| Problema | Impacto |
|---|---|
| Son experiencias solitarias (sin multijugador) | Baja retención a largo plazo |
| Interfaces desactualizadas o poco atractivas | Abandono rápido del usuario |
| No hay incentivo social ni de competencia | Falta de motivación para volver |
| Curva de registro muy alta (formularios largos) | Alta tasa de abandono en onboarding |
| No hay sistema de descubrimiento de contenido | El usuario no sabe qué jugar |

WordHive resuelve cada uno de estos puntos con una arquitectura moderna, social y diseñada desde la psicología del usuario.

### 1.3 Propuesta de Valor

> **"Juega solo, vence a todos."**

WordHive convierte la sopa de letras en un deporte social. Cada partida es una carrera. Cada amigo es un rival. Cada palabra encontrada es un punto de orgullo.

---

## 2. Visión del Producto

### 2.1 Descripción General

WordHive es una aplicación multijugador en tiempo real donde los usuarios pueden:

- **Explorar** un catálogo infinito de sopas de letras (experiencia tipo Pinterest sin login).
- **Competir** en salas privadas o públicas contra amigos.
- **Crear** sus propias sopas de letras personalizadas.
- **Socializar** a través de un sistema de amigos, invitaciones y notificaciones.
- **Progresar** en un ranking dentro de cada partida en tiempo real.

### 2.2 Plataformas

| Plataforma | Tecnología | Estado |
|---|---|---|
| **App Móvil / Desktop** | Flutter (iOS, Android, Web) | Principal |
| **Landing Page** | HTML + CSS + JS Vanilla | Complementaria |
| **Backend API** | Node.js + Fastify | Core |
| **Base de Datos** | PostgreSQL + Redis | Persistencia + Cache/RT |
| **Despliegue** | Render.com | Dev a Staging a Producción |

---

## 3. Objetivos

### 3.1 Objetivo General

Desarrollar una plataforma digital de sopa de letras multijugador en tiempo real, con una interfaz amigable e inclusiva para todas las edades (niños, adolescentes y adultos), un backend robusto con gestión de salas, usuarios y notificaciones, y un sistema de gamificación que maximice la retención y el engagement del usuario.

### 3.2 Objetivos Específicos

#### Arquitectura y Backend

- **OE-01:** Diseñar e implementar una API RESTful con soporte WebSocket para comunicación en tiempo real entre jugadores en una sala.
- **OE-02:** Implementar un sistema de autenticación seguro basado en correo electrónico y PIN de 4 dígitos, con recuperación de contraseña mediante Nodemailer.
- **OE-03:** Diseñar un esquema de base de datos relacional (PostgreSQL) que soporte usuarios, amistades, sopas de letras, salas, participantes y notificaciones.
- **OE-04:** Implementar un sistema de caché con Redis para gestionar el estado de las salas activas en tiempo real y reducir la carga sobre la base de datos principal.
- **OE-05:** Desarrollar un microservicio de notificaciones que gestione invitaciones a sala, solicitudes de amistad y alertas del sistema.

#### Funcionalidad del Juego

- **OE-06:** Implementar la lógica de creación de sopas de letras con posicionamiento algorítmico de palabras en una cuadrícula.
- **OE-07:** Desarrollar el motor de sala multijugador que sincronice en tiempo real el progreso de todos los participantes (palabras encontradas, puntaje).
- **OE-08:** Implementar el sistema de detección de fin de partida y despliegue del modal de resultados con ranking final.
- **OE-09:** Crear el sistema de compartir sala mediante enlaces únicos y QR codes.

#### Experiencia de Usuario

- **OE-10:** Desarrollar una landing page minimalista, visualmente atractiva y psicológicamente diseñada para convertir visitantes en usuarios registrados.
- **OE-11:** Implementar el catálogo de sopas de letras con scroll infinito tipo Pinterest para usuarios no autenticados.
- **OE-12:** Diseñar la interfaz de juego en Flutter con feedback visual inmediato (animaciones de selección de letras, efectos de palabra encontrada).
- **OE-13:** Implementar el sistema de amigos con búsqueda de usuarios, solicitud de amistad y listado de amigos en línea.

#### Seguridad y Calidad

- **OE-14:** Garantizar la seguridad de los datos de usuarios mediante cifrado de PIN (bcrypt) y validación de entradas en todos los endpoints.
- **OE-15:** Implementar rate limiting para prevenir abusos en el sistema de autenticación y creación de salas.
- **OE-16:** Configurar entornos separados (development, staging, production) en Render.com con variables de entorno gestionadas de forma segura.

---

## 4. Alcance del Proyecto

### 4.1 Dentro del Alcance (In-Scope)

| Módulo | Características |
|---|---|
| **Autenticación** | Registro, login con PIN-4, recuperación por email, actualización de contraseña |
| **Perfil de usuario** | Nombre, edad, correo, historial de partidas, estadísticas básicas |
| **Catálogo** | Exploración sin login, scroll infinito, filtros por categoría/dificultad/idioma |
| **Detalle de sopa** | Ver metadata sin spoiler de la cuadrícula |
| **Creación de sopa** | Editor de palabras, generación automática de cuadrícula |
| **Salas** | Crear sala, compartir enlace/QR, modo privado/público |
| **Juego en tiempo real** | Selección de letras, validación, progreso sincronizado, ranking en vivo |
| **Sistema de amigos** | Buscar, agregar, listar amigos en línea, invitar directamente a sala |
| **Notificaciones** | Push in-app para invitaciones, solicitudes de amistad, inicio/fin de partida |
| **Fin de partida** | Modal de resultados, ranking final, posibilidad de revancha |
| **Email** | Recuperación de contraseña via Nodemailer |
| **Landing page** | Página de presentación del producto |

### 4.2 Fuera del Alcance (Out-of-Scope) para v1.0

- Pagos o suscripciones premium.
- Chat en tiempo real dentro de las salas.
- Torneos o ligas organizadas.
- Soporte multiidioma (se inicia en español).
- Integración con redes sociales (OAuth).
- Generación de sopas de letras con IA.

---

## 5. Análisis de Usuarios y Público Objetivo

### 5.1 Segmentos de Usuarios

#### Segmento 1: Niños y Preadolescentes (8-12 años)

| Atributo | Descripción |
|---|---|
| **Motivación principal** | Jugar y ganar contra amigos del colegio |
| **Comportamiento** | Sesiones cortas, alta impulsividad, motivados por logros visuales inmediatos |
| **Necesidades de UX** | Iconos grandes, colores vibrantes, animaciones expresivas, lenguaje simple |
| **Fricción aceptable** | Muy baja — deben poder entrar y jugar en menos de 2 minutos |

#### Segmento 2: Adolescentes y Jóvenes (13-25 años)

| Atributo | Descripción |
|---|---|
| **Motivación principal** | Competencia social, demostrar habilidad, jugar con su grupo |
| **Comportamiento** | Sesiones medianas, muy orientados a compartir logros, sensibles al diseño |
| **Necesidades de UX** | Diseño moderno, dark mode, micro-animaciones, sistema de ranking visible |
| **Fricción aceptable** | Baja — el registro debe ser rápido y el onboarding gamificado |

#### Segmento 3: Adultos (26-50 años)

| Atributo | Descripción |
|---|---|
| **Motivación principal** | Entretenimiento, nostalgia, ejercicio mental, jugar con familia |
| **Comportamiento** | Sesiones más largas, orientados a completar colecciones, valoran la comunidad |
| **Necesidades de UX** | Claridad, tipografía legible, rendimiento sin bugs, onboarding explicativo |
| **Fricción aceptable** | Media — dispuestos a registrarse si ven el valor del producto |

### 5.2 Personas de Usuario

#### Persona A — "La Competidora" (Valentina, 16 años)
> Valentina juega desde su celular. Le encanta retar a sus amigas del colegio. Si no hay competencia, se aburre. Necesita ver en tiempo real quién va ganando. Comparte sus victorias en Instagram Stories.

#### Persona B — "El Casual" (Andrés, 34 años)
> Andrés juega en momentos de espera. Disfruta la sopa de letras por nostalgia. Le gusta explorar sopas de diferentes temas. Cuando juega con otros, quiere ver los resultados claramente.

#### Persona C — "El Pequeño Explorador" (Mateo, 10 años)
> Mateo juega en la tablet de su mamá. Le encantan las sopas de animales. Necesita que todo sea muy visual e intuitivo. Sus padres valoran que sea un entretenimiento educativo.

---

## 6. Requerimientos Funcionales

### 6.1 Módulo de Autenticación y Usuarios

| ID | Requerimiento | Prioridad | Criterio de Aceptación |
|---|---|---|---|
| RF-01 | El sistema debe permitir el registro con: nombre completo, edad, correo electrónico válido y PIN de 4 dígitos numéricos. | Alta | El usuario puede registrarse correctamente y recibir un correo de bienvenida. El PIN se almacena cifrado. |
| RF-02 | El sistema debe permitir el inicio de sesión con correo electrónico y PIN de 4 dígitos. | Alta | El usuario autenticado recibe un JWT válido. Los errores no revelan qué campo es incorrecto. |
| RF-03 | El sistema debe permitir la recuperación de contraseña mediante un enlace enviado al correo registrado usando Nodemailer. | Alta | El usuario recibe un email con enlace de un solo uso (expira en 30 minutos) para restablecer su PIN. |
| RF-04 | El sistema debe permitir al usuario autenticado actualizar su PIN ingresando el PIN actual y el nuevo PIN dos veces. | Media | El PIN anterior es validado antes de aplicar el cambio. |
| RF-05 | El sistema debe diferenciar entre usuario autenticado e invitado, otorgando permisos distintos. | Alta | Un invitado puede explorar el catálogo pero no puede crear sala ni jugar. |
| RF-06 | Los datos del perfil del usuario son: nombre, edad (solo lectura), correo (solo lectura), foto de perfil opcional. | Media | El usuario puede ver y actualizar nombre y foto de perfil. |

### 6.2 Módulo de Catálogo de Sopas de Letras

| ID | Requerimiento | Prioridad | Criterio de Aceptación |
|---|---|---|---|
| RF-07 | El sistema debe mostrar el catálogo a cualquier visitante, usando carga paginada tipo scroll infinito (estilo Pinterest). | Alta | Se cargan máximo 20 sopas por petición. Al hacer scroll se cargan las siguientes 20. |
| RF-08 | Cada tarjeta debe mostrar: título, categoría, dificultad, número de palabras, nombre del creador y veces jugada. No debe mostrarse la cuadrícula. | Alta | La cuadrícula no es visible en el catálogo ni en la vista de detalle para usuarios no en partida. |
| RF-09 | El sistema debe permitir filtrar el catálogo por categoría, dificultad e idioma. | Media | Los filtros actualizan el catálogo correctamente. |
| RF-10 | El sistema debe permitir ver el detalle de una sopa: descripción, lista de palabras (oculta), estadísticas de jugadores anteriores. | Media | La página de detalle no revela la cuadrícula. |

### 6.3 Módulo de Creación de Sopas de Letras

| ID | Requerimiento | Prioridad | Criterio de Aceptación |
|---|---|---|---|
| RF-11 | El sistema debe permitir a usuarios autenticados crear sopas especificando: título, categoría, idioma, dificultad, descripción y lista de palabras (mínimo 5, máximo 30). | Alta | La sopa se genera correctamente y queda disponible en el catálogo. |
| RF-12 | El algoritmo de generación debe posicionar las palabras aleatoriamente en la cuadrícula (horizontal, vertical, diagonal, invertida según dificultad). | Alta | Todas las palabras están presentes en la cuadrícula. No hay superposiciones inválidas. |
| RF-13 | El sistema debe calcular automáticamente el tamaño de la cuadrícula basándose en las palabras y su cantidad. | Media | La cuadrícula tiene el tamaño mínimo necesario para contener todas las palabras. |
| RF-14 | El creador puede editar o eliminar sus sopas siempre que no haya salas activas usándola. | Baja | Una sopa con sala activa no puede ser editada ni eliminada. |

### 6.4 Módulo de Salas y Partidas

| ID | Requerimiento | Prioridad | Criterio de Aceptación |
|---|---|---|---|
| RF-15 | El sistema debe permitir crear una sala seleccionando una sopa de letras del catálogo. | Alta | La sala queda creada con un código único y un enlace compartible. |
| RF-16 | El sistema debe generar un enlace único (URL) y opcionalmente un código QR para invitar jugadores. | Alta | El enlace es válido mientras la sala esté activa. |
| RF-17 | El sistema debe permitir invitar directamente a amigos de la lista a una sala. | Alta | Los amigos reciben una notificación in-app de invitación con opción de aceptar o rechazar. |
| RF-18 | La sala debe tener un lobby donde el anfitrión puede ver quiénes se han unido e iniciar la partida. | Alta | El anfitrión ve la lista de jugadores en tiempo real. El botón "Iniciar" está activo desde que hay al menos 2 jugadores. |
| RF-19 | El sistema debe sincronizar en tiempo real (WebSocket) el progreso de todos los jugadores: palabras encontradas, ranking. | Alta | Todos los jugadores ven el progreso actualizado con latencia máxima de 500ms. |
| RF-20 | Cuando un jugador encuentra una palabra, el sistema valida la selección, la marca como encontrada y actualiza el ranking. | Alta | Una palabra solo puede ser ganada por el primero en encontrarla. |
| RF-21 | El sistema debe detectar cuándo un jugador completa todas las palabras. En ese momento se termina la partida. | Alta | Al completar la sopa, se emite el evento de fin de partida a todos los jugadores. |
| RF-22 | El sistema debe mostrar un modal de resultados al finalizar con: ranking final, ganador, palabras de cada jugador y tiempo. | Alta | El modal es visible para todos los jugadores simultáneamente. |
| RF-23 | El sistema debe ofrecer la opción de "Revancha" al finalizar, iniciando nueva partida con la misma sala y sopa. | Baja | La revancha reinicia el estado sin necesidad de crear nueva sala. |

### 6.5 Módulo de Sistema de Amigos

| ID | Requerimiento | Prioridad | Criterio de Aceptación |
|---|---|---|---|
| RF-24 | El sistema debe permitir buscar usuarios por nombre o correo electrónico. | Alta | La búsqueda retorna resultados parciales. El correo completo no se expone en resultados. |
| RF-25 | El sistema debe permitir enviar solicitudes de amistad a otros usuarios. | Alta | El receptor recibe una notificación de solicitud de amistad. |
| RF-26 | El sistema debe permitir aceptar o rechazar solicitudes de amistad. | Alta | Aceptar crea la relación bidireccional. Rechazar elimina la solicitud sin notificar al solicitante. |
| RF-27 | El sistema debe mostrar el estado en línea/desconectado de cada amigo en la lista. | Media | El estado se actualiza en tiempo real. |
| RF-28 | El sistema debe permitir eliminar a un amigo de la lista. | Baja | La relación se elimina de forma bidireccional. |

### 6.6 Módulo de Notificaciones

| ID | Requerimiento | Prioridad | Criterio de Aceptación |
|---|---|---|---|
| RF-29 | El sistema debe enviar notificaciones in-app para: invitaciones a sala, solicitudes de amistad, inicio de partida y fin de partida. | Alta | Las notificaciones aparecen en un centro de notificaciones y se marcan como leídas al ser vistas. |
| RF-30 | Las notificaciones no leídas deben mostrarse con un badge numérico en el ícono de la campana. | Media | El badge se actualiza en tiempo real. |
| RF-31 | El sistema debe enviar correos electrónicos para: registro de cuenta, recuperación de contraseña e invitación a sala para usuarios no registrados. | Alta | Los correos se envían correctamente usando Nodemailer con plantillas HTML. |

---

## 7. Requerimientos No Funcionales

### 7.1 Rendimiento

| ID | Requerimiento | Métrica |
|---|---|---|
| RNF-01 | El tiempo de respuesta de la API no debe superar los 300ms bajo carga normal. | P95 < 300ms |
| RNF-02 | La sincronización de eventos WebSocket en sala debe tener latencia máxima de 500ms. | Latencia < 500ms |
| RNF-03 | El catálogo debe cargar la primera página en menos de 2 segundos en una conexión 4G. | < 2s en 4G |
| RNF-04 | El sistema debe soportar al menos 500 usuarios concurrentes en salas activas sin degradación. | 500 CCU sin degradación |

### 7.2 Escalabilidad

| ID | Requerimiento | Descripción |
|---|---|---|
| RNF-05 | La arquitectura del backend debe permitir escalar horizontalmente sin ruptura de la sincronización de salas. | Redis actúa como broker de mensajes para sincronizar WebSocket entre instancias. |
| RNF-06 | La base de datos debe soportar particionamiento de tablas de alto crecimiento (notificaciones, eventos de sala). | PostgreSQL con table partitioning por fecha en tablas de eventos. |

### 7.3 Disponibilidad y Confiabilidad

| ID | Requerimiento | Métrica |
|---|---|---|
| RNF-07 | El sistema debe tener una disponibilidad del 99.5% mensual en producción. | Uptime mayor o igual al 99.5% |
| RNF-08 | En caso de desconexión de un jugador, el sistema debe mantener su estado de partida por 5 minutos. | Reconexión en menos de 5 min conserva estado |
| RNF-09 | El sistema debe manejar la reconexión automática del WebSocket en la app Flutter. | Reconexión automática con backoff exponencial |

### 7.4 Seguridad

| ID | Requerimiento | Descripción |
|---|---|---|
| RNF-10 | Los PINs de usuario deben almacenarse usando bcrypt con factor de coste mínimo de 12. | No se almacena el PIN en texto plano. |
| RNF-11 | Toda comunicación debe estar cifrada usando HTTPS/WSS (TLS 1.2+). | Sin excepciones en producción. |
| RNF-12 | Los endpoints de autenticación deben tener rate limiting de máximo 5 intentos fallidos por IP en 15 minutos. | Rate limiting implementado. |
| RNF-13 | Los tokens JWT deben tener expiración máxima de 7 días, con refresh token de 30 días. | Access token: 7d. Refresh token: 30d. |
| RNF-14 | El sistema debe validar y sanitizar todas las entradas para prevenir inyección SQL y XSS. | Sin vulnerabilidades de inyección en auditoría básica. |
| RNF-15 | Los datos de correo electrónico no deben ser visibles en la búsqueda de usuarios para terceros. | El correo solo es visible para el propio usuario. |

### 7.5 Usabilidad

| ID | Requerimiento | Descripción |
|---|---|---|
| RNF-16 | Un usuario nuevo debe poder registrarse y unirse a su primera sala en menos de 3 minutos. | Medido en pruebas de usuario con personas sin experiencia previa. |
| RNF-17 | La interfaz de Flutter debe ser responsiva en pantallas desde 320px hasta 1440px. | Sin elementos rotos o inaccesibles en los rangos de pantalla. |
| RNF-18 | La aplicación debe funcionar en modo offline de forma parcial: mostrar historial de partidas y perfil. | Caché local implementado para datos básicos del perfil. |

### 7.6 Mantenibilidad

| ID | Requerimiento | Descripción |
|---|---|---|
| RNF-19 | El código del backend debe seguir una arquitectura en capas (Controller a Service a Repository). | Al menos el 60% del código de servicios debe tener tests unitarios. |
| RNF-20 | El sistema debe incluir logging estructurado (JSON) en todos los endpoints y eventos WebSocket. | Logs disponibles en Render.com dashboard. |
| RNF-21 | Las variables de configuración sensibles deben gestionarse como variables de entorno, nunca en código fuente. | Sin secretos en el repositorio de código. |

---

## 8. Diseño de Arquitectura del Sistema

### 8.1 Diagrama de Arquitectura General

```
+---------------------------------------------------------------------+
|                         CLIENTES                                    |
|                                                                     |
|  +-----------------+    +------------------+    +--------------+   |
|  |   Flutter App   |    |  Landing Page    |    | Enlace sala  |   |
|  | (iOS/Android/   |    |  (HTML/CSS/JS)   |    | compartido   |   |
|  |   Web/Desktop)  |    |                  |    |              |   |
|  +--------+--------+    +--------+---------+    +-------+------+   |
+-----------|----------------------|---------------------|------------+
            |                     |                     |
            |         HTTPS / WSS (TLS)                 |
            |                     |                     |
+-----------|---------------------|---------------------|------------+
|                      RENDER.COM (Cloud)                            |
|                                                                    |
|  +-----------------------------------------------------------------+|
|  |              API Gateway / Load Balancer                        ||
|  |          (Render Web Service - Node.js)                         ||
|  +------------------+---------------------------+-----------------+|
|                     |                           |                  |
|  +------------------+----------+  +-------------+--------------+  |
|  |    REST API Server          |  |    WebSocket Server        |  |
|  |    (Fastify)                |  |    (Socket.IO)             |  |
|  |                             |  |                            |  |
|  |  - Auth Module              |  |  - Room Manager            |  |
|  |  - Users Module             |  |  - Game State Sync         |  |
|  |  - Catalog Module           |  |  - Presence online/offline |  |
|  |  - Friends Module           |  |  - Notifications RT        |  |
|  |  - Notifications Module     |  |                            |  |
|  |  - WordSearch Generator     |  +-------------+--------------+  |
|  +------------------+----------+                |                  |
|                     |                           |                  |
|  +------------------+---------------------------+--------------+   |
|  |                    Redis (Render Redis)                     |   |
|  |  - Sesiones activas    - Estado de sala (Room State)        |   |
|  |  - Pub/Sub WebSocket   - Cache de catalogo (TTL 5min)       |   |
|  |  - Rate limiting       - Presencia de usuarios              |   |
|  +------------------------------+------------------------------+   |
|                                 |                                  |
|  +------------------------------+------------------------------+   |
|  |           PostgreSQL (Render PostgreSQL)                    |   |
|  |  - Usuarios            - Sopas de letras                   |   |
|  |  - Amistades           - Salas (historial)                 |   |
|  |  - Notificaciones      - Resultados de partidas            |   |
|  +-------------------------------------------------------------+   |
|                                                                    |
|  +-------------------------------------------------------------+   |
|  |         Nodemailer (SMTP Externo Gratuito)                  |   |
|  |  Gmail SMTP / Brevo (formerly Sendinblue)                   |   |
|  +-------------------------------------------------------------+   |
+--------------------------------------------------------------------+
```

### 8.2 Estilo Arquitectónico del Backend

Se adopta una **arquitectura monolítica modular** para la versión 1.0:

| Criterio | Monolítico Modular (elegida) | Microservicios |
|---|---|---|
| **Complejidad operacional** | Baja — un solo servicio en Render | Alta — múltiples servicios, orquestación |
| **Latencia interna** | Llamadas en proceso (ms) | Llamadas HTTP/gRPC entre servicios |
| **Costo en Render** | 1 Web Service + Redis + PostgreSQL | N Web Services + más costos |
| **Equipo de desarrollo** | Ideal para equipos pequeños | Requiere equipos maduros |
| **Escalabilidad futura** | Modular: fácil de extraer módulos a microservicios | Overkill para v1.0 |

### 8.3 Capas de la Aplicación Backend

```
+---------------------------------------------+
|          HTTP / WebSocket                   |  Transporte
+---------------------------------------------+
|          Routes / Gateways                  |  Enrutamiento
+---------------------------------------------+
|          Controllers                        |  Manejo request/response
+---------------------------------------------+
|          Services                           |  Logica de negocio
+---------------------------------------------+
|          Repositories                       |  Acceso a datos
+---------------------------------------------+
|          PostgreSQL / Redis                 |  Persistencia
+---------------------------------------------+
```

### 8.4 Stack Tecnológico Detallado

#### Backend

| Componente | Tecnología | Justificación |
|---|---|---|
| **Runtime** | Node.js 20 LTS | Excelente para I/O concurrente, WebSockets nativos |
| **Framework** | Fastify v4 | Más rápido que Express, schema validation integrada, soporte TypeScript |
| **WebSockets** | Socket.IO v4 | Manejo de reconexión automático, rooms nativas, adapter Redis incluido |
| **ORM** | Prisma v5 | Type-safe, migraciones automáticas, soporte PostgreSQL excelente |
| **Autenticación** | JWT + bcrypt | Estándar de la industria, sin estado, compatible con Flutter |
| **Email** | Nodemailer | Gratuito, flexible, compatible con múltiples SMTP providers |
| **Validación** | Zod | Schema validation type-safe compartible entre frontend y backend |
| **Testing** | Vitest + Supertest | Rápido, compatible con ES modules |

#### Base de Datos

| Componente | Tecnología | Justificación |
|---|---|---|
| **Principal** | PostgreSQL 15 | Ver sección 9 para análisis detallado |
| **Caché / RT** | Redis 7 | Estado de salas, pub/sub WebSocket, rate limiting |

#### Frontend Flutter

| Componente | Tecnología | Justificación |
|---|---|---|
| **Framework** | Flutter 3.x (Dart) | Multiplataforma con un solo codebase |
| **Estado** | Riverpod 2.x | Robusto, testeable, mejor que Provider para apps complejas |
| **Routing** | Go Router | Declarativo, soporte deep linking para enlaces de sala |
| **HTTP Client** | Dio | Interceptores, retry automático, manejo de errores centralizado |
| **WebSocket** | socket_io_client | Compatible con Socket.IO del backend |
| **Almacenamiento local** | Hive / Isar | Almacenamiento offline de perfil e historial |

---

## 9. Selección y Diseño de Base de Datos

### 9.1 Análisis Comparativo de Bases de Datos

#### Candidatas Evaluadas

| Base de Datos | Tipo | Fortalezas | Debilidades para este proyecto |
|---|---|---|---|
| **PostgreSQL** | Relacional SQL | ACID, relaciones complejas, JSONB, full-text search | Mayor complejidad de esquema que NoSQL |
| **MongoDB** | Documental NoSQL | Flexibilidad de esquema, documentos anidados | Transacciones multi-documento complejas, sin JOINs nativos eficientes |
| **Firebase Firestore** | NoSQL en tiempo real | Tiempo real nativo, sin servidor | Vendor lock-in, costos imprevisibles, consultas limitadas |
| **MySQL / MariaDB** | Relacional SQL | Maduro, ampliamente soportado | Sin JSONB nativo, full-text search inferior a PostgreSQL |

#### Matriz de Evaluación Ponderada

| Criterio | Peso | PostgreSQL | MongoDB | Firebase | MySQL |
|---|---|---|---|---|---|
| Integridad de datos (ACID) | 20% | 5/5 | 3/5 | 3/5 | 5/5 |
| Relaciones complejas | 20% | 5/5 | 2/5 | 2/5 | 4/5 |
| Flexibilidad de esquema (JSON) | 15% | 4/5 (JSONB) | 5/5 | 5/5 | 2/5 |
| Soporte en Render.com | 15% | 5/5 | 2/5 | 0/5 | 3/5 |
| Costo | 10% | 4/5 | 3/5 | 2/5 | 4/5 |
| Ecosistema (Prisma, etc.) | 10% | 5/5 | 4/5 | 3/5 | 4/5 |
| Rendimiento en consultas relacionales | 10% | 5/5 | 3/5 | 2/5 | 4/5 |
| **TOTAL PONDERADO** | 100% | **4.65** | **3.0** | **2.65** | **3.8** |

#### Decisión: PostgreSQL + Redis

**PostgreSQL** es la elección óptima por:

1. **Datos relacionales complejos:** Usuarios, amistades, salas, participantes y resultados requieren JOINs y transacciones ACID.
2. **JSONB nativo:** La cuadrícula de sopa de letras se almacena eficientemente como JSONB sin tablas adicionales.
3. **Full-text search:** Permite búsqueda de sopas por título y descripción sin Elasticsearch.
4. **Soporte nativo en Render:** PostgreSQL managed como servicio de primera clase, con backups automáticos.
5. **Ecosistema Prisma:** El ORM más maduro para PostgreSQL con TypeScript.

**Redis** complementa PostgreSQL para:
- Estado de salas activas en memoria (evitar consultas frecuentes durante el juego).
- Pub/Sub para sincronizar eventos WebSocket entre múltiples instancias del backend.
- Rate limiting para autenticación.
- Presencia de usuarios (online/offline) con TTL automático.

### 9.2 Esquema de Base de Datos (Prisma Schema)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(uuid())
  name        String
  age         Int
  email       String   @unique
  pinHash     String   @map("pin_hash")
  avatarUrl   String?  @map("avatar_url")
  isOnline    Boolean  @default(false) @map("is_online")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  wordSearches          WordSearch[]
  hostedRooms           Room[]           @relation("RoomHost")
  roomParticipants      RoomPlayer[]
  sentNotifications     Notification[]   @relation("NotificationSender")
  receivedNotifications Notification[]   @relation("NotificationRecipient")
  sentFriendRequests    FriendRequest[]  @relation("FriendRequestSender")
  receivedFriendRequests FriendRequest[] @relation("FriendRequestRecipient")
  friendshipsA          Friendship[]     @relation("FriendshipUserA")
  friendshipsB          Friendship[]     @relation("FriendshipUserB")
  passwordResetTokens   PasswordResetToken[]

  @@map("users")
}

model PasswordResetToken {
  id        String    @id @default(uuid())
  userId    String    @map("user_id")
  token     String    @unique
  expiresAt DateTime  @map("expires_at")
  usedAt    DateTime? @map("used_at")
  createdAt DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("password_reset_tokens")
}

model WordSearch {
  id          String     @id @default(uuid())
  title       String
  description String?
  category    String
  difficulty  Difficulty @default(MEDIUM)
  language    String     @default("es")
  grid        Json       // JSONB: cuadricula 2D de caracteres
  words       Json       // JSONB: array de { word, positions }
  gridSize    Int        @map("grid_size")
  creatorId   String     @map("creator_id")
  playCount   Int        @default(0) @map("play_count")
  isPublic    Boolean    @default(true) @map("is_public")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")

  creator User   @relation(fields: [creatorId], references: [id])
  rooms   Room[]

  @@map("word_searches")
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

model Room {
  id           String     @id @default(uuid())
  code         String     @unique  // Codigo de 6 caracteres para compartir
  wordSearchId String     @map("word_search_id")
  hostUserId   String     @map("host_user_id")
  status       RoomStatus @default(WAITING)
  startedAt    DateTime?  @map("started_at")
  endedAt      DateTime?  @map("ended_at")
  createdAt    DateTime   @default(now()) @map("created_at")

  wordSearch WordSearch   @relation(fields: [wordSearchId], references: [id])
  host       User         @relation("RoomHost", fields: [hostUserId], references: [id])
  players    RoomPlayer[]

  @@map("rooms")
}

enum RoomStatus {
  WAITING
  IN_PROGRESS
  FINISHED
}

model RoomPlayer {
  id          String    @id @default(uuid())
  roomId      String    @map("room_id")
  userId      String    @map("user_id")
  wordsFound  Json      @default("[]") @map("words_found")
  score       Int       @default(0)
  rank        Int?
  joinedAt    DateTime  @default(now()) @map("joined_at")
  finishedAt  DateTime? @map("finished_at")

  room Room @relation(fields: [roomId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id])

  @@unique([roomId, userId])
  @@map("room_players")
}

model Friendship {
  id        String   @id @default(uuid())
  userAId   String   @map("user_a_id")
  userBId   String   @map("user_b_id")
  createdAt DateTime @default(now()) @map("created_at")

  userA User @relation("FriendshipUserA", fields: [userAId], references: [id])
  userB User @relation("FriendshipUserB", fields: [userBId], references: [id])

  @@unique([userAId, userBId])
  @@map("friendships")
}

model FriendRequest {
  id          String              @id @default(uuid())
  senderId    String              @map("sender_id")
  recipientId String              @map("recipient_id")
  status      FriendRequestStatus @default(PENDING)
  createdAt   DateTime            @default(now()) @map("created_at")
  updatedAt   DateTime            @updatedAt @map("updated_at")

  sender    User @relation("FriendRequestSender", fields: [senderId], references: [id])
  recipient User @relation("FriendRequestRecipient", fields: [recipientId], references: [id])

  @@unique([senderId, recipientId])
  @@map("friend_requests")
}

enum FriendRequestStatus {
  PENDING
  ACCEPTED
  REJECTED
}

model Notification {
  id          String           @id @default(uuid())
  recipientId String           @map("recipient_id")
  senderId    String?          @map("sender_id")
  type        NotificationType
  payload     Json             // JSONB: datos adicionales (roomId, roomCode, etc.)
  isRead      Boolean          @default(false) @map("is_read")
  createdAt   DateTime         @default(now()) @map("created_at")

  recipient User  @relation("NotificationRecipient", fields: [recipientId], references: [id])
  sender    User? @relation("NotificationSender", fields: [senderId], references: [id])

  @@map("notifications")
}

enum NotificationType {
  FRIEND_REQUEST
  FRIEND_REQUEST_ACCEPTED
  ROOM_INVITATION
  GAME_STARTED
  GAME_ENDED
}
```

---

## 10. Diseño del Backend

### 10.1 Estructura de Carpetas

```
wordhive-backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.schemas.ts         # Zod schemas
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.repository.ts
│   │   │   └── users.routes.ts
│   │   ├── word-searches/
│   │   │   ├── word-searches.controller.ts
│   │   │   ├── word-searches.service.ts
│   │   │   ├── word-searches.repository.ts
│   │   │   ├── word-searches.routes.ts
│   │   │   └── generator/
│   │   │       └── grid-generator.ts   # Algoritmo de generacion
│   │   ├── rooms/
│   │   │   ├── rooms.controller.ts
│   │   │   ├── rooms.service.ts
│   │   │   ├── rooms.repository.ts
│   │   │   └── rooms.routes.ts
│   │   ├── friends/
│   │   │   ├── friends.controller.ts
│   │   │   ├── friends.service.ts
│   │   │   └── friends.routes.ts
│   │   └── notifications/
│   │       ├── notifications.service.ts
│   │       └── email/
│   │           ├── email.service.ts    # Nodemailer
│   │           └── templates/
│   │               ├── welcome.html
│   │               ├── password-reset.html
│   │               └── room-invitation.html
│   ├── websocket/
│   │   ├── socket.server.ts
│   │   ├── handlers/
│   │   │   ├── room.handlers.ts
│   │   │   ├── game.handlers.ts
│   │   │   └── presence.handlers.ts
│   │   └── middlewares/
│   │       └── socket-auth.middleware.ts
│   ├── shared/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── rate-limit.middleware.ts
│   │   │   └── error-handler.ts
│   │   ├── utils/
│   │   │   ├── jwt.utils.ts
│   │   │   ├── bcrypt.utils.ts
│   │   │   └── room-code.utils.ts
│   │   └── types/
│   │       └── index.ts
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── env.ts
│   └── app.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── package.json
└── tsconfig.json
```

### 10.2 API REST — Endpoints

#### Autenticación (`/api/auth`)

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Registrar nuevo usuario |
| `POST` | `/api/auth/login` | No | Login con email + PIN |
| `POST` | `/api/auth/logout` | Si | Cerrar sesión |
| `POST` | `/api/auth/refresh` | No | Renovar access token |
| `POST` | `/api/auth/forgot-password` | No | Solicitar recuperación de PIN |
| `POST` | `/api/auth/reset-password` | No | Restablecer PIN con token de email |
| `PATCH` | `/api/auth/change-pin` | Si | Cambiar PIN (requiere PIN actual) |

#### Usuarios (`/api/users`)

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/users/me` | Si | Obtener perfil propio |
| `PATCH` | `/api/users/me` | Si | Actualizar nombre o avatar |
| `GET` | `/api/users/search?q=` | Si | Buscar usuarios por nombre |
| `GET` | `/api/users/:id/stats` | Si | Ver estadísticas de un usuario |

#### Sopas de letras (`/api/word-searches`)

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/word-searches` | No | Listar catálogo (paginado, filtros) |
| `GET` | `/api/word-searches/:id` | No | Ver detalle de una sopa |
| `POST` | `/api/word-searches` | Si | Crear nueva sopa de letras |
| `PATCH` | `/api/word-searches/:id` | Si | Editar sopa propia |
| `DELETE` | `/api/word-searches/:id` | Si | Eliminar sopa propia |

#### Salas (`/api/rooms`)

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/rooms` | Si | Crear sala con una sopa seleccionada |
| `GET` | `/api/rooms/:code` | No | Ver info de sala por código |
| `POST` | `/api/rooms/:code/join` | Si | Unirse a una sala |
| `POST` | `/api/rooms/:code/start` | Si | Iniciar partida (solo anfitrión) |
| `GET` | `/api/rooms/:code/results` | Si | Ver resultados de sala terminada |

#### Amigos (`/api/friends`)

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/friends` | Si | Listar amigos con estado online |
| `POST` | `/api/friends/request/:userId` | Si | Enviar solicitud de amistad |
| `PATCH` | `/api/friends/request/:requestId` | Si | Aceptar/rechazar solicitud |
| `DELETE` | `/api/friends/:friendId` | Si | Eliminar amigo |
| `GET` | `/api/friends/requests/pending` | Si | Ver solicitudes pendientes |

#### Notificaciones (`/api/notifications`)

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/notifications` | Si | Listar notificaciones (paginadas) |
| `PATCH` | `/api/notifications/:id/read` | Si | Marcar notificación como leída |
| `PATCH` | `/api/notifications/read-all` | Si | Marcar todas como leídas |

### 10.3 Eventos WebSocket

#### Cliente → Servidor

| Evento | Payload | Descripción |
|---|---|---|
| `join-room` | `{ roomCode, token }` | Unirse a sala (lobby o partida) |
| `leave-room` | `{ roomCode }` | Salir de la sala |
| `start-game` | `{ roomCode }` | Anfitrión inicia la partida |
| `word-found` | `{ roomCode, word, positions }` | Jugador encontró una palabra |
| `ping-presence` | `{}` | Mantener presencia activa |

#### Servidor → Cliente

| Evento | Payload | Descripción |
|---|---|---|
| `player-joined` | `{ userId, name, avatar }` | Nuevo jugador en la sala |
| `player-left` | `{ userId }` | Jugador abandonó la sala |
| `game-started` | `{ grid, words, startedAt }` | Partida iniciada — envía la cuadrícula |
| `word-claimed` | `{ userId, word, score, rank }` | Alguien encontró una palabra |
| `game-ended` | `{ results, winner }` | Partida terminada con resultados |
| `room-state` | `{ players, status }` | Estado completo de sala al reconectar |
| `notification` | `{ type, payload }` | Notificación in-app en tiempo real |
| `friend-online` | `{ userId }` | Amigo se conectó |
| `friend-offline` | `{ userId }` | Amigo se desconectó |

### 10.4 Algoritmo de Generación de Cuadrícula

```
ALGORITMO GenerarCuadricula(palabras[], dificultad):

  1. Calcular tamaño de cuadricula:
     - tamanioBase = max(longitud de palabra mas larga) + 2
     - tamanioFinal = max(tamanioBase, ceil(sqrt(totalLetras * 1.5)))
     - Minimo 10x10, maximo 20x20

  2. Inicializar cuadricula vacia de tamanioFinal x tamanioFinal

  3. Definir direcciones permitidas segun dificultad:
     - EASY:   [ derecha, abajo ]
     - MEDIUM: [ derecha, abajo, diagonal-der-abajo, diagonal-der-arriba ]
     - HARD:   [ todas las 8 direcciones incluyendo inversas ]

  4. Para cada palabra en palabras (ordenadas de mayor a menor longitud):
     a. Intentar hasta 100 veces:
        - Seleccionar direccion aleatoria de las permitidas
        - Seleccionar posicion de inicio aleatoria valida
        - Verificar que la palabra cabe sin colision invalida
          (colision valida = misma letra en misma celda)
        - Si cabe: colocar la palabra, registrar posiciones
     b. Si despues de 100 intentos no cabe: ampliar cuadricula y reintentar

  5. Rellenar celdas vacias con letras aleatorias del idioma

  6. Retornar:
     - grid: matriz 2D de caracteres
     - wordPositions: { word, startRow, startCol, direction }[]
```

---

## 11. Diseño del Frontend (Flutter)

### 11.1 Estructura de la Aplicación Flutter

```
wordhive-app/
├── lib/
│   ├── main.dart
│   ├── app.dart                    # MaterialApp + GoRouter config
│   ├── core/
│   │   ├── constants/
│   │   │   ├── app_colors.dart
│   │   │   ├── app_typography.dart
│   │   │   └── app_spacing.dart
│   │   ├── network/
│   │   │   ├── dio_client.dart
│   │   │   ├── socket_client.dart
│   │   │   └── interceptors/
│   │   │       └── auth_interceptor.dart
│   │   ├── storage/
│   │   │   └── local_storage.dart
│   │   └── utils/
│   │       └── extensions.dart
│   ├── features/
│   │   ├── auth/
│   │   │   └── presentation/
│   │   │       ├── pages/
│   │   │       │   ├── login_page.dart
│   │   │       │   ├── register_page.dart
│   │   │       │   └── forgot_pin_page.dart
│   │   │       └── widgets/
│   │   │           └── pin_input_widget.dart
│   │   ├── catalog/
│   │   │   └── presentation/
│   │   │       ├── pages/
│   │   │       │   ├── catalog_page.dart
│   │   │       │   └── word_search_detail_page.dart
│   │   │       └── widgets/
│   │   │           └── word_search_card.dart
│   │   ├── game/
│   │   │   └── presentation/
│   │   │       ├── pages/
│   │   │       │   ├── lobby_page.dart
│   │   │       │   └── game_page.dart
│   │   │       └── widgets/
│   │   │           ├── grid_widget.dart
│   │   │           ├── word_list_widget.dart
│   │   │           ├── live_ranking_widget.dart
│   │   │           └── game_results_modal.dart
│   │   ├── friends/
│   │   │   └── presentation/
│   │   │       └── pages/
│   │   │           └── friends_page.dart
│   │   ├── notifications/
│   │   │   └── presentation/
│   │   │       └── pages/
│   │   │           └── notifications_page.dart
│   │   └── profile/
│   │       └── presentation/
│   │           └── pages/
│   │               └── profile_page.dart
│   └── shared/
│       └── widgets/
│           ├── app_button.dart
│           ├── app_text_field.dart
│           └── loading_overlay.dart
├── assets/
│   ├── images/
│   ├── animations/                 # Lottie animations
│   └── fonts/
└── pubspec.yaml
```

### 11.2 Pantallas Principales

| Pantalla | Descripción | Acceso |
|---|---|---|
| **Splash** | Animación de carga con logo | Todos |
| **Catalog** | Grid infinito de sopas (pantalla principal) | Todos |
| **Word Search Detail** | Metadata de sopa sin cuadrícula | Todos |
| **Login** | Email + PIN input | Invitados |
| **Register** | Nombre, edad, email, PIN | Invitados |
| **Forgot PIN** | Input de email para recuperación | Invitados |
| **Lobby** | Sala de espera con jugadores en tiempo real | Auth |
| **Game** | Cuadrícula interactiva + ranking en vivo | Auth |
| **Results** | Modal de resultados y ranking final | Auth |
| **Friends** | Lista de amigos, búsqueda, solicitudes | Auth |
| **Notifications** | Centro de notificaciones | Auth |
| **Profile** | Perfil, estadísticas, cambio de PIN | Auth |
| **Create Word Search** | Editor para crear sopas | Auth |

### 11.3 Widget de Cuadrícula (Game Grid)

El componente más crítico del juego. Características:

- **Gesture Detector** para detectar deslizamientos en cualquier dirección.
- **Feedback visual en tiempo real** al arrastrar: resaltar letras seleccionadas.
- **Animación de word-found:** Efecto de onda/glow verde cuando una palabra es válida.
- **Validación local primero:** La selección se valida localmente por longitud y dirección antes de enviar al servidor para reducir latencia percibida.
- **Palabras encontradas:** Las palabras del jugador actual permanecen resaltadas en un color; las del oponente en otro color diferente.

---

## 12. Diseño de la Landing Page

### 12.1 Concepto de Diseño

La landing page sigue los principios **"Calm Tech"** con toques de energía juvenil:

- **Paleta de colores:** Fondo oscuro (#0D1117), acentos en violeta eléctrico (#7C3AED) y cyan neón (#06B6D4).
- **Tipografía:** `Outfit` (Google Fonts) — legible para todas las edades, moderna.
- **Animaciones:** Cuadrícula de letras animada en el hero. Micro-animaciones en los CTA buttons.

### 12.2 Secciones de la Landing Page

```
+-----------------------------------------------------------+
|  NAVBAR: Logo | Explorar | Como jugar | Registrarse      |
+-----------------------------------------------------------+
|  HERO SECTION                                             |
|  "Encuentra las palabras. Vence a todos."                 |
|  Animacion de cuadricula de letras en fondo              |
|  [Descargar App] [Explorar Gratis]                        |
+-----------------------------------------------------------+
|  SOCIAL PROOF                                             |
|  "12,403 jugadores en linea ahora"                       |
|  Contador animado en tiempo real                          |
+-----------------------------------------------------------+
|  FEATURES SECTION (3 tarjetas)                            |
|  Compite en tiempo real                                   |
|  Invita a tus amigos                                      |
|  Miles de sopas para explorar                             |
+-----------------------------------------------------------+
|  COMO FUNCIONA (3 pasos animados)                         |
|  1. Elige una sopa  2. Invita amigos  3. Compite!        |
+-----------------------------------------------------------+
|  EXPLORAR GRATIS (Preview del catalogo)                   |
|  Grid de 6 tarjetas de sopas disponibles                  |
|  Ver mas -> redirige a la app                             |
+-----------------------------------------------------------+
|  CTA FINAL                                                |
|  "Listo para jugar?" [Crear cuenta gratis]               |
+-----------------------------------------------------------+
|  FOOTER: Links, redes sociales, terminos, privacidad     |
+-----------------------------------------------------------+
```

---

## 13. Flujos de Usuario

### 13.1 Flujo de Registro e Ingreso a Partida

```
[Landing Page / App]
       |
       v
  Tiene cuenta? --- SI --> [Login: email + PIN-4] --> [Catalogo]
       |
      NO
       |
       v
[Registro: nombre, edad, email, PIN-4]
       |
       v
[Email de bienvenida enviado (Nodemailer)]
       |
       v
[Catalogo - Home]
       |
       v
[Seleccionar sopa de letras]
       |
       v
[Vista de detalle]
       |
       v
[Crear sala] --> [Codigo + Link generado]
       |
       v
[Lobby - Compartir codigo/link/QR] --> Amigos se unen
       |
       v
[Iniciar partida]
       |
       v
[JUEGO EN TIEMPO REAL]
  - Cuadricula visible para todos
  - Ranking actualizado en vivo
       |
  Alguien completa la sopa?
       | SI
       v
[Modal de resultados] --> Revancha / Salir
```

### 13.2 Flujo de Recuperación de PIN

```
[Login] -> "Olvide mi PIN"
       |
       v
[Ingresar email registrado]
       |
       v
[Validar email en BD]
       |
  Existe? --- NO --> "Si el correo existe, recibiras un email"
       |              (Mensaje generico para evitar enumeracion)
      SI
       |
       v
[Generar token unico (UUID) con expiracion 30 min]
       |
       v
[Enviar email con enlace: /reset-pin?token=UUID]
       |
       v
[Usuario hace clic en el enlace]
       |
       v
[Validar token: existe + no expirado + no usado]
       |
       v
[Formulario: nuevo PIN x2]
       |
       v
[Guardar PIN cifrado + marcar token como usado]
       |
       v
[Redirigir al login con mensaje de exito]
```

---

## 14. Estrategia de Gamificación y Psicología del Juego

> Esta sección documenta los principios psicológicos aplicados para maximizar el engagement y la retención, de forma ética y apropiada para todas las edades.

### 14.1 Principios Psicológicos Aplicados

#### Variable Reward Schedule (Skinner Box)
El catálogo tipo Pinterest presenta sopas en un orden que mezcla lo familiar con lo novedoso. El scroll infinito crea anticipación de qué vendrá a continuación.

**Implementación:** Ordenamiento del catálogo que mezcla sopas muy jugadas, sopas nuevas y sopas de categorías que el usuario ha jugado antes.

#### Social Comparison (Teoría de la Comparación Social — Festinger)
Ver en tiempo real cuántas palabras llevan los rivales activa el instinto competitivo. El ranking visible durante la partida genera urgencia.

**Implementación:** Widget de ranking siempre visible durante la partida, con animaciones cuando alguien sube o baja de posición.

#### Near Miss Effect
Cuando un jugador está a 1 o 2 palabras de completar la sopa, se activa un estado de urgencia psicológica. Este efecto se amplifica con una barra de progreso visible.

**Implementación:** Barra de progreso visual con color que cambia conforme se acerca al 100%. Vibración háptica al encontrar las últimas palabras.

#### Commitment & Consistency (Cialdini)
Una vez que un usuario crea una cuenta y completa su primera partida, la probabilidad de que vuelva aumenta drásticamente.

**Implementación:** Pantalla de perfil con estadísticas: total de palabras encontradas, partidas ganadas, racha de días jugando.

#### Social Pressure (FOMO — Fear Of Missing Out)
Las notificaciones de invitaciones de amigos generan urgencia. "¡Carlos ya está esperando en la sala!" es más efectivo que "Tienes una invitación".

**Implementación:** Notificaciones con texto personalizado que menciona el nombre del amigo y el tiempo que lleva esperando.

#### Zeigarnik Effect (Efecto de tarea incompleta)
Las tareas incompletas son más recordadas que las completadas. Una sopa a medio jugar genera un "itch" cognitivo de volver a terminarla.

**Implementación:** El catálogo muestra sopas "en progreso" con su porcentaje de avance cuando el usuario vuelve a la app.

#### Feedback Inmediato y Satisfactorio
Cada vez que el usuario encuentra una palabra, necesita una respuesta visual y sonora satisfactoria que refuerce el comportamiento.

**Implementación:**
- Animación de confirmación en la letra inicial al confirmar una palabra.
- Efecto de onda de color que recorre las letras de la palabra encontrada.
- Sonido de confirmación positivo (opcional, configurable).
- La palabra tachada en la lista con animación suave.

### 14.2 Diseño Anti-Adictivo (Uso Responsable)

Para proteger especialmente a los jugadores menores:

- **Modo descanso:** Después de 90 minutos continuos, la app sugiere tomar un descanso.
- **Sin dark patterns:** No se usan mecánicas de urgencia artificial (contadores falsos, "¡Solo quedan 3 cupos!").
- **Configuración parental:** Los padres pueden establecer límites de tiempo diario para cuentas de usuarios menores de 13 años.

---

## 15. Estrategia de Despliegue en Render

### 15.1 Servicios en Render

| Servicio Render | Tipo | Plan | Descripción |
|---|---|---|---|
| `wordhive-api` | Web Service | Starter ($7/mes) | Backend Node.js/Fastify |
| `wordhive-db` | PostgreSQL | Free (Starter en prod) | Base de datos PostgreSQL |
| `wordhive-redis` | Redis | Free (Starter en prod) | Cache y estado de salas |
| `wordhive-landing` | Static Site | Free | Landing page HTML/CSS/JS |

### 15.2 Ambientes de Despliegue

```
[Feature Branch]
       |
       v
[Pull Request + Code Review]
       |
       v
[main branch] --> Auto-deploy --> [STAGING en Render]
                                   - Datos de prueba
                                   - URL: staging.wordhive.onrender.com
       |
       v (Manual deploy con aprobacion)
[production tag] --> Deploy --> [PRODUCTION en Render]
                                 - Datos reales
                                 - URL: wordhive.onrender.com
```

### 15.3 Variables de Entorno

```bash
# .env.example (NO subir valores reales al repo)

# Database
DATABASE_URL="postgresql://user:password@host:port/wordhive"

# Redis
REDIS_URL="redis://default:password@host:port"

# JWT
JWT_SECRET="super-secret-key-here"
JWT_ACCESS_EXPIRY="7d"
JWT_REFRESH_EXPIRY="30d"

# Nodemailer (Gmail o Brevo como SMTP gratuito)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="wordhive.noreply@gmail.com"
SMTP_PASS="app-specific-password"
SMTP_FROM="WordHive <wordhive.noreply@gmail.com>"

# App URLs
APP_URL="https://wordhive.onrender.com"
FRONTEND_URL="https://wordhive.app"

# Environment
NODE_ENV="production"
PORT="3000"
```

### 15.4 Configuración de Render (`render.yaml`)

```yaml
services:
  - type: web
    name: wordhive-api
    runtime: node
    buildCommand: npm ci && npx prisma generate && npm run build
    startCommand: npx prisma migrate deploy && node dist/app.js
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: wordhive-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          name: wordhive-redis
          type: redis
          property: connectionString
      - key: JWT_SECRET
        generateValue: true

databases:
  - name: wordhive-db
    databaseName: wordhive
    user: wordhive_user

  - name: wordhive-redis
    type: redis

  - type: web
    name: wordhive-landing
    runtime: static
    staticPublishPath: ./landing/dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

---

## 16. Seguridad

### 16.1 Modelo de Amenazas

| Amenaza | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Fuerza bruta en login (adivinar PIN) | Alta | Alto | Rate limiting: 5 intentos/15min por IP |
| Enumeración de emails en registro | Media | Medio | Mensajes de error genéricos |
| Tokens JWT robados | Baja | Alto | Refresh token rotation + HTTPS obligatorio |
| Inyección SQL | Media | Crítico | ORM Prisma con queries parametrizadas |
| XSS en contenido generado por usuarios | Media | Medio | Sanitización con DOMPurify en frontend |
| Acceso no autorizado a salas privadas | Media | Medio | Validación de membresía en cada evento WebSocket |
| Spoofing de eventos WebSocket (trampa en juego) | Alta | Alto | Validación server-side de cada palabra contra la cuadrícula en Redis |
| Exposición de datos PII (email, edad) | Baja | Alto | Email solo visible al propio usuario |

### 16.2 Medidas de Seguridad por Capa

#### Transporte
- HTTPS/WSS obligatorio en todos los ambientes (Render provee TLS automático).
- Headers de seguridad: `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`.

#### Autenticación
- PINs almacenados con bcrypt (cost factor 12).
- JWT con expiración corta (7 días access token).
- Tokens de reset: UUID v4, un solo uso, expiración 30 minutos.

#### Autorización
- Middleware de autenticación en todas las rutas protegidas.
- Validación de ownership en recursos propios.
- Middleware WebSocket que valida el JWT en cada conexión.

#### Datos
- Validación de todos los inputs con Zod antes de procesar.
- Prisma previene inyección SQL por defecto (queries parametrizadas).
- Datos de edad: no expuesto en APIs públicas.

---

## 17. Plan de Desarrollo por Fases

### Fase 1: Fundamentos (Semanas 1-4)

**Objetivo:** MVP funcional con autenticación, catálogo básico y juego local.

- [ ] Setup del repositorio (monorepo `packages/backend` y `packages/app`)
- [ ] Configuración de Render: PostgreSQL + Redis + Web Service
- [ ] Schema de BD con Prisma y primera migración
- [ ] Módulo de autenticación completo (registro, login, recuperación PIN)
- [ ] API de catálogo (CRUD de sopas, paginación)
- [ ] Algoritmo de generación de cuadrícula
- [ ] Flutter app: pantallas de auth, catálogo y detalle
- [ ] Widget de cuadrícula interactiva (sin multijugador aún)
- [ ] Landing page (versión 1)

### Fase 2: Multijugador en Tiempo Real (Semanas 5-8)

**Objetivo:** Salas, WebSocket y partidas multijugador funcionales.

- [ ] Módulo de salas (creación, lobby, código compartible)
- [ ] Integración Socket.IO en backend
- [ ] Redis adapter para Socket.IO (multi-instancia ready)
- [ ] Handlers de WebSocket: join-room, word-found, game-start, game-end
- [ ] Flutter: pantalla de lobby con jugadores en tiempo real
- [ ] Flutter: pantalla de juego con ranking en vivo
- [ ] Modal de resultados y ranking final
- [ ] Generación de enlace compartible y QR

### Fase 3: Social y Notificaciones (Semanas 9-12)

**Objetivo:** Sistema de amigos, notificaciones y email.

- [ ] Módulo de amigos completo (solicitudes, aceptar/rechazar, lista online)
- [ ] Sistema de notificaciones in-app con WebSocket
- [ ] Integración de Nodemailer con templates HTML
- [ ] Centro de notificaciones en Flutter
- [ ] Flutter: pantallas de amigos y perfil con estadísticas
- [ ] Invitaciones a sala por lista de amigos

### Fase 4: Pulimento y Producción (Semanas 13-16)

**Objetivo:** UX pulida, rendimiento optimizado y despliegue estable.

- [ ] Animaciones y micro-interacciones en Flutter
- [ ] Testing: unitario (servicios backend) + integración (API endpoints)
- [ ] Optimización de queries PostgreSQL (índices, explain analyze)
- [ ] Rate limiting y headers de seguridad
- [ ] Modo offline básico (Hive local storage)
- [ ] Configuración parental (límites de tiempo)
- [ ] Auditoría de seguridad básica
- [ ] Deploy en producción con dominio personalizado
- [ ] Monitoreo con Render metrics + logging estructurado

---

## 18. Riesgos y Mitigaciones

| ID | Riesgo | Probabilidad | Impacto | Plan de Mitigación |
|---|---|---|---|---|
| R-01 | Limitaciones del plan gratuito de Render (sleep después de inactividad) | Alta | Alto | Usar plan Starter ($7/mes) para el Web Service desde Fase 2 |
| R-02 | Escalabilidad de WebSocket con muchos usuarios concurrentes | Media | Alto | Redis adapter para Socket.IO desde el inicio; escalar horizontalmente si es necesario |
| R-03 | Algoritmo de generación no coloca todas las palabras | Media | Alto | Límite de 100 intentos con ampliación automática de cuadrícula |
| R-04 | Trampas en el juego (clientes modificados que envían palabras inválidas) | Alta | Medio | Validación server-side de cada palabra contra la cuadrícula en Redis |
| R-05 | Abuso de la API de recuperación de contraseña (spam de emails) | Media | Medio | Rate limiting: 3 solicitudes de reset por email por hora |
| R-06 | Flutter Web con rendimiento inferior en la cuadrícula de juego | Media | Medio | Usar `CustomPainter` optimizado para el grid; evaluar canvas rendering |
| R-07 | Costos inesperados de SMTP gratuito al crecer | Baja | Bajo | Límite de 500 emails/día con Gmail SMTP; migrar a Brevo si es necesario |

---

## 19. Glosario

| Término | Definición |
|---|---|
| **Sopa de letras** | Cuadrícula de letras donde se esconden palabras en distintas direcciones. |
| **Sala** | Espacio virtual donde múltiples jugadores compiten en la misma sopa en tiempo real. |
| **PIN** | Código numérico de 4 dígitos usado como contraseña para iniciar sesión. |
| **Lobby** | Sala de espera antes de que inicie la partida. |
| **Anfitrión (Host)** | El usuario que crea la sala y tiene control para iniciar la partida. |
| **Word Claim** | Acción de reclamar una palabra al ser el primero en encontrarla en la partida. |
| **WebSocket (WSS)** | Protocolo de comunicación bidireccional en tiempo real sobre TLS. |
| **JWT** | JSON Web Token — formato estándar para transmitir información de autenticación de forma segura. |
| **Refresh Token** | Token de larga duración usado para renovar el access token. |
| **Rate Limiting** | Restricción del número de solicitudes que un cliente puede hacer en un período de tiempo. |
| **JSONB** | Tipo de dato en PostgreSQL que almacena JSON de forma binaria con soporte para indexación. |
| **Redis Pub/Sub** | Mecanismo de publicación/suscripción de Redis para distribuir eventos entre instancias del servidor. |
| **Socket.IO** | Biblioteca que implementa WebSockets con fallbacks y funcionalidades adicionales. |
| **Prisma** | ORM moderno para Node.js con TypeScript que provee type safety y migraciones automáticas. |
| **Nodemailer** | Módulo Node.js para enviar correos electrónicos usando cualquier servidor SMTP. |
| **Deep Link** | Enlace que abre directamente una pantalla específica dentro de la app de Flutter. |
| **CCU** | Concurrent Users — usuarios concurrentes activos al mismo tiempo en el sistema. |
| **ACID** | Atomicity, Consistency, Isolation, Durability — propiedades que garantizan transacciones de BD confiables. |
| **Dark Pattern** | Trampa de diseño UX que manipula al usuario en contra de sus intereses. |

---

*Documento preparado para el proyecto WordHive — Sopa de Letras Multijugador*  
*Version 1.0.0 — Octubre 2026*  
*Este documento debe revisarse y actualizarse al inicio de cada fase de desarrollo.*
