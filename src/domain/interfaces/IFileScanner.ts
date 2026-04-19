export interface IFileScanner {
  scan(directory: string): Promise<string[]>;
}
