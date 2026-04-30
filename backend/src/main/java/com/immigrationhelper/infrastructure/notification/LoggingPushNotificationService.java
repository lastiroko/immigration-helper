package com.immigrationhelper.infrastructure.notification;

import com.immigrationhelper.domain.entity.NotificationOutbox;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * MVP delivery: logs the notification. Active by default; replaced by FCM/APNS
 * implementations once notifications.push.driver is set to "fcm" or "apns".
 */
@Component
@ConditionalOnProperty(name = "notifications.push.driver", havingValue = "logging", matchIfMissing = true)
@ConditionalOnMissingBean(name = "fcmPushNotificationService")
@Slf4j
public class LoggingPushNotificationService implements PushNotificationService {

    @Override
    public boolean deliver(NotificationOutbox outbox) {
        log.info("[push] kind={} userId={} taskId={} payload={}",
            outbox.getKind(), outbox.getUserId(), outbox.getTaskId(), outbox.getPayload());
        return true;
    }
}
