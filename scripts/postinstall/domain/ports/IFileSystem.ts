export interface FileStats {
  isFile(): boolean;
  isDirectory(): boolean;
  size: number;
  mtime: Date;
}

export interface MkdirOptions {
  recursive?: boolean;
}

export interface IFileSystem {
  exists(path: string): boolean;
  mkdir(path: string, options?: MkdirOptions): void;
  readdir(path: string): string[];
  stat(path: string): FileStats;
  copyFile(src: string, dest: string): void;
}
