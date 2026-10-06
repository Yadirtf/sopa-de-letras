import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../auth/presentation/providers/auth_notifier.dart';
import '../providers/friends_notifier.dart';
import '../widgets/friend_requests_tab.dart';
import '../widgets/friends_list_tab.dart';
import '../widgets/guest_social_gate_widget.dart';
import '../widgets/player_search_tab.dart';

/// Pestaña social (EP-05): Mis amigos · Solicitudes · Buscar.
class FriendsPage extends ConsumerStatefulWidget {
  final int initialTab;

  const FriendsPage({super.key, this.initialTab = 0});

  @override
  ConsumerState<FriendsPage> createState() => _FriendsPageState();
}

class _FriendsPageState extends ConsumerState<FriendsPage> with SingleTickerProviderStateMixin {
  late final TabController _tabs = TabController(length: 3, vsync: this, initialIndex: widget.initialTab.clamp(0, 2));

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      if (ref.read(authNotifierProvider).user?.isGuest == false) {
        ref.read(friendsNotifierProvider.notifier).load();
      }
    });
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isGuest = ref.watch(authNotifierProvider).user?.isGuest ?? true;
    final state = ref.watch(friendsNotifierProvider);

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.bgPrimary,
        elevation: 0,
        title: Text('Amigos', style: AppTypography.heading2.copyWith(fontSize: 20)),
        bottom: isGuest
            ? null
            : TabBar(
                controller: _tabs,
                indicatorColor: AppColors.accentViolet,
                indicatorWeight: 3,
                labelColor: AppColors.textPrimary,
                unselectedLabelColor: AppColors.textSecondary,
                labelStyle: AppTypography.labelBold,
                tabs: [
                  Tab(text: 'Mis amigos (${state.friends.length})'),
                  Tab(
                    child: Badge(
                      isLabelVisible: state.incoming.isNotEmpty,
                      label: Text('${state.incoming.length}'),
                      backgroundColor: AppColors.accentRose,
                      offset: const Offset(14, -6),
                      child: const Text('Solicitudes'),
                    ),
                  ),
                  const Tab(text: 'Buscar'),
                ],
              ),
      ),
      body: isGuest
          ? const GuestSocialGate()
          : TabBarView(
              controller: _tabs,
              children: [
                FriendsListTab(onFindFriends: () => _tabs.animateTo(2)),
                const FriendRequestsTab(),
                const PlayerSearchTab(),
              ],
            ),
    );
  }
}
