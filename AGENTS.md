<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

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
- Before completing application changes, check the scripts and tasks defined in `package.json` and `vite.config.ts`; run the relevant checks with `vp` (`vp run build` for the `build` script).
