export interface IConfig {
  skillsDir: string;
  outputFile: string;
  similarityThreshold: number;
  topKResults: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  modelName: string;
}
