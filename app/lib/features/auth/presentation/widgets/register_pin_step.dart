import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import 'pin_pad_widget.dart';

/// Paso 3 del registro: el teclado del PIN. Si el servidor rechaza los datos
/// (p. ej. el correo ya existe) se explica aquí mismo y se ofrece volver.
class RegisterPinStep extends StatelessWidget {
  final String pin;
  final bool loading;
  final String? error;
  final ValueChanged<String> onPinChanged;
  final VoidCallback onComplete;
  final VoidCallback onEditData;

  const RegisterPinStep({
    super.key,
    required this.pin,
    required this.loading,
    required this.error,
    required this.onPinChanged,
    required this.onComplete,
    required this.onEditData,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.only(top: 16, bottom: 24),
      children: [
        if (error != null && !loading)
          Container(
            padding: const EdgeInsets.fromLTRB(12, 12, 4, 4),
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: AppColors.accentRose.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(error!, style: const TextStyle(color: AppColors.accentRose)),
                TextButton(onPressed: onEditData, child: const Text('Revisar mis datos')),
              ],
            ),
          ),
        if (loading)
          const Padding(
            padding: EdgeInsets.all(48),
            child: Column(
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text('Creando tu perfil…', style: TextStyle(color: AppColors.textSecondary)),
              ],
            ),
          )
        else
          PinPadWidget(currentPin: pin, onPinChanged: onPinChanged, onComplete: onComplete),
      ],
    );
  }
}
