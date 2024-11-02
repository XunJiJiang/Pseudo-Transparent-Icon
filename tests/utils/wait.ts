export const wait = async (time: number = 5) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(void 0)
    }, time)
  })
}
