export function useForm<T = any>(_opts?: any) {
  const values: Record<string, any> = { ...( _opts?.defaultValues || {} ) };
  const errors: Record<string, any> = {};
  return {
    register: (_name: string, _opts?: any) => ({ name: _name, onChange: () => {}, onBlur: () => {}, ref: () => {} }),
    handleSubmit: (fn: (v: any) => any) => (e?: any) => { e?.preventDefault?.(); return fn(values); },
    formState: { errors },
    setValue: (k: string, v: any) => { values[k] = v; },
    getValues: () => ({ ...values })
  } as any;
}


