import { WorkflowExecutionContext } from '../types/workflow.types';

export interface IActionHandler {
  execute(config: any, context: WorkflowExecutionContext): Promise<Record<string, any>>;
}
