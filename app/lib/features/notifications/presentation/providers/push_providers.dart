import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/push/push_messaging.dart';
import '../../../../core/push/system_notifications.dart';
import '../../data/datasources/push_device_remote_datasource.dart';
import 'push_device_registrar.dart';

final systemNotificationsProvider = Provider<SystemNotifications>((ref) => SystemNotifications());
final pushMessagingProvider = Provider<PushMessaging>((ref) => PushMessaging());
final pushDeviceDataSourceProvider = Provider((ref) => PushDeviceRemoteDataSource(ApiClient()));
final pushDeviceRegistrarProvider = Provider<PushDeviceRegistrar>(
  (ref) => PushDeviceRegistrar(ref.watch(pushMessagingProvider), ref.watch(pushDeviceDataSourceProvider)),
);
final pushPromptPolicyProvider = Provider<PushPromptPolicy>((ref) => PushPromptPolicy());

/// ¿Puede WordHive mostrar avisos en la barra del teléfono? `null` mientras
/// no lo sabemos (o en plataformas sin barra de notificaciones).
final pushEnabledProvider = StateProvider<bool?>((ref) => null);

/// Cuándo volver a ofrecer los avisos. Preguntamos con nuestra propia
/// tarjeta antes que con el diálogo del sistema: si el usuario dice
/// "Ahora no", Android no lo bloquea para siempre y podemos volver a
/// ofrecerlo con calma una semana después.
class PushPromptPolicy {
  static const _box = 'push_prefs';
  static const _lastAskedKey = 'last_asked_ms';
  static const cooldown = Duration(days: 7);

  Future<bool> shouldAsk({DateTime? now}) async {
    try {
      final box = await Hive.openBox(_box);
      final last = box.get(_lastAskedKey) as int?;
      if (last == null) return true;
      return (now ?? DateTime.now()).difference(DateTime.fromMillisecondsSinceEpoch(last)) >= cooldown;
    } catch (_) {
      return false;
    }
  }

  Future<void> markAsked({DateTime? now}) async {
    try {
      final box = await Hive.openBox(_box);
      await box.put(_lastAskedKey, (now ?? DateTime.now()).millisecondsSinceEpoch);
    } catch (_) {
      // Sin almacenamiento local simplemente volveremos a preguntar.
    }
  }
}
