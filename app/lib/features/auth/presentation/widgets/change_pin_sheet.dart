import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/profile_actions.dart';
import 'pin_pad_widget.dart';

/// Cambio de PIN en tres pasos con el mismo teclado del login:
/// PIN actual -> PIN nuevo -> repetir. Un solo dato por pantalla, sin
/// formularios: así lo puede hacer un niño o un abuelo.
class ChangePinSheet extends ConsumerStatefulWidget {
  const ChangePinSheet({super.key});

  /// Devuelve true si el PIN cambió.
  static Future<bool?> show(BuildContext context) => showModalBottomSheet<bool>(
        context: context,
        isScrollControlled: true,
        useRootNavigator: true,
        useSafeArea: true,
        backgroundColor: AppColors.bgSecondary,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
        builder: (_) => const ChangePinSheet(),
      );

  @override
  ConsumerState<ChangePinSheet> createState() => _ChangePinSheetState();
}

class _ChangePinSheetState extends ConsumerState<ChangePinSheet> {
  static const _titles = ['Escribe tu PIN actual', 'Ahora tu PIN nuevo', 'Repite el PIN nuevo'];
  static const _hints = [
    'Para saber que eres tú',
    '4 números fáciles de recordar',
    'Para asegurarnos de que está bien'
  ];

  int _step = 0;
  String _pin = '';
  String _current = '';
  String _newPin = '';
  String? _error;
  bool _saving = false;

  void _restartAt(int step, String error) => setState(() {
        _step = step;
        _pin = '';
        _error = error;
      });

  void _advanceTo(int step) => setState(() {
        _step = step;
        _pin = '';
        _error = null;
      });

  Future<void> _onComplete() async {
    // Pausa breve para que se vea el cuarto punto antes de cambiar de paso.
    await Future<void>.delayed(const Duration(milliseconds: 180));
    if (!mounted) return;
    final pin = _pin;

    if (_step == 0) {
      _current = pin;
      _advanceTo(1);
    } else if (_step == 1) {
      if (pin == _current) return _restartAt(1, 'Elige un PIN distinto al actual');
      _newPin = pin;
      _advanceTo(2);
    } else {
      if (pin != _newPin) return _restartAt(1, 'No coinciden. Escribe de nuevo tu PIN nuevo');
      await _save();
    }
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    final error = await ref.read(ProfileActions.provider).updatePin(currentPin: _current, newPin: _newPin);
    if (!mounted) return;
    if (error == null) return Navigator.of(context).pop(true);
    setState(() => _saving = false);
    _restartAt(0, error);
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(color: AppColors.textMuted, borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 16),
          _StepDots(step: _step),
          const SizedBox(height: 16),
          Text(_titles[_step], style: AppTypography.titleMedium, textAlign: TextAlign.center),
          const SizedBox(height: 4),
          Text(_hints[_step], style: AppTypography.bodyMedium, textAlign: TextAlign.center),
          SizedBox(
            height: 40,
            child: Center(
              child: _error == null
                  ? null
                  : Text(_error!,
                      textAlign: TextAlign.center,
                      style: AppTypography.bodyMedium.copyWith(color: AppColors.accentRose)),
            ),
          ),
          if (_saving)
            const Padding(padding: EdgeInsets.all(48), child: CircularProgressIndicator(color: AppColors.accentAmber))
          else
            PinPadWidget(
              key: ValueKey(_step),
              currentPin: _pin,
              onPinChanged: (value) => setState(() => _pin = value),
              onComplete: _onComplete,
            ),
        ],
      ),
    );
  }
}

class _StepDots extends StatelessWidget {
  final int step;

  const _StepDots({required this.step});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(3, (i) {
        return AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          margin: const EdgeInsets.symmetric(horizontal: 4),
          width: i == step ? 28 : 10,
          height: 10,
          decoration: BoxDecoration(
            color: i <= step ? AppColors.accentAmber : AppColors.bgCard,
            borderRadius: BorderRadius.circular(5),
          ),
        );
      }),
    );
  }
}
