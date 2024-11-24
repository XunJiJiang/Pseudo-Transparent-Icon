let i = 0

export const useId = () => {
  return `__id-::${i++}::__`
}
