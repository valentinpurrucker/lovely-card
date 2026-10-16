import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  args: ['--no-sandbox'],
});
const base = process.env.PREVIEW_URL || 'http://localhost:8124/docs/preview/';
const output = resolve('docs/preview');
await mkdir(output, { recursive: true });
let assertions = 0;
const check = (actual, expected, message) => { assert.deepEqual(actual, expected, message); assertions++; };

async function open(query = '', width = 1140) {
  const page = await browser.newPage({ viewport: { width, height: 1250 } });
  page.setDefaultTimeout(8000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', event => { if (event.type() === 'error') errors.push(event.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto(base + query);
  await page.waitForFunction(() => window.__gallery?.ready, { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  return { page, errors };
}

try {
  // Both installed resources must work regardless of Home Assistant's load order.
  for (const order of ['original-first', 'lovely-first']) {
    const { page, errors } = await open(`?order=${order}`);
    const registration = await page.evaluate(() => {
      const names = ['bubble-card', 'bubble-card-editor', 'ha-selector-bc_object', 'ha-selector-calendar_entity', 'ha-form-bc_group', 'ha-form-bc_cluster', 'lovely-card', 'lovely-card-editor', 'ha-selector-lc_object', 'ha-selector-lc_calendar_entity', 'ha-form-lc_group', 'ha-form-lc_cluster'];
      const original = document.createElement('bubble-card');
      original.setConfig({ type: 'custom:bubble-card', card_type: 'button', button_type: 'switch', entity: 'switch.reading' });
      document.querySelector('main').append(original);original.hass = window.__gallery.hass;
      const result = { defined: names.every(name => !!customElements.get(name)), originalRadius: getComputedStyle(original.elements.mainContainer).borderTopLeftRadius, lovelyRadius: getComputedStyle(window.__gallery.cards[0].elements.mainContainer).borderTopLeftRadius };
      original.remove();return result;
    });
    check(registration, { defined: true, originalRadius: '28px', lovelyRadius: '12px' }, `Independent registrations and styling: ${order}`);
    await page.locator('[data-sample="Button"] lovely-card').first().locator('.bubble-background').click();
    await page.waitForFunction(() => window.__gallery.calls.length > 0);
    check(await page.evaluate(() => window.__gallery.calls.filter(call => call.domain === 'switch' && call.service === 'toggle').length), 1, `Single action dispatch: ${order}`);
    check(errors, [], `No browser errors: ${order}`);
    await page.close();
  }

  const { page, errors } = await open();
  const types = await page.evaluate(() => [...new Set(window.__gallery.cards.map(card => card.config.card_type))].sort());
  check(types, ['button','calendar','climate','cover','empty-column','horizontal-buttons-stack','media-player','pop-up','select','separator','sub-buttons'].sort(), 'Every inherited card type is rendered');

  const corners = await page.evaluate(() => {
    const cards = window.__gallery.cards;
    const card = type => cards.find(c => c.config.card_type === type);
    const radius = element => getComputedStyle(element).borderTopLeftRadius;
    return {
      card:radius(cards[0].elements.mainContainer), icon:radius(cards[0].elements.iconContainer),
      climate:radius(card('climate').shadowRoot.querySelector('.bubble-climate-plus-button')),
      cover:radius(card('cover').shadowRoot.querySelector('.bubble-cover-button')),
      media:radius(card('media-player').shadowRoot.querySelector('.bubble-media-button')),
      subButton:radius(card('sub-buttons').shadowRoot.querySelector('.bubble-sub-button')),
      subSlider:radius(cards.find(c=>c.shadowRoot?.querySelector('.bubble-sub-button-slider.inline')).shadowRoot.querySelector('.bubble-sub-button-slider.inline')),
      image:radius(card('sub-buttons').shadowRoot.querySelector('.bubble-sub-button-image')),
      colorCursor:radius(cards.find(c=>c.config.light_slider_type === 'hue').shadowRoot.querySelector('.bubble-color-cursor')),
      calendar:radius(card('calendar').shadowRoot.querySelector('.bubble-day-chip')),
      event:radius(card('calendar').shadowRoot.querySelector('.bubble-event-color')),
      separator:radius(card('separator').shadowRoot.querySelector('.bubble-line')),
      navigation:radius(card('horizontal-buttons-stack').shadowRoot.querySelector('.bubble-button')),
    };
  });
  check(corners, { card:'12px',icon:'8px',climate:'8px',cover:'8px',media:'8px',subButton:'8px',subSlider:'8px',image:'4px',colorCursor:'2px',calendar:'8px',event:'2px',separator:'2px',navigation:'8px' }, 'Corner scale across all rendered component families');

  // Per-card and per-theme customization must still work.
  check(await page.evaluate(() => {
    const c=window.__gallery.cards[0];c.style.setProperty('--lovely-radius-card','6px');
    const customized=getComputedStyle(c.elements.mainContainer).borderTopLeftRadius;
    c.style.setProperty('--bubble-button-border-radius','10px');
    const upstreamOverride=getComputedStyle(c.elements.mainContainer).borderTopLeftRadius;
    c.style.removeProperty('--lovely-radius-card');c.style.removeProperty('--bubble-button-border-radius');
    return {customized,upstreamOverride};
  }), {customized:'6px',upstreamOverride:'10px'}, 'Lovely tokens and existing component overrides');

  // A real climate button must retain its service behavior.
  await page.locator('[data-sample="Climate"] lovely-card').first().locator('.bubble-climate-plus-button').first().click();
  await page.waitForFunction(() => window.__gallery.calls.some(call => call.service === 'set_temperature'));
  check(await page.evaluate(() => window.__gallery.calls.find(call => call.service === 'set_temperature').data.temperature), 22.5, 'Climate target changes');

  const select = page.locator('[data-sample="Select"] lovely-card').first();
  await select.locator('.bubble-background').click();
  await select.locator('ha-dropdown-item').filter({ hasText:'Reading' }).click();
  check(await page.evaluate(() => window.__gallery.hass.states['input_select.scene'].state), 'Reading', 'Select menu service behavior');

  // Alarm keypad is created on demand and is easy to miss in a CSS-only audit.
  const alarm = page.locator('[data-sample="Select"] lovely-card').nth(1);
  await alarm.locator('.bubble-background').click();
  await alarm.locator('ha-dropdown-item').first().click();
  await alarm.locator('.bubble-keypad').waitFor();
  check(await alarm.locator('.bubble-keypad-key').first().evaluate(el=>getComputedStyle(el).borderTopLeftRadius),'8px','Alarm keypad keys');
  await alarm.locator('[data-key="1"]').click();
  check(await alarm.locator('.bubble-keypad-dot').evaluate(el=>getComputedStyle(el).borderTopLeftRadius),'2px','Alarm code indicators');
  await alarm.locator('[data-key="back"]').click();await alarm.locator('[data-key="back"]').click();
  await page.evaluate(()=>{const c=window.__gallery.cards.find(c=>c.config.entity==='alarm_control_panel.home');c.elements.dropdownSelect.shadowRoot.querySelector('ha-dropdown').open=false;});
  await page.evaluate(()=>document.getElementById('toast').classList.remove('visible'));
  await page.waitForTimeout(250);

  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:resolve(output,'components.png'),fullPage:true});
  await page.locator('#theme').click();
  await page.screenshot({path:resolve(output,'components-light.png'),fullPage:true});
  await page.locator('#theme').click();

  for (const style of ['classic','bubble','home-assistant']) {
    for (const mode of ['default','fit-content','centered','adaptive-dialog']) {
    for (const width of [1140,390]) {
      await page.setViewportSize({width,height:900});
      await page.evaluate(({style,mode})=>{
        const popup=window.__gallery.popup;const config={...popup.config,popup_style:style,popup_mode:mode};
        popup.setConfig(config);popup.hass={...window.__gallery.hass};
        location.hash='#lovely-preview';window.dispatchEvent(new CustomEvent('location-changed'));
      },{style,mode});
      await page.waitForFunction(()=>window.__gallery.popup.popUp?.classList.contains('is-popup-opened'));
      await page.waitForTimeout(350);
      check(await page.evaluate(()=>getComputedStyle(window.__gallery.popup.popUp).borderTopLeftRadius),'16px',`Popup shell: ${style}/${mode} at ${width}`);
      check(await page.evaluate(()=>getComputedStyle(window.__gallery.popup.elements.closeButton).borderTopLeftRadius),'8px',`Popup close control: ${style}/${mode} at ${width}`);
      if(style==='home-assistant'&&mode==='adaptive-dialog')await page.screenshot({path:resolve(output,width===390?'popup-mobile.png':'popup.png'),fullPage:false});
      await page.locator('#gallery-popup .bubble-close-button').click();
      await page.waitForFunction(()=>location.hash==='');
    }
    }
  }

  // Compact screens and RTL must keep the same corner geometry and stay in bounds.
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>{document.documentElement.dir='rtl';});
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'No page overflow on a mobile RTL layout');
  await page.screenshot({path:resolve(output,'components-mobile-rtl.png'),fullPage:true});
  await page.evaluate(()=>{document.documentElement.dir='ltr';});
  await page.screenshot({path:resolve(output,'components-mobile.png'),fullPage:true});

  // The editor and Module Store also contain compact chips and action controls.
  const [editorCSS,moduleCSS]=await Promise.all(['src/editor/styles.css','src/modules/styles.css'].map(path=>readFile(path,'utf8')));
  const editorRadii=await page.evaluate(css=>{
    const probe=document.createElement('div');probe.style.cssText='position:fixed;left:-10000px';document.body.append(probe);
    const root=probe.attachShadow({mode:'open'});root.innerHTML=`<style>${css}</style><button class="remove-button"></button><span class="version-number">0.1.0</span><a class="bubble-badge">Preview</a><div class="store-refresh-button"></div><img class="author-avatar"><div class="bubble-progress-track"></div><div class="bubble-progress-bar"></div>`;
    const result=[...root.querySelectorAll('button,span,a,div,img')].map(el=>getComputedStyle(el).borderTopLeftRadius);probe.remove();return result;
  },editorCSS+moduleCSS);
  check(editorRadii,['8px','4px','8px','8px','4px','2px','2px'],'Editor and Module Store corner scale');
  check(errors, [], 'No browser errors during interaction and responsive checks');
  await page.close();
  const original=await open('?mode=original');
  await original.page.screenshot({path:resolve(output,'components-original.png'),fullPage:true});
  check(original.errors,[],'Original component comparison renders without errors');
  await original.page.close();
  console.log(`Browser checks passed (${assertions} assertions). Screenshots saved in docs/preview/.`);
} finally {
  await browser.close();
}
