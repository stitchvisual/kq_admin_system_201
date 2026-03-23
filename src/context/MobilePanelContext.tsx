'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface MobilePanelContextValue {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const MobilePanelContext = createContext<MobilePanelContextValue | null>(null);

export function MobilePanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const setOpenStable = useCallback((open: boolean) => setOpen(open), []);
  return (
    <MobilePanelContext.Provider value={{ isOpen, setOpen: setOpenStable }}>
      {children}
    </MobilePanelContext.Provider>
  );
}

export function useMobilePanel() {
  const ctx = useContext(MobilePanelContext);
  return ctx ?? { isOpen: false, setOpen: () => {} };
}
