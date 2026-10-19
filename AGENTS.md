## Angular 22 and TypeScript

- Keep `angularCompilerOptions.strictTemplates` enabled in `tsconfig.json`. Fix type mismatches in the component or template; do not bypass the checker with `$any()`, `any`, or assertions without a concrete justification.
- Follow Angular's standalone model: declare each component's dependencies in its `imports` and prefer standalone components, directives, and pipes over new `NgModule`s.
- Prefer `input()`, `output()`, and `model()` for new component APIs. Use `inject()` for dependency injection, keep members used only by a template `protected`, and mark inputs, outputs, and queries `readonly` where appropriate.
- Use Signals for synchronous UI state (`signal`, `computed`, and `linkedSignal` when writable derived state is needed). Reserve `effect()` for synchronizing external side effects; do not use it to copy or recalculate state that can be expressed with `computed`.
- Prefer native control flow (`@if`, `@for`, `@switch`) in new templates. Every `@for` list must have a stable, unique `track` expression; keep template expressions simple and move complex logic into typed methods or computed values.
- In Angular 22, Signal Forms are stable and are an option for new signal-oriented forms. Preserve the strategy already used by existing forms; typed Reactive Forms remain suitable for complex or dynamic flows.
- Prefer `async`/`await` for one-off asynchronous operations and RxJS for event streams and reactive composition. When subscribing to observables tied to a component or service lifecycle, prefer `takeUntilDestroyed()`.
- Use TypeScript's strict modes and keep types explicit at public boundaries and for external data. Prefer `unknown` with narrowing over `any`, discriminated unions for finite states, and `readonly` for data that should not change.
- Avoid `!`, casts, and vague generic types used to silence errors. Narrow types with guards and validate external data before treating it as an internal type.
- Preserve accessibility: use semantic HTML elements, accessible names, correct label-to-field associations, and visible focus states.
- Before completing application changes, check `package.json` scripts and run `pnpm run format:check`, `pnpm run lint`, `pnpm run test --watch=false`, and `pnpm run build` as relevant.
