# app/

Contiene EXCLUSIVAMENTE la aplicacion Flutter de WordHive.

## Tecnologias
- Flutter 3.x (Dart)
- Riverpod 2.x (estado)
- Go Router (navegacion + deep links)
- Dio (HTTP) + socket_io_client (WebSocket)
- Hive / Isar (offline) + Lottie (animaciones)

## Arquitectura Clean (Feature-First)
- data/ - Datasources, modelos JSON, implementacion repositorios
- domain/ - Entidades puras Dart, interfaces, casos de uso
- presentation/ - Pages, Widgets, Providers Riverpod
