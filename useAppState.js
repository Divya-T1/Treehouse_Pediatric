import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

export default function useAppState() {
  const [state, setState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextState => {
      setState(nextState);
    });

    return () => subscription.remove();
  }, []);

  return state;
}
