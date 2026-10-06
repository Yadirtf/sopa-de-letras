import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/api_error.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../auth/presentation/providers/auth_notifier.dart';
import '../../domain/entities/social_entities.dart';
import '../providers/friends_notifier.dart';
import '../providers/social_providers.dart';
import 'friend_tile_widget.dart';
import 'guest_social_gate_widget.dart';
import 'player_avatar_widget.dart';
import 'presence_label_widget.dart';
import 'share_room_code_tile.dart';

/// Hoja "Invitar amigos" del lobby (US-24): un toque y al amigo le aparece
/// un banner con 15 s para unirse. Mientras corre ese tiempo, el botón
/// muestra la cuenta atrás en lugar de permitir spam.
class InviteFriendsSheet extends ConsumerStatefulWidget {
  final String roomCode;

  const InviteFriendsSheet({super.key, required this.roomCode});

  static Future<void> show(BuildContext context, String roomCode) => showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: AppColors.bgSecondary,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
        builder: (_) => FractionallySizedBox(heightFactor: 0.75, child: InviteFriendsSheet(roomCode: roomCode)),
      );

  @override
  ConsumerState<InviteFriendsSheet> createState() => _InviteFriendsSheetState();
}

class _InviteFriendsSheetState extends ConsumerState<InviteFriendsSheet> {
  final Map<String, DateTime> _invitedUntil = {};
  final Set<String> _sending = {};
  String? _error;
  Timer? _ticker;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(friendsNotifierProvider.notifier).load(silent: true));
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_invitedUntil.isNotEmpty && mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  Future<void> _invite(FriendEntity friend) async {
    setState(() {
      _sending.add(friend.id);
      _error = null;
    });
    try {
      final until = await ref.read(socialRepositoryProvider).inviteToRoom(friendId: friend.id, roomCode: widget.roomCode);
      HapticFeedback.lightImpact();
      setState(() => _invitedUntil[friend.id] = until);
    } catch (e) {
      if (mounted) setState(() => _error = friendlyApiError(e));
    } finally {
      if (mounted) setState(() => _sending.remove(friend.id));
    }
  }

  @override
  Widget build(BuildContext context) {
    final isGuest = ref.watch(authNotifierProvider).user?.isGuest ?? true;
    final friends = ref.watch(friendsNotifierProvider).friends;

    return SafeArea(
      child: Column(
        children: [
          const SizedBox(height: 12),
          Container(width: 44, height: 5, decoration: BoxDecoration(color: AppColors.textMuted, borderRadius: BorderRadius.circular(3))),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 4),
            child: Text('Invita a tus amigos', style: AppTypography.titleMedium),
          ),
          Expanded(child: isGuest ? const GuestSocialGate() : _list(friends)),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
              child: Text(_error!, style: AppTypography.bodySmall.copyWith(color: AppColors.accentRose)),
            ),
          ShareRoomCodeTile(roomCode: widget.roomCode),
        ],
      ),
    );
  }

  Widget _list(List<FriendEntity> friends) {
    if (friends.isEmpty) {
      return Center(child: Text('Aún no tienes amigos agregados', style: AppTypography.bodyMedium));
    }
    return ListView(
      children: friends.map((f) => SocialTile(
            name: f.name,
            avatarId: f.avatarUrl,
            avatar: PlayerAvatar(avatarId: f.avatarUrl, status: f.status),
            subtitle: PresenceLabel(status: f.status),
            trailing: _button(f),
          )).toList(),
    );
  }

  Widget _button(FriendEntity friend) {
    final secondsLeft = _invitedUntil[friend.id]?.difference(DateTime.now()).inSeconds ?? 0;
    if (secondsLeft > 0) {
      return SocialActionButton(label: 'Enviada · $secondsLeft', icon: Icons.check_rounded, color: AppColors.accentEmerald, filled: false, onPressed: null);
    }
    if (friend.status != PresenceStatus.online) {
      return Text(friend.status == PresenceStatus.playing ? 'En partida' : 'No disponible', style: AppTypography.bodySmall);
    }
    return SocialActionButton(
      label: _invitedUntil.containsKey(friend.id) ? 'Otra vez' : 'Invitar',
      icon: Icons.send_rounded,
      color: AppColors.accentViolet,
      busy: _sending.contains(friend.id),
      onPressed: () => _invite(friend),
    );
  }
}
