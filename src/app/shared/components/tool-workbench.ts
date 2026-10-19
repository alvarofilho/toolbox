import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
  viewChildren,
  ElementRef,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { PreferencesService } from '../../core/services/preferences';
import { CATEGORIES, TOOLS } from '../../core/registry/tools';
import type { ToolDefinition, ToolFiles, ToolResult, ToolValues } from '../../core/models/tool';
import { Icon } from './icon';

@Component({
  selector: 'app-tool-workbench',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tool-workbench.html',
})
export class ToolWorkbench implements OnInit, OnDestroy {
  readonly definition = input.required<ToolDefinition>();
  protected readonly p = inject(PreferencesService);
  protected readonly values = signal<ToolValues>({});
  protected readonly files = signal<ToolFiles>({});
  private readonly fileInputs = viewChildren<ElementRef<HTMLInputElement>>('fileInput');
  private readonly sanitizer = inject(DomSanitizer);
  // Only used in an opaque-origin, scriptless sandbox with a restrictive child CSP.
  protected readonly preview = computed(() =>
    this.result()?.preview
      ? this.sanitizer.bypassSecurityTrustHtml(this.result()?.preview ?? '')
      : null,
  );
  protected readonly result = signal<ToolResult | null>(null);
  protected readonly error = signal('');
  protected readonly busy = signal(false);
  protected readonly feedback = signal('');
  private runId = 0;
  protected readonly info = computed(() => {
    const info = TOOLS.find((t) => t.id === this.definition().id);
    if (!info) throw new Error('Unregistered tool');
    return info;
  });
  protected readonly category = computed(() =>
    CATEGORIES.find((c) => c.id === this.info().category),
  );
  ngOnInit(): void {
    this.reset();
    this.p.visit(this.definition().id);
  }
  ngOnDestroy(): void {
    this.runId++;
  }
  protected update(key: string, event: Event): void {
    const target = event.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    ) {
      if (target instanceof HTMLInputElement && target.type === 'file') {
        this.files.update((files) => ({ ...files, [key]: Array.from(target.files ?? []) }));
      }
      this.values.update((values) => ({
        ...values,
        [key]:
          target instanceof HTMLInputElement && target.type === 'checkbox'
            ? String(target.checked)
            : target.value,
      }));
      this.result.set(null);
      this.error.set('');
      this.feedback.set('');
    }
  }
  protected reset(): void {
    for (const input of this.fileInputs()) input.nativeElement.value = '';
    this.files.set({});
    this.values.set(Object.fromEntries(this.definition().controls.map((c) => [c.key, c.value])));
    this.result.set(null);
    this.error.set('');
    this.feedback.set('');
  }
  protected example(): void {
    this.reset();
    this.values.update((values) => ({ ...values, ...this.definition().example }));
  }
  protected async run(event: Event): Promise<void> {
    event.preventDefault();
    if (this.busy()) return;
    const id = ++this.runId;
    this.busy.set(true);
    this.error.set('');
    this.feedback.set('');
    this.result.set(null);
    try {
      if (
        Object.values(this.values()).some((v) => v.length > 100000) ||
        Object.values(this.values()).reduce((sum, v) => sum + v.length, 0) > 200000
      )
        throw new Error(
          this.p.label(
            'Limite de 100.000 caracteres por campo e 200.000 no total. Reduza a entrada.',
            'Limit: 100,000 characters per field and 200,000 total. Reduce the input.',
          ),
        );
      for (const control of this.definition().controls) {
        if (control.type === 'number') {
          const n = Number(this.values()[control.key]);
          if (!Number.isInteger(n) || n < (control.min ?? 0) || n > (control.max ?? Infinity))
            throw new Error(`${this.p.t(control.label)}: ${control.min}–${control.max}`);
        }
      }
      const selected = Object.values(this.files()).flat();
      if (
        selected.length > 20 ||
        selected.some((f) => f.size > 20 * 1024 * 1024) ||
        selected.reduce((n, f) => n + f.size, 0) > 50 * 1024 * 1024
      )
        throw new Error(
          this.p.label(
            'Limite de 20 arquivos, 20 MB por arquivo e 50 MB no total.',
            'Limit: 20 files, 20 MB per file, 50 MB total.',
          ),
        );
      const result = await this.definition().run(this.values(), this.files());
      if (result.output.length > 1000000)
        throw new Error(
          this.p.label(
            'Resultado muito grande. Reduza a entrada.',
            'Output too large. Reduce input.',
          ),
        );
      if (
        (result.artifacts ?? []).reduce((n, artifact) => n + artifact.blob.size, 0) >
        50 * 1024 * 1024
      )
        throw new Error(
          this.p.label(
            'Arquivos de saída excedem 50 MB. Reduza a entrada.',
            'Output files exceed 50 MB. Reduce the input.',
          ),
        );
      if (id === this.runId) this.result.set(result);
    } catch (error: unknown) {
      if (id === this.runId) this.error.set(error instanceof Error ? error.message : String(error));
    } finally {
      if (id === this.runId) this.busy.set(false);
    }
  }
  protected async copy(): Promise<void> {
    const result = this.result();
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.output);
      this.feedback.set(this.p.label('Resultado copiado.', 'Result copied.'));
    } catch {
      this.feedback.set(
        this.p.label(
          'Não foi possível copiar. Selecione o resultado e copie manualmente.',
          'Copy failed. Select the result and copy it manually.',
        ),
      );
    }
  }
  protected download(artifactIndex?: number): void {
    const result = this.result();
    if (!result) return;
    const artifact = artifactIndex === undefined ? undefined : result.artifacts?.[artifactIndex];
    const url = URL.createObjectURL(
      artifact?.blob ??
        new Blob([result.output], { type: result.mime ?? 'text/plain;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = artifact?.filename ?? result.filename ?? `${this.definition().id}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.feedback.set(this.p.label('Exportação iniciada.', 'Export started.'));
  }
}
