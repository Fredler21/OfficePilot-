import { v4 as uuid } from 'uuid';
import { getDb } from '@/lib/db';
import type { Template, AppMode } from '@/lib/types';

export const DEFAULT_TEMPLATES: Omit<Template, 'id'>[] = [
  // Word templates
  {
    name: 'Professional Resume',
    appType: 'word',
    category: 'resume',
    description: 'A clean, professional resume template with sections for experience, education, and skills.',
    content: `# [Your Name]\n\n**Contact:** [Email] | [Phone] | [City, State]\n\n## Professional Summary\n[2-3 sentences summarizing your experience and value]\n\n## Experience\n### [Job Title] — [Company Name]\n*[Start Date] – [End Date]*\n- [Achievement 1]\n- [Achievement 2]\n- [Achievement 3]\n\n## Education\n### [Degree] — [University]\n*[Graduation Year]*\n\n## Skills\n[Skill 1] | [Skill 2] | [Skill 3] | [Skill 4]`,
    language: 'en',
  },
  {
    name: 'Business Report',
    appType: 'word',
    category: 'report',
    description: 'Structured business report with executive summary, analysis, and recommendations.',
    content: `# [Report Title]\n\n**Prepared by:** [Name]\n**Date:** [Date]\n\n## Executive Summary\n[Brief overview of findings and recommendations]\n\n## Introduction\n[Purpose and scope of the report]\n\n## Analysis\n### Key Finding 1\n[Details]\n\n### Key Finding 2\n[Details]\n\n## Recommendations\n1. [Recommendation 1]\n2. [Recommendation 2]\n\n## Conclusion\n[Summary and next steps]`,
    language: 'en',
  },
  {
    name: 'Cover Letter',
    appType: 'word',
    category: 'letter',
    description: 'Professional cover letter template for job applications.',
    content: `[Your Name]\n[Address]\n[Date]\n\n[Hiring Manager Name]\n[Company]\n[Address]\n\nDear [Hiring Manager],\n\nI am writing to express my interest in the [Position] role at [Company]. [Opening hook about why you're a great fit].\n\n[Paragraph about relevant experience and achievements]\n\n[Paragraph about why this company and role excites you]\n\nThank you for your consideration. I look forward to discussing how I can contribute to [Company].\n\nSincerely,\n[Your Name]`,
    language: 'en',
  },
  // Excel templates
  {
    name: 'Monthly Budget',
    appType: 'excel',
    category: 'budget',
    description: 'Personal or business monthly budget tracker with income and expense categories.',
    content: `Budget Template:\n\nHeaders: Category | Budget | Actual | Difference\n\nINCOME:\n- Salary | [amount] | [actual] | =B-C\n- Other Income | [amount] | [actual] | =B-C\nTotal Income: =SUM(B2:B3)\n\nEXPENSES:\n- Housing | [amount] | [actual] | =B-C\n- Transportation | [amount] | [actual] | =B-C\n- Food | [amount] | [actual] | =B-C\n- Utilities | [amount] | [actual] | =B-C\n- Other | [amount] | [actual] | =B-C\nTotal Expenses: =SUM(B6:B10)\n\nNET: =TotalIncome - TotalExpenses`,
    language: 'en',
  },
  {
    name: 'Grade Tracker',
    appType: 'excel',
    category: 'education',
    description: 'Student grade tracking spreadsheet with weighted averages.',
    content: `Grade Tracker:\n\nHeaders: Student Name | Assignment 1 | Assignment 2 | Midterm | Final | Average | Grade\n\nFormulas:\n- Average: =AVERAGE(B2:E2)\n- Grade: =IFS(F2>=90,"A",F2>=80,"B",F2>=70,"C",F2>=60,"D",TRUE,"F")\n\nSummary:\n- Class Average: =AVERAGE(F:F)\n- Highest: =MAX(F:F)\n- Lowest: =MIN(F:F)`,
    language: 'en',
  },
  {
    name: 'Sales Dashboard',
    appType: 'excel',
    category: 'business',
    description: 'Sales tracking dashboard with metrics and chart suggestions.',
    content: `Sales Dashboard:\n\nHeaders: Date | Product | Region | Units Sold | Revenue | Cost | Profit\n\nKey Formulas:\n- Profit: =Revenue - Cost\n- Total Revenue: =SUM(E:E)\n- Average Order: =AVERAGE(E:E)\n- Top Product: =INDEX(B:B,MATCH(MAX(E:E),E:E,0))\n\nPivot Table Suggestion:\n- Rows: Product\n- Columns: Region\n- Values: SUM of Revenue\n\nChart: Bar chart comparing Revenue by Region`,
    language: 'en',
  },
  // PowerPoint templates
  {
    name: 'Business Presentation',
    appType: 'powerpoint',
    category: 'business',
    description: '10-slide business presentation deck template.',
    content: `Slide 1: Title Slide — [Presentation Title] / [Subtitle] / [Date]\nSlide 2: Agenda — Key topics to cover\nSlide 3: Problem Statement — The challenge being addressed\nSlide 4: Our Solution — How we solve it\nSlide 5: Key Benefits — 3-4 main advantages\nSlide 6: Market Opportunity — Data and context\nSlide 7: How It Works — Process or workflow\nSlide 8: Results/Metrics — Evidence of success\nSlide 9: Next Steps — Action items and timeline\nSlide 10: Thank You / Q&A — Contact information`,
    language: 'en',
  },
  {
    name: 'Class Presentation',
    appType: 'powerpoint',
    category: 'education',
    description: 'Academic class presentation template.',
    content: `Slide 1: Title — [Topic] / [Your Name] / [Course]\nSlide 2: Introduction — What is this topic?\nSlide 3: Background — Key context and history\nSlide 4: Main Point 1 — [Heading] with supporting details\nSlide 5: Main Point 2 — [Heading] with supporting details\nSlide 6: Main Point 3 — [Heading] with supporting details\nSlide 7: Discussion — Key questions to consider\nSlide 8: Conclusion — Summary of main points\nSlide 9: References — Sources cited`,
    language: 'en',
  },
  // Access templates
  {
    name: 'Customer Database',
    appType: 'access',
    category: 'business',
    description: 'Simple customer management database with orders.',
    content: `Tables:\n\n1. Customers\n   - CustomerID (AutoNumber, PK)\n   - FirstName (Short Text)\n   - LastName (Short Text)\n   - Email (Short Text)\n   - Phone (Short Text)\n   - Address (Short Text)\n   - City (Short Text)\n   - State (Short Text)\n\n2. Orders\n   - OrderID (AutoNumber, PK)\n   - CustomerID (Number, FK → Customers)\n   - OrderDate (Date/Time)\n   - TotalAmount (Currency)\n   - Status (Short Text)\n\n3. OrderDetails\n   - DetailID (AutoNumber, PK)\n   - OrderID (Number, FK → Orders)\n   - ProductName (Short Text)\n   - Quantity (Number)\n   - UnitPrice (Currency)\n\nRelationships:\n- Customers → Orders (One-to-Many)\n- Orders → OrderDetails (One-to-Many)`,
    language: 'en',
  },
  {
    name: 'Inventory Tracker',
    appType: 'access',
    category: 'business',
    description: 'Simple inventory management database.',
    content: `Tables:\n\n1. Products\n   - ProductID (AutoNumber, PK)\n   - ProductName (Short Text)\n   - Category (Short Text)\n   - UnitPrice (Currency)\n   - QuantityInStock (Number)\n   - ReorderLevel (Number)\n   - Supplier (Short Text)\n\n2. Transactions\n   - TransactionID (AutoNumber, PK)\n   - ProductID (Number, FK → Products)\n   - TransactionType (Short Text: In/Out)\n   - Quantity (Number)\n   - TransactionDate (Date/Time)\n   - Notes (Long Text)\n\nRelationships:\n- Products → Transactions (One-to-Many)\n\nUseful Queries:\n- Low Stock: SELECT * FROM Products WHERE QuantityInStock < ReorderLevel\n- Monthly Transactions: SELECT * FROM Transactions WHERE TransactionDate BETWEEN #start# AND #end#`,
    language: 'en',
  },
  {
    name: 'Employee Tracker',
    appType: 'access',
    category: 'hr',
    description: 'Employee directory and department tracking database.',
    content: `Tables:\n\n1. Departments\n   - DepartmentID (AutoNumber, PK)\n   - DepartmentName (Short Text)\n   - ManagerName (Short Text)\n\n2. Employees\n   - EmployeeID (AutoNumber, PK)\n   - FirstName (Short Text)\n   - LastName (Short Text)\n   - DepartmentID (Number, FK → Departments)\n   - Title (Short Text)\n   - HireDate (Date/Time)\n   - Email (Short Text)\n   - Phone (Short Text)\n\nRelationships:\n- Departments → Employees (One-to-Many)`,
    language: 'en',
  },
];

export function seedTemplates() {
  const db = getDb();
  const existing = db.prepare('SELECT COUNT(*) as count FROM template_library').get() as { count: number };
  if (existing.count > 0) return;

  const stmt = db.prepare(
    `INSERT INTO template_library (id, name, app_type, category, description, content, language) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  for (const t of DEFAULT_TEMPLATES) {
    stmt.run(uuid(), t.name, t.appType, t.category, t.description, t.content, t.language);
  }
}

export function getTemplates(appType?: string, category?: string): Template[] {
  const db = getDb();
  let sql = 'SELECT * FROM template_library WHERE 1=1';
  const params: unknown[] = [];
  if (appType) { sql += ' AND app_type = ?'; params.push(appType); }
  if (category) { sql += ' AND category = ?'; params.push(category); }
  sql += ' ORDER BY name';

  return (db.prepare(sql).all(...params) as Record<string, unknown>[]).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    appType: row.app_type as AppMode,
    category: row.category as string,
    description: row.description as string | null,
    content: row.content as string,
    language: row.language as string,
  }));
}

export function getTemplate(id: string): Template | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM template_library WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    id: row.id as string,
    name: row.name as string,
    appType: row.app_type as AppMode,
    category: row.category as string,
    description: row.description as string | null,
    content: row.content as string,
    language: row.language as string,
  };
}
