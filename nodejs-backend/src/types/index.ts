export interface Directory {
    name: string;
    path: string;
    is_git_repo: boolean;
}

export interface ListDirectoriesResponse {
    current_path: string;
    parent_path: string | null;
    directories: Directory[];
}

export interface CheckRepoResponse {
    project_name: string;
    branches: string[];
}

export interface FileChange {
    file: string;
    old_content: string;
    new_content: string;
    summary: string;
    suggestions: string[];
}

export interface CompareBranchesResponse {
    files: FileChange[];
}

export interface SummarizePRResponse {
    summary: string;
    suggestions: string[];
    diff: string;
}

