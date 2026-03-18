import { describe, it, expect } from 'vitest';
import { parseAccessSchema, accessContextToSummary } from '../parsers/access-parser';
import type { AccessSchemaInput } from '../parsers/access-parser';
import type { DocumentSection } from '../types';

describe('Access Parser', () => {
  const sampleInput: AccessSchemaInput = {
    tables: [
      {
        name: 'Customers',
        fields: [
          { name: 'CustomerID', type: 'AutoNumber', isPrimary: true },
          { name: 'Name', type: 'Short Text' },
          { name: 'Email', type: 'Short Text' },
        ],
      },
      {
        name: 'Orders',
        fields: [
          { name: 'OrderID', type: 'AutoNumber', isPrimary: true },
          { name: 'CustomerID', type: 'Number' },
          { name: 'Total', type: 'Currency' },
        ],
      },
    ],
    relationships: [
      {
        from: { table: 'Orders', field: 'CustomerID' },
        to: { table: 'Customers', field: 'CustomerID' },
        type: 'one-to-many',
      },
    ],
    queries: ['SELECT * FROM Customers WHERE Name LIKE "A%"'],
    forms: ['CustomerForm'],
    reports: ['MonthlySalesReport'],
  };

  it('parses a full Access schema', () => {
    const result = parseAccessSchema(sampleInput, 'test.accdb');
    expect(result.type).toBe('access');
    expect(result.filename).toBe('test.accdb');
    expect(result.metadata?.tableCount).toBe(2);
    expect(result.metadata?.relationshipCount).toBe(1);
    expect(result.metadata?.queryCount).toBe(1);
  });

  it('creates sections for tables', () => {
    const result = parseAccessSchema(sampleInput, 'test.accdb');
    const tableSections = result.sections.filter((s: DocumentSection) => s.type === 'table');
    expect(tableSections).toHaveLength(2);
    expect(tableSections[0].title).toBe('Customers');
    expect(tableSections[0].content).toContain('[PK]');
  });

  it('creates a relationships section', () => {
    const result = parseAccessSchema(sampleInput, 'test.accdb');
    const relSections = result.sections.filter((s: DocumentSection) => s.type === 'relationships');
    expect(relSections).toHaveLength(1);
    expect(relSections[0].content).toContain('Orders.CustomerID');
    expect(relSections[0].content).toContain('one-to-many');
  });

  it('creates query sections', () => {
    const result = parseAccessSchema(sampleInput, 'test.accdb');
    const querySections = result.sections.filter((s: DocumentSection) => s.type === 'query');
    expect(querySections).toHaveLength(1);
    expect(querySections[0].content).toContain('SELECT');
  });

  it('handles empty input gracefully', () => {
    const result = parseAccessSchema({}, 'empty.accdb');
    expect(result.type).toBe('access');
    expect(result.sections).toHaveLength(0);
    expect(result.metadata?.tableCount).toBe(0);
  });

  it('generates context summary', () => {
    const context = {
      tables: [
        {
          name: 'Test',
          fields: [{ name: 'ID', type: 'AutoNumber', isPrimary: true }],
        },
      ],
      relationships: [],
      queries: [],
      forms: [],
      reports: [],
    };
    const summary = accessContextToSummary(context);
    expect(summary).toContain('Tables (1)');
    expect(summary).toContain('Test');
    expect(summary).toContain('[PK]');
  });
});
