import { useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { readStoredLanguage, writeStoredLanguage } from '../utils/learningProgressStore';

// The language the student chose in the flow ('en' | 'fil') lives in
// SessionContext. SessionContext is not persisted across reloads, so the
// last chosen language is mirrored to localStorage and used as a fallback
// (default 'en'). One language is returned; strings are never mixed.
export function useLearningLanguage() {
  const { state } = useSession();
  const fromSession = state.language === 'en' || state.language === 'fil' ? state.language : null;

  useEffect(() => {
    if (fromSession) writeStoredLanguage(fromSession);
  }, [fromSession]);

  return fromSession || readStoredLanguage() || 'en';
}
