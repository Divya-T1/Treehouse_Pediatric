import { createContext, useContext, useState } from 'react';

const ShareContext = createContext(null);

export function ShareProvider({ children }) {
  const [isShareMode, setIsShareMode] = useState(false);
  const [shareSelections, setShareSelections] = useState([]);

  function enterShareMode() {
    setIsShareMode(true);
    setShareSelections([]);
  }

  function exitShareMode() {
    setIsShareMode(false);
    setShareSelections([]);
  }

  function toggleShareSelection(activity) {
    setShareSelections(prev => {
      const exists = prev.some(a => a.id === activity.id);
      return exists ? prev.filter(a => a.id !== activity.id) : [...prev, activity];
    });
  }

  function isSelectedForShare(activityId) {
    return shareSelections.some(a => a.id === activityId);
  }

  return (
    <ShareContext.Provider value={{
      isShareMode,
      shareSelections,
      enterShareMode,
      exitShareMode,
      toggleShareSelection,
      isSelectedForShare,
    }}>
      {children}
    </ShareContext.Provider>
  );
}

export function useShare() {
  const ctx = useContext(ShareContext);
  if (!ctx) throw new Error('useShare must be used within ShareProvider');
  return ctx;
}
