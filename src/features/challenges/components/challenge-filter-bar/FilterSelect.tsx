'use client'

import { FilterSelect as SharedFilterSelect } from '@/shared/ui'

type FilterSelectProps = {
  id: string
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  isDirty: boolean
  isActive: boolean
  wrapperClassName?: string
  onChange: (value: string) => void
}

export default function FilterSelect({
  id,
  label,
  value,
  options,
  isActive,
  wrapperClassName = '',
  onChange,
}: FilterSelectProps) {
  return (
    <div className={`flex-1 min-w-[140px] ${wrapperClassName}`}>
      <label htmlFor={id} className="sr-only">{label}</label>
      <SharedFilterSelect
        value={value}
        defaultValue="all"
        onChange={onChange}
        placeholder={label}
        active={isActive}
        clearable
        className="w-full sm:w-full"
        options={options}
      />
    </div>
  )
}
