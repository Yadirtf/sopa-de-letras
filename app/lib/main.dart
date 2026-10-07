/// WordHive — Entry Point
///
/// Inicializa Hive (almacenamiento local), configura Riverpod
/// y lanza la aplicacion. Sin logica de negocio aqui.

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_web_plugins/url_strategy.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // En web las rutas se ven limpias (/jugar/lobby/ABC123, sin #) para que
  // los enlaces de invitación y el botón "atrás" del navegador funcionen.
  usePathUrlStrategy();

  // Orientacion preferida: portrait + landscape en tablets
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
    DeviceOrientation.landscapeLeft,
    DeviceOrientation.landscapeRight,
  ]);

  // Estilo de la barra de estado
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );

  // Créditos de los avatares (CC BY 4.0 pide atribución).
  LicenseRegistry.addLicense(() async* {
    final text = await rootBundle.loadString('assets/avatars/LICENSES.txt');
    yield LicenseEntryWithLineBreaks(['Avatares WordHive'], text);
  });

  // Inicializar almacenamiento local
  await Hive.initFlutter();

  runApp(
    const ProviderScope(
      child: WordHiveApp(),
    ),
  );
}
