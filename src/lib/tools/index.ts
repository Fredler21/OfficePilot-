export { ToolRegistry, toolRegistry } from './registry';
export type { ToolHandler, ToolContext, ToolResult } from './registry';

import { toolRegistry } from './registry';
import { wordTools } from './word';
import { excelTools } from './excel';
import { powerpointTools } from './powerpoint';
import { accessTools } from './access';
import { generalTools } from './general';

export function registerAllTools() {
  for (const tool of wordTools) toolRegistry.register(tool);
  for (const tool of excelTools) toolRegistry.register(tool);
  for (const tool of powerpointTools) toolRegistry.register(tool);
  for (const tool of accessTools) toolRegistry.register(tool);
  for (const tool of generalTools) toolRegistry.register(tool);
}
