import type { ClassValue } from 'svelte/elements'

export function tidyClassName(classNames: ClassValue): string {
  if (typeof classNames === 'string') {
    return classNames
  }

  if (Array.isArray(classNames)) {
    return classNames.filter(Boolean).join(' ')
  }

  if (typeof classNames === 'object' && classNames !== null) {
    return Object.entries(classNames)
      .filter(([, value]) => Boolean(value))
      .map(([key]) => key)
      .join(' ')
  }

  return ''
}
