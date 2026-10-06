import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/auth_notifier.dart';

class ForgotPinPage extends ConsumerStatefulWidget {
  const ForgotPinPage({super.key});

  @override
  ConsumerState<ForgotPinPage> createState() => _ForgotPinPageState();
}

class _ForgotPinPageState extends ConsumerState<ForgotPinPage> {
  final _emailController = TextEditingController();
  final _otpController = TextEditingController();
  final _newPinController = TextEditingController();
  bool _otpSent = false;

  Future<void> _requestOtp() async {
    final email = _emailController.text.trim();
    if (!email.contains('@')) return;
    final success = await ref.read(authNotifierProvider.notifier).requestPinReset(email);
    if (success && mounted) {
      setState(() => _otpSent = true);
    }
  }

  Future<void> _submitReset() async {
    final success = await ref.read(authNotifierProvider.notifier).resetPin(
      _emailController.text.trim(),
      _otpController.text.trim(),
      _newPinController.text.trim(),
    );
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('PIN restablecido con éxito. Inicia sesión.')),
      );
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Recuperar PIN'), backgroundColor: Colors.transparent),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              _otpSent ? 'Ingresa el código OTP de 6 dígitos enviado a tu correo' : 'Ingresa tu correo para recibir un código temporal',
              style: AppTypography.bodyMedium,
            ),
            const SizedBox(height: 24),
            if (!_otpSent) ...[
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: 'Correo Electrónico', prefixIcon: Icon(Icons.email_outlined)),
              ),
              const SizedBox(height: 24),
              ElevatedButton(onPressed: _requestOtp, child: const Text('Enviar Código')),
            ] else ...[
              TextField(
                controller: _otpController,
                keyboardType: TextInputType.number,
                maxLength: 6,
                decoration: const InputDecoration(labelText: 'Código OTP (6 dígitos)', prefixIcon: Icon(Icons.pin_outlined)),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _newPinController,
                keyboardType: TextInputType.number,
                maxLength: 4,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Nuevo PIN (4 dígitos)', prefixIcon: Icon(Icons.lock_outline)),
              ),
              const SizedBox(height: 24),
              ElevatedButton(onPressed: _submitReset, child: const Text('Restablecer PIN')),
            ],
          ],
        ),
      ),
    );
  }
}
