const copyWithSelection = (text) => {
  const helper = document.createElement('textarea')
  helper.value = text
  helper.setAttribute('readonly', '')
  helper.style.position = 'fixed'
  helper.style.opacity = '0'
  document.body.append(helper)
  helper.select()
  try {
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    helper.remove()
  }
}

export const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return copyWithSelection(text)
  }
}
