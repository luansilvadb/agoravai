import { pipeline, cos_sim } from '@xenova/transformers';
import type { IVectorizer } from '../../domain/interfaces/IVectorizer.js';
import type { Vector } from '../../domain/entities/Vector.js';
import type { IConfig } from '../../domain/interfaces/IConfig.js';
import { ModelLoadError } from '../../domain/errors/ModelLoadError.js';
import { VectorizationError } from '../../domain/errors/VectorizationError.js';

export class Vectorizer implements IVectorizer {
  private extractor: Awaited<ReturnType<typeof pipeline>> | null = null;

  constructor(private readonly config: IConfig) {}

  async initialize(): Promise<void> {
    if (this.extractor !== null) {
      return;
    }

    try {
      this.extractor = await pipeline('feature-extraction', this.config.modelName, {
        quantized: true,
      });
    } catch (error) {
      throw new ModelLoadError(error instanceof Error ? error : undefined, {
        modelName: this.config.modelName,
      });
    }
  }

  async vectorize(text: string): Promise<Vector> {
    if (this.extractor === null) {
      await this.initialize();
    }

    if (this.extractor === null) {
      throw new ModelLoadError(undefined, { modelName: this.config.modelName });
    }

    try {
      const output = await this.extractor(text, {
        pooling: 'mean',
        // @ts-expect-error normalize é suportado mas tipo está incorreto
        normalize: true,
      });
      // @ts-expect-error data existe na prática mas tipo não reflete
      return output.data as Vector;
    } catch (error) {
      throw new VectorizationError(
        text.substring(0, 50),
        error instanceof Error ? error : undefined
      );
    }
  }
}

export { cos_sim };
