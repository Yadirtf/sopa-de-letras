import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../auth/presentation/providers/auth_notifier.dart';
import '../../domain/entities/room_lobby_entities.dart';
import '../providers/game_room_notifier.dart';
import '../providers/game_room_state.dart';
import '../widgets/connection_lost_banner.dart';
import '../widgets/leave_room_dialog.dart';
import '../widgets/lobby_action_bar_widget.dart';
import '../widgets/lobby_invite_button.dart';
import '../widgets/lobby_status_banner_widget.dart';
import '../widgets/room_player_slot_widget.dart';

class RoomLobbyPage extends ConsumerStatefulWidget {
  final String roomCode;

  const RoomLobbyPage({super.key, required this.roomCode});

  @override
  ConsumerState<RoomLobbyPage> createState() => _RoomLobbyPageState();
}

class _RoomLobbyPageState extends ConsumerState<RoomLobbyPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _ensureJoined());
  }

  /// El anfitrion llega aqui desde "Crear sala" sin haber entrado por socket:
  /// sin esto, "Listo" e "Iniciar" se enviaban sin usuario y no pasaba nada.
  Future<void> _ensureJoined() async {
    final notifier = ref.read(gameRoomNotifierProvider.notifier);
    if (!mounted || notifier.isJoinedTo(widget.roomCode)) return;
    final user = ref.read(authNotifierProvider).user;
    if (user == null) return;
    await notifier.joinRoom(code: widget.roomCode, userId: user.id, username: user.name, avatarUrl: user.avatarUrl);
  }

  /// Solo sale quien lo pide: si se cae el internet, el servidor le guarda el puesto.
  Future<void> _leave() async {
    if (!await LeaveRoomDialog.confirm(context, inGame: false) || !mounted) return;
    ref.read(gameRoomNotifierProvider.notifier).leaveRoom();
    context.go('/catalog');
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(gameRoomNotifierProvider);
    final notifier = ref.read(gameRoomNotifierProvider.notifier);
    final room = state.room;
    final currentUserId = notifier.currentUserId ?? ref.watch(authNotifierProvider).user?.id;

    ref.listen<GameRoomState>(gameRoomNotifierProvider, (previous, next) {
      if (next.countdownValue != null || next.isGameActive) {
        context.go('/game/${widget.roomCode}');
      }
      if (next.errorMessage != null && next.errorMessage != previous?.errorMessage) {
        ScaffoldMessenger.of(context)
          ..hideCurrentSnackBar()
          ..showSnackBar(SnackBar(backgroundColor: AppColors.accentRose, content: Text(next.errorMessage!)));
      }
    });

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _leave();
      },
      child: Scaffold(
        backgroundColor: AppColors.bgPrimary,
        appBar: AppBar(
          backgroundColor: AppColors.bgPrimary,
          elevation: 0,
          automaticallyImplyLeading: false,
          title: Text('Sala ${widget.roomCode}', style: AppTypography.heading2.copyWith(fontSize: 18)),
          actions: [
            TextButton.icon(
              key: const ValueKey('lobby-leave-button'),
              onPressed: _leave,
              icon: const Icon(Icons.logout_rounded, color: AppColors.accentRose),
              label: Text('Abandonar sala', style: AppTypography.labelLarge.copyWith(color: AppColors.accentRose)),
            ),
          ],
        ),
        body: room == null
            ? const Center(child: CircularProgressIndicator(color: AppColors.accentCyan))
            : SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: _buildLobby(state, notifier, LobbyReadiness.of(room, currentUserId)),
                ),
              ),
      ),
    );
  }

  Widget _buildLobby(GameRoomState state, GameRoomNotifier notifier, LobbyReadiness readiness) {
    final room = state.room!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(room.wordSearchTitle, style: AppTypography.heading2.copyWith(fontSize: 20)),
        const SizedBox(height: 4),
        Text(
          'Jugadores en la sala: ${room.players.length} de ${room.maxPlayers}',
          style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
        ),
        const SizedBox(height: 12),
        ConnectionLostBanner(visible: !state.isConnected),
        LobbyStatusBannerWidget(readiness: readiness),
        const SizedBox(height: 16),
        Expanded(
          child: GridView.builder(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 1.1,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: room.maxPlayers,
            itemBuilder: (context, index) => RoomPlayerSlotWidget(
              player: index < room.players.length ? room.players[index] : null,
              slotIndex: index,
            ),
          ),
        ),
        const SizedBox(height: 12),
        if (!room.isFull) LobbyInviteButton(roomCode: room.code),
        LobbyActionBarWidget(
          readiness: readiness,
          isStarting: state.isStarting,
          onToggleReady: notifier.toggleReady,
          onStart: notifier.startGame,
        ),
      ],
    );
  }
}
