import { useState, useCallback, useEffect } from 'react';
import type { AuslaenderbehoerdeState, FlowApi } from './types';
import { initialState } from './types';
import { loadState, saveState, clearState } from './state';

export function useAuslaenderbehoerdeState(): FlowApi {
  const [state, setState] = useState<AuslaenderbehoerdeState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const update = useCallback((patch: Partial<AuslaenderbehoerdeState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateDocuments = useCallback(
    (patch: Partial<AuslaenderbehoerdeState['documentsChecked']>) => {
      setState((prev) => ({
        ...prev,
        documentsChecked: { ...prev.documentsChecked, ...patch },
      }));
    },
    [],
  );

  const reset = useCallback(() => {
    clearState();
    setState(initialState);
  }, []);

  return { state, update, updateDocuments, reset };
}
