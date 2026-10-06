import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/room_invite_entity.dart';
import 'player_avatar_widget.dart';

/// Banner flotante de invitación (US-24): quién invita, a qué sopa,
/// un anillo de 15 s que se vacía y dos botones grandes. Nada más.
class RoomInviteBanner extends StatefulWidget {
  final RoomInviteEntity invite;
  final VoidCallback onJoin;
  final VoidCallback onDismiss;

  const RoomInviteBanner({super.key, required this.invite, required this.onJoin, required this.onDismiss});

  @override
  State<RoomInviteBanner> createState() => _RoomInviteBannerState();
}

class _RoomInviteBannerState extends State<RoomInviteBanner> {
  static const _totalSeconds = 15;
  Timer? _ticker;
  late int _secondsLeft = widget.invite.secondsLeft(DateTime.now());

  @override
  void initState() {
    super.initState();
    _ticker = Timer.periodic(const Duration(milliseconds: 250), (_) {
      final left = widget.invite.secondsLeft(DateTime.now());
      if (left != _secondsLeft) setState(() => _secondsLeft = left);
      if (left == 0) {
        _ticker?.cancel();
        widget.onDismiss();
      }
    });
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final invite = widget.invite;
    return Semantics(
      liveRegion: true,
      label: '${invite.fromName} te invita a jugar ${invite.wordSearchTitle}',
      child: Material(
        color: Colors.transparent,
        child: Container(
          margin: const EdgeInsets.fromLTRB(12, 8, 12, 0),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.accentViolet, width: 1.5),
            boxShadow: [BoxShadow(color: AppColors.accentViolet.withValues(alpha: 0.35), blurRadius: 24, offset: const Offset(0, 8))],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  PlayerAvatar(avatarId: invite.fromAvatar, size: 44),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('¡${invite.fromName} te invita a jugar!',
                            style: AppTypography.labelBold.copyWith(fontSize: 15), maxLines: 2, overflow: TextOverflow.ellipsis),
                        const SizedBox(height: 2),
                        Text('«${invite.wordSearchTitle}»', style: AppTypography.bodySmall, maxLines: 1, overflow: TextOverflow.ellipsis),
                      ],
                    ),
                  ),
                  _CountdownRing(secondsLeft: _secondsLeft, total: _totalSeconds),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextButton(
                      style: TextButton.styleFrom(minimumSize: const Size(0, 48), foregroundColor: AppColors.textSecondary),
                      onPressed: widget.onDismiss,
                      child: const Text('Ahora no'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.accentEmerald,
                        foregroundColor: Colors.white,
                        minimumSize: const Size(0, 48),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: widget.onJoin,
                      icon: const Icon(Icons.login_rounded),
                      label: const Text('¡Unirme!', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CountdownRing extends StatelessWidget {
  final int secondsLeft;
  final int total;

  const _CountdownRing({required this.secondsLeft, required this.total});

  @override
  Widget build(BuildContext context) {
    final urgent = secondsLeft <= 5;
    return SizedBox(
      width: 40,
      height: 40,
      child: Stack(
        alignment: Alignment.center,
        children: [
          TweenAnimationBuilder<double>(
            tween: Tween(end: (secondsLeft / total).clamp(0.0, 1.0)),
            duration: const Duration(milliseconds: 300),
            builder: (_, value, __) => CircularProgressIndicator(
              value: value,
              strokeWidth: 4,
              backgroundColor: AppColors.bgSecondary,
              color: urgent ? AppColors.accentRose : AppColors.accentCyan,
            ),
          ),
          Text('$secondsLeft', style: AppTypography.labelBold.copyWith(color: urgent ? AppColors.accentRose : AppColors.textPrimary)),
        ],
      ),
    );
  }
}
