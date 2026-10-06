import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

class CatalogSkeletonWidget extends StatefulWidget {
  const CatalogSkeletonWidget({super.key});

  @override
  State<CatalogSkeletonWidget> createState() => _CatalogSkeletonWidgetState();
}

class _CatalogSkeletonWidgetState extends State<CatalogSkeletonWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 0.3, end: 0.7).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return ListView.separated(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          itemCount: 4,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) => _buildSkeletonCard(_animation.value),
        );
      },
    );
  }

  Widget _buildSkeletonCard(double opacity) {
    return Container(
      height: 110,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.bgCard.withValues(alpha: opacity),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.borderGlow.withValues(alpha: opacity * 0.5),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 140,
                height: 16,
                decoration: BoxDecoration(
                  color: AppColors.textMuted.withValues(alpha: opacity),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const Spacer(),
              Container(
                width: 60,
                height: 20,
                decoration: BoxDecoration(
                  color: AppColors.accentViolet.withValues(alpha: opacity * 0.4),
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ],
          ),
          Container(
            width: 220,
            height: 12,
            decoration: BoxDecoration(
              color: AppColors.textMuted.withValues(alpha: opacity * 0.7),
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          Row(
            children: [
              Container(
                width: 70,
                height: 12,
                decoration: BoxDecoration(
                  color: AppColors.accentCyan.withValues(alpha: opacity * 0.5),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(width: 12),
              Container(
                width: 90,
                height: 12,
                decoration: BoxDecoration(
                  color: AppColors.accentAmber.withValues(alpha: opacity * 0.5),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
