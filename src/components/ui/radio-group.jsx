import React from 'react'
export function RadioGroup({ value, onValueChange, children, className='' }){
  return <div className={`grid gap-3 ${className}`}>{React.Children.map(children, child => React.cloneElement(child, { selectedValue: value, onChangeValue: onValueChange }))}</div>
}
export function RadioGroupItem({ value, label, selectedValue, onChangeValue }){
  const checked = selectedValue === value
  return (
    <label className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${checked ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:bg-gray-50'}`}>
      <input
        type="radio"
        className="h-4 w-4"
        checked={checked}
        onChange={() => onChangeValue(value)}
      />
      <span className="text-sm">{label}</span>
    </label>
  )
}
