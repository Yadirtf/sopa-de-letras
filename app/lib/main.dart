/// WordHive — Entry Point
/// 
/// Inicializa Hive (almacenamiento local), configura Riverpod
/// y lanza la aplicacion. Sin logica de negocio aqui.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

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

  // Inicializar almacenamiento local
  await Hive.initFlutter();

  runApp(
    const ProviderScope(
      child: WordHiveApp(),
    ),
  );
}

