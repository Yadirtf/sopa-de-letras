import 'package:flutter/material.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_typography.dart';

/// "¿Te retaron?" Escribir el código que mandó el amigo y entrar.
class JoinBattleCard extends StatefulWidget {
  final ValueChanged<String> onJoin;

  const JoinBattleCard({super.key, required this.onJoin});

  @override
  State<JoinBattleCard> createState() => _JoinBattleCardState();
}

class _JoinBattleCardState extends State<JoinBattleCard> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _submit() {
    final code = _controller.text.trim().toUpperCase();
    if (code.length >= 4) widget.onJoin(code);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [
          AppColors.accentCyan.withValues(alpha: 0.18),
          AppColors.accentViolet.withValues(alpha: 0.18),
        ]),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('¿Te retaron?', style: AppTypography.titleMedium.copyWith(fontSize: 17)),
        const SizedBox(height: 4),
        Text('Escribe el código que te mandaron.',
            style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary)),
        const SizedBox(height: 10),
        Row(children: [
          Expanded(
            child: TextField(
              key: const ValueKey('battle-join-code'),
              controller: _controller,
              textCapitalization: TextCapitalization.characters,
              maxLength: 6,
              style: AppTypography.pinKey.copyWith(fontSize: 20, letterSpacing: 4),
              decoration: const InputDecoration(counterText: '', hintText: 'ABC123'),
              onSubmitted: (_) => _submit(),
            ),
          ),
          const SizedBox(width: 10),
          FilledButton(
            key: const ValueKey('battle-join-submit'),
            onPressed: _submit,
            child: const Text('Entrar'),
          ),
        ]),
      ]),
    );
  }
}
