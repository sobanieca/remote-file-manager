export const readSetting = (key, fallback) => {
  try {
    return globalThis.localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

export const writeSetting = (key, value) => {
  try {
    globalThis.localStorage.setItem(key, value)
  } catch {
    return
  }
}
