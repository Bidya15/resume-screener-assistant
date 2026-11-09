import { useCallback, useEffect, useState } from 'react';

// Custom hook: runs an async function on mount (and whenever `deps` change)
// and exposes { data, loading, error, reload }.
export default function useFetch(asyncFn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const run = useCallback(() => {
    let cancelled = false; // guards against setting state after unmount / stale response
    setState((s) => ({ ...s, loading: true, error: null }));
    asyncFn()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((error) => !cancelled && setState({ data: null, loading: false, error }));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => run(), [run]);

  return { ...state, reload: run };
}
