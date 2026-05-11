import { useMemo } from 'react';
import type { FlowApi } from './types';
import { deriveScreen } from './state';
import { Screen0Landing } from './screens/Screen0Landing';
import { Screen1EID } from './screens/Screen1EID';
import { Screen1_5Origin } from './screens/Screen1_5Origin';
import { Screen2Residence } from './screens/Screen2Residence';
import { Screen3MoveInDate } from './screens/Screen3MoveInDate';
import { Screen4Documents } from './screens/Screen4Documents';
import { Screen5PickPath } from './screens/Screen5PickPath';
import { Screen6AWalkIn } from './screens/Screen6AWalkIn';
import { Screen6BBooked } from './screens/Screen6BBooked';
import { Screen7Companion } from './screens/Screen7Companion';
import { Screen7bRejection } from './screens/Screen7bRejection';
import { Screen8WhatsNext } from './screens/Screen8WhatsNext';

export function ScreenRouter({ flow }: { flow: FlowApi }) {
  const screen = useMemo(() => deriveScreen(flow.state), [flow.state]);
  switch (screen) {
    case 'landing':    return <Screen0Landing    flow={flow} />;
    case 'eid':        return <Screen1EID        flow={flow} />;
    case 'origin':     return <Screen1_5Origin   flow={flow} />;
    case 'residence':  return <Screen2Residence  flow={flow} />;
    case 'moveInDate': return <Screen3MoveInDate flow={flow} />;
    case 'documents':  return <Screen4Documents  flow={flow} />;
    case 'pickPath':   return <Screen5PickPath   flow={flow} />;
    case 'walkIn':     return <Screen6AWalkIn    flow={flow} />;
    case 'booked':     return <Screen6BBooked    flow={flow} />;
    case 'companion':  return <Screen7Companion  flow={flow} />;
    case 'rejection':  return <Screen7bRejection flow={flow} />;
    case 'whatsNext':  return <Screen8WhatsNext  flow={flow} />;
    default:           return <Screen0Landing    flow={flow} />;
  }
}
