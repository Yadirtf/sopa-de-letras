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

## Descargar la APK

El workflow `.github/workflows/android-apk.yml` compila la APK en cada PR, push a `main` y tag `v*`:

- **Última versión de main:** pestaña *Releases* del repo, release `latest`.
- **Versión estable:** crea un tag (`git tag v1.0.0 && git push origin v1.0.0`) y se publica su Release.
- **De un PR:** pestaña *Actions*, run del PR, artefacto `wordhive-apk`.

Para firmar con tu propia clave (y poder actualizar sin desinstalar), añade los secretos
`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` y `ANDROID_KEY_PASSWORD`.
Sin ellos la APK se firma con la clave debug del runner.
