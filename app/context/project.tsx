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

/**
 * ProjectProvider component provides project-related data and actions
 * through React Context to its children.
 * @param children - The child components that can access the ProjectContext.
 */
export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [currentTracking, setCurrentTracking] = useState<Tracking[]>([]);
  const [visitedLocations, setVisitedLocations] = useState<Set<number>>(new Set());
  const [points, setPoints] = useState(0);
  const [refreshFn, setRefreshFn] = useState<() => Promise<void>>(() => Promise.resolve());

  /**
   * Update the current tracking data.
   * @param newTracking - An array of new Tracking data to set.
   */
  const updateTracking = useCallback((newTracking: Tracking[]) => {
    setCurrentTracking(newTracking);
  }, []);

  /**
   * Update the set of visited location IDs.
   * @param newLocations - A Set of new location IDs.
   */
  const updateVisitedLocations = useCallback((newLocations: Set<number>) => {
    setVisitedLocations(newLocations);
  }, []);

  /**
   * Update the points total.
   * @param newPoints - The new points total to set.
   */
  const updatePoints = useCallback((newPoints: number) => {
    setPoints(newPoints);
  }, []);

  /**
   * Set the refresh function for refreshing project data.
   * @param fn - The function that will be used to refresh project data.
   */
  const setRefreshFunction = useCallback((fn: () => Promise<void>) => {
    setRefreshFn(() => fn);
  }, []);

  /**
   * Call the refresh function to reload project data.
   */
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

/**
 * Custom hook to access the ProjectContext.
 * Throws an error if used outside of a ProjectProvider.
 * @returns The project context object containing state and update functions.
 */
export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
