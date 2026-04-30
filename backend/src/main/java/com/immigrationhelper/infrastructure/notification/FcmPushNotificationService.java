package com.immigrationhelper.infrastructure.notification;

import com.immigrationhelper.domain.entity.NotificationOutbox;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Firebase Cloud Messaging (Android + iOS via fan-out) push delivery.
 *
 * Phase 5 stub: the integration boots when notifications.push.driver=fcm,
 * but the actual FCM API call is intentionally a no-op until the FCM
 * service-account JSON key is provisioned. The wiring exists so a future
 * commit can drop in the firebase-admin SDK without touching the worker
 * or the outbox schema.
 */
@Component("fcmPushNotificationService")
@ConditionalOnProperty(name = "notifications.push.driver", havingValue = "fcm")
@Slf4j
public class FcmPushNotificationService implements PushNotificationService {

    @Override
    public boolean deliver(NotificationOutbox outbox) {
        log.info("[fcm-stub] would deliver kind={} userId={}", outbox.getKind(), outbox.getUserId());
        return true;
    }
}
