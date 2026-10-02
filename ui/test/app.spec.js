import { expect, test } from 'imp/test'

const textOf = (page, selector) => page.$eval(selector, (node) => node.textContent.trim())

test('lists the served directory', async ({ page }) => {
  await page.waitForSelector('rfm-entry-name[data-path="README.md"]')
  expect(await textOf(page, 'rfm-entry-name[data-path="docs"] >>> a')).toEqual('docs')
  await expect(page).toHaveAccessibleControls()
})

test('moves the cursor with the keyboard and opens a folder', async ({ page }) => {
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await page.waitForSelector('rfm-entry-name[data-path="docs/guide.md"]')
  expect(await page.evaluate(() => location.hash)).toEqual('#/?path=docs')
  await page.keyboard.press('Backspace')
  await page.waitForSelector('rfm-entry-name[data-path="README.md"]')
})

test('renders markdown with its tables', async ({ page }) => {
  await page.click('rfm-entry-name[data-path="README.md"] >>> a')
  await page.waitForSelector('rfm-file-details')
  await page.waitForSelector('rfm-file-details >>> ::-p-text(Starts the server)')
  expect(await page.evaluate(() => location.hash)).toEqual('#/view?path=README.md')
})

test('creates a folder through the dialog', async ({ page }) => {
  await page.evaluate(() => {
    location.hash = '#/'
  })
  await page.waitForSelector('rfm-entry-name[data-path="README.md"]')
  await page.click('rfm-file-pane >>> ::-p-aria(New folder[role="button"])')
  await page.waitForSelector('rfm-dialog-host >>> input')
  await page.type('rfm-dialog-host >>> input', 'reports')
  await page.keyboard.press('Enter')
  await page.waitForSelector('rfm-entry-name[data-path="reports"]')
})

test('finds files with Ctrl+P', async ({ page }) => {
  await page.keyboard.down('Control')
  await page.keyboard.press('p')
  await page.keyboard.up('Control')
  await page.waitForSelector('rfm-search-palette >>> input')
  await page.type('rfm-search-palette >>> input', 'guide')
  await page.waitForSelector('rfm-search-result')
  await page.keyboard.press('Enter')
  await page.waitForFunction(() => location.hash === '#/view?path=docs%2Fguide.md')
})
