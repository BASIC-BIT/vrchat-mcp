export interface RegisteredTool {
  name: string;
  config: {
    description?: string;
    inputSchema?: unknown;
    outputSchema?: unknown;
    annotations?: unknown;
  };
  handler: (args: unknown) => unknown;
}

export class FakeServer {
  tools: RegisteredTool[] = [];

  registerTool(
    name: string,
    config: {
      description?: string;
      inputSchema?: unknown;
      outputSchema?: unknown;
      annotations?: unknown;
    },
    handler: (args: unknown) => unknown,
  ) {
    this.tools.push({ name, config, handler });
  }
}
