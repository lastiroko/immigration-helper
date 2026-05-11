import { ScreenRouter } from './anmeldung-koeln/ScreenRouter';
import { useAnmeldungState } from './anmeldung-koeln/useAnmeldungState';

export default function AnmeldungKoeln() {
  const flow = useAnmeldungState();
  return <ScreenRouter flow={flow} />;
}
