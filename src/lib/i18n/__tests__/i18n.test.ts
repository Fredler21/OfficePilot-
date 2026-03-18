import { describe, it, expect } from 'vitest';
import { t, detectLanguage, getSystemLanguageDirective, LANGUAGE_NAMES } from '@/lib/i18n';
import type { SupportedLanguage } from '@/lib/i18n';

describe('i18n', () => {
  describe('t()', () => {
    it('returns English translation by default', () => {
      expect(t('app.name')).toBe('OfficePilot');
      expect(t('mode.word')).toBe('Word');
    });

    it('returns French translation', () => {
      expect(t('chat.send', 'fr')).toBe('Envoyer');
      expect(t('action.apply', 'fr')).toBe('Appliquer');
    });

    it('returns Haitian Creole translation', () => {
      expect(t('chat.send', 'ht')).toBe('Voye');
      expect(t('action.apply', 'ht')).toBe('Aplike');
    });

    it('falls back to key when not found', () => {
      expect(t('nonexistent.key')).toBe('nonexistent.key');
    });
  });

  describe('detectLanguage()', () => {
    it('detects English as default', () => {
      expect(detectLanguage('How do I create a formula?')).toBe('en');
    });

    it('detects French', () => {
      expect(detectLanguage('Bonjour, comment pouvez-vous aider?')).toBe('fr');
    });

    it('detects Haitian Creole', () => {
      expect(detectLanguage('Tanpri ede mwen kapab fè sa')).toBe('ht');
    });
  });

  describe('getSystemLanguageDirective()', () => {
    it('returns English directive', () => {
      expect(getSystemLanguageDirective('en')).toContain('English');
    });

    it('returns French directive', () => {
      expect(getSystemLanguageDirective('fr')).toContain('French');
    });

    it('returns Haitian Creole directive', () => {
      expect(getSystemLanguageDirective('ht')).toContain('Kreyòl');
    });
  });

  describe('LANGUAGE_NAMES', () => {
    it('has all supported languages', () => {
      expect(LANGUAGE_NAMES.en).toBe('English');
      expect(LANGUAGE_NAMES.fr).toBe('Français');
      expect(LANGUAGE_NAMES.ht).toBe('Kreyòl Ayisyen');
    });
  });
});
