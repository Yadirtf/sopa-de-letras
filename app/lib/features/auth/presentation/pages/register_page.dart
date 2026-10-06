import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/avatars/app_avatars.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/auth_notifier.dart';
import '../providers/auth_state.dart';
import '../widgets/register_avatar_step.dart';
import '../widgets/register_data_step.dart';
import '../widgets/register_pin_step.dart';
import '../widgets/register_step_header.dart';

/// Registro en tres pasos (datos → avatar → PIN). Atrás, en la barra o con
/// el botón del teléfono, vuelve al paso anterior sin perder lo escrito.
class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});

  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _ageController = TextEditingController();
  String _avatarId = AppAvatars.defaultId;
  String _pin = '';
  int _step = 0;
  bool _submitted = false; // los errores de otra pantalla no se cuelan aquí

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _ageController.dispose();
    super.dispose();
  }

  void _goTo(int step) => setState(() {
        _step = step;
        _pin = '';
        _submitted = false;
      });

  void _back() => _step == 0 ? context.pop() : _goTo(_step - 1);

  Future<void> _submitRegister() async {
    setState(() => _submitted = true);
    final success = await ref.read(authNotifierProvider.notifier).register(
          name: _nameController.text.trim(),
          age: int.parse(_ageController.text.trim()),
          email: _emailController.text.trim(),
          pin: _pin,
          avatarUrl: _avatarId,
        );
    if (!mounted) return;
    if (success) {
      context.go('/home');
    } else {
      setState(() => _pin = '');
    }
  }

  Widget _buildStep(AuthState authState, bool loading) => switch (_step) {
        0 => RegisterDataStep(
            name: _nameController,
            age: _ageController,
            email: _emailController,
            onContinue: () => _goTo(1),
          ),
        1 => RegisterAvatarStep(
            name: _nameController.text.trim(),
            avatarId: _avatarId,
            onSelected: (id) => setState(() => _avatarId = id),
            onContinue: () => _goTo(2),
          ),
        _ => RegisterPinStep(
            pin: _pin,
            loading: loading,
            error: _submitted ? authState.errorMessage : null,
            onPinChanged: (val) => setState(() => _pin = val),
            onComplete: _submitRegister,
            onEditData: () => _goTo(0),
          ),
      };

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);
    final loading = authState.status == AuthStatus.loading;

    return PopScope(
      canPop: _step == 0,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop && !loading) _goTo(_step - 1);
      },
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: BackButton(onPressed: loading ? null : _back),
          title: Text('Crea tu perfil', style: AppTypography.titleMedium.copyWith(fontSize: 18)),
        ),
        body: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 560),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    RegisterStepHeader(step: _step),
                    Expanded(
                      child: AnimatedSwitcher(
                        duration: const Duration(milliseconds: 250),
                        child: KeyedSubtree(key: ValueKey(_step), child: _buildStep(authState, loading)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
