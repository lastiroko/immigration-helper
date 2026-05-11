import { useMemo } from 'react';
import type { FlowApi } from './types';
import { deriveScreen } from './state';
import { Screen0Landing } from './screens/Screen0Landing';
import { Screen1EU } from './screens/Screen1EU';
import { Screen2Purpose } from './screens/Screen2Purpose';
import { Screen3Anmeldung } from './screens/Screen3Anmeldung';
import { Screen4VisaCountdown } from './screens/Screen4VisaCountdown';
import { Screen5Documents } from './screens/Screen5Documents';
import { Screen6Booking } from './screens/Screen6Booking';
import { Screen7Companion } from './screens/Screen7Companion';
import { Screen8WhatsNext } from './screens/Screen8WhatsNext';

export function ScreenRouter({ flow }: { flow: FlowApi }) {
  const screen = useMemo(() => deriveScreen(flow.state), [flow.state]);
  switch (screen) {
    case 'landing':       return <Screen0Landing       flow={flow} />;
    case 'eu':            return <Screen1EU            flow={flow} />;
    case 'purpose':       return <Screen2Purpose       flow={flow} />;
    case 'anmeldung':     return <Screen3Anmeldung     flow={flow} />;
    case 'visaCountdown': return <Screen4VisaCountdown flow={flow} />;
    case 'documents':     return <Screen5Documents     flow={flow} />;
    case 'booking':       return <Screen6Booking       flow={flow} />;
    case 'companion':     return <Screen7Companion     flow={flow} />;
    case 'whatsNext':     return <Screen8WhatsNext     flow={flow} />;
    default:              return <Screen0Landing       flow={flow} />;
  }
}
