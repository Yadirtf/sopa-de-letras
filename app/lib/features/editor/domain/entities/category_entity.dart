import 'package:equatable/equatable.dart';

/// Tema de una sopa. `key` es lo que se guarda (MAYÚSCULAS, sin tildes) y
/// `label` el nombre bonito que ve el jugador.
class CategoryEntity extends Equatable {
  final String key;
  final String label;
  final int usageCount;

  const CategoryEntity({required this.key, required this.label, this.usageCount = 0});

  @override
  List<Object?> get props => [key, label, usageCount];
}
