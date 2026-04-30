package com.immigrationhelper.service;

import com.immigrationhelper.application.service.BillingService;
import com.immigrationhelper.domain.entity.StripeWebhookEvent;
import com.immigrationhelper.infrastructure.persistence.StripeWebhookEventRepository;
import com.immigrationhelper.infrastructure.persistence.SubscriptionRepository;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @Mock UserRepository userRepository;
    @Mock SubscriptionRepository subscriptionRepository;
    @Mock StripeWebhookEventRepository webhookEventRepository;

    @InjectMocks BillingService service;

    @Test
    void processEvent_replayOfSameEventId_isNoOp() {
        Event event = new Event();
        event.setId("evt_1");
        event.setType("checkout.session.completed");

        when(webhookEventRepository.existsById("evt_1")).thenReturn(true);

        boolean processed = service.processEvent(event);
        assertThat(processed).isFalse();
        verify(webhookEventRepository, never()).save(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void processEvent_unknownEventType_recordsButDoesNothingElse() {
        Event event = new Event();
        event.setId("evt_2");
        event.setType("some.unhandled.event");
        // The deserializer is null on a hand-crafted Event; setData would normally populate it.
        event.setData(new Event.Data());

        when(webhookEventRepository.existsById("evt_2")).thenReturn(false);

        boolean processed = service.processEvent(event);
        assertThat(processed).isTrue();
        verify(webhookEventRepository).save(any(StripeWebhookEvent.class));
        verify(userRepository, never()).save(any());
    }

    @Test
    void processEvent_persistedEventIdHasMatchingType() {
        Event event = new Event();
        event.setId("evt_3");
        event.setType("customer.subscription.updated");
        event.setData(new Event.Data());

        when(webhookEventRepository.existsById("evt_3")).thenReturn(false);

        service.processEvent(event);
        org.mockito.ArgumentCaptor<StripeWebhookEvent> captor =
            org.mockito.ArgumentCaptor.forClass(StripeWebhookEvent.class);
        verify(webhookEventRepository).save(captor.capture());
        assertThat(captor.getValue().getEventId()).isEqualTo("evt_3");
        assertThat(captor.getValue().getType()).isEqualTo("customer.subscription.updated");
    }
}
