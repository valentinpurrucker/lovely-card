// Real card bundle + small HA frontend substitutes, exclusively for development.
const params = new URLSearchParams(location.search);
const type = params.get('mode') === 'original' ? 'bubble-card' : 'lovely-card';
const stamp = new Date().toISOString();
const entity = (id, state, attributes) => ({ entity_id:id, state, attributes, last_changed:stamp, last_updated:stamp, context:{} });
const states = {
  'light.living_room':entity('light.living_room','on',{friendly_name:'Living room',brightness:170,rgb_color:[255,211,143],hs_color:[38,44],color_mode:'hs',supported_color_modes:['hs','color_temp'],color_temp_kelvin:3200,min_color_temp_kelvin:2000,max_color_temp_kelvin:6500,supported_features:40}),
  'light.bedroom':entity('light.bedroom','off',{friendly_name:'Bedroom',brightness:0,supported_features:40}),
  'switch.reading':entity('switch.reading','on',{friendly_name:'Reading light',icon:'mdi:lightbulb-outline'}),
  'sensor.temperature':entity('sensor.temperature','21.5',{friendly_name:'Temperature',device_class:'temperature',unit_of_measurement:'°C'}),
  'sensor.humidity':entity('sensor.humidity','46',{friendly_name:'Humidity',device_class:'humidity',unit_of_measurement:'%'}),
  'person.alex':entity('person.alex','home',{friendly_name:'Alex',entity_picture:'/docs/preview/avatar.svg'}),
  'cover.blinds':entity('cover.blinds','open',{friendly_name:'Window blinds',device_class:'blind',current_position:65,current_tilt_position:30,supported_features:255}),
  'climate.home':entity('climate.home','heat',{friendly_name:'Living room',temperature:22,current_temperature:21.5,min_temp:7,max_temp:30,target_temp_step:.5,hvac_modes:['off','heat','cool','auto'],hvac_action:'heating',supported_features:385}),
  'water_heater.tank':entity('water_heater.tank','eco',{friendly_name:'Hot water',temperature:55,current_temperature:51,min_temp:30,max_temp:70,operation_mode:'eco',operation_list:['off','eco','performance'],supported_features:3}),
  'humidifier.home':entity('humidifier.home','on',{friendly_name:'Humidifier',humidity:50,current_humidity:46,min_humidity:30,max_humidity:80,mode:'auto',available_modes:['auto','sleep'],supported_features:1}),
  'input_select.scene':entity('input_select.scene','Evening',{friendly_name:'Room scene',options:['Evening','Reading','Relax','Away']}),
  'media_player.speaker':entity('media_player.speaker','playing',{friendly_name:'Living room speaker',media_title:'A quieter afternoon',media_artist:'Home sessions',volume_level:.45,is_volume_muted:false,media_duration:240,media_position:85,media_position_updated_at:stamp,supported_features:65535,source:'Home sessions',source_list:['Home sessions','Radio']}),
  'alarm_control_panel.home':entity('alarm_control_panel.home','disarmed',{friendly_name:'Home alarm',code_format:'number',code_arm_required:true,supported_features:63}),
  'calendar.home':entity('calendar.home','on',{friendly_name:'Home calendar'})
};

const iconShapes = {
  bulb:'<path d="M9 18h6M10 21h4M8 14c-5-5-1-11 4-11s9 6 4 11c-1 1-1 2-1 3H9c0-1 0-2-1-3Z"/>',
  home:'<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/>',
  climate:'<path d="M10 14V5a2 2 0 0 1 4 0v9a5 5 0 1 1-4 0Z"/><path d="M12 9v9"/>',
  music:'<path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>',
  cover:'<path d="M4 3h16v18H4ZM4 7h16M4 11h16M4 15h16M15 3v15"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  drop:'<path d="M12 3S5 11 5 15a7 7 0 0 0 14 0c0-4-7-12-7-12Z"/>',
  person:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 11h18M7 15h3M14 15h3"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
};
class Icon extends HTMLElement {
  constructor(){super();this.attachShadow({mode:'open'});}
  static observedAttributes=['icon'];
  set icon(v){this.setAttribute('icon',v || 'mdi:home-outline');}
  get icon(){return this.getAttribute('icon');}
  connectedCallback(){this.draw();}
  attributeChangedCallback(){this.draw();}
  draw(){
    const name=this.icon||'';
    let shape = name.includes('minus')?'<path d="M5 12h14"/>':name.includes('plus')?'<path d="M5 12h14M12 5v14"/>':name.includes('chevron-up')?'<path d="m6 15 6-6 6 6"/>':name.includes('chevron-down')?'<path d="m6 9 6 6 6-6"/>':name.includes('chevron-left')?'<path d="m15 6-6 6 6 6"/>':name.includes('chevron-right')?'<path d="m9 6 6 6-6 6"/>':name.includes('pause')?'<path d="M8 5v14M16 5v14"/>':name.includes('play')?'<path d="m8 4 12 8-12 8Z"/>':name.includes('skip')?'<path d="m5 5 11 7-11 7ZM19 5v14"/>':name.includes('stop')?'<rect x="6" y="6" width="12" height="12" rx="1"/>':name.includes('volume')?'<path d="M3 9h4l5-5v16l-5-5H3ZM16 8a6 6 0 0 1 0 8M19 5a10 10 0 0 1 0 14"/>':name.includes('power')?'<path d="M12 2v10M6 5a9 9 0 1 0 12 0"/>':name.includes('close')?'<path d="m6 6 12 12M6 18 18 6"/>':null;
    if(!shape){const key=name.includes('light')?'bulb':name.includes('water')||name.includes('humid')?'drop':name.includes('thermo')?'climate':name.includes('blind')||name.includes('window')?'cover':name.includes('account')?'person':name.includes('calendar')?'calendar':name.includes('alarm')||name.includes('lock')?'lock':name.includes('music')||name.includes('speaker')?'music':'home';shape=iconShapes[key];}
    this.shadowRoot.innerHTML=`<style>:host{display:inline-flex;align-items:center;justify-content:center;width:var(--mdc-icon-size,24px);height:var(--mdc-icon-size,24px)}svg{width:var(--mdc-icon-size,24px);height:var(--mdc-icon-size,24px);fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}</style><svg viewBox="0 0 24 24" aria-hidden="true">${shape}</svg>`;
  }
}
customElements.define('ha-icon',Icon);
customElements.define('ha-state-icon',class extends Icon {});
customElements.define('ha-card',class extends HTMLElement {
  constructor(){super();this.attachShadow({mode:'open'}).innerHTML='<style>:host{display:block;position:relative}</style><slot></slot>';}
});
customElements.define('ha-ripple',class extends HTMLElement {startPress(){}endPress(){}});
customElements.define('ha-picker-field',class extends HTMLElement {});
customElements.define('ha-select',class extends HTMLElement {
  constructor(){super();this.attachShadow({mode:'open'}).innerHTML='<style>:host{position:relative}ha-dropdown:not([open]){display:none}ha-dropdown{position:absolute;top:100%;inset-inline-end:0;display:block;background:var(--card-background-color);border:1px solid var(--divider-color);padding:8px;z-index:30;width:200px;pointer-events:auto}</style><div class="mdc-select"><ha-dropdown><ha-menu class="mdc-select__menu"><slot></slot></ha-menu></ha-dropdown></div>';}
  get updateComplete(){return Promise.resolve(true);}
  connectedCallback(){
    this.addEventListener('click',event=>{
      const item=event.target.closest('ha-dropdown-item');if(!item)return;
      const dropdown=this.shadowRoot.querySelector('ha-dropdown');
      if(dropdown.dispatchEvent(new CustomEvent('wa-select',{detail:{item},cancelable:true,bubbles:true}))){
        this.dispatchEvent(new CustomEvent('selected',{detail:{value:item.value}}));dropdown.open=false;
      }
    });
  }
});
customElements.define('ha-dropdown',class extends HTMLElement {
  get updateComplete(){return Promise.resolve(true);}
  get open(){return this.hasAttribute('open');}
  set open(value){this.toggleAttribute('open',!!value);if(!value)this.dispatchEvent(new Event('wa-after-hide'));}
  connectedCallback(){this.addEventListener('click',e=>{if(e.target.closest('[slot="trigger"]')){this.toggleAttribute('open');this.dispatchEvent(new Event(this.hasAttribute('open')?'wa-show':'wa-hide'));}});}
  show(){this.setAttribute('open','');}hide(){this.removeAttribute('open');}
});
customElements.define('ha-dropdown-item',class extends HTMLElement {});

const calls=[];
let hass;
function refresh(){document.querySelectorAll(`${type},bubble-card,lovely-card`).forEach(card=>{card.hass={...hass};});}
function toast(text){const t=document.getElementById('toast');t.textContent=text;t.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('visible'),2000);}
hass = {
  states, entities:{}, devices:{}, areas:{}, services:{}, panels:{}, language:'en', selectedLanguage:'en', locale:{language:'en',number_format:'language',time_format:'24',first_weekday:'monday'}, themes:{darkMode:true,themes:{},default_theme:'default'}, user:{name:'Alex',is_admin:false}, auth:{data:{access_token:'preview'}}, config:{version:'2026.10.0',time_zone:'UTC',unit_system:{temperature:'°C'},components:[]},
  localize:()=>undefined,
  formatEntityState:(s,state=s.state)=>`${state}${s.attributes.unit_of_measurement?' '+s.attributes.unit_of_measurement:''}`,
  formatEntityAttributeValue:(s,a,value=s.attributes[a])=>String(value??''),
  hassUrl:p=>p,
  callService:async(domain,service,data)=>{
    calls.push({domain,service,data});
    const s=states[data.entity_id];
    if(s){if(service==='toggle')s.state=s.state==='on'?'off':'on';if(service==='set_temperature')s.attributes.temperature=data.temperature;if(service==='set_humidity')s.attributes.humidity=data.humidity;if(service==='select_option')s.state=data.option;if(service==='turn_on'){s.state='on';Object.assign(s.attributes,data);}if(service==='volume_set')s.attributes.volume_level=data.volume_level;s.last_updated=new Date().toISOString();}
    toast(`${domain}.${service}`);refresh();
  },
  callWS:async message=>message.type==='bubble_card_tools/list_modules'?{files:[]}:message.type.includes('icon')?{resources:{light:{default:'mdi:lightbulb-outline'},sensor:{default:'mdi:thermometer'}}}:[],
  callApi:async()=>{
    const now=new Date();const later=new Date(now.getTime()+60*60*1000);const end=new Date(later.getTime()+45*60*1000);
    return [{summary:'Time for a walk',start:{dateTime:later.toISOString()},end:{dateTime:end.toISOString()},description:'A little break outside'},{summary:'Dinner with friends',start:{dateTime:new Date(now.getTime()+4*3600000).toISOString()},end:{dateTime:new Date(now.getTime()+5*3600000).toISOString()}}];
  },
  connection:{subscribeMessage:async()=>()=>{},subscribeEvents:async()=>()=>{}}
};
document.querySelector('home-assistant').hass=hass;
// Home Assistant normally consumes the standard action event from custom cards.
document.addEventListener('hass-action',event=>{
  const config=event.detail?.config;const action=config?.[`${event.detail?.action}_action`];
  if(action?.action==='toggle')hass.callService(config.entity.split('.')[0],'toggle',{entity_id:config.entity});
  else if(action?.action==='more-info')toast(`More info: ${config.entity}`);
});
window.__gallery={hass,calls,cards:[],type};
window.loadCardHelpers=async()=>({
  createCardElement:config=>{const card=document.createElement(config.type?.replace('custom:','')||'div');card.setConfig?.(config);return card;},
  createHuiElement:config=>{const card=document.createElement(config.type?.replace('custom:','')||'div');card.setConfig?.(config);return card;},
});

async function script(src){await new Promise((resolve,reject)=>{const el=document.createElement('script');el.src=src;el.onload=resolve;el.onerror=reject;document.head.append(el);});}
if(params.get('order')==='original-first')await script('/docs/preview/upstream.js');
await script('/dist/lovely-card.js');
if(params.get('order')==='lovely-first'||type==='bubble-card')await script('/docs/preview/upstream.js');

const samples = [
  ['Button','switch · state · name',[
    {card_type:'button',button_type:'switch',entity:'switch.reading',name:'Reading light',icon:'mdi:lightbulb-outline',show_state:true},
    {card_type:'button',button_type:'state',entity:'sensor.temperature',name:'Room temperature',icon:'mdi:thermometer',show_state:true},
    {card_type:'button',button_type:'name',name:'Welcome home',icon:'mdi:home-outline'},
  ]],
  ['Sliders','brightness · color · custom',[
    {card_type:'button',button_type:'slider',entity:'light.living_room',name:'Living room',icon:'mdi:lightbulb-outline',show_state:true},
    {card_type:'button',button_type:'slider',entity:'light.living_room',name:'Color',icon:'mdi:palette-outline',light_slider_type:'hue'},
    {card_type:'button',button_type:'slider',entity:'sensor.humidity',name:'Humidity',icon:'mdi:water-percent',min_value:0,max_value:100,read_only_slider:true,show_state:true},
  ]],
  ['Cover','position · tilt',[
    {card_type:'cover',entity:'cover.blinds',name:'Window blinds',icon:'mdi:blinds',show_state:true},
    {card_type:'cover',entity:'cover.blinds',name:'Tilt controls',icon:'mdi:blinds',show_state:true,tilt_buttons:'bottom',card_layout:'large',rows:2},
  ]],
  ['Climate','temperature · mode',[
    {card_type:'climate',entity:'climate.home',name:'Living room',icon:'mdi:thermometer',show_state:true,sub_button:[{entity:'climate.home',select_attribute:'hvac_modes',show_arrow:true}]},
    {card_type:'climate',entity:'water_heater.tank',name:'Hot water',icon:'mdi:water-boiler',show_state:true},
    {card_type:'climate',entity:'humidifier.home',name:'Humidifier',icon:'mdi:air-humidifier',show_state:true},
  ]],
  ['Select','menu · alarm keypad',[
    {card_type:'select',entity:'input_select.scene',name:'Room scene',icon:'mdi:home-outline',show_state:true},
    {card_type:'select',entity:'alarm_control_panel.home',select_attribute:'alarm_modes',name:'Home alarm',icon:'mdi:shield-lock-outline',show_state:true},
  ]],
  ['Sub-buttons','icons · image · group · bottom',[
    {card_type:'button',button_type:'state',entity:'light.living_room',name:'Living room',icon:'mdi:home-outline',card_layout:'large',rows:2,sub_button:{main:[{entity:'sensor.temperature',show_state:true,show_background:true},{entity:'sensor.humidity',show_state:true,show_background:true}],bottom:[{entity:'input_select.scene',name:'Scene',show_name:true,show_state:true,sub_button_type:'select',show_arrow:true},{entity:'light.bedroom',icon:'mdi:lightbulb-outline',tap_action:{action:'toggle'}}]}},
    {card_type:'sub-buttons',card_layout:'large',rows:1,sub_button:{bottom:[{entity:'person.alex',show_state:true,show_entity_picture:true},{group:[{entity:'light.living_room',icon:'mdi:lightbulb-outline'},{entity:'light.bedroom',icon:'mdi:lightbulb-outline'}]}]}},
    {card_type:'sub-buttons',card_layout:'large',rows:1,sub_button:{bottom:[{entity:'light.living_room',sub_button_type:'slider',always_visible:true,show_button_info:true,name:'Brightness',show_name:true}]}},
  ]],
  ['Media player','playback · volume · source',[
    {card_type:'media-player',entity:'media_player.speaker',name:'Living room',icon:'mdi:speaker',show_state:true,show_name:true,show_attribute:true,attribute:'media_title'},
    {card_type:'media-player',entity:'media_player.speaker',name:'Volume',icon:'mdi:music',show_state:true,hide:{power_button:false},sub_button:[{entity:'media_player.speaker',select_attribute:'source_list',show_arrow:true}]},
  ]],
  ['Calendar','events · date badges',[
    {card_type:'calendar',entities:[{entity:'calendar.home',color:'#85cdb5'}],days:3,limit:3,rows:3},
  ]],
  ['Separator','label · line · control',[
    {card_type:'separator',name:'Living spaces',icon:'mdi:home-outline',sub_button:[{entity:'sensor.temperature',show_state:true}]},
  ]],
  ['Empty column','invisible layout helper',[
    {card_type:'empty-column',rows:1},
  ]],
];

const gallery=document.getElementById('gallery');
function makeCard(config,parent){const card=document.createElement(type);const cfg={type:`custom:${type}`,scrolling_effect:false,...structuredClone(config)};if(cfg.card_type==='horizontal-buttons-stack')card.editor=true;card.setConfig(cfg);parent.appendChild(card);card.hass=hass;window.__gallery.cards.push(card);return card;}
for(const [label,note,configs] of samples){
  const section=document.createElement('section');section.className='example';section.dataset.sample=label;
  const heading=document.createElement('div');heading.className='example-label';heading.innerHTML=`<span>${label}</span><span>${note}</span>`;
  const stage=document.createElement('div');stage.className='stage';
  if(label==='Empty column'){stage.classList.add('spacer-outline');}
  section.append(heading,stage);gallery.append(section);
  configs.forEach(cfg=>makeCard(cfg,stage));
  if(label==='Empty column'){const text=document.createElement('span');text.className='spacer-caption';text.textContent='Reserves space without adding a visible card.';stage.append(text);}
}

const popSection=document.createElement('section');popSection.className='example';popSection.dataset.sample='Pop-up';
popSection.innerHTML='<div class="example-label"><span>Pop-up</span><span>all styles · responsive modes</span></div><div class="stage"><button class="popup-button" id="open-popup">Open living room <small>Cards, close button and foreground clipping</small></button><div class="popup-variants"><button data-popup-style="classic">Classic</button><button data-popup-style="bubble">Bubble</button><button data-popup-style="home-assistant">Home Assistant</button></div></div>';
gallery.append(popSection);
const popupConfig={scrolling_effect:false,card_type:'pop-up',hash:'#lovely-preview',name:'Living room',icon:'mdi:home-outline',button_type:'name',popup_mode:'centered',popup_style:'classic',cards:[{type:`custom:${type}`,card_type:'button',button_type:'slider',entity:'light.living_room',name:'Living room',icon:'mdi:lightbulb-outline'},{type:`custom:${type}`,card_type:'climate',entity:'climate.home',name:'Temperature',icon:'mdi:thermometer'},{type:`custom:${type}`,card_type:'media-player',entity:'media_player.speaker',name:'Music',icon:'mdi:music'}]};
const popup=makeCard(popupConfig,document.body);popup.id='gallery-popup';
window.__gallery.popup=popup;
document.getElementById('open-popup').onclick=()=>{location.hash=popupConfig.hash;window.dispatchEvent(new CustomEvent('location-changed'));};
document.querySelectorAll('[data-popup-style]').forEach(button=>button.onclick=()=>{popupConfig.popup_style=button.dataset.popupStyle;popup.setConfig(structuredClone(popupConfig));popup.hass={...hass};document.getElementById('open-popup').click();});

const footer=document.createElement('section');footer.className='example';footer.dataset.sample='Horizontal buttons stack';footer.innerHTML='<div class="example-label"><span>Horizontal buttons stack</span><span>navigation · active state</span></div><div class="stage"></div>';gallery.append(footer);
makeCard({card_type:'horizontal-buttons-stack',auto_order:false,highlight_current_view:true,hide_gradient:true,rise_animation:false,'1_name':'Home','1_icon':'mdi:home-outline','1_link':'#lovely-preview','2_name':'Lights','2_icon':'mdi:lightbulb-outline','2_link':'#lights','3_name':'Music','3_icon':'mdi:music','3_link':'#music'},footer.querySelector('.stage'));

document.getElementById('lovely-mode').classList.toggle('active',type==='lovely-card');
document.getElementById('original-mode').classList.toggle('active',type==='bubble-card');
document.getElementById('lovely-mode').onclick=()=>{params.set('mode','lovely');location.search=params;};
document.getElementById('original-mode').onclick=()=>{params.set('mode','original');location.search=params;};
document.getElementById('theme').onclick=()=>{const light=document.documentElement.classList.toggle('light');document.getElementById('theme').textContent=light?'Dark mode':'Light mode';hass.themes={...hass.themes,darkMode:!light};refresh();};
document.querySelector('.editor-panel').addEventListener('toggle',event=>{if(event.target.open&&!document.getElementById('editor').firstChild){const editor=document.createElement(`${type}-editor`);editor.hass=hass;editor.setConfig({type:`custom:${type}`,card_type:'button',button_type:'switch',entity:'switch.reading'});document.getElementById('editor').append(editor);}});
document.getElementById('status').textContent=`${type==='lovely-card'?'Lovely Card':'Original Bubble Card'} · All 11 card types loaded`;
window.__gallery.ready=true;
