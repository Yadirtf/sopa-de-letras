import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/auth/presentation/pages/forgot_pin_page.dart';
import '../../features/auth/presentation/pages/profile_page.dart';
import '../../features/catalog/presentation/pages/catalog_page.dart';
import '../../features/editor/presentation/pages/create_word_search_page.dart';
import '../../features/editor/presentation/pages/my_creations_page.dart';

import '../../features/game/presentation/pages/create_room_page.dart';
import '../../features/game/presentation/pages/join_room_page.dart';
import '../../features/game/presentation/pages/room_lobby_page.dart';
import '../../features/game/presentation/pages/game_play_page.dart';
import '../../features/game/presentation/pages/game_podium_page.dart';
import '../../features/social/presentation/pages/friends_page.dart';
import '../../features/notifications/presentation/pages/notifications_page.dart';

final appRouter = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginPage(),
    ),
    GoRoute(
      path: '/register',
      builder: (context, state) => const RegisterPage(),
    ),
    GoRoute(
      path: '/forgot-pin',
      builder: (context, state) => const ForgotPinPage(),
    ),
    GoRoute(
      path: '/home',
      builder: (context, state) => const CatalogPage(),
    ),
    GoRoute(
      path: '/catalog',
      builder: (context, state) => const CatalogPage(),
    ),
    GoRoute(
      path: '/create-word-search',
      builder: (context, state) => const CreateWordSearchPage(),
    ),
    GoRoute(
      path: '/my-creations',
      builder: (context, state) => const MyCreationsPage(),
    ),
    GoRoute(
      path: '/profile',
      builder: (context, state) => const ProfilePage(),
    ),
    GoRoute(
      path: '/create-room',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>? ?? {};
        return CreateRoomPage(
          wordSearchId: extra['wordSearchId'] ?? '',
          wordSearchTitle: extra['wordSearchTitle'] ?? 'Sopa de Letras',
        );
      },
    ),
    GoRoute(
      path: '/join-room',
      builder: (context, state) => const JoinRoomPage(),
    ),
    GoRoute(
      path: '/lobby/:code',
      builder: (context, state) => RoomLobbyPage(
        roomCode: state.pathParameters['code'] ?? '',
      ),
    ),
    GoRoute(
      path: '/game/:code',
      builder: (context, state) => GamePlayPage(
        roomCode: state.pathParameters['code'] ?? '',
      ),
    ),
    GoRoute(
      path: '/friends',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>? ?? {};
        return FriendsPage(initialTab: extra['tab'] as int? ?? 0);
      },
    ),
    GoRoute(
      path: '/notifications',
      builder: (context, state) => const NotificationsPage(),
    ),
    GoRoute(
      path: '/game-podium/:code',
      builder: (context, state) => GamePodiumPage(
        roomCode: state.pathParameters['code'] ?? '',
      ),
    ),
  ],
);


