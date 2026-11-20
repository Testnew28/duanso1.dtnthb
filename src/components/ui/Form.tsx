import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/format';

interface FieldShell {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
}

export function Field({
  label,
  name,
  required,
  hint,
  error,
  className,
  children,
}: FieldShell & { children: ReactNode }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={name} className="block text-sm font-semibold text-ink">
        {label} {required && <span className="text-thocam-600">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs leading-relaxed text-ink/55">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-thocam-700">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass =
  'w-full min-h-[44px] rounded-xl border border-wood-300/70 bg-rice px-3.5 py-2.5 text-[15px] text-ink shadow-sm outline-none transition placeholder:text-ink/40 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20';

export function TextField({
  label,
  name,
  hint,
  error,
  className,
  required,
  ...props
}: FieldShell & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} name={name} required={required} hint={hint} error={error} className={className}>
      <input
        id={name}
        name={name}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn(inputClass, error && 'border-thocam-500 focus:border-thocam-600')}
        {...props}
      />
    </Field>
  );
}

export function TextAreaField({
  label,
  name,
  hint,
  error,
  className,
  required,
  rows = 3,
  ...props
}: FieldShell & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} name={name} required={required} hint={hint} error={error} className={className}>
      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn(inputClass, 'py-2.5', error && 'border-thocam-500')}
        {...props}
      />
    </Field>
  );
}

export function SelectField({
  label,
  name,
  hint,
  error,
  className,
  required,
  children,
  ...props
}: FieldShell & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Field label={label} name={name} required={required} hint={hint} error={error} className={className}>
      <select
        id={name}
        name={name}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn(inputClass, 'appearance-none bg-[length:16px] pr-9', error && 'border-thocam-500')}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B4A2F' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
        }}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
}

export function CheckboxField({
  name,
  label,
  checked,
  onChange,
  error,
  children,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-wood-300 text-forest-600 accent-forest-600"
        />
        <span>
          <span className="font-semibold text-ink">{label}</span>
          {children && <span className="mt-1 block text-xs text-ink/60">{children}</span>}
        </span>
      </label>
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-thocam-700">
          {error}
        </p>
      )}
    </div>
  );
}
