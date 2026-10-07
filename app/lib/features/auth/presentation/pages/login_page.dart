import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/auth_notifier.dart';
import '../providers/auth_state.dart';
import '../widgets/pin_pad_widget.dart';
import '../widgets/login_footer_widget.dart';

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

  // Al entrar no navegamos desde aquí: el portero de rutas (authRouteGuard)
  // saca al jugador del login hacia el inicio o hacia el enlace que abrió.
  Future<void> _submitLogin() => ref.read(authNotifierProvider.notifier).login(_emailController.text.trim(), _pin);

  Future<void> _onGuestPlay() => ref.read(authNotifierProvider.notifier).guestLogin();

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);

    if (authState.status == AuthStatus.authenticated) {
      return const Scaffold(
        backgroundColor: AppColors.bgPrimary,
        body: Center(child: CircularProgressIndicator(color: AppColors.accentCyan)),
      );
    }

    if (authState.status == AuthStatus.initial) {
      return const Scaffold(
        backgroundColor: AppColors.bgPrimary,
        body: Center(child: CircularProgressIndicator(color: AppColors.accentCyan)),
      );
    }

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
                  onPressed: () => setState(() {
                    _isPinStep = false;
                    _pin = '';
                  }),
                  child: const Text('Cambiar correo', style: TextStyle(color: AppColors.accentCyan)),
                ),
              ],
              LoginFooterWidget(onGuestPlay: _onGuestPlay),
            ],
          ),
        ),
      ),
    );
  }
}
