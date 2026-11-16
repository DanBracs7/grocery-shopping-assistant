import { test, expect } from '@playwright/test';

// Opens a page and records console problems and external network requests.
async function open(page, path) {
  const problems = [];
  const external = [];
  page.on('console', (m) => {
    const t = m.text();
    if (m.type() === 'error') problems.push(`console.error: ${t}`);
    if (m.type() === 'warning' && /unknown|unregistered|not registered|may not update/i.test(t))
      problems.push(`warning: ${t}`);
  });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('request', (r) => {
    if (!r.url().startsWith('https://localhost:4173') && !r.url().startsWith('data:'))
      external.push(r.url());
  });
  await page.goto(path);
  if (path !== '/') await page.waitForFunction(() => document.querySelector('a-scene')?.hasLoaded);
  await page.waitForTimeout(1500); // let fonts and first frames arrive
  return { problems, external };
}

const shot = (page, name) => page.screenshot({ path: `test-results/${name}.png` });

test.use({ deviceScaleFactor: 2 });

test('landing page', async ({ page }) => {
  const { problems, external } = await open(page, '/');
  await expect(page.locator('a.stage')).toHaveCount(2);
  expect(problems).toEqual([]);
  expect(external).toEqual([]);
  await shot(page, 'landing');
});

test('stage 1: three hint cards, head-locked one is in the camera', async ({ page }) => {
  const { problems, external } = await open(page, '/stage-1/');
  await expect(page.locator('[hint-card]')).toHaveCount(3);
  expect(await page.evaluate(() => !!document.querySelector('[camera] #message-card'))).toBe(true);
  expect(await page.evaluate(() => !!document.querySelector('#plant #plant-card'))).toBe(true);
  expect(
    await page.evaluate(() => document.querySelector('#timer-card').parentElement.tagName),
  ).toBe('A-SCENE');
  expect(problems).toEqual([]);
  expect(external).toEqual([]);
  await shot(page, 'stage-1');
});

test('stage 2: show/dismiss, confirm, step through', async ({ page }) => {
  const { problems, external } = await open(page, '/stage-2/?debug=1');
  const visible = (id) =>
    page.evaluate((i) => document.querySelector(i).getAttribute('visible'), id);
  const click = (id) => page.evaluate((i) => document.querySelector(i).emit('click'), id);
  const interactive = (id) =>
    page.evaluate((i) => document.querySelector(i).classList.contains('interactive'), id);

  // Plant: show / dismiss
  expect(await visible('#plant-hint')).toBe(false);
  expect(await interactive('#plant-close')).toBe(false); // hidden buttons are not hittable
  await click('#plant');
  expect(await visible('#plant-hint')).toBe(true);
  expect(await interactive('#plant-close')).toBe(true);
  await click('#plant-close');
  expect(await visible('#plant-hint')).toBe(false);
  expect(await interactive('#plant-close')).toBe(false);
  // clicking a button must not re-trigger the plant: the hint stayed closed above.

  // Kettle: propose -> confirm -> boiling -> ready
  await page.evaluate(() =>
    document.querySelector('#kettle').setAttribute('kettle-assistant', 'delay', 300),
  );
  await click('#kettle');
  expect(await interactive('#kettle-start')).toBe(true);
  await click('#kettle-start');
  const state = () =>
    page.evaluate(() => document.querySelector('#kettle').components['kettle-assistant'].state);
  expect(await state()).toBe('boiling');
  await click('#kettle-close'); // closing does not cancel
  expect(await state()).toBe('boiling');
  await expect.poll(state).toBe('ready');
  expect(await visible('#kettle-hint')).toBe(true); // assistant reports back

  // Recipe: Next ... Done
  await click('#recipe');
  const label = () =>
    page.evaluate(() => document.querySelector('#recipe-next').getAttribute('hint-button').label);
  for (let i = 0; i < 3; i++) await click('#recipe-next');
  expect(await label()).toBe('Done');
  await click('#recipe-next');
  expect(await visible('#recipe-hint')).toBe(false);

  await click('#plant');
  await click('#kettle-close');
  await shot(page, 'stage-2');
  expect(problems).toEqual([]);
  expect(external).toEqual([]);
});

test('stage 2: gaze mode swaps the input device', async ({ page }) => {
  const { problems } = await open(page, '/stage-2/?input=gaze');
  await expect(page.locator('[gaze-cursor]')).toHaveCount(1);
  await expect(page.locator('[laser-controls]')).toHaveCount(0);
  expect(problems).toEqual([]);
  await shot(page, 'stage-2-gaze');
});

test('left thumbstick walks the rig; VR and AR buttons are enabled', async ({ page }) => {
  await open(page, '/stage-2/');
  expect(
    await page.evaluate(() => document.querySelector('a-scene').getAttribute('xr-mode-ui').XRMode),
  ).toBe('xr');
  await expect(page.locator('.a-enter-ar-button')).toHaveCount(1); // hidden where AR is unsupported
  const z = () => page.evaluate(() => document.querySelector('#rig').object3D.position.z);
  expect(await z()).toBe(0);
  // Push the stick forward for a moment: the user looks towards -Z, so z must decrease.
  await page.evaluate(() =>
    document.querySelector('#left-hand').emit('thumbstickmoved', { x: 0, y: -1 }),
  );
  await page.waitForTimeout(500);
  await page.evaluate(() =>
    document.querySelector('#left-hand').emit('thumbstickmoved', { x: 0, y: 0 }),
  );
  expect(await z()).toBeLessThan(-0.2);
});
