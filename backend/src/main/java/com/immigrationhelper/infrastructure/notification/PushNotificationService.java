package com.immigrationhelper.infrastructure.notification;

import com.immigrationhelper.domain.entity.NotificationOutbox;

/**
 * Strategy interface for delivering a notification to a user's device.
 *
 * MVP ships {@link LoggingPushNotificationService}; FCM/APNS implementations
 * register conditionally based on configuration in Phase 5+.
 */
public interface PushNotificationService {

    /**
     * Deliver a single outbox row.
     *
     * @return true if the notification was accepted by the upstream provider
     *         (logging stub is always true); false on transient failure that
     *         should leave the row PENDING for retry.
     * @throws RuntimeException for terminal failures (the worker marks FAILED).
     */
    boolean deliver(NotificationOutbox outbox);
}
