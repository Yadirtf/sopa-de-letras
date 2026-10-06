import 'package:flutter/material.dart';

/// Messenger raíz: permite mostrar SnackBars desde widgets globales
/// (banner de invitación, socket social) que viven fuera de cualquier Scaffold.
final GlobalKey<ScaffoldMessengerState> rootScaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();

void showRootSnack(String message) {
  rootScaffoldMessengerKey.currentState
    ?..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(content: Text(message)));
}
