import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/auth_notifier.dart';
import '../widgets/pin_pad_widget.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _emailController = TextEditingController();
  String _pin = '';
  bool _isPinStep = false;

  void _onContinueToPin() {
    if (_emailController.text.trim().contains('@')) {
      setState(() => _isPinStep = true);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Ingresa un correo electrónico válido')),
      );
    }
  }

  Future<void> _submitLogin() async {
    final success = await ref
        .read(authNotifierProvider.notifier)
        .login(_emailController.text.trim(), _pin);
    if (success && mounted) {
      context.go('/home');
    }
  }

  Future<void> _onGuestPlay() async {
    final success = await ref.read(authNotifierProvider.notifier).guestLogin();
    if (success && mounted) {
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text('WordHive', style: AppTypography.hero),
              const SizedBox(height: 8),
              Text(
                _isPinStep ? 'Ingresa tu PIN de 4 dígitos' : 'Inicia sesión para competir',
                style: AppTypography.bodyMedium,
              ),
              const SizedBox(height: 32),

              if (authState.errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.accentRose.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.accentRose),
                  ),
                  child: Text(authState.errorMessage!, style: const TextStyle(color: AppColors.accentRose)),
                ),
                const SizedBox(height: 24),
              ],

              if (!_isPinStep) ...[
                TextField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Correo Electrónico',
                    prefixIcon: Icon(Icons.email_outlined, color: AppColors.accentCyan),
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _onContinueToPin,
                    child: const Text('Continuar'),
                  ),
                ),
              ] else ...[
                PinPadWidget(
                  currentPin: _pin,
                  onPinChanged: (val) => setState(() => _pin = val),
                  onComplete: _submitLogin,
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () => setState(() { _isPinStep = false; _pin = ''; }),
                  child: const Text('Cambiar correo', style: TextStyle(color: AppColors.accentCyan)),
                ),
              ],

              const SizedBox(height: 24),
              OutlinedButton.icon(
                onPressed: _onGuestPlay,
                icon: const Icon(Icons.bolt, color: AppColors.accentAmber),
                label: const Text('Jugar como Invitado (Sin Registro)'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.textPrimary,
                  side: const BorderSide(color: AppColors.accentAmber),
                  padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
                ),
              ),

              const SizedBox(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('¿No tienes cuenta? ', style: AppTypography.bodyMedium),
                  GestureDetector(
                    onTap: () => context.push('/register'),
                    child: Text('Regístrate', style: TextStyle(color: AppColors.accentViolet, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              GestureDetector(
                onTap: () => context.push('/forgot-pin'),
                child: Text('¿Olvidaste tu PIN?', style: AppTypography.bodyMedium),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
