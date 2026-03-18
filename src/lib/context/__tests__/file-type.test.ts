import { describe, it, expect } from 'vitest';
import { getAppModeFromFileType } from '../index';

describe('getAppModeFromFileType', () => {
  it('maps docx to word', () => {
    expect(getAppModeFromFileType('docx')).toBe('word');
  });

  it('maps xlsx to excel', () => {
    expect(getAppModeFromFileType('xlsx')).toBe('excel');
  });

  it('maps xls to excel', () => {
    expect(getAppModeFromFileType('xls')).toBe('excel');
  });

  it('maps csv to excel', () => {
    expect(getAppModeFromFileType('csv')).toBe('excel');
  });

  it('maps pptx to powerpoint', () => {
    expect(getAppModeFromFileType('pptx')).toBe('powerpoint');
  });

  it('maps accdb to access', () => {
    expect(getAppModeFromFileType('accdb')).toBe('access');
  });

  it('maps mdb to access', () => {
    expect(getAppModeFromFileType('mdb')).toBe('access');
  });

  it('defaults to word for unknown types', () => {
    expect(getAppModeFromFileType('txt')).toBe('word');
  });
});
