import 'package:flutter/material.dart';

/// Paso 1 del registro: nombre, edad y correo. Cada campo dice qué le
/// falta, en vez de un aviso genérico que no explica nada.
class RegisterDataStep extends StatefulWidget {
  final TextEditingController name;
  final TextEditingController age;
  final TextEditingController email;
  final VoidCallback onContinue;

  const RegisterDataStep({
    super.key,
    required this.name,
    required this.age,
    required this.email,
    required this.onContinue,
  });

  @override
  State<RegisterDataStep> createState() => _RegisterDataStepState();
}

class _RegisterDataStepState extends State<RegisterDataStep> {
  final _form = GlobalKey<FormState>();
  var _autovalidate = AutovalidateMode.disabled;

  static String? _validateName(String? v) => (v ?? '').trim().length < 3 ? 'Escribe al menos 3 letras' : null;

  static String? _validateAge(String? v) {
    final age = int.tryParse((v ?? '').trim());
    if (age == null) return 'Escribe tu edad en números';
    return age < 5 || age > 120 ? 'La edad debe estar entre 5 y 120 años' : null;
  }

  static String? _validateEmail(String? v) =>
      RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch((v ?? '').trim()) ? null : 'Revisa tu correo (ej: ana@correo.com)';

  void _submit() {
    if (_form.currentState!.validate()) {
      FocusScope.of(context).unfocus();
      widget.onContinue();
    } else {
      setState(() => _autovalidate = AutovalidateMode.onUserInteraction);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _form,
      autovalidateMode: _autovalidate,
      child: ListView(
        padding: const EdgeInsets.only(top: 8, bottom: 24),
        children: [
          TextFormField(
            controller: widget.name,
            validator: _validateName,
            maxLength: 25,
            textCapitalization: TextCapitalization.words,
            textInputAction: TextInputAction.next,
            decoration: const InputDecoration(
              labelText: 'Nombre o apodo',
              prefixIcon: Icon(Icons.person_outline),
              counterText: '',
            ),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: widget.age,
            validator: _validateAge,
            keyboardType: TextInputType.number,
            textInputAction: TextInputAction.next,
            decoration: const InputDecoration(labelText: 'Edad', prefixIcon: Icon(Icons.cake_outlined)),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: widget.email,
            validator: _validateEmail,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.done,
            onFieldSubmitted: (_) => _submit(),
            decoration: const InputDecoration(
              labelText: 'Correo electrónico',
              helperText: 'Te servirá si algún día olvidas tu PIN',
              prefixIcon: Icon(Icons.email_outlined),
            ),
          ),
          const SizedBox(height: 28),
          SizedBox(
            height: 52,
            child: ElevatedButton.icon(
              onPressed: _submit,
              icon: const Icon(Icons.arrow_forward_rounded),
              label: const Text('Siguiente: elegir avatar'),
            ),
          ),
        ],
      ),
    );
  }
}
