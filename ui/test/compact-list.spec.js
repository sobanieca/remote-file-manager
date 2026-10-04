import { expect, test } from 'imp/test'

const LIST = 'rfm-file-pane >>> rfm-file-list'

test('shows one compact row per entry on a phone', async ({ page }) => {
  await page.setViewport({ width: 390, height: 844 })
  await page.waitForSelector(`${LIST} >>> rfm-entry-name[data-path="README.md"]`)
  const rowHeight = await page.$eval(
    `${LIST} >>> [role="listitem"]`,
    (row) => row.getBoundingClientRect().height,
  )
  expect(rowHeight < 60).toEqual(true)
  await expect(page).toHaveAccessibleControls()
})

test('selects an entry with its checkbox', async ({ page }) => {
  await page.click(`${LIST} >>> input[aria-label="Select README.md"]`)
  await page.waitForSelector(`${LIST} >>> .row.selected`)
  expect(await page.$eval(`${LIST} >>> input[aria-label="Select all"]`, (box) => box.indeterminate))
    .toEqual(true)
})

test('returns to the table on a wide screen', async ({ page }) => {
  await page.setViewport({ width: 1280, height: 800 })
  await page.waitForSelector('rfm-file-pane >>> table')
})
