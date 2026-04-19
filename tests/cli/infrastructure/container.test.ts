import { describe, it, expect, beforeEach } from 'vitest';
import { Container, TOKENS } from '../../../src/cli/infrastructure/container.js';

describe('DI Container', () => {
  beforeEach(() => {
    Container.reset();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = Container.getInstance();
      const instance2 = Container.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('register and resolve', () => {
    it('should register and resolve a dependency', () => {
      const container = Container.getInstance();
      const mockRepo = { name: 'MockRepository' };

      container.register(TOKENS.CHANGE_REPOSITORY, mockRepo);
      const resolved = container.resolve(TOKENS.CHANGE_REPOSITORY);

      expect(resolved).toBe(mockRepo);
    });

    it('should throw error when resolving unregistered token', () => {
      const container = Container.getInstance();

      expect(() => container.resolve('UnregisteredToken')).toThrow(
        'No implementation for UnregisteredToken'
      );
    });
  });

  describe('override', () => {
    it('should override registered dependency', () => {
      const container = Container.getInstance();
      const originalRepo = { name: 'OriginalRepository' };
      const overrideRepo = { name: 'OverrideRepository' };

      container.register(TOKENS.CHANGE_REPOSITORY, originalRepo);
      container.override(TOKENS.CHANGE_REPOSITORY, overrideRepo);

      const resolved = container.resolve(TOKENS.CHANGE_REPOSITORY);
      expect(resolved).toBe(overrideRepo);
    });

    it('should return original after clearing override', () => {
      const container = Container.getInstance();
      const originalRepo = { name: 'OriginalRepository' };
      const overrideRepo = { name: 'OverrideRepository' };

      container.register(TOKENS.CHANGE_REPOSITORY, originalRepo);
      container.override(TOKENS.CHANGE_REPOSITORY, overrideRepo);
      container.clearOverride(TOKENS.CHANGE_REPOSITORY);

      const resolved = container.resolve(TOKENS.CHANGE_REPOSITORY);
      expect(resolved).toBe(originalRepo);
    });
  });

  describe('clearAllOverrides', () => {
    it('should clear all overrides', () => {
      const container = Container.getInstance();
      const originalRepo = { name: 'OriginalRepository' };
      const originalConfig = { name: 'OriginalConfig' };

      container.register(TOKENS.CHANGE_REPOSITORY, originalRepo);
      container.register(TOKENS.GLOBAL_CONFIG_REPOSITORY, originalConfig);

      container.override(TOKENS.CHANGE_REPOSITORY, { name: 'OverrideRepo' });
      container.override(TOKENS.GLOBAL_CONFIG_REPOSITORY, { name: 'OverrideConfig' });

      container.clearAllOverrides();

      expect(container.resolve(TOKENS.CHANGE_REPOSITORY)).toBe(originalRepo);
      expect(container.resolve(TOKENS.GLOBAL_CONFIG_REPOSITORY)).toBe(originalConfig);
    });
  });

  describe('reset', () => {
    it('should reset all registrations and overrides', () => {
      const container = Container.getInstance();
      const mockRepo = { name: 'MockRepository' };

      container.register(TOKENS.CHANGE_REPOSITORY, mockRepo);
      Container.reset();

      const newContainer = Container.getInstance();
      expect(() => newContainer.resolve(TOKENS.CHANGE_REPOSITORY)).toThrow();
    });
  });
});
