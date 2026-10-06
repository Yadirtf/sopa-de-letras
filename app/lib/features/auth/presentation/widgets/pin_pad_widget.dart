import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class PinPadWidget extends StatelessWidget {
  final String currentPin;
  final ValueChanged<String> onPinChanged;
  final VoidCallback? onComplete;

  const PinPadWidget({
    super.key,
    required this.currentPin,
    required this.onPinChanged,
    this.onComplete,
  });

  void _onKeyPress(String digit) {
    if (currentPin.length < 4) {
      HapticFeedback.lightImpact();
      final newPin = currentPin + digit;
      onPinChanged(newPin);
      if (newPin.length == 4 && onComplete != null) {
        onComplete!();
      }
    }
  }

  void _onBackspace() {
    if (currentPin.isNotEmpty) {
      HapticFeedback.selectionClick();
      onPinChanged(currentPin.substring(0, currentPin.length - 1));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Indicador de 4 dígitos con bioluminiscencia
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(4, (index) {
            final isFilled = index < currentPin.length;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.symmetric(horizontal: 10),
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isFilled ? AppColors.accentAmber : AppColors.bgCard,
                border: Border.all(
                  color: isFilled ? AppColors.accentAmber : AppColors.borderGlow,
                  width: 2,
                ),
                boxShadow: isFilled
                    ? [
                        BoxShadow(
                          color: AppColors.accentAmber.withOpacity(0.5),
                          blurRadius: 10,
                          spreadRadius: 2,
                        ),
                      ]
                    : [],
              ),
            );
          }),
        ),
        const SizedBox(height: 32),

        // Teclado Numérico Custom
        SizedBox(
          width: 280,
          child: Column(
            children: [
              _buildRow(['1', '2', '3']),
              const SizedBox(height: 16),
              _buildRow(['4', '5', '6']),
              const SizedBox(height: 16),
              _buildRow(['7', '8', '9']),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const SizedBox(width: 72, height: 72),
                  _buildKey('0'),
                  _buildActionKey(
                    icon: Icons.backspace_outlined,
                    onTap: _onBackspace,
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRow(List<String> digits) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: digits.map(_buildKey).toList(),
    );
  }

  Widget _buildKey(String digit) {
    return InkWell(
      onTap: () => _onKeyPress(digit),
      borderRadius: BorderRadius.circular(36),
      child: Container(
        width: 72,
        height: 72,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: AppColors.bgCard,
          border: Border.all(color: AppColors.borderSubtle),
        ),
        child: Text(digit, style: AppTypography.pinKey),
      ),
    );
  }

  Widget _buildActionKey({required IconData icon, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(36),
      child: Container(
        width: 72,
        height: 72,
        alignment: Alignment.center,
        child: Icon(icon, color: AppColors.textSecondary, size: 28),
      ),
    );
  }
}
