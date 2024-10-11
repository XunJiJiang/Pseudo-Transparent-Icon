const createElement = (
  tag: string,
  opt?: { [key: string]: string },
  children?: HTMLElement[]
): HTMLElement => {
  const el = document.createElement(tag)
  if (opt)
    for (const key in opt) {
      el.setAttribute(key, opt[key])
    }
  if (children)
    children.forEach((child) => {
      el.appendChild(child)
    })
  return el
}

export default createElement
