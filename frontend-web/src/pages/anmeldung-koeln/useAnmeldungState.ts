import { useState, useCallback, useEffect } from 'react';
import type { AnmeldungState, FlowApi } from './types';
import { loadState, saveState, clearState } from './state';
import { initialState } from './types';

export function useAnmeldungState(): FlowApi {
  const [state, setState] = useState<AnmeldungState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const update = useCallback((patch: Partial<AnmeldungState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateDocuments = useCallback(
    (patch: Partial<AnmeldungState['documentsChecked']>) => {
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
