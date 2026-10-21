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
	afterNextRender,
	Injector,
	PendingTasks,
	DestroyRef,
} from '@angular/core';
import { FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { PreferencesService } from '@app/core/services/preferences';
import { ToolPresetsService } from '@app/core/services/tool-presets';
import {
	compatibleHandoffTargets,
	isToolHandoffTarget,
	ToolHandoffService,
	type ToolHandoffTarget,
} from '@app/core/services/tool-handoff';
import { CATEGORIES, TOOLS } from '@app/features/tools/catalog/tools';
import type {
	ToolControl,
	ToolDefinition,
	ToolFiles,
	ToolResult,
	ToolValues,
} from '@app/core/models/tool';
import { ToolExecutionError, TranslatedToolError } from '@app/core/models/tool';
import { presentDefinition, visibleControl } from '@app/features/tools/workbench/presentation';
import {
	canonicalJson,
	sideBySideDiff,
	type DiffRow,
} from '@app/features/tools/_shared/difference';
import { Icon } from '@app/shared/components/icon';
import * as z from 'zod';

@Component({
	selector: 'app-tool-workbench',
	imports: [RouterLink, Icon, TranslocoPipe, ReactiveFormsModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './tool-workbench.html',
})
export class ToolWorkbench implements OnInit, OnDestroy {
	readonly definition = input.required<ToolDefinition>();
	protected readonly p = inject(PreferencesService);
	private readonly translationState = computed(() => ({
		locale: this.p.locale(),
		ready: this.p.translationsReady(),
	}));
	private readonly transloco = inject(TranslocoService);
	private readonly presetService = inject(ToolPresetsService);
	private readonly router = inject(Router);
	private readonly handoff = inject(ToolHandoffService);
	private readonly destroyRef = inject(DestroyRef);
	protected readonly toolForm = new FormRecord<FormControl<string | boolean | null>>({});
	protected readonly values = signal<ToolValues>({});
	protected readonly files = signal<ToolFiles>({});
	private readonly document = inject(DOCUMENT);
	private readonly injector = inject(Injector);
	private readonly pendingTasks = inject(PendingTasks);
	protected readonly stale = signal(false);
	protected readonly draggingFileKey = signal<string | null>(null);
	protected readonly fieldErrors = signal<Readonly<Record<string, string>>>({});
	protected readonly revealed = signal<readonly string[]>([]);
	private readonly completedValues = signal<ToolValues>({});
	private readonly fileInputs = viewChildren<ElementRef<HTMLInputElement>>('fileInput');
	private readonly sanitizer = inject(DomSanitizer);
	// Only used in an opaque-origin, scriptless sandbox with a restrictive child CSP.
	protected readonly preview = computed(() =>
		this.result()?.preview
			? this.sanitizer.bypassSecurityTrustHtml(
					(this.result()?.preview ?? '').replace('<html>', `<html data-theme="${this.p.theme()}">`),
				)
			: null,
	);
	protected readonly result = signal<ToolResult | null>(null);
	protected readonly tool = computed(() => presentDefinition(this.definition(), this.info()));
	protected readonly controls = computed(() =>
		this.tool().controls.filter((control) => visibleControl(control, this.values())),
	);
	protected readonly basicControls = computed(() =>
		this.controls().filter((control) => !this.isPasswordAdvancedControl(control.key)),
	);
	protected readonly passwordAdvancedControls = computed(() =>
		this.controls().filter((control) => this.isPasswordAdvancedControl(control.key)),
	);
	protected readonly passwordAdvancedErrors = computed(() =>
		this.passwordAdvancedControls().some((control) => this.fieldErrors()[control.key]),
	);
	protected readonly automatic = computed(() => this.tool().execution === 'automatic');
	protected readonly isPasswordTool = computed(() => this.tool().id === 'password');
	protected readonly action = computed(() => {
		const mode = this.values()['mode'];
		if (this.isPasswordTool()) {
			return this.transloco.translate(
				'tools.password.generate_password',
				{},
				this.translationState().locale,
			);
		}
		if (this.tool().id === 'aes') {
			return mode === 'decrypt'
				? this.transloco.translate('common.decrypt', {}, this.translationState().locale)
				: this.transloco.translate('common.encrypt', {}, this.translationState().locale);
		}
		if (this.tool().id === 'pdf-pages') {
			const option = this.tool()
				.controls.find((control) => control.key === 'mode')
				?.options?.find((option) => option.value === mode);
			if (option?.label) {
				return this.transloco.translate(option.label, {}, this.translationState().locale);
			}
		}
		if (
			['cpf', 'cnpj', 'renavam', 'plate', 'credit-card', 'nfe', 'bip39', 'otp'].includes(
				this.tool().id,
			)
		) {
			return mode === 'validate' || mode === 'verify'
				? this.transloco.translate('common.validate', {}, this.translationState().locale)
				: this.transloco.translate('common.generate', {}, this.translationState().locale);
		}
		if (this.tool().id === 'pix') {
			return mode === 'decode'
				? this.transloco.translate('common.decode_pix', {}, this.translationState().locale)
				: this.transloco.translate('common.generate_pix', {}, this.translationState().locale);
		}
		if (this.tool().id === 'bcrypt') {
			return mode === 'verify'
				? this.transloco.translate('common.verify_password', {}, this.translationState().locale)
				: this.transloco.translate('common.generate_hash', {}, this.translationState().locale);
		}
		return this.transloco.translate(this.tool().action, {}, this.translationState().locale);
	});
	protected readonly downloadLabel = computed(() => {
		const artifacts = this.result()?.artifacts ?? [];
		if (artifacts.length !== 1) {
			return this.transloco.translate('common.export_text', {}, this.translationState().locale);
		}
		const filename = artifacts[0].filename.toLowerCase();
		return filename.endsWith('.zip')
			? this.transloco.translate('common.download_zip', {}, this.translationState().locale)
			: filename.endsWith('.pdf')
				? this.transloco.translate('common.download_pdf', {}, this.translationState().locale)
				: /\.(png|jpe?g|webp|svg|ico)$/.test(filename)
					? this.transloco.translate('common.download_image', {}, this.translationState().locale)
					: this.transloco.translate('common.download_file', {}, this.translationState().locale);
	});
	protected readonly isDiffTool = computed(() =>
		['text-diff', 'json-diff'].includes(this.definition().id),
	);
	protected readonly diffRows = computed<readonly DiffRow[]>(() => {
		if (!this.isDiffTool() || !this.result()) {
			return [];
		}
		const controls = this.definition().controls;
		const leftKey = controls[0]?.key;
		const rightKey = controls[1]?.key;
		if (!leftKey || !rightKey) {
			return [];
		}
		let left = this.completedValues()[leftKey] ?? '';
		let right = this.completedValues()[rightKey] ?? '';
		try {
			if (this.definition().id === 'json-diff') {
				left = JSON.stringify(canonicalJson(JSON.parse(left)), null, 2);
				right = JSON.stringify(canonicalJson(JSON.parse(right)), null, 2);
			}
		} catch {
			return [];
		}
		return sideBySideDiff(left, right);
	});
	protected readonly diffSummary = computed(() => {
		const rows = this.diffRows();
		return {
			additions: rows.filter((row) => row.kind === 'added' || row.kind === 'change').length,
			removals: rows.filter((row) => row.kind === 'removed' || row.kind === 'change').length,
		};
	});
	protected readonly diffStatus = computed(() => {
		if (!this.result()) {
			return this.transloco.translate(
				'common.ready_to_compare',
				{},
				this.translationState().locale,
			);
		}
		if (this.diffSummary().additions === 0 && this.diffSummary().removals === 0) {
			return this.transloco.translate(
				'common.files_are_identical',
				{},
				this.translationState().locale,
			);
		}
		return this.transloco.translate('common.differences_found', {}, this.translationState().locale);
	});
	protected readonly diffLineCounts = computed(() => {
		const controls = this.definition().controls;
		const leftKey = controls[0]?.key;
		const rightKey = controls[1]?.key;
		return {
			left: (this.values()[leftKey ?? ''] ?? '').split('\n').length,
			right: (this.values()[rightKey ?? ''] ?? '').split('\n').length,
		};
	});
	protected readonly error = signal('');
	protected readonly busy = signal(false);
	protected readonly feedback = signal('');
	protected readonly presetName = signal('');
	protected readonly selectedPresetId = signal('');
	private readonly presetRefresh = signal(0);
	protected readonly supportsPresets = computed(() =>
		this.presetService.supports(this.tool().id, this.tool().controls),
	);
	protected readonly presets = computed(
		() => (this.presetRefresh(), this.presetService.list(this.tool().id, this.tool().controls)),
	);
	protected readonly presetStorageUnavailable = this.presetService.storageUnavailable;
	protected readonly pendingHandoff = signal<string | null>(null);
	protected readonly handoffNeedsConfirmation = signal(false);
	protected readonly handoffTargets = computed(() => {
		return compatibleHandoffTargets(this.definition().id).flatMap((targetId) => {
			const tool = TOOLS.find((candidate) => candidate.id === targetId);
			return tool ? [{ id: targetId, name: tool.name }] : [];
		});
	});
	private runId = 0;
	private activeRunController: AbortController | undefined;
	private autoRunTimer: ReturnType<typeof setTimeout> | undefined;
	protected readonly info = computed(() => {
		const info = TOOLS.find((t) => t.id === this.definition().id);
		if (!info) {
			throw new Error('Unregistered tool');
		}
		return info;
	});
	protected readonly category = computed(() =>
		CATEGORIES.find((c) => c.id === this.info().category),
	);
	ngOnInit(): void {
		this.toolForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
			this.syncValues();
			this.onFieldChanged();
		});
		this.reset();
		const targetId = this.definition().id;
		if (isToolHandoffTarget(targetId)) {
			const value = this.handoff.consume(targetId);
			if (value !== null) {
				this.pendingHandoff.set(value);
				const input = this.definition().controls.find((control) => control.key === 'input');
				if (input && this.values()['input']?.trim()) {
					this.handoffNeedsConfirmation.set(true);
					afterNextRender(
						() => this.document.querySelector<HTMLElement>('.handoff-actions button')?.focus(),
						{ injector: this.injector },
					);
				} else {
					this.acceptHandoff();
				}
			}
		}
		this.p.visit(this.definition().id);
	}
	ngOnDestroy(): void {
		if (this.autoRunTimer) {
			clearTimeout(this.autoRunTimer);
		}
		this.runId++;
		this.activeRunController?.abort();
		this.activeRunController = undefined;
	}
	protected update(key: string, event: Event): void {
		const target = event.target;
		if (!(target instanceof HTMLInputElement) || target.type !== 'file') {
			return;
		}
		this.files.update((files) => ({ ...files, [key]: Array.from(target.files ?? []) }));
		this.toolForm.controls[key]?.setValue(target.value);
		this.onFieldChanged();
	}
	protected field(key: string): FormControl<string | boolean | null> {
		const control = this.toolForm.controls[key];
		if (!control) {
			throw new Error(`Missing form control: ${key}`);
		}
		return control;
	}
	protected onFieldChanged(): void {
		this.stale.set(!!this.result());
		this.error.set('');
		this.fieldErrors.set({});
		for (const control of Object.values(this.toolForm.controls)) {
			control.setErrors(null, { emitEvent: false });
		}
		this.feedback.set('');
		this.cancelPending();
		if (this.automatic()) {
			this.scheduleRun();
		}
	}
	protected onFileDragOver(key: string, event: DragEvent): void {
		event.preventDefault();
		if (event.dataTransfer?.types.includes('Files')) {
			this.draggingFileKey.set(key);
		}
	}
	protected onFileDragLeave(key: string, event: DragEvent): void {
		const container = event.currentTarget;
		if (
			this.draggingFileKey() === key &&
			container instanceof HTMLElement &&
			!(event.relatedTarget instanceof Node && container.contains(event.relatedTarget))
		) {
			this.draggingFileKey.set(null);
		}
	}
	protected onFileDrop(
		key: string,
		multiple: boolean,
		input: HTMLInputElement,
		event: DragEvent,
	): void {
		event.preventDefault();
		this.draggingFileKey.set(null);
		const droppedFiles = Array.from(event.dataTransfer?.files ?? []);
		if (droppedFiles.length === 0) {
			return;
		}
		const transfer = new DataTransfer();
		for (const file of multiple ? droppedFiles : droppedFiles.slice(0, 1)) {
			transfer.items.add(file);
		}
		input.files = transfer.files;
		input.dispatchEvent(new Event('change', { bubbles: true }));
	}
	protected reset(): void {
		if (this.autoRunTimer) {
			clearTimeout(this.autoRunTimer);
			this.autoRunTimer = undefined;
		}
		this.runId++;
		this.activeRunController?.abort();
		this.activeRunController = undefined;
		this.busy.set(false);
		for (const input of this.fileInputs()) {
			input.nativeElement.value = '';
		}
		this.files.set({});
		this.draggingFileKey.set(null);
		for (const key of Object.keys(this.toolForm.controls)) {
			this.toolForm.removeControl(key, { emitEvent: false });
		}
		for (const control of this.definition().controls) {
			const initialValue = control.type === 'checkbox' ? control.value === 'true' : control.value;
			this.toolForm.addControl(
				control.key,
				new FormControl<string | boolean | null>(initialValue),
				{ emitEvent: false },
			);
		}
		this.syncValues();
		this.result.set(null);
		this.error.set('');
		this.feedback.set('');
		this.stale.set(false);
		this.fieldErrors.set({});
		this.revealed.set([]);
		this.completedValues.set({});
		this.selectedPresetId.set('');
	}
	protected updatePresetName(event: Event): void {
		if (event.target instanceof HTMLInputElement) {
			this.presetName.set(event.target.value);
		}
	}
	protected updateSelectedPreset(event: Event): void {
		if (event.target instanceof HTMLSelectElement) {
			this.selectedPresetId.set(event.target.value);
		}
	}
	protected savePreset(): void {
		const outcome = this.presetService.save(
			this.tool().id,
			this.tool().controls,
			this.presetName(),
			this.values(),
		);
		const key =
			outcome === 'saved'
				? 'common.preset_saved'
				: outcome === 'duplicate'
					? 'common.preset_name_already_exists'
					: outcome === 'unavailable'
						? 'common.presets_storage_unavailable'
						: 'common.preset_name_required';
		this.feedback.set(this.transloco.translate(key, {}, this.translationState().locale));
		this.presetRefresh.update((revision) => revision + 1);
		if (outcome === 'saved') {
			this.presetName.set('');
		}
	}
	protected applyPreset(): void {
		const preset = this.presetService.find(
			this.tool().id,
			this.tool().controls,
			this.selectedPresetId(),
		);
		if (!preset) {
			this.feedback.set(
				this.transloco.translate(
					'common.preset_invalid_or_unavailable',
					{},
					this.translationState().locale,
				),
			);
			return;
		}
		this.cancelPending();
		for (const [key, value] of Object.entries(preset.values)) {
			this.toolForm.controls[key]?.setValue(value, { emitEvent: false });
		}
		this.syncValues();
		this.fieldErrors.set({});
		this.error.set('');
		this.stale.set(!!this.result());
		this.feedback.set(
			this.transloco.translate('common.preset_applied', {}, this.translationState().locale),
		);
	}
	protected deletePreset(): void {
		const removed = this.presetService.remove(
			this.tool().id,
			this.tool().controls,
			this.selectedPresetId(),
		);
		this.selectedPresetId.set('');
		this.presetRefresh.update((revision) => revision + 1);
		this.feedback.set(
			this.transloco.translate(
				removed ? 'common.preset_deleted' : 'common.preset_invalid_or_unavailable',
				{},
				this.translationState().locale,
			),
		);
	}
	protected example(): void {
		this.reset();
		for (const [key, value] of Object.entries(this.definition().example ?? {})) {
			const definition = this.definition().controls.find((control) => control.key === key);
			this.toolForm.controls[key]?.setValue(
				definition?.type === 'checkbox' ? value === 'true' : value,
				{ emitEvent: false },
			);
		}
		this.syncValues();
		void this.run();
	}
	protected async openResultIn(target: ToolHandoffTarget): Promise<void> {
		const output = this.result()?.output;
		if (output === undefined || this.stale()) {
			return;
		}
		this.handoff.offer(target, output);
		const navigated = await this.router.navigate(['/tools', target]);
		if (!navigated) {
			this.handoff.clear();
		}
	}
	protected acceptHandoff(): void {
		const value = this.pendingHandoff();
		if (value === null) {
			return;
		}
		this.toolForm.controls['input']?.setValue(value);
		this.pendingHandoff.set(null);
		this.handoffNeedsConfirmation.set(false);
		this.stale.set(false);
		this.error.set('');
		this.feedback.set('');
		afterNextRender(() => this.document.getElementById('field-input')?.focus(), {
			injector: this.injector,
		});
	}
	protected dismissHandoff(): void {
		this.pendingHandoff.set(null);
		this.handoffNeedsConfirmation.set(false);
		afterNextRender(() => this.document.getElementById('field-input')?.focus(), {
			injector: this.injector,
		});
	}
	private syncValues(): void {
		const values: Record<string, string> = {};
		for (const [key, value] of Object.entries(this.toolForm.getRawValue())) {
			values[key] = value === null ? '' : String(value);
		}
		this.values.set(values);
	}
	private valuesSchema(): z.ZodType<ToolValues> {
		const locale = this.translationState().locale;
		return z.record(z.string(), z.string()).superRefine((values, context) => {
			let totalLength = 0;
			for (const [key, value] of Object.entries(values)) {
				totalLength += value.length;
				if (value.length > 100_000) {
					context.addIssue({
						code: 'custom',
						path: [key],
						message: this.transloco.translate(
							'common.limit_100_000_characters_per_field_and_200',
							{},
							locale,
						),
					});
				}
			}
			if (totalLength > 200_000) {
				context.addIssue({
					code: 'custom',
					path: ['input'],
					message: this.transloco.translate(
						'common.limit_100_000_characters_per_field_and_200',
						{},
						locale,
					),
				});
			}
			for (const control of this.controls()) {
				if (control.type !== 'number') {
					continue;
				}
				const raw = values[control.key] ?? '';
				const number = raw.trim() ? Number(raw) : Number.NaN;
				let message: string | undefined;
				if (!Number.isFinite(number)) {
					message = this.transloco.translate('common.enter_a_valid_number', {}, locale);
				} else if (control.step !== 'any' && !Number.isInteger(number)) {
					message = this.transloco.translate('common.enter_a_whole_number', {}, locale);
				} else if (number < (control.min ?? -Infinity) || number > (control.max ?? Infinity)) {
					message = this.transloco.translate(
						'common.number_must_be_between',
						{
							min: control.min ?? '−∞',
							max: control.max ?? '∞',
						},
						locale,
					);
				}
				if (message) {
					context.addIssue({ code: 'custom', path: [control.key], message });
				}
			}
		});
	}
	private scheduleRun(): void {
		if (this.autoRunTimer) {
			clearTimeout(this.autoRunTimer);
		}
		this.runId++;
		this.autoRunTimer = setTimeout(() => {
			this.autoRunTimer = undefined;
			if (
				this.controls().some(
					(control) => control.key === 'input' && !this.values()[control.key]?.trim(),
				)
			) {
				return;
			}
			void this.run(undefined, true);
		}, 450);
	}
	protected async run(event?: Event, automaticRun = false): Promise<void> {
		event?.preventDefault();
		if (this.autoRunTimer) {
			clearTimeout(this.autoRunTimer);
			this.autoRunTimer = undefined;
		}
		const id = ++this.runId;
		const controller = new AbortController();
		this.activeRunController?.abort();
		this.activeRunController = controller;
		const completeTask = this.pendingTasks.add();
		this.busy.set(true);
		this.error.set('');
		this.feedback.set('');
		this.fieldErrors.set({});
		const values = this.values();
		const files = this.files();
		try {
			const validation = this.valuesSchema().safeParse(values);
			if (!validation.success) {
				this.toolForm.markAllAsTouched();
				const errors: Record<string, string> = {};
				for (const issue of validation.error.issues) {
					const key = String(issue.path[0] ?? 'input');
					errors[key] ??= issue.message;
				}
				this.fieldErrors.set(errors);
				for (const [key, message] of Object.entries(errors)) {
					this.toolForm.controls[key]?.setErrors({ zod: message });
				}
				throw new Error(
					this.transloco.translate(
						'common.correct_the_highlighted_fields',
						{},
						this.translationState().locale,
					),
				);
			}
			const selected = Object.values(this.files()).flat();
			const fileValidation = z
				.array(z.file())
				.superRefine((selectedFiles, context) => {
					if (
						selectedFiles.length > 20 ||
						selectedFiles.some((file) => file.size > 20 * 1024 * 1024) ||
						selectedFiles.reduce((total, file) => total + file.size, 0) > 50 * 1024 * 1024
					) {
						context.addIssue({
							code: 'custom',
							message: this.transloco.translate(
								'common.limit_20_files_20_mb_per_file_50_mb_total',
								{},
								this.translationState().locale,
							),
						});
					}
				})
				.safeParse(selected);
			if (!fileValidation.success) {
				throw new Error(
					fileValidation.error.issues[0]?.message ??
						this.transloco.translate(
							'common.limit_20_files_20_mb_per_file_50_mb_total',
							{},
							this.translationState().locale,
						),
				);
			}
			// Yield once so loading and cancellation controls render before local processing.
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			if (id !== this.runId) {
				return;
			}
			const result = await this.definition().run(values, files, controller.signal);
			if (result.output.length > 1000000) {
				throw new Error(
					this.transloco.translate(
						'common.output_too_large_reduce_input',
						{},
						this.translationState().locale,
					),
				);
			}
			if (
				(result.artifacts ?? []).reduce((n, artifact) => n + artifact.blob.size, 0) >
				50 * 1024 * 1024
			) {
				throw new Error(
					this.transloco.translate(
						'common.output_files_exceed_50_mb_reduce_the_input',
						{},
						this.translationState().locale,
					),
				);
			}
			if (id === this.runId && !controller.signal.aborted) {
				this.result.set(result);
				this.completedValues.set(values);
				this.stale.set(false);
			}
		} catch (error: unknown) {
			if (id === this.runId) {
				if (error instanceof ToolExecutionError && error.kind === 'cancelled') {
					this.feedback.set(
						this.transloco.translate(
							'common.execution_cancelled',
							{},
							this.translationState().locale,
						),
					);
				} else if (!automaticRun) {
					const message = this.errorMessage(error);
					this.error.set(message);
					if (error instanceof TranslatedToolError && error.fieldKey) {
						this.fieldErrors.set({ [error.fieldKey]: message });
					} else {
						const source = this.controls().find((control) => control.key === 'input');
						const isInputError = !(error instanceof ToolExecutionError) || error.kind === 'input';
						if (source && isInputError && !Object.keys(this.fieldErrors()).length) {
							this.fieldErrors.set({ [source.key]: message });
						}
					}
				}
			}
		} finally {
			completeTask();
			if (id === this.runId) {
				this.activeRunController = undefined;
				this.busy.set(false);
				if (!automaticRun) {
					afterNextRender(
						() => {
							const key = Object.keys(this.fieldErrors())[0];
							if (key) {
								this.document.getElementById(`field-${key}`)?.focus();
							}
						},
						{ injector: this.injector },
					);
				}
			}
		}
	}
	private cancelPending(): void {
		if (this.autoRunTimer) {
			clearTimeout(this.autoRunTimer);
		}
		this.autoRunTimer = undefined;
		this.runId++;
		this.activeRunController?.abort();
		this.activeRunController = undefined;
		this.busy.set(false);
	}
	protected cancel(): void {
		this.cancelPending();
		this.feedback.set(
			this.transloco.translate('common.execution_cancelled', {}, this.translationState().locale),
		);
	}
	protected showResult(): void {
		const result = this.document.getElementById('tool-result');
		result?.focus({ preventScroll: true });
		result?.scrollIntoView({
			block: 'start',
			behavior: this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches
				? 'auto'
				: 'smooth',
		});
	}
	protected toggleReveal(key: string): void {
		this.revealed.update((keys) =>
			keys.includes(key) ? keys.filter((value) => value !== key) : [...keys, key],
		);
	}
	private isPasswordAdvancedControl(key: string): boolean {
		return this.isPasswordTool() && ['minNumbers', 'minSymbols', 'avoidAmbiguous'].includes(key);
	}
	private errorMessage(error: unknown): string {
		const locale = this.translationState().locale;
		if (error instanceof ToolExecutionError) {
			if (error.kind === 'timeout') {
				return this.transloco.translate('common.execution_timed_out', {}, locale);
			}
			if (error.kind === 'input') {
				const prefix = this.transloco.translate('common.invalid_tool_input', {}, locale);
				return error.message ? `${prefix}: ${error.message}` : prefix;
			}
			if (error.kind === 'worker') {
				return this.transloco.translate('common.tool_execution_failed', {}, locale);
			}
		}
		if (error instanceof TranslatedToolError) {
			return this.transloco.translate(error.translationKey, error.params, locale);
		}

		const rawMessage = error instanceof Error ? error.message : '';
		const legacyMessage = this.legacyLocalizedMessage(rawMessage, locale);
		return legacyMessage ?? this.transloco.translate('common.tool_error_generic', {}, locale);
	}
	private legacyLocalizedMessage(message: string, locale: 'pt' | 'en' | 'es'): string | undefined {
		const alternatives = message.split(' / ');
		if (alternatives.length !== 2 || locale === 'es') {
			return undefined;
		}
		const [first, second] = alternatives;
		if (!first || !second) {
			return undefined;
		}

		const portuguesePattern =
			/[ãáâçéêíóôõú]|\b(?:selecione|informe|inválid[oa]|obrigatóri[oa]|fora do intervalo|falha|não|máximo|mínimo|esperado|esperada|quantidade|caracteres|arquivo|página|operação|conteúdo|senha|valor|campo)\b/i;
		const englishPattern =
			/\b(?:select|enter|invalid|missing|required|outside|failed|maximum|minimum|expected|count|characters|file|page|operation|content|password|value|field|only|unsupported|could not|must be|should be|not allowed)\b/i;
		const firstIsPortuguese = portuguesePattern.test(first);
		const secondIsPortuguese = portuguesePattern.test(second);
		const firstIsEnglish = englishPattern.test(first);
		const secondIsEnglish = englishPattern.test(second);

		if (firstIsPortuguese && secondIsEnglish && !secondIsPortuguese) {
			return locale === 'pt' ? first : second;
		}
		if (secondIsPortuguese && firstIsEnglish && !firstIsPortuguese) {
			return locale === 'pt' ? second : first;
		}
		return undefined;
	}
	protected inputType(control: ToolControl): string {
		return control.type === 'password' && this.revealed().includes(control.key)
			? 'text'
			: control.type;
	}
	protected downloadPrimary(): void {
		this.download(this.result()?.artifacts?.length === 1 ? 0 : undefined);
	}
	protected async copy(): Promise<void> {
		const result = this.result();
		if (!result) {
			return;
		}
		try {
			await navigator.clipboard.writeText(result.output);
			this.feedback.set(
				this.transloco.translate('common.result_copied', {}, this.translationState().locale),
			);
		} catch {
			this.feedback.set(
				this.transloco.translate(
					'common.copy_failed_select_the_result_and_copy_it_',
					{},
					this.translationState().locale,
				),
			);
		}
	}
	protected download(artifactIndex?: number): void {
		const result = this.result();
		if (!result) {
			return;
		}
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
		this.feedback.set(
			this.transloco.translate('common.export_started', {}, this.translationState().locale),
		);
	}
}
