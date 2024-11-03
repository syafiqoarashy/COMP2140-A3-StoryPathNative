import { Tracking } from '@/constants/types';
import React, { createContext, useContext, useState, useCallback } from 'react';

interface ProjectContextType {
  currentTracking: Tracking[];
  updateTracking: (newTracking: Tracking[]) => void;
  visitedLocations: Set<number>;
  updateVisitedLocations: (newLocations: Set<number>) => void;
  points: number;
  updatePoints: (newPoints: number) => void;
  refreshProjectData: () => Promise<void>;
  setRefreshFunction: (fn: () => Promise<void>) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [currentTracking, setCurrentTracking] = useState<Tracking[]>([]);
  const [visitedLocations, setVisitedLocations] = useState<Set<number>>(new Set());
  const [points, setPoints] = useState(0);
  const [refreshFn, setRefreshFn] = useState<() => Promise<void>>(() => Promise.resolve());

  const updateTracking = useCallback((newTracking: Tracking[]) => {
    setCurrentTracking(newTracking);
  }, []);

  const updateVisitedLocations = useCallback((newLocations: Set<number>) => {
    setVisitedLocations(newLocations);
  }, []);

  const updatePoints = useCallback((newPoints: number) => {
    setPoints(newPoints);
  }, []);

  const setRefreshFunction = useCallback((fn: () => Promise<void>) => {
    setRefreshFn(() => fn);
  }, []);

  const refreshProjectData = useCallback(async () => {
    await refreshFn();
  }, [refreshFn]);

  return (
    <ProjectContext.Provider 
      value={{
        currentTracking,
        updateTracking,
        visitedLocations,
        updateVisitedLocations,
        points,
        updatePoints,
        refreshProjectData,
        setRefreshFunction,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
