import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../auth/presentation/providers/auth_notifier.dart';
import '../providers/game_room_notifier.dart';

class JoinRoomPage extends ConsumerStatefulWidget {
  const JoinRoomPage({super.key});

  @override
  ConsumerState<JoinRoomPage> createState() => _JoinRoomPageState();
}

class _JoinRoomPageState extends ConsumerState<JoinRoomPage> {
  final TextEditingController _codeController = TextEditingController();
  bool _isLoading = false;
  String? _error;

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  void _handleJoin() async {
    final code = _codeController.text.trim().toUpperCase();
    if (code.length < 4) {
      setState(() => _error = 'Ingresa un código válido de sala');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    final authUser = ref.read(authNotifierProvider).user;
    final userId = authUser?.id ?? 'guest-${DateTime.now().millisecondsSinceEpoch}';
    final username = authUser?.name ?? 'Invitado';

    final notifier = ref.read(gameRoomNotifierProvider.notifier);
    await notifier.joinRoom(
      code: code,
      userId: userId,
      username: username,
      avatarUrl: authUser?.avatarUrl,
    );

    if (!mounted) return;
    setState(() => _isLoading = false);

    final state = ref.read(gameRoomNotifierProvider);
    if (state.errorMessage != null) {
      setState(() => _error = state.errorMessage);
    } else {
      context.go('/lobby/$code');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.bgPrimary,
        elevation: 0,
        title: Text('Unirse a una Sala', style: AppTypography.heading2.copyWith(fontSize: 18)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Código de Sala', style: AppTypography.heading1.copyWith(fontSize: 22)),
            const SizedBox(height: 8),
            Text(
              'Ingresa el código alfanumérico de 6 dígitos que te compartió el anfitrión.',
              style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _codeController,
              textAlign: TextAlign.center,
              textCapitalization: TextCapitalization.characters,
              maxLength: 6,
              style: AppTypography.heading1.copyWith(
                color: AppColors.accentCyan,
                letterSpacing: 8,
                fontSize: 28,
              ),
              decoration: InputDecoration(
                hintText: 'HIVE92',
                hintStyle: TextStyle(color: AppColors.textMuted.withValues(alpha: 0.5)),
                counterText: '',
                filled: true,
                fillColor: AppColors.bgCard,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: AppColors.borderGlow),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: AppColors.borderSubtle),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: AppColors.accentViolet, width: 2),
                ),
              ),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(
                _error!,
                textAlign: TextAlign.center,
                style: AppTypography.bodySmall.copyWith(color: AppColors.accentRose),
              ),
            ],
            const SizedBox(height: 32),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.accentCyan,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              onPressed: _isLoading ? null : _handleJoin,
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2),
                    )
                  : Text(
                      'Entrar a la Sala',
                      style: AppTypography.labelLarge.copyWith(color: Colors.black, fontWeight: FontWeight.bold),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
