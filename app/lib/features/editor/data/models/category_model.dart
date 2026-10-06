import '../../domain/entities/category_entity.dart';

class CategoryModel extends CategoryEntity {
  const CategoryModel({required super.key, required super.label, super.usageCount});

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    final key = json['key'] as String? ?? '';
    return CategoryModel(
      key: key,
      label: json['label'] as String? ?? key,
      usageCount: (json['usageCount'] as num?)?.toInt() ?? 0,
    );
  }
}
