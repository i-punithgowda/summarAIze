import { create } from 'zustand';

interface RepoState {
    repoPath: string;
    setRepoPath: (path: string) => void;
    clearRepoPath: () => void;
}

export const useRepoStore = create<RepoState>((set) => ({
    repoPath: '',
    setRepoPath: (path) => set({ repoPath: path }),
    clearRepoPath: () => set({ repoPath: '' }),
})); 