import { ScreenRouter } from './auslaenderbehoerde-koeln/ScreenRouter';
import { useAuslaenderbehoerdeState } from './auslaenderbehoerde-koeln/useAuslaenderbehoerdeState';

export default function AuslaenderbehoerdeKoeln() {
  const flow = useAuslaenderbehoerdeState();
  return <ScreenRouter flow={flow} />;
}
