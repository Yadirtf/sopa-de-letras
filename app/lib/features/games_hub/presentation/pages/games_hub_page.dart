import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/games_provider.dart';
import '../widgets/game_card.dart';

/// Inicio: "¿A qué jugamos?". Cada juego es un módulo aparte; aquí solo se elige.
class GamesHubPage extends ConsumerWidget {
  const GamesHubPage({super.key});

  static const _accents = [AppColors.accentCyan, AppColors.accentRose, AppColors.accentEmerald, AppColors.accentAmber];

  // `go` y no `push`: así la barra del navegador muestra el juego y recargar no lo pierde.
  void _open(BuildContext context, GameInfo game) => context.go(game.appPath);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final games = ref.watch(gamesProvider).valueOrNull ?? fallbackGames;
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        children: [
          Text('¿A qué jugamos?',
              key: const ValueKey('games-hub-title'), style: AppTypography.titleLarge.copyWith(fontSize: 26)),
          const SizedBox(height: 4),
          Text(
            'Elige un juego. Tu cuenta, tus amigos y tus avisos sirven para todos.',
            style: AppTypography.bodyMedium.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 18),
          for (var i = 0; i < games.length; i++) ...[
            GameCard(game: games[i], accent: _accents[i % _accents.length], onTap: () => _open(context, games[i])),
            const SizedBox(height: 14),
          ],
        ],
      ),
    );
  }
}
