import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../auth/presentation/providers/auth_notifier.dart';
import '../providers/game_room_notifier.dart';
import '../providers/solo_game_launcher.dart';

/// "Jugar en Solitario": prepara la partida con un aviso de espera y entra
/// directo al tablero (sin lobby). Si algo falla, lo explica sin tecnicismos.
Future<void> startSoloGame(BuildContext context, WidgetRef ref, String wordSearchId) async {
  final user = ref.read(authNotifierProvider).user;
  if (user == null) return;
  final notifier = ref.read(gameRoomNotifierProvider.notifier);
  final messenger = ScaffoldMessenger.of(context);
  final navigator = Navigator.of(context, rootNavigator: true);
  final router = GoRouter.of(context);

  showDialog<void>(
    context: context,
    barrierDismissible: false,
    builder: (_) => PopScope(
      canPop: false,
      child: AlertDialog(
        backgroundColor: AppColors.bgCard,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Row(
          children: [
            const CircularProgressIndicator(color: AppColors.accentCyan),
            const SizedBox(width: 20),
            Expanded(child: Text('Preparando tu sopa...', style: AppTypography.bodyLarge)),
          ],
        ),
      ),
    ),
  );

  final code = await SoloGameLauncher(notifier, () => ref.read(gameRoomNotifierProvider)).launch(
    wordSearchId: wordSearchId,
    userId: user.id,
    username: user.name,
    avatarUrl: user.avatarUrl,
  );
  navigator.pop();

  if (code == null) {
    messenger.showSnackBar(SnackBar(
      backgroundColor: AppColors.accentRose,
      content:
          Text(ref.read(gameRoomNotifierProvider).errorMessage ?? 'No pudimos empezar la partida. Inténtalo de nuevo.'),
    ));
    return;
  }
  ref.read(soloRoomCodeProvider.notifier).state = code;
  router.go('/game/$code');
}
