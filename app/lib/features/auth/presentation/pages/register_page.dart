import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/auth_notifier.dart';
import '../widgets/pin_pad_widget.dart';
import '../widgets/avatar_selector_widget.dart';

class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});

  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _ageController = TextEditingController(text: '16');
  String? _selectedAvatar = 'bee_scout';
  String _pin = '';
  bool _isPinStep = false;

  void _onContinueToPin() {
    if (_nameController.text.trim().length >= 3 &&
        _emailController.text.trim().contains('@') &&
        int.tryParse(_ageController.text) != null) {
      setState(() => _isPinStep = true);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Por favor completa los campos correctamente')),
      );
    }
  }

  Future<void> _submitRegister() async {
    final success = await ref.read(authNotifierProvider.notifier).register(
      name: _nameController.text.trim(),
      age: int.parse(_ageController.text.trim()),
      email: _emailController.text.trim(),
      pin: _pin,
      avatarUrl: _selectedAvatar,
    );
    if (success && mounted) {
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);

    return Scaffold(
      appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          child: Column(
            children: [
              Text('Crea tu Perfil', style: AppTypography.titleLarge),
              const SizedBox(height: 8),
              Text('Elige tu avatar y configura tu PIN de acceso', style: AppTypography.bodyMedium),
              const SizedBox(height: 24),

              if (authState.errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: AppColors.accentRose.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(authState.errorMessage!, style: const TextStyle(color: AppColors.accentRose)),
                ),

              if (!_isPinStep) ...[
                AvatarSelectorWidget(
                  selectedAvatar: _selectedAvatar,
                  onAvatarSelected: (id) => setState(() => _selectedAvatar = id),
                ),
                const SizedBox(height: 24),
                TextField(
                  controller: _nameController,
                  decoration: const InputDecoration(labelText: 'Nombre o Apodo', prefixIcon: Icon(Icons.person_outline)),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _ageController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Edad', prefixIcon: Icon(Icons.cake_outlined)),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(labelText: 'Correo Electrónico', prefixIcon: Icon(Icons.email_outlined)),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(onPressed: _onContinueToPin, child: const Text('Elegir mi PIN')),
                ),
              ] else ...[
                Text('Elige un PIN de 4 dígitos fácil de recordar', style: AppTypography.bodyMedium),
                const SizedBox(height: 24),
                PinPadWidget(
                  currentPin: _pin,
                  onPinChanged: (val) => setState(() => _pin = val),
                  onComplete: _submitRegister,
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () => setState(() { _isPinStep = false; _pin = ''; }),
                  child: const Text('Volver a editar datos', style: TextStyle(color: AppColors.accentCyan)),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
