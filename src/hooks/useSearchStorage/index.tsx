import { useState } from 'react';

const useSearchStorage = (
  namespace: string
): {
  jobs: Map<string, { time: number }>;
  saveStorage: () => void;
  addToStorage: (jobID: string) => void;
  removeFromStorage: (jobID: string) => void;
} => {
  const [jobs, setJobs] = useState(
    new Map<string, { time: number }>(
      JSON.parse(localStorage.getItem(namespace) || '[]')
    )
  );
  const saveStorage = (): void => {
    localStorage.setItem(namespace, JSON.stringify(Array.from(jobs.entries())));
    setJobs(new Map(jobs));
  };

  const addToStorage = (jobID: string): void => {
    if (!jobs.has(jobID)) {
      jobs.set(jobID, { time: Date.now() });
      saveStorage();
    }
  };
  const removeFromStorage = (jobID: string): void => {
    if (jobs.has(jobID)) {
      jobs.delete(jobID);
      saveStorage();
    }
  };

  const pruneOldJobs = (): void => {
    const now = Date.now();
    const okTime = 1000 * 60 * 60 * 24 * 30; // 30 days
    let hasDeleted = false;
    Array.from(jobs.entries()).forEach(([jobID, { time }]) => {
      if (time < now - okTime) {
        jobs.delete(jobID);
        hasDeleted = true;
      }
    });
    if (hasDeleted) {
      saveStorage();
    }
  };
  pruneOldJobs();
  return {
    jobs,
    saveStorage,
    addToStorage,
    removeFromStorage,
  };
};

export default useSearchStorage;
