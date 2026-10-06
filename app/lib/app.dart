import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';
import 'core/router/app_messenger.dart';
import 'features/social/presentation/widgets/social_realtime_gate.dart';

class WordHiveApp extends StatelessWidget {
  const WordHiveApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'WordHive',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      routerConfig: appRouter,
      scaffoldMessengerKey: rootScaffoldMessengerKey,
      // Capa social global (EP-05): socket en tiempo real + banner de invitaciones.
      builder: (context, child) => SocialRealtimeGate(child: child ?? const SizedBox.shrink()),
    );
  }
}
