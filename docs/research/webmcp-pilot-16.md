# WebMCP pilot: task 16

The JSON Formatter, Base64, and UUID tools register only on their own routes through Angular's experimental `declareExperimentalWebMcpTool` helper. Route injector cleanup removes registrations on navigation. Each tool declares an explicit JSON Schema and also validates unknown properties, types, supported options, and input/count limits at runtime.

Agent calls pass through the existing workbench and `ToolDefinition.run` path. The workbench displays the supplied values, processing state, result, and errors. If a person has edited the current form, the agent call is rejected so their input is not silently replaced. Transformations do not copy to the clipboard or start downloads.

The execution AbortSignal is connected to the workbench run controller. These three transformations are synchronous and short, so cancellation can prevent a pending run from starting or prevent a late result from updating the UI, but it cannot interrupt JavaScript already executing. Results are plain text and are marked as untrusted content. The UI tells people that an agent may forward returned data to its own provider.

Automated coverage validates accepted and rejected arguments, bounds, handler invocation, handler replacement, and cleanup. This implementation was not validated with a real WebMCP client in a secure Chrome context with the experimental feature enabled, nor with the published CSP. Those checks still require the target browser and deployment configuration.
