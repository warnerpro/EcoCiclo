export const getFileName = (path: string) => {
  const parts = path.split('/')

  return parts.at(-1)!
}
