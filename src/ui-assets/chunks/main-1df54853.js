/*! Third-party license notices: /file-explorer/LICENSES.txt */
const e=t=>t==null||typeof t==`boolean`?[]:Array.isArray(t)?t.flatMap(e):t instanceof DocumentFragment?[...t.childNodes]:t instanceof Node?[t]:typeof t==`string`||typeof t==`number`||typeof t==`bigint`?[document.createTextNode(String(t))]:[],t=/* @__PURE__ */ new WeakMap,n=(e,n)=>{let r=t.get(e);r?r.push(n):t.set(e,[n])},r=e=>{for(let n of e)if(t.has(n)||n.childNodes.length&&r([...n.childNodes]))return!0;return!1},i=(e,n)=>{let r=t.get(n);if(r){t.delete(n);for(let t of r)t(e);e.addCleanup(()=>{let e=t.get(n)??[];t.set(n,[...r,...e])})}for(let t=n.firstChild;t;t=t.nextSibling)i(e,t)},a=(e,t)=>{for(let n of t)i(e,n)},o=Object.freeze({...globalThis.__IMP_ENV__??{}}),s=[`debug`,`info`,`warn`,`error`],c={debug:`log`,info:`log`,warn:`warn`,error:`error`},l=()=>`warn`,u=e=>s.includes(e),d=()=>{let e=o.IMP_LOG_LEVEL;if(e===void 0)return l();let t=String(e).toLowerCase();return u(t)?t:(console.warn(`imp: IMP_LOG_LEVEL is '${e}' - expected one of ${s.join(`, `)}; using '${l()}'`),l())};let f=null;const p=()=>f??=d(),m=(e,t,n)=>{if(s.indexOf(e)<s.indexOf(p()))return;let r=c[e];if(!t){console[r](...n);return}let[i,...a]=n;typeof i==`string`?console[r](`${t}: ${i}`,...a):console[r](`${t}:`,...n)};Object.freeze({name:``,debug:(...e)=>m(`debug`,``,e),info:(...e)=>m(`info`,``,e),warn:(...e)=>m(`warn`,``,e),error:(...e)=>m(`error`,``,e)});const h=Object.freeze({name:`imp`,debug:(...e)=>m(`debug`,`imp`,e),info:(...e)=>m(`info`,`imp`,e),warn:(...e)=>m(`warn`,`imp`,e),error:(...e)=>m(`error`,`imp`,e)}),g=`ImpProviderLookup`,_=/^[^\s.]+(\.[^\s.]+)+$/,v=e=>_.test(e),y=(e,t,n)=>typeof e==`string`?v(e)?null:`${t} '${e}' must include a namespace - use dot-separated segments like '${n}'`:`${t} must be a namespaced string like '${n}'`,b=(e,t,n)=>{let r=null,i={kind:e,name:t,provide:(e,t)=>{r={value:e,provider:t}}};return n.dispatchEvent(new CustomEvent(g,{detail:i,bubbles:!0,composed:!0})),r},x=(e,t,n,r,i)=>{let a=i=>{let a=i.detail;a?.kind===e&&(a.collect?a.collect(t,n,r):a.name===t&&(i.stopImmediatePropagation(),a.provide(n,r)))};r.addEventListener(g,a),i.addCleanup(()=>{r.removeEventListener(g,a)})},S={collector:null,zones:/* @__PURE__ */ new Set,view:null},ee=e=>{e.ended||(e.ended=!0,S.view===e&&(S.view=null),S.collector?.viewEnded(e))},te=e=>{S.view&&ee(S.view);let t={page:e,ready:!1,ended:!1};return S.view=t,S.collector?.viewStarted(t),t},ne=e=>{e.ended||e.ready||(e.ready=!0,S.collector?.viewReady(e))},re=()=>{S.collector?.error()},ie=/^[a-z][a-z0-9]*(-[a-z0-9]+)+$/,ae=/* @__PURE__ */ new Set([`annotation-xml`,`color-profile`,`font-face`,`font-face-src`,`font-face-uri`,`font-face-format`,`font-face-name`,`missing-glyph`]),oe=[`loading`,`error`,`onMount`,`onRemove`],se=e=>typeof e==`string`?ie.test(e)?ae.has(e)?`component name '${e}' is reserved by the HTML standard - pick another name`:null:`component name '${e}' must be lowercase with at least one dash - like 'my-app-profile'`:`component name must be a dash-separated string like 'my-app-profile'`,ce=e=>{let t=se(e);if(t)throw Error(`imp: ${t}`)},le=(e,t)=>{if(!t||typeof t!=`object`||typeof t.setup!=`function`)throw Error(`imp: component '${e}' needs a definition object with a setup function returning its DOM`);for(let n of oe)if(t[n]!==void 0&&typeof t[n]!=`function`)throw Error(`imp: component '${e}': '${n}' must be a function`);if(t.styles!==void 0&&typeof t.styles!=`string`)throw Error(`imp: component '${e}': 'styles' must be a CSS string`)},ue=`ComponentError`,de=(e,t)=>{e.dispatchEvent(new CustomEvent(ue,{detail:{error:t,source:e},bubbles:!0,composed:!0,cancelable:!0}))&&(h.error(`component '${e.localName}' failed to mount`,t),re())},C=Symbol(`imp.component.args`),fe=Symbol(`imp.component.mounted`),pe=Symbol(`imp.component.generation`),me=Symbol(`imp.component.scope`),he=Symbol(`imp.component.errored`),ge=Symbol(`imp.component.self`),_e=Symbol(`imp.component.abort`),ve=Symbol(`imp.component.loadingContent`),ye=Symbol(`imp.component.loadingMayBeSkipped`),be=Symbol(`imp.component.mount`);let xe=null;const Se=e=>{let t=[e];for(;t.length;){let e=t.pop();if(!e.isConnected||e[fe])continue;let n=[];xe=n;try{e[be]()}finally{xe=null}for(let e=n.length-1;e>=0;e--)t.push(n[e])}},Ce=/* @__PURE__ */ new WeakSet,we=(e,t)=>t(),Te=(e,t)=>{e.shadowRoot.replaceChildren(...t)},Ee=(t,n)=>{let i=e(we(t,()=>n.loading?.(...t[C])));return r(i)&&!Ce.has(n)&&(Ce.add(n),h.warn(`component '${t.localName}': loading content is bound to state, so it renders empty and never updates - loading is built before the component mounts and its bindings are never activated; pass a plain value and move text, view, each and state-bound props into setup`)),i},De=e=>{let t=[],n=/* @__PURE__ */ new Set,r={host:e,ended:!1,addCleanup:e=>t.push(e),addRebind:e=>n.add(e),rebind:()=>{n.size&&h.debug(`component '${e.localName}' moved - rebinding state subscriptions`);for(let e of[...n])n.has(e)&&e()},end:()=>{r.ended=!0;for(let n of t.splice(0))try{n()}catch(t){h.error(`component '${e.localName}': a cleanup failed`,t)}n.clear()}};return r},Oe=/* @__PURE__ */ new WeakMap,ke=/* @__PURE__ */ new WeakMap,Ae=e=>ke.get(e)??Promise.resolve(),je=e=>[...e.querySelectorAll(`*`)].filter(e=>ke.has(e)).map(Ae),Me=(e,t,n)=>{let r={host:e,abortSignal:n};return Oe.set(r,{scope:t,handles:/* @__PURE__ */ new Map}),r},Ne=(e,t,n)=>{let r=Oe.get(e);if(!r)throw Error(`imp: ${t} - the first argument must be the self that imp passes to setup, error, onMount and onRemove`);if(r.scope.ended)throw Error(`imp: ${t} runs after <${r.scope.host.localName}> has left the page, so ${n}`);return r},Pe=(e,t,n)=>Ne(e,`${t}(self, '${n}')`,`nothing can resolve it - resolve it in setup; in onRemove, ${t} returns the handle that setup resolved`),Fe=(e,t,n,r,i)=>{let a=`${t}:${r}`,o=Oe.get(e)?.handles.get(a);if(o)return o;let s=Pe(e,n,r),c=i(s.scope);return s.handles.set(a,c),c},Ie=(e,t,n,r,i)=>{let a=Pe(e,n,r),o=i(a.scope);return a.handles.set(`${t}:${r}`,o),o},Le=(e,t,n)=>{Ne(e,`state '${t}': watch(self, fn)`,`nothing owns the subscription - call watch in setup, or hold the stop that watch(fn) returns`).scope.addCleanup(n)};let Re=null;const ze=()=>(Re||(Re=new CSSStyleSheet,Re.replaceSync(`:host { display: contents }`)),Re),w=(e,t)=>{let n=new CSSStyleSheet;try{n.replaceSync(t)}catch(t){throw Error(`imp: component '${e}': styles could not be parsed - ${t.message}`,{cause:t})}return n},Be=(e,t)=>t===void 0?[ze()]:[ze(),w(e,t)],Ve=(t,n)=>{let r=!1;return class extends HTMLElement{constructor(){super(),this.attachShadow({mode:`open`,delegatesFocus:!0}),this.shadowRoot.adoptedStyleSheets=n,this[C]=[],this[fe]=!1,this[pe]=0,this[me]=null,this[he]=!1,this[ge]=null,this[_e]=null,this[ve]=!1}connectedCallback(){this.isConnected&&(this[fe]?this[me].rebind():xe?xe.push(this):Se(this))}[be](){this[fe]=!0;let n=this[pe]>0,i=++this[pe];if(this[_e]?.abort(),n)try{let e=Ee(this,t);this[ve]=e.length>0,Te(this,e)}catch(e){h.error(`component '${this.localName}': loading failed`,e),this[ve]=!1,this.shadowRoot.replaceChildren()}let o=De(this);this[me]=o;let s=new AbortController;this[_e]=s;let c=Me(this,o,s.signal);this[ge]=c;let l=()=>this[pe]===i&&this.isConnected&&!this[he],u=()=>{t.onMount&&requestAnimationFrame(()=>{if(l())try{t.onMount(c,...this[C])}catch(e){de(this,e)}})};if(t.error){let n=n=>{if(this[he])return;n.stopPropagation(),n.preventDefault(),this[he]=!0,re();let r;try{r=we(this,()=>t.error(c,n.detail.error,...this[C]))}catch(e){h.error(`component '${this.localName}': error view failed`,e);return}let i=e(r);Te(this,i);try{a(o,i)}catch(e){h.error(`component '${this.localName}': error view failed`,e)}};this.addEventListener(ue,n),o.addCleanup(()=>this.removeEventListener(ue,n))}let d;try{d=we(this,()=>t.setup(c,...this[C]))}catch(e){de(this,e);return}let f=t=>{let n=e(t);Te(this,n);try{a(o,n)}catch(e){de(this,e);return}h.debug(`component '${this.localName}' mounted`),u()};if(d&&typeof d.then==`function`){let e,t=new Promise(t=>e=t);ke.set(this,t);let n=()=>{ke.get(this)===t&&ke.delete(this),e()};d.then(e=>{l()&&f(e),n()},e=>{this[pe]!==i||!this.isConnected?e?.code===`aborted`||e?.name===`AbortError`?h.debug(`component '${this.localName}' left the page while setup waited`):h.error(`component '${this.localName}' failed to mount`,e):de(this,e),n()})}else this[ve]&&!r&&!t[ye]&&(r=!0,h.warn(`component '${this.localName}': loading is set but setup returned synchronously, so it is swapped out before paint and never seen - make setup async (or return a promise) to show it while loading, or remove loading`)),f(d)}connectedMoveCallback(){this[fe]&&this[me].rebind()}disconnectedCallback(){if(this.isConnected||!this[fe])return;let e=this[ge],n=this[me];queueMicrotask(async()=>{if(this.isConnected||!this[fe])return;this[fe]=!1;let r=++this[pe];this[ge]=null,this[he]=!1,n.end();try{await t.onRemove?.(e,...this[C])}catch(e){h.error(`component '${this.localName}': onRemove failed`,e)}this[pe]===r&&(this[_e]?.abort(),this[_e]=null,h.debug(`component '${this.localName}' unmounted`),this.shadowRoot.replaceChildren())})}}},He=/* @__PURE__ */ new Map;function T(e,t){ce(e);let n=He.get(e);if(n)return h.warn(`component '${e}' is already defined - reusing it and ignoring the new definition`),n;if(le(e,t),customElements.get(e))throw Error(`imp: element name '${e}' is already taken by a custom element defined outside imp`);customElements.define(e,Ve(t,Be(e,t.styles))),h.debug(`component '${e}' defined`);let r=(...n)=>{let r=document.createElement(e);r[C]=n;let i=Ee(r,t);return r[ve]=i.length>0,Te(r,i),r};return He.set(e,r),r}let Ue=null;const We=()=>{Ue||(Ue=new CSSStyleSheet,Ue.replaceSync(`
  @layer imp {
    body {
      margin: 0;
    }
  }
`),document.adoptedStyleSheets=[...document.adoptedStyleSheets,Ue])},Ge=/* @__PURE__ */ new Set([`list`,`form`]);function E(e){if(typeof e!=`object`||!e)return!1;let t=Object.getPrototypeOf(e);return t===Object.prototype||t===null}const D=e=>!!e&&typeof e.get==`function`&&typeof e.watch==`function`;function Ke(t,n){let r=null,i=!1,a=[];for(let o of t)D(o)?h.warn(`a state was passed directly to ${n} - pass it as a prop value ({ class: state }) or render it with text()/view()/each()`):E(o)?(i&&h.warn(`multiple props objects passed to ${n}; pass a single props object instead. Later keys win.`),i=!0,r=Object.assign(r??{},o)):a.push(...e(o));return{props:r,children:a}}function qe(e,t,n){n==null?e.removeAttribute(t):e.setAttribute(t,n===!0?``:String(n))}const Je=e=>e.localName.includes(`-`)||e.hasAttribute(`is`);function Ye(e,t,n){if(Ge.has(t))return qe(e,t,n);if(t in e){let r=n==null&&!Je(e);try{e[t]=r?``:n,r&&e.getAttribute(t)===``&&e.removeAttribute(t);return}catch{qe(e,t,n);return}}qe(e,t,n)}function Xe(e,t){for(let n in t){let r=t[n],[i,a]=Array.isArray(r)?r:[r,null];typeof i==`function`&&e.addEventListener(n,i,a??void 0)}}const Ze=e=>e.startsWith(`--`)?e:e.replace(/[A-Z]/g,e=>`-`+e.toLowerCase());function Qe(e,t,n){let r=Ze(t);n==null||n===!1?e.style.removeProperty(r):e.style.setProperty(r,String(n))}function $e(e,t){if(typeof t==`string`)e.style.cssText=t;else if(e.removeAttribute(`style`),t&&typeof t==`object`)for(let n in t)Qe(e,n,t[n])}const et=e=>typeof e==`string`?e:Array.isArray(e)?e.filter(e=>typeof e==`string`&&e).join(` `):e&&typeof e==`object`?Object.keys(e).filter(t=>e[t]).join(` `):``;function tt(e,t){let n=et(t);n?e.setAttribute(`class`,n):e.removeAttribute(`class`)}function nt(e,t,r){n(e,n=>n.addCleanup(r.watch(n=>{t===`class`?tt(e,n):t===`style`?$e(e,n):Ye(e,t,n)})))}function rt(e,t){for(let n in t){let r=t[n];n===`events`?r&&typeof r==`object`&&Xe(e,r):D(r)?nt(e,n,r):n===`style`?$e(e,r):n===`class`?tt(e,r):Ye(e,n,r)}}function it(e,t){let{props:n,children:r}=Ke(t,`an element`);return e.append(...r),n&&rt(e,n),e}function O(e,...t){return it(document.createElement(e),t)}function at(t,n){let r=typeof t==`string`?document.querySelector(t):t;if(!r)throw Error(`imp: mount target not found: `+t);We();let i=typeof n==`function`?n():n,o=[],s=/* @__PURE__ */ new Set,c={host:r,addCleanup:e=>o.push(e),addRebind:e=>s.add(e)},l=e(i);return r.replaceChildren(...l),a(c,l),h.debug(`mounted into <${r.localName}>`),()=>{for(let e of o.splice(0))e();s.clear(),r.replaceChildren()}}const ot=`state`,st=Symbol(`imp.state.providerSubscribe`);let ct=0;const lt=e=>Object.assign(/* @__PURE__ */ Error(`imp: state '${e}': set was called 100 levels deep inside subscribers - subscribers are setting states in a cycle; make the updates conditional or restructure the states`),{impUpdateCycle:!0}),ut=e=>{let t=/* @__PURE__ */ new Set,n=0;return{subscribe:e=>(t.add(e),()=>t.delete(e)),notify:r=>{let i=++n;h.debug(`state '${e}': notifying ${t.size} subscriber(s)`);for(let a of[...t]){if(i!==n){h.debug(`state '${e}': a subscriber set a newer value - the rest already saw it, skipping the stale one`);return}if(t.has(a))try{a(r)}catch(t){if(t?.impUpdateCycle)throw t;h.error(`state '${e}': a subscriber failed reacting to a new value`,t),re()}}}}},dt=e=>y(e,`state name`,`myapp.user`),ft=e=>{let t=dt(e);if(t)throw Error(`imp: ${t}`)},pt=[`Instant`,`ZonedDateTime`,`PlainDate`,`PlainTime`,`PlainDateTime`,`PlainYearMonth`,`PlainMonthDay`,`Duration`],mt=e=>pt.some(t=>{let n=globalThis.Temporal?.[t];return n!==void 0&&e instanceof n}),ht=e=>e instanceof Date||e instanceof URL||e instanceof URLSearchParams||e instanceof RegExp||mt(e),gt=(e,t)=>e instanceof Date?t instanceof Date&&Object.is(e.getTime(),t.getTime()):e instanceof URL?t instanceof URL&&e.href===t.href:e instanceof URLSearchParams?t instanceof URLSearchParams&&e.toString()===t.toString():e instanceof RegExp?t instanceof RegExp&&e.source===t.source&&e.flags===t.flags:!mt(t)||Object.getPrototypeOf(e)!==Object.getPrototypeOf(t)?!1:typeof e.equals==`function`?e.equals(t):e.toString()===t.toString(),_t=e=>{if(typeof e==`function`)return`is a function`;if(typeof e==`symbol`)return`is a symbol`;if(D(e))return`is another state - store its current value (get()) instead`;let t=e?.constructor?.name;return t?`is a ${t}`:`is a non-plain object`},vt=(e,t)=>t?{problem:{path:e,problem:`references itself in a cycle`},equal:!1}:{problem:null,equal:!1},yt=(e,t,n,r,i)=>{if(Object.is(e,t))return{problem:null,equal:!0};if(e==null)return{problem:null,equal:!1};let a=typeof e;if(a===`string`||a===`number`||a===`boolean`||a===`bigint`)return{problem:null,equal:!1};if(ht(e))return{problem:null,equal:gt(e,t)};if(Array.isArray(e)){if(i.has(e))return vt(r,n);i.add(e);let a=Array.isArray(t)&&e.length===t.length;for(let[o,s]of e.entries()){let c=yt(s,Array.isArray(t)?t[o]:void 0,n,`${r}[${o}]`,i);if(c.problem)return i.delete(e),c;c.equal||(a=!1)}return i.delete(e),{problem:null,equal:a}}if(E(e)&&!D(e)){if(i.has(e))return vt(r,n);i.add(e);let a=E(t),o=Object.keys(e),s=a&&o.length===Object.keys(t).length;for(let c of o){let o=yt(e[c],a?t[c]:void 0,n,r?`${r}.${c}`:c,i);if(o.problem)return i.delete(e),o;s&&!(a&&Object.hasOwn(t,c)&&o.equal)&&(s=!1)}return i.delete(e),{problem:null,equal:s}}return n?{problem:{path:r,problem:_t(e)},equal:!1}:{problem:null,equal:!1}},bt=(e,t)=>yt(e,t,!1,``,/* @__PURE__ */ new Set).equal,xt=(e,{path:t,problem:n})=>{let r=t?` at '${t}'`:``;h.error(`state '${e}': the value${r} ${n} - state values must be plain data without cycles: plain objects, arrays, dates (Date or Temporal), URLs, URLSearchParams, regexes, and primitives like strings, numbers, and booleans`)},St=e=>{if(typeof e!=`object`||!e||Object.isFrozen(e))return e;if(Object.freeze(e),Array.isArray(e))for(let t of e)St(t);else if(E(e))for(let t of Object.keys(e))St(e[t]);return e},Ct=e=>({addCleanup:t=>e.push(t)}),wt=(t,r,i)=>{let o=(e,n)=>{if(typeof e!=`function`){if(typeof n!=`function`)throw Error(`imp: state '${t}': watch takes a subscriber function, or self and a subscriber - watch(self, fn) stops when the component unmounts, watch(fn) returns the stop for you to call`);let r=e,i=o(e=>{r?.host?.isConnected!==!1&&n(e)});try{Le(e,t,i)}catch(e){throw i(),e}return i}let a=e,s=i(a);h.debug(`state '${t}': watch attached`);let c=!1,l=()=>{c||(c=!0,h.debug(`state '${t}': watch detached`)),s()};try{a(r())}catch(e){throw l(),e}return l},s=(e,t)=>{let n=o(t);return e.addCleanup(n),n},c=(e=e=>e)=>{let t=document.createTextNode(``);return n(t,n=>s(n,n=>{let r=String(e(n)??``);t.data!==r&&(t.data=r)})),t},l=(e,r)=>{let i=document.createComment(`imp:${e} ${t}`),o=document.createComment(`/imp:${e} ${t}`),c=document.createDocumentFragment();return c.append(i,o),n(i,e=>{let t=[],n=()=>{for(let e of t.splice(0))e()},c=Ct(t),l=null;l=s(e,e=>{if(n(),!i.parentNode){l?.();return}for(;i.nextSibling!==o;)i.nextSibling.remove();let t=r(e);o.before(...t),a(c,t)}),i.parentNode||l(),e.addCleanup(n)}),c},u=n=>{if(typeof n!=`function`)throw Error(`imp: state '${t}': view needs a function rendering the current value into DOM`);let r=n;return l(`view`,t=>e(r(t)))},d=e=>Array.isArray(e)?e:(e!=null&&h.error(`state '${t}': each needs an array value, got ${typeof e} - rendering nothing`),[]),f=(e,t)=>{if(e.nextSibling===t)return;let n=e.parentNode;t.parentNode===n?n.moveBefore(t,e.nextSibling):n.insertBefore(t,e.nextSibling)},p=()=>{let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e},m=(e,t)=>{let n=[];for(let r=e;r!==t;){let e=r.parentNode,t=e instanceof ShadowRoot;n.unshift({shadow:t,name:r.localName,cls:r.className,nth:[...e.children].indexOf(r)}),r=t?e.host:e}return n},g=(e,t,n)=>{let r=p(),i=r;for(;i&&i.getRootNode()!==n;)i=i.getRootNode().host;if(!i)return null;let a=i;for(;a&&!t.has(a);)a=a.parentNode;if(!a)return null;let o=t.get(a);return{record:o,position:[...e.values()].indexOf(o),element:r,at:o.nodes.indexOf(a),path:m(r,a)}},_=(e,{name:t,cls:n})=>e.localName===t&&e.className===n,v=(e,t)=>{let n=[...e?.children??[]],r=n[t.nth];return r&&_(r,t)?r:n.find(e=>_(e,t))??(r?.localName===t.name?r:null)},y=(e,t)=>{let n=e;for(let e of t){let t=v(e.shadow?n.shadowRoot:n,e);if(!t)return n;n=t}return n},b=({record:e,position:t,element:n,at:r,path:i},a)=>{if(n.isConnected)return;let o=[...a.values()],s=o.includes(e)?e:o[Math.min(t,o.length-1)];(s?.nodes[r]?y(s.nodes[r],i):null)?.focus?.({preventScroll:!0})},x=e=>{let t=[],n=Array(e.length);for(let[r,i]of e.entries()){let a=0,o=t.length;for(;a<o;){let n=a+o>>1;e[t[n]]<i?a=n+1:o=n}n[r]=a>0?t[a-1]:-1,t[a]=r}let r=[];for(let e=t.at(-1)??-1;e>=0;e=n[e])r.push(e);return r},S=(e,t)=>{let n=[],r=[];for(let[i,a]of e.entries())!t.has(a)&&a.nodes.length&&(n.push(i),r.push(a.position));return new Set(x(r).map(e=>n[e]))},ee=(r,i)=>{let o=document.createComment(`imp:each ${t}`),c=document.createComment(`/imp:each ${t}`),l=document.createDocumentFragment();return l.append(o,c),n(o,n=>{let c=/* @__PURE__ */ new Map,l=/* @__PURE__ */ new WeakMap,u=e=>{for(let t of e.cleanups.splice(0))t()},p=e=>{u(e);for(let t of e.nodes)l.delete(t),t.remove()},m=(e,n)=>{p(e),e.nodes=[],e.pendingScope=null,h.error(`state '${t}': each failed to render an item - skipping it`,n)},_=(t,n,i)=>{let a=Ct(t.cleanups);try{t.nodes=e(r(n,i))}catch(e){if(e?.impUpdateCycle)throw e;m(t,e);return}for(let e of t.nodes)l.set(e,t);t.pendingScope=a},v=e=>{let t=e.pendingScope;if(t){e.pendingScope=null;try{a(t,e.nodes)}catch(t){if(t?.impUpdateCycle)throw t;m(e,t)}}},y=null;y=s(n,e=>{if(!o.parentNode){for(let e of c.values())u(e);c.clear(),y?.();return}let n=g(c,l,o.getRootNode()),r=/* @__PURE__ */ new Map,a=/* @__PURE__ */ new Set,s=0;for(let e of c.values())e.position=s++;let m=[];for(let[n,r]of d(e).entries()){let e;try{e=i(r,n)}catch(e){if(e?.impUpdateCycle)throw e;h.error(`state '${t}': each could not compute the key of item ${n} - skipping it`,e);continue}m.push({key:e,item:r,index:n})}for(let{key:e,item:n,index:i}of m){r.has(e)&&(h.error(`state '${t}': each got duplicate key '${String(e)}' - keys must be unique per item; rendering the duplicate as an independent item`),e=Symbol(`imp.each.duplicateKey`));let o=c.get(e);if(o)c.delete(e),bt(o.item,n)||(p(o),_(o,n,i),a.add(o)),o.item=n,r.set(e,o);else{let t={item:n,nodes:[],cleanups:[],pendingScope:null,position:-1};_(t,n,i),a.add(t),r.set(e,t)}}for(let e of c.values())p(e);c=r;let x=[...c.values()],ee=S(x,a),te=o;for(let[e,t]of x.entries())if(ee.has(e))te=t.nodes.at(-1);else for(let e of t.nodes)f(te,e),te=e;for(let e of x)v(e);n&&b(n,c)}),o.parentNode||y(),n.addCleanup(()=>{for(let e of c.values())u(e)})}),l};return{name:t,get:r,watch:o,text:c,view:u,each:(n,r)=>{if(typeof n!=`function`)throw Error(`imp: state '${t}': each needs a function rendering an item into DOM`);let i=n;if(r===void 0)return l(`each`,t=>d(t).flatMap((t,n)=>e(i(t,n))));if(typeof r!=`function`)throw Error(`imp: state '${t}': each's second argument must be a function returning a stable key for an item - like (item) => item.id`);return ee(i,r)}}},Tt=(e,t,n=()=>t().get())=>({name:e,get:n,watch:(...e)=>t().watch(...e),text:e=>t().text(e),view:e=>t().view(e),each:(e,n)=>t().each(e,n)}),k=(e,t)=>{let{problem:n}=yt(t,void 0,!0,``,/* @__PURE__ */ new Set);n&&xt(e,n);let r=St(t),{subscribe:i,notify:a}=ut(e),o=()=>(h.debug(`state '${e}' read`,r),r),s=t=>{let n=typeof t==`function`?t(r):t;if(Object.is(n,r)){h.debug(`state '${e}' set skipped - the value is unchanged`);return}let{problem:i,equal:o}=yt(n,r,!0,``,/* @__PURE__ */ new Set);if(i&&xt(e,i),o)h.debug(`state '${e}' set skipped - the new value is structurally equal`);else{if(ct>=100)throw lt(e);r=St(n),h.debug(`state '${e}' set`,r),ct++;try{a(r)}finally{ct--}}};return{...wt(e,o,i),set:s,[st]:i}},Et=(e,t)=>{let n=b(ot,t,e);return n&&{state:n.value,provider:n.provider}},Dt=(e,t,n,r)=>{let i=t,{subscribe:a,notify:o}=ut(e),s=i[st](o);return r.addCleanup(()=>s()),r.addRebind(()=>{let t=n();if(!t||t===i)return;h.debug(`state '${e}': <${r.host.localName}> moved - rebinding to the provider here`);let a=i.get();s(),i=t,s=i[st](o);let c=i.get();bt(c,a)||o(c)}),{...wt(e,()=>i.get(),a),current:()=>i}},Ot=(e,t,n)=>{let{current:r,...i}=Dt(e,t,()=>{let t=Et(n.host,e);return t?t.state:(h.error(`state '${e}' is not provided at the new position of <${n.host.localName}> - keeping the previous state: get/set still target it, but nothing at this position shares it`),null)},n);return{...i,set:e=>r().set(e)}},kt=(e,t,n)=>{let r=e.host,i=Et(r,t);if(i&&i.provider===r)throw Error(`imp: state '${t}' is already initialized in this scope - initState runs once per scope; call useState(self, '${t}') to reach the existing state`);let a=k(t,n);return h.debug(`state '${t}' initialized in <${r.localName}>`,n),x(ot,t,a,r,e),a},At=Object.freeze({addCleanup:()=>{}}),jt=e=>x(ot,e.name,e,globalThis.document.documentElement,At),Mt=(e,t)=>{let n=Et(e.host,t);if(!n)throw Error(`imp: no state '${t}' is initialized in the ancestors of <${e.host.localName}> - call initState(self, '${t}', initialValue) in the setup of an ancestor component first`);return h.debug(`state '${t}' resolved from <${n.provider.localName}>`),Ot(t,n.state,e)},Nt=`imp.state.`,Pt=(e,t)=>{let n=null;try{n=globalThis.localStorage?.getItem(Nt+e)??null}catch(n){return h.debug(`state '${e}': the browser storage cannot be read`,n),t}if(n===null)return t;try{return JSON.parse(n)}catch(n){return h.warn(`state '${e}': the stored value is not JSON - starting from the initial value`,n),t}},Ft=(e,t)=>{try{t===void 0?globalThis.localStorage?.removeItem(Nt+e):globalThis.localStorage?.setItem(Nt+e,JSON.stringify(t))}catch(t){h.debug(`state '${e}': the browser storage refused the value`,t)}},It=(e,t,n)=>{e.addCleanup(n.watch(e=>Ft(t,e)));let r=e=>{e.key===Nt+t&&n.set(e.newValue===null?void 0:Pt(t,n.get()))};globalThis.addEventListener(`storage`,r),e.addCleanup(()=>globalThis.removeEventListener(`storage`,r))},Lt=(e,t)=>{if(t===void 0)return!1;if(typeof t==`object`&&t&&!Array.isArray(t)&&Object.keys(t).every(e=>e===`persist`)&&(t.persist===void 0||typeof t.persist==`boolean`))return t.persist===!0;throw Error(`imp: initState(self, '${e}', value, options) - options takes { persist: true } to keep the value in the browser`)};function A(e,t,n,r){return Ie(e,ot,`initState`,t,e=>{ft(t);let i=Lt(t,r),a=kt(e,t,i?Pt(t,n):n);return i&&It(e,t,a),a})}function j(e,t){return Fe(e,ot,`useState`,t,e=>(ft(t),Mt(e,t)))}function M(e,t){if(!Array.isArray(e)||e.length===0||!e.every(D))throw Error(`imp: computed needs a non-empty array of states (from initState, useState, or computed)`);if(typeof t!=`function`)throw Error(`imp: computed needs a function computing one result from the state values`);let n=`computed(${e.map(e=>e.name).join(`+`)})`,{subscribe:r,notify:i}=ut(n),a=[],o=0,s,c=()=>St(t(...e.map(e=>e.get()))),l=()=>{let e=o>0?s:c();return h.debug(`state '${n}' read`,e),e},u=()=>{let e=c();bt(e,s)?h.debug(`state '${n}' recomputed - the result is unchanged`):(s=e,h.debug(`state '${n}' recomputed`,e),i(e))},d=()=>{s=c();let t=!0;for(let n of e)a.push(n.watch(()=>{t||u()}));t=!1},f=()=>{for(let e of a.splice(0))e()};return wt(n,l,e=>{o===0&&d(),o++;let t=r(e),n=!1;return()=>{n||(n=!0,t(),o--,o===0&&f())}})}const Rt=e=>{if(!e||e===`/`)return``;let t=e.startsWith(`/`)?e:`/${e}`;return t.endsWith(`/`)?t.slice(0,-1):t},zt=()=>Rt(globalThis.__IMP_ENV__?.IMP_BASEPATH??``),Bt=()=>globalThis.__IMP_ENV__?.IMP_ROUTING===`hash`,Vt=e=>{let t=zt();return t&&(e===t||e.startsWith(`${t}/`))?e.slice(t.length)||`/`:e},Ht=(e,t)=>e===t||[`/`,`?`,`#`].some(n=>e.startsWith(t+n)),Ut=e=>{if(!e.startsWith(`/`))return e;if(Bt())return`#${e}`;let t=zt();return t&&!Ht(e,t)?t+e:e},Wt=[`http:`,`https:`],Gt=e=>new URL(Ut(String(e)),globalThis.location.href),Kt=e=>Wt.includes(e.protocol),qt=e=>e.protocol===globalThis.location.protocol&&e.origin===globalThis.location.origin,Jt=e=>{let t={};for(let[n,r]of e)Object.hasOwn(t,n)||(t[n]=r);return t},Yt=(e,t)=>{let n=new URLSearchParams(t);return{path:e,query:Jt(n),searchParams:n}},Xt=e=>{let t=e.indexOf(`?`),n=t===-1?e:e.slice(0,t),r=t===-1?``:e.slice(t+1);return Yt(n.startsWith(`/`)?n:`/${n}`,r)},Zt=e=>{let t=new URL(e);return Bt()?Xt(t.hash.slice(1)):Yt(Vt(t.pathname),t.search)},Qt=()=>Zt(globalThis.location.href),$t=(e,t)=>e.path===t.path&&e.searchParams.toString()===t.searchParams.toString(),en=e=>e.split(`/`).filter(Boolean),tn=`imp:reloaded-build`,nn=e=>{let t=e.querySelector(`script[type="module"][src]`)?.getAttribute(`src`);return t?new URL(t,location.href).href:null},rn=e=>{try{return sessionStorage.getItem(tn)===e}catch{return!0}},an=e=>{try{return sessionStorage.setItem(tn,e),!0}catch{return!1}},on=async()=>{try{let e=await fetch(location.href,{cache:`no-store`,headers:{accept:`text/html`}});if(!e.ok)return null;let t=new DOMParser().parseFromString(await e.text(),`text/html`);return nn(t)}catch{return null}},sn=async()=>{let e=nn(document);if(e===null||rn(e))return!1;let t=await on();return t===null||t===e||!an(e)?!1:(h.warn(`a chunk of this build is gone from the server - loading the new build`),location.reload(),!0)},cn=async e=>{try{return await e()}catch(e){if(e instanceof TypeError&&await sn())return new Promise(()=>{});throw e}},ln=`imp.lang`,un=[`ltr`,`rtl`,`auto`],dn=/* @__PURE__ */ new Set([`ar`,`arc`,`ckb`,`dv`,`fa`,`he`,`ks`,`ps`,`sd`,`ug`,`ur`,`yi`]),fn=/\{(\w+)\}/g;let pn=[];const mn=()=>globalThis.document?.documentElement??null;let hn=null;const gn=()=>mn()?.getAttribute(`lang`)||hn||globalThis.navigator?.language||`en`,_n=e=>{try{let t=new Intl.Locale(e),n=t.getTextInfo?.()??t.textInfo;if(n?.direction)return n.direction}catch{h.debug(`i18n: '${e}' is not a language tag Intl reads - guessing its direction`)}return dn.has(e.split(`-`)[0].toLowerCase())?`rtl`:`ltr`};let vn=null,yn=null,bn=null,xn=!1;const Sn=()=>{Dn();let e=gn();e===bn||An.length===0?yn?.set(e):Ln(e).catch(t=>h.error(`i18n: could not load the translations for '${e}'`,t))},Cn=()=>{if(xn)return;let e=mn();e&&(xn=!0,new MutationObserver(e=>{e.some(e=>e.attributeName===`lang`)&&Sn()}).observe(e,{attributes:!0,attributeFilter:[`lang`,`dir`]}))},wn=()=>yn||(yn=k(ln,gn()),Cn(),yn),N={name:ln,get:gn,watch:(...e)=>wn().watch(...e),text:e=>wn().text(e),view:e=>wn().view(e),each:(e,t)=>wn().each(e,t)},Tn=(e,t)=>{if(typeof e!=`string`||e.trim()===``)throw Error(`imp: ${t} needs a language code like 'en' or 'pt-BR'`)},En=e=>{if(!un.includes(e))throw Error(`imp: init({ dir }) needs ${un.map(e=>`'${e}'`).join(`, `)} - leave it out to take the direction from the language`);vn=e},Dn=()=>{let e=vn??_n(gn()),t=mn();t&&t.getAttribute(`dir`)!==e&&(t.setAttribute(`dir`,e),h.debug(`i18n: text direction set to '${e}'`))},On=e=>{hn=e,bn=e,mn()?.setAttribute(`lang`,e),Dn(),wn().set(gn()),h.debug(`i18n: language set to '${e}'`)},kn=e=>{let t=Object.entries(e).map(([e,t])=>({code:e,messages:t}));pn.push(...t),Vn.clear();let n=!1;return()=>{n||(n=!0,pn=pn.filter(e=>!t.includes(e)),Vn.clear())}},An=[];let jn=0;const Mn=(e,t)=>{let n=Object.keys(e),r=t.split(`-`)[0],i=[];return r!==t&&n.includes(r)&&i.push(r),n.includes(t)&&i.push(t),i.length>0?i:n.includes(r)?[r]:n.length>0?[n[0]]:[]},Nn=(e,t)=>e?.length===t.length&&t.every((t,n)=>e[n]===t),Pn=async(e,t)=>{let n=Mn(e.loaders,t);if(n.length===0||Nn(e.loaded?.keys,n)){e.pending.delete(t);return}let r=await Promise.all(n.map(async t=>{let n=await cn(()=>e.loaders[t]()),r=n?.default??n;if(!E(r))throw Error(`imp: the '${t}' translations loader resolved to ${typeof r}, not translations - it should be () => import('./locales/${t}.js'), pointing at a module whose default export is your messages`);return[t,r]}));e.pending.set(t,{keys:n,loaded:r})},Fn=(e,t)=>{let n=e.pending.get(t);if(!n||e.disposed)return;e.pending.delete(t);let{keys:r,loaded:i}=n,a=kn(Object.fromEntries(i));e.loaded?.release(),e.loaded={keys:r,release:a},h.debug(`i18n: translations for ${r.join(` + `)} are live`)},In=(e,t)=>{if(!E(e)||Object.keys(e).length===0)throw Error(`imp: ${t} needs translations as an object of loaders keyed by language code, like { en: () => import('./locales/en.js'), pl: () => import('./locales/pl.js') }`);for(let[n,r]of Object.entries(e))if(typeof r!=`function`)throw Error(`imp: ${t} - the '${n}' translations entry must import them, like () => import('./locales/${n}.js')`);let n={loaders:e,loaded:null,pending:/* @__PURE__ */ new Map,disposed:!1};return An.push(n),{load:async e=>{await Pn(n,e),Fn(n,e)},dispose:()=>{n.disposed=!0,n.pending.clear(),n.loaded?.release(),n.loaded=null;let e=An.indexOf(n);e>=0&&An.splice(e,1)}}};async function Ln(e){Tn(e,`setLang`);let t=++jn;if(await Promise.all(An.map(t=>Pn(t,e))),t!==jn)return e;for(let t of An)Fn(t,e);return On(e),e}const Rn=e=>{let t=[e],n=e.split(`-`)[0];n!==e&&t.push(n);let r=pn[0]?.code;return r!==void 0&&!t.includes(r)&&t.push(r),t},zn=(e,t)=>{let n=e;for(let e of t.split(`.`)){if(!E(n))return;n=n[e]}return n},Bn=(e,t)=>{for(let n of Rn(e))for(let e=pn.length-1;e>=0;e--){let r=pn[e];if(r.code!==n)continue;let i=zn(r.messages,t);if(i!==void 0)return i}},Vn=/* @__PURE__ */ new Set,Hn=/* @__PURE__ */ new Map,Un=/^[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)*$/,P=e=>{if(!E(e))throw Error(`imp: defaultMessages needs an object of message keys to wording, like { 'imp.state.empty': 'Nothing here yet' }`);for(let[t,n]of Object.entries(e)){if(!Un.test(t))throw Error(`imp: defaultMessages - '${t}' is not a message key like 'imp.state.empty'`);if(typeof n!=`string`)throw Error(`imp: defaultMessages - the wording for '${t}' is a ${typeof n}, not a string`);Hn.set(t,n)}Vn.clear()},Wn=(e,t)=>e.replace(fn,(e,n)=>Object.hasOwn(t,n)?String(t[n]):e),Gn=(e,t,n,r)=>{let i=`${t}/${n}`;if(Vn.has(i))return;Vn.add(i);let a=Hn.has(n)?`showing the built-in wording`:`showing the key '${n}'`;h[e](`i18n: ${r} - ${a}`)},Kn=(e,t)=>{let n=Hn.get(e);return n===void 0?e:t===void 0?n:Wn(n,t)};function F(e,t){if(typeof e!=`string`||e===``)throw Error(`imp: t needs a message key like 'todo.title'`);if(t!==void 0&&!E(t))throw Error(`imp: t('${e}') got ${typeof t} params - pass a plain object of placeholder values, like t('${e}', { name: 'Ada' })`);let n=gn(),r=Bn(n,e);return r===void 0?(Gn(Hn.has(e)?`debug`:`warn`,n,e,`no message '${e}' is registered for '${n}'`),Kn(e,t)):E(r)?(Gn(`warn`,n,e,`'${e}' is a group of messages, not a message - name one of ${Object.keys(r).map(t=>`'${e}.${t}'`).join(`, `)}`),Kn(e,t)):typeof r==`string`?t===void 0?r:Wn(r,t):(Gn(`warn`,n,e,`message '${e}' is a ${typeof r}, not a string`),Kn(e,t))}const qn=e=>{let t=Bn(gn(),e);return typeof t==`string`?t:Hn.get(e)},Jn=()=>Symbol.for(`imp.appMap`),Yn=[`description`],Xn={label:e=>`the label of a static node is the message appMap.<id>.label, and a param crumb takes the state imp.routeLabels - drop 'label' from ${e}`,access:e=>`a guard binds at the router: router({ guards: { [${e}]: { states, check } } })`,nav:e=>`a node leaves the nav at the shell: shell({ map, nav: { [${e}]: { hidden: true } } })`,group:e=>`a node heads a group of rows at the shell: shell({ map, nav: { [${e}]: { group: true } } })`,path:()=>`the name of a node is its segment, and the map itself serves '/' - rename the node instead`},Zn=[`href`,`spec`,`toString`],Qn=/^\$?[A-Za-z_][A-Za-z0-9_]*$/,$n=Object.freeze([]),er=Object.freeze({section:null,item:null,context:null,crumbs:[],pattern:null,params:{},waiting:!1,leaving:!1}),tr=e=>{throw Error(`imp: appMap - ${e}`)},nr=e=>e.replace(/^\$/,``).replace(/([a-z0-9])([A-Z])/g,`$1 $2`).toLowerCase().split(` `),rr=e=>nr(e).join(`-`),ir=e=>{let[t,...n]=nr(e);return[t[0].toUpperCase()+t.slice(1),...n].join(` `)},ar=e=>e.id===``?`app`:`app.${e.id}`,or=(e,t)=>tr(`'${e}' is not a prop of the map - ${Xn[e](t)}`),sr=(e,t)=>{t.description!==void 0&&(typeof t.description!=`string`&&tr(`${ar(e)}: 'description' must be a string`),e.description=t.description)},cr=(e,t)=>{let n=t.startsWith(`$`);return{name:t,id:e.parent===null?t:`${e.id}.${t}`,param:n,paramName:n?t.slice(1):null,segment:n?`:${t.slice(1)}`:rr(t),defaultLabel:ir(t),parent:e,children:[],description:void 0,handle:null,segments:[],pattern:`/`}},lr=(e,t)=>{e.parent=t,e.id=t.parent===null?e.name:`${t.id}.${e.name}`;for(let t of e.children)lr(t,e)},ur=(e,t,n)=>{let r=n[Jn()];r.graftedInto!==null&&tr(`${ar(e)}: this map is already a part of another map, under '${r.graftedInto}'`),sr(e,r.props);for(let t of r.root.children)lr(t,e),e.children.push(t);r.graftedInto=ar(e),r.node=e,e.handle=n},dr=e=>e.parent===null?`the root`:ar(e),fr=(e,t)=>{for(let[n,r]of Object.entries(t)){if(Yn.includes(n)){e.parent===null&&tr(`'${n}' is a node prop, and the root holds nodes only`);continue}let t=jr(r),i=typeof r==`string`||E(r)||t;!i&&Object.hasOwn(Xn,n)&&or(n,e.parent===null?`app.<node>`:ar(e)),r===!0&&tr(`${dr(e)}: '${n}' is true - write a description string, or {} for a node with nothing to say`),i||tr(`${dr(e)}: '${n}' is neither a node (a description, an object, or a map) nor 'description'`),Qn.test(n)||tr(`'${n}' is not a valid node name - use an identifier like createApiKey or $projectId`),Zn.includes(n)&&tr(`'${n}' cannot name a node - a handle already has a '${n}' member`),e.parent===null&&n===`label`&&tr(`'label' cannot name a top-level node - the message appMap.label is the label of the root`);let a=cr(e,n);t?ur(a,e,r):typeof r==`string`?a.description=r:sr(a,r),e.children.push(a),!t&&typeof r!=`string`&&fr(a,r)}},pr=(e,t)=>{for(let n of e.children){if(!n.param){pr(n,t);continue}let e=t.get(n.name);e!==void 0&&tr(`${ar(n)}: the param '${n.name}' repeats the param of ${ar(e)} - a param name names one param of a chain, so give each its own name, like $orgId and $teamId`),pr(n,new Map(t).set(n.name,n))}},mr=e=>{for(let t of e.children)t.segments=[...e.segments,t.segment],t.pattern=t.segments.length===0?`/`:`/${t.segments.join(`/`)}`,mr(t)},hr=e=>{let t=e;for(;t.parent!==null;)t=t.parent;return t},gr=(e,t)=>e.children.find(e=>!e.param&&e.segment===t)??e.children.find(e=>e.param),_r=e=>{try{return decodeURIComponent(e)}catch{return null}},vr=(e,t)=>{let n={},r=[e],i=e;for(let e of en(t)){let t=gr(i,e);if(!t)return null;if(t.param){let r=_r(e);if(r===null)return null;n[t.paramName]=r}r.push(t),i=t}return{node:i,params:n,chain:r}},yr=e=>vr(hr(e),Qt().path)?.params??{},br=(e,t,n,r)=>e.map(e=>{if(!e.startsWith(`:`))return e;let i=e.slice(1),a=t?.[i];return a==null?(n&&tr(`${ar(r)}.href() needs a value for '${i}'`),e):encodeURIComponent(String(a))}),xr=(e,t,{strict:n=!1}={})=>{let r=br(e.segments,t,n,e);return r.length===0?`/`:`/${r.join(`/`)}`},Sr=[`query`,`absolute`],Cr=(e,t)=>{E(e)||tr(`${ar(t)}.href(params, { query }) - query is a plain object`);let n=new URLSearchParams;for(let[t,r]of Object.entries(e))for(let e of Array.isArray(r)?r:[r])e!=null&&n.append(t,String(e));let r=n.toString();return r===``?``:`?${r}`},wr=(e,t,n)=>{if(n===void 0)return e;E(n)||tr(`${ar(t)}.href(params, options) - options is { query, absolute }`);let r=Object.keys(n).find(e=>!Sr.includes(e));r&&tr(`${ar(t)}.href(params, options) - '${r}' is not an option; use query or absolute`);let i=n.query===void 0?e:e+Cr(n.query,t);return n.absolute===!0?new URL(i,globalThis.location.href).href:i},Tr=e=>({toString:()=>e().pattern,href:(t,n)=>{let r=e();return wr(Ut(xr(r,{...yr(r),...t},{strict:!0})),r,n)},spec:Object.freeze({get name(){return e().name},get param(){return e().param},get segment(){let t=e();return t.parent===null?`/`:t.segment},get pattern(){return e().pattern},get label(){return e().defaultLabel},get description(){return e().description},get children(){return Object.freeze(e().children.map(e=>e.handle))}})}),Er=e=>{let t={};for(let n of e.children)t[n.name]=Dr(n);return t},Dr=e=>{if(e.handle!==null)return e.handle;let t=Object.freeze({...Er(e),...Tr(()=>e)});return e.handle=t,t},Or=(e,t)=>{for(let n of e.children)t.push(n),Or(n,t);return t},kr=e=>{E(e)||tr(`appMap(props, nodes) takes the props of the node the map hangs from, then its nodes`);for(let t of Object.keys(e))Object.hasOwn(Xn,t)&&or(t,`app.<node>`),Yn.includes(t)||tr(`appMap(props, nodes) - '${t}' is not a prop; props take only 'description'`);return e.description!==void 0&&typeof e.description!=`string`&&tr(`appMap(props, nodes) - 'description' must be a string`),e},Ar=(e,t)=>{let[n,r]=t===void 0?[{},e]:[kr(e),t];E(r)||tr(`appMap(nodes) takes an object of nodes, one key per feature`);let i={name:``,id:``,param:!1,paramName:null,segment:``,defaultLabel:`Home`,parent:null,children:[],description:void 0,handle:null,segments:[],pattern:`/`};fr(i,r),pr(i,/* @__PURE__ */ new Map),mr(i);let a=Or(i,[i]),o=/* @__PURE__ */ new Map;for(let e of a)o.set(e.pattern,e);let s={props:n,graftedInto:null,root:i,node:i,nodes:a,byPattern:o,feed:{tree:k(`imp.map.tree`,$n),current:k(`imp.map.current`,er)}},c=Object.freeze({...Er(i),...Tr(()=>s.node),[Jn()]:s});return i.handle=c,c},jr=e=>!!e?.[Jn()],Mr=e=>e.description===void 0&&e.children.length>0&&e.children.every(e=>e.param),Nr=e=>e[Jn()],Pr=e=>{let{props:t,graftedInto:n}=e[Jn()];return n===null?Object.keys(t).length>0?`this map carries the props of a node, so it is a part of another map - pass the map that holds it`:null:`this map is a part of another map, under '${n}' - pass the map that holds it`},Fr=e=>e[Jn()].feed,Ir=(e,t)=>e[Jn()].byPattern.get(String(t))??null,Lr=(e,t)=>{for(let n=e;n!==null;n=n.parent)if(n===t)return!0;return!1},Rr=(e,t)=>vr(e[Jn()].root,t),zr=(e,t,n)=>{let r={};for(let i of e)if(i.param&&(r[i.paramName]=n[i.paramName]),i===t)break;return r},Br=(e,t)=>qn(e.id===``?`appMap.${t}`:`appMap.${e.id}.${t}`),Vr=(e,t={},n={})=>{if(!e.param)return Br(e,`label`)??e.defaultLabel;let r=n[e.name];return r==null?t[e.paramName]??e.defaultLabel:String(r)},Hr=(e,t)=>!e.param||t[e.name]!==void 0&&t[e.name]!==null,Ur=e=>e.description===void 0?void 0:Br(e,`description`)??e.description,Wr=(e,{path:t,allowed:n,labels:r,settled:i,scope:a,isPage:o=()=>!0,ownsPage:s=()=>!1})=>{let{root:c}=e[Jn()],l=Rr(e,t),u=l?.params??{},d=[];for(let e of l?.chain??[]){if(e!==c&&!n(e))break;d.push(e)}let f=e=>!i&&!Hr(e,r),p=e=>f(e)?``:Vr(e,u,r),m=e=>Ut(xr(e,u)),h=e=>({id:e.pattern,label:p(e),href:m(e),children:g(e)});function g(e){return e.children.flatMap(e=>e.param||!n(e)?[]:[h(e)])}let _=Math.max(a===null?0:d.indexOf(a),0),v=d[_]??c,y=s(v)&&n(v),b=d[_+1]??(y?v:null),x=d.slice(_+1).findLast(e=>e.param)??b,S=(e,t)=>({id:e.pattern,label:p(e),href:m(e),items:t}),ee=[...y?[S(v,[])]:[],...v.children.flatMap(e=>e.param||!n(e)?[]:[S(e,g(e===b?x:e))])],te=/* @__PURE__ */ new Set,ne=e=>{for(let t of e)te.add(t.id),ne(t.children)};ne(ee.find(e=>e.id===b?.pattern)?.items??[]);let re=d.findLast(e=>te.has(e.pattern))??null,ie=d.slice(_).filter(e=>e!==c||n(c)).map(e=>({id:e.pattern,label:p(e),href:o(e)?m(e):null,loading:f(e)}));return{sections:ee,current:{section:b?.pattern??null,item:re?.pattern??null,context:x===null?null:p(x),crumbs:ie,pattern:d.at(-1)?.pattern??null,params:u,settled:i}}},Gr=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i,Kr=e=>e<=.04045?e/12.92:((e+.055)/1.055)**2.4,qr=e=>e<=.0031308?e*12.92:1.055*e**(1/2.4)-.055,Jr=(e,t,n)=>Math.min(n,Math.max(t,e)),Yr=e=>{let t=e.slice(1),n=t.length===3?t.replace(/./g,e=>e+e):t;return[0,2,4].map(e=>parseInt(n.slice(e,e+2),16)/255)},Xr=([e,t,n])=>`#${[e,t,n].map(e=>Math.round(Jr(e,0,1)*255).toString(16).padStart(2,`0`)).join(``)}`,Zr=e=>{let[t,n,r]=e.map(Kr),i=Math.cbrt(.4122214708*t+.5363325363*n+.0514459929*r),a=Math.cbrt(.2119034982*t+.6806995451*n+.1073969566*r),o=Math.cbrt(.0883024619*t+.2817188376*n+.6299787005*r),s=.2104542553*i+.793617785*a-.0040720468*o,c=1.9779984951*i-2.428592205*a+.4505937099*o,l=.0259040371*i+.7827717662*a-.808675766*o;return{l:s,c:Math.hypot(c,l),h:(Math.atan2(l,c)*180/Math.PI+360)%360}},Qr=([e,t,n])=>{let r=(e+.3963377774*t+.2158037573*n)**3,i=(e-.1055613458*t-.0638541728*n)**3,a=(e-.0894841775*t-1.291485548*n)**3;return[4.0767416621*r-3.3077115913*i+.2309699292*a,-1.2684380046*r+2.6097574011*i-.3413193965*a,-.0041960863*r-.7034186147*i+1.707614701*a]},$r=({l:e,c:t,h:n})=>{let r=n*Math.PI/180;return Qr([e,t*Math.cos(r),t*Math.sin(r)]).map(qr)},ei=e=>e.every(e=>e>=-1e-4&&e<=1.0001),ti=e=>{let t={l:Jr(e.l,0,1),c:Math.max(e.c,0),h:e.h};if(ei($r(t)))return t;let n=0,r=t.c;for(let e=0;e<16;e++){let e=(n+r)/2;ei($r({...t,c:e}))?n=e:r=e}return{...t,c:n}},ni=e=>Xr($r(ti(e))),ri=e=>{let[t,n,r]=e.map(Kr);return .2126*t+.7152*n+.0722*r},ii=(e,t)=>{let n=Math.max(ri(e),ri(t)),r=Math.min(ri(e),ri(t));return(n+.05)/(r+.05)},ai=4.5,oi=[1,1,1],si=e=>Yr(ni(e)),ci=e=>({l:.2,c:Math.min(e.c,.04),h:e.h}),li=e=>{let t=si(e),n=ii(t,oi);if(n>=4.5)return`#ffffff`;let r=ni(ci(e));return ii(t,Yr(r))>n?r:`#ffffff`},ui=e=>ii(si(e),Yr(li(e)))>=ai,di=(e,t)=>{let n=si(e);return t.every(e=>ii(n,Yr(e))>=ai)},fi=(e,t,n,{solid:r=!1}={})=>{let i=n===`dark`?.01:-.01,a=e=>di(e,t)&&(!r||ui(e)),o=e=>i>0?e.l<1:e.l>0,s=ti(e);for(;!a(s)&&o(s);)s=ti({...s,l:s.l+i});return s},pi={gray:{l:.62,c:.004,h:270},brown:{l:.52,c:.08,h:65},red:{l:.55,c:.21,h:27},orange:{l:.6,c:.19,h:55},amber:{l:.83,c:.16,h:80},yellow:{l:.9,c:.17,h:100},lime:{l:.88,c:.18,h:125},green:{l:.55,c:.15,h:155},teal:{l:.56,c:.12,h:195},cyan:{l:.58,c:.13,h:220},sky:{l:.85,c:.09,h:230},blue:{l:.55,c:.19,h:258},indigo:{l:.48,c:.2,h:272},violet:{l:.47,c:.2,h:300},purple:{l:.48,c:.21,h:315},pink:{l:.54,c:.2,h:355}},mi=()=>Object.keys(pi),hi={"color-danger":`red`,"color-success":`green`,"color-warning":`amber`,"color-info":`blue`};let gi=null;const _i=()=>gi??=Object.fromEntries(Object.entries(pi).map(([e,t])=>[`color-${e}`,ni(t)])),vi=()=>Object.fromEntries(Object.entries(hi).map(([e,t])=>[e,`var(--imp-color-${t})`])),yi={none:{"radius-item":`0px`,"radius-container":`0px`},small:{"radius-item":`3px`,"radius-container":`6px`},medium:{"radius-item":`6px`,"radius-container":`10px`},large:{"radius-item":`10px`,"radius-container":`16px`}},bi={light:`#0f172a`,dark:`#ffffff`},xi=(e,t)=>`${e} rgb(from var(--imp-color-shadow) r g b / ${t}%)`,Si={none:[`none`,`none`,`none`],soft:[xi(`0 1px 2px`,10),xi(`0 4px 12px`,12),xi(`0 12px 32px`,18)],strong:[xi(`0 1px 3px`,18),xi(`0 6px 16px`,22),xi(`0 18px 44px`,30)]},Ci=[`spinner`,`dots`,`bar`,`pulse`],wi=()=>[...Ci],Ti=e=>Ci.includes(e),Ei={light:{surface:.995,sunken:.97,hover:.955,border:.86,text:.22},dark:{surface:.205,sunken:.165,hover:.26,border:.37,text:.93}},Di={surface:.004,sunken:.008,hover:.01,border:.022,text:.02},Oi=(e,t,n)=>ni({l:Ei[t][n],c:Math.min(e.c,Di[n]),h:e.h}),ki=(e,t)=>({[t]:ni(e),[`color-on-${t.slice(6)}`]:li(e)}),Ai=e=>typeof e==`string`&&Gr.test(e),ji=(e,t)=>Zr(Yr(Ai(e)?e:t)),Mi=({primary:e,secondary:t,mode:n})=>{let r=n===`dark`?`dark`:`light`,i=ji(e,`#3b6fe0`),a=ji(t,`#6b7280`),o=Zr(Yr(_i()[`color-${hi[`color-danger`]}`])),s=Oi(a,r,`surface`),c=Oi(a,r,`sunken`),l=[s,c],u=di(o,l)&&ui(o)?{"color-on-danger":li(o)}:ki(fi(o,l,r,{solid:!0}),`color-danger`);return{"color-scheme":r,..._i(),...vi(),...ki(fi(i,l,r,{solid:!0}),`color-primary`),...u,"color-secondary":ni(fi(a,l,r)),"color-text":Oi(a,r,`text`),"color-heading":`var(--imp-color-text)`,"color-surface":s,"color-surface-sunken":c,"color-surface-hover":Oi(a,r,`hover`),"color-border":Oi(a,r,`border`),"color-shadow":bi[r]}},Ni=[`light`,`dark`],Pi=e=>{let t=e?.[`color-scheme`];return Ni.includes(t)?t:void 0},Fi=e=>yi[e]??yi.medium,Ii=e=>({loader:Ti(e)?e:`spinner`}),Li=e=>{let[t,n,r]=Si[e]??Si.soft;return{"shadow-sm":t,"shadow-md":n,"shadow-lg":r}},Ri=`--imp-`,zi=`48rem`,Bi=/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/,Vi=/* @__PURE__ */ `font-family.font-family-mono.font-family-heading.font-size-sm.font-size-md.font-size-lg.font-size-xl.font-size-2xl.font-weight-normal.font-weight-bold.line-height-tight.line-height-normal.space-1.space-2.space-3.space-4.space-5.space-6.space-page.breakpoint-desktop.border-width.focus-ring-width.icon-stroke-width.duration-fast.duration-medium.disabled-opacity.color-gray.color-brown.color-red.color-orange.color-amber.color-yellow.color-lime.color-green.color-teal.color-cyan.color-sky.color-blue.color-indigo.color-violet.color-purple.color-pink.color-danger.color-success.color-warning.color-info.color-primary.color-on-primary.color-on-danger.color-secondary.color-text.color-heading.color-surface.color-surface-sunken.color-surface-hover.color-border.color-shadow.radius-item.radius-container.shadow-sm.shadow-md.shadow-lg.loader.background-app.color-scheme`.split(`.`),Hi=`imp.theme`;let Ui=null;const Wi=()=>(Ui??=k(Hi,null),Ui),Gi={name:Hi,get:()=>Wi().get(),watch:(...e)=>Wi().watch(...e),text:e=>Wi().text(e),view:e=>Wi().view(e),each:(e,t)=>Wi().each(e,t)},Ki=e=>{Bi.test(e)||h.warn(`applyTheme: token name '${e}' is suspicious - use a bare dash-separated lowercase name like 'color-primary'; imp adds the '${Ri}' prefix. Applying it anyway`)},qi=(e,t)=>{for(let[n,r]of Object.entries(t)){Ki(n);let t=Ri+n,i=String(r);e.style.setProperty(t,i),i!==``&&e.style.getPropertyValue(t)===``&&h.warn(`applyTheme: the browser ignored token '${n}' with value '${i}' - check it is a valid CSS value`)}},Ji=e=>e.name?`theme '${e.name}'`:`the theme`,Yi=/* @__PURE__ */ new Set,Xi=e=>{let t=Ji(e);Yi.has(t)||(Yi.add(t),h.warn(`applyTheme: token 'color-scheme' of ${t} is '${e.tokens[`color-scheme`]??``}' - it must be 'light' or 'dark', so that a native control, a scrollbar and CSS that reads prefers-color-scheme follow the theme; leaving color-scheme unset`))},Zi=(e,t)=>{let n=Pi(t.tokens);n===void 0?(Xi(t),e.style.removeProperty(`color-scheme`)):e.style.setProperty(`color-scheme`,n)},Qi=/* @__PURE__ */ new Set,$i=e=>{let t=Ji(e),n=Vi.filter(n=>!Object.hasOwn(e.tokens,n)&&!Qi.has(`${t} ${n}`));if(n.length===0)return;for(let e of n)Qi.add(`${t} ${e}`);let r=n.slice(0,6).join(`, `),i=n.length-6;h.warn(`applyTheme: ${t} has no value for ${n.length} token(s) - ${r}${i>0?` and ${i} more`:``}; a component falls back to the built-in value, and a previous theme can show through. Give every token a value, or start from a built-in theme with base: 'imp-light'`)},ea=e=>{let t=e.loader;if(t===void 0||Ti(t))return;let n=wi().map(e=>`'${e}'`).join(`, `);h.warn(`applyTheme: token 'loader' is '${t}' - the shapes are ${n}; every loading state draws the spinner`)},ta={"font-family":`system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`,"font-family-mono":`ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace`,"font-family-heading":`var(--imp-font-family)`,"font-size-sm":`0.875rem`,"font-size-md":`1rem`,"font-size-lg":`1.125rem`,"font-size-xl":`1.5rem`,"font-size-2xl":`2rem`,"font-weight-normal":`400`,"font-weight-bold":`600`,"line-height-tight":`1.25`,"line-height-normal":`1.6`,"space-1":`4px`,"space-2":`8px`,"space-3":`clamp(0.625rem, 0.573rem + 0.221vw, 0.75rem)`,"space-4":`clamp(0.75rem, 0.646rem + 0.442vw, 1rem)`,"space-5":`clamp(1rem, 0.793rem + 0.884vw, 1.5rem)`,"space-6":`clamp(1.25rem, 0.939rem + 1.326vw, 2rem)`,"space-page":`clamp(1rem, 0.171rem + 3.536vw, 3rem)`,"breakpoint-desktop":zi,"border-width":`1px`,"focus-ring-width":`2px`,"icon-stroke-width":`2`,"duration-fast":`120ms`,"duration-medium":`220ms`,"disabled-opacity":`0.55`},na={primary:`#2563eb`,secondary:`#64748b`,radius:`medium`,shadow:`soft`,loader:`spinner`},ra=({primary:e,secondary:t,radius:n,shadow:r,loader:i,mode:a,overrides:o})=>{let s={...ta,...Mi({primary:e,secondary:t,mode:a}),...Fi(n),...Li(r),...Ii(i),...o};return{...s,"background-app":s[`background-app`]??s[`color-surface`]}};let ia=null;const aa=()=>ia??=ra({...na,mode:`light`}),oa={"border-width":`2px`,"focus-ring-width":`3px`,"disabled-opacity":`0.7`},sa=()=>({"imp-light":{name:`imp-light`,tokens:aa()},"imp-dark":{name:`imp-dark`,tokens:ra({primary:`#7c9cff`,secondary:`#94a3b8`,radius:`medium`,shadow:`soft`,loader:`spinner`,mode:`dark`})},"imp-high-contrast-light":{name:`imp-high-contrast-light`,tokens:ra({primary:`#000080`,secondary:`#3d3d3d`,radius:`medium`,shadow:`none`,loader:`spinner`,mode:`light`,overrides:{...oa,"color-text":`#000000`,"color-surface":`#ffffff`,"color-surface-sunken":`#eeeeee`,"color-surface-hover":`#dcdcdc`,"color-border":`#000000`,"color-danger":`#a30000`,"color-on-danger":`#ffffff`}})},"imp-high-contrast-dark":{name:`imp-high-contrast-dark`,tokens:ra({primary:`#6fd2ff`,secondary:`#d0d0d0`,radius:`medium`,shadow:`none`,loader:`spinner`,mode:`dark`,overrides:{...oa,"color-text":`#ffffff`,"color-surface":`#000000`,"color-surface-sunken":`#0d0d0d`,"color-surface-hover":`#333333`,"color-border":`#ffffff`,"color-danger":`#ff8a8a`,"color-on-danger":`#000000`}})}});let ca=null;const la=()=>ca??=sa(),ua=()=>{let e=Object.keys(la()).map(e=>`'${e}'`);return`${e.slice(0,-1).join(`, `)} or ${e.at(-1)}`},da=e=>{if(!Object.hasOwn(la(),e))throw Error(`imp: applyTheme does not know a built-in theme named '${e}' - pass ${ua()}, or a theme object`);return la()[e]},fa=e=>!!e&&typeof e==`object`&&!Array.isArray(e),pa=e=>Array.isArray(e)?e.map(pa):E(e)?Object.fromEntries(Object.entries(e).map(([e,t])=>[e,pa(t)])):e,ma=e=>{if(typeof e==`string`)return da(e);if(!fa(e))throw Error(`imp: applyTheme needs ${ua()}, or a theme object like { name, tokens: { 'color-surface': '#...' } }, or { base: 'imp-light', tokens: { 'font-family': '...' } }`);let{base:t,tokens:n,...r}=e;if(!fa(n))throw Error(`imp: applyTheme needs a theme with a 'tokens' object mapping token names to CSS values`);if(t===void 0)return pa(e);if(typeof t!=`string`)throw Error(`imp: applyTheme needs 'base' to name a built-in theme, ${ua()}`);let i=da(t);return pa({name:i.name,...r,tokens:{...i.tokens,...n}})};function ha(e){let t=ma(e);if(typeof document<`u`){let e=document.documentElement;qi(e,t.tokens),Zi(e,t)}return $i(t),ea(t.tokens),Wi().set(t),h.debug(`applied theme '${t.name??`(unnamed)`}'`),t}const ga=[`theme`,`translations`,`lang`,`dir`];async function _a(e={}){if(!E(e))throw Error(`imp: init needs an options object like { theme: 'imp-light', translations: { en: () => import('./locales/en.js') } }`);let t=Object.keys(e).filter(e=>!ga.includes(e));if(t.length>0)throw Error(`imp: init got unknown option${t.length>1?`s`:``} ${t.map(e=>`'${e}'`).join(`, `)} - it takes ${ga.map(e=>`'${e}'`).join(`, `)}`);let{theme:n,translations:r,lang:i,dir:a}=e;if(n!==void 0&&ha(n),a!==void 0&&En(a),i!==void 0){if(typeof i!=`string`||i.trim()===``)throw Error(`imp: init({ lang }) needs a language code like 'en' or 'pt-BR'`);On(i)}Dn(),r!==void 0&&await In(r,`init({ translations })`).load(gn())}const va=`http`,ya=Symbol(`imp.http.client`),ba=Symbol(`imp.http.trackerStates`),xa=Symbol(`imp.http.closeWithOwner`),Sa=/^[a-z][a-z\d+.-]*:/i,Ca=/* @__PURE__ */ new Set([`GET`,`HEAD`,`OPTIONS`,`PUT`,`DELETE`]),wa=/* @__PURE__ */ new Set([`GET`,`HEAD`]),Ta=/* @__PURE__ */ new Set([204,205,304]),Ea=[`exponential`,`fixed`],Da=/* @__PURE__ */ new Set([408,429,500,502,503,504]),Oa=/* @__PURE__ */ new Set([`network`,`timeout`]),ka=/* @__PURE__ */ new Set([429,503]),Aa=`x-request-id`,ja=/^[!#$%&'*+.^_`|~\dA-Za-z-]+$/,Ma=/^application\/([\w.-]+\+)?json\b/i,Na=/^text\/|\+xml\b|^application\/xml\b|x-www-form-urlencoded/i,Pa={attempts:1,backoff:`exponential`,delay:300,maxDelay:3e4,jitter:!0,retryOn:null};var Fa=class extends Error{constructor(e,t={}){super(e,t.cause===void 0?void 0:{cause:t.cause}),this.name=`HttpError`,this.status=t.status??0,this.code=t.code??`status`,this.method=t.method??null,this.url=t.url??null,this.headers=t.headers??{},this.body=t.body}};const Ia=e=>new Fa(`imp: http - ${e.method} ${e.url} was aborted`,{code:`aborted`,method:e.method,url:e.url}),La=(e,t,n)=>new Fa(`imp: ${e} - ${n.method} ${n.url} was cancelled: ${t}`,{code:`aborted`,method:n.method,url:n.url}),Ra=(e,t,n)=>new Fa(`imp: http - ${e.method} ${e.url} timed out after ${t}ms`,{code:`timeout`,method:e.method,url:e.url,cause:n}),za=/* @__PURE__ */ new Set([`network`,`timeout`]),Ba=e=>za.has(e?.code)||e?.code===`status`&&e.status>=500,Va=(e,t)=>e instanceof Fa?e:new Fa(`imp: http - ${t.method} ${t.url} failed: ${e?.message??e}`,{code:`network`,method:t.method,url:t.url,cause:e}),Ha=e=>{if(!e)return[];if(typeof e.forEach==`function`&&typeof e.get==`function`){let t=[];return e.forEach((e,n)=>t.push([n,e])),t}return Array.isArray(e)?e:Object.entries(e)},Ua=e=>{let t={};for(let[n,r]of Ha(e))r!=null&&(t[String(n).toLowerCase()]=String(r));return t},Wa=()=>{let e=crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(16));e[6]=e[6]&15|64,e[8]=e[8]&63|128;let t=Array.from(e,e=>e.toString(16).padStart(2,`0`)).join(``);return`${t.slice(0,8)}-${t.slice(8,12)}-${t.slice(12,16)}-${t.slice(16,20)}-${t.slice(20)}`},Ga=(e,t,n=Aa)=>{if(e===void 0)return n;if(e===!1||e===null)return null;if(e===!0)return Aa;let r=typeof e==`string`?e.trim().toLowerCase():``;if(!ja.test(r))throw Error(`imp: ${t} - requestId must be a header name like '${Aa}', or false to send no request id`);return r},Ka=(e,t)=>Sa.test(t)||!e?t:`${e.replace(/\/+$/,``)}/${t.replace(/^\/+/,``)}`,qa=()=>globalThis.location?.href??`http://localhost/`,Ja=(e,t,n)=>{if(t!=null){if(!E(t))throw Error(`imp: ${n} - query must be a plain object of values, like { page: 2 }`);for(let[n,r]of Object.entries(t))if(r!=null)for(let t of Array.isArray(r)?r:[r])t!=null&&e.searchParams.append(n,String(t))}},Ya=e=>E(e)||Array.isArray(e)||typeof e==`number`||typeof e==`boolean`,Xa=(e,t)=>e==null?null:Ya(e)?(t[`content-type`]??=`application/json`,JSON.stringify(e)):e,Za=e=>e===null||typeof e==`string`||typeof e==`number`||typeof e==`boolean`||Array.isArray(e)||E(e),Qa=(e,t)=>{if(e)return new Promise((n,r)=>{let i=()=>{clearTimeout(o),t?.removeEventListener(`abort`,a)},a=()=>{i(),r(new Fa(`imp: http - the request was aborted`,{code:`aborted`}))};if(t?.aborted){r(new Fa(`imp: http - the request was aborted`,{code:`aborted`}));return}let o=setTimeout(()=>{i(),n()},e);t?.addEventListener(`abort`,a,{once:!0})})},$a=(e,t)=>{let n=()=>{};return{stopped:new Promise((r,i)=>{if(!e)return;if(e.aborted){i(t());return}let a=()=>i(t());e.addEventListener(`abort`,a,{once:!0}),n=()=>e.removeEventListener(`abort`,a)}),release:n}},eo=async(e,t)=>{if(Ta.has(e.status))return null;let n=e.headers.get(`content-type`)??``;if(Ma.test(n)){let r=await e.text();if(r===``)return null;try{return JSON.parse(r)}catch(r){throw new Fa(`imp: http - ${t.method} ${t.url} answered with ${n} that is not valid JSON`,{code:`parse`,status:e.status,method:t.method,url:t.url,cause:r})}}if(Na.test(n))return e.text();if(n===``){let t=await e.text();return t===``?null:t}return e.blob()},to=async(e,t)=>({status:e.status,statusText:e.statusText,ok:e.status>=200&&e.status<300,url:t.url,method:t.method,headers:Ua(e.headers),body:await eo(e,t)}),no=e=>new Fa(`imp: http - ${e.method} ${e.url} answered ${e.status}${e.statusText?` ${e.statusText}`:``}`,{code:`status`,status:e.status,method:e.method,url:e.url,headers:e.headers,body:e.body}),ro=e=>{if(!e||!ka.has(e.status))return null;let t=e.headers[`retry-after`];if(!t)return null;let n=Number(t);if(Number.isFinite(n))return Math.max(0,n*1e3);let r=Date.parse(t);return Number.isNaN(r)?null:Math.max(0,r-Date.now())},io=(e,t,n)=>{if(n!==null)return Math.min(n,e.maxDelay);let r=e.backoff===`fixed`?e.delay:e.delay*2**(t-1),i=Math.min(r,e.maxDelay);return e.jitter?i/2+i/2*Math.random():i},ao=(e,t)=>typeof e.retryOn==`function`?e.retryOn({status:t.record?.status??null,error:t.error,attempt:t.attempt,request:t.request})===!0:t.record?Array.isArray(e.retryOn)?e.retryOn.includes(t.record.status):Da.has(t.record.status):Oa.has(t.error.code),oo=(e,t,n)=>{if(e==null)return[];let r=Array.isArray(e)?e:[e];for(let e of r)if(typeof e!=`function`)throw Error(`imp: ${t} - ${n} takes a function (or an array of them) receiving the ${n===`onRequest`?`request before it is sent`:`response before it is returned`}`);return r},so=async(e,t,n,r,i,a=[])=>{let o=i;for(let i of e){let e;try{e=await i(o,...a)}catch(e){throw e instanceof Fa?e:new Fa(`imp: http - an ${n} hook rejected ${r.method} ${r.url}: ${e?.message??e}`,{code:`hook`,method:r.method,url:r.url,cause:e})}e!=null&&(E(e)?o=e:h.error(`${t}: an ${n} hook returned ${typeof e} instead of the ${n===`onRequest`?`request`:`response`} - keeping the one it received`))}return o},co=(e,t)=>{if(e==null||e===!1)return 0;if(typeof e!=`number`||!Number.isFinite(e)||e<0)throw Error(`imp: ${t} - timeout must be a number of milliseconds, like 10000`);return e},lo=(e,t,n=Pa)=>{if(e==null)return n;if(e===!1)return{...n,attempts:1};if(e===!0)return{...n,attempts:3};if(typeof e==`number`)return{...n,attempts:e};if(!E(e))throw Error(`imp: ${t} - retry takes a number of attempts or an object like { attempts: 3, backoff: 'exponential', retryOn: [502, 503] }`);let r={...n,...e};if(!Number.isInteger(r.attempts)||r.attempts<1)throw Error(`imp: ${t} - retry.attempts must be a whole number of attempts, like 3`);if(!Ea.includes(r.backoff))throw Error(`imp: ${t} - retry.backoff must be ${Ea.map(e=>`'${e}'`).join(` or `)}`);let{retryOn:i}=r;if(i!==null&&typeof i!=`function`&&!Array.isArray(i))throw Error(`imp: ${t} - retry.retryOn must be an array of status codes or a function deciding from { status, error, attempt, request }`);return r},uo=e=>Tt(e.name,()=>e),fo=e=>({message:e?.message??String(e),status:e?.status??0,code:e?.code??`error`,method:e?.method??null,url:e?.url??null,body:Za(e?.body)?e.body:null}),po=e=>{let t=k(`${e}.pending`,0),n=k(`${e}.lastError`,null);return{start:()=>t.set(t.get()+1),settle:(e,{keepError:r=!1}={})=>{t.set(Math.max(0,t.get()-1)),!r&&(e?e.code!==`aborted`&&n.set(fo(e)):n.get()!==null&&n.set(null))},clearError:()=>n.set(null),pending:uo(t),lastError:uo(n),states:{pending:t,lastError:n}}},mo=(e,t)=>{if(!e)return{signal:t,release:()=>{},expired:()=>!1};let n=new AbortController,r=!1,i=setTimeout(()=>{r=!0,n.abort()},e);return{signal:t?AbortSignal.any([t,n.signal]):n.signal,release:()=>clearTimeout(i),expired:()=>r}},ho=(e,t)=>{let n=`http client '${e}'`;if(!E(t))throw Error(`imp: ${n} - the second argument configures the client, like { baseUrl }`);let r=t.baseUrl??``;if(typeof r!=`string`)throw Error(`imp: ${n} - baseUrl must be a string like 'https://api.example.com'`);let i=Ua(t.headers),a=lo(t.retry,n),o=co(t.timeout,n),s=oo(t.onRequest,n,`onRequest`),c=oo(t.onResponse,n,`onResponse`),l=Ga(t.requestId,n),u=po(e),d=/* @__PURE__ */ new Map,f=t=>{if(typeof t!=`string`||t.trim()===``)throw Error(`imp: ${n} - track needs a name for the request, like track: 'users.list'`);let r=d.get(t);return r||(r=po(`${e}.${t}`),d.set(t,r)),r},p=new AbortController,m=null,g=(e,t,a,o)=>{if(typeof t!=`string`||t===``)throw Error(`imp: ${n} - ${e.toLowerCase()} needs a path, like ${e.toLowerCase()}('/users')`);let s=new URL(Ka(r,t),qa());Ja(s,a.query,n);let c={...i,...Ua(a.headers)};o&&(c[o]??=Wa());let l=wa.has(e)?null:Xa(a.body,c);return{method:e,url:s.href,headers:c,body:l,signal:a.signal?AbortSignal.any([p.signal,a.signal]):p.signal,meta:a.meta??{}}},_=e=>globalThis.fetch(e.url,{method:e.method,headers:e.headers,body:e.body??void 0,signal:e.signal??void 0}),v=async(e,t)=>{let r=mo(t.timeout,e.signal),i={...e,headers:{...e.headers},signal:r.signal},a=()=>r.expired()?Ra(i,t.timeout):p.signal.aborted?La(n,m,i):Ia(i),o=$a(r.signal,a),{stopped:s}=o;try{let e=await Promise.race([so(t.onRequest,n,`onRequest`,i,i),s]),o;try{o=await Promise.race([_(e),s])}catch(t){throw r.signal?.aborted?a():Va(t,e)}let c=await Promise.race([to(o,e),s]);return{record:await Promise.race([so(t.onResponse,n,`onResponse`,e,c,[e]),s]),request:e}}finally{o.release(),r.release()}},y=async(e,t)=>{for(let r=1;;r++){let i=null,a;try{let n=await v(e,t);if(n.record.ok)return n.record;i=n.record,a=no(i)}catch(t){a=Va(t,e)}let o={error:a,record:i,attempt:r,request:e};if(a.code===`aborted`||r>=t.retry.attempts||!ao(t.retry,o))throw a;let s=io(t.retry,r,ro(i));h.debug(`${n}: ${e.method} ${e.url} failed (${a.code}${a.status?` ${a.status}`:``}) - retrying in ${Math.round(s)}ms`);try{await Qa(s,e.signal)}catch{throw p.signal.aborted?La(n,m,e):Ia(e)}}},b=async(e,t,r,i)=>{if(m)throw new Fa(`imp: ${n} - ${e} ${t} was not sent: ${m}`,{code:`aborted`,method:e,url:t});if(r!=null&&!E(r))throw Error(`imp: ${n} - the second argument of ${e.toLowerCase()} is the call's options, like { body, query, headers }`);let d=r??{},p={retry:d.retry===void 0?Ca.has(e)?a:{...a,attempts:1}:lo(d.retry,n,a),timeout:d.timeout===void 0?o:co(d.timeout,n),onRequest:[...s,...oo(d.onRequest,n,`onRequest`)],onResponse:[...c,...oo(d.onResponse,n,`onResponse`)],requestIdHeader:Ga(d.requestId,n,l)},h=g(e,t,d,p.requestIdHeader),_=d.track===void 0?null:f(d.track),v=d.silent===!0;u.start(),_?.start();try{let e=await y(h,p);if(m)throw La(n,m,h);return u.settle(null),_?.settle(null),i?e:e.body}catch(e){throw v?u.settle(null,{keepError:!0}):u.settle(e),_?.settle(e),Ba(e)&&re(),e}},x=e=>(t,n)=>b(e,t,n,!1),S=e=>{m||(m=e,p.abort(),d.clear(),h.debug(`${n}: ${e} - requests in flight cancelled`))};return{name:e,get:x(`GET`),post:x(`POST`),put:x(`PUT`),patch:x(`PATCH`),delete:x(`DELETE`),head:x(`HEAD`),request:(e,t)=>b((t?.method??`GET`).toUpperCase(),e,t,!0),pending:u.pending,lastError:u.lastError,clearError:()=>u.clearError(),tracked:e=>{let t=f(e);return{pending:t.pending,lastError:t.lastError}},close:()=>S(`the client was closed`),[ya]:!0,[ba]:e=>(e===null?u:f(e)).states,[xa]:()=>S(`the client was closed when its component unmounted`)}},go=e=>y(e,`http client name`,`myapp.api`),_o=e=>{let t=go(e);if(t)throw Error(`imp: ${t}`)},vo=e=>e==null||E(e),yo=(e,t,n,r)=>new Fa(`imp: http client '${e}' - ${n} ${r} was cancelled: <${t.localName}> left the page`,{code:`aborted`,method:String(n).toUpperCase(),url:r}),bo=(e,t,n)=>{let r=t,i=()=>b(va,e,n.host)?.value??null;n.addRebind(()=>{let t=i();t?r=t:h.error(`http client '${e}' is not provided at the new position of <${n.host.localName}> - keeping the previous client: calls still go through it, but nothing at this position shares it`)});let a=(r,a)=>Dt(`${r===null?e:`${e}.${r}`}.${a}`,t[ba](r)[a],()=>i()?.[ba](r)[a]??null,n),o=a(null,`pending`),s=a(null,`lastError`),c=new AbortController;n.addCleanup(()=>c.abort());let l=t=>(i,a)=>{if(n.ended||a?.detached===!0||!vo(a))return r[t](i,a);let o=a?.signal?AbortSignal.any([c.signal,a.signal]):c.signal;return r[t](i,{...a,signal:o}).then(r=>{if(n.ended)throw yo(e,n.host,a?.method??t,i);return r})};return{name:e,get:l(`get`),post:l(`post`),put:l(`put`),patch:l(`patch`),delete:l(`delete`),head:l(`head`),request:l(`request`),pending:o,lastError:s,clearError:()=>r.clearError(),tracked:e=>({pending:a(e,`pending`),lastError:a(e,`lastError`)})}},xo=e=>!!e?.[ya],So=(e,t,n,r)=>{let i=r?t.name:t,a=e.host,o=b(va,i,a);if(o&&o.provider===a)throw Error(`imp: http client '${i}' is already initialized in this scope - initHttpClient runs once per scope; call useHttpClient(self, '${i}') to reach the existing client`);let s=r?t:ho(i,n);return h.debug(`http client '${i}' ${r?`shared into`:`initialized in`} <${a.localName}>`),x(va,i,s,a,e),r||e.addCleanup(()=>s[xa]()),s},Co=(e,t)=>{let n=b(va,t,e.host);if(!n)throw Error(`imp: no http client '${t}' is initialized in the ancestors of <${e.host.localName}> - call initHttpClient(self, '${t}', { baseUrl }) in the setup of an ancestor component first`);return h.debug(`http client '${t}' resolved from <${n.provider.localName}>`),bo(t,n.value,e)};function wo(e,t,n={}){let r=xo(t),i=r?t.name:t;return Ie(e,va,`initHttpClient`,i,e=>{if(!r&&typeof t!=`string`)throw Error(`imp: initHttpClient takes self, a name and options, like initHttpClient(self, 'myapp.api', { baseUrl }), or self and a client from createHttpClient to share with this subtree`);return r||_o(i),So(e,t,n,r)})}function To(e,t){return Fe(e,va,`useHttpClient`,t,e=>(_o(t),Co(e,t)))}const Eo=async(e,t)=>{for(let n of e)try{if(await n()===!1)return!1}catch(e){return h.error(`${t} failed - imp keeps what is on the screen`,e),!1}return!0},Do=[`none`,`fade`,`slide`,`zoom`],Oo=`imp-screen`,ko=`data-imp-screen-back`,Ao=`var(--imp-duration-medium, 200ms)`;let jo=null,Mo=`none`,No=null,Po=null;const Fo=()=>`
  ::view-transition {
    pointer-events: none;
  }

  :root {
    --imp-screen-out: -8%;
    --imp-screen-in: 8%;
  }

  :root[dir='rtl'],
  :root[${ko}] {
    --imp-screen-out: 8%;
    --imp-screen-in: -8%;
  }

  :root[dir='rtl'][${ko}] {
    --imp-screen-out: -8%;
    --imp-screen-in: 8%;
  }

  @media (prefers-reduced-motion: reduce) {
    ::view-transition-old(${Oo}),
    ::view-transition-new(${Oo}) {
      animation: none;
    }
  }
`,Io={fade:`
    ::view-transition-old(${Oo}) {
      animation: ${Ao} ease-out both imp-screen-fade-out;
    }

    ::view-transition-new(${Oo}) {
      animation: ${Ao} ease-out both imp-screen-fade-in;
    }

    @keyframes imp-screen-fade-out {
      to { opacity: 0 }
    }

    @keyframes imp-screen-fade-in {
      from { opacity: 0 }
    }
  `,slide:`
    ::view-transition-old(${Oo}) {
      animation: ${Ao} ease-in both imp-screen-slide-out;
    }

    ::view-transition-new(${Oo}) {
      animation: ${Ao} ease-out both imp-screen-slide-in;
    }

    @keyframes imp-screen-slide-out {
      to {
        opacity: 0;
        translate: var(--imp-screen-out) 0;
      }
    }

    @keyframes imp-screen-slide-in {
      from {
        opacity: 0;
        translate: var(--imp-screen-in) 0;
      }
    }
  `,zoom:`
    ::view-transition-old(${Oo}) {
      animation: ${Ao} ease-in both imp-screen-zoom-out;
    }

    ::view-transition-new(${Oo}) {
      animation: ${Ao} ease-out both imp-screen-zoom-in;
    }

    @keyframes imp-screen-zoom-out {
      to {
        opacity: 0;
        scale: 1.02;
      }
    }

    @keyframes imp-screen-zoom-in {
      from {
        opacity: 0;
        scale: 0.98;
      }
    }
  `},Lo=e=>{No===null&&(No=new CSSStyleSheet,document.adoptedStyleSheets=[...document.adoptedStyleSheets,No]),No.replaceSync(`${Fo()}${Io[e]}`)},Ro=(e,t)=>{Mo=t,jo=e,t===`none`?e.style.removeProperty(`view-transition-name`):(Lo(t),e.style.setProperty(`view-transition-name`,Oo))},zo=e=>{jo===e&&(e.style.removeProperty(`view-transition-name`),jo=null,Mo=`none`)},Bo=()=>jo,Vo=()=>globalThis.matchMedia(`(prefers-reduced-motion: reduce)`).matches,Ho=(e,{back:t=!1}={})=>{if(Mo===`none`||document.visibilityState===`hidden`||Vo()){e();return}let n=document.documentElement;n.toggleAttribute(ko,t);let r=document.startViewTransition(e);Po=r,r.ready.catch(()=>{}),r.updateCallbackDone.catch(e=>{h.error(`the screen failed to change inside its transition`,e)});let i=()=>{Po===r&&(Po=null,n.removeAttribute(ko))};return r.finished.then(i,i),r},Uo=e=>e.map(e=>`'${e}'`).join(`, `),Wo=(e,t)=>{let{props:n,children:r}=Ke(t,`${e}()`);return{props:n??{},children:r}},Go=(e,t,n)=>{for(let r of Object.keys(t))n.includes(r)||h.warn(`${e}: unknown prop '${r}' - supported props are ${Uo(n)}`)},I=(e,t,n,r,i)=>n==null?i:r.includes(n)?n:(h.warn(`${e}: '${t}' must be one of ${Uo(r)} - got '${n}', using '${i}'`),i),Ko=(e,t)=>{e.abortSignal.addEventListener(`abort`,t,{once:!0})},L=(e,t,n)=>{D(t)?t.watch(e,n):n(t)},R=(e,t)=>{let n=document.createTextNode(``);return L(e,t,e=>{let t=e==null?``:String(e);n.data!==t&&(n.data=t)}),n},qo=(e,t)=>t instanceof Node?t:R(e,t),Jo=e=>`imp-${e.replace(/[A-Z]/g,e=>`-${e.toLowerCase()}`)}`,Yo={},Xo=(e,t,n)=>{n?.();let{props:r,styles:i,setup:a,...o}=t();return T(Jo(e),{...o,styles:i?.(),setup:(t,...n)=>{let{props:i,children:o}=Wo(e,n);return Go(e,i,r),a(t,i,o)}})},z=(e,t,n)=>Yo[e]??=Xo(e,t,n),Zo=(...e)=>O(`a`,...e),Qo=(...e)=>O(`audio`,...e),$o=(...e)=>O(`button`,...e),es=(...e)=>O(`caption`,...e),ts=(...e)=>O(`code`,...e),ns=(...e)=>O(`details`,...e),rs=(...e)=>O(`dialog`,...e),B=(...e)=>O(`div`,...e),is=(...e)=>O(`figure`,...e),as=(...e)=>O(`header`,...e),os=(...e)=>O(`iframe`,...e),ss=(...e)=>O(`img`,...e),cs=(...e)=>O(`input`,...e),ls=(...e)=>O(`kbd`,...e),us=(...e)=>O(`label`,...e),ds=(...e)=>O(`li`,...e),fs=(...e)=>O(`main`,...e),ps=(...e)=>O(`mark`,...e),ms=(...e)=>O(`nav`,...e),hs=(...e)=>O(`ol`,...e),gs=(...e)=>O(`p`,...e),_s=(...e)=>O(`pre`,...e),vs=(...e)=>O(`section`,...e),V=(...e)=>O(`span`,...e),ys=(...e)=>O(`summary`,...e),bs=(...e)=>O(`table`,...e),xs=(...e)=>O(`tbody`,...e),H=(...e)=>O(`td`,...e),Ss=(...e)=>O(`textarea`,...e),Cs=(...e)=>O(`th`,...e),ws=(...e)=>O(`thead`,...e),Ts=(...e)=>O(`tr`,...e),Es=(...e)=>O(`ul`,...e),Ds=(...e)=>O(`video`,...e),Os=/^var\(--imp-([a-z0-9-]+)\)$/,ks=e=>{let t=aa();if(!Object.hasOwn(t,e))throw Error(`imp: '${e}' is not a theme token - see the tokens in applyTheme`);let n=Os.exec(t[e]);return n===null?t[e]:ks(n[1])},U=e=>`var(--imp-${e}, ${ks(e)})`,As=(e,t)=>`color-mix(in oklab, ${U(e)}, ${U(`color-text`)} ${t})`,js=e=>As(e,`12%`),Ms=e=>As(e,`24%`),Ns=()=>`
  scrollbar-width: thin;
  scrollbar-color: color-mix(in oklch, ${U(`color-text`)} 28%, transparent) transparent;
`,W=()=>`
  font-family: ${U(`font-family`)};
  font-weight: ${U(`font-weight-normal`)};
`,G=()=>`
  outline: ${U(`focus-ring-width`)} solid ${U(`color-primary`)};
  outline-offset: 2px;
`,Ps=`--imp-corner-inline-start`,Fs=`--imp-corner-inline-end`,Is=`--imp-seam-shift`,Ls=`--imp-seam-lift`,Rs=`--imp-seam-keep`,zs=()=>`
  border-start-start-radius: var(${Ps}, ${U(`radius-item`)});
  border-end-start-radius: var(${Ps}, ${U(`radius-item`)});
  border-start-end-radius: var(${Fs}, ${U(`radius-item`)});
  border-end-end-radius: var(${Fs}, ${U(`radius-item`)});
  margin-inline-start: var(${Is}, 0);
`,Bs=e=>`
  ${e}:hover,
  ${e}:focus-visible {
    z-index: var(${Ls}, auto);
  }
`,Vs=e=>`
  ${e} {
    z-index: var(${Rs}, auto);
  }
`,Hs=()=>`
  ${Ps}: initial;
  ${Fs}: initial;
  ${Is}: initial;
  ${Ls}: initial;
  ${Rs}: initial;
`,Us=e=>`
  ${e} > * {
    ${Ls}: 1;
    ${Rs}: 2;
  }

  ${e} > *:not(:first-child) {
    ${Ps}: 0;
    ${Is}: calc(-1 * ${U(`border-width`)});
  }

  ${e} > *:not(:last-child) {
    ${Fs}: 0;
  }
`,Ws=`
  @media (forced-colors: active) {
    button, input, select, textarea { border-color: ButtonBorder }
    button:disabled, input:disabled, select:disabled, textarea:disabled { color: GrayText }
  }
`,Gs=`
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
`,Ks=`
  [hidden] { display: none !important }
`,qs=(e,t,n)=>`\n${t.map(([t,r])=>`  .${e}-${t} { ${n(r)} }`).join(`
`)}\n`,Js=[`default`,`secondary`],Ys=[`sm`,`md`,`lg`],Xs=[`normal`,`bold`],Zs=[`start`,`center`,`end`],Qs=[[`default`,`color-text`],[`secondary`,`color-secondary`]],$s=e=>e.map(e=>[e,e]),ec=()=>qs(`tone`,Qs,e=>`color: ${U(e)}`),tc=()=>qs(`size`,$s(Ys),e=>`font-size: ${U(`font-size-${e}`)}`),nc={sm:{block:`space-1`,inline:`space-3`},md:{block:`space-2`,inline:`space-4`},lg:{block:`space-3`,inline:`space-5`}},rc=(e=`md`)=>`calc(${U(`font-size-${e}`)} * ${U(`line-height-tight`)} + 2 * ${U(nc[e].block)} + 2 * ${U(`border-width`)})`,ic=(e=`md`,t=nc[e].inline)=>`
  box-sizing: border-box;
  min-block-size: ${rc(e)};
  padding-block: ${U(nc[e].block)};
  padding-inline: ${U(t)};
  font-size: ${U(`font-size-${e}`)};
  line-height: ${U(`line-height-tight`)};
`,ac=()=>Ys.map(e=>`
  .size-${e} {${ic(e)}}

  .square.size-${e} {
    min-inline-size: ${rc(e)};
    padding-inline: ${U(nc[e].block)};
  }
`).join(``),oc=()=>qs(`weight`,$s(Xs),e=>`font-weight: ${U(`font-weight-${e}`)}`),sc=()=>qs(`align`,$s(Zs),e=>`text-align: ${e}`),cc=`icon`,lc=[`icon`,`size`,`color`,`label`],uc=`http://www.w3.org/2000/svg`,dc={sm:`1rem`,md:`1.5rem`,lg:`2rem`},fc=`current`,pc={primary:`color-primary`,secondary:`color-secondary`,text:`color-text`,border:`color-border`,danger:`color-danger`,success:`color-success`,warning:`color-warning`,info:`color-info`};let mc=null;const hc=()=>mc??=[fc,...Object.keys(pc),...mi()],gc=e=>U(pc[e]??`color-${e}`),_c=()=>hc().filter(e=>e!==fc).map(e=>`  .color-${e} { color: ${gc(e)} }`).join(`
`),vc=()=>Ys.map(e=>`  .size-${e} { inline-size: ${dc[e]}; block-size: ${dc[e]} }`).join(`
`),yc=()=>`
  svg {
    display: block;
    flex: none;
    color: currentColor;
    stroke-width: ${U(`icon-stroke-width`)};
  }

${vc()}

${_c()}
`,bc=e=>Array.isArray(e)&&e.length>0&&e.every(e=>Array.isArray(e)&&e.length===2&&typeof e[0]==`string`&&e[1]!==null&&typeof e[1]==`object`),xc=(e,t)=>{if(t==null)return e.classList.add(`size-md`);if(Ys.includes(t))return e.classList.add(`size-${t}`);e.style.inlineSize=String(t),e.style.blockSize=String(t),!e.style.blockSize&&(h.warn(`${cc}: 'size' must be one of 'sm', 'md', 'lg' or a CSS length like '2rem' - got '${t}', using 'md'`),e.classList.add(`size-md`))},Sc=(e,t)=>{for(let[n,r]of t){let t=document.createElementNS(uc,n);for(let[e,n]of Object.entries(r))t.setAttribute(e,n);e.append(t)}},Cc={styles:yc,props:lc,setup:(e,t,n)=>{n.length>0&&h.warn(`${cc}: takes no content - pass an icon from 'imp/icons' as 'icon'`);let r=document.createElementNS(uc,`svg`);xc(r,t.size);let i=I(cc,`color`,t.color,hc(),fc);return i!==fc&&r.classList.add(`color-${i}`),r.setAttribute(`viewBox`,`0 0 24 24`),r.setAttribute(`fill`,`none`),r.setAttribute(`stroke`,`currentColor`),r.setAttribute(`stroke-linecap`,`round`),r.setAttribute(`stroke-linejoin`,`round`),bc(t.icon)?Sc(r,t.icon):h.warn(`${cc}: 'icon' must be an icon from 'imp/icons' like luUser - run 'imp skill icons'`),t.label===void 0?r.setAttribute(`aria-hidden`,`true`):(r.setAttribute(`role`,`img`),L(e,t.label,e=>r.setAttribute(`aria-label`,String(e)))),r}},wc=e=>{let t=e.find(bc);if(!t)return e;let n=e.filter(e=>e!==t),r=n.findIndex(E);return r===-1?[{icon:t},...n]:n.with(r,{icon:t,...n[r]})},K=(...e)=>z(cc,()=>Cc)(...wc(e)),Tc=()=>{let e=document.createElement(`template`);e.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="55 -10 252 252"><defs><linearGradient id="impk-h1" x1="65" y1="49" x2="118" y2="104" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#e33bdd"/><stop offset=".5" stop-color="#d700d1"/><stop offset="1" stop-color="#c200bc"/></linearGradient><linearGradient id="impk-h2" x1="265" y1="49" x2="212" y2="104" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f25a14"/><stop offset=".5" stop-color="#ee4b00"/><stop offset="1" stop-color="#d94400"/></linearGradient><linearGradient id="impk-t" x1="264" y1="91" x2="226" y2="180" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1a86ee"/><stop offset=".5" stop-color="#0078ea"/><stop offset="1" stop-color="#006cd3"/></linearGradient><mask id="impk-ml" maskUnits="userSpaceOnUse" x="0" y="-20" width="379" height="320"><rect y="-20" width="164.8" height="150" fill="#fff"/><path d="M246.3 132.2 245.9 135.3 245.5 138.3 245.0 141.3 244.5 144.3 243.9 147.1 243.3 150.0 242.6 152.8 241.9 155.5 241.1 158.2 240.2 160.8 239.2 163.3 238.2 165.8 237.1 168.3 235.9 170.7 234.7 173.0 233.3 175.3 231.9 177.5 230.4 179.6 228.8 181.7 227.1 183.8 225.4 185.7 223.6 187.7 221.7 189.5 219.8 191.3 217.8 193.0 215.7 194.6 213.6 196.2 211.4 197.7 209.2 199.1 206.9 200.5 204.6 201.7 202.2 202.9 199.8 204.0 197.3 204.9 194.8 205.9 192.2 206.7 189.6 207.4 187.0 208.0 184.3 208.6 181.6 209.0 178.8 209.3 176.0 209.6 173.2 209.7 170.3 209.8 167.4 209.8 164.5 209.6 161.5 209.4 158.6 209.1 155.6 208.7 152.6 208.2 149.7 207.6 146.7 206.9 143.8 206.2 140.9 205.4 138.1 204.5 135.3 203.5 132.5 202.5 129.7 201.4 127.0 200.2 124.4 199.0 121.8 197.7 119.3 196.3 116.8 194.9 114.3 193.4 112.0 191.8 109.6 190.2 107.4 188.5 105.2 186.8 103.0 185.0 100.9 183.1 98.9 181.1 96.9 179.1 95.1 177.0 93.3 174.8 91.6 172.5 90.0 170.1 88.5 167.7 87.1 165.1 85.9 162.5 84.8 159.8 83.8 157.1 82.9 154.2 82.2 151.3 81.7 148.3 81.3 145.3 81.0 142.2 80.9 139.1 80.8 136.0 81.0 132.8 81.2 129.7 81.5 126.5 81.9 123.3 82.4 120.2 83.0 117.1 83.7 114.0 84.5 111.0 85.3 108.0 86.2 105.1 87.2 102.2 88.2 99.4 89.3 96.6 90.4 93.9 91.6 91.3 92.9 88.7 94.3 86.2 95.7 83.8 97.2 81.4 98.8 79.2 100.4 76.9 102.1 74.8 103.9 72.7 105.8 70.8 107.7 68.9 109.7 67.0 111.8 65.3 113.9 63.6 116.0 62.1 118.3 60.6 120.5 59.2 122.9 57.9 125.2 56.7 127.7 55.6 130.1 54.6 132.6 53.7 135.2 52.9 137.7 52.1 140.3 51.5 143.0 50.9 145.7 50.4 148.4 50.0 151.1 49.7 153.8 49.4 156.6 49.3 159.4 49.2 162.2 49.2 165.0 49.2 167.8 49.3 170.6 49.5 173.4 49.8 176.3 50.1 179.1 50.5 181.9 51.0 184.8 51.5 187.6 52.1 190.4 52.8 193.3 53.6 196.1 54.5 198.9 55.5 201.7 56.5 204.5 57.7 207.3 58.9 210.0 60.3 212.7 61.7 215.3 63.3 218.0 65.0 220.5 66.7 223.0 68.6 225.4 70.5 227.7 72.6 229.9 74.8 232.0 77.0 234.0 79.4 235.9 81.8 237.6 84.4 239.2 87.0 240.6 89.7 241.9 92.4 243.0 95.3 244.0 98.2 244.8 101.1 245.5 104.2 246.0 107.2 246.4 110.3 246.7 113.4 246.9 116.6 246.9 119.7 246.9 122.9 246.7 126.0 246.5 129.1Z" fill="#000"/></mask><mask id="impk-mr" maskUnits="userSpaceOnUse" x="0" y="-20" width="379" height="320"><rect x="164.8" y="-20" width="214.2" height="150" fill="#fff"/><path d="M246.3 132.2 245.9 135.3 245.5 138.3 245.0 141.3 244.5 144.3 243.9 147.1 243.3 150.0 242.6 152.8 241.9 155.5 241.1 158.2 240.2 160.8 239.2 163.3 238.2 165.8 237.1 168.3 235.9 170.7 234.7 173.0 233.3 175.3 231.9 177.5 230.4 179.6 228.8 181.7 227.1 183.8 225.4 185.7 223.6 187.7 221.7 189.5 219.8 191.3 217.8 193.0 215.7 194.6 213.6 196.2 211.4 197.7 209.2 199.1 206.9 200.5 204.6 201.7 202.2 202.9 199.8 204.0 197.3 204.9 194.8 205.9 192.2 206.7 189.6 207.4 187.0 208.0 184.3 208.6 181.6 209.0 178.8 209.3 176.0 209.6 173.2 209.7 170.3 209.8 167.4 209.8 164.5 209.6 161.5 209.4 158.6 209.1 155.6 208.7 152.6 208.2 149.7 207.6 146.7 206.9 143.8 206.2 140.9 205.4 138.1 204.5 135.3 203.5 132.5 202.5 129.7 201.4 127.0 200.2 124.4 199.0 121.8 197.7 119.3 196.3 116.8 194.9 114.3 193.4 112.0 191.8 109.6 190.2 107.4 188.5 105.2 186.8 103.0 185.0 100.9 183.1 98.9 181.1 96.9 179.1 95.1 177.0 93.3 174.8 91.6 172.5 90.0 170.1 88.5 167.7 87.1 165.1 85.9 162.5 84.8 159.8 83.8 157.1 82.9 154.2 82.2 151.3 81.7 148.3 81.3 145.3 81.0 142.2 80.9 139.1 80.8 136.0 81.0 132.8 81.2 129.7 81.5 126.5 81.9 123.3 82.4 120.2 83.0 117.1 83.7 114.0 84.5 111.0 85.3 108.0 86.2 105.1 87.2 102.2 88.2 99.4 89.3 96.6 90.4 93.9 91.6 91.3 92.9 88.7 94.3 86.2 95.7 83.8 97.2 81.4 98.8 79.2 100.4 76.9 102.1 74.8 103.9 72.7 105.8 70.8 107.7 68.9 109.7 67.0 111.8 65.3 113.9 63.6 116.0 62.1 118.3 60.6 120.5 59.2 122.9 57.9 125.2 56.7 127.7 55.6 130.1 54.6 132.6 53.7 135.2 52.9 137.7 52.1 140.3 51.5 143.0 50.9 145.7 50.4 148.4 50.0 151.1 49.7 153.8 49.4 156.6 49.3 159.4 49.2 162.2 49.2 165.0 49.2 167.8 49.3 170.6 49.5 173.4 49.8 176.3 50.1 179.1 50.5 181.9 51.0 184.8 51.5 187.6 52.1 190.4 52.8 193.3 53.6 196.1 54.5 198.9 55.5 201.7 56.5 204.5 57.7 207.3 58.9 210.0 60.3 212.7 61.7 215.3 63.3 218.0 65.0 220.5 66.7 223.0 68.6 225.4 70.5 227.7 72.6 229.9 74.8 232.0 77.0 234.0 79.4 235.9 81.8 237.6 84.4 239.2 87.0 240.6 89.7 241.9 92.4 243.0 95.3 244.0 98.2 244.8 101.1 245.5 104.2 246.0 107.2 246.4 110.3 246.7 113.4 246.9 116.6 246.9 119.7 246.9 122.9 246.7 126.0 246.5 129.1Z" fill="#000"/></mask><path id="impk-b" fill-rule="evenodd" d="M65.1 53.9 65.2 56.1 65.5 58.2 65.9 60.3 66.4 62.3 67.0 64.3 67.6 66.3 68.2 68.3 68.8 70.2 69.4 72.2 70.0 74.2 70.7 76.2 71.3 78.2 72.0 80.2 72.7 82.2 73.5 84.2 74.4 86.1 75.4 88.1 76.5 90.0 77.6 91.8 78.8 93.7 80.0 95.5 81.3 97.3 82.6 99.1 83.9 100.9 85.2 102.7 86.5 104.6 87.6 106.5 87.9 108.5 87.3 110.7 86.7 113.0 86.0 115.4 85.6 117.7 85.2 120.1 84.9 122.5 84.8 124.9 84.6 127.3 84.6 129.7 84.5 132.1 84.5 134.5 84.6 136.9 84.6 139.3 84.6 141.7 84.6 144.1 84.7 146.4 84.8 148.7 85.0 151.1 85.3 153.4 85.8 155.6 86.5 157.8 87.2 159.9 88.2 161.9 89.2 163.9 90.4 165.7 91.6 167.6 93.0 169.3 94.4 171.0 95.8 172.6 97.3 174.2 98.8 175.7 100.3 177.3 101.8 178.8 103.3 180.3 104.8 181.7 106.4 183.2 108.0 184.6 109.6 185.9 111.3 187.3 113.1 188.5 114.9 189.7 116.7 190.9 118.6 192.0 120.5 193.1 122.4 194.1 124.3 195.2 126.2 196.2 128.2 197.3 130.1 198.3 132.1 199.4 134.1 200.4 136.2 201.4 138.2 202.4 140.3 203.3 142.5 204.1 144.7 204.8 147.0 205.3 149.3 205.8 151.6 206.1 154.0 206.3 156.3 206.4 158.6 206.5 160.9 206.5 163.2 206.6 165.4 206.6 167.6 206.6 169.8 206.7 172.0 206.7 174.2 206.6 176.4 206.6 178.5 206.4 180.6 206.2 182.7 205.9 184.8 205.6 186.8 205.1 188.8 204.6 190.8 204.0 192.7 203.3 194.6 202.7 196.5 201.9 198.4 201.2 200.2 200.5 202.0 199.7 203.9 198.9 205.7 198.0 207.4 197.1 209.2 196.2 210.9 195.1 212.5 194.0 214.1 192.8 215.6 191.5 217.0 190.1 218.4 188.6 219.7 187.2 221.0 185.6 222.2 184.1 223.4 182.6 224.6 181.0 225.8 179.5 227.0 178.0 228.3 176.4 229.5 174.8 230.7 173.3 231.8 171.6 233.0 169.9 234.0 168.2 235.0 166.4 235.9 164.6 236.8 162.7 237.5 160.8 238.2 158.8 238.9 156.8 239.5 154.7 240.1 152.6 240.7 150.5 241.3 148.4 241.9 146.2 242.5 144.0 243.1 141.7 243.6 139.4 244.1 137.1 244.5 134.8 244.7 132.4 244.9 130.0 244.9 127.6 244.8 125.2 244.6 122.8 244.3 120.4 244.0 118.1 243.7 115.7 243.4 113.4 243.1 110.8 243.8 108.3 245.2 106.1 246.6 104.0 248.0 102.0 249.4 99.9 250.8 98.0 252.1 96.0 253.4 94.0 254.7 91.9 255.8 89.9 256.9 87.8 257.9 85.8 258.8 83.7 259.6 81.6 260.5 79.6 261.2 77.5 262.0 75.5 262.7 73.4 263.4 71.4 264.0 69.4 264.6 67.4 265.1 65.3 265.5 63.3 265.9 61.2 266.1 59.2 266.3 57.0 266.3 54.9 266.3 52.8 266.3 50.7 265.9 49.8 264.3 50.7 262.5 51.7 260.6 52.6 258.8 53.5 256.8 54.3 254.8 55.1 252.7 55.7 250.6 56.3 248.4 56.8 246.2 57.3 244.0 57.7 241.7 58.2 239.5 58.7 237.2 59.2 235.0 59.7 232.7 60.2 230.4 60.7 228.1 61.2 225.8 61.7 223.5 62.2 221.1 62.6 218.8 62.9 216.4 63.2 214.1 63.6 212.0 63.2 209.9 62.3 207.7 61.4 205.6 60.5 203.4 59.7 201.2 58.9 198.9 58.3 196.7 57.7 194.5 57.2 192.2 56.8 190.0 56.4 187.8 56.0 185.6 55.6 183.5 55.2 181.3 54.8 179.2 54.4 177.1 53.9 175.0 53.5 172.9 53.1 170.8 52.7 168.6 52.3 166.5 52.1 164.4 51.9 162.2 51.8 160.1 51.8 158.0 51.8 155.9 51.9 153.8 52.1 151.7 52.3 149.6 52.6 147.6 52.8 145.5 53.1 143.5 53.4 141.5 53.8 139.4 54.2 137.4 54.7 135.5 55.2 133.5 55.8 131.6 56.5 129.8 57.3 128.0 58.2 126.2 59.2 124.5 60.2 122.8 61.3 121.2 62.4 119.5 63.6 117.8 64.7 115.7 65.2 113.5 64.8 111.3 64.3 109.1 63.7 107.0 63.2 104.8 62.6 102.7 62.0 100.5 61.5 98.4 60.9 96.2 60.4 94.1 59.9 91.9 59.5 89.7 59.0 87.6 58.6 85.4 58.2 83.3 57.7 81.1 57.2 79.0 56.6 77.0 55.9 74.9 55.2 72.9 54.4 71.0 53.5 69.0 52.6 67.1 51.7 65.4 50.8 65.1 51.8ZM183.0 63.6 185.2 64.2 187.3 64.9 189.5 65.5 191.7 66.2 193.8 67.0 195.9 67.8 198.0 68.7 200.1 69.8 202.1 70.9 204.1 72.1 206.0 73.3 207.9 74.7 209.8 76.1 211.6 77.5 213.4 78.9 215.2 80.4 217.0 81.9 218.8 83.5 220.5 85.1 222.2 86.7 223.9 88.5 225.4 90.3 226.8 92.2 228.0 94.2 229.1 96.3 230.0 98.5 230.8 100.8 231.4 103.1 231.9 105.4 232.3 107.8 232.6 110.2 232.9 112.6 233.1 115.0 233.3 117.4 233.5 119.8 233.7 122.2 233.8 124.6 233.9 127.1 233.8 129.5 233.7 131.9 233.4 134.3 233.1 136.6 232.7 138.9 232.3 141.2 231.8 143.5 231.3 145.7 230.7 147.9 230.2 150.1 229.7 152.2 229.2 154.3 228.7 156.4 228.1 158.5 227.6 160.5 226.9 162.5 226.2 164.5 225.4 166.4 224.5 168.2 223.4 169.9 222.2 171.6 221.0 173.1 219.6 174.5 218.2 175.9 216.7 177.2 215.3 178.5 213.8 179.7 212.4 181.0 210.9 182.2 209.4 183.4 208.0 184.6 206.5 185.8 204.9 186.9 203.3 187.9 201.7 188.9 200.0 189.7 198.2 190.5 196.4 191.2 194.5 191.9 192.6 192.5 190.7 193.0 188.8 193.5 186.9 194.0 184.9 194.5 182.9 194.9 180.9 195.3 178.8 195.6 176.7 195.9 174.6 196.2 172.4 196.4 170.2 196.5 167.9 196.5 165.7 196.5 163.4 196.3 161.2 196.0 158.9 195.7 156.6 195.2 154.4 194.8 152.1 194.3 149.9 193.7 147.6 193.2 145.4 192.6 143.2 192.0 141.0 191.4 138.8 190.7 136.6 190.0 134.5 189.2 132.3 188.3 130.3 187.4 128.3 186.3 126.3 185.3 124.4 184.1 122.6 182.9 120.8 181.7 119.0 180.4 117.2 179.1 115.4 177.9 113.6 176.6 111.8 175.3 110.0 174.0 108.3 172.7 106.6 171.3 104.9 169.8 103.4 168.1 102.0 166.4 100.8 164.6 99.8 162.6 98.9 160.6 98.1 158.5 97.5 156.3 96.9 154.2 96.4 151.9 96.0 149.7 95.6 147.5 95.3 145.2 95.1 142.9 95.1 140.5 95.2 138.2 95.3 135.8 95.5 133.4 95.7 131.0 96.0 128.6 96.3 126.1 96.6 123.7 96.9 121.4 97.3 119.0 97.8 116.6 98.3 114.4 98.9 112.1 99.6 109.9 100.3 107.7 101.0 105.5 101.7 103.2 102.4 101.0 103.1 98.9 103.8 96.8 104.7 94.7 105.6 92.7 106.7 90.8 107.9 89.0 109.2 87.2 110.6 85.6 112.0 84.1 113.5 82.6 115.0 81.2 116.5 79.8 118.0 78.4 119.5 77.1 121.0 75.7 122.5 74.4 124.0 73.1 125.5 71.9 127.0 70.7 128.7 69.6 130.3 68.5 132.0 67.6 133.8 66.7 135.6 65.9 137.5 65.2 139.4 64.6 141.3 64.0 143.2 63.4 145.1 62.9 147.1 62.3 149.0 61.8 151.0 61.3 153.0 60.8 155.1 60.4 157.2 60.2 159.3 60.0 161.5 60.0 163.6 60.1 165.8 60.2 167.9 60.4 170.1 60.8 172.3 61.1 174.4 61.6 176.6 62.0 178.7 62.5 180.9 63.0ZM91.0 70.5 93.3 70.9 95.6 71.3 97.9 71.7 100.2 71.9 102.5 72.2 104.7 72.2 106.7 73.1 105.7 74.9 104.5 76.7 103.3 78.4 102.0 80.1 100.8 81.8 99.5 83.5 98.3 85.3 97.1 87.1 95.9 89.0 94.9 90.9 93.7 92.7 92.1 93.5 90.7 91.8 89.4 90.0 88.1 88.2 86.9 86.3 85.6 84.5 84.4 82.6 83.3 80.8 82.2 78.9 81.1 77.0 80.2 75.1 79.3 73.1 78.5 71.1 77.8 69.1 77.8 67.2 80.0 67.7 82.1 68.3 84.3 68.9 86.5 69.5 88.8 70.0ZM253.4 72.1 252.8 74.3 252.1 76.4 251.3 78.5 250.4 80.5 249.4 82.6 248.3 84.6 247.2 86.6 246.0 88.6 244.7 90.6 243.4 92.6 242.0 94.5 240.3 95.5 239.3 93.5 238.3 91.3 237.3 89.2 236.2 87.2 234.9 85.2 233.6 83.3 232.1 81.4 230.6 79.6 229.0 77.9 227.5 76.1 226.1 74.3 226.0 72.7 228.1 72.3 230.5 71.9 232.8 71.6 235.2 71.2 237.5 70.8 239.8 70.4 242.1 69.8 244.3 69.3 246.5 68.6 248.6 67.8 250.6 67.0 252.7 66.4 254.0 67.8 253.8 70.0Z"/><filter id="impk-sh" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#101010" flood-opacity=".16"/></filter></defs><g filter="url(#impk-sh)"><path d="M221.1 180.0 222.5 180.9 223.9 181.7 225.4 182.5 226.8 183.2 228.3 183.9 229.8 184.6 231.4 185.2 232.9 185.8 234.5 186.3 236.1 186.8 237.7 187.3 239.4 187.8 241.1 188.2 242.8 188.6 244.5 188.9 246.3 189.2 248.1 189.5 249.9 189.7 251.8 189.9 253.7 190.0 255.6 190.0 257.6 190.0 259.6 190.0 261.7 189.8 263.7 189.6 265.8 189.3 267.9 188.9 270.0 188.4 272.0 187.8 274.1 187.2 276.2 186.4 278.1 185.5 280.1 184.5 282.0 183.5 283.8 182.3 285.6 181.1 287.2 179.8 288.8 178.5 290.2 177.1 291.6 175.6 292.8 174.1 294.0 172.5 295.0 171.0 296.0 169.4 296.8 167.8 297.6 166.2 298.2 164.5 298.8 162.9 299.3 161.3 299.7 159.5 300.0 157.7 300.2 156.0 300.3 154.3 300.3 152.6 300.3 150.9 300.2 149.2 300.0 147.4 299.7 145.7 299.4 143.9 298.9 142.2 298.5 140.4 297.9 138.7 297.3 137.0 296.7 135.4 296.0 133.7 295.4 132.1 294.6 130.5 293.9 129.0 293.2 127.4 292.4 125.9 291.7 124.4 290.9 122.9 290.1 121.5 289.4 120.0 288.6 118.6 287.8 117.2 287.0 115.9 286.2 114.5 285.5 113.2 275.2 120.8 275.9 122.1 276.6 123.4 277.2 124.6 277.9 125.9 278.6 127.2 279.2 128.4 279.9 129.7 280.5 131.0 281.1 132.2 281.7 133.5 282.2 134.8 282.8 136.1 283.3 137.3 283.8 138.6 284.2 139.9 284.6 141.1 285.0 142.4 285.4 143.7 285.7 144.9 285.9 146.2 286.1 147.5 286.3 148.7 286.5 150.0 286.6 151.3 286.6 152.6 286.7 153.9 286.7 155.2 286.6 156.4 286.5 157.6 286.3 158.8 286.0 160.0 285.6 161.3 285.2 162.5 284.7 163.7 284.2 164.8 283.5 165.9 282.8 166.9 282.0 168.0 281.1 168.9 280.2 169.8 279.2 170.7 278.1 171.5 277.0 172.2 275.9 172.9 274.6 173.5 273.4 174.1 272.1 174.6 270.8 175.1 269.5 175.5 268.1 175.8 266.7 176.2 265.3 176.5 263.9 176.7 262.5 177.0 261.0 177.1 259.6 177.3 258.1 177.4 256.7 177.5 255.2 177.5 253.7 177.5 252.3 177.4 250.8 177.3 249.4 177.2 247.9 177.0 246.5 176.8 245.1 176.5 243.7 176.2 242.3 175.8 240.9 175.4 239.6 174.9 238.3 174.5 237.0 173.9 235.7 173.4 234.4 172.8 233.2 172.1 231.9 171.5 230.7 170.8 229.5 170.0 228.3 169.2Z" fill="url(#impk-t)"/><path d="M289.4 109.2 288.2 110.5 287.0 111.8 285.8 113.0 284.6 114.2 283.3 115.4 282.0 116.5 280.7 117.5 279.3 118.5 277.9 119.4 276.4 120.2 275.0 121.0 273.4 121.8 271.9 122.5 270.4 123.2 269.8 120.9 269.3 118.5 268.8 116.2 268.3 113.8 268.0 111.4 267.7 109.0 267.4 106.7 267.3 104.3 267.2 102.0 267.1 99.6 267.1 97.3 267.1 95.0 267.1 92.7 267.1 90.5 268.9 91.5 270.6 92.6 272.3 93.7 274.0 94.8 275.6 95.9 277.2 97.2 278.8 98.5 280.3 99.9 281.8 101.3 283.4 102.8 284.9 104.4 286.3 106.0 287.8 107.6Z" fill="url(#impk-t)" stroke="url(#impk-t)" stroke-width="3" stroke-linejoin="round"/><g fill="currentColor" stroke="currentColor" stroke-width="3.0" stroke-linejoin="round"><use href="#impk-b"/></g><g fill="url(#impk-h1)" stroke="url(#impk-h1)" stroke-width="3.0" stroke-linejoin="round" mask="url(#impk-ml)"><use href="#impk-b"/></g><g fill="url(#impk-h2)" stroke="url(#impk-h2)" stroke-width="3.0" stroke-linejoin="round" mask="url(#impk-mr)"><use href="#impk-b"/></g><g fill="currentColor"><path d="M116.5 116.1 116.3 118.4 116.3 120.8 117.9 121.8 120.1 122.0 122.4 122.0 124.6 121.9 126.8 121.8 129.0 121.8 131.1 122.0 132.4 123.5 132.3 125.9 132.3 128.2 132.8 130.3 134.2 131.9 135.9 133.0 137.9 133.6 140.1 133.6 142.2 133.0 144.0 131.7 145.5 129.9 146.3 127.7 146.3 125.5 145.8 123.2 146.6 121.4 148.9 121.2 150.9 121.1 153.0 121.0 154.9 120.7 156.0 119.6 156.3 117.5 156.5 115.3 156.5 113.2 155.7 111.7 153.7 111.5 151.7 111.2 149.6 111.0 147.5 110.8 145.5 110.6 143.4 110.5 141.3 110.4 139.2 110.4 137.0 110.5 134.9 110.6 132.7 110.7 130.6 110.8 128.4 111.0 126.2 111.1 124.0 111.2 121.8 111.4 119.5 111.5 117.3 111.7 116.7 113.7Z"/><path d="M192.9 112.5 190.6 112.4 188.4 112.2 186.3 112.1 184.1 112.0 181.9 112.0 179.8 111.9 177.6 111.8 175.5 111.8 173.5 112.2 173.1 114.5 172.8 116.8 172.7 119.1 172.8 121.6 174.6 122.8 176.8 123.2 178.9 123.4 180.9 123.6 182.3 124.2 181.9 126.1 182.2 128.6 183.1 131.0 184.5 133.0 186.2 134.7 188.3 135.6 190.5 135.9 192.5 135.5 194.2 134.3 195.5 132.6 196.3 130.6 196.9 128.4 196.9 126.1 197.0 123.8 199.4 123.4 201.7 123.6 203.9 123.8 206.1 124.1 208.4 124.3 210.6 124.4 212.9 124.4 214.5 122.8 214.8 120.2 214.7 117.8 214.4 115.4 213.1 113.6 210.9 113.4 208.6 113.3 206.3 113.2 204.1 113.2 201.8 113.0 199.6 112.9 197.3 112.8 195.1 112.6Z"/></g></g></svg>`;let t=e.content.firstElementChild;return t.setAttribute(`aria-hidden`,`true`),t},Ec=`emptyState`,Dc=[`empty`,`noResults`],Oc=[`neutral`,`success`,`error`,`warning`,`info`],kc={neutral:`secondary`,success:`success`,error:`danger`,warning:`warning`,info:`info`},Ac=`6rem`,jc=[`variant`,`title`,`description`,`icon`,`image`,`kind`],Mc={empty:`imp.state.empty`,noResults:`imp.state.noResults`},Nc={"imp.state.empty":`Nothing here yet`,"imp.state.noResults":`No results`},Pc=()=>`
  .root {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${U(`space-2`)};
    padding-block: ${U(`space-6`)};
    padding-inline: ${U(`space-4`)};
    ${W()}
    text-align: center;
  }

  .icon,
  .image {
    display: inline-flex;
    margin-block-end: ${U(`space-2`)};
  }

  .image {
    inline-size: ${Ac};
    max-inline-size: 100%;
    color: ${U(`color-text`)};
  }

  .image > * {
    display: block;
    inline-size: 100%;
    block-size: auto;
    max-block-size: ${Ac};
    object-fit: contain;
  }

  p {
    margin: 0;
    line-height: ${U(`line-height-normal`)};
    overflow-wrap: anywhere;
  }

  .title {
    color: ${U(`color-text`)};
    font-size: ${U(`font-size-lg`)};
    font-weight: ${U(`font-weight-bold`)};
  }

  .description {
    color: ${U(`color-secondary`)};
    font-size: ${U(`font-size-sm`)};
    max-inline-size: 60ch;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: ${U(`space-2`)};
    margin-block-start: ${U(`space-2`)};
  }
`,Fc=e=>e instanceof Node?e:typeof e==`string`&&e!==``?ss({src:e,alt:``}):(h.warn(`${Ec}: 'image' must be a DOM node or an image URL - drawing the imp mark`),Tc()),Ic=(e,t)=>e.image!==void 0&&e.image!==null?(e.icon!==void 0&&h.warn(`${Ec}: pass 'icon' or 'image', not both - drawing the 'image'`),B({class:`image`},Fc(e.image))):e.icon===void 0?B({class:`image`},Tc()):V({class:`icon`},K(e.icon,{size:`3rem`,color:kc[t]})),Lc={styles:Pc,props:jc,setup:(e,t,n)=>{let r=I(Ec,`variant`,t.variant,Dc,`empty`),i=I(Ec,`kind`,t.kind,Oc,`neutral`);t.kind!==void 0&&t.icon===void 0&&h.warn(`${Ec}: 'kind' only tints the 'icon' - pass an icon from 'imp/icons'`);let a=t.title===void 0?N.text(()=>F(Mc[r])):R(e,t.title);return B({class:`root`},Ic(t,i),gs({class:`title`},a),t.description===void 0?null:gs({class:`description`},R(e,t.description)),n.length===0?null:B({class:`actions`},...n))}},Rc=(...e)=>z(Ec,()=>Lc,()=>P(Nc))(...e),zc=Symbol(`imp.areaLoader`),Bc=Symbol(`imp.area`),Vc=`area`,Hc=`imp.area`,Uc=Symbol(`imp.redirect`),Wc=Symbol(`imp.router.wait`),Gc=e=>!!e?.[Uc],Kc=5e3;let qc=0;const Jc=e=>!!e?.[zc],Yc=e=>!!e?.[Bc],Xc=(e,t)=>n=>{let r=t(n);if(r&&typeof r.then==`function`)throw Error(`imp: ${e} returned a Promise - a screen renders immediately; to load code on demand, bind the node to area(() => import(...))`);return r},Zc=[`states`,`check`],Qc=(e,t)=>{let n=`imp: router({ guards }) - the guard at '${e}'`;if(!E(t))throw Error(`${n} must be { states, check }, like { states: ['myapp.session'], check: (session, { node }) => session === undefined ? wait : true }`);let r=Object.keys(t).find(e=>!Zc.includes(e));if(r!==void 0)throw Error(`${n} has '${r}' - a guard has only 'states' and 'check'`);let{states:i,check:a}=t;if(!Array.isArray(i)||i.length===0||!i.every(e=>typeof e==`string`))throw Error(`${n} - 'states' must be a non-empty array of state names the check reads`);for(let e of i){let t=dt(e);if(t)throw Error(`${n} - ${t}`)}if(typeof a!=`function`)throw Error(`${n} - 'check' must be a function receiving the state values and { node, params, query, searchParams, path }, returning true, wait, false, or a path to redirect to`);return{at:e,states:i,check:a}},$c=Object.freeze({byNode:/* @__PURE__ */ new Map,states:[]}),el=(e,t)=>{if(t===void 0)return $c;if(!E(t))throw Error(`imp: router({ guards }) - guards is an object keyed by handles of the map, like { [app]: signedIn, [app.admin]: role('admin') }`);let n=/* @__PURE__ */ new Map;for(let[r,i]of Object.entries(t)){let t=Ir(e,r);if(t===null)throw Error(r===`undefined`?`imp: router({ guards }) - a key is 'undefined', so a handle is mistyped; check every [app...] key against the map`:`imp: router({ guards }) - '${r}' is not a node of the map; key guards by handles like [app] and [app.admin]`);n.set(t,Qc(r,i))}return{byNode:n,states:[...new Set([...n.values()].flatMap(e=>e.states))]}},tl=(e,t)=>{for(let n=t;n!==null;n=n.parent)if(e.byNode.has(n))return e.byNode.get(n);return null},nl=e=>typeof e==`string`?`'${e}'`:String(e),rl=(e,t)=>{if(t===Wc||t===!1)return t;if(t===!0||t===void 0)return!0;if(typeof t==`string`&&t.startsWith(`/`))return t;throw Error(`imp: the guard at '${e.at}' returned ${nl(t)} - a guard must return true to allow, wait while it cannot decide yet, false to render the not-found page, or a path starting with '/' to redirect to`)},il=(e,t,n)=>rl(e,e.check(...e.states.map(e=>t.get(e).get()),{...n,path:gl.get().path}));let al=0;const ol=e=>{let t=al,n=!1;return queueMicrotask(()=>{n||(al===t?$l(e):h.debug(`a redirect to '${e}' is dropped - the app navigated before it ran`))}),()=>{n=!0}},sl=e=>{if(qc++,qc>10)throw qc=0,Error(`imp: route guards redirected 10 times without a screen rendering - they are redirecting in a cycle (the last hop was '${e}'); make sure the target of a redirect is not itself guarded back to where it came from`);return h.debug(`route guard redirecting to '${e}'`),ol(e)},cl=(e,t,n,r,i)=>e===!0?(qc=0,t()):e===!1?(qc=0,h.debug(`a route guard denied the screen - rendering the not-found page`),r.notFound?r.notFound(n):null):(i(sl(e)),null),ll=(e,t)=>setTimeout(()=>{t()||h.warn(`the guard at '${e.at}' is still waiting at '${gl.get().path}' after ${Kc}ms - it keeps returning wait, so nothing has settled one of [${e.states.join(`, `)}]`)},Kc),ul=(e,t)=>{e.abortSignal.addEventListener(`abort`,t,{once:!0})},dl=/* @__PURE__ */ new WeakMap,fl=e=>{let t=dl.get(e);t&&ee(t)},pl=(e,t,n,r,i,a)=>{let o=null,s=e=>{o=e},c=e=>(typeof e==`string`&&fl(i),cl(e,a,n,r,s));if(e===null)return qc=0,a();if(!i.host.isConnected)return null;let l=il(e,t,n),u=l!==Wc,d=null,f=u?null:new Promise(e=>{d=e}),p=u?null:ll(e,()=>u);p&&ul(i,()=>clearTimeout(p));let m=!0,g=()=>{if(m)return;let r=il(e,t,n);r!==Wc&&(u?r===!0?(qc=0,o?.(),o=null):r===!1?h.error(`the guard at '${e.at}' returned false at '${gl.get().path}' for a screen that is already showing - only a redirect can leave a mounted screen, so it stays; return a path instead`):(o?.(),o=sl(r)):(u=!0,clearTimeout(p),d(r)))};for(let n of new Set(e.states))t.get(n).watch(i,g);return m=!1,u?c(l):f.then(c)},ml=(e,t,n,r)=>(i,a)=>pl(e,t,i,r,a,()=>n(i,a)),hl=(e,t,n,r)=>{if(!E(n))throw Error(`imp: ${r} - screens must be an object keyed by handles of the map`);let i=/* @__PURE__ */ new Map;for(let[a,o]of Object.entries(n)){let n=Ir(e,a);if(n===null)throw Error(a===`undefined`?`imp: ${r} - a key is 'undefined', so a handle is mistyped; check every [app...] key against the map`:`imp: ${r} - '${a}' is not a node of the map; key screens by handles like [app.admin.users]`);if(t!==null&&!Lr(n,t))throw Error(`imp: ${r} - '${a}' is outside the area at '${t.pattern}'; an area binds only its own nodes`);if(Jc(o)){if(n.parent===null)throw Error(`imp: ${r} - the root '/' cannot be an area; bind area(() => import(...)) to a node under it, like [app.admin]`);i.set(n,{kind:`area`,target:o})}else if(Gc(o)){let t=typeof o.to==`string`?null:Ir(e,o.to);if(typeof o.to!=`string`&&t===null)throw Error(`imp: ${r} - '${a}' redirects to '${o.to}', which is not a node of the map`);i.set(n,{kind:`redirect`,target:t??o.to})}else if(typeof o==`function`)i.set(n,{kind:`screen`,target:Xc(`${r} '${a}'`,o)});else throw Error(Yc(o)?`imp: ${r} - '${a}' maps to an area definition; an area is always loaded on demand, so bind it with area(() => import('./area.js'))`:`imp: ${r} - '${a}' must map to a screen factory or an area(() => import(...))`)}return i};let gl=null,_l=null,vl=null,yl=0;const bl=/* @__PURE__ */ new Set,xl=(e,t)=>JSON.stringify([e,t]),Sl=e=>{let t={};for(let n of bl)Object.assign(t,Rr(n,e)?.params);return t},Cl=(e,t,n)=>Object.fromEntries(Object.entries(e).filter(([e])=>{let r=e.slice(1);return n[r]!==void 0&&t[r]===n[r]})),wl=(e,t)=>{let n=_l.get();Object.keys(n).length!==0&&_l.set(Cl(n,Sl(e),Sl(t)))},Tl=e=>[...bl].map(t=>{let n=Rr(t,e);return n===null?null:xl(n.node.pattern,n.params)}),El=()=>{let e=Qt(),t=gl.get().path;JSON.stringify(Tl(t))!==JSON.stringify(Tl(e.path))&&vl.set(null),wl(t,e.path),gl.set(e)},Dl={page:0,region:0},Ol=/* @__PURE__ */ new Map,kl=/* @__PURE__ */ new Set;let Al=1,jl=0,Ml=null,Nl=null,Pl=!1,Fl=null,Il=!1;const Ll=()=>`${globalThis.performance.timeOrigin}:${Al++}`,Rl=()=>globalThis.history.state?.__impRouterKey??null,zl=()=>globalThis.history.state?.__impRouterIndex??null,Bl=(e,t)=>{for(Ol.delete(e),Ol.set(e,t);Ol.size>50;)Ol.delete(Ol.keys().next().value)},Vl=e=>{if(!Ol.has(e))return Dl;let t=Ol.get(e);return Ol.delete(e),Ol.set(e,t),t},Hl=()=>({page:globalThis.scrollY||0,region:Bo()?.scrollTop??0}),Ul=()=>{Ml!=null&&Bl(Ml,Hl())},Wl=({page:e,region:t})=>{globalThis.scrollTo(0,e);let n=Bo();n&&(n.scrollTop=t)},Gl=async()=>{if(Pl)return!1;Pl=!0;try{return await Eo([...kl],`beforeLeave`)}finally{Pl=!1}},Kl=e=>!Il&&kl.size>0&&e!==null&&e!==jl&&!$t(Qt(),gl.get()),ql=()=>{let{steps:e}=Fl;Fl=null,Gl().then(t=>{t&&(Il=!0,globalThis.history.go(e))})},Jl=()=>{let e=zl();if(Fl){ql();return}if(Kl(e)){Fl={steps:e-jl},globalThis.history.go(jl-e);return}Il=!1,al+=1,Ul();let t=e!==null&&e<jl;jl=e??jl,Ml=Rl(),Nl={type:`pop`,scroll:Vl(Ml)},Ho(El,{back:t})},Yl=()=>{if(jl=zl()??0,Rl()==null||zl()==null)try{globalThis.history.replaceState({...globalThis.history.state,__impRouterKey:Rl()??Ll(),__impRouterIndex:jl},``)}catch{}Ml=Rl()},Xl=()=>gl||(gl=k(`imp.route`,Qt()),_l=k(`imp.routeLabels`,{}),vl=k(`imp.router.settled`,null),jt(_l),Nl={type:`initial`},globalThis.history.scrollRestoration=`manual`,Yl(),globalThis.addEventListener(`popstate`,Jl),gl),Zl=(e,t,n)=>{let r=Gt(e);if(qt(r))return r;if(!Kt(r))throw Error(`imp: ${n}('${e}') - only an http or https url can be followed`);if(!t)throw Error(`imp: ${n}('${e}') - '${r.origin}' is another site; pass navigate(url, { external: true }) to leave the app, or safeNext(value, fallback) for a path from the url`);return r},Ql=(e,t)=>{qt(e)?(al+=1,Xl(),Ul(),t||(jl+=1),Ml=Ll(),Nl={type:t?`replace`:`push`},globalThis.history[t?`replaceState`:`pushState`]({__impRouterKey:Ml,__impRouterIndex:jl},``,e.href),Ho(El)):globalThis.location.href=e.href},$l=e=>Ql(Zl(e,!1,`redirect`),!0),eu=e=>!qt(e)||!$t(Zt(e.href),Qt()),q=(e,{replace:t=!1,external:n=!1}={})=>{let r=Zl(e,n,`navigate`);(t||r.href!==globalThis.location.href)&&(kl.size===0||!eu(r)?Ql(r,t):Gl().then(e=>{e&&Ql(r,t)}))},tu=(e,t)=>{if(typeof e?.abortSignal?.addEventListener!=`function`)throw Error(`imp: beforeLeave(self, check) - 'self' must be the self of the component that holds the unsaved work, so the check ends when it unmounts`);if(typeof t!=`function`)throw Error(`imp: beforeLeave(self, check) - 'check' must be a function returning false, or a Promise of false, to stay, like () => !dirty.get() || confirmDiscard()`);Xl();let n=()=>t();kl.add(n),ul(e,()=>kl.delete(n))},nu=()=>{let e=Nl;Nl=null,e&&e.type!==`initial`&&Wl(e.type===`pop`?e.scroll:Dl)};let ru=null;const iu=async e=>{await Ae(e),await Promise.all(je(e.shadowRoot))},au=(e,t)=>{if(t.area)return;let n=te(t.page);dl.set(e,n),ul(e,()=>ee(n)),yl+=1;let r=yl;queueMicrotask(()=>iu(e.host).then(()=>{ne(n),r===yl&&vl.set({key:t.key,leaf:r})}))},ou=()=>T(`imp-route`,{[ye]:!0,loading:(e,t,n)=>n?.loading?n.loading(t):null,error:(e,t,n,r,i,a)=>(h.error(`a route failed to render`,t),a?.area&&(yl+=1,vl.set({key:a.key,leaf:yl})),i?.error?i.error(e,t,r):null),setup:(e,t,n,r,i)=>(au(e,i),t(n,e)),onMount:nu}),su=(e,t,n,r)=>(ru||=ou(),ru(e,t,n,r)),cu=e=>({params:t})=>Rc({title:M([N,_l],(n,r)=>Vr(e,t,r)),description:e.description===void 0?void 0:M([N],()=>Ur(e))}),lu=(e,t,n,r)=>t.root?(x(Vc,Hc,{scope:e},r.host,{addCleanup:e=>ul(r,e)}),Xc(`area({ root })`,t.root)(n)):hu(e),uu=(e,t,n)=>(r,i)=>cn(n.target.loader).then(n=>{let a=n?.default??n;if(!Yc(a))throw Error(`imp: the area at '${t.pattern}' loaded a module whose default export is not an area({ screens }) definition`);let o=hl(e.map,t,a.screens,`area at '${t.pattern}'`);for(let[t,n]of o)n.kind===`area`&&e.areaNodes.add(t);let s={map:e.map,node:t,screens:o,guards:e.guards,handles:e.handles,areaNodes:e.areaNodes,options:e.options},c=()=>lu(s,a,r,i);if(a.translations===void 0)return c();let l=In(a.translations,`area({ translations })`);return ul(i,()=>l.dispose()),l.load(gn()).then(c)}),du=(e,{chain:t,params:n})=>{let r=e.node===null?0:t.indexOf(e.node)+1;if(e.node!==null&&r===0)return null;for(let n=r;n<t.length;n++){let r=e.screens.get(t[n]);if(r?.kind===`area`)return{kind:`area`,node:t[n],binding:r}}let i=t.at(-1),a=e.screens.get(i);if(a?.kind===`redirect`)return{kind:`redirect`,node:i,to:typeof a.target==`string`?a.target:xr(a.target,n)};if(a)return{kind:`screen`,node:i,binding:a};let o=i.children.find(e=>!e.param);return o?{kind:`redirect`,node:i,to:xr(o,n)}:Mr(i)?null:{kind:`stub`,node:i,binding:null}},fu=(e,t)=>{let n=Rr(e.map,t);if(!n)return null;let r=du(e,n);return r&&{match:n,target:r}},pu=e=>{let t=fu(e,gl.get().path);if(!t)return{miss:!0};let{match:n,target:r}=t;return r.kind===`redirect`?{kind:`redirect`,to:r.to}:{kind:r.kind,pattern:r.node.pattern,params:r.kind===`area`?zr(n.chain,r.node,n.params):n.params}},mu=(e,t)=>e.node===null?{}:zr(t.chain,e.node,t.params),hu=e=>(Xl(),M([gl],()=>pu(e)).view(()=>{let t=gl.get(),n=fu(e,t.path);if(!n){qc=0;let n=Rr(e.map,t.path),r=n?mu(e,n):{};return e.options.notFound?su(e.options.notFound,{params:r,query:t.query,searchParams:t.searchParams},{...e.options,loading:null},{page:null,path:t.path,area:!1,key:n?xl(n.node.pattern,n.params):null}):null}let{match:r,target:i}=n;if(i.kind===`redirect`)return qc=0,h.debug(`'${t.path}' forwards to '${i.to}'`),ol(i.to),null;let a={params:i.kind===`area`?zr(r.chain,i.node,r.params):r.params,query:t.query,searchParams:t.searchParams,node:i.node.handle},o=tl(e.guards,i.node),s=i.kind===`area`?uu(e,i.node,i.binding):i.kind===`screen`?i.binding.target:cu(i.node),c=o!==null||i.kind===`area`;return su(ml(o,e.handles,s,e.options),a,c?e.options:{...e.options,loading:null},{page:i.node.pattern,path:t.path,area:i.kind===`area`,key:xl(r.node.pattern,r.params)})})),gu=({loading:e,error:t,notFound:n},r)=>({loading:e??r?.loading??null,error:t??r?.error??null,notFound:n?Xc(`router({ notFound })`,n):r?.notFound??null});let _u=null;const vu=()=>T(`imp-area-router`,{setup:(e,t)=>{let n=b(Vc,Hc,e.host)?.value??null;if(!n)throw Error(`imp: router() with no 'map' renders the screens of the area around it, so it only works inside the component an area({ root }) renders - pass router({ map, screens }) anywhere else`);return hu({...n.scope,options:gu(t,n.scope.options)})}}),yu=e=>(_u||=vu(),_u(e)),bu=(e,t,n)=>{try{return il(e,t,n)}catch(t){return h.error(`the guard at '${e.at}' failed at '${n.path}' - hiding the node`,t),!1}},xu=(e,t)=>{if(!Mr(t)||e.has(t))return!0;for(let n=t.parent;n!==null;n=n.parent)if(e.get(n)?.kind===`area`)return!0;return!1},Su=(e,t)=>Nr(e).nodes.filter(e=>{if(t.has(e)||e.children.some(e=>!e.param)||Mr(e))return!1;for(let n=e.parent;n!==null;n=n.parent)if(t.get(n)?.kind===`area`)return!1;return!0}),Cu=(e,t)=>{let n=Su(e,t);n.length!==0&&h.info(`router: ${n.length} node${n.length===1?``:`s`} of the map render${n.length===1?`s`:``} a stub until bound in screens - ${n.map(e=>e.pattern).join(`, `)}`)};let wu=null;const Tu=/* @__PURE__ */ new WeakMap,Eu=e=>{let t=document.head.querySelector(`meta[name="description"]`);if(t!==null||e===void 0)return t;let n=document.createElement(`meta`);return n.setAttribute(`name`,`description`),Tu.set(n,null),document.head.append(n),n},Du=e=>{let t=Eu(e);if(t===null)return;Tu.has(t)||Tu.set(t,t.getAttribute(`content`));let n=e??Tu.get(t);n===null?t.remove():t.setAttribute(`content`,n)},Ou=(e,t,n)=>{if(n===null||n.leaf!==yl)return!1;let r=Rr(e,t.path);return n.key===(r===null?null:xl(r.node.pattern,r.params))},ku=(e,t,n)=>{if(e.title===null||!n.settled)return;let r=String(e.title({crumbs:n.crumbs.map(e=>e.label),node:n.pattern===null?null:Ir(t,n.pattern).handle,params:n.params})??``);document.title!==r&&(document.title=r)},Au=()=>T(`imp-router`,{setup:(e,t,n)=>{Xl(),bl.add(t),ul(e,()=>bl.delete(t));let r=Nr(t),i=new Map(n.guards.states.map(t=>[t,j(e,t)])),a={...n,handles:i,areaNodes:Mu(n.screens)};return M([gl,N,_l,vl,...i.values()],(e,r,o,s)=>{let c=Rr(t,e.path),l=/* @__PURE__ */ new Map,u=t=>{if(l.has(t))return l.get(t);let r=tl(n.guards,t),a=r===null||bu(r,i,{node:t.handle,params:c!==null&&c.chain.includes(t)?zr(c.chain,t,c.params):{},query:e.query,searchParams:e.searchParams,path:e.path});return l.set(t,a),a},d=/* @__PURE__ */ new Map,f=e=>{if(d.has(e))return d.get(e);let t=[];for(let n=e;n.parent!==null;n=n.parent)n!==e&&a.areaNodes.has(n)&&t.unshift(n);t.push(e);let n=!0;for(let e of t)if(n=u(e),n!==!0)break;return d.set(e,n),n},p=Wr(t,{path:e.path,allowed:e=>f(e)===!0,labels:o,settled:Ou(t,e,s),scope:n.navScope,isPage:e=>xu(n.screens,e),ownsPage:e=>n.screens.get(e)?.kind===`screen`}),m=Rr(t,e.path),h=m===null||f(m.node),g=h===Wc,_=typeof h==`string`;return{...p,current:{...p.current,waiting:g,leaving:_}}}).watch(e,({sections:e,current:i})=>{r.feed.tree.set(e),r.feed.current.set(i),Du(i.pattern===null?void 0:Ur(Ir(t,i.pattern))),ku(n,t,i)}),_l.watch(e,e=>void 0),Cu(t,n.screens),hu(a)}}),ju=(e,t)=>(wu||=Au(),wu(e,t)),Mu=e=>new Set([...e].filter(([,e])=>e.kind===`area`).map(([e])=>e)),Nu=(e,t)=>{if(t===void 0)return null;let n=Ir(e,t);if(n===null||!n.param)throw Error(`imp: router({ scope }) - scope is the param handle the app lives under, like scope: app.organizations.$org`);return n},Pu=[`map`,`screens`,`guards`,`scope`,`title`,`loading`,`error`,`notFound`,`routes`],Fu=(e={})=>{let{map:t,guards:n,screens:r,loading:i,error:a,notFound:o,routes:s,scope:c,title:l}=e,u=Object.keys(e).find(e=>!Pu.includes(e));if(u!==void 0)throw Error(`imp: router({ ${u} }) - '${u}' is not an option of the router; it takes ${Pu.filter(e=>e!==`routes`).join(`, `)}`);if(s!==void 0)throw Error(`imp: router({ routes }) - the route table is the map: pass router({ map, screens }), with the app-map.js the app describes itself in`);if(i!==void 0&&typeof i!=`function`)throw Error(`imp: router({ loading }) - loading must be a function returning DOM`);if(a!==void 0&&typeof a!=`function`)throw Error(`imp: router({ error }) - error must be a function returning the DOM to render in place of a failed screen`);if(o!==void 0&&typeof o!=`function`)throw Error(`imp: router({ notFound }) - notFound must be a function returning the not-found page`);if(l!==void 0&&typeof l!=`function`)throw Error(`imp: router({ title }) - title is a function of { crumbs, node, params } returning the document title, like ({ crumbs }) => [...crumbs].reverse().join(' - ')`);if(t===void 0){if(r!==void 0||n!==void 0)throw Error(`imp: router({ screens }) - needs the 'map' the screens bind to`);return yu({loading:i,error:a,notFound:o})}if(!jr(t))throw Error(`imp: router({ map }) - 'map' must be the value appMap() returned`);let d=Pr(t);if(d)throw Error(`imp: router({ map }) - ${d}`);let f=hl(t,null,r??{},`router({ screens })`),p=el(t,n);return ju(t,{map:t,node:null,screens:f,guards:p,navScope:Nu(t,c),title:l??null,options:gu({loading:i,error:a,notFound:o},null)})},Iu=()=>{let e=Xl();return Tt(e.name,()=>e,e.get)},Lu=(e,{prop:t,source:n,node:r,event:i,detail:a,paint:o})=>{let s=D(n)?n:null,c=!1,l=(n,{notify:l})=>{let u=!!n;u!==c&&(c=u,o(c),l&&(s&&(typeof s.set==`function`?s.set(c):h.warn(`${e}: '${t}' is a read-only state - pass a writable state so ${e} can write it back`)),r.dispatchEvent(new CustomEvent(i,{bubbles:!0,composed:!0,detail:{[a]:c}}))))};return{get:()=>c,change:l,follow:e=>L(e,n,e=>l(e,{notify:!1}))}},Ru=`spinner`,zu=`no-repeat radial-gradient(circle closest-side, currentColor 90%, transparent)`,Bu=(e,t)=>`
  @container style(--imp-loader: ${e}) {
    .${Ru} {
      border: 0;
      ${t}
    }
  }
`,Vu=()=>`
  .${Ru} {
    box-sizing: border-box;
    inline-size: var(--spinner-size, 1em);
    block-size: var(--spinner-size, 1em);
    border: var(--spinner-stroke, 2px) solid currentColor;
    border-block-start-color: transparent;
    border-radius: 50%;
    animation: imp-spin 600ms linear infinite;
  }

  ${Bu(`dots`,`border-radius: 0;
      background: ${zu} 0% 50%, ${zu} 50% 50%, ${zu} 100% 50%;
      background-size: calc(100% / 3) 50%;
      animation: imp-loader-dots 1s linear infinite;`)}

  ${Bu(`bar`,`border-radius: 0;
      background:
        linear-gradient(currentColor 0 0) -150% 50% / 40% var(--spinner-stroke, 2px) no-repeat,
        linear-gradient(color-mix(in srgb, currentColor 25%, transparent) 0 0) 50% 50% / 100% var(--spinner-stroke, 2px) no-repeat;
      animation: imp-loader-bar 1s linear infinite;`)}

  ${Bu(`pulse`,`background: currentColor;
      animation: imp-loader-pulse 1s ease-out infinite;`)}

  @keyframes imp-spin {
    to { transform: rotate(360deg) }
  }

  @keyframes imp-loader-dots {
    20% { background-position: 0% 0%, 50% 50%, 100% 50% }
    40% { background-position: 0% 100%, 50% 0%, 100% 50% }
    60% { background-position: 0% 50%, 50% 100%, 100% 0% }
    80% { background-position: 0% 50%, 50% 50%, 100% 100% }
  }

  @keyframes imp-loader-bar {
    to { background-position: 250% 50%, 50% 50% }
  }

  @keyframes imp-loader-pulse {
    from { transform: scale(0.4); opacity: 1 }
    to { transform: scale(1); opacity: 0 }
  }

  @media (prefers-reduced-motion: reduce) {
    .${Ru} { animation-duration: 2s }
  }
`,Hu=(e={})=>V({...e,class:Ru,"aria-hidden":`true`}),Uu=`imp.form`,Wu=`imp.form.errors`,Gu=`imp.form.touched`,Ku=`imp.form.submitting`,qu=`imp.form.submits`,Ju=`imp.form.validating`,Yu=`imp:form-action`,Xu={"imp.form.required":`This field is required`,"imp.form.minLength":`Use at least {min} characters`,"imp.form.maxLength":`Use at most {max} characters`,"imp.form.min":`Must be {min} or more`,"imp.form.max":`Must be {max} or less`,"imp.form.pattern":`Check the format`,"imp.form.number":`Enter a number`,"imp.form.checkFailed":`We could not check this - try again`,"imp.form.submitFailed":`We could not send the form - try again`,"imp.form.optional":`optional`,"imp.form.stepDown":`Decrease`,"imp.form.stepUp":`Increase`},Zu=`button`,Qu=[`variant`,`size`,`disabled`,`loading`,`block`,`square`,`label`,`pressed`,`expanded`,`haspopup`,`popoverTarget`,`popoverAction`,`submit`,`events`],$u=[`default`,`primary`,`ghost`,`danger`,`link`],ed=[`menu`,`listbox`],td=[`toggle`,`show`,`hide`],nd=(e,t)=>{let n=e?.click;if(n===void 0)return e;let[r,i]=Array.isArray(n)?n:[n,null];return typeof r==`function`?{...e,click:[e=>t()||r(e),i]}:e},rd=e=>{try{return j(e,Ku)}catch{return h.warn(`${Zu}: 'submit' needs a form around the button - the click does nothing`),null}},id=e=>e.dispatchEvent(new CustomEvent(Yu,{bubbles:!0,composed:!0,cancelable:!0,detail:{action:`submit`}})),ad=e=>`color-mix(in oklab, ${U(`color-primary`)} ${e}, ${U(`color-surface`)})`,od={styles:()=>`
  ${Ks}

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${U(`space-2`)};
    margin: 0;
    border: ${U(`border-width`)} solid transparent;
    ${zs()}
    ${W()}
    font-weight: ${U(`font-weight-bold`)};
    line-height: ${U(`line-height-tight`)};
    cursor: pointer;
    transition:
      background-color ${U(`duration-fast`)} ease-out,
      border-color ${U(`duration-fast`)} ease-out,
      color ${U(`duration-fast`)} ease-out;
  }

  .button:focus-visible {${G()}}

  ${Bs(`.button`)}

  .button:is(:disabled, [aria-disabled='true']) {
    cursor: not-allowed;
    opacity: ${U(`disabled-opacity`)};
  }

  ${Vs(`.button[aria-pressed='true']`)}

  .button[aria-pressed='true'] {
    background-color: ${ad(`12%`)};
    border-color: ${U(`color-primary`)};
    color: color-mix(in oklab, ${U(`color-primary`)} 62%, ${U(`color-text`)});
  }

  .button[aria-pressed='true']:hover:not(:disabled, [aria-disabled='true']) {
    background-color: ${ad(`20%`)};
  }

  .button[aria-pressed='true']:active:not(:disabled, [aria-disabled='true']) {
    background-color: ${ad(`28%`)};
  }

  @media (forced-colors: active) {
    .button[aria-pressed='true'] {
      background-color: Highlight;
      color: HighlightText;
      forced-color-adjust: none;
    }
  }

  ${ac()}

  .variant-default {
    background-color: ${U(`color-surface`)};
    border-color: ${U(`color-border`)};
    color: ${U(`color-text`)};
  }

  .variant-default:hover:not(:disabled, [aria-disabled='true']) {
    background-color: ${U(`color-surface-hover`)};
  }

  .variant-default:active:not(:disabled, [aria-disabled='true']) {
    background-color: ${Ms(`color-surface`)};
  }

  .variant-primary {
    background-color: ${U(`color-primary`)};
    color: ${U(`color-on-primary`)};
  }

  .variant-primary:hover:not(:disabled, [aria-disabled='true']) {
    background-color: ${js(`color-primary`)};
  }

  .variant-primary:active:not(:disabled, [aria-disabled='true']) {
    background-color: ${Ms(`color-primary`)};
  }

  .variant-ghost {
    background-color: transparent;
    color: ${U(`color-text`)};
  }

  .variant-ghost:hover:not(:disabled, [aria-disabled='true']) {
    background-color: ${U(`color-surface-hover`)};
  }

  .variant-ghost:active:not(:disabled, [aria-disabled='true']) {
    background-color: ${Ms(`color-surface`)};
  }

  .variant-danger {
    background-color: ${U(`color-danger`)};
    color: ${U(`color-on-danger`)};
  }

  .variant-danger:hover:not(:disabled, [aria-disabled='true']) {
    background-color: ${js(`color-danger`)};
  }

  .variant-danger:active:not(:disabled, [aria-disabled='true']) {
    background-color: ${Ms(`color-danger`)};
  }

  .variant-link {
    min-block-size: 0;
    padding: 0;
    border: none;
    background-color: transparent;
    color: ${U(`color-primary`)};
    font-weight: ${U(`font-weight-normal`)};
    line-height: ${U(`line-height-normal`)};
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .variant-link:hover:not(:disabled, [aria-disabled='true']) {
    color: ${js(`color-primary`)};
  }

  .variant-link:active:not(:disabled, [aria-disabled='true']) {
    color: ${Ms(`color-primary`)};
  }

  .label {
    display: inline-flex;
    align-items: center;
    gap: ${U(`space-2`)};
  }

  .label .icon {
    display: block;
    inline-size: 1em;
    block-size: 1em;
  }

  .square .label {
    block-size: 1lh;
  }

  ${Vu()}

  .block {
    inline-size: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    .button { transition: none }
  }

  ${Ws}
`,props:Qu,setup:(e,t,n)=>{let r=I(Zu,`variant`,t.variant,$u,`default`),i=I(Zu,`size`,t.size,Ys,`md`),a=Hu({hidden:!0}),o=!1,s=!1,c=()=>o||s,l=O(`button`,{type:`button`,class:[`button`,`variant-${r}`,`size-${i}`,t.block&&`block`,t.square&&`square`],events:nd(t.events,c)},a,V({class:`label`},...n));t.haspopup!==void 0&&l.setAttribute(`aria-haspopup`,I(Zu,`haspopup`,t.haspopup,ed,`menu`)),t.popoverTarget!==void 0&&(t.popoverTarget instanceof Element?(l.popoverTargetElement=t.popoverTarget,l.popoverTargetAction=I(Zu,`popoverAction`,t.popoverAction,td,`toggle`)):h.warn(`${Zu}: 'popoverTarget' must be an element with a popover attribute`));let u=!1,d=()=>{let e=c()&&u;l.disabled=c()&&!e,e?l.setAttribute(`aria-disabled`,`true`):l.removeAttribute(`aria-disabled`),l.setAttribute(`aria-busy`,String(s)),a.hidden=!s};l.addEventListener(`focus`,()=>{u=!0}),l.addEventListener(`blur`,()=>{u=!1,d()}),l.addEventListener(`click`,e=>{c()&&(e.preventDefault(),e.stopPropagation())}),L(e,t.disabled,e=>{o=!!e,d()});let f=!1,p=!1,m=()=>{s=f||p,d()};if(L(e,t.loading,e=>{f=!!e,m()}),t.submit!==void 0&&t.submit!==!1){t.submit!==!0&&h.warn(`${Zu}: 'submit' takes true or false`);let n=rd(e);n&&(L(e,n,e=>{p=!!e,m()}),l.addEventListener(`click`,()=>{c()||id(l)}))}if(L(e,t.label,e=>{e!==void 0&&l.setAttribute(`aria-label`,String(e))}),t.expanded!==void 0&&(l.setAttribute(`aria-expanded`,`false`),L(e,t.expanded,e=>{l.setAttribute(`aria-expanded`,String(!!e))})),t.pressed!==void 0){let n=Lu(Zu,{prop:`pressed`,source:t.pressed,node:l,event:`toggle`,detail:`pressed`,paint:e=>l.setAttribute(`aria-pressed`,String(e))});l.setAttribute(`aria-pressed`,`false`);let r=D(t.pressed)&&typeof t.pressed.set!=`function`;l.addEventListener(`click`,()=>{!r&&!c()&&n.change(!n.get(),{notify:!0})}),n.follow(e)}return l}},J=(...e)=>z(Zu,()=>od)(...e),sd=e=>function(t){t.target===t.currentTarget&&e.call(this,t)},cd=(e,t)=>{if(!e||typeof e!=`object`)return e;let n={...e};for(let e of t){let t=n[e],[r,i]=Array.isArray(t)?t:[t,null];typeof r==`function`&&(n[e]=i?[sd(r),i]:sd(r))}return n},ld=[[`path`,{d:`M12 5v14`}],[`path`,{d:`m19 12-7 7-7-7`}]],ud=[[`path`,{d:`m12 19-7-7 7-7`}],[`path`,{d:`M19 12H5`}]],dd=[[`path`,{d:`M5 12h14`}],[`path`,{d:`m12 5 7 7-7 7`}]],fd=[[`path`,{d:`m16 3 4 4-4 4`}],[`path`,{d:`M20 7H4`}],[`path`,{d:`m8 21-4-4 4-4`}],[`path`,{d:`M4 17h16`}]],pd=[[`path`,{d:`m5 12 7-7 7 7`}],[`path`,{d:`M12 19V5`}]],md=[[`path`,{d:`M20 6 9 17l-5-5`}]],hd=[[`path`,{d:`m11 17-5-5 5-5`}],[`path`,{d:`m18 17-5-5 5-5`}]],gd=[[`circle`,{cx:`12`,cy:`12`,r:`10`}],[`path`,{d:`m16 9-5.5 5.5L8 12`}]],_d=[[`circle`,{cx:`12`,cy:`12`,r:`10`}],[`path`,{d:`m15 9-6 6`}],[`path`,{d:`m9 9 6 6`}]],vd=[[`rect`,{width:`8`,height:`4`,x:`8`,y:`2`,rx:`1`,ry:`1`}],[`path`,{d:`M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2`}],[`path`,{d:`M16 4h2a2 2 0 0 1 2 2v4`}],[`path`,{d:`M21 14H11`}],[`path`,{d:`m15 10-4 4 4 4`}]],yd=[[`path`,{d:`M11 14h10`}],[`path`,{d:`M16 4h2a2 2 0 0 1 2 2v1.344`}],[`path`,{d:`m17 18 4-4-4-4`}],[`path`,{d:`M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 1.793-1.113`}],[`rect`,{x:`8`,y:`2`,width:`8`,height:`4`,rx:`1`}]],bd=[[`rect`,{width:`18`,height:`18`,x:`3`,y:`3`,rx:`2`}],[`path`,{d:`M12 3v18`}]],xd=[[`rect`,{width:`14`,height:`14`,x:`8`,y:`8`,rx:`2`,ry:`2`}],[`path`,{d:`M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2`}]],Sd=[[`path`,{d:`M12 15V3`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`}],[`path`,{d:`m7 10 5 5 5-5`}]],Cd=[[`path`,{d:`M15 3h6v6`}],[`path`,{d:`M10 14 21 3`}],[`path`,{d:`M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6`}]],wd=[[`path`,{d:`M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0`}],[`circle`,{cx:`12`,cy:`12`,r:`3`}]],Td=[[`path`,{d:`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`}]],Ed=[[`path`,{d:`M13.659 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v11.5`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`}],[`path`,{d:`M8 12v-1`}],[`path`,{d:`M8 18v-2`}],[`path`,{d:`M8 7V6`}],[`circle`,{cx:`8`,cy:`20`,r:`2`}]],Dd=[[`path`,{d:`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`}],[`path`,{d:`m9 15 2 2 4-4`}]],Od=[[`path`,{d:`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`}],[`path`,{d:`M10 12.5 8 15l2 2.5`}],[`path`,{d:`m14 12.5 2 2.5-2 2.5`}]],kd=[[`path`,{d:`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`}],[`path`,{d:`M9 10h6`}],[`path`,{d:`M12 13V7`}],[`path`,{d:`M9 17h6`}]],Ad=[[`path`,{d:`M4 6.835V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-.343`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`}],[`path`,{d:`M2 19a2 2 0 0 1 4 0v1a2 2 0 0 1-4 0v-4a6 6 0 0 1 12 0v4a2 2 0 0 1-4 0v-1a2 2 0 0 1 4 0`}]],jd=[[`path`,{d:`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`}],[`circle`,{cx:`10`,cy:`12`,r:`2`}],[`path`,{d:`m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22`}]],Md=[[`path`,{d:`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`}],[`path`,{d:`M9 15h6`}],[`path`,{d:`M12 18v-6`}]],Nd=[[`path`,{d:`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`}],[`path`,{d:`M12 17h.01`}],[`path`,{d:`M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3`}]],Pd=[[`path`,{d:`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`}],[`path`,{d:`M8 13h2`}],[`path`,{d:`M14 13h2`}],[`path`,{d:`M8 17h2`}],[`path`,{d:`M14 17h2`}]],Fd=[[`path`,{d:`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`}],[`path`,{d:`M10 9H8`}],[`path`,{d:`M16 13H8`}],[`path`,{d:`M16 17H8`}]],Id=[[`path`,{d:`M4 12V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`}],[`path`,{d:`m10 17.843 3.033-1.755a.64.64 0 0 1 .967.56v4.704a.65.65 0 0 1-.967.56L10 20.157`}],[`rect`,{width:`7`,height:`6`,x:`3`,y:`16`,rx:`1`}]],Ld=[[`path`,{d:`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`}],[`path`,{d:`m14.5 12.5-5 5`}],[`path`,{d:`m9.5 12.5 5 5`}]],Rd=[[`path`,{d:`M15 2h-4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8`}],[`path`,{d:`M16.706 2.706A2.4 2.4 0 0 0 15 2v5a1 1 0 0 0 1 1h5a2.4 2.4 0 0 0-.706-1.706z`}],[`path`,{d:`M5 7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 1.732-1`}]],zd=[[`path`,{d:`M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z`}]],Bd=[[`path`,{d:`m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2`}]],Vd=[[`path`,{d:`M12 10v6`}],[`path`,{d:`M9 13h6`}],[`path`,{d:`M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z`}]],Hd=[[`path`,{d:`M10.7 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v4.1`}],[`path`,{d:`m21 21-1.9-1.9`}],[`circle`,{cx:`17`,cy:`17`,r:`3`}]],Ud=[[`path`,{d:`M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z`}],[`path`,{d:`M12 10v6`}],[`path`,{d:`m9 13 3-3 3 3`}]],Wd=[[`path`,{d:`M15 6a9 9 0 0 0-9 9V3`}],[`circle`,{cx:`18`,cy:`6`,r:`3`}],[`circle`,{cx:`6`,cy:`18`,r:`3`}]],Gd=[[`circle`,{cx:`5`,cy:`6`,r:`3`}],[`path`,{d:`M12 6h5a2 2 0 0 1 2 2v7`}],[`path`,{d:`m15 9-3-3 3-3`}],[`circle`,{cx:`19`,cy:`18`,r:`3`}],[`path`,{d:`M12 18H7a2 2 0 0 1-2-2V9`}],[`path`,{d:`m9 15 3 3-3 3`}]],Kd=[[`path`,{d:`M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8`}],[`path`,{d:`M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z`}]],qd=[[`circle`,{cx:`12`,cy:`12`,r:`10`}],[`path`,{d:`M12 16v-4`}],[`path`,{d:`M12 8h.01`}]],Jd=[[`rect`,{width:`7`,height:`7`,x:`3`,y:`3`,rx:`1`}],[`rect`,{width:`7`,height:`7`,x:`14`,y:`3`,rx:`1`}],[`rect`,{width:`7`,height:`7`,x:`14`,y:`14`,rx:`1`}],[`rect`,{width:`7`,height:`7`,x:`3`,y:`14`,rx:`1`}]],Yd=[[`path`,{d:`M3 5h.01`}],[`path`,{d:`M3 12h.01`}],[`path`,{d:`M3 19h.01`}],[`path`,{d:`M8 5h13`}],[`path`,{d:`M8 12h13`}],[`path`,{d:`M8 19h13`}]],Xd=[[`path`,{d:`M5 12h14`}]],Zd=[[`rect`,{width:`20`,height:`14`,x:`2`,y:`3`,rx:`2`}],[`line`,{x1:`8`,x2:`16`,y1:`21`,y2:`21`}],[`line`,{x1:`12`,x2:`12`,y1:`17`,y2:`21`}]],Qd=[[`path`,{d:`M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401`}]],$d=[[`path`,{d:`M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z`}],[`circle`,{cx:`13.5`,cy:`6.5`,r:`.5`,fill:`currentColor`}],[`circle`,{cx:`17.5`,cy:`10.5`,r:`.5`,fill:`currentColor`}],[`circle`,{cx:`6.5`,cy:`12.5`,r:`.5`,fill:`currentColor`}],[`circle`,{cx:`8.5`,cy:`7.5`,r:`.5`,fill:`currentColor`}]],ef=[[`rect`,{width:`18`,height:`18`,x:`3`,y:`3`,rx:`2`}],[`path`,{d:`M9 3v18`}]],tf=[[`path`,{d:`M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z`}],[`path`,{d:`m15 5 4 4`}]],nf=[[`path`,{d:`M5 12h14`}],[`path`,{d:`M12 5v14`}]],rf=[[`path`,{d:`M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8`}],[`path`,{d:`M21 3v5h-5`}],[`path`,{d:`M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16`}],[`path`,{d:`M8 16H3v5`}]],af=[[`path`,{d:`M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8`}],[`path`,{d:`M3 3v5h5`}],[`path`,{d:`M12 7v5l4 2`}]],of=[[`path`,{d:`M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z`}],[`path`,{d:`M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7`}],[`path`,{d:`M7 3v4a1 1 0 0 0 1 1h7`}]],sf=[[`path`,{d:`m21 21-4.34-4.34`}],[`circle`,{cx:`11`,cy:`11`,r:`8`}]],cf=[[`circle`,{cx:`12`,cy:`12`,r:`4`}],[`path`,{d:`M12 2v2`}],[`path`,{d:`M12 20v2`}],[`path`,{d:`m4.93 4.93 1.41 1.41`}],[`path`,{d:`m17.66 17.66 1.41 1.41`}],[`path`,{d:`M2 12h2`}],[`path`,{d:`M20 12h2`}],[`path`,{d:`m6.34 17.66-1.41 1.41`}],[`path`,{d:`m19.07 4.93-1.41 1.41`}]],lf=[[`path`,{d:`M12 20h-1a2 2 0 0 1-2-2 2 2 0 0 1-2 2H6`}],[`path`,{d:`M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7`}],[`path`,{d:`M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1`}],[`path`,{d:`M6 4h1a2 2 0 0 1 2 2 2 2 0 0 1 2-2h1`}],[`path`,{d:`M9 6v12`}]],uf=[[`path`,{d:`M10 11v6`}],[`path`,{d:`M14 11v6`}],[`path`,{d:`M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6`}],[`path`,{d:`M3 6h18`}],[`path`,{d:`M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2`}]],df=[[`path`,{d:`m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3`}],[`path`,{d:`M12 9v4`}],[`path`,{d:`M12 17h.01`}]],ff=[[`path`,{d:`M12 3v12`}],[`path`,{d:`m17 8-5-5-5 5`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`}]],pf=[[`path`,{d:`M18 6 6 18`}],[`path`,{d:`m6 6 12 12`}]],mf=`tooltip`,hf=[`block-start`,`block-end`,`inline-start`,`inline-end`];let gf=0;const _f=()=>`
  .tip {
    position: fixed;
    position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
    position-visibility: anchors-visible;
    box-sizing: border-box;
    inset: auto;
    inline-size: max-content;
    max-inline-size: 20rem;
    margin: ${U(`space-1`)};
    padding-block: ${U(`space-1`)};
    padding-inline: ${U(`space-2`)};
    border: ${U(`border-width`)} solid transparent;
    border-radius: ${U(`radius-item`)};
    background-color: ${U(`color-text`)};
    color: ${U(`color-surface`)};
    ${W()}
    font-size: ${U(`font-size-sm`)};
    line-height: ${U(`line-height-tight`)};
    box-shadow: ${U(`shadow-sm`)};
    pointer-events: none;
    overflow: visible;
    opacity: 1;
    transition: opacity ${U(`duration-fast`)} ease-out;
  }

  .tip.block-start { position-area: block-start center }
  .tip.block-end { position-area: block-end center }
  .tip.inline-start { position-area: center inline-start }
  .tip.inline-end { position-area: center inline-end }

  .tip:not(:popover-open) { display: none }

  @starting-style {
    .tip:popover-open { opacity: 0 }
  }

  @media (prefers-reduced-motion: reduce) {
    .tip { transition: none }
  }

  @media (forced-colors: active) {
    .tip { border-color: CanvasText }
  }
`,vf=e=>{let t=e.getBoundingClientRect(),{clientWidth:n,clientHeight:r}=document.documentElement,i=t.left+t.width/2,a=t.top+t.height/2,o=getComputedStyle(e).direction===`rtl`;return i<n*.15?o?`inline-start`:`inline-end`:i>n*.85?o?`inline-end`:`inline-start`:a<r/2?`block-end`:`block-start`},yf=(e,t,n,{enabled:r=()=>!0}={})=>{gf+=1;let i=`--imp-tip-${gf}`,a=B({class:`tip`,"aria-hidden":`true`,popover:`manual`},qo(e,n));a.style.positionAnchor=i;let o=null,s=!1,c=()=>a.matches(`:popover-open`),l=!1,u=``,d=()=>{if(l)return;l=!0,u=t.style.anchorName;let e=getComputedStyle(t).anchorName;t.style.anchorName=!e||e===`none`?i:`${e}, ${i}`},f=()=>{l&&(l=!1,t.style.anchorName=u)};a.addEventListener(`toggle`,()=>{c()||f()});let p=()=>{o=null,r()&&a.isConnected&&t.isConnected&&!c()&&(a.classList.remove(...hf),a.classList.add(vf(t)),d(),a.showPopover())},m=()=>{clearTimeout(o),o=null,s=!1,c()&&a.hidePopover(),f()},h=e=>{clearTimeout(o),o=setTimeout(p,e)};e.abortSignal.addEventListener(`abort`,()=>{clearTimeout(o),o=null,c()&&a.hidePopover(),f()},{once:!0});let g=(n,r)=>t.addEventListener(n,r,{signal:e.abortSignal});return g(`pointerenter`,e=>{e.pointerType!==`touch`&&h(150)}),g(`pointerleave`,m),g(`pointerdown`,e=>{if(e.pointerType!==`touch`)return m();s=!0,h(350)}),g(`pointerup`,m),g(`pointercancel`,m),g(`contextmenu`,e=>{s&&e.preventDefault()}),g(`focusin`,p),g(`focusout`,m),g(`keydown`,e=>{e.key===`Escape`&&m()}),a},bf={styles:()=>`
  :host {
    display: inline-block;
  }

  .anchor {
    display: block;
  }

  ${_f()}
`,props:[`text`],setup:(e,t,n)=>{(t.text===void 0||t.text===null)&&h.warn(`${mf}: pass 'text' - it is what the tooltip shows`),n.length===0&&h.warn(`${mf}: pass the control as a child - the tooltip needs a trigger to anchor to`);let r=V({class:`anchor`},...n);return[r,yf(e,r,t.text??``)]}},xf=(...e)=>z(mf,()=>bf)(...e),Sf=[1,2,3,4,5,6],Cf={styles:()=>`
  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-family: ${U(`font-family-heading`)};
    font-weight: ${U(`font-weight-bold`)};
    line-height: ${U(`line-height-tight`)};
    text-wrap: balance;
  }

  h1 { font-size: ${U(`font-size-2xl`)} }
  h2 { font-size: ${U(`font-size-xl`)} }
  h3 { font-size: ${U(`font-size-lg`)} }
  h4, h5, h6 { font-size: ${U(`font-size-md`)} }

  ${ec()}

  .tone-default {
    color: ${U(`color-heading`)};
  }

  ${sc()}
`,props:[`level`,`tone`,`align`],setup:(e,t,n)=>{let r=I(`heading`,`level`,t.level,Sf,1),i=I(`heading`,`tone`,t.tone,Js,`default`),a=I(`heading`,`align`,t.align,Zs,`start`);return O(`h${r}`,{class:[`tone-${i}`,`align-${a}`]},...n)}},wf=(...e)=>z(`heading`,()=>Cf)(...e),Tf={styles:()=>`
  p, span {
    margin: 0;
    ${W()}
    line-height: ${U(`line-height-normal`)};
  }

  ${ec()}
  ${tc()}
  ${oc()}
  ${sc()}
`,props:[`tone`,`size`,`weight`,`align`,`inline`],setup:(e,t,n)=>{let r=I(`text`,`tone`,t.tone,Js,`default`),i=I(`text`,`size`,t.size,Ys,`md`),a=I(`text`,`weight`,t.weight,Xs,`normal`),o=I(`text`,`align`,t.align,Zs,`start`);return(t.inline?V:gs)({class:[`tone-${r}`,`size-${i}`,`weight-${a}`,`align-${o}`]},...n)}},Ef=(...e)=>z(`text`,()=>Tf)(...e),Df=[`http:`,`https:`,`mailto:`,`tel:`],Of=e=>URL.parse(e,`https://relative.invalid/`)?.protocol??null,kf=e=>Df.includes(Of(e)),Af=[`http:`,`https:`],jf=e=>typeof e!=`string`||e===``?!1:e.startsWith(`data:image/`)?!0:Af.includes(Of(e)),Mf=(e,t)=>typeof t!=`string`||t===``?null:kf(t)?t:(h.warn(`${e}: an 'href' with the scheme '${Of(t)??`unknown`}' is not followed - use http:, https:, mailto:, tel:, a path or a '#' fragment`),null),Nf=/^[a-z][a-z0-9+.-]*:/i,Pf=e=>Nf.test(e)||e.startsWith(`//`),Ff=e=>e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey,If=[`mailto:`,`tel:`],Lf=e=>{If.includes(Of(e))?globalThis.location.assign(e):q(e,{external:!0})},Rf=(e,t)=>(e.addEventListener(`click`,e=>{Ff(e)||(e.preventDefault(),t())}),e),zf={styles:()=>`
  a {
    ${W()}
    color: ${U(`color-primary`)};
    line-height: ${U(`line-height-normal`)};
    text-decoration: underline;
    text-underline-offset: 2px;
    border-radius: ${U(`radius-item`)};
    transition: color ${U(`duration-fast`)} ease-out;
  }

  a:hover { color: ${js(`color-primary`)} }

  a:focus-visible {${G()}}

  a.tone-secondary { color: ${U(`color-secondary`)} }

  ${tc()}
  ${oc()}

  @media (prefers-reduced-motion: reduce) {
    a { transition: none }
  }
`,props:[`href`,`external`,`tone`,`size`,`weight`,`events`],setup:(e,t,n)=>{let r=I(`link`,`tone`,t.tone,Js,`default`),i=I(`link`,`size`,t.size,Ys,`md`),a=I(`link`,`weight`,t.weight,Xs,`normal`),{external:o}=t;(typeof t.href!=`string`||t.href===``)&&h.warn(`link: needs an 'href' - without one it renders text that cannot be followed`);let s=Mf(`link`,t.href),c=s!==null,l={class:[`tone-${r}`,`size-${i}`,`weight-${a}`],events:t.events};c&&(l.href=Ut(s)),o&&(l.target=`_blank`,l.rel=`noopener`);let u=Zo(l,...n);return c&&!o&&!Pf(s)&&Rf(u,()=>q(s)),u}},Bf=(...e)=>z(`link`,()=>zf)(...e),Vf={start:`span-inline-end`,center:`center`,end:`span-inline-start`},Hf={start:`span-block-end`,center:`center`,end:`span-block-start`},Uf=(e,t)=>e===`block-start`||e===`block-end`?`${e} ${Vf[t]}`:`${Hf[t]} ${e}`,Wf=({trigger:e,panel:t,placement:n,align:r,anchor:i=`--imp-anchor`})=>`
  ${e} {
    anchor-name: ${i};
  }

  ${t} {
    position: fixed;
    position-anchor: ${i};
    position-area: ${Uf(n,r)};
    position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
    position-try-order: most-block-size;
    position-visibility: anchors-visible;
    box-sizing: border-box;
    inset: auto;
    inline-size: max-content;
    max-inline-size: calc(100dvi - ${U(`space-6`)} - ${U(`space-6`)});
    max-block-size: calc(100% - ${U(`space-1`)} - ${U(`space-1`)});
    margin: ${U(`space-1`)};
    padding: 0;
    border: none;
    background-color: transparent;
    overflow: auto;
    overscroll-behavior: contain;
    opacity: 1;
    transition: opacity ${U(`duration-fast`)} ease-out;
    ${Hs()}
  }

  ${t}:not(:popover-open) {
    display: none;
  }

  @starting-style {
    ${t}:popover-open { opacity: 0 }
  }

  @media (prefers-reduced-motion: reduce) {
    ${t} { transition: none }
  }
`,Gf=(e,t)=>e.id===void 0?String(t):String(e.id),Kf=(e,t)=>e==null?null:bc(e)?K(e,t):e,qf=e=>typeof e==`function`?e:null,Jf=(e,t)=>Mf(e,t),Yf=(e,t,{prop:n=`items`,shape:r,key:i=`label`,noun:a=`an item`,item:o})=>Array.isArray(t)?t.flatMap((t,n)=>{if(!t||typeof t!=`object`||t instanceof Node||t[i]===void 0)return h.warn(`${e}: ${a} is not an object with a '${i}' - skipping it`),[];let r=o(t,n);return r===null?[]:[r]}):(h.warn(`${e}: '${n}' must be an array of ${r} - showing none`),[]),Xf=e=>getComputedStyle(e).direction===`rtl`,Zf=(e,t)=>e!==`ArrowRight`&&e!==`ArrowLeft`?0:e===`ArrowRight`===Xf(t)?-1:1,Qf=e=>e===`ArrowDown`?1:e===`ArrowUp`?-1:0,$f=(e,t,n)=>t===`vertical`?Qf(e):t===`horizontal`?Zf(e,n):Zf(e,n)||Qf(e),ep=(e,{orientation:t=`horizontal`,element:n,edges:r=!0}={})=>{let i=$f(e,t,n);return i===0?r?e===`Home`?{edge:1}:e===`End`?{edge:-1}:null:null:{step:i}},tp=(e,t,n,r,{wrap:i=!0}={})=>{let a=e.length,o=t;for(let t=0;t<a;t++){if(o+=n,i)o=(o+a)%a;else if(o<0||o>=a)return null;if(r(e[o]))return e[o]}return null},np=(e,t,n)=>(t===1?e:[...e].reverse()).find(n)??null,rp=(e,t,n,r=()=>!0,i)=>e.edge===void 0?tp(t,n,e.step,r,i):np(t,e.edge,r),ip=(e,t)=>{for(let n of e)n.tabIndex=n===t?0:-1},ap=(e,t)=>{t&&(ip(e,t),t.focus())},op=()=>`
  .panel {
    display: flex;
    flex-direction: column;
    gap: ${U(`space-1`)};
    min-inline-size: 10rem;
    padding: ${U(`space-1`)};
    border: ${U(`border-width`)} solid ${U(`color-border`)};
    border-radius: ${U(`radius-container`)};
    background-color: ${U(`color-surface`)};
    box-shadow: ${U(`shadow-md`)};
    color: ${U(`color-text`)};
    ${W()}
  }

  .option {
    display: flex;
    align-items: center;
    gap: ${U(`space-2`)};
    box-sizing: border-box;
    margin: 0;
    border: none;
    border-radius: ${U(`radius-item`)};
    padding-block: ${U(`space-1`)};
    padding-inline: ${U(`space-2`)};
    background-color: transparent;
    color: ${U(`color-text`)};
    ${W()}
    font-size: ${U(`font-size-sm`)};
    line-height: ${U(`line-height-normal`)};
    text-decoration: none;
    white-space: nowrap;
    text-align: start;
    cursor: pointer;
  }

  .option:hover:not(:disabled) {
    background-color: ${U(`color-surface-hover`)};
  }

  .option:focus-visible {${G()}}

  .option:disabled {
    cursor: not-allowed;
    opacity: ${U(`disabled-opacity`)};
  }

  .option .icon,
  .option .check {
    display: block;
    flex: none;
    inline-size: 1em;
    block-size: 1em;
  }

  .option .check {
    margin-inline-start: auto;
    padding-inline-start: ${U(`space-2`)};
    box-sizing: content-box;
    color: ${U(`color-primary`)};
  }

  .option[aria-checked='false'] .check {
    visibility: hidden;
  }

  @media (forced-colors: active) {
    .panel { border-color: CanvasText }
  }
`,sp={class:`option`,role:`menuitem`,tabindex:`-1`},cp=({panel:e,opener:t,options:n,onToggle:r})=>{let i=!1,a=!1,o=()=>n.filter(e=>!e.disabled),s=e=>ap(n,e),c=()=>{i&&e.hidePopover()};return e.append(...n),e.addEventListener(`keydown`,t=>{if(t.key===`Tab`){c(),a=!1;return}let n=ep(t.key,{orientation:`vertical`});if(n===null)return;let r=o(),i=r.indexOf(e.getRootNode().activeElement);s(rp(n,r,i)),t.preventDefault()}),e.addEventListener(`beforetoggle`,t=>{i=t.newState===`open`,r(i),a=!i&&e.contains(e.getRootNode().activeElement)}),e.addEventListener(`toggle`,e=>{if(e.newState===`open`){let e=o();s(e.find(e=>e.tabIndex===0)??e[0])}else a&&t.focus()}),{close:c}},lp=(e,t)=>{let n=k(`${t}.label`,F(t));return N.watch(e,()=>n.set(F(t))),n},up=(e,t)=>{let n=document.createElementNS(`http://www.w3.org/2000/svg`,e);for(let[e,r]of Object.entries(t))n.setAttribute(e,r);return n},dp=e=>up(`svg`,{class:e,viewBox:`0 0 24 24`,fill:`none`,"aria-hidden":`true`}),fp={stroke:`currentColor`,"stroke-width":`2`,"stroke-linecap":`round`},pp=(e=`icon`)=>{let t=dp(e);for(let e of[`6`,`12`,`18`])t.append(up(`path`,{d:`M4 ${e}h16`,...fp}));return t},mp=(e=`icon`)=>{let t=dp(e);return t.append(up(`path`,{d:`M6 6l12 12M18 6L6 18`,...fp})),t},hp=(e=`icon`)=>{let t=dp(e);for(let e of[`5`,`12`,`19`])t.append(up(`circle`,{cx:e,cy:`12`,r:`1.75`,fill:`currentColor`}));return t},gp=(e=`icon`)=>{let t=dp(e);return t.append(up(`path`,{d:`M9 6l6 6-6 6`,...fp})),t},_p=(e=`icon`)=>{let t=dp(e);return t.append(up(`path`,{d:`M6 9l6 6 6-6`,...fp})),t},vp=(e=`icon`)=>{let t=dp(e);return t.append(up(`path`,{d:`M5 12l5 5L20 7`,...fp,"stroke-linejoin":`round`})),t},yp=`menuButton`,bp=[`items`,`trigger`,`variant`,`size`,`disabled`,`label`,`events`],xp=[`more`,`arrow`],Sp=`select`,Cp=`imp.menuButton.more`,wp=`imp.menuButton.choose`,Tp={[Cp]:`More actions`,[wp]:`Choose an action`},Ep=()=>`
  ${Ks}

  .box {
    display: inline-flex;
    align-items: stretch;
  }

  ${Wf({trigger:`.box`,panel:`.panel`,placement:`block-end`,align:`end`})}

  ${op()}

  ${Ws}
`,Dp=e=>Yf(yp,e,{shape:`{ id, label, onClick }`,item:(e,t)=>({id:Gf(e,t),label:e.label,icon:Kf(e.icon,{size:`sm`}),onClick:qf(e.onClick),disabled:!!e.disabled,checked:e.checked})}),Op=(e,t)=>e.dispatchEvent(new CustomEvent(Sp,{bubbles:!0,composed:!0,cancelable:!0,detail:{id:t.id,item:t}})),kp=({self:e,box:t,panel:n,opener:r,items:i,expanded:a})=>{let o=e=>{c.close(),Op(t,e)&&e.onClick?.({id:e.id,item:e})},s=i.map(t=>{let n=t.checked!==void 0,r=O(`button`,{...sp,...n?{role:`menuitemradio`}:{},type:`button`,disabled:t.disabled,events:{click:()=>o(t)}},t.icon===null?null:V({class:`icon`},qo(e,t.icon)),qo(e,t.label),n?vp(`check`):null);return n&&L(e,t.checked,e=>{r.setAttribute(`aria-checked`,String(!!e))}),r}),c=cp({panel:n,opener:r,options:s,onToggle:e=>a.set(e)});return c},Ap={styles:Ep,props:bp,setup:(e,t,n)=>{let r=I(yp,`variant`,t.variant,$u,`default`),i=I(yp,`size`,t.size,Ys,`md`),a=I(yp,`trigger`,t.trigger,xp,`more`),o=Dp(t.items??[]),s=o.length===0;s&&h.warn(`${yp}: 'items' holds no usable entry - rendering a disabled trigger`);let c=n.length===0,l=B({id:`panel`,class:`panel`,role:`menu`,popover:`auto`}),u=k(`imp.menuButton.expanded`,!1),d=J({variant:r,size:i,square:c,disabled:s?!0:t.disabled,label:t.label??(c?lp(e,a===`arrow`?wp:Cp):void 0),...s?{}:{haspopup:`menu`,expanded:u,popoverTarget:l}},...c?[]:n,a===`arrow`?_p():hp());d.classList.add(`trigger`);let f=B({class:`box`,events:cd(t.events,[Sp])},d,s?null:l);if(!s){let n=kp({self:e,box:f,panel:l,opener:d,items:o,expanded:u});L(e,t.disabled,e=>{e&&n.close()})}return f}},jp=(...e)=>z(yp,()=>Ap,()=>P(Tp))(...e),Mp=e=>{let t=String(e??``).trim().split(/\s+/).filter(Boolean);return t.length===0?``:(t.length===1?[t[0][0]]:[t[0][0],t.at(-1)[0]]).join(``).toUpperCase()},Np=e=>e==null||e===``,Pp=(e,t,n)=>{let r=ss({class:`picture`,alt:``}),i=e=>{r.hidden=!e,n.hidden=e};return r.addEventListener(`error`,()=>i(!1)),L(e,t,e=>{if(Np(e))return r.removeAttribute(`src`),i(!1);r.setAttribute(`src`,String(e)),i(!0)}),r},Fp=(e,t,n,r)=>{if(r)return t.setAttribute(`aria-hidden`,`true`);t.setAttribute(`role`,`img`),L(e,n,e=>t.setAttribute(`aria-label`,String(e??``)))},Ip=(e,{name:t,picture:n,decorative:r=!0,classes:i=[]})=>{let a=V({class:`initials`});L(e,t,e=>{a.textContent=Mp(e)});let o=V({class:[`avatar`,...i]},a);return n!=null&&o.append(Pp(e,n,a)),Fp(e,o,t,r),o},Lp=()=>`
  .avatar {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    inline-size: var(--avatar-size, 2rem);
    block-size: var(--avatar-size, 2rem);
    border-radius: 50%;
    background-color: var(--avatar-fill, ${U(`color-primary`)});
    color: var(--avatar-ink, ${U(`color-on-primary`)});
    font-size: var(--avatar-font-size, ${U(`font-size-sm`)});
    font-weight: ${U(`font-weight-bold`)};
    line-height: 1;
  }

  .avatar [hidden] {
    display: none;
  }

  .avatar .picture {
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
  }

  @media (forced-colors: active) {
    .avatar {
      border: ${U(`border-width`)} solid CanvasText;
      box-sizing: border-box;
    }
  }
`,Rp=`card`,zp=[`header`,`footer`,`href`,`label`,`padding`,`tone`,`events`],Bp=[`sm`,`md`,`lg`],Vp=[`surface`,`primary`],Hp=[[`sm`,`space-3`],[`md`,`space-4`],[`lg`,`space-6`]],Up=()=>Hp.map(([e,t])=>`  .padding-${e} { --card-padding: ${U(t)} }`).join(`
`),Wp=()=>`
  :host {
    display: block;
  }

  .card {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    block-size: 100%;
    padding: var(--card-padding);
    background-color: ${U(`color-surface`)};
    border: ${U(`border-width`)} solid ${U(`color-border`)};
    border-radius: ${U(`radius-container`)};
    box-shadow: ${U(`shadow-sm`)};
    ${W()}
    color: ${U(`color-text`)};
    text-decoration: none;
    transition: border-color ${U(`duration-fast`)} ease-out;
  }

  a.card:hover {
    border-color: ${U(`color-primary`)};
  }

  a.card:focus-visible {${G()}}

  .header {
    padding-block-end: ${U(`space-2`)};
    margin-block-end: ${U(`space-3`)};
    border-block-end: ${U(`border-width`)} solid ${U(`color-border`)};
  }

  .body {
    flex: 1 1 auto;
    min-block-size: 0;
  }

  .footer {
    padding-block-start: ${U(`space-2`)};
    margin-block-start: ${U(`space-3`)};
    border-block-start: ${U(`border-width`)} solid ${U(`color-border`)};
  }

${Up()}

  .tone-primary {
    --card-fill: ${U(`color-primary`)};
    --card-ink: ${U(`color-on-primary`)};
    background-color: var(--card-fill);
    border-color: transparent;
    color: var(--card-ink);
  }

  .tone-primary > * {
    --imp-color-primary: var(--card-ink);
    --imp-color-on-primary: var(--card-fill);
    --imp-color-text: var(--card-ink);
    --imp-color-heading: var(--card-ink);
    --imp-color-secondary: var(--card-ink);
    --imp-color-border: var(--card-ink);
    --imp-color-surface: transparent;
    --imp-color-surface-hover: color-mix(in oklab, var(--card-ink) 12%, transparent);
  }

  .tone-primary .header,
  .tone-primary .footer {
    border-color: color-mix(in oklab, var(--card-ink) 30%, transparent);
  }

  a.card.tone-primary:hover {
    border-color: var(--card-ink);
  }

  @media (forced-colors: active) {
    .card, .header, .footer { border-color: CanvasText }
    a.card { color: LinkText }
  }

  @media (prefers-reduced-motion: reduce) {
    .card { transition: none }
  }
`,Gp=(e,t,n)=>n==null?null:B({class:t},qo(e,n)),Kp={styles:Wp,props:zp,setup:(e,t,n)=>{let r=I(Rp,`padding`,t.padding,Bp,`md`),i=I(Rp,`tone`,t.tone,Vp,`surface`),{label:a}=t,o=Mf(Rp,t.href),s=o!==null,c={class:[`card`,`padding-${r}`,i===`primary`&&`tone-primary`],events:t.events};typeof a==`string`&&a!==``&&(c[`aria-label`]=a);let l=[Gp(e,`header`,t.header),B({class:`body`},...n),Gp(e,`footer`,t.footer)];if(!s)return(a===void 0?B:vs)(c,...l);c.href=Ut(o);let u=Zo(c,...l);return Pf(o)||Rf(u,()=>q(o)),u}},qp=(...e)=>z(Rp,()=>Kp)(...e),Jp={lineComments:[`//`],blockComments:[[`/*`,`*/`]],strings:[`"`,`'`],literals:`true false null`,capitalTypes:!0,decorators:!0},Yp={lineComments:[`#`],blockComments:[],strings:[`"`,`'`]},Xp=`as async await break case catch class const continue debugger default delete do else enum export extends finally for from function get if implements import in instanceof interface let new of package private protected public return set static super switch this throw try typeof var void while with yield`,Zp=`${Xp} abstract asserts declare infer is keyof module namespace override readonly satisfies type`,Qp={text:{scanner:`text`},javascript:{...Jp,strings:[`"`,`'`,"`"],multilineStrings:["`"],keywords:Xp,literals:`true false null undefined NaN Infinity`,regex:!0,keyValue:`:`},typescript:{...Jp,strings:[`"`,`'`,"`"],multilineStrings:["`"],keywords:Zp,literals:`true false null undefined NaN Infinity`,types:`string number boolean object symbol bigint any unknown never void`,regex:!0,keyValue:`:`},json:{lineComments:[`//`],blockComments:[[`/*`,`*/`]],strings:[`"`],literals:`true false null`,stringKeys:!0},html:{scanner:`html`},css:{scanner:`css`},scss:{scanner:`css`,scss:!0},markdown:{scanner:`markdown`},diff:{scanner:`diff`},bash:{...Yp,keywords:`if then else elif fi for while until do done case esac in function select time coproc return break continue local export readonly declare typeset unset shift exit`,builtins:`echo printf cd pwd ls cat grep sed awk read test source alias eval exec set trap wait kill sleep mkdir rm cp mv chmod chown touch curl wget tar git npm npx deno node python pip docker make sudo apt brew ssh scp find xargs sort uniq head tail tee tr cut wc which env dirname basename`,literals:`true false`,variables:/^\$(?:\{[^}\n]*\}|\([^)\n]*\)|\w+|[@*#?$!-])/,flags:!0},python:{...Yp,tripleStrings:!0,stringPrefix:/^[rRbBfFuU]{1,2}(?=['"])/,keywords:`and as assert async await break case class continue def del elif else except finally for from global if import in is lambda match nonlocal not or pass raise return try while with yield`,literals:`True False None`,builtins:`print len range str int float list dict set tuple bool type isinstance open enumerate zip map filter sorted sum min max abs any all input super repr hasattr getattr`,capitalTypes:!0,decorators:!0},ruby:{...Yp,blockComments:[[`=begin`,`=end`]],keywords:`alias and begin break case class def do else elsif end ensure for if in module next not or redo rescue retry return self super then undef unless until when while yield require require_relative include extend attr_accessor attr_reader attr_writer private public protected raise puts lambda proc`,literals:`true false nil`,variables:/^[@$]{1,2}\w+/,extraTokens:[[/^:[A-Za-z_]\w*[?!]?/,`literal`]],capitalTypes:!0},php:{...Jp,lineComments:[`//`,`#`],keywords:`abstract and array as break callable case catch class clone const continue declare default do echo else elseif empty enum extends final finally fn for foreach function global goto if implements include include_once instanceof insteadof interface isset list match namespace new or print private protected public readonly require require_once return static switch throw trait try unset use var while xor yield`,literals:`true false null TRUE FALSE NULL`,variables:/^\$\w+/,extraTokens:[[/^<\?php|^\?>/,`keyword`]]},go:{...Jp,strings:[`"`,`'`,"`"],multilineStrings:["`"],keywords:`break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var`,literals:`true false nil iota`,types:`bool byte complex64 complex128 error float32 float64 int int8 int16 int32 int64 rune string uint uint8 uint16 uint32 uint64 uintptr any`,builtins:`append cap close copy delete len make new panic print println recover`,keyValue:`:`},rust:{...Jp,strings:[`"`],keywords:`as async await break const continue crate dyn else enum extern fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait type unsafe use where while`,literals:`true false None Some Ok Err`,types:`bool char f32 f64 i8 i16 i32 i64 i128 isize str u8 u16 u32 u64 u128 usize`,extraTokens:[[/^'(?:\\.|[^'\\\n])'/,`string`],[/^'[A-Za-z_]\w*/,`type`]],macros:!0,keyValue:`:`},java:{...Jp,keywords:`abstract assert break case catch class const continue default do else enum extends final finally for goto if implements import instanceof interface native new package permits private protected public record return sealed static strictfp super switch synchronized this throw throws transient try var volatile while yield`,types:`boolean byte char double float int long short void`},kotlin:{...Jp,strings:[`"`,`'`],tripleStrings:!0,keywords:`abstract actual annotation as break by catch class companion const constructor continue crossinline data do dynamic else enum expect external final finally for fun get if import in infix init inline inner interface internal is lateinit noinline object open operator out override package private protected public reified return sealed set super suspend tailrec this throw try typealias typeof val var vararg when where while`,keyValue:`:`},swift:{...Jp,keywords:`actor any as associatedtype async await break case catch class continue default defer deinit do else enum extension fallthrough fileprivate for func guard if import in init inout internal is let open operator private protocol public repeat rethrows return self Self some static struct subscript super switch throw throws try typealias var where while`,literals:`true false nil`},dart:{...Jp,keywords:`abstract as assert async await break case catch class const continue covariant default deferred do dynamic else enum export extends extension external factory final finally for get hide if implements import in interface is late library mixin new on operator part required rethrow return sealed set show static super switch sync this throw try typedef var void when while with yield`,types:`int double num bool void dynamic`,keyValue:`:`},scala:{...Jp,tripleStrings:!0,keywords:`abstract case catch class def derives do else end enum export extends extension final finally for given if implicit import lazy match new object override package private protected return sealed super then this throw trait try type using val var while with yield`},c:{...Jp,keywords:`auto break case const continue default do else enum extern for goto if inline register restrict return sizeof static struct switch typedef union volatile while`,literals:`true false NULL`,types:`bool char double float int long short signed unsigned void size_t int8_t int16_t int32_t int64_t uint8_t uint16_t uint32_t uint64_t FILE`,directive:`#`,capitalTypes:!1},cpp:{...Jp,keywords:`alignas alignof and asm auto break case catch class compl concept const consteval constexpr constinit const_cast continue co_await co_return co_yield decltype default delete do dynamic_cast else enum explicit export extern final for friend goto if inline mutable namespace new noexcept not operator or override private protected public register reinterpret_cast requires return sizeof static static_assert static_cast struct switch template this throw try typedef typeid typename union using virtual volatile while xor`,literals:`true false nullptr NULL`,types:`bool char char8_t char16_t char32_t double float int long short signed unsigned void wchar_t size_t string vector map set unordered_map shared_ptr unique_ptr auto`,directive:`#`},csharp:{...Jp,stringPrefix:/^[@$]{1,2}(?=")/,keywords:`abstract as async await base break case catch checked class const continue default delegate do else enum event explicit extern file finally fixed for foreach get goto if implicit in init interface internal is lock namespace new operator out override params private protected public readonly record ref required return sealed set sizeof stackalloc static struct switch this throw try typeof unchecked unsafe using value virtual volatile when where while with yield`,types:`bool byte char decimal double dynamic float int long object sbyte short string uint ulong ushort var void`},sql:{lineComments:[`--`],blockComments:[[`/*`,`*/`]],strings:[`'`,`"`,"`"],keywords:`add all alter and any as asc backup begin between by case cascade check column commit constraint create cross database default delete desc distinct drop else end exec exists explain fetch foreign from full grant group having if in index inner insert into is join key left like limit merge not null offset on or order outer over partition primary procedure recursive references replace returning returns revoke right rollback row rows schema select set table then top transaction trigger truncate union unique update using values view when where window with int integer varchar text boolean timestamp date time numeric decimal float double bigint smallint char varying array json jsonb uuid interval serial`,literals:`true false null`,caseInsensitive:!0},yaml:{...Yp,identifier:/^[\p{L}_][\p{L}\p{N}_.-]*/u,literals:`true false null yes no on off True False Null Yes No On Off TRUE FALSE NULL ~`,keyValue:`:`,stringKeys:!0,extraTokens:[[/^(?:---|\.\.\.)(?=\s|$)/,`punctuation`],[/^[&*][\w-]+/,`variable`],[/^!![\w-]+/,`keyword`]]},toml:{...Yp,tripleStrings:!0,identifier:/^[\p{L}_][\p{L}\p{N}_.-]*/u,literals:`true false inf nan`,keyValue:`=`,extraTokens:[[/^\[\[?[^\]\n]*\]\]?/,`type`]]},ini:{...Yp,lineComments:[`#`,`;`],identifier:/^[\p{L}_][\p{L}\p{N}_.-]*/u,literals:`true false yes no on off`,keyValue:`=`,extraTokens:[[/^\[[^\]\n]*\]/,`type`]]},dockerfile:{...Yp,keywords:`FROM RUN CMD LABEL MAINTAINER EXPOSE ENV ADD COPY ENTRYPOINT VOLUME USER WORKDIR ARG ONBUILD STOPSIGNAL HEALTHCHECK SHELL AS`,caseInsensitive:!0,variables:/^\$(?:\{[^}\n]*\}|\w+)/,flags:!0},makefile:{...Yp,identifier:/^[\p{L}_.][\p{L}\p{N}_.%/-]*/u,keywords:`ifeq ifneq ifdef ifndef else endif include define endef export unexport override vpath`,variables:/^\$(?:\([^)\n]*\)|\{[^}\n]*\}|.)/,keyValue:`:`,extraTokens:[[/^\.[A-Z_]+(?=:)/,`keyword`]]},powershell:{lineComments:[`#`],blockComments:[[`<#`,`#>`]],strings:[`"`,`'`],identifier:/^[\p{L}_][\p{L}\p{N}_-]*/u,keywords:`begin break catch class continue data define do dynamicparam else elseif end enum exit filter finally for foreach from function hidden if in param process return static switch throw trap try until using var while workflow`,caseInsensitive:!0,variables:/^\$(?:\{[^}\n]*\}|\w+|[$?^_])/,flags:!0},perl:{...Yp,keywords:`my our local sub use no package require if elsif else unless while until for foreach do last next redo return print printf die warn eq ne lt gt le ge and or not shift push pop splice keys values each defined undef ref bless`,variables:/^[$@%&]\{?\w+\}?/},lua:{lineComments:[`--`],blockComments:[[`--[[`,`]]`]],strings:[`"`,`'`],keywords:`and break do else elseif end for function goto if in local not or repeat return then until while`,literals:`true false nil`,builtins:`print require pairs ipairs type tostring tonumber setmetatable getmetatable error pcall assert select unpack`},r:{...Yp,keywords:`if else repeat while function for in next break library require return`,literals:`TRUE FALSE NULL Inf NaN NA`},elixir:{...Yp,tripleStrings:!0,keywords:`after alias and case catch cond def defcallback defdelegate defexception defguard defimpl defmacro defmacrop defmodule defoverridable defp defprotocol defstruct do else end fn for if import in not or quote raise receive require rescue reraise send super then throw try unless unquote unquote_splicing use when with`,literals:`true false nil`,extraTokens:[[/^:[A-Za-z_]\w*[?!]?/,`literal`]],capitalTypes:!0,decorators:!0},haskell:{lineComments:[`--`],blockComments:[[`{-`,`-}`]],strings:[`"`],keywords:`as case class data default deriving do else forall foreign hiding if import in infix infixl infixr instance let module newtype of qualified then type where`,literals:`True False Nothing Just`,capitalTypes:!0},clojure:{lineComments:[`;`],blockComments:[],strings:[`"`],identifier:/^[\p{L}_*+!?<>=-][\p{L}\p{N}_*+!?<>=.-]*/u,keywords:`def defn defn- defmacro defmulti defmethod defprotocol defrecord deftype defonce let letfn fn if if-not if-let when when-not when-let cond condp case do loop recur throw try catch finally ns require import use in-ns quote var new set! and or not`,literals:`true false nil`,extraTokens:[[/^:[\w.-]+/,`literal`]]},graphql:{...Yp,strings:[`"`],tripleStrings:!0,keywords:`query mutation subscription fragment on type input enum interface union scalar schema extend directive implements repeatable`,literals:`true false null`,variables:/^\$\w+/,capitalTypes:!0,decorators:!0},hcl:{lineComments:[`#`,`//`],blockComments:[[`/*`,`*/`]],strings:[`"`],keywords:`resource variable output module provider data locals terraform for_each count depends_on in if for each dynamic`,literals:`true false null`,keyValue:`=`}},$p={js:`javascript`,jsx:`javascript`,mjs:`javascript`,cjs:`javascript`,ts:`typescript`,tsx:`typescript`,jsonc:`json`,json5:`json`,htm:`html`,xml:`html`,svg:`html`,vue:`html`,svelte:`html`,sass:`scss`,less:`scss`,md:`markdown`,mdx:`markdown`,patch:`diff`,sh:`bash`,shell:`bash`,zsh:`bash`,console:`bash`,shellsession:`bash`,py:`python`,rb:`ruby`,golang:`go`,rs:`rust`,kt:`kotlin`,kts:`kotlin`,cs:`csharp`,"c#":`csharp`,"c++":`cpp`,cc:`cpp`,cxx:`cpp`,hpp:`cpp`,h:`c`,"objective-c":`c`,objc:`c`,mysql:`sql`,postgresql:`sql`,pgsql:`sql`,sqlite:`sql`,plsql:`sql`,yml:`yaml`,cfg:`ini`,conf:`ini`,env:`ini`,dotenv:`ini`,properties:`ini`,docker:`dockerfile`,containerfile:`dockerfile`,make:`makefile`,mk:`makefile`,ps1:`powershell`,pwsh:`powershell`,pl:`perl`,ex:`elixir`,exs:`elixir`,hs:`haskell`,clj:`clojure`,cljs:`clojure`,gql:`graphql`,terraform:`hcl`,tf:`hcl`,plaintext:`text`,plain:`text`,txt:`text`},em=/* @__PURE__ */ new Map,tm=(e,t)=>new Set((e??``).split(` `).filter(Boolean).map(e=>t?e.toLowerCase():e)),nm=e=>{let t=Qp[e],{caseInsensitive:n=!1}=t;return{name:e,scanner:t.scanner??`generic`,lineComments:t.lineComments??[],blockComments:t.blockComments??[],strings:t.strings??[],multilineStrings:t.multilineStrings??[],tripleStrings:t.tripleStrings??!1,stringPrefix:t.stringPrefix??null,keywords:tm(t.keywords,n),literals:tm(t.literals,n),types:tm(t.types,n),builtins:tm(t.builtins,n),caseInsensitive:n,capitalTypes:t.capitalTypes??!1,decorators:t.decorators??!1,regex:t.regex??!1,macros:t.macros??!1,directive:t.directive??null,variables:t.variables??null,scss:t.scss??!1,flags:t.flags??!1,keyValue:t.keyValue??null,stringKeys:t.stringKeys??!1,identifier:t.identifier??/^[\p{L}_$][\p{L}\p{N}_$]*/u,extraTokens:t.extraTokens??[]}},rm=e=>{let t=String(e).trim().toLowerCase();return Object.hasOwn(Qp,t)?t:Object.hasOwn($p,t)?$p[t]:null},im=e=>(em.has(e)||em.set(e,nm(e)),em.get(e)),am=()=>Object.keys(Qp),om=(e,t)=>{if(t==null)return`text`;let n=rm(t);return n===null?(h.warn(`${e}: unknown language '${t}' - showing plain text. Known languages are ${am().join(`, `)}`),`text`):n},sm=[[`keyword`,`purple`],[`string`,`green`],[`number`,`orange`],[`literal`,`orange`],[`function`,`blue`],[`type`,`teal`],[`property`,`indigo`],[`variable`,`pink`],[`attribute`,`cyan`],[`tag`,`purple`],[`title`,`blue`]],cm=(e,t=`72%`)=>`color-mix(in oklab, ${U(`color-${e}`)} ${t}, ${U(`color-text`)})`,lm=(e,t)=>`color-mix(in oklab, ${U(`color-${e}`)} ${t}, transparent)`,um=()=>sm.map(([e,t])=>`  .token-${e} { color: ${cm(t)} }`).join(`
`),dm=()=>`
${um()}

  .token-comment {
    color: ${U(`color-secondary`)};
    font-style: italic;
  }

  .token-punctuation {
    color: ${U(`color-secondary`)};
  }

  .token-title, .token-emphasis {
    font-weight: ${U(`font-weight-bold`)};
  }

  .token-inserted {
    color: ${cm(`green`)};
    background-color: ${lm(`green`,`12%`)};
  }

  .token-deleted {
    color: ${cm(`red`)};
    background-color: ${lm(`red`,`12%`)};
  }

  @media (forced-colors: active) {
    [class^='token-'] { color: CanvasText }
    .token-comment { color: GrayText }
  }
`,fm=(e,t)=>e.map(({type:e,text:n})=>e===null?n:t(`token-${e}`,n)),pm=/^(?:\d{4}-\d{2}-\d{2}(?:[Tt ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?)?|0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?[a-zA-Z%]*)/,mm=/^(?:=>|->|<-|::|===|!==|==|!=|<=|>=|&&|\|\||\?\?|\?\.|\+\+|--|\*\*|<<|>>>|>>|\+=|-=|\*=|\/=|%=|&=|\|=|\^=|\|>|[-+*/%=<>!&|^~?:])/,hm=/^[()[\]{},;.]/,gm=/^[ \t\r\f\v]+/,_m=/^@[\p{L}_][\p{L}\p{N}_.]*/u,vm=/^--?[\p{L}][\p{L}\p{N}_-]*/u,ym=/^#\s*[a-z]+/,bm=/^\/(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n[])+\/[a-z]*/,xm=/[\p{L}\p{N}_$]$/u,Sm=/^\p{Lu}/u,Cm=[`"""`,`'''`],wm=/* @__PURE__ */ new Set([`-`]),Tm=/* @__PURE__ */ new Set([`{`,`,`]),Em=/* @__PURE__ */ new Set([`)`,`]`]),Dm=()=>{let e=[[]],t=null,n=!1,r=(t,n)=>{if(n===``)return;let r=e.at(-1),i=r.at(-1);t===null&&i!==void 0&&i.type===null?i.text+=n:r.push({type:t,text:n})};return{emit:(i,a,o=!0)=>{a!==``&&(a.split(`
`).forEach((t,a)=>{a>0&&(e.push([]),n=!1),r(o?i:null,t)}),!(gm.test(a)&&a.trim()===``)&&a!==`
`&&(t={type:i,text:a},(!wm.has(a)||n)&&(n=!0)))},lines:e,lastToken:()=>t,atKeyPosition:()=>!n||t!==null&&Tm.has(t.text)}},Om=(e,t)=>{let n=t;for(;n<e.length&&(e[n]===` `||e[n]===`	`);)n++;return n},km=(e,t,n)=>{let r=e.indexOf(n,t);return r===-1?e.length:r+n.length},Am=(e,t)=>{let n=e.indexOf(`
`,t);return n===-1?e.length:n},jm=(e,t,n,r)=>{let i=t+n.length;for(;i<e.length;){let t=e[i];if(t===`\\`)i+=2;else{if(e.startsWith(n,i))return i+n.length;if(t===`
`&&!r)return i;i++}}return e.length},Mm=e=>e===null||e.type===`keyword`||e.type===`operator`||e.type===`punctuation`&&!Em.has(e.text),Nm=(e,t,n)=>{let r=Om(e,t);if(e[r]!==n)return!1;let i=e[r+1];return i!==n&&(n!==`=`||i!==`>`)&&i!==`:`},Pm=(e,t,n,r,i)=>{let a=r.caseInsensitive?t.toLowerCase():t;return r.keywords.has(a)?`keyword`:r.literals.has(a)?`literal`:r.types.has(a)?`type`:r.builtins.has(a)||e[n]===`(`?`function`:r.keyValue&&i.atKeyPosition()&&Nm(e,n,r.keyValue)?`property`:r.capitalTypes&&Sm.test(t)?`type`:null},Fm=(e,t,n,r)=>{let i=t+(n.stringPrefix?.exec(e.slice(t))?.[0]??``).length,a=-1;if(n.tripleStrings){let t=Cm.find(t=>e.startsWith(t,i));t&&(a=jm(e,i,t,!0))}if(a===-1){let r=n.strings.find(t=>e[i]===t);if(r===void 0)return t;a=jm(e,i,r,n.multilineStrings.includes(r))}let o=e.slice(t,a);return n.stringKeys&&Nm(e,a,`:`)?r.emit(`property`,o):n.variables&&o.startsWith(`"`)?Im(o,n,r):r.emit(`string`,o),a},Im=(e,t,n)=>{let r=0,i=0;for(;r<e.length;){if(e[r]===`\\`){r+=2;continue}let a=e[r]===`$`?t.variables.exec(e.slice(r))?.[0]:void 0;a===void 0?r++:(n.emit(`string`,e.slice(i,r)),n.emit(`variable`,a),r+=a.length,i=r)}n.emit(`string`,e.slice(i))},Lm=(e,t,n)=>{let{emit:r}=n,i=0;for(;i<e.length;){let a=e.slice(i),o=e[i];if(o===`
`){r(null,`
`),i++;continue}let s=gm.exec(a)?.[0];if(s){r(null,s),i+=s.length;continue}let c=t.extraTokens.find(([e])=>e.test(a));if(c){let[e,t]=c,n=e.exec(a)[0];r(t,n),i+=n.length;continue}let l=t.variables?.exec(a)?.[0];if(l){r(`variable`,l),i+=l.length;continue}let u=t.blockComments.find(([e])=>a.startsWith(e));if(u){let t=km(e,i+u[0].length,u[1]);r(`comment`,e.slice(i,t)),i=t;continue}if(t.lineComments.some(e=>a.startsWith(e))){let t=Am(e,i);r(`comment`,e.slice(i,t)),i=t;continue}let d=Fm(e,i,t,n);if(d!==i){i=d;continue}if(t.regex&&o===`/`&&Mm(n.lastToken())){let e=bm.exec(a)?.[0];if(e){r(`string`,e),i+=e.length;continue}}if(t.directive&&o===t.directive){let e=ym.exec(a)?.[0];if(e){r(`keyword`,e),i+=e.length;continue}}if(t.decorators&&o===`@`){let e=_m.exec(a)?.[0];if(e){r(`attribute`,e),i+=e.length;continue}}if(t.flags&&o===`-`&&(i===0||/\s/.test(e[i-1]))){let e=vm.exec(a)?.[0];if(e){r(`attribute`,e),i+=e.length;continue}}let f=pm.exec(a)?.[0];if(f&&(i===0||!xm.test(e[i-1]))){r(`number`,f),i+=f.length;continue}let p=t.identifier.exec(a)?.[0];if(p){let a=i+p.length,o=Pm(e,p,a,t,n);t.macros&&e[a]===`!`&&/[([{]/.test(e[a+1]??``)&&(o=`function`,a++),r(o,e.slice(i,a)),i=a;continue}let m=mm.exec(a)?.[0];if(m){r(`operator`,m,!1),i+=m.length;continue}let h=hm.exec(a)?.[0];h?(r(`punctuation`,h,!1),i+=h.length):(r(null,o),i++)}},Rm=/^[A-Za-z][\w:.-]*/,zm=/^[^\s"'=<>/]+/,Bm=/^[^\s>]+/,Vm={script:`javascript`,style:`css`},Hm=(e,t,n)=>{let{emit:r}=t,i=0;for(;i<e.length;){let a=e.slice(i);if(a.startsWith(`<!--`)){let t=km(e,i+4,`-->`);r(`comment`,e.slice(i,t)),i=t;continue}if(a.startsWith(`<!`)||a.startsWith(`<?`)){let t=km(e,i+2,`>`);r(`keyword`,e.slice(i,t)),i=t;continue}if(a[0]===`<`&&Rm.test(a.slice(a[1]===`/`?2:1))){let o=a[1]===`/`,s=o?`</`:`<`;r(`punctuation`,s,!1),i+=s.length;let c=Rm.exec(e.slice(i))[0];r(`tag`,c),i+=c.length,i=Um(e,i,t);let l=Vm[c.toLowerCase()];if(!o&&l){let t=RegExp(`</${c}\\s*>`,`i`).exec(e.slice(i)),r=t?i+t.index:e.length;n(e.slice(i,r),l),i=r}continue}let o=e.indexOf(`<`,i+1),s=o===-1?e.length:o;r(null,e.slice(i,s)),i=s}},Um=(e,t,n)=>{let{emit:r}=n,i=t,a=!1;for(;i<e.length;){let t=e.slice(i),n=/^\s+/.exec(t)?.[0];if(n){r(null,n),i+=n.length;continue}if(t.startsWith(`/>`)||t.startsWith(`>`)){let e=t.startsWith(`/>`)?`/>`:`>`;return r(`punctuation`,e,!1),i+e.length}if(t[0]===`=`){r(`operator`,`=`,!1),a=!0,i++;continue}if(a){a=!1;let n=t[0]===`"`||t[0]===`'`?t[0]:null,o=n?km(e,i+1,n):i+(Bm.exec(t)?.[0].length??1);r(`string`,e.slice(i,o)),i=o;continue}let o=zm.exec(t)?.[0];o?(r(`attribute`,o),i+=o.length):(r(null,t[0]),i++)}return i},Wm=/^(--[\w-]+|-?[a-zA-Z_][\w-]*)(\s*):/,Gm=/^#[\da-fA-F]{3,8}\b/,Km=/^-?[a-zA-Z_][\w-]*/,qm=/^[.#%][\w-]+/,Jm=/^::?[\w-]+/,Ym=/^\[[^\]\n]*\]/,Xm=(e,t)=>{let n=t,r=0;for(;n<e.length;){let t=e[n];if(t===`"`||t===`'`)n=jm(e,n,t,!1);else if(e.startsWith(`/*`,n))n=km(e,n+2,`*/`);else{if(t===`(`)r++;else if(t===`)`)r=Math.max(0,r-1);else if(r===0&&(t===`;`||t===`{`||t===`}`))return n;n++}}return e.length},Zm=(e,t,n)=>{let{emit:r}=n,i=0;for(;i<e.length;){let n=e.slice(i),a=/^\s+/.exec(n)?.[0];if(a){r(null,a),i+=a.length;continue}if(n.startsWith(`/*`)){let t=km(e,i+2,`*/`);r(`comment`,e.slice(i,t)),i=t;continue}if(t.scss&&n.startsWith(`//`)){let t=Am(e,i);r(`comment`,e.slice(i,t)),i=t;continue}let o=n[0];if(o===`"`||o===`'`){let t=jm(e,i,o,!1);r(`string`,e.slice(i,t)),i=t;continue}let s=(e,t)=>{let a=e.exec(n)?.[0];return a?(r(t,a),i+=a.length,!0):!1};if(s(Gm,`number`)||s(/^!important\b/,`keyword`)||s(/^--[\w-]+/,`variable`)||t.scss&&s(/^[$@][\w-]+/,`variable`)||s(pm,`number`))continue;if(n.startsWith(`url(`)){let t=km(e,i+4,`)`);r(`function`,`url`),r(null,`(`),r(`string`,e.slice(i+4,t-1)),r(null,`)`),i=t;continue}let c=Km.exec(n)?.[0];c?(r(e[i+c.length]===`(`?`function`:null,c),i+=c.length):(r(null,o),i++)}},Qm=(e,t,n)=>{let{emit:r}=n,i=0;for(;i<e.length;){let a=e.slice(i),o=/^\s+/.exec(a)?.[0];if(o){r(null,o),i+=o.length;continue}if(a.startsWith(`/*`)){let t=km(e,i+2,`*/`);r(`comment`,e.slice(i,t)),i=t;continue}if(a[0]===`@`){let o=/^@[\w-]+/.exec(a)[0];r(`keyword`,o),Zm(e.slice(i+o.length),t,n);return}let s=(e,t)=>{let n=e.exec(a)?.[0];return n?(r(t,n),i+=n.length,!0):!1};s(qm,`type`)||s(Jm,`attribute`)||s(Ym,`attribute`)||t.scss&&s(/^[$][\w-]+/,`variable`)||s(Km,`tag`)||s(pm,`number`)||(r(null,a[0]),i++)}},$m=(e,t,n)=>{let{emit:r}=n,i=/^\s*/.exec(e)[0];r(null,i);let a=e.slice(i.length);if(a[0]===`@`){Qm(a,t,n);return}let o=Wm.exec(a);if(!o){Zm(a,t,n);return}let[s,c,l]=o;r(c.startsWith(`--`)?`variable`:`property`,c),r(null,l),r(`punctuation`,`:`,!1),Zm(a.slice(s.length),t,n)},eh=(e,t,n)=>{let{emit:r}=n,i=0;for(;i<e.length;){let a=e.slice(i),o=/^\s+/.exec(a)?.[0];if(o){r(null,o),i+=o.length;continue}if(a.startsWith(`/*`)){let t=km(e,i+2,`*/`);r(`comment`,e.slice(i,t)),i=t;continue}if(t.scss&&a.startsWith(`//`)){let t=Am(e,i);r(`comment`,e.slice(i,t)),i=t;continue}if(a[0]===`}`||a[0]===`;`){r(`punctuation`,a[0],!1),i++;continue}let s=Xm(e,i),c=e.slice(i,s);e[s]===`{`?Qm(c,t,n):$m(c,t,n),i=s,e[s]===`{`&&(r(`punctuation`,`{`,!1),i++)}},th=/^(\s*)(`{3,}|~{3,})(.*)$/,nh=/^#{1,6}(\s|$)/,rh=/^\s*([-*_])(\s*\1){2,}\s*$/,ih=/^(\s*)([-*+]|\d+[.)])(\s+)/,ah=/^(\s*>\s?)/,oh=[[/^`+[^`\n]*`+/,`string`],[/^(?:\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|\b_[^_\n]+_\b)/,`emphasis`],[/^<https?:[^>\n]+>|^https?:\/\/\S+/,`string`],[/^<\/?[A-Za-z][^>\n]*>/,`tag`]],sh=/^(!?\[)([^\]\n]*)(\]\()([^)\n]*)(\))/,ch=(e,t)=>{let{emit:n}=t,r=0;for(;r<e.length;){let t=e.slice(r),i=sh.exec(t);if(i){let[,e,t,a,o,s]=i;n(`punctuation`,e),n(`attribute`,t),n(`punctuation`,a),n(`string`,o),n(`punctuation`,s),r+=i[0].length;continue}let a=oh.find(([e])=>e.test(t));if(a){let e=a[0].exec(t)[0];n(a[1],e),r+=e.length;continue}let o=/^[^`*_<![h]+|^./.exec(t)[0];n(null,o),r+=o.length}},lh=(e,t,n)=>{let{emit:r}=t,i=e.split(`
`),a=0;for(;a<i.length;){a>0&&r(null,`
`);let e=i[a],o=th.exec(e);if(o){let[,e,t,s]=o;r(null,e),r(`punctuation`,t),r(`attribute`,s);let c=e=>{let n=th.exec(e);return n!==null&&n[2][0]===t[0]&&n[2].length>=t.length&&n[3].trim()===``},l=a+1;for(;l<i.length&&!c(i[l]);)l++;l>a+1&&(r(null,`
`),n(i.slice(a+1,l).join(`
`),s.trim().split(/\s+/)[0])),l<i.length&&(r(null,`
`),r(`punctuation`,i[l])),a=l+1}else{if(nh.test(e)||rh.test(e))r(nh.test(e)?`title`:`punctuation`,e);else{let n=ah.exec(e),i=ih.exec(e),a=n?.[0]??i?.[0]??``;a!==``&&r(`punctuation`,a),ch(e.slice(a.length),t)}a++}}},uh=/^(?:\+\+\+ |--- |diff |index |new file|deleted file|similarity|rename |old mode|new mode)/,dh=/^@@[^@\n]*@@/,fh=(e,t)=>{let{emit:n}=t;e.split(`
`).forEach((e,t)=>{if(t>0&&n(null,`
`),uh.test(e))n(`comment`,e);else if(dh.test(e)){let t=dh.exec(e)[0];n(`title`,t),n(null,e.slice(t.length))}else e[0]===`+`?n(`inserted`,e):e[0]===`-`?n(`deleted`,e):n(null,e)})},ph=(e,t,n)=>{let r=im(t),i=(e,t)=>{let r=t?rm(t):null;ph(e,r??`text`,n)};r.scanner===`html`?Hm(e,n,i):r.scanner===`css`?eh(e,r,n):r.scanner===`markdown`?lh(e,n,i):r.scanner===`diff`?fh(e,n):r.scanner===`text`?n.emit(null,e):Lm(e,r,n)},mh=(e,t)=>{let n=Dm();return ph(e,t,n),n.lines},hh=`imp.code.copy`,gh=`imp.code.copied`,_h=`imp.code.line`,vh={[hh]:`Copy code`,[gh]:`Copied`,[_h]:`Line {number}`},yh=()=>`calc(${U(`space-3`)} + 2.5rem)`,bh=()=>`calc(3px + ${U(`space-3`)} * 2 + var(--code-digits, 2) * 1ch + ${U(`space-2`)})`,xh=()=>`
  .code,
  textarea {
    box-sizing: border-box;
    margin: 0;
    padding-block: round(${U(`space-3`)}, 4px);
    border: 0;
    font-family: ${U(`font-family-mono`)};
    font-size: ${U(`font-size-sm`)};
    font-weight: ${U(`font-weight-normal`)};
    line-height: round(calc(1em * ${U(`line-height-normal`)}), 4px);
    letter-spacing: normal;
    tab-size: 2;
    white-space: pre;
    overflow-wrap: normal;
  }

  textarea {
    padding-inline-start: ${U(`space-3`)};
    padding-inline-end: ${yh()};
  }

  .lines {
    display: block;
    min-inline-size: max-content;
    font: inherit;
    counter-reset: line;
  }

  .line {
    display: inline-block;
    box-sizing: border-box;
    inline-size: 100%;
    min-block-size: 1lh;
    vertical-align: top;
    padding-inline-start: ${U(`space-3`)};
    padding-inline-end: ${yh()};
    counter-increment: line;
  }

  .numbered .line {
    padding-inline-start: 0;
  }

  .numbered textarea {
    padding-inline-start: ${bh()};
  }

  .number {
    position: sticky;
    inset-inline-start: 0;
    z-index: 1;
    display: inline-block;
    box-sizing: content-box;
    min-inline-size: calc(var(--code-digits, 2) * 1ch);
    padding-inline: ${U(`space-3`)};
    margin-inline-end: ${U(`space-2`)};
    border-inline-start: 3px solid transparent;
    text-align: end;
    color: ${U(`color-secondary`)};
    background-color: var(--code-surface, ${U(`color-surface`)});
    text-decoration: none;
    user-select: none;
  }

  .number::before {
    content: counter(line);
  }

  a.number:hover {
    color: ${U(`color-text`)};
  }

  .number:focus-visible {${G()}
    outline-offset: -${U(`focus-ring-width`)};
  }

  .toolbar {
    position: absolute;
    inset-block-start: ${U(`space-2`)};
    inset-inline-end: ${U(`space-2`)};
    z-index: 2;
    user-select: none;
  }

  .status {${Gs}}

${dm()}

  @media (forced-colors: active) {
    .number { color: GrayText }
    a.number { color: LinkText }
  }
`,Sh=()=>V({class:`number`}),Ch=({language:e,scope:t=null,createNumber:n=null})=>{let r=ts({class:`lines`}),i=t??r;return{listing:r,render:t=>{let a=mh(t,e);i.style.setProperty(`--code-digits`,String(String(a.length).length));let o=[];a.forEach((e,t)=>{let r=V({class:`line`});n!==null&&r.append(n(t+1)),r.append(...fm(e,(e,t)=>V({class:e},t))),o.push(r),t<a.length-1&&o.push(`
`)}),r.replaceChildren(...o)}}},wh=(e,t,n)=>{let r=k(`imp.code.copied`,!1),i=k(`imp.code.label`,F(hh)),a=V({class:`status`,role:`status`,"aria-live":`polite`}),o=()=>i.set(F(r.get()?gh:hh));N.watch(e,o),r.watch(e,o);let s=0,c=async()=>{try{await navigator.clipboard.writeText(n())}catch(e){h.warn(`${t}: the clipboard refused the text`,e);return}r.set(!0),a.textContent=F(gh),clearTimeout(s),s=setTimeout(()=>{r.set(!1),a.textContent=``},1500)};Ko(e,()=>clearTimeout(s));let l=xf({text:i},J({size:`sm`,variant:`ghost`,label:i,events:{click:c}},r.view(e=>K(e?md:xd))));return B({class:`toolbar`},l,a)},Th=`codeBlock`,Eh=[`code`,`language`,`lineNumbers`,`id`,`label`],Dh=/^L(\d+)(?:-L(\d+))?$/,Oh=/^(.+?)-L(\d+)(?:-L(\d+))?$/,kh=()=>`color-mix(in oklab, ${U(`color-primary`)} 12%, ${U(`color-surface-sunken`)})`,Ah=()=>`
  :host {
    display: block;
    min-inline-size: 0;
  }

  .block {
    --code-surface: ${U(`color-surface-sunken`)};
    position: relative;
    margin: 0;
    border: ${U(`border-width`)} solid ${U(`color-border`)};
    border-radius: ${U(`radius-container`)};
    background-color: ${U(`color-surface-sunken`)};
    color: ${U(`color-text`)};
    ${W()}
  }

  .code {
    overflow: auto;
    border-radius: inherit;
  }

  .line.selected {
    background-color: ${lm(`primary`,`12%`)};
  }

  .line.selected .number {
    color: ${U(`color-primary`)};
    background-color: ${kh()};
    border-inline-start-color: ${U(`color-primary`)};
  }

${xh()}

  @media (forced-colors: active) {
    .block, .line.selected { border-color: CanvasText }
    .line.selected { outline: 2px solid Highlight; outline-offset: -2px }
  }
`,jh=(e,t,n)=>{let r=e===void 0?``:`${e}-`;return n===void 0||n===t?`${r}L${t}`:`${r}L${t}-L${n}`},Mh=e=>{let t=Dh.exec(e);if(t!==null)return{id:void 0,lines:t.slice(1)};let n=Oh.exec(e);return n===null?null:{id:n[1],lines:n.slice(2)}},Nh=()=>{try{return decodeURIComponent(globalThis.location.hash.slice(1))}catch{return null}},Ph=e=>{let t=Nh(),n=t===null?null:Mh(t);if(n===null||n.id!==e)return null;let r=Number(n.lines[0]),i=n.lines[1]===void 0?r:Number(n.lines[1]);return{start:Math.min(r,i),end:Math.max(r,i)}},Fh=/* @__PURE__ */ new Set,Ih=e=>{let t=new URL(globalThis.location.href);t.hash=e,globalThis.history.replaceState(globalThis.history.state,``,t.href);for(let e of Fh)e()},Lh=(e,t)=>{t.length>0&&h.warn(`${Th}: takes no children - pass the code as the 'code' prop`);let{code:n}=e;return n==null?``:typeof n==`string`||D(n)?n:(h.warn(`${Th}: 'code' must be a string, or a state that holds one - showing none`),``)},Rh=e=>{let t=typeof e==`string`?e:String(e??``),n=+!!t.startsWith(`
`),r=t.endsWith(`
`)?t.length-1:t.length;return t.slice(n,Math.max(n,r))},zh={styles:Ah,props:Eh,setup:(e,t,n)=>{let r=om(Th,t.language),i=t.lineNumbers===!0,a=typeof t.id==`string`&&t.id!==``?t.id:void 0,o=``,s=null,c=(e,t)=>{let n=Ph(a),r=t.shiftKey&&(s??n?.start)!==void 0,i=r?s??n.start:e;r||(s=e),Ih(jh(a,Math.min(i,e),Math.max(i,e)))},l=Ch({language:r,createNumber:i?e=>{let t=Zo({class:`number`,href:`#${jh(a,e)}`,"data-line":String(e),"aria-label":F(_h,{number:e})});return t.addEventListener(`click`,t=>{t.button!==0||t.metaKey||t.ctrlKey||t.altKey||(t.preventDefault(),c(e,t))}),t}:null});i&&l.listing.classList.add(`numbered`);let u=is({class:`block`,"aria-label":typeof t.label==`string`?t.label:null},_s({class:`code`},l.listing)),d=e=>l.listing.children[e-1]??null,f=()=>{let e=Ph(a);for(let[t,n]of[...l.listing.children].entries()){let r=t+1,i=e!==null&&r>=e.start&&r<=e.end;n.classList.toggle(`selected`,i);let a=n.firstElementChild;a!==null&&(i?a.setAttribute(`aria-current`,`true`):a.removeAttribute(`aria-current`))}return e};L(e,Lh(t,n),e=>{o=Rh(e),l.render(o),f()}),N.watch(e,()=>{for(let e of l.listing.querySelectorAll(`.number`))e.setAttribute(`aria-label`,F(_h,{number:e.dataset.line}))});let p=()=>{let e=f();e!==null&&d(e.start)?.scrollIntoView({block:`center`})};return Fh.add(f),globalThis.addEventListener(`hashchange`,p),Ko(e,()=>{Fh.delete(f),globalThis.removeEventListener(`hashchange`,p)}),e.revealSelection=p,u.append(wh(e,Th,()=>o)),u},onMount:e=>e.revealSelection()},Bh=(...e)=>z(Th,()=>zh,()=>P(vh))(...e),Vh=`descriptionList`,Hh=[`items`,`layout`,`columns`],Uh=[`horizontal`,`vertical`],Wh=[1,2,3],Gh=`minmax(0, 1fr)`,Kh=e=>`repeat(${e}, fit-content(40%) ${Gh})`,qh=e=>`repeat(${e}, ${Gh})`,Jh=()=>Wh.map(e=>`
  .horizontal.columns-${e} { grid-template-columns: ${Kh(e)} }
  .vertical.columns-${e} { grid-template-columns: ${qh(e)} }`).join(`
`),Yh=()=>`
  :host {
    display: block;
    inline-size: 100%;
  }

  .box {
    container-type: inline-size;
  }

  .list {
    display: grid;
    column-gap: ${U(`space-6`)};
    row-gap: ${U(`space-3`)};
    margin: 0;
    ${W()}
    font-size: ${U(`font-size-md`)};
    line-height: ${U(`line-height-normal`)};
  }

  .pair {
    min-inline-size: 0;
  }

  .horizontal .pair {
    display: grid;
    grid-template-columns: subgrid;
    grid-column: span 2;
    column-gap: ${U(`space-3`)};
  }

  .term {
    color: ${U(`color-secondary`)};
    font-size: ${U(`font-size-sm`)};
    font-weight: ${U(`font-weight-bold`)};
    overflow-wrap: anywhere;
  }

  .horizontal .term {
    line-height: calc(${U(`font-size-md`)} * ${U(`line-height-normal`)});
  }

  .details {
    margin: 0;
    min-inline-size: 0;
    color: ${U(`color-text`)};
    overflow-wrap: anywhere;
  }
${Jh()}

  @container (max-inline-size: 60rem) {
    .horizontal.columns-3 { grid-template-columns: ${Kh(2)} }
    .vertical.columns-3 { grid-template-columns: ${qh(2)} }
  }

  @container (max-inline-size: 40rem) {
    .horizontal.list { grid-template-columns: ${Kh(1)} }
    .vertical.list { grid-template-columns: ${qh(1)} }
  }

  @container (max-inline-size: 24rem) {
    .horizontal.list { grid-template-columns: ${qh(1)} }

    .horizontal .pair {
      display: block;
      grid-column: auto;
    }

    .horizontal .term {
      line-height: inherit;
    }
  }
`,Xh=e=>Yf(Vh,e,{shape:`{ term, details }`,key:`term`,item:({term:e,details:t})=>({term:e,details:t})}),Zh=(e,t)=>Array.isArray(t)?t.map(t=>qo(e,t)):[qo(e,t)],Qh={styles:Yh,props:Hh,setup:(e,t,n)=>{n.length>0&&h.warn(`${Vh}: takes no content - pass every pair as 'items'`);let r=I(Vh,`layout`,t.layout,Uh,`horizontal`),i=I(Vh,`columns`,t.columns,Wh,1),a=Xh(t.items??[]).map(({term:t,details:n})=>B({class:`pair`},O(`dt`,{class:`term`},R(e,t)),O(`dd`,{class:`details`},...Zh(e,n))));return B({class:`box`},O(`dl`,{class:[`list`,r,`columns-${i}`]},...a))}},$h=(...e)=>z(Vh,()=>Qh)(...e),eg=/^```(.*)$/,tg=/^(#{1,6}) (.*)$/,ng=/^> ?(.*)$/,rg=/^(?:-{3,}|\*{3,}|_{3,})$/,ig=/^[-*+](?: .*|$)/,ag=/^(\d{1,9})[.)](?: .*|$)/,og=/^( *)(.*)$/,sg=/^<(p|h[1-6]|div) align="(left|center|right)">(.*)$/,cg=/<\/(?:p|h[1-6]|div)>$/,lg=/(?:\\| {2,})$/,ug=/[!-/:-@[-`{-~]/,dg=[`b`,`strong`,`i`,`em`,`s`,`del`,`strike`,`code`,`a`,`img`,`br`],fg=/\w/,pg=e=>e.trim()===``,mg=e=>eg.test(e)||tg.test(e)||ng.test(e)||rg.test(e)||ig.test(e)||ag.test(e)||sg.test(e),hg=(e,t,n)=>{let r=t;for(;r<e.length;)if(e[r]===`\\`)r+=2;else{if(e.startsWith(n,r)&&r>t)return r;r+=1}return-1},gg=(e,t,n)=>{let r=t;for(;r<e.length;){if(e.startsWith(n,r)&&e[r+n.length]!=="`")return r;r+=1}return-1},_g=(e,t)=>{let n=0,r=t;for(;r<e.length;){let t=e[r];if(t===`\\`)r+=1;else if(t===`(`)n+=1;else if(t===`)`){if(n===0)return r;--n}r+=1}return-1},vg=(e,t)=>{let n=hg(e,t,`]`);if(n===-1||e[n+1]!==`(`)return null;let r=_g(e,n+2);return r===-1?null:{label:e.slice(t,n),url:e.slice(n+2,r),end:r+1}},yg=e=>e.replace(/\\([!-/:-@[-`{-~])/g,`$1`),bg=(e,t)=>{if(t===``)return;let n=e.at(-1);n instanceof Text?n.data+=t:e.push(document.createTextNode(t))},xg=e=>{let t=[],n=``,r=0,i=()=>{bg(t,yg(n)),n=``},a=(n,a,o)=>{if(/\s/.test(e[o]??` `)||a.startsWith(`_`)&&fg.test(e[o-a.length-1]??` `))return!1;let s=hg(e,o,a);return s===-1||s===o?!1:(i(),t.push(O(n,...xg(e.slice(o,s)))),r=s+a.length,!0)};for(;r<e.length;){let o=e[r];if(o===`\\`&&r+1<e.length&&ug.test(e[r+1]))n+=e.slice(r,r+2),r+=2;else{if(o==="`"){let n=/^`+/.exec(e.slice(r))[0],a=gg(e,r+n.length,n);if(a!==-1){i(),t.push(O(`code`,e.slice(r+n.length,a).trim())),r=a+n.length;continue}}if(!(e.startsWith(`**`,r)&&a(`strong`,`**`,r+2))&&!(e.startsWith(`__`,r)&&a(`strong`,`__`,r+2))&&!(e.startsWith(`~~`,r)&&a(`s`,`~~`,r+2))&&(o!==`*`&&o!==`_`||!a(`em`,o,r+1))){if(e.startsWith(`![`,r)){let n=vg(e,r+2);if(n){i(),jf(n.url)?t.push(O(`img`,{src:n.url,alt:yg(n.label)})):bg(t,yg(n.label)),r=n.end;continue}}if(o===`[`){let n=vg(e,r+1);if(n){i(),kf(n.url)?t.push(O(`a`,{href:n.url},...xg(n.label))):t.push(...xg(n.label)),r=n.end;continue}}n+=o,r+=1}}}return i(),t},Sg=e=>{let t=[];return e.forEach((n,r)=>{let i=lg.test(n),a=n.replace(lg,``);t.push(...xg(r===0?a:a.trimStart())),r!==e.length-1&&(i?t.push(O(`br`)):bg(t,` `))}),t},Cg=e=>{let t=[];for(let n of e.childNodes){if(n.nodeType===Node.TEXT_NODE){bg(t,n.data);continue}if(n.nodeType!==Node.ELEMENT_NODE)continue;let e=n.localName;if(!dg.includes(e))t.push(...Cg(n));else if(e===`br`)t.push(O(`br`));else if(e===`img`){let e=n.getAttribute(`src`);jf(e)&&t.push(O(`img`,{src:e,alt:n.getAttribute(`alt`)??``}))}else if(e===`a`){let e=n.getAttribute(`href`)??``;kf(e)?t.push(O(`a`,{href:e},...Cg(n))):t.push(...Cg(n))}else t.push(O(e,...Cg(n)))}return t},wg=(e,t,n)=>{let r=new DOMParser().parseFromString(`<body>${n}</body>`,`text/html`),i=O(e,...Cg(r.body));return i.style.textAlign=t,i},Tg=e=>{if(ig.test(e))return{ordered:!1,width:2,start:1};let t=ag.exec(e);return t?{ordered:!0,width:t[1].length+2,start:Number(t[1])}:null},Eg=(e,t)=>{let[,n,r]=og.exec(e);return n.length>=t?e.slice(t):r},Dg=e=>og.exec(e)[1].length,Og=(e,t,n)=>t>=e.length?!1:pg(e[t])?t+1<e.length&&!pg(e[t+1])&&Dg(e[t+1])>=n:Dg(e[t])>=n,kg=(e,t,n)=>{let r=[e[t].slice(n)],i=t+1;for(;Og(e,i,n);)r.push(Eg(e[i],n)),i+=1;return{own:r,next:i}},Ag=e=>{let t=O(`li`);return e.forEach((e,n)=>{n===0&&e.localName===`p`?t.append(...e.childNodes):t.append(e)}),t},jg=(e,t)=>{let n=Tg(e[t]),r=O(n.ordered?`ol`:`ul`);n.ordered&&n.start!==1&&r.setAttribute(`start`,String(n.start));let i=t;for(;i<e.length;){let t=Tg(e[i]);if(!t||t.ordered!==n.ordered)break;let{own:a,next:o}=kg(e,i,t.width);r.append(Ag(Ig(a))),i=o}return{list:r,next:i}},Mg=(e,t)=>{let n=eg.exec(e[t])[1].trim(),r=[],i=t+1;for(;i<e.length&&!eg.test(e[i]);)r.push(e[i]),i+=1;let a=O(`pre`,r.join(`
`));return n!==``&&(a.dataset.language=n),{block:a,next:Math.min(e.length,i+1)}},Ng=(e,t)=>{let n=[],r=t;for(;r<e.length&&ng.test(e[r]);)n.push(ng.exec(e[r])[1]),r+=1;return{block:O(`blockquote`,...Ig(n)),next:r}},Pg=(e,t)=>{let[,n,r,i]=sg.exec(e[t]),a=[i],o=t+1;for(;!cg.test(a.at(-1))&&o<e.length&&!pg(e[o]);)a.push(e[o]),o+=1;let s=a.join(`
`).replace(cg,``);return{block:wg(n,r,s),next:o}},Fg=(e,t)=>{let n=[e[t]],r=t+1;for(;r<e.length&&!pg(e[r])&&!mg(e[r]);)n.push(e[r]),r+=1;return{block:O(`p`,...Sg(n)),next:r}},Ig=e=>{let t=[],n=0;for(;n<e.length;){let r=e[n];if(pg(r)){n+=1;continue}if(eg.test(r)){let{block:r,next:i}=Mg(e,n);t.push(r),n=i;continue}let i=tg.exec(r);if(i){t.push(O(`h${i[1].length}`,...xg(i[2].trim()))),n+=1;continue}if(rg.test(r)){t.push(O(`hr`)),n+=1;continue}if(ng.test(r)){let{block:r,next:i}=Ng(e,n);t.push(r),n=i;continue}if(Tg(r)){let{list:r,next:i}=jg(e,n);t.push(r),n=i;continue}if(sg.test(r)){let{block:r,next:i}=Pg(e,n);t.push(r),n=i;continue}let{block:a,next:o}=Fg(e,n);t.push(a),n=o}return t},Lg=e=>Ig(String(e??``).split(/\r?\n/)),Rg=e=>`
  ${e} > :first-child { margin-block-start: 0 }
  ${e} > :last-child { margin-block-end: 0 }

  ${e} p,
  ${e} div,
  ${e} blockquote,
  ${e} pre,
  ${e} ul,
  ${e} ol,
  ${e} h1,
  ${e} h2,
  ${e} h3,
  ${e} h4,
  ${e} h5,
  ${e} h6 {
    margin-block: ${U(`space-2`)};
  }

  ${e} h1,
  ${e} h2,
  ${e} h3,
  ${e} h4,
  ${e} h5,
  ${e} h6 {
    color: ${U(`color-heading`)};
    font-weight: ${U(`font-weight-bold`)};
    line-height: ${U(`line-height-tight`)};
  }

  ${e} h1 { font-size: ${U(`font-size-2xl`)} }
  ${e} h2 { font-size: ${U(`font-size-xl`)} }
  ${e} h3 { font-size: ${U(`font-size-lg`)} }
  ${e} h4, ${e} h5, ${e} h6 { font-size: ${U(`font-size-md`)} }

  ${e} blockquote {
    margin-inline: 0;
    padding-inline-start: ${U(`space-3`)};
    border-inline-start: 3px solid ${U(`color-border`)};
    color: ${U(`color-secondary`)};
  }

  ${e} pre,
  ${e} code {
    font-family: ${U(`font-family-mono`)};
    background-color: ${U(`color-surface-sunken`)};
    border-radius: ${U(`radius-item`)};
  }

  ${e} pre {
    padding-block: ${U(`space-2`)};
    padding-inline: ${U(`space-3`)};
    font-size: ${U(`font-size-sm`)};
    white-space: pre;
    overflow: auto;
  }

  ${e} code {
    padding-inline: 0.25em;
    font-size: 0.9em;
  }

  ${e} ul,
  ${e} ol {
    padding-inline-start: ${U(`space-5`)};
  }

  ${e} a {
    color: ${U(`color-primary`)};
    text-decoration: underline;
  }

  ${e} img {
    max-inline-size: 100%;
    block-size: auto;
    border-radius: ${U(`radius-item`)};
    vertical-align: middle;
  }

  ${e} hr {
    margin-block: ${U(`space-3`)};
    border: 0;
    border-block-start: ${U(`border-width`)} solid ${U(`color-border`)};
  }
`,zg=`markdown`,Bg=[`text`],Vg=()=>`
  :host {
    display: block;
  }

  .prose {
    ${W()}
    color: ${U(`color-text`)};
    font-size: ${U(`font-size-md`)};
    line-height: ${U(`line-height-normal`)};
    overflow-wrap: anywhere;
  }

${Rg(`.prose`)}

  @media (forced-colors: active) {
    .prose blockquote { border-inline-start-color: CanvasText }
    .prose hr { border-block-start-color: CanvasText }
  }
`,Hg=(e,t)=>{t.length>0&&h.warn(`${zg}: takes no children - pass the markdown as the 'text' prop`);let{text:n}=e;return n==null?``:typeof n==`string`||D(n)?n:(h.warn(`${zg}: 'text' must be a string, or a state that holds one - showing none`),``)},Ug={styles:Vg,props:Bg,setup:(e,t,n)=>{let r=B({class:`prose`});return L(e,Hg(t,n),e=>{r.replaceChildren(...Lg(e??``))}),r}},Wg=(...e)=>z(zg,()=>Ug)(...e),Gg=[`color`,`size`,`dot`,`label`],Kg=`neutral`;let qg=null;const Jg=()=>qg??=[Kg,...mi()],Yg=e=>U(e===Kg?`color-secondary`:`color-${e}`),Xg=()=>Jg().map(e=>`  .color-${e} { --tag-color: ${Yg(e)} }`).join(`
`),Zg=()=>`
  .tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${U(`space-1`)};
    box-sizing: border-box;
    min-inline-size: var(--tag-size);
    block-size: var(--tag-size);
    padding-inline: var(--tag-padding);
    border: ${U(`border-width`)} solid color-mix(in oklab, var(--tag-color) 30%, transparent);
    border-radius: ${U(`radius-item`)};
    background-color: color-mix(in oklab, var(--tag-color) 14%, transparent);
    ${W()}
    color: color-mix(in oklab, var(--tag-color) 62%, ${U(`color-text`)});
    font-weight: ${U(`font-weight-bold`)};
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.01em;
    line-height: 1;
    white-space: nowrap;
    max-inline-size: 100%;
  }

  .text {
    min-inline-size: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dot {
    flex: none;
    inline-size: var(--tag-dot-size);
    block-size: var(--tag-dot-size);
    border-radius: 50%;
    background-color: var(--tag-color);
  }

  .bare {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
  }

  .bare .dot {
    inline-size: calc(var(--tag-dot-size) * 1.25);
    block-size: calc(var(--tag-dot-size) * 1.25);
  }

  .size-sm {
    --tag-size: 1.25rem;
    --tag-dot-size: 0.375rem;
    --tag-padding: ${U(`space-1`)};
    font-size: 0.75rem;
  }

  .size-md {
    --tag-size: 1.5rem;
    --tag-dot-size: 0.5rem;
    --tag-padding: ${U(`space-2`)};
    font-size: ${U(`font-size-sm`)};
  }

  .size-lg {
    --tag-size: 1.75rem;
    --tag-dot-size: 0.625rem;
    --tag-padding: ${U(`space-3`)};
    font-size: ${U(`font-size-md`)};
  }

${Xg()}

  @media (forced-colors: active) {
    .tag {
      border-color: CanvasText;
      color: CanvasText;
    }

    .dot {
      background-color: CanvasText;
    }
  }
`,Qg=(e,t,n)=>{let r=V({class:[`bare`,...n],role:`img`},V({class:`dot`}));return t===void 0?(h.warn(`tag: a dot with no text needs a 'label' - it is the accessible name`),r):(L(e,t,e=>r.setAttribute(`aria-label`,String(e))),r)},$g={styles:Zg,props:Gg,setup:(e,t,n)=>{let r=I(`tag`,`color`,t.color,Jg(),Kg),i=I(`tag`,`size`,t.size,Ys,`md`),a=[`color-${r}`,`size-${i}`],o=!!t.dot;return o&&n.length===0?Qg(e,t.label,a):(t.label!==void 0&&h.warn(`tag: 'label' names a dot with no text only - ignoring it`),V({class:[`tag`,...a]},o?V({class:`dot`,"aria-hidden":`true`}):null,V({class:`text`},...n)))}},Y=(...e)=>z(`tag`,()=>$g)(...e),e_=`data-closing`,t_=[`[open]`,`:popover-open`],n_={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]},r_={holds:0,restore:``},i_=()=>{r_.holds===0&&(r_.restore=document.documentElement.style.overflow,document.documentElement.style.overflow=`hidden`),r_.holds+=1},a_=()=>{--r_.holds,!(r_.holds>0)&&(document.documentElement.style.overflow=r_.restore)},o_=()=>{let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e},s_=e=>Promise.all(e.getAnimations().map(({finished:e})=>e.catch(()=>{}))),c_=async(e,t)=>{e.hasAttribute(e_)||(e.setAttribute(e_,``),await s_(e),e.hasAttribute(e_)&&(e.removeAttribute(e_),t()))},l_=(e,t=``)=>t_.map(n=>`${e}${n}${t}`).join(`,
    `),u_=e=>`
  ${e} {
    opacity: 1;
    translate: 0 0;
    transition:
      opacity ${U(`duration-medium`)} ease-out,
      translate ${U(`duration-medium`)} ease-out;
  }

  ${e}::backdrop {
    opacity: 1;
    transition: opacity ${U(`duration-medium`)} ease-out;
  }

  @starting-style {
    ${l_(e)} {
      opacity: 0;
      translate: var(--overlay-offset, 0 0);
    }

    ${l_(e,`::backdrop`)} { opacity: 0 }
  }

  ${e}[${e_}] {
    opacity: 0;
    translate: var(--overlay-offset, 0 0);
  }

  ${e}[${e_}]::backdrop { opacity: 0 }

  @media (prefers-reduced-motion: reduce) {
    ${e},
    ${e}::backdrop {
      transition: none;
    }
  }
`,d_=e=>`
  ${e}::backdrop {
    background-color: rgb(0 0 0 / 45%);
  }
`,f_=(e,t)=>{t!==void 0&&typeof t!=`function`&&h.warn(`${e}: 'beforeClose' must be a function like () => !dirty.get() - ignoring it`);let n=typeof t==`function`?t:null,r=!1;return t=>{n?r||(r=!0,Eo([n],`${e}: beforeClose`).then(e=>{r=!1,e&&t()})):t()}},p_=e=>e(),m_=(e,{signal:t,dismiss:n=p_,onClose:r=()=>{}}={})=>{let i=!1,a=!1,o=()=>{i&&(i=!1,a_())},s=()=>{e.removeAttribute(e_),!e.open&&(e.showModal(),!i&&(i=!0,i_()))},c=()=>{e.removeAttribute(e_),o(),r()},l=t=>e.open?c_(e,()=>{e.close(t),c()}):Promise.resolve(),u=()=>n(l);return e.addEventListener(`close`,c,{signal:t}),e.addEventListener(`keydown`,t=>{t.key!==`Escape`||t.isComposing||t.defaultPrevented||e.open&&(t.preventDefault(),u())},{signal:t}),e.addEventListener(`cancel`,e=>{e.cancelable&&(e.preventDefault(),u())},{signal:t}),e.addEventListener(`pointerdown`,t=>{a=t.target===e},{signal:t}),e.addEventListener(`click`,t=>{let n=a&&t.target===e;a=!1,n&&u()},{signal:t}),t?.addEventListener(`abort`,o),{open:s,close:l}},h_=(e,{signal:t}={})=>{let n=!1,r=null;return t?.addEventListener(`abort`,()=>{n=!1,r=null}),{open:()=>{e.removeAttribute(e_),!n&&(n=!0,r=o_(),e.showPopover(),e.focus({preventScroll:!0}))},close:()=>n?c_(e,()=>{n=!1,e.hidePopover(),r?.focus(),r=null}):Promise.resolve()}},g_=(e,t,{signal:n}={})=>{let r=0,i=0,a=0,o=0,s=!1,c=()=>{e.style.setProperty(`--drag-x`,`${r}px`),e.style.setProperty(`--drag-y`,`${i}px`)},l=()=>{c();let t=e.getBoundingClientRect(),n=document.documentElement,a=-Math.max(0,t.right-n.clientWidth);t.left+a<0&&(a=-t.left);let o=-Math.max(0,t.bottom-n.clientHeight);t.top+o<0&&(o=-t.top),(a!==0||o!==0)&&(r+=a,i+=o,c())},u=(e,t)=>{r=e,i=t,l()};t.addEventListener(`pointerdown`,e=>{e.button!==0||e.target.closest(`button`)||(s=!0,a=e.clientX-r,o=e.clientY-i,t.setPointerCapture(e.pointerId),e.preventDefault())},{signal:n}),t.addEventListener(`pointermove`,e=>{s&&u(e.clientX-a,e.clientY-o)},{signal:n});let d=e=>{s&&(s=!1,t.releasePointerCapture(e.pointerId))};return t.addEventListener(`pointerup`,d,{signal:n}),t.addEventListener(`pointercancel`,d,{signal:n}),t.addEventListener(`keydown`,e=>{let t=n_[e.key];t&&(e.preventDefault(),u(r+t[0]*16,i+t[1]*16))},{signal:n}),document.defaultView.addEventListener(`resize`,l,{signal:n}),{reset:()=>{r=0,i=0,c()}}},__=`notify`,v_=[`info`,`success`,`warning`,`error`],y_=[`id`,`kind`,`title`,`description`,`icon`,`image`,`link`,`actions`,`duration`,`ttl`],b_=Object.freeze({ttl:864e5,limit:100}),x_={ttl:b_.ttl,limit:b_.limit},S_=/* @__PURE__ */ new Map,C_=/* @__PURE__ */ new Map;let w_=null,T_=0;const E_=()=>w_??=k(`imp.notifications`,[]),D_=e=>e.ttl!==0,O_=e=>(S_.has(e)||S_.set(e,Promise.withResolvers()),S_.get(e).promise),k_=(e,t)=>{let n=S_.get(e);n&&(S_.delete(e),n.resolve(t))},A_=e=>{clearTimeout(C_.get(e)),C_.delete(e)},j_=e=>{A_(e),k_(e,null)},M_=e=>{E_().set(e.slice(0,x_.limit));for(let t of e.slice(x_.limit))j_(t.id)},N_=(e,t)=>M_(E_().get().map(n=>n.id===e?{...n,...t}:n)),P_=e=>E_().get().find(t=>t.id===e)??null,F_=(e,t,n)=>t==null?n:typeof t==`number`&&Number.isFinite(t)&&t>=0?t:(h.warn(`${__}: '${e}' must be a number of milliseconds - got '${t}'`),n),I_=(e,t)=>{if(t!=null){if(typeof t==`string`)return t;h.warn(`${__}: '${e}' must be a string - got ${typeof t}`)}},L_=e=>{if(e!=null){if(Array.isArray(e))return e;h.warn(`${__}: 'icon' must be an icon from 'imp/icons' - using the icon of the kind`)}},R_=e=>{if(e!=null){if(E(e)&&typeof e.href==`string`&&typeof e.label==`string`)return{href:e.href,label:e.label,external:!!e.external};h.warn(`${__}: 'link' must be { href, label, external? } - leaving the link out`)}},z_=({id:e,label:t,variant:n})=>n===void 0?{id:e,label:t}:{id:e,label:t,variant:n},B_=e=>{if(e!=null){if(!(Array.isArray(e)&&e.every(e=>E(e)&&typeof e.id==`string`&&typeof e.label==`string`)))h.warn(`${__}: 'actions' must be an array of { id, label, variant? } - leaving it out`);else return e.length>3&&h.warn(`${__}: takes up to 3 actions - keeping the first 3`),e.length===0?void 0:e.slice(0,3).map(z_)}},V_=e=>Object.fromEntries(Object.entries(e).filter(([,e])=>e!==void 0)),H_=(e,t)=>V_({id:t,kind:I(__,`kind`,e.kind,v_,`info`),title:e.title,description:I_(`description`,e.description),icon:L_(e.icon),image:I_(`image`,e.image),link:R_(e.link),actions:B_(e.actions),duration:F_(`duration`,e.duration,void 0),ttl:F_(`ttl`,e.ttl,x_.ttl),time:(/* @__PURE__ */ new Date()).toISOString(),read:!1,choice:null,popup:!0}),U_=e=>e,W_=(e,t)=>{A_(e),t>0&&C_.set(e,setTimeout(()=>q_(e),Math.min(t,2147483647)))},G_=(e,t)=>{let n=e.find(({id:e})=>e===t.id);return n?.popup?e.map(e=>e===n?t:e):[t,...e.filter(e=>e!==n)]},K_=e=>{let t=E(e)?e:{};if(typeof t.title!=`string`||t.title===``)return h.warn(`${__}: needs a 'title' - raising nothing`),Promise.resolve(null);for(let e of Object.keys(t))y_.includes(e)||h.warn(`${__}: unknown key '${e}' - leaving it out`);let n=t.id===void 0||t.id===null?`imp-${++T_}`:String(t.id),r=U_(H_(t,n)),i=O_(n);return M_(G_(E_().get(),r)),P_(n)&&W_(n,r.ttl),i},q_=e=>{P_(e)&&(M_(E_().get().filter(t=>t.id!==e)),j_(e))},J_=(e,{read:t=!1}={})=>{let n=P_(e);n&&n.popup&&(D_(n)?N_(e,t?{popup:!1,read:!0}:{popup:!1}):q_(e))},Y_=(e,t)=>{let n=P_(e);n&&n.choice===null&&(k_(e,t),D_(n)?N_(e,{choice:t,read:!0,popup:!1}):q_(e))},X_=({ttl:e,limit:t})=>{x_.ttl=e,x_.limit=t,M_(E_().get())},Z_=`imp.toast.dismiss`,Q_={[Z_]:`Dismiss`},$_={info:qd,success:gd,warning:df,error:_d},ev={info:`info`,success:`success`,warning:`warning`,error:`danger`},tv=()=>Object.entries(ev).map(([e,t])=>`  .kind-${e} { --row-color: ${U(`color-${t}`)} }`).join(`
`),nv=()=>`
  .row {
    display: flex;
    align-items: flex-start;
    gap: ${U(`space-3`)};
    box-sizing: border-box;
    min-inline-size: 0;
    padding: ${U(`space-3`)};
    border: ${U(`border-width`)} solid ${U(`color-border`)};
    border-inline-start: 0.25rem solid var(--row-color);
    border-radius: ${U(`radius-container`)};
    background-color: ${U(`color-surface`)};
    color: ${U(`color-text`)};
    ${W()}
  }

${tv()}

  .mark {
    display: flex;
    flex: none;
  }

  .image {
    display: block;
    inline-size: 2.5rem;
    block-size: 2.5rem;
    border-radius: ${U(`radius-item`)};
    object-fit: cover;
  }

  .words {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: ${U(`space-1`)};
    min-inline-size: 0;
  }

  .words p {
    margin: 0;
    overflow-wrap: anywhere;
  }

  .title {
    font-size: ${U(`font-size-md`)};
    font-weight: ${U(`font-weight-bold`)};
    line-height: ${U(`line-height-tight`)};
  }

  .unread .title::before {
    content: '';
    display: inline-block;
    inline-size: 0.5rem;
    block-size: 0.5rem;
    margin-inline-end: ${U(`space-2`)};
    border-radius: 50%;
    background-color: ${U(`color-primary`)};
  }

  .description,
  .choice {
    font-size: ${U(`font-size-sm`)};
    line-height: ${U(`line-height-normal`)};
  }

  .time,
  .choice {
    color: ${U(`color-secondary`)};
  }

  .time {
    font-size: ${U(`font-size-sm`)};
    line-height: ${U(`line-height-tight`)};
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: ${U(`space-2`)};
    margin-block-start: ${U(`space-1`)};
  }

  .dismiss {
    display: flex;
    flex: none;
  }

  @media (forced-colors: active) {
    .row { border-color: CanvasText }
    .unread .title::before { background-color: Highlight }
  }
`,rv=e=>V({class:`mark`},e.image===void 0?K({icon:e.icon??$_[e.kind],color:ev[e.kind]}):ss({class:`image`,src:e.image,alt:``})),iv=(e,t)=>B({class:`link`},Bf({href:e.link.href,external:e.link.external,size:`sm`,events:{click:()=>{J_(e.id,{read:!0}),t?.()}}},e.link.label)),av=e=>B({class:`actions`},...e.actions.map(({id:t,label:n,variant:r})=>J({size:`sm`,variant:r,events:{click:()=>Y_(e.id,t)}},n))),ov=e=>{if(e.actions===void 0)return null;if(e.choice===null)return av(e);let t=e.actions.find(({id:t})=>t===e.choice);return gs({class:`choice`},t?.label??e.choice)},sv=(e,{dismissLabel:t,onDismiss:n,onFollow:r,time:i=null,unread:a=!1})=>B({class:[`row`,`kind-${e.kind}`,a&&`unread`],role:`group`,"aria-label":e.title},rv(e),B({class:`words`},gs({class:`title`},e.title),e.description===void 0?null:gs({class:`description`},e.description),i===null?null:gs({class:`time`},i),e.link===void 0?null:iv(e,r),ov(e)),V({class:`dismiss`},J({variant:`ghost`,size:`sm`,square:!0,label:t,events:{click:()=>n(e)}},K({icon:pf,size:`sm`})))),cv=`toast`,lv=[`duration`,`ttl`,`visible`,`limit`,`client`,`message`],uv=`imp.notifications.label`,dv={...Q_,[uv]:`Notifications`},fv=[`warning`,`error`],pv={host:null},mv=()=>`
  :host {
    display: contents;
  }

  .region {
    position: fixed;
    inset: auto;
    inset-block-start: 0;
    inset-inline-end: 0;
    box-sizing: border-box;
    inline-size: min(24rem, 100dvi);
    margin: 0;
    padding: ${U(`space-4`)};
    border: none;
    background-color: transparent;
    overflow: visible;
    pointer-events: none;
  }

  .region:not(:popover-open) {
    display: none;
  }

  @media (width < ${zi}) {
    .region { inline-size: 100dvi }
  }

  .popups {
    display: flex;
    flex-direction: column;
    gap: ${U(`space-2`)};
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .popup {
    border-radius: ${U(`radius-container`)};
    box-shadow: ${U(`shadow-lg`)};
    pointer-events: auto;
    --overlay-offset: 100% 0;
  }

  .popup:dir(rtl) { --overlay-offset: -100% 0 }

  ${nv()}

  ${u_(`.popup`)}

  @starting-style {
    .popup {
      opacity: 0;
      translate: var(--overlay-offset);
    }
  }

  .live {${Gs}}
`,hv=(e,t,n,r)=>t==null?n:typeof t==`number`&&Number.isFinite(t)&&t>=r?t:(h.warn(`${cv}: '${e}' must be a number of ${r} or more - using ${n}`),n),gv=e=>{if(e==null)return[];let t=Array.isArray(e)?e:[e];return t.every(e=>typeof e==`string`)?t:(h.warn(`${cv}: 'client' must be the name of an HTTP client, or an array of names`),[])},_v=e=>e==null?()=>null:typeof e==`function`?e:(h.warn(`${cv}: 'message' must be a function of the error, like (error) => error.body?.error`),()=>null),vv=(e,t)=>{try{let n=e(t);return typeof n==`string`&&n!==``?n:t.message}catch(e){return h.error(`${cv}: the message function failed`,e),t.message}},yv=(e,t,n)=>({id:`imp.http.${e}.${t.method} ${t.url}`,kind:`error`,title:vv(n,t)}),bv=(e,t)=>JSON.stringify({...e,read:!1})===JSON.stringify({...t,read:!1}),xv=e=>[gs(e.title),e.description===void 0?null:gs(e.description)],Sv={styles:mv,props:lv,onMount:e=>e.follow?.(),setup:(e,t,n)=>{if(n.length>0&&h.warn(`${cv}: takes no content - raise a popup with notify({ title })`),pv.host?.isConnected&&pv.host!==e.host)return h.warn(`${cv}: a region is already mounted - mount ${cv}() once, the second one renders nothing`),null;pv.host=e.host;let r=hv(`duration`,t.duration,5e3,0),i=Math.floor(hv(`visible`,t.visible,3,1));X_({ttl:hv(`ttl`,t.ttl,b_.ttl,0),limit:Math.floor(hv(`limit`,t.limit,b_.limit,1))});let a=M([N],()=>F(Z_)),o=hs({class:`popups`}),s=vs({class:`region`},o);s.setAttribute(`popover`,`manual`);let c=B({class:`live`,role:`status`,"aria-atomic":`false`}),l=B({class:`live`,role:`alert`,"aria-atomic":`false`});N.watch(e,()=>s.setAttribute(`aria-label`,F(uv)));let u=/* @__PURE__ */ new Map,d=/* @__PURE__ */ new Map,f=!1,p=null,m=()=>s.contains(e.host.shadowRoot.activeElement),g=()=>{s.isConnected&&(f&&m()||(f&&s.hidePopover(),s.showPopover(),f=!0))},_=()=>{!f||o.children.length>0||(s.hidePopover(),f=!1)},v=e=>{e.sticky||e.hovered||e.focused||e.timer!==null||(e.startedAt=Date.now(),e.timer=setTimeout(()=>J_(e.entry.id),e.remaining))},y=e=>{e.timer!==null&&(clearTimeout(e.timer),e.timer=null,e.remaining=Math.max(1,e.remaining-(Date.now()-e.startedAt)))},b=e=>{y(e),e.remaining=e.entry.duration??r,e.sticky=e.remaining===0,v(e)},x=e=>sv(e,{dismissLabel:a,onDismiss:()=>J_(e.id,{read:!0})}),S=(e,t,n)=>{e[t]=n,n?y(e):v(e)},ee=e=>{let t={entry:e,node:null,timer:null,remaining:0,startedAt:0,sticky:!1,hovered:!1,focused:!1};t.node=ds({class:`popup`,events:{pointerenter:()=>S(t,`hovered`,!0),pointerleave:()=>S(t,`hovered`,!1),focusin:()=>S(t,`focused`,!0),focusout:()=>S(t,`focused`,!1)}},x(e)),u.set(e.id,t),o.prepend(t.node),b(t)},te=(e,t)=>{let n=!bv(e.entry,t);e.entry=t,n&&(e.node.replaceChildren(x(t)),b(e))},ne=e=>{u.delete(e.entry.id),y(e);let t=e.focused;c_(e.node,()=>{e.node.remove(),t&&p?.isConnected&&p.focus(),_()})},re=e=>{let t=new Map(e.filter(({popup:e})=>e).map(e=>[e.id,e]));for(let[e,n]of d)t.has(e)||(n.node.remove(),d.delete(e));for(let e of t.values()){let t=d.get(e.id)??{entry:null,node:B()};if(t.entry!==null&&bv(t.entry,e))continue;t.entry=e,t.node.replaceChildren(...xv(e).filter(Boolean)),d.set(e.id,t);let n=fv.includes(e.kind)?l:c;t.node.parentNode!==n&&n.append(t.node)}},ie=e=>{re(e);let t=e.filter(({popup:e})=>e).slice(-i),n=new Set(t.map(({id:e})=>e));for(let e of[...u.values()])n.has(e.entry.id)||ne(e);let r=t.toReversed().filter(({id:e})=>!u.has(e));for(let e of t){let t=u.get(e.id);t&&te(t,e)}for(let e of r)ee(e);r.length>0&&g()};s.addEventListener(`focusin`,e=>{s.contains(e.relatedTarget)||(p=e.relatedTarget)}),s.addEventListener(`keydown`,e=>{if(e.key!==`Escape`)return;let t=e.composedPath(),n=[...u.values()].find(({node:e})=>t.includes(e));n&&J_(n.entry.id,{read:!0})});let ae=_v(t.message);for(let n of gv(t.client))To(e,n).lastError.watch(e,e=>{e!==null&&K_(yv(n,e,ae))});return e.follow=()=>E_().watch(e,ie),Ko(e,()=>{for(let e of u.values())y(e);pv.host===e.host&&(pv.host=null,X_(b_))}),[s,c,l]}},Cv=(...e)=>z(cv,()=>Sv,()=>P(dv))(...e),wv=(e,t,n)=>{if(typeof n==`string`)try{return To(t,n)}catch(t){return h.error(`${e}: ${t.message}`),null}return D(n?.pending)&&D(n?.lastError)?n:(h.warn(`${e}: 'client' must be the name of an HTTP client like 'myapp.api', or a client from useHttpClient or createHttpClient`),null)},Tv=[`primary`,`success`,`warning`,`danger`,`info`];let Ev=null;const Dv=()=>Ev??=[...Tv,...mi()],Ov=`loader`,kv=[`label`,`size`,`color`,`client`],Av=()=>Dv().map(e=>`  .color-${e} { color: ${U(`color-${e}`)} }`).join(`
`),jv=()=>`
  .root {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
  }

  .root[hidden] {
    display: none;
  }

${Av()}

  .size-sm { --spinner-size: 1rem; --spinner-stroke: 2px }
  .size-md { --spinner-size: 2rem; --spinner-stroke: 3px }
  .size-lg { --spinner-size: 3rem; --spinner-stroke: 4px }

  ${Vu()}

  .words {${Gs}}

  @media (forced-colors: active) {
    .root {
      color: CanvasText;
      forced-color-adjust: none;
    }
  }
`,Mv=(e,t,n)=>{t.hidden=!0;let r=wv(Ov,e,n);r!==null&&L(e,r.pending,e=>{t.hidden=!(e>0)})},Nv={styles:jv,props:kv,setup:(e,t,n)=>{n.length>0&&h.warn(`${Ov}: takes no content - pass the words as 'label'`),t.label===void 0&&h.warn(`${Ov}: pass a 'label' - it is what a screen reader announces`);let r=I(Ov,`size`,t.size,Ys,`md`),i=I(Ov,`color`,t.color,Dv(),`primary`),a=B({class:[`root`,`size-${r}`,`color-${i}`],role:`status`},Hu(),V({class:`words`},R(e,t.label??``)));return t.client!==void 0&&Mv(e,a,t.client),a}},Pv=(...e)=>z(Ov,()=>Nv)(...e),Fv=`notice`,Iv=[`kind`,`title`,`icon`,`dismissible`,`open`,`client`,`events`],Lv=[`info`,`success`,`warning`,`error`],Rv={info:`color-info`,success:`color-success`,warning:`color-warning`,error:`color-danger`},zv={info:qd,success:gd,warning:df,error:_d},Bv=[`warning`,`error`],Vv=`dismiss`,Hv=`imp.notice.dismiss`,Uv={[Hv]:`Dismiss`},Wv=()=>Lv.map(e=>`  .kind-${e} { --notice-color: ${U(Rv[e])} }`).join(`
`),Gv={styles:()=>`
  .root {
    display: flex;
    align-items: flex-start;
    gap: ${U(`space-3`)};
    box-sizing: border-box;
    padding-block: ${U(`space-3`)};
    padding-inline: ${U(`space-4`)};
    border: ${U(`border-width`)} solid color-mix(in oklab, var(--notice-color) 35%, transparent);
    border-radius: ${U(`radius-container`)};
    background-color: color-mix(in oklab, var(--notice-color) 12%, transparent);
    ${W()}
    color: ${U(`color-text`)};
    font-size: ${U(`font-size-md`)};
    line-height: ${U(`line-height-normal`)};
  }

${Wv()}

  .icon {
    display: flex;
    flex: none;
    align-items: center;
    block-size: calc(1em * ${U(`line-height-normal`)});
    color: color-mix(in oklab, var(--notice-color) 80%, ${U(`color-text`)});
  }

  .region {
    flex: 1 1 auto;
    min-inline-size: 0;
    overflow-wrap: anywhere;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: ${U(`space-1`)};
  }

  p {
    margin: 0;
  }

  .title {
    font-weight: ${U(`font-weight-bold`)};
  }

  .detail {
    color: ${U(`color-secondary`)};
    font-size: ${U(`font-size-sm`)};
  }

  .description {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: ${U(`space-3`)};
    row-gap: ${U(`space-1`)};
    font-size: ${U(`font-size-sm`)};
  }

  .close {
    flex: none;
    margin-block: calc(-1 * ${U(`space-1`)});
    margin-inline-end: calc(-1 * ${U(`space-2`)});
  }

  .title[hidden],
  .description:empty,
  .closed > .icon,
  .closed > .close,
  .closed .content {
    display: none;
  }

  .root.closed {
    ${Gs}
    border: none;
  }

  @media (forced-colors: active) {
    .root { border-color: CanvasText }
    .icon { color: CanvasText }
  }
`,props:Iv,setup:(e,t,n)=>{let r=t.client!==void 0,i=r?wv(Fv,e,t.client):null,a=I(Fv,`kind`,t.kind,Lv,r?`error`:`info`),o=!!(t.dismissible??r),s=document.createTextNode(``),c=t.title!==void 0,l=gs({class:`title`,hidden:!c&&!r},c?R(e,t.title):s),u=r&&c?gs({class:`detail`},s):null,d=B({class:`description`},...n),f=B({class:`region`,role:Bv.includes(a)?`alert`:`status`},B({class:`content`},l,u,d)),p=!1,m=null,h=null,g=()=>p&&(!r||m!==null&&m!==h),_=()=>v.classList.toggle(`closed`,!g()),v=B({class:[`root`,`kind-${a}`],events:cd(t.events,[Vv])},V({class:`icon`,"aria-hidden":`true`},K({icon:t.icon??zv[a],size:`1.25em`})),f,o?V({class:`close`},J({variant:`ghost`,size:`sm`,square:!0,label:lp(e,Hv),events:{click:()=>{if(!r)return y.change(!1,{notify:!0});h=m,_(),v.dispatchEvent(new CustomEvent(Vv,{bubbles:!0,composed:!0,detail:{open:!1}})),i?.clearError?.()}}},K({icon:pf,size:`sm`}))):null),y=Lu(Fv,{prop:`open`,source:t.open??!0,node:v,event:Vv,detail:`open`,paint:e=>{p=e,_()}});return y.follow(e),i!==null&&L(e,i.lastError,e=>{m=e??null,m!==null&&(s.data=String(m.message??``)),_()}),_(),v}},Kv=(...e)=>z(Fv,()=>Gv,()=>P(Uv))(...e),qv=e=>`imp.emoji.${e}`,Jv={"imp.emoji.search":`Search emoji`,"imp.emoji.noMatches":`No emoji found`,[qv(`smileys`)]:`Smileys`,[qv(`people`)]:`People and gestures`,[qv(`nature`)]:`Animals and nature`,[qv(`food`)]:`Food and drink`,[qv(`activities`)]:`Activities`,[qv(`travel`)]:`Travel and places`,[qv(`objects`)]:`Objects`,[qv(`symbols`)]:`Symbols`},Yv=e=>{let t=!1;e.addEventListener(`keydown`,e=>{e.key===`Tab`&&(t=!0)}),e.addEventListener(`keyup`,()=>{t=!1}),e.addEventListener(`focusout`,n=>{let r=t;t=!1;let i=n.relatedTarget;r&&i!==null&&!e.contains(i)&&e.matches(`:popover-open`)&&e.hidePopover()})};({...Jv});const Xv=e=>e.map(e=>`'${e}'`).join(`, `),Zv=/^space-(\d+)$/;let Qv=null;const $v=()=>Qv??=[0,...Object.keys(aa()).map(e=>e.match(Zv)?.[1]).filter(Boolean).map(Number)],ey=e=>e===0?`0px`:U(`space-${e}`),ty=(e,t,n)=>r=>$v().includes(r)?ey(r):(h.warn(`${e}: '${t}' must be a spacing step ${Xv($v())} from the theme scale - got '${r}', using ${n}`),ey(n)),ny=`breadcrumbs`,ry=[`items`,`label`,`separator`,`events`],iy=`imp.breadcrumbs.label`,ay=`imp.breadcrumbs.change`,oy=`imp.breadcrumbs.loading`,sy={[iy]:`Breadcrumb`,[ay]:`Change {label}`,[oy]:`Loading`},cy=()=>`
  nav {
    ${W()}
    min-inline-size: 0;
  }

  ol {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${U(`space-1`)};
    margin: 0;
    padding: 0;
    list-style: none;
    min-inline-size: 0;
  }

  li {
    display: flex;
    align-items: center;
    gap: ${U(`space-1`)};
    min-inline-size: 0;
  }

  .crumb {
    display: flex;
    align-items: center;
    gap: ${U(`space-1`)};
    border-radius: ${U(`radius-item`)};
    padding-inline: ${U(`space-1`)};
    color: ${U(`color-secondary`)};
    font-size: ${U(`font-size-sm`)};
    line-height: ${U(`line-height-tight`)};
    text-decoration: none;
    min-inline-size: 0;
  }

  button.crumb,
  .picker {
    margin: 0;
    border: none;
    background: none;
    font-family: inherit;
    cursor: pointer;
  }

  a.crumb:hover,
  button.crumb:hover {
    color: ${js(`color-primary`)};
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  a.crumb:focus-visible,
  button.crumb:focus-visible,
  .picker:focus-visible,
  .option:focus-visible {${G()}}

  .crumb[aria-current] {
    color: ${U(`color-text`)};
    font-weight: ${U(`font-weight-bold`)};
  }

  .label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .icon {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    inline-size: 1rem;
    block-size: 1rem;
  }

  .separator {
    color: ${U(`color-secondary`)};
    font-size: ${U(`font-size-sm`)};
  }

  .picker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 1.5rem;
    block-size: 1.5rem;
    padding: 0;
    border-radius: ${U(`radius-item`)};
    color: ${U(`color-secondary`)};
  }

  .picker:hover { background-color: ${U(`color-surface-hover`)} }

  .picker .caret {
    inline-size: 1rem;
    block-size: 1rem;
    rotate: 90deg;
  }

  ${Wf({trigger:`.picker`,panel:`.panel`,placement:`block-end`,align:`start`})}

  ${op()}

  ${Ws}
`,ly=e=>e==null?null:Yf(ny,e,{prop:`options`,shape:`{ id, label, href }`,noun:`an option`,item:(e,t)=>({id:Gf(e,t),label:e.label,href:Jf(ny,e.href),onClick:qf(e.onClick)})}),uy=e=>Yf(ny,e,{shape:`{ id, label, href }`,noun:`a crumb`,item:(e,t)=>({id:Gf(e,t),label:e.label,href:Jf(ny,e.href),icon:Kf(e.icon,{size:`sm`}),onClick:qf(e.onClick),loading:e.loading===!0,options:ly(e.options)})}),dy={styles:cy,props:ry,setup:(e,t,n)=>{n.length>0&&h.warn(`${ny}: takes no content - pass the trail as 'items'`);let r=ms({class:`root`,events:t.events});t.label===void 0?N.watch(e,()=>r.setAttribute(`aria-label`,F(iy))):L(e,t.label,e=>r.setAttribute(`aria-label`,String(e)));let i=t.separator===void 0?`/`:t.separator,a=e=>r.dispatchEvent(new CustomEvent(`select`,{bubbles:!0,composed:!0,cancelable:!0,detail:e})),o=e=>{a({id:e.id,item:e})&&(e.onClick?.({id:e.id,item:e}),e.href!==null&&Lf(e.href))},s=M([N],()=>F(oy)),c=t=>[t.icon===null?null:V({class:`icon`},qo(e,t.icon)),t.loading?Pv({label:s,size:`sm`}):V({class:`label`},R(e,t.label))],l=(e,t)=>t?V({class:`crumb`,"aria-current":`page`},...c(e)):e.href===null&&e.onClick===null?V({class:`crumb`},...c(e)):e.href===null?O(`button`,{class:`crumb`,type:`button`,events:{click:()=>o(e)}},...c(e)):Rf(Zo({class:`crumb`,href:Ut(e.href)},...c(e)),()=>o(e)),u=(t,n)=>{if(t.options===null||t.options.length===0)return[];let r=`panel-${n}`,i=`--imp-crumb-${n}`,o=O(`button`,{class:`picker`,type:`button`,popovertarget:r,"aria-haspopup":`menu`,"aria-expanded":`false`,style:`anchor-name: ${i}`},gp(`caret`)),s=B({id:r,class:`panel`,role:`menu`,popover:`auto`,style:`position-anchor: ${i}`});N.watch(e,()=>o.setAttribute(`aria-label`,F(ay,{label:String(d(t.label))})));let c=e=>{s.hidePopover(),a({id:e.id,item:e,crumb:t})&&(e.onClick?.({id:e.id,item:e}),e.href!==null&&Lf(e.href))},l=t.options.map(t=>{let n=R(e,t.label);return t.href===null?O(`button`,{...sp,type:`button`,events:{click:()=>c(t)}},n):Rf(Zo({...sp,href:Ut(t.href)},n),()=>c(t))});return cp({panel:s,opener:o,options:l,onToggle:e=>o.setAttribute(`aria-expanded`,String(e))}),[o,s]},d=e=>typeof e?.get==`function`?e.get():e,f=O(`ol`);return r.append(f),L(e,t.items??[],e=>{let t=uy(e);f.replaceChildren(...t.map((e,n)=>O(`li`,n===0?null:V({class:`separator`,"aria-hidden":`true`},i),l(e,n===t.length-1),...u(e,n))))}),r}},fy=(...e)=>z(ny,()=>dy,()=>P(sy))(...e),py=()=>`
  .backdrop {
    position: absolute;
    inset: 0;
    z-index: -1;
    display: grid;
    overflow: hidden;
    border-radius: inherit;
  }
`,my=e=>e==null?null:B({class:`backdrop`,"aria-hidden":`true`},e);let hy=0;const gy=(e,t)=>t==null?null:typeof t!=`object`||t.text===void 0?(h.warn(`${e}: a 'tag' must be an object with a 'text' - ignoring it`),null):{text:t.text,color:t.color,title:t.title},_y=e=>e?.title!==void 0&&e.title!==null&&e.title!==``,vy=e=>_y(e)?`tag-note-${++hy}`:null,yy=(e,t,n=null)=>{if(t===null)return null;let r=V({class:`tag`},Y({color:t.color,size:`sm`},R(e,t.text)));return n===null||(L(e,t.title,e=>r.setAttribute(`title`,String(e))),r.append(V({id:n,hidden:!0},R(e,t.title)))),r},by=(e,t)=>{e.dispatchEvent(new CustomEvent(`select`,{bubbles:!0,composed:!0,cancelable:!0,detail:{id:t.id,item:t}}))&&Lf(t.href)},xy=(e,t,n)=>{let r=vy(t.tag),i=Rf(Zo({class:`link`,href:Ut(t.href)},t.icon===null?null:V({class:`icon`},qo(e,t.icon)),V({class:`label`},R(e,t.label)),yy(e,t.tag,r)),()=>n(t));return r!==null&&i.setAttribute(`aria-describedby`,r),i},Sy=()=>`
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    min-inline-size: 0;
  }

  button.link {
    margin: 0;
    border: none;
    background: none;
    font-family: inherit;
    inline-size: 100%;
    text-align: start;
    cursor: pointer;
  }

  .link {
    display: flex;
    align-items: center;
    gap: ${U(`space-2`)};
    border-radius: ${U(`radius-item`)};
    padding-block: ${U(`space-2`)};
    padding-inline: ${U(`space-3`)};
    color: ${U(`color-text`)};
    font-size: ${U(`font-size-sm`)};
    line-height: ${U(`line-height-tight`)};
    text-decoration: none;
    white-space: nowrap;
    transition:
      background-color ${U(`duration-fast`)} ease-out,
      color ${U(`duration-fast`)} ease-out;
  }

  .link:hover {
    background-color: ${U(`color-surface-hover`)};
  }

  .link:focus-visible {${G()}}

  .link[aria-current] {
    background-color: ${U(`color-surface-hover`)};
    color: ${U(`color-primary`)};
    font-weight: ${U(`font-weight-bold`)};
  }

  .icon {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    inline-size: 1.5rem;
    block-size: 1.5rem;
  }

  .tag {
    display: inline-flex;
    margin-inline-start: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    .link { transition: none }
  }

  @media (forced-colors: active) {
    .link[aria-current] {
      color: Highlight;
      text-decoration: underline;
    }
  }
`,Cy=`--imp-shell-sheet`,wy=`3.5rem`,Ty=()=>`
  :host {
    display: block;
    block-size: 100dvb;
  }

  .shell {
    --sidebar-track: 0px;
    --frame-gap: 0px;
    position: relative;
    isolation: isolate;
    display: grid;
    grid-template-columns: var(--frame-gap) var(--sidebar-track) minmax(0, 1fr) var(--frame-gap);
    grid-template-rows: auto minmax(0, 1fr) auto;
    box-sizing: border-box;
    block-size: 100%;
    padding-block: var(--frame-gap);
    ${W()}
    background: ${U(`background-app`)};
    color: ${U(`color-text`)};
  }

  .shell.limited {
    grid-template-columns:
      minmax(var(--frame-gap), 1fr)
      var(--sidebar-track)
      minmax(0, calc(var(--page-max) - var(--sidebar-track)))
      minmax(var(--frame-gap), 1fr);
  }

  ${py()}

  .region {
    min-inline-size: 0;
    min-block-size: 0;
    box-sizing: border-box;
  }

  ${Sy()}

  .link {
    border-inline-start: calc(${U(`border-width`)} * 2) solid transparent;
    border-radius: 0;
  }

  .sidebar-body .link[aria-current],
  .drawer-nav .link[aria-current] {
    border-inline-start-color: ${U(`color-primary`)};
  }

  .topbar {
    grid-row: 1;
    grid-column: 1 / -1;
    position: relative;
    isolation: isolate;
    display: grid;
    grid-template-columns: subgrid;
    border-block-end: ${U(`border-width`)} solid ${U(`color-border`)};
    background-color: ${U(`color-surface-sunken`)};
  }

  .bar {
    grid-column: 2 / 4;
    display: flex;
    align-items: center;
    gap: ${U(`space-3`)};
    min-inline-size: 0;
    padding-block: ${U(`space-2`)};
    padding-inline: ${U(`space-3`)};
  }

  .shell.gapped .topbar { grid-column: 2 / 4 }

  .shell.gapped .bar { grid-column: 1 / -1 }

  .shell:not(.has-sidebar) .sidebar { display: none }

  .bar-logo:empty,
  .sidebar-logo:empty,
  .bar-body:empty,
  .bar-tools:empty,
  .bar-title:empty,
  .drawer-nav:not(:has(> :not([hidden]))),
  .drawer-tools:empty,
  .sidebar-extras:empty,
  .sidebar-foot:empty {
    display: none;
  }

  .bar-logo { flex: none }

  .bar-body {
    flex: 1;
    min-inline-size: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .bar-body::-webkit-scrollbar { display: none }

  .bar-tools {
    flex: none;
    margin-inline-start: auto;
  }

  .bar-title {
    display: none;
    flex-direction: column;
    min-inline-size: 0;
    line-height: ${U(`line-height-tight`)};
  }

  .bar-title .over {
    font-size: ${U(`font-size-sm`)};
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${U(`color-secondary`)};
  }

  .bar-title .now {
    font-weight: ${U(`font-weight-bold`)};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .main {
    grid-row: 2;
    grid-column: 2 / 4;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: auto;
    padding: ${U(`space-4`)};
  }

  .trail {
    display: flex;
    align-items: center;
    flex: none;
    box-sizing: border-box;
    min-block-size: calc(${wy} - ${U(`space-4`)} - ${U(`space-3`)});
    margin-block-end: ${U(`space-3`)};
  }

  .shell.gapped .trail {
    min-block-size: calc(
      ${wy} + ${U(`border-width`)} - ${U(`space-4`)} - ${U(`space-3`)}
    );
  }

  .trail:empty,
  .trail[hidden] { display: none }

  .sidebar,
  .bottombar {
    display: none;
    background-color: ${U(`color-surface-sunken`)};
  }

  .sidebar {
    position: relative;
    isolation: isolate;
    flex-direction: column;
    overflow: hidden;
    border-inline-end: ${U(`border-width`)} solid ${U(`color-border`)};
  }

  .sidebar-head {
    display: flex;
    align-items: center;
    gap: ${U(`space-2`)};
    flex: none;
    box-sizing: border-box;
    min-block-size: ${wy};
    padding: ${U(`space-2`)};
    border-block-end: ${U(`border-width`)} solid ${U(`color-border`)};
  }

  .sidebar-logo { flex: none }

  .sidebar-head .here {
    flex: 1;
    min-inline-size: 0;
    overflow: hidden;
    font-size: ${U(`font-size-sm`)};
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${U(`color-primary`)};
    white-space: nowrap;
  }

  .sidebar-extras,
  .sidebar-foot {
    flex: none;
    padding: ${U(`space-2`)};
    border-block-start: ${U(`border-width`)} solid ${U(`color-border`)};
  }

  .sidebar-extras .extras,
  .drawer-tools .extras {
    display: flex;
    flex-direction: column;
    gap: ${U(`space-2`)};
    min-inline-size: 0;
  }

  .sidebar-body,
  .drawer-nav,
  .sheet {
    ${Ns()}
  }

  .sidebar-body {
    flex: 1;
    min-block-size: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding-block: ${U(`space-2`)};
  }

  .sidebar-body ul,
  .bar-body ul,
  .drawer-nav ul,
  .sheet ul {
    display: flex;
    flex-direction: column;
  }

  .bar-body ul {
    flex-direction: row;
    align-items: stretch;
    gap: ${U(`space-1`)};
  }

  .bar-body .link {
    border-inline-start: none;
    border-block-end: calc(${U(`border-width`)} * 2) solid transparent;
  }

  .bar-body .link[aria-current] {
    border-block-end-color: ${U(`color-primary`)};
    background-color: transparent;
  }

  .group-title {
    display: flex;
    align-items: center;
    gap: ${U(`space-2`)};
    padding-block: ${U(`space-2`)};
    padding-inline: ${U(`space-3`)};
    color: ${U(`color-secondary`)};
    font-size: ${U(`font-size-sm`)};
    letter-spacing: 0.1em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .group-title .tag { margin-inline-start: 0 }

  .child .link { padding-inline-start: ${U(`space-6`)} }

  .caret {
    flex: none;
    inline-size: 1rem;
    block-size: 1rem;
    margin-inline-start: auto;
    transition: rotate ${U(`duration-fast`)} ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .caret { transition: none }
  }

  .link[aria-expanded='true'] .caret { rotate: 90deg }

  .link:dir(rtl) .caret { rotate: 180deg }

  .link[aria-expanded='true']:dir(rtl) .caret { rotate: 90deg }

  .tag ~ .caret { margin-inline-start: 0 }

  .shell.rail .sidebar-body .label {${Gs}}

  .shell.rail .sidebar-body .tag,
  .shell.rail .sidebar-body .caret,
  .shell.rail .sidebar-body .group-title,
  .shell.rail .sidebar-body .child,
  .shell.rail .sidebar-head .here,
  .shell.rail .sidebar-logo,
  .shell.rail .sidebar-extras,
  .shell.rail .sidebar-foot {
    display: none;
  }

  ${_f()}

  .shell.rail .sidebar-head .rail-toggle { margin-inline: auto }

  .shell.rail .sidebar-body .link {
    justify-content: center;
    padding-inline: 0;
  }

  .bottombar {
    grid-row: 3;
    grid-column: 2 / 4;
    border-block-start: ${U(`border-width`)} solid ${U(`color-border`)};
  }

  .bottombar ul {
    display: flex;
    align-items: stretch;
  }

  .bottombar li {
    flex: 1;
    min-inline-size: 0;
  }

  .bottombar .link {
    box-sizing: border-box;
    position: relative;
    flex-direction: column;
    justify-content: center;
    gap: ${U(`space-1`)};
    inline-size: 100%;
    min-block-size: 3.5rem;
    padding-inline: ${U(`space-1`)};
    border-inline-start: none;
    border-block-start: calc(${U(`border-width`)} * 2) solid transparent;
    font-size: ${U(`font-size-sm`)};
  }

  .bottombar .link[aria-current] {
    border-block-start-color: ${U(`color-primary`)};
  }

  .bottombar .caret,
  .sheet .caret,
  .bar-body .caret {
    display: none;
  }

  .bottombar .label {
    max-inline-size: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .bottombar .tag {
    position: absolute;
    margin: 0;
    inset-block-start: ${U(`space-1`)};
    inset-inline-start: calc(50% + ${U(`space-2`)});
  }

  .tools {
    display: flex;
    align-items: center;
    gap: ${U(`space-2`)};
    min-inline-size: 0;
  }

  .sidebar-foot .tools,
  .drawer-tools .tools {
    flex-direction: column;
    align-items: stretch;
  }

  .hamburger,
  .rail-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    margin: 0;
    padding: 0;
    border: ${U(`border-width`)} solid ${U(`color-border`)};
    border-radius: ${U(`radius-item`)};
    background-color: transparent;
    color: ${U(`color-text`)};
    cursor: pointer;
  }

  .hamburger {
    inline-size: 2.75rem;
    block-size: 2.75rem;
  }

  .rail-toggle {
    inline-size: 1.75rem;
    block-size: 1.75rem;
    margin-inline-start: auto;
  }

  .rail-toggle[hidden] { display: none }

  .hamburger:hover,
  .rail-toggle:hover {
    background-color: ${U(`color-surface-hover`)};
  }

  .hamburger:focus-visible,
  .rail-toggle:focus-visible {${G()}}

  .hamburger { display: none }

  .skip {
    position: absolute;
    inset-block-start: ${U(`space-2`)};
    inset-inline-start: ${U(`space-2`)};
    z-index: 3;
    padding: ${U(`space-2`)} ${U(`space-3`)};
    border-radius: ${U(`radius-item`)};
    background-color: ${U(`color-primary`)};
    color: ${U(`color-on-primary`)};
    font-weight: ${U(`font-weight-bold`)};
    text-decoration: none;
    ${Gs}
  }

  .skip:focus-visible {
    ${G()}
    position: absolute;
    inline-size: auto;
    block-size: auto;
    margin: 0;
    overflow: visible;
    clip-path: none;
    white-space: normal;
  }

  .main:focus,
  .gate:focus { outline: none }

  .gate {
    grid-row: 1 / -1;
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${U(`space-6`)};
    box-sizing: border-box;
    min-block-size: 0;
    overflow: auto;
    padding: ${U(`space-page`)};
  }

  .gate-logo:empty { display: none }

  .gate-body {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    box-sizing: border-box;
    inline-size: 100%;
    max-inline-size: var(--imp-shell-bare-inline-size, 28rem);
  }

  .icon {
    inline-size: 1.5rem;
    block-size: 1.5rem;
  }

  .sheet-anchor { anchor-name: ${Cy} }

  .sheet {
    position: fixed;
    position-anchor: ${Cy};
    position-area: block-start;
    position-try-fallbacks: block-start span-inline-end, block-start span-inline-start;
    position-visibility: anchors-visible;
    inset: auto;
    box-sizing: border-box;
    inline-size: max-content;
    min-inline-size: 12rem;
    max-inline-size: calc(100dvi - ${U(`space-4`)} * 2);
    max-block-size: 60dvb;
    margin: ${U(`space-2`)};
    padding: ${U(`space-2`)};
    border: ${U(`border-width`)} solid ${U(`color-border`)};
    border-radius: ${U(`radius-container`)};
    background-color: ${U(`color-surface`)};
    color: ${U(`color-text`)};
    box-shadow: ${U(`shadow-md`)};
    overflow: auto;
    overscroll-behavior: contain;
  }

  .sheet::backdrop { background-color: transparent }

  .sheet:not(:popover-open) { display: none }

  .sheet-head {
    display: flex;
    align-items: center;
    gap: ${U(`space-2`)};
    padding-inline-start: ${U(`space-2`)};
    margin-block-end: ${U(`space-1`)};
  }

  .sheet-head .title {
    display: flex;
    align-items: center;
    min-inline-size: 0;
    font-size: ${U(`font-size-sm`)};
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${U(`color-primary`)};
  }

  .sheet-head .title-link {
    padding-block: ${U(`space-1`)};
    padding-inline: 0 ${U(`space-2`)};
    font-size: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    color: inherit;
  }

  .sheet-head .title-link .caret { margin-inline-start: ${U(`space-1`)} }

  .sheet-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    inline-size: 2rem;
    block-size: 2rem;
    margin: 0;
    margin-inline-start: auto;
    padding: 0;
    border: none;
    border-radius: ${U(`radius-item`)};
    background-color: transparent;
    color: ${U(`color-secondary`)};
    cursor: pointer;
  }

  .sheet-close:hover {
    background-color: ${U(`color-surface-hover`)};
    color: ${U(`color-text`)};
  }

  .sheet-close:focus-visible {${G()}}

  .sheet ul {
    display: grid;
    grid-template-columns: 1fr;
    gap: ${U(`space-1`)};
  }

  .sheet .link {
    min-block-size: 2rem;
    padding-block: ${U(`space-2`)};
    border: none;
    border-radius: ${U(`radius-item`)};
  }

  .sheet .link[aria-current] {
    background-color: ${U(`color-surface-hover`)};
    color: ${U(`color-primary`)};
  }

  .sheet .child .link { padding-inline-start: ${U(`space-3`)} }

  .drawer {
    --overlay-offset: -100% 0;
    isolation: isolate;
    margin: 0;
    padding: 0;
    border: none;
    --drawer-max-block-size: 100dvb;
    inline-size: min(var(--imp-shell-sidebar-inline-size, 16rem), 85dvi);
    block-size: fit-content;
    max-block-size: var(--drawer-max-block-size);
    background-color: ${U(`color-surface-sunken`)};
    color: ${U(`color-text`)};
  }

  .drawer:dir(rtl) { --overlay-offset: 100% 0 }

  ${u_(`.drawer`)}

  ${d_(`.drawer`)}

  .drawer-body {
    display: flex;
    flex-direction: column;
    max-block-size: var(--drawer-max-block-size);
    box-sizing: border-box;
  }

  .drawer-head {
    display: flex;
    align-items: center;
    gap: ${U(`space-2`)};
    flex: none;
    padding: ${U(`space-2`)};
  }

  .drawer-head .bar-logo { flex: 1 }

  .drawer-nav,
  .drawer-tools {
    border-block-start: ${U(`border-width`)} solid ${U(`color-border`)};
  }

  .drawer-nav {
    flex: 0 1 auto;
    min-block-size: 0;
    overflow: auto;
    padding-block: ${U(`space-2`)};
  }

  .drawer-tools {
    flex: none;
    padding: ${U(`space-2`)};
  }

  .drawer-tools {
    display: flex;
    flex-direction: column;
    gap: ${U(`space-2`)};
  }

  .shell.gapped:not(.has-trail) .main { padding-block-start: 0 }

  .shell.gapped .topbar { margin-block-end: var(--frame-gap) }
  .shell.gapped .sidebar { margin-inline-end: var(--frame-gap) }

  .shell.gapped .bottombar {
    margin-block-start: var(--frame-gap);
    overflow: hidden;
  }

  .shell.gapped .drawer {
    margin: var(--frame-gap);
    --drawer-max-block-size: calc(100dvb - var(--frame-gap) * 2);
    inline-size: min(var(--imp-shell-sidebar-inline-size, 16rem), calc(85dvi - var(--frame-gap)));
    border: ${U(`border-width`)} solid ${U(`color-border`)};
    border-radius: ${U(`radius-container`)};
  }

  .shell.gapped .topbar,
  .shell.gapped .sidebar,
  .shell.gapped .bottombar {
    border: ${U(`border-width`)} solid ${U(`color-border`)};
    border-radius: ${U(`radius-container`)};
  }

  @media (width < ${zi}) {
    .shell.has-bottom-bar .bottombar { display: block }
    .shell.foldable .hamburger { display: inline-flex }
    .bar-title { display: flex }
    .topbar .bar-logo { display: none }
    .trail { display: none }
    .shell.gapped .main { padding-block-start: 0 }
  }

  @media (min-width: ${zi}) {
    .shell.has-sidebar {
      --sidebar-track: calc(var(--imp-shell-sidebar-inline-size, 16rem) + var(--frame-gap));
    }

    .shell.has-sidebar.rail { --sidebar-track: calc(3.75rem + var(--frame-gap)) }

    .bar { padding-inline: ${U(`space-4`)} }

    .shell.bar-away .topbar { display: none }
    .shell.has-sidebar .sidebar { display: flex; grid-row: 2; grid-column: 2 }
    .main { grid-column: 3 }
  }

  ${Ws}

  @media (forced-colors: active) {
    .bar-body .link[aria-current] { border-block-end-color: Highlight }
    .sidebar-body .link[aria-current] { border-inline-start-color: Highlight }
    .bottombar .link[aria-current] { border-block-start-color: Highlight }
  }

  .sr-only {${Gs}}
`,X=`shell`,Ey=`125rem`,Dy=e=>e==null?Ey:typeof e==`string`&&e.trim()!==``?e.trim():(h.warn(`${X}: 'maxWidth' must be a CSS length such as '90rem', or 'none' - got '${e}', using '${Ey}'`),Ey),Oy=(e,t,n)=>{if(n==null)return null;if(typeof n!=`object`||Array.isArray(n)||typeof n.nodeType==`number`)return h.warn(`${X}: '${e}' must be an object of { ${t.join(`, `)} } - ignoring it`),null;for(let r of Object.keys(n))t.includes(r)||h.warn(`${X}: unknown '${e}' key '${r}' - supported keys are ${t.map(e=>`'${e}'`).join(`, `)}`);return Object.fromEntries(t.filter(e=>n[e]!==void 0).map(e=>[e,n[e]]))},ky=e=>e==null?null:jr(e)?e:(h.warn(`${X}: 'map' must be the value appMap() returned - ignoring it`),null),Ay=[`label`,`background`,`hidden`],jy=e=>{if(e===!1)return{shown:!1,data:{}};if(e==null)return{shown:!0,data:{}};let t=Oy(`navbar`,Ay,e)??{};return t.hidden!==void 0&&typeof t.hidden!=`boolean`?(h.warn(`${X}: 'navbar.hidden' must be true or false - showing the bar`),{shown:!0,data:t}):{shown:t.hidden!==!0,data:t}},My=[`icon`,`tag`,`group`,`hidden`],Ny=(e,t,n)=>n==null?!1:typeof n==`boolean`?n:(h.warn(`${X}: 'nav[${e}].${t}' must be true or false - ignoring it`),!1),Py=(e,t)=>t==null?null:typeof t==`string`?t:E(t)?gy(X,t):(h.warn(`${X}: 'nav[${e}].tag' must be a state name or { text, color, title } - ignoring it`),null),Fy=(e,t)=>{if(!E(t))return h.warn(`${X}: 'nav[${e}]' must be an object of { ${My.join(`, `)} }`),null;for(let n of Object.keys(t))My.includes(n)||h.warn(`${X}: unknown 'nav[${e}]' key '${n}' - supported keys are ${My.map(e=>`'${e}'`).join(`, `)}`);return{icon:t.icon??null,tag:Py(e,t.tag),group:Ny(e,`group`,t.group),hidden:Ny(e,`hidden`,t.hidden)}},Iy=(e,t)=>{let n=/* @__PURE__ */ new Map;if(t==null)return n;if(e===null)return h.warn(`${X}: 'nav' needs a 'map' - it binds settings to nodes of that map`),n;if(!E(t))return h.warn(`${X}: 'nav' must be an object of { [handle]: { icon, tag, group, hidden } } - ignoring it`),n;for(let[r,i]of Object.entries(t)){if(Ir(e,r)===null){h.warn(`${X}: 'nav' holds '${r}', which is not a node of the map - pass a handle like [app.reports]`);continue}let t=Fy(r,i);t!==null&&n.set(r,t)}return n},Ly=e=>{let t=D(e)?e.get():e;return t==null?null:typeof t==`object`?t.text===void 0||t.text===null?null:{text:t.text,color:t.color,title:t.title}:{text:t}},Ry=Object.freeze({icon:null,tag:null,group:!1,hidden:!1}),zy=(e,t,{settings:n,tags:r,barShown:i,warnBarGroup:a})=>{let o=e=>n.get(e)??Ry,s=e=>!o(e.id).hidden,c=(e,t)=>({id:e.id,label:e.label,href:e.href,icon:null,tag:Ly(r.get(e.id)??null),children:t}),l=e=>c(e,e.children.filter(s).map(e=>c(e,[]))),u=e=>{let t=[];for(let n of e.filter(s)){if(o(n.id).group){let e=n.children.filter(s).map(l);e.length>0&&t.push({...c(n,[]),items:e});continue}let e=t.at(-1);e!==void 0&&e.label===null?e.items.push(l(n)):t.push({id:`rows-${t.length}`,label:null,tag:null,items:[l(n)]})}return t};if(!i){if(t.length===0)return[];let n=t.map(({items:e,...t})=>({...t,children:e}));return[{...c({id:String(e),label:Vr(Ir(e,e)),href:e.href()},[]),groups:u(n)}]}return t.filter(s).map(e=>(o(e.id).group&&a(e.id),{...c(e,[]),groups:u(e.items)}))},By=(e,t)=>{let n=e=>({...e,icon:Kf(t.get(e.id)?.icon??null),children:e.children.map(n)});return e.map(e=>({...n(e),groups:e.groups.map(e=>({...e,items:e.items.map(n)}))}))},Vy=e=>new Set(e.flatMap(e=>e.groups.flatMap(e=>Uy(e.items).map(e=>e.id)))),Hy=e=>e.flatMap(e=>e.items),Uy=e=>e.flatMap(e=>[e,...e.children.map(t=>({...t,parent:e}))]),Wy=[`map`,`nav`,`logo`,`navbar`,`sidebar`,`extras`,`breadcrumbs`,`signIn`,`navOpen`,`background`,`gap`,`maxWidth`,`effect`,`events`],Gy=[`label`,`extras`,`background`],Ky=`nav-drawer`,qy=`more-sheet`,Jy=`imp.shell.nav`,Yy=`imp.shell.menu`,Xy=`imp.shell.section`,Zy=`imp.shell.more`,Qy=`imp.shell.moreIn`,$y=`imp.shell.collapse`,eb=`imp.shell.expand`,tb=`imp.shell.close`,nb=`imp.shell.skip`,rb={[Jy]:`Navigation`,[Yy]:`Menu`,[Xy]:`Section`,[Zy]:`More`,[Qy]:`More in {section}`,[$y]:`Collapse the sidebar`,[eb]:`Expand the sidebar`,[tb]:`Close`,[nb]:`Skip to the content`},ib=(e,t)=>{if(t==null)return null;if(e===null)return h.warn(`${X}: 'signIn' needs a 'map' - it names a node of that map`),null;let n=Ir(e,t);return n===null&&h.warn(`${X}: 'signIn' is not a node of the map - pass a handle like app.signIn`),n},ab={styles:Ty,props:Wy,onMount:e=>e.afterPlacement(),setup:(e,t,n)=>{let r=ky(t.map),i=r!==null,a=Iy(r,t.nav),o=jy(t.navbar),s=Oy(`sidebar`,Gy,t.sidebar),c=i&&o.shown,l=t.extras!==void 0&&t.extras!==null?B({class:`tools`},t.extras):null,u=t.logo??null,d=i&&t.breadcrumbs!==!1,f=i?Fr(r):null,p=d?B({class:`trail`},fy({items:M([f.current],e=>e.crumbs)})):null,m=d?M([f.current],e=>e.crumbs.filter(({id:e})=>e!==String(r)).length>1):null,g=B({class:`bar-logo`}),_=B({class:`bar-body`}),v=B({class:`bar-tools`}),y=V({class:`over`}),b=V({class:`now`}),x=B({class:`bar-title`},y,b),S=c||l!==null||u!==null,ee=S?O(`button`,{class:`hamburger`,type:`button`,"aria-expanded":`false`,"aria-controls":Ky,events:{click:()=>Dt.change(!Dt.get(),{notify:!0})}},pp()):null,te=B({class:`bar-logo`}),ne=B({class:`drawer-nav`}),re=B({class:`drawer-tools`}),ie=S?O(`button`,{class:`sheet-close`,type:`button`,events:{click:()=>Dt.change(!1,{notify:!0})}},mp()):null,ae=S?rs({class:`drawer`,id:Ky},B({class:`drawer-body`},B({class:`drawer-head`},te,ie),ne,re)):null,oe=c?ms({class:`bar-nav`}):null,se=O(`ul`),ce=ms({class:`region bottombar`},se),le=V({class:`title`}),ue=O(`ul`),de=O(`button`,{class:`sheet-close`,type:`button`,events:{click:()=>C.hidePopover()}},K(pf,{size:`sm`})),C=B({id:qy,class:`sheet`,popover:`auto`},B({class:`sheet-head`},le,de),ue);Yv(C);let fe=V({class:`label`}),pe=O(`button`,{class:`link more`,type:`button`,popovertarget:qy,"aria-expanded":`false`},hp(),fe),me=O(`li`,pe),he=my(o.data.background),ge=i||s!==null||u!==null||l!==null?as({class:`region topbar`},he,B({class:`bar`},ee,g,x,_,v)):null,_e=V({class:`here`}),ve=O(`button`,{class:`rail-toggle`,type:`button`,"aria-expanded":`true`,events:{click:()=>k(!He)}},K(ef,{size:`md`})),ye=B({class:`sidebar-logo`}),be=B({class:`sidebar-head`},ye,_e,ve),xe=s?.extras===void 0||s.extras===null?null:B({class:`extras`},s.extras),Se=B({class:`sidebar-extras`}),Ce=B({class:`sidebar-foot`}),we=ms({class:`sidebar-body`}),Te=my(s?.background),Ee=B({class:`region sidebar`},Te,be,we,Se,Ce),De=fs({class:`region main`,tabindex:`-1`},p,...n),Oe=[...De.childNodes].filter(e=>e!==p);Ro(De,I(X,`effect`,t.effect,Do,`none`)),e.abortSignal.addEventListener(`abort`,()=>zo(De));let ke=ib(r,t.signIn),Ae=B({class:`gate-logo`}),je=B({class:`gate-body`}),Me=fs({class:`region gate`,tabindex:`-1`},Ae,je),Ne=O(`a`,{class:`skip`,href:`#main`,events:{click:e=>{e.preventDefault(),De.focus()}}}),Pe=my(t.background),Fe=t.gap===void 0||t.gap===null?`0px`:ty(X,`gap`,0)(t.gap),Ie=Fe!==`0px`,Le=Dy(t.maxWidth),Re=Le!==`none`,ze=[Ne,ge,Ee,De,ce,C,ae].filter(e=>e!==null),w=B({class:[`shell`,c&&`has-navbar`,S&&`foldable`,Ie&&`gapped`,Re&&`limited`],events:t.events},Pe,...ze);m!==null&&m.watch(e,e=>{p.hidden=!e,w.classList.toggle(`has-trail`,e)}),Ie&&(w.style.setProperty(`--frame-gap`,Fe),w.style.setProperty(`--imp-shell-frame-gap`,Fe),w.style.setProperty(`--imp-shell-frame-radius`,U(`radius-container`))),Re?(w.style.setProperty(`--page-max`,Le),w.style.setProperty(`--imp-shell-frame-inset`,`max(${Fe}, calc((100% - ${Le}) / 2))`)):Ie&&w.style.setProperty(`--imp-shell-frame-inset`,Fe);let Be=matchMedia(`(min-width: ${zi})`),Ve=Be.matches,He=!1,T={sections:[],section:null,item:null,context:null,crumbs:[],built:[],sectionLinks:[],sectionSlots:[],sectionsInBottomBar:!1,revealedFor:null},Ue=[],We=e=>String(e??``),Ge=()=>{let e=parseInt(getComputedStyle(w).getPropertyValue(`--imp-shell-bottom-bar-items`),10);return Number.isFinite(e)?Math.min(5,Math.max(3,e)):4},E=()=>T.sections.find(({id:e})=>e===T.section)??null,Ke=()=>{if(!o.shown)return T.built[0]??null;let e=E();return T.built.find(t=>t.id===e?.id)??null},qe=()=>Ke()?.groups??[],Je=()=>Uy(Hy(qe())).find(({id:e})=>e===T.item)??null,Ye=(e,t)=>{by(e,t),ot&&C.hidePopover(),Dt.change(!1,{notify:!0})},Xe=(t,n)=>yf(e,t,n.label,{enabled:()=>He&&Ve}),Ze=(t,n,r,{child:i=!1}={})=>{let a=n.children.length>0,o=xy(e,n,e=>{a&&!Ve&&!we.contains(o)?dt(n):(a&&_t(n.id),Ye(t,e))});return a&&(o.append(gp(`caret`)),o.setAttribute(`aria-expanded`,`false`)),r.push({id:n.id,link:o}),O(`li`,{class:i?`child`:null},o,Xe(o,n))},Qe=(t,n,r,i,a)=>n.flatMap((n,o)=>{let s=`group-${o}`,c=O(`ul`,n.label===null?{}:{"aria-labelledby":s}),l=[];for(let e of n.items){let n=Ze(t,e,r);i.push({row:n,home:c,index:c.childElementCount}),c.append(n),l.push(n);for(let n of e.children){let i=Ze(t,n,r,{child:!0});i.hidden=!0,i.dataset.parent=e.id,a.push({row:i,list:c,order:l,parent:e.id}),c.append(i),l.push(i)}}if(n.label===null)return[c];let u=vy(n.tag);return u!==null&&c.setAttribute(`aria-describedby`,u),[B({class:`group-title`,id:s},We(n.label),yy(e,n.tag,u)),c]}),$e=()=>{let e=(e,t)=>{for(let{id:n,link:r}of e)n===t?r.setAttribute(`aria-current`,`page`):r.removeAttribute(`aria-current`)};e(T.sectionLinks,T.section);for(let t of T.built)e(t.links,T.item);let t=Ke(),n=t?.rows.find(({row:e})=>e.querySelector(`[aria-current]`));if(!n||st!==null)return;let r=`${t.id}/${n.parent}`;T.revealedFor!==r&&(T.revealedFor=r,gt(n.parent,!0))},et=()=>{let e=E(),t=Je(),n=e===null?``:We(e.label),r=T.crumbs.at(-1)?.label,i=T.crumbs.at(-2)?.label;y.textContent=i??n,b.textContent=r??(t===null?n:We(t.label)),_e.textContent=o.shown?T.context??n:``;let a=qe().length>0;le.textContent=a&&o.shown&&n!==``?F(Qy,{section:n}):F(Zy)},tt=()=>{if(!o.shown)return;T.sectionLinks=[],T.sectionSlots=[];let t=O(`ul`);for(let n of T.sections){let r=xy(e,n,e=>Ye(oe,e));T.sectionLinks.push({id:n.id,link:r});let i=O(`li`,r);T.sectionSlots.push({row:i,home:t,index:t.childElementCount}),t.append(i)}oe.replaceChildren(t)},nt=e=>{T.revealedFor=null,ct.clear(),T.built=e.map(e=>{let t=[],n=[],r=[];return{id:e.id,groups:e.groups,links:t,slots:n,rows:r,nodes:Qe(we,e.groups,t,n,r)}})},rt=()=>{let e=Hy(qe());return e.length>0&&e.every(e=>e.icon!==null)},it=()=>{let e=Ke();w.classList.toggle(`has-sidebar`,(e?.groups.length??0)>0||xe!==null),we.replaceChildren(...e?.nodes??[]);let t=rt();ve.hidden=!t,!t&&He&&k(!1)},at=()=>{let e=Ke()?.slots??[];return T.sectionsInBottomBar=e.length===0&&o.shown,kt(),e.length>0?e:o.shown?T.sectionSlots:[]},ot=!1,st=null,ct=/* @__PURE__ */ new Map,lt=t=>{if(!ct.has(t.id)){let n=xy(e,{...t,icon:null,children:[]},e=>{Ye(we,e)});n.classList.add(`title-link`),n.append(gp(`caret`)),ct.set(t.id,n)}let n=ct.get(t.id);return T.item===t.id?n.setAttribute(`aria-current`,`page`):n.removeAttribute(`aria-current`),n},ut=()=>{if(st===null)return;let{parent:e,kids:t,expanded:n,list:r,order:i}=st;st=null,e.setAttribute(`aria-expanded`,n);let a=new Set(t.map(({row:e})=>e));r.replaceChildren(...i.filter(e=>e.parentElement===r||a.has(e)));for(let{row:e}of t)e.hidden=n!==`true`;et()};function dt(e){let t=Ke(),n=t?.links.find(({id:t})=>t===e.id)?.link,r=t?.rows.filter(t=>t.parent===e.id)??[];if(n!==void 0&&r.length!==0){ut(),st={parent:n,kids:r,expanded:n.getAttribute(`aria-expanded`)??`false`,list:r[0].list,order:r[0].order},n.setAttribute(`aria-expanded`,`true`);for(let{row:e}of r)e.hidden=!1;le.replaceChildren(lt(e)),ue.replaceChildren(...r.map(({row:e})=>e)),ot||C.showPopover()}}let ft=()=>{ut();for(let{row:e,home:t,index:n}of Ue)t.insertBefore(e,t.children[n]??null);Ue=[],me.remove(),se.replaceChildren(),ue.replaceChildren()},pt=()=>{oe!==null&&(oe.hidden=oe.querySelector(`li`)===null)},mt=()=>{ft();let e=at();if(w.classList.toggle(`has-bottom-bar`,e.length>0),Ve||e.length===0)return ot&&C.hidePopover(),pt();let t=Ge();se.replaceChildren(...e.slice(0,t).map(({row:e})=>e)),ue.replaceChildren(...e.slice(t).map(({row:e})=>e)),e.length>t?se.append(me):ot&&C.hidePopover(),Ue=e,pt()},ht=()=>{it(),mt(),et(),$e()};function gt(e,t){let n=Ke()?.links.find(t=>t.id===e)?.link;if(n!==void 0){n.setAttribute(`aria-expanded`,String(t));for(let{row:n,parent:r}of Ke()?.rows??[])r===e&&(n.hidden=!t)}}function _t(e){let t=Ke()?.links.find(t=>t.id===e)?.link;t!==void 0&&gt(e,t.getAttribute(`aria-expanded`)!==`true`)}let vt=(e,t)=>{e!==null&&e.parentElement!==t&&t.append(e)},yt=!1,bt=()=>{if(yt){for(let e of ze)e.remove();ot&&C.hidePopover(),Dt.change(!1,{notify:!0});for(let e of Oe)vt(e,je);vt(Me,w)}else{Me.remove();for(let e of ze)vt(e,w);for(let e of Oe)vt(e,De)}},xt=e=>e.waiting?!0:ke===null||e.pattern===null?!1:Lr(Ir(r,e.pattern),ke),St=!1,Ct=!1,wt=e=>{if(e.leaving||e.pattern===null&&!e.waiting)return;let t=xt(e),n=St&&!Ct;St=!0,Ct=e.waiting,t!==yt&&(yt=t,w.classList.toggle(`bare`,yt),bt(),Tt(),yt||mt(),n&&(yt?Me:De).focus({preventScroll:!0}))},Tt=()=>{let e=!o.shown&&Ve;w.classList.toggle(`bar-away`,e);let t=!Ve;if(yt?vt(u,Ae):vt(u,t?te:e?ye:g),vt(oe,t?ne:_),vt(xe,t?re:Se),vt(Te,t&&ae!==null?ae:Ee),l!==null){if(t)return vt(l,re);vt(l,e?Ce:v)}};function k(e){He=!!e,w.classList.toggle(`rail`,He),ve.setAttribute(`aria-expanded`,String(!He)),ve.setAttribute(`aria-label`,F(He?eb:$y))}let Et=S?m_(ae,{signal:e.abortSignal,onClose:()=>Dt.change(!1,{notify:!0})}):null,Dt=Lu(X,{prop:`navOpen`,source:t.navOpen,node:w,event:`navToggle`,detail:`open`,paint:e=>{S&&(ee.setAttribute(`aria-expanded`,String(e)),e?ae.isConnected&&Et.open():Et.close())}}),Ot={navbar:``,sidebar:``};function kt(){let e=T.sectionsInBottomBar?Ot.navbar:Ot.sidebar;ce.setAttribute(`aria-label`,e)}let At=(t,n,r,i)=>{let a=e=>{Ot[t]=e;for(let t of n)t.setAttribute(`aria-label`,e);kt()};r===void 0?N.watch(e,()=>a(F(i))):L(e,r,e=>a(String(e)))};if(N.watch(e,()=>{if(et(),S){let e=F(Yy);ee.setAttribute(`aria-label`,e),ae.setAttribute(`aria-label`,e),ie.setAttribute(`aria-label`,F(tb))}de.setAttribute(`aria-label`,F(tb)),Ne.textContent=F(nb),fe.textContent=F(Zy),ve.setAttribute(`aria-label`,F(He?eb:$y))}),c&&At(`navbar`,[oe],o.data.label,Jy),At(`sidebar`,[we],s?.label,Xy),i){let t=/* @__PURE__ */ new Map;for(let[n,{tag:r}]of a)r!==null&&t.set(n,typeof r==`string`?j(e,r):r);let n=[...t.values()].filter(D),i=/* @__PURE__ */ new Set,s=e=>{i.has(e)||(i.add(e),h.warn(`${X}: 'nav[${e}].group' is ignored - the bar has no groups, so set 'group' on a node of the sidebar`))},c=M([f.tree,N,...n],e=>zy(r,e,{settings:a,tags:t,barShown:o.shown,warnBarGroup:s})),l=[],u=e=>{let t=Vy(T.sections);return e!==null&&t.has(e)?e:l.findLast(e=>t.has(e))??null};c.watch(e,e=>{T.sections=By(e,a),T.item=u(f.current.get().item),tt(),nt(T.sections),ht(),Tt()}),f.current.watch(e,e=>{l=e.crumbs.map(e=>e.id),T.section=o.shown?e.section:String(r),T.item=u(e.item),T.context=e.context,T.crumbs=e.crumbs,ht(),wt(e)})}ht();let jt=null,Mt=e=>{jt?.classList.remove(`sheet-anchor`),jt=e,jt.classList.add(`sheet-anchor`)};return C.addEventListener(`beforetoggle`,e=>{ot=e.newState===`open`,pe.setAttribute(`aria-expanded`,String(ot)),ot&&Mt(st===null?pe:st.parent)}),C.addEventListener(`toggle`,e=>{e.newState===`closed`&&st!==null&&mt()}),e.afterPlacement=()=>{mt(),S&&Dt.get()&&Et.open()},Be.addEventListener(`change`,e=>{Ve=e.matches,Ve&&Dt.change(!1,{notify:!0}),Tt(),mt(),$e()},{signal:e.abortSignal}),Tt(),k(!1),Dt.follow(e),w}},ob=(...e)=>z(X,()=>ab,()=>P(rb))(...e),sb=`appLogo`,cb=[`label`,`tagline`,`href`,`src`,`alt`,`icon`,`image`,`compact`,`events`],lb=()=>`
  .root {
    display: flex;
    align-items: center;
    gap: ${U(`space-2`)};
    box-sizing: border-box;
    inline-size: 100%;
    min-inline-size: 0;
    border-radius: ${U(`radius-item`)};
    padding-block: ${U(`space-2`)};
    padding-inline: ${U(`space-2`)};
    ${W()}
    color: ${U(`color-text`)};
    text-decoration: none;
  }

  a.root:hover {
    background-color: ${U(`color-surface-hover`)};
  }

  a.root:focus-visible {${G()}}

  .mark {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    inline-size: 1.75rem;
    block-size: 1.75rem;
    color: ${U(`color-primary`)};
  }

  .mark img {
    inline-size: 100%;
    block-size: 100%;
    object-fit: contain;
  }

  .whole {
    display: block;
    flex: none;
    inline-size: auto;
    max-inline-size: 100%;
    block-size: var(--imp-app-logo-block-size, 2rem);
    object-fit: contain;
    object-position: 0 50%;
  }

  .words {
    display: flex;
    flex-direction: column;
    min-inline-size: 0;
  }

  .label {
    color: ${U(`color-heading`)};
    font-family: ${U(`font-family-heading`)};
    font-size: ${U(`font-size-lg`)};
    font-weight: ${U(`font-weight-bold`)};
    line-height: ${U(`line-height-tight`)};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tagline {
    color: ${U(`color-secondary`)};
    font-size: ${U(`font-size-sm`)};
    line-height: ${U(`line-height-tight`)};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .compact .words {${Gs}}

  ${Ws}
`,ub=e=>typeof e==`object`&&!!e,db=({light:e,dark:t},n)=>n===`dark`?t??e:e??t,fb=(e,t,n,r)=>{let i=ss({alt:r});return ub(n)?n.light===void 0&&n.dark===void 0?(h.warn(`${sb}: '${t}' as an object needs a 'light' or a 'dark' entry - drawing no picture`),null):(Gi.watch(e,e=>{let t=db(n,Pi(e?.tokens));i.getAttribute(`src`)!==t&&(i.src=t)}),i):(i.src=n,i)},pb=(e,t)=>{if(t.src!==void 0){let n=fb(e,`src`,t.src,t.alt??``);return n===null?null:V({class:`mark`},n)}return t.icon!==void 0&&t.icon!==null?V({class:`mark`},qo(e,t.icon)):null},mb=(e,t)=>{for(let e of[`src`,`icon`,`tagline`])t[e]!==void 0&&h.warn(`${sb}: '${e}' is ignored beside 'image' - the image is the whole logo`);t.label===void 0&&h.warn(`${sb}: 'image' needs a 'label' - it is the alt text of the logo`);let n=fb(e,`image`,t.image,``);return n===null?null:(n.classList.add(`whole`),L(e,t.label??``,e=>n.setAttribute(`alt`,String(e??``))),n)},hb={styles:lb,props:cb,setup:(e,t,n)=>{n.length>0&&h.warn(`${sb}: takes no content - pass the app name as 'label'`);let r=t.image===void 0||t.image===null,i=r?pb(e,t):null;r&&i===null&&t.label===void 0&&h.warn(`${sb}: needs a 'label', an 'src', an 'icon' or an 'image' - rendering an empty brand`);let a=!r||t.label===void 0&&t.tagline===void 0?null:B({class:`words`},t.label===void 0?null:V({class:`label`},R(e,t.label)),t.tagline===void 0?null:V({class:`tagline`},R(e,t.tagline))),o=r?[i,a]:[mb(e,t)],s=t.href===void 0?`/`:Mf(sb,t.href),c={class:[`root`,t.compact&&`compact`],events:t.events};if(s===null)return B(c,...o);let l=Zo({...c,href:Ut(s)},...o);return Pf(s)?l:Rf(l,()=>Lf(s))}},gb=(...e)=>z(sb,()=>hb)(...e),_b=e=>{try{return globalThis.localStorage?.getItem(e)??null}catch(t){return h.debug(`could not read the '${e}' preference from localStorage`,t),null}},vb=(e,t)=>{try{globalThis.localStorage?.setItem(e,t)}catch(t){h.debug(`could not store the '${e}' preference in localStorage`,t)}},yb=(e,t)=>e==null?null:t(e),bb=(e,t)=>{for(let[n,r]of t)r!==null&&e.style.setProperty(`--${n}`,r);return e},xb=(e,t,n=e)=>{let r=t.map(({variable:e,fallback:t})=>`--${e}: ${t};`).join(` `),i=t.map(({property:e,variable:t,fallback:n})=>`${e}: var(--${t}, ${n});`).join(` `);return[`${n} { ${r} }`,`${e} { ${i} }`].join(`

  `)},Sb=`flex`,Cb=[`top`,`bottom`,`center`,`stretch`],wb=[`start`,`end`,`center`,`justify`],Tb=[`horizontalAlign`,`verticalAlign`,`wrap`,`gap`,`joined`],Eb=()=>[{property:`gap`,variable:`gap`,fallback:U(`space-3`)}],Db={styles:()=>`
  .root {
    display: flex;
    flex-direction: row;
    min-inline-size: 0;
  }

  .wrap { flex-wrap: wrap }

  .root.joined { gap: 0 }

  ${Us(`.joined`)}

  .vertical-top { align-items: flex-start }
  .vertical-bottom { align-items: flex-end }
  .vertical-center { align-items: center }
  .vertical-stretch { align-items: stretch }

  .horizontal-start { justify-content: flex-start }
  .horizontal-end { justify-content: flex-end }
  .horizontal-center { justify-content: center }
  .horizontal-justify { justify-content: space-between }

  ${xb(`.root`,Eb())}
`,props:Tb,setup:(e,t,n)=>{let r=I(Sb,`horizontalAlign`,t.horizontalAlign,wb,`start`),i=I(Sb,`verticalAlign`,t.verticalAlign,Cb,`stretch`),a=!!t.joined;a&&t.gap!==void 0&&h.warn(`${Sb}: a joined row has no gap - ignoring 'gap'`);let o=B({class:[`root`,`horizontal-${r}`,`vertical-${i}`,t.wrap&&`wrap`,a&&`joined`]},...n);return a?o:bb(o,[[`gap`,yb(t.gap,ty(Sb,`gap`,3))]])}},Z=(...e)=>z(Sb,()=>Db)(...e),Ob=`themeSelect`,kb=[`themes`,`remember`,`label`,`variant`,`size`,`events`],Ab=`imp.theme`,jb=`system`,Mb=`imp-light`,Nb=`imp-dark`,Pb=`imp.theme.current`,Fb={[jb]:`imp.theme.system`,[Mb]:`imp.theme.light`,[Nb]:`imp.theme.dark`},Ib={[jb]:Zd,[Mb]:cf,[Nb]:Qd},Lb={"imp.theme.label":`Theme`,[Pb]:`Theme: {theme}`,"imp.theme.system":`System`,"imp.theme.light":`Light`,"imp.theme.dark":`Dark`},Rb=[jb,Mb,Nb],zb=e=>e===void 0?Rb.map(e=>({value:e,theme:e})):!Array.isArray(e)||e.length===0?(h.warn(`${Ob}: 'themes' must be a non-empty array of theme names or { value, label, theme } - using the built-in ones`),Rb.map(e=>({value:e,theme:e}))):e.flatMap(e=>typeof e==`string`?[{value:e,theme:e}]:e&&typeof e==`object`&&e.value!==void 0?[{value:String(e.value),label:e.label,theme:e.theme??String(e.value)}]:(h.warn(`${Ob}: a theme is neither a name nor { value, label, theme } - skipping it`),[])),Bb=e=>{if(e.label!==void 0)return String(e.label);let t=Fb[e.value];return t===void 0?e.value:F(t)},Vb=e=>K(Ib[e.value]??$d,{size:`sm`}),Hb={props:kb,setup:(e,t,n)=>{n.length>0&&h.warn(`${Ob}: takes no content - pass the choices as 'themes'`);let r=zb(t.themes),i=t.remember!==!1,a=I(Ob,`variant`,t.variant,$u,`default`),o=I(Ob,`size`,t.size,Ys,`sm`),s=matchMedia(`(prefers-color-scheme: dark)`),c=k(`imp.themeSelect.current`,r[0].value),l=e=>r.find(t=>t.value===e)??null,u=e=>e.theme===jb?s.matches?Nb:Mb:e.theme,d=e=>{try{ha(u(e))}catch(t){h.error(`${Ob}: could not apply the '${e.value}' theme`,t)}},f=null,p=(e,{store:t})=>{let n=l(e);n!==null&&(f=n,c.set(n.value),t&&i&&vb(Ab,n.value),d(n))},m=()=>Gi.get()?.name??null,g=()=>{let e=m();if(f!==null&&f.value===c.get()&&u(f)===e)return;let t=r.find(t=>t.theme===e);t!==void 0&&c.get()!==t.value&&c.set(t.value)},_=M([N,c],(e,t)=>Bb(l(t))),v=t.label??M([N,_],(e,t)=>F(Pb,{theme:t})),y=r.map(e=>({id:e.value,label:M([N],()=>Bb(e)),icon:Vb(e),checked:M([c],t=>t===e.value),onClick:()=>p(e.value,{store:!0})}));s.addEventListener(`change`,()=>{l(c.get())?.theme===jb&&p(c.get(),{store:!1})},{signal:e.abortSignal}),Gi.watch(e,g);let b=i?_b(Ab):null;return b!==null&&l(b)!==null?p(b,{store:!1}):m()===null?p(r[0].value,{store:!1}):g(),jp({trigger:`arrow`,variant:a,size:o,label:v,items:y,events:t.events},Z({gap:2,verticalAlign:`center`},c.view(e=>Vb(l(e))),_.text(e=>e)))}},Ub=(...e)=>z(Ob,()=>Hb,()=>P(Lb))(...e),Wb={"imp.notifications.empty":`No notifications`,"imp.notifications.clearAll":`Clear all`};({...Q_,...Wb});const Gb=`stack`,Kb=[`start`,`end`,`center`,`stretch`],qb=[`top`,`bottom`,`center`,`justify`],Jb=[`horizontalAlign`,`verticalAlign`,`gap`],Yb=()=>[{property:`gap`,variable:`gap`,fallback:U(`space-3`)}],Xb={styles:()=>`
  :host {
    display: block;
  }

  .root {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    block-size: 100%;
    min-inline-size: 0;
  }

  .horizontal-start { align-items: flex-start }
  .horizontal-end { align-items: flex-end }
  .horizontal-center { align-items: center }
  .horizontal-stretch { align-items: stretch }

  .vertical-top { justify-content: flex-start }
  .vertical-bottom { justify-content: flex-end }
  .vertical-center { justify-content: center }
  .vertical-justify { justify-content: space-between }

  ${xb(`.root`,Yb())}
`,props:Jb,setup:(e,t,n)=>{let r=I(Gb,`horizontalAlign`,t.horizontalAlign,Kb,`stretch`),i=I(Gb,`verticalAlign`,t.verticalAlign,qb,`top`),a=B({class:[`root`,`horizontal-${r}`,`vertical-${i}`]},...n);return bb(a,[[`gap`,yb(t.gap,ty(Gb,`gap`,3))]])}},Zb=(...e)=>z(Gb,()=>Xb)(...e),Q=Ar({view:`The details and the preview of one file`,edit:`Edit a text file`,status:`The working tree status of the git repository`,history:`The commit history of the git repository`,diff:`The changes of a commit, a file or the tree`,compare:`Everything that changed between two commits`}),Qb=`dialog`,$b=[`title`,`modal`,`open`,`beforeClose`,`anchor`,`content`,`events`],ex=(e,t)=>e.content===void 0?null:typeof e.content==`function`?(t.length>0&&h.warn(`${Qb}: pass the content as children or as 'content', not both - using 'content'`),e.content):(h.warn(`${Qb}: 'content' must be a function that returns the content - ignoring it`),null),tx=`title`,nx=`imp.dialog.close`,rx=`imp.dialog.move`,ix={[nx]:`Close`,[rx]:`Move this window with the arrow keys`};let ax=0;const ox=`anchor-name`,sx=(e,t)=>{let n=t;for(;n&&!e.contains(n);)n=n.getRootNode().host??null;return n},cx=(e,t,n)=>{let r=++ax,i=`--imp-dialog-${r}`,a=new CSSStyleSheet;a.replaceSync(`[data-imp-dialog="${r}"]::part(panel) { position-anchor: ${i} }`),e.setAttribute(`data-imp-dialog`,r),t.setAttribute(`data-anchored`,``);let o=null,s=``,c=null,l=()=>{o&&o.style.setProperty(ox,s),o=null},u=()=>{c&&=(c.adoptedStyleSheets=c.adoptedStyleSheets.filter(e=>e!==a),null)};return{attach:()=>{l();let t=e.getRootNode();if(o=sx(t,n),!o){h.warn(`${Qb}: 'anchor' is not in the page - the window opens centred`);return}getComputedStyle(o).display===`contents`&&h.warn(`${Qb}: 'anchor' <${o.localName}> has no box - wrap it in a span, or pass an element that has one`),c!==t&&(u(),t.adoptedStyleSheets=[...t.adoptedStyleSheets,a],c=t),s=o.style.getPropertyValue(ox);let r=getComputedStyle(o).getPropertyValue(ox);o.style.setProperty(ox,!r||r===`none`?i:`${r}, ${i}`)},release:l,dispose:()=>{l(),u()}}},lx={styles:()=>`
  :host {
    display: contents;
  }

  .panel {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    inline-size: min(
      var(--imp-dialog-inline-size, 32rem),
      calc(100dvi - ${U(`space-6`)} - ${U(`space-6`)})
    );
    max-block-size: calc(100dvb - ${U(`space-6`)} - ${U(`space-6`)});
    margin: auto;
    padding: 0;
    border: ${U(`border-width`)} solid ${U(`color-border`)};
    border-radius: ${U(`radius-container`)};
    background-color: ${U(`color-surface`)};
    box-shadow: ${U(`shadow-lg`)};
    color: ${U(`color-text`)};
    transform: translate(var(--drag-x, 0px), var(--drag-y, 0px));
    ${W()}
    ${Hs()}
    --overlay-offset: 0 0.5rem;
  }

  .panel:not([open]):not(:popover-open) {
    display: none;
  }

  .panel[data-anchored] {
    inset: auto;
    margin: ${U(`space-2`)};
    max-block-size: calc(100% - ${U(`space-2`)} - ${U(`space-2`)});
    position-area: block-end span-all;
    position-try-fallbacks: flip-block;
  }

  .bar {
    display: flex;
    align-items: center;
    gap: ${U(`space-3`)};
    flex: none;
    padding-block: ${U(`space-3`)};
    padding-inline: ${U(`space-4`)};
    border-block-end: ${U(`border-width`)} solid ${U(`color-border`)};
  }

  .panel[data-movable] .bar {
    cursor: move;
    touch-action: none;
    user-select: none;
  }

  .bar:focus-visible {${G()}}

  .title {
    flex: 1;
    min-inline-size: 0;
    margin: 0;
    font-size: ${U(`font-size-lg`)};
    font-weight: ${U(`font-weight-bold`)};
  }

  .close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    inline-size: 2.25rem;
    block-size: 2.25rem;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: ${U(`radius-item`)};
    background-color: transparent;
    color: ${U(`color-text`)};
    cursor: pointer;
  }

  .close:hover {
    background-color: ${U(`color-surface-hover`)};
  }

  .close:focus-visible {${G()}}

  .icon {
    inline-size: 1.5rem;
    block-size: 1.5rem;
  }

  .body {
    overflow: auto;
    padding: ${U(`space-4`)};
  }

  ${u_(`.panel`)}

  ${d_(`.panel[data-modal]`)}

  ${Ws}
`,props:$b,onMount:e=>e.showIfOpen(),setup:(e,t,n)=>{let r=t.modal!==!1;t.title===void 0&&h.warn(`${Qb}: pass a 'title' - it is what names the dialog for a screen reader`);let i=f_(Qb,t.beforeClose),a=O(`h2`,{class:`title`,id:tx},R(e,t.title??``)),o=O(`button`,{class:`close`,type:`button`,events:{click:()=>i(()=>_.change(!1,{notify:!0}))}},mp()),s=O(`header`,{class:`bar`},a,o),c=ex(t,n),l=c?k(`imp.dialog.content`,!1):null,u=B({class:`body`},...l?[l.view(e=>e?c():null)]:n),d=rs({class:`panel`,part:`panel`,"aria-labelledby":tx,events:t.events},s,u);r?d.setAttribute(`data-modal`,``):(d.setAttribute(`popover`,`manual`),d.setAttribute(`data-movable`,``),d.setAttribute(`tabindex`,`-1`),s.setAttribute(`tabindex`,`0`)),N.watch(e,()=>{o.setAttribute(`aria-label`,F(nx)),r||s.setAttribute(`aria-label`,F(rx))});let f=r?m_(d,{signal:e.abortSignal,dismiss:i,onClose:()=>_.change(!1,{notify:!0})}):h_(d,{signal:e.abortSignal}),p=r?null:g_(d,s,{signal:e.abortSignal});t.anchor!==void 0&&!(t.anchor instanceof Element)&&h.warn(`${Qb}: 'anchor' must be an element - the window opens centred`);let m=!r&&t.anchor instanceof Element?cx(e.host,d,t.anchor):null;e.abortSignal.addEventListener(`abort`,()=>m?.dispose());let g=()=>{p?.reset(),m?.attach(),f.open()},_=Lu(Qb,{prop:`open`,source:t.open,node:d,event:`openToggle`,detail:`open`,paint:e=>{e?(l?.set(!0),d.isConnected&&g()):f.close().then(()=>{_.get()||(m?.release(),l?.set(!1))})}});return e.showIfOpen=()=>{_.get()&&g()},_.follow(e),d}},ux=(...e)=>z(Qb,()=>lx,()=>P(ix))(...e),dx=`tabs`,fx=[`horizontal`,`vertical`],px=[`items`,`selected`,`orientation`,`foldable`,`folded`,`label`,`events`],mx=`select`,hx=`fold`,gx=`imp.tabs.fold`,_x=`imp.tabs.unfold`,vx={[gx]:`Fold the tabs`,[_x]:`Unfold the tabs`},yx=()=>`
  ${Ks}

  :host {
    display: block;
    min-inline-size: 0;
  }

  .root {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    block-size: 100%;
    ${W()}
    min-inline-size: 0;
  }

  .root.vertical {
    flex-direction: row;
    gap: ${U(`space-4`)};
  }

  .strip {
    display: flex;
    flex-direction: column;
  }

  .vertical .strip {
    flex: none;
    gap: ${U(`space-4`)};
    border-inline-end: ${U(`border-width`)} solid ${U(`color-border`)};
  }

  .tablist {
    display: flex;
    gap: ${U(`space-1`)};
    border-block-end: ${U(`border-width`)} solid ${U(`color-border`)};
  }

  .horizontal .tablist {
    overflow-x: auto;
    ${Ns()}
  }

  .horizontal .tab:focus-visible { outline-offset: calc(-1 * ${U(`focus-ring-width`)}) }

  .vertical .tablist {
    flex-direction: column;
    border-block-end: none;
  }

  .fold-box {
    display: grid;
    grid-template-columns: 1fr;
    transition: grid-template-columns ${U(`duration-fast`)} ease-out;
  }

  .fold-box > .tablist {
    min-inline-size: 0;
    overflow: hidden;
  }

  .folded .fold-box {
    grid-template-columns: 0fr;
  }

  .fold {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    align-self: flex-end;
    margin: 0;
    margin-inline-end: ${U(`space-2`)};
    padding: 0;
    inline-size: 1.75rem;
    block-size: 1.75rem;
    border: ${U(`border-width`)} solid ${U(`color-border`)};
    border-radius: ${U(`radius-item`)};
    background-color: transparent;
    color: ${U(`color-text`)};
    cursor: pointer;
  }

  .folded .fold {
    order: -1;
  }

  .fold:hover {
    background-color: ${U(`color-surface-hover`)};
  }

  .fold:focus-visible {${G()}}

  .fold-icon {
    display: inline-flex;
    transition: rotate ${U(`duration-fast`)} ease-out;
  }

  .folded .fold-icon { rotate: 180deg }

  .fold-icon:dir(rtl) { rotate: 180deg }

  .folded .fold-icon:dir(rtl) { rotate: 0deg }

  .tab {
    margin: 0;
    border: none;
    border-block-end: ${U(`focus-ring-width`)} solid transparent;
    border-radius: ${U(`radius-item`)} ${U(`radius-item`)} 0 0;
    padding-block: ${U(`space-2`)};
    padding-inline: ${U(`space-3`)};
    background-color: transparent;
    color: ${U(`color-secondary`)};
    ${W()}
    font-size: ${U(`font-size-sm`)};
    font-weight: ${U(`font-weight-bold`)};
    line-height: ${U(`line-height-tight`)};
    white-space: nowrap;
    cursor: pointer;
    transition:
      color ${U(`duration-fast`)} ease-out,
      border-color ${U(`duration-fast`)} ease-out,
      background-color ${U(`duration-fast`)} ease-out;
  }

  .vertical .tab {
    border-block-end: none;
    border-inline-end: ${U(`focus-ring-width`)} solid transparent;
    border-radius: 0;
    border-start-start-radius: ${U(`radius-item`)};
    border-end-start-radius: ${U(`radius-item`)};
    text-align: start;
  }

  .tab:hover:not(:disabled) {
    background-color: ${U(`color-surface-hover`)};
    color: ${U(`color-text`)};
  }

  .tab:focus-visible {${G()}}

  .tab:disabled {
    cursor: not-allowed;
    opacity: ${U(`disabled-opacity`)};
  }

  .tab[aria-selected='true'] {
    border-color: ${U(`color-primary`)};
    color: ${U(`color-primary`)};
  }

  .panels {
    flex: 1;
    min-inline-size: 0;
  }

  .panel {
    padding-block-start: ${U(`space-3`)};
    color: ${U(`color-text`)};
  }

  .vertical .panel {
    padding-block-start: 0;
  }

  .panel:focus-visible {${G()}}

  @media (prefers-reduced-motion: reduce) {
    .tab, .fold-box, .fold-icon { transition: none }
  }

  ${Ws}

  @media (forced-colors: active) {
    .tab[aria-selected='true'] {
      border-color: Highlight;
      color: Highlight;
    }
  }
`,bx=e=>Yf(dx,e,{shape:`{ id, label, content }`,item:(e,t)=>({id:Gf(e,t),label:e.label,content:e.content,disabled:!!e.disabled})}),xx=e=>{let t=/* @__PURE__ */ new Set;for(let{id:n}of e)t.has(n)&&h.warn(`${dx}: two items share the id '${n}' - ids must be unique within one tabs()`),t.add(n)},Sx={styles:yx,props:px,setup:(e,t,n)=>{n.length>0&&h.warn(`${dx}: takes no content - pass every panel as 'items'`);let r=I(dx,`orientation`,t.orientation,fx,`horizontal`),i=bx(t.items??[]);xx(i);let a=!!t.foldable&&r===`vertical`;t.foldable&&!a&&h.warn(`${dx}: 'foldable' needs orientation 'vertical' - ignoring it`);let o=B({class:`tablist`,role:`tablist`,"aria-orientation":r}),s=a?O(`button`,{class:`fold`,type:`button`,"aria-expanded":`true`},K(hd,{size:`md`})):null;s!==null&&s.firstElementChild.classList.add(`fold-icon`);let c=B({class:`strip`},a?B({class:`fold-box`},o):o,s),l=B({class:`panels`}),u=B({class:[`root`,r],events:cd(t.events,[mx,hx])},c,l),d=i.map((t,n)=>{let r=`tab-${n}`,i=`panel-${n}`,a=O(`button`,{class:`tab`,id:r,type:`button`,role:`tab`,"aria-controls":i,"aria-selected":`false`,tabindex:`-1`,disabled:t.disabled,events:{click:()=>_(n,{focus:!0})}},R(e,t.label)),o=B({class:`panel`,id:i,role:`tabpanel`,tabindex:`0`,"aria-labelledby":r,hidden:!0},t.content);return{...t,tab:a,panel:o,index:n}});o.append(...d.map(({tab:e})=>e)),l.append(...d.map(({panel:e})=>e));let f=d.find(({disabled:e})=>!e)??d[0]??null,p=f?f.index:-1,m=()=>{for(let{tab:e,panel:t,index:n}of d){let r=n===p;e.setAttribute(`aria-selected`,String(r)),e.tabIndex=r?0:-1,t.hidden=!r}},g=e=>d.findIndex(t=>t.id===String(e));function _(e,{focus:t=!1,notify:n=!0}={}){let r=d[e];!r||r.disabled||e===p?r&&t&&e===p&&r.tab.focus():(p=e,m(),t&&r.tab.focus(),n&&u.dispatchEvent(new CustomEvent(mx,{bubbles:!0,composed:!0,detail:{id:r.id,index:e}})))}if(o.addEventListener(`keydown`,e=>{let t=ep(e.key,{orientation:r,element:o});if(t===null)return;let n=rp(t,d,p===-1?0:p,({disabled:e})=>!e);n&&_(n.index,{focus:!0}),e.preventDefault()}),t.selected!==void 0&&L(e,t.selected,e=>{let t=g(e);t===-1?h.warn(`${dx}: 'selected' is '${e}', which is not the id of any item`):_(t,{notify:!1})}),m(),t.label!==void 0&&L(e,t.label,e=>o.setAttribute(`aria-label`,String(e))),a){let n=Lu(dx,{prop:`folded`,source:t.folded,node:u,event:hx,detail:`folded`,paint:e=>{u.classList.toggle(`folded`,e),o.inert=e,s.setAttribute(`aria-expanded`,String(!e)),s.setAttribute(`aria-label`,F(e?_x:gx))}});s.setAttribute(`aria-label`,F(gx)),s.addEventListener(`click`,()=>n.change(!n.get(),{notify:!0})),n.follow(e),N.watch(e,()=>{s.setAttribute(`aria-label`,F(n.get()?_x:gx))})}else t.folded!==void 0&&h.warn(`${dx}: 'folded' needs 'foldable' - ignoring it`);return u}},Cx=(...e)=>z(dx,()=>Sx,()=>P(vx))(...e),wx=e=>{let t=e.lastIndexOf(`/`);return t===-1?`.`:e.slice(0,t)},Tx=e=>e.slice(e.lastIndexOf(`/`)+1),Ex=e=>e===`.`?[]:e.split(`/`),Dx=e=>e.split(`/`).map(encodeURIComponent).join(`/`),Ox=e=>e===`.`?`root`:e,kx=(e,t={})=>{let n=new URLSearchParams;for(let[e,r]of Object.entries(t))r!=null&&r!==!1&&n.set(e,r);let r=n.toString();return r?`${e.href()}?${r}`:e.href()},Ax=({path:e=`.`,right:t,reveal:n}={})=>kx(Q,{path:e===`.`&&t===void 0&&!n?void 0:e,right:t,reveal:n}),jx=e=>kx(Q.view,{path:e}),Mx=e=>kx(Q.edit,{path:e}),Nx=()=>Q.status.href(),Px=e=>kx(Q.history,{path:e}),Fx=e=>kx(Q.diff,e),Ix=(e,t)=>kx(Q.compare,{from:e,to:t}),Lx=e=>e.isDeleted?Fx({path:e.path}):e.isDirectory?Ax({path:e.path}):jx(e.path),Rx=()=>globalThis.location.origin,zx=(e,t={})=>{let n=new URL(e,Rx());for(let[e,r]of Object.entries(t))r!=null&&n.searchParams.set(e,r);return n.href},Bx=e=>zx(`/${Dx(e)}`),Vx=e=>zx(`/api/thumbnail`,{path:e}),Hx=e=>zx(`/api/download-item`,{path:e.path,type:e.isDirectory?`directory`:`file`}),Ux=e=>e?.body?.message??e?.message??`The request failed`,Wx=e=>globalThis.open(e,`_blank`,`noopener`),Gx=e=>globalThis.location.assign(e),Kx=e=>{let t=document.createElement(`form`);t.method=`POST`,t.action=zx(`/api/download-items`),t.hidden=!0;for(let n of e){let e=document.createElement(`input`);e.name=`paths`,e.value=n,t.append(e)}document.body.append(t),t.submit(),setTimeout(()=>t.remove(),1e3)},qx=async(e,t,n=``)=>{try{let r=await e.post(`/api/git/switch-worktree`,{body:{path:t.path,currentPath:n}});K_({kind:`success`,title:r.message}),globalThis.location.assign(Ax({path:r.path})),globalThis.location.reload()}catch(e){K_({kind:`error`,title:`Could not switch the worktree`,description:Ux(e)})}},Jx=e=>[e.ahead>0?Y({size:`sm`,color:`blue`},`↑${e.ahead}`):null,e.behind>0?Y({size:`sm`,color:`orange`},`↓${e.behind}`):null,e.changeCount>0?Y({size:`sm`,color:`amber`},e.changeCount):null],Yx=e=>Z({gap:2,verticalAlign:`center`},K(Wd,{size:`sm`}),e.branch,...Jx(e)),Xx=T(`rfm-branch-menu`,{setup:e=>{let t=To(e,`rfm.api`),n=j(e,`rfm.git`),r=Iu(),i=e=>{let n=r.get();return qx(t,e,n.path===`/`?n.query.path:``)},a=e=>e.map(e=>({id:e.path,label:`${e.label} · ${e.path}`,checked:e.isCurrent,disabled:e.isCurrent||e.isPrunable,onClick:()=>i(e)}));return n.view(e=>e?e.worktrees.length<2?J({variant:`ghost`,size:`sm`,events:{click:()=>q(Nx())}},Yx(e)):jp({trigger:`arrow`,variant:`ghost`,size:`sm`,label:`Branch ${e.branch}, switch worktree`,items:[...a(e.worktrees),{id:`status`,label:`Git status`,icon:Gd,onClick:()=>q(Nx())}]},Yx(e)):null)}}),Zx=/^(?:[A-Za-z_$][\w$]*|0|[1-9]\d*)$/,Qx=/^(?:0|[1-9]\d*)$/,$x=e=>typeof e!=`string`||e===``?`must be a dot-separated field path like 'user.firstName' or 'items.0.name'`:e.split(`.`).some(e=>!Zx.test(e))?`'${e}' is not a dot-separated field path - write 'user.firstName' or 'items.0.name', not '${e}'`:null,eS=(e,t)=>{let n=e;for(let e of t.split(`.`)){if(n==null)return;n=n[e]}return n},tS=e=>Qx.test(e)?[]:{},nS=(e,t,n)=>{if(Array.isArray(e)){let r=[...e];return r[Number(t)]=n,r}return{...e,[t]:n}},rS=(e,t,n)=>{let[r,...i]=t.split(`.`),a=e??tS(r),o=a[r],s=i.length===0?n:rS(o??tS(i[0]),i.join(`.`),n);return s===o&&Object.hasOwn(a,r)?a:nS(a,r,s)},iS=`form-secrets`,aS=`imp.form.secrets`,oS=e=>e==null||e===``,sS=()=>{let e=/* @__PURE__ */ new Map,t=/* @__PURE__ */ new Set,n=()=>{for(let e of[...t])e()};return Object.freeze({read:t=>e.get(t),write:(t,r)=>{e.set(t,r),n()},subscribe:e=>(t.add(e),()=>t.delete(e)),holdsAny:()=>[...e.values()].some(e=>!oS(e)),mergeInto:t=>[...e].reduce((e,[t,n])=>rS(e,t,n),t),clear:()=>{e.size!==0&&(e.clear(),n())}})},cS=e=>Ie(e,iS,`form`,aS,e=>{let t=sS();return x(iS,aS,t,e.host,e),t}),lS=e=>Fe(e,iS,`field`,aS,e=>b(iS,aS,e.host)?.value??null),uS=Symbol(`imp.field.missing`),dS=(e,t)=>Object.is(e,t)||typeof e==`object`&&typeof t==`object`&&JSON.stringify(e)===JSON.stringify(t),fS=e=>e?e.key===void 0?e.message:F(e.key,e.params):``,pS=e=>e?typeof e==`string`?{message:e}:e:null,mS=e=>e==null||e===``,hS=(e,t)=>{if(!Object.hasOwn(e,t))return e;let n={...e};return delete n[t],n},gS=(e,t,{emptyWhen:n=mS}={})=>{let r=[];if(t.required&&r.push(e=>n(e)?{key:`imp.form.required`}:null),t.minLength!==void 0&&r.push(e=>!mS(e)&&String(e).length<t.minLength?{key:`imp.form.minLength`,params:{min:t.minLength}}:null),t.maxLength!==void 0&&r.push(e=>!mS(e)&&String(e).length>t.maxLength?{key:`imp.form.maxLength`,params:{max:t.maxLength}}:null),t.min!==void 0&&r.push(e=>!mS(e)&&Number(e)<t.min?{key:`imp.form.min`,params:{min:t.min}}:null),t.max!==void 0&&r.push(e=>!mS(e)&&Number(e)>t.max?{key:`imp.form.max`,params:{max:t.max}}:null),t.pattern!==void 0){let e=t.pattern instanceof RegExp?t.pattern:new RegExp(t.pattern);r.push(t=>!mS(t)&&!e.test(String(t))?{key:`imp.form.pattern`}:null)}return t.validate!==void 0&&(typeof t.validate==`function`?r.push((e,n)=>pS(t.validate(e,n))):h.warn(`${e}: 'validate' must be a function returning a message or null - ignoring it`)),(e,t=yS)=>{for(let n of r){let r=n(e,t);if(r)return r}return null}},_S=(e,t)=>t.validateAsync===void 0?null:typeof t.validateAsync==`function`?async(e,n=yS)=>pS(await t.validateAsync(e,n)):(h.warn(`${e}: 'validateAsync' must be a function returning a promise of a message or null - ignoring it`),null),vS={key:`imp.form.checkFailed`},yS=Object.freeze({values:void 0}),bS=()=>{let e=/* @__PURE__ */ new Set;return{notify:t=>{for(let n of[...e])n(t)},subscribe:t=>(e.add(t),()=>e.delete(t))}},xS=e=>{let t=uS;return n=>{Object.is(n,t)||(t=n,e(n))}},SS=(e,t)=>({read:()=>eS(t.get(),e),watch:n=>t.watch(xS(t=>n(eS(t,e)))),write:n=>t.set(t=>rS(t,e,n))}),CS=(e,t,n,r)=>{let i=lS(r);eS(n.get(),t)!==void 0&&h.warn(`${e}: field '${t}' is secret, so it starts empty and its value in 'initialValues' is not used - remove that value from 'initialValues'`);let a=()=>i.read(t);return{read:a,watch:e=>{let t=xS(e);return t(a()),i.subscribe(()=>t(a()))},write:e=>i.write(t,e)}},wS=(e,t,n,r,i)=>{let a=t.field,o=$x(a);if(o)throw Error(`imp: ${e}: 'field' ${o}`);let s;try{s=j(i,Uu)}catch{throw Error(`imp: ${e}: field '${a}' has no form around it - a control with 'field' must be rendered inside form({ initialValues }), which owns the '${Uu}' state it writes into`)}let c=j(i,Wu),l=j(i,Gu),u=j(i,qu),d=j(i,Ju),f=()=>({values:s.get()}),p=t.secret?CS(e,a,s,i):SS(a,s),m=p.read,g=m(),_=e=>{c.set(t=>{let n=t??{};return e?{...n,[a]:e}:hS(n,a)})},v=()=>{let e=n(m(),f());return _(e),e},y=e=>{d.set(t=>{let n=t??{};return e?n[a]?n:{...n,[a]:!0}:hS(n,a)})},b=0;i.abortSignal.addEventListener(`abort`,()=>{b+=1,y(!1),_(null)});let x=async()=>{let t=v();if(t||!r)return t;let n=++b;y(!0);try{let e=await r(m(),f());return n===b?(_(e),e):null}catch(t){return n===b?(h.error(`${e}: the check for '${a}' could not run`,t),_(vS),vS):null}finally{n===b&&y(!1)}},S=()=>{l.set(e=>e?.[a]?e:{...e??{},[a]:!0})};return{path:a,read:m,watch:p.watch,commit:e=>{p.write(e),v()},touch:S,leave:()=>{dS(m(),g)||S()},watchError:e=>c.watch(xS(t=>e(t?.[a]??null))),watchVisible:e=>{let t=!1,n=0,r=xS(e),i=l.watch(e=>{t=!!e?.[a],r(t||n>0)}),o=u.watch(e=>{n=e??0,r(t||n>0)});return()=>{i(),o()}},watchSubmits:e=>u.watch(e),watchChecking:e=>d.watch(xS(t=>e(!!t?.[a]))),validateNow:v,check:x}},TS=(e,t,n,r)=>{let i=D(t.value)?t.value:null,a=Array.isArray(t.value);t.value!==void 0&&!i&&typeof t.value==`object`&&!a&&h.warn(`${e}: 'value' is an object that is not a state - pass a state or a plain value`);let o=i?void 0:t.value,s=bS(),c=bS(),l=bS(),u=bS(),d=null,f=!1,p=!1,m=0,g=()=>i?i.get():o,_=g(),v=()=>{f||(f=!0,l.notify(!0))},y=()=>(d=n(g()),c.notify(d),d);return{path:null,read:g,watch:e=>{let t=xS(e);if(i)return i.watch(t);let n=s.subscribe(t);return t(o),n},commit:t=>{if(i){if(typeof i.set!=`function`){h.warn(`${e}: 'value' is a read-only state ('${i.name}'), so what the user types cannot be kept - pass a state with 'set', or a 'field' inside a form`);return}i.set(t)}else o=t,s.notify(t);y()},touch:v,leave:()=>{dS(g(),_)||v()},watchError:e=>{let t=c.subscribe(e);return e(d),t},watchVisible:e=>{let t=l.subscribe(e);return e(f),t},watchSubmits:()=>()=>{},watchChecking:e=>{let t=u.subscribe(e);return e(p),t},validateNow:y,check:async()=>{let t=y();if(t||!r)return t;let n=++m;p=!0,u.notify(!0);try{let e=await r(g());return n===m?(d=e,c.notify(d),e):null}catch(t){return n===m?(h.error(`${e}: the check could not run`,t),d=vS,c.notify(d),vS):null}finally{n===m&&(p=!1,u.notify(!1))}}}},ES=(e,t,n={})=>{let r=gS(e,t,n),i=_S(e,t);return t.field===void 0?(t.secret&&h.warn(`${e}: 'secret' applies to a 'field' inside a form only - the value stays in the state that you pass`),TS(e,t,r,i)):(t.value!==void 0&&h.warn(`${e}: 'field' and 'value' are alternatives - using 'field' ('${t.field}')`),wS(e,t,r,i,n.self))},DS=()=>`
    margin: 0;
    border: ${U(`border-width`)} solid ${U(`color-border`)};
    ${zs()}
    background-color: ${U(`color-surface`)};
    color: ${U(`color-text`)};
    ${W()}
`,OS=()=>`
  input,
  textarea,
  select {
    inline-size: 100%;
    ${DS()}
    ${ic(`md`,`space-3`)}
    transition: border-color ${U(`duration-fast`)} ease-out;
  }

  select {
    block-size: ${rc(`md`)};
    appearance: none;
    padding-inline-end: calc(${U(`space-3`)} + 1em + ${U(`space-2`)});
  }

  textarea {
    min-block-size: 0;
    line-height: ${U(`line-height-normal`)};
    resize: vertical;
  }

  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible {${G()}}

  ${Bs(`input`)}
  ${Bs(`textarea`)}
  ${Bs(`select`)}

  input:disabled,
  textarea:disabled,
  select:disabled {
    cursor: not-allowed;
    opacity: ${U(`disabled-opacity`)};
  }

  input[aria-invalid='true'],
  textarea[aria-invalid='true'],
  select[aria-invalid='true'] {
    border-color: ${U(`color-danger`)};
  }

  @media (prefers-reduced-motion: reduce) {
    input,
    textarea,
    select {
      transition: none;
    }
  }

  ${Ws}
`,kS=()=>`
  .check {
    display: flex;
    align-items: flex-start;
    gap: ${U(`space-2`)};
    min-inline-size: 0;
  }

  .check input {
    flex: none;
    inline-size: 1.125rem;
    block-size: 1.125rem;
    margin: 0;
    accent-color: ${U(`color-primary`)};
  }

  .check input:focus-visible {
    outline: ${U(`focus-ring-width`)} solid ${U(`color-primary`)};
    outline-offset: 2px;
  }

  .check input:disabled {
    cursor: not-allowed;
    opacity: ${U(`disabled-opacity`)};
  }

  .check-label {
    min-inline-size: 0;
    overflow-wrap: anywhere;
    ${W()}
    color: ${U(`color-text`)};
    font-size: ${U(`font-size-md`)};
    line-height: ${U(`line-height-normal`)};
  }

  ${Ws}
`,AS=`control`,jS=`label`,MS=`help`,NS=`error`,PS=[`label`,`ariaLabel`,`help`,`required`,`disabled`],FS=[`minLength`,`maxLength`,`min`,`max`,`pattern`,`validate`,`validateAsync`],IS=[`field`,`value`,`secret`],LS=()=>`
  .field {
    display: flex;
    flex-direction: var(--imp-field-direction, column);
    gap: ${U(`space-2`)};
    min-inline-size: 0;
  }

  .label {
    flex: 0 0 var(--imp-field-label-size, auto);
    color: ${U(`color-text`)};
    font-size: ${U(`font-size-sm`)};
    font-weight: ${U(`font-weight-bold`)};
    line-height: ${U(`line-height-tight`)};
  }

  legend.label {
    float: inline-start;
    padding: 0;
  }

  .required {
    color: ${U(`color-danger`)};
  }

  .optional {
    color: ${U(`color-secondary`)};
    font-weight: ${U(`font-weight-normal`)};
  }

  .body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: ${U(`space-1`)};
    min-inline-size: 0;
  }

  .help,
  .error {
    margin: 0;
    font-size: ${U(`font-size-sm`)};
    line-height: ${U(`line-height-normal`)};
  }

  .help {
    color: ${U(`color-secondary`)};
  }

  .error {
    color: ${U(`color-danger`)};
  }

  [hidden] {
    display: none;
  }

  fieldset {
    margin: 0;
    padding: 0;
    border: 0;
    min-inline-size: 0;
  }
`,RS=(e,t,n,{grouping:r=!1,presented:i=null,describedBy:a=[]}={})=>{let o=t.label!==void 0,s=t.required?V({class:`required`,"aria-hidden":`true`},` *`):null,c=o?R(e,t.label):null,l=r?O(`legend`,{class:`label`,id:jS},c,s):O(`label`,{class:`label`,id:jS,for:AS},c,s),u=t.help===void 0?null:gs({class:`help`,id:MS},R(e,t.help)),d=document.createTextNode(``),f=gs({class:`error`,id:NS,"aria-live":`polite`},d),p=B({class:`body`},i??n,u,f),m=r?O(`fieldset`,{class:`field`},o?l:null,p):B({class:`field`},o?l:null,p),h=u?[MS,...a]:[...a],g=r?m:n;t.ariaLabel!==void 0&&L(e,t.ariaLabel,e=>g.setAttribute(`aria-label`,String(e))),t.required&&g.setAttribute(`aria-required`,`true`);let _=null,v=!1,y=()=>{let e=v&&_!==null,t=e?fS(_):``;d.data!==t&&(d.data=t),f.hidden=!e,g.setAttribute(`aria-invalid`,e?`true`:`false`);let n=e?[...h,NS]:h;n.length===0?g.removeAttribute(`aria-describedby`):g.setAttribute(`aria-describedby`,n.join(` `))};return y(),{root:m,attach:t=>{Ko(e,t.watchError(e=>{_=e,y()})),Ko(e,t.watchVisible(e=>{v=e,y()})),Ko(e,t.watchSubmits(e=>{e>0&&t.check()})),Ko(e,t.watchChecking(e=>{g.setAttribute(`aria-busy`,e?`true`:`false`)})),N.watch(e,()=>y())}}};[...IS,...PS];const zS=`codeEditor`,BS=`keys`,VS=`imp.codeEditor.keys`,HS={[VS]:`Tab indents. Press Escape, then Tab, to leave the editor.`},US=[...IS,...PS,...FS,`language`,`lineNumbers`,`rows`,`placeholder`,`readonly`],WS=/^[ \t]*/,GS=/^(?: {1,2}|\t)/,KS=()=>`
${LS()}

  .editor {
    --code-surface: ${U(`color-surface`)};
    position: relative;
    overflow: hidden;
    border: ${U(`border-width`)} solid ${U(`color-border`)};
    border-radius: ${U(`radius-item`)};
    background-color: ${U(`color-surface`)};
    color: ${U(`color-text`)};
    transition: border-color ${U(`duration-fast`)} ease-out;
  }

  .editor:has(textarea:focus-visible) {
    ${G()}
  }

  .editor:has(textarea:disabled) {
    cursor: not-allowed;
    opacity: ${U(`disabled-opacity`)};
  }

  .editor:has(textarea[aria-invalid='true']) {
    border-color: ${U(`color-danger`)};
  }

  .mirror {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: auto;
    pointer-events: none;
    background: none;
  }

  textarea {
    position: relative;
    z-index: 1;
    display: block;
    inline-size: 100%;
    resize: none;
    overflow: auto;
    outline: none;
    background: transparent;
    color: transparent;
    caret-color: ${U(`color-text`)};
  }

  textarea::placeholder {
    color: ${U(`color-secondary`)};
  }

  textarea::selection {
    background-color: ${lm(`primary`,`28%`)};
    color: transparent;
  }

  textarea:disabled {
    cursor: not-allowed;
  }

  .keys {${Gs}}

${xh()}

  @media (prefers-reduced-motion: reduce) {
    .editor {
      transition: none;
    }
  }

  ${Ws}

  @media (forced-colors: active) {
    .editor { border-color: ButtonBorder }
    .editor:has(textarea:focus-visible) { outline-color: Highlight }
    textarea::selection { background-color: Highlight; color: transparent }
  }
`,qS=e=>e==null?``:String(e),JS=e=>e===void 0?10:Number.isInteger(e)&&e>0?e:(h.warn(`${zS}: 'rows' must be a positive integer - got '${e}', using 10`),10),YS=(e,t)=>e.lastIndexOf(`
`,t-1)+1,XS=(e,t)=>{let n=e.indexOf(`
`,t);return n===-1?e.length:n},ZS=e=>e.replace(GS,``),QS=e=>{let t=!1,n=(t,n,r)=>{e.setSelectionRange(t,n),document.execCommand(`insertText`,!1,r)},r=t=>{let{value:r,selectionStart:i,selectionEnd:a}=e,o=YS(r,i),s=XS(r,a),c=r.slice(o,s).split(`
`),l=c.map(e=>t?ZS(e):`  `+e),u=l[0].length-c[0].length,d=l.join(`
`).length-(s-o);n(o,s,l.join(`
`)),e.setSelectionRange(Math.max(o,i+u),Math.max(o,a+d))},i=t=>{let{value:i,selectionStart:a,selectionEnd:o}=e,s=i.slice(a,o).includes(`
`);t||s?r(t):n(a,o,`  `)},a=()=>{let{value:t,selectionStart:r,selectionEnd:i}=e,a=t.slice(YS(t,r),r);n(r,i,`\n${WS.exec(a)[0]}`)};return n=>{if(!(e.readOnly||e.disabled||n.isComposing)){if(n.key===`Escape`)t=!0;else if(n.key===`Tab`){let e=!t&&!n.ctrlKey&&!n.altKey&&!n.metaKey;if(t=!1,!e)return;n.preventDefault(),i(n.shiftKey)}else t=!1,n.key===`Enter`&&!n.shiftKey&&!n.ctrlKey&&!n.metaKey&&(n.preventDefault(),a())}}},$S={styles:KS,props:US,setup:(e,t,n)=>{n.length>0&&h.warn(`${zS}: takes no content - pass 'label' and 'help' instead of children`);let r=om(zS,t.language),i=t.lineNumbers===!0,a=ES(zS,t,{self:e}),o=B({class:i?`editor numbered`:`editor`}),s=Ch({language:r,scope:o,createNumber:i?Sh:null}),c=_s({class:`code mirror`,"aria-hidden":`true`},s.listing),l=Ss({id:AS,spellcheck:!1,autocomplete:`off`,autocapitalize:`off`,...t.placeholder===void 0?{}:{placeholder:t.placeholder},...t.readonly?{readonly:!0}:{},events:{input:()=>a.commit(l.value),blur:()=>{a.leave(),a.check()},scroll:()=>{c.scrollTop=l.scrollTop,c.scrollLeft=l.scrollLeft}}});l.addEventListener(`keydown`,QS(l));let u=gs({class:`keys`,id:BS});N.watch(e,()=>{u.textContent=F(VS)});let d=null,f=e=>{e!==d&&(d=e,s.render(e))};L(e,t.rows,e=>{l.rows=JS(e)}),L(e,t.disabled,e=>{l.disabled=!!e}),Ko(e,a.watch(e=>{let t=qS(e);l.value!==t&&(l.value=t),f(t)})),o.append(c,l,u,wh(e,zS,()=>l.value));let p=RS(e,t,l,{presented:o,describedBy:[BS]});return p.attach(a),p.root}},eC=(...e)=>z(zS,()=>$S,()=>P({...Xu,...vh,...HS}))(...e);[...IS,...PS];const tC=e=>e==null?``:String(e),nC=(e,t)=>Array.isArray(t)?t.flatMap(t=>typeof t==`string`||typeof t==`number`?[{value:tC(t),raw:t,label:String(t),icon:null,disabled:!1}]:t&&typeof t==`object`&&t.value!==void 0?[{value:tC(t.value),raw:t.value,label:D(t.label)?t.label:String(t.label??tC(t.value)),icon:t.icon??null,disabled:!!t.disabled}]:(h.warn(`${e}: an option is neither a string nor { value, label } - skipping it`),[])):(h.warn(`${e}: 'options' must be an array of { value, label } or plain strings - rendering none`),[]),rC=e=>Array.isArray(e)?e.map(String):e==null||e===``?[]:[String(e)],iC=e=>rC(e).length===0;[...IS,...PS];const aC=/* @__PURE__ */ new Map,oC=(e,t)=>{let n=`${t}|${JSON.stringify(e)}`;if(!aC.has(n)){let r;try{r=new Intl.DateTimeFormat(t,e)}catch(n){h.debug(`dates: '${t}' is not a language Intl reads - using 'en'`,n),r=new Intl.DateTimeFormat(`en`,e)}aC.set(n,r)}return aC.get(n)},sC=(e,t,n=N.get())=>oC(t,n).format(e),cC={"imp.datePicker.previousMonth":`Previous month`,"imp.datePicker.nextMonth":`Next month`};[...IS,...PS],{...Xu,...cC},[...IS,...PS],{...Xu,...cC},[...IS,...PS],{...Xu,...Jv};const lC=[`byte`,`kilobyte`,`megabyte`,`gigabyte`],uC=1e3,dC={heic:`image/heic`,heif:`image/heif`},fC=e=>{let t=String(e.type??``).toLowerCase();if(t)return t;let n=String(e.name??``).toLowerCase().match(/\.([^./]+)$/)?.[1];return dC[n]??``},pC=(e,t)=>t==null?[]:typeof t==`string`?t.split(`,`).map(e=>e.trim().toLowerCase()).filter(Boolean):(h.warn(`${e}: 'accept' must be a string like 'image/*,.pdf' - ignoring it`),[]),mC=(e,t)=>{let n=String(t.name??``).toLowerCase(),r=fC(t);return e.startsWith(`.`)?n.endsWith(e):e.endsWith(`/*`)?r.startsWith(e.slice(0,-1)):r===e},hC=(e,t)=>e.length===0||e.some(e=>mC(e,t)),gC=(e,t)=>{let n={style:`unit`,unit:t,unitDisplay:t===`byte`?`long`:`short`,maximumFractionDigits:1};try{return new Intl.NumberFormat(e,n)}catch(t){return h.debug(`fileUpload: '${e}' is not a language tag Intl reads`,t),new Intl.NumberFormat(void 0,n)}},_C=(e,t)=>{let n=e,r=0;for(;n>=uC&&r<lC.length-1;)n/=uC,r+=1;return gC(t,lC[r]).format(n)},vC=`fileUpload`,yC=[...IS,...PS,`multiple`,`accept`,`maxSize`,`onFiles`,`validate`,`validateAsync`],bC=`hint`,xC=`imp.fileUpload.prompt`,SC=`imp.fileUpload.accepts`,CC=`imp.fileUpload.maxSize`,wC=`imp.fileUpload.remove`,TC=`imp.fileUpload.tooLarge`,EC=`imp.fileUpload.wrongType`,DC={[xC]:`Drop files here, or browse`,[SC]:`Accepts {types}`,[CC]:`Up to {size} for each file`,[wC]:`Remove {name}`,[TC]:`{name} is larger than {size}`,[EC]:`{name} is not an accepted file type`},OC=()=>`
  ${LS()}

  .upload {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: ${U(`space-2`)};
    min-inline-size: 0;
    ${W()}
  }

  #${AS} {
    ${Gs}
  }

  .zone {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${U(`space-1`)};
    box-sizing: border-box;
    padding-block: ${U(`space-5`)};
    padding-inline: ${U(`space-4`)};
    border: ${U(`border-width`)} dashed ${U(`color-border`)};
    border-radius: ${U(`radius-container`)};
    background-color: ${U(`color-surface`)};
    color: ${U(`color-secondary`)};
    text-align: center;
    transition:
      background-color ${U(`duration-fast`)} ease-out,
      border-color ${U(`duration-fast`)} ease-out;
  }

  .zone:hover,
  .zone.over {
    border-color: ${U(`color-primary`)};
    background-color: ${U(`color-surface-hover`)};
  }

  .zone.over {
    border-style: solid;
  }

  #${AS}:focus-visible + .zone {${G()}}

  #${AS}[aria-invalid='true'] + .zone {
    border-color: ${U(`color-danger`)};
  }

  #${AS}:disabled + .zone {
    opacity: ${U(`disabled-opacity`)};
    border-color: ${U(`color-border`)};
    background-color: ${U(`color-surface`)};
  }

  .prompt {
    color: ${U(`color-text`)};
    font-size: ${U(`font-size-md`)};
    font-weight: ${U(`font-weight-bold`)};
    line-height: ${U(`line-height-tight`)};
    cursor: pointer;
  }

  .prompt::after {
    content: '';
    position: absolute;
    inset: 0;
    cursor: pointer;
  }

  #${AS}:disabled + .zone .prompt,
  #${AS}:disabled + .zone .prompt::after {
    cursor: not-allowed;
  }

  .hint {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    column-gap: ${U(`space-3`)};
    margin: 0;
    font-size: ${U(`font-size-sm`)};
    line-height: ${U(`line-height-normal`)};
  }

  .files {
    display: flex;
    flex-direction: column;
    gap: ${U(`space-1`)};
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .files[hidden] {
    display: none;
  }

  .file {
    display: flex;
    align-items: center;
    gap: ${U(`space-2`)};
    min-inline-size: 0;
    padding-block: ${U(`space-1`)};
    padding-inline: ${U(`space-3`)} ${U(`space-1`)};
    border: ${U(`border-width`)} solid ${U(`color-border`)};
    border-radius: ${U(`radius-item`)};
    background-color: ${U(`color-surface`)};
    color: ${U(`color-text`)};
    font-size: ${U(`font-size-sm`)};
    line-height: ${U(`line-height-tight`)};
  }

  .name {
    flex: 1 1 auto;
    min-inline-size: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .size {
    flex: none;
    color: ${U(`color-secondary`)};
    font-variant-numeric: tabular-nums;
  }

  @media (prefers-reduced-motion: reduce) {
    .zone { transition: none }
  }

  ${Ws}

  @media (forced-colors: active) {
    .zone.over { border-color: Highlight }
  }
`;let kC=0;const AC=()=>`file-${Date.now().toString(36)}-${++kC}`,jC=e=>Array.isArray(e)?e.filter(e=>e&&typeof e==`object`):[],MC=e=>jC(e).length===0,NC=(e,t)=>e.length===t.length&&e.every((e,n)=>e===t[n]),PC=e=>e===void 0?null:Number.isFinite(e)&&e>0?e:(h.warn(`${vC}: 'maxSize' must be a number of bytes above 0 - ignoring it`),null),FC=e=>e===void 0?null:typeof e==`function`?e:(h.warn(`${vC}: 'validate' must be a function returning a message or null - ignoring it`),null),IC=e=>e===void 0?null:typeof e==`function`?e:(h.warn(`${vC}: 'onFiles' must be a function that takes the File objects`),null),LC={styles:OC,props:yC,setup:(e,t,n)=>{n.length>0&&h.warn(`${vC}: takes no content - the component draws the drop zone itself`);let r=!!t.multiple,i=pC(vC,t.accept),a=PC(t.maxSize),o=IC(t.onFiles),s=/* @__PURE__ */ new Map,c=[],l=null,u=!1,d=FC(t.validate),f=ES(vC,{...t,required:void 0,validate:(e,n)=>l||(t.required&&MC(e)?{key:`imp.form.required`}:d?d(e,n):null)},{self:e}),p=e=>hC(i,e)?a!==null&&e.size>a?{key:TC,params:{name:e.name,size:_C(a,N.get())}}:null:{key:EC,params:{name:e.name}},m=e=>{if(u||e.length===0)return;let t=r?e:e.slice(0,1),n=t.map(p);l=n.find(Boolean)??null;let i=t.filter((e,t)=>n[t]===null).map(e=>{let t=AC();return s.set(t,e),{id:t,name:e.name,size:e.size,type:e.type}});f.touch(),i.length>0&&f.commit(r?[...jC(f.read()),...i]:i),f.check()},g=e=>{l=null,f.touch(),f.commit(jC(f.read()).filter(t=>t.id!==e)),f.check(),_.focus()},_=O(`input`,{id:AS,type:`file`,...r?{multiple:!0}:{},...i.length>0?{accept:i.join(`,`)}:{},events:{change:()=>{m([..._.files]),_.value=``},blur:()=>{f.leave(),f.check()}}}),v=()=>[i.length>0?F(SC,{types:i.join(`, `)}):null,a===null?null:F(CC,{size:_C(a,N.get())})].filter(Boolean),y=i.length>0||a!==null?gs({class:`hint`,id:bC}):null,b=B({class:`zone`,events:{dragover:e=>{u||(e.preventDefault(),b.classList.add(`over`))},dragleave:e=>{b.contains(e.relatedTarget)||b.classList.remove(`over`)},drop:e=>{u||(e.preventDefault(),b.classList.remove(`over`),m([...e.dataTransfer?.files??[]]))}}},K(ff,{size:`md`}),O(`label`,{class:`prompt`,for:AS},N.text(()=>F(xC))),y),x=Es({class:`files`}),S=[],ee=()=>{y?.replaceChildren(...v().map(e=>V(e))),x.hidden=S.length===0,x.replaceChildren(...S.map(e=>ds({class:`file`},V({class:`name`},String(e.name??``)),Number.isFinite(e.size)?V({class:`size`},_C(e.size,N.get())):null,J({variant:`ghost`,size:`sm`,square:!0,disabled:u,label:F(wC,{name:e.name}),events:{click:()=>g(e.id)}},K(pf,{size:`sm`})))))},te=()=>{let e=S.map(({id:e})=>s.get(e)).filter(Boolean);if(!NC(e,c)&&(c=e,o))try{Promise.resolve(o([...e])).catch(e=>h.error(`${vC}: 'onFiles' failed`,e))}catch(e){h.error(`${vC}: 'onFiles' failed`,e)}};L(e,t.disabled,e=>{u=!!e,_.disabled=u,ee()}),Ko(e,f.watch(e=>{S=jC(e);let t=new Set(S.map(({id:e})=>e));for(let e of[...s.keys()])t.has(e)||s.delete(e);ee(),te()})),Ko(e,f.watchSubmits(()=>{l=null})),N.watch(e,ee);let ne=B({class:`upload`},_,b,x),re=RS(e,t,_,{presented:ne,describedBy:y?[bC]:[]});return re.attach(f),re.root}},RC=()=>{P(Xu),P(DC)},zC=(...e)=>z(vC,()=>LC,RC)(...e),BC=`form`,VC=[`vertical`,`horizontal`,`inline`],HC=[`initialValues`,`layout`,`gap`,`onSubmit`,`errorMessage`],UC=()=>[{property:`gap`,variable:`gap`,fallback:U(`space-4`)}],WC=()=>`
  .root {
    display: flex;
    flex-direction: column;
    min-inline-size: 0;
    ${W()}
  }

  .inline {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-end;
  }

  ${xb(`.root`,UC())}
`,GC={vertical:{"field-direction":`column`,"field-label-size":`auto`},horizontal:{"field-direction":`row`,"field-label-size":`12rem`},inline:{"field-direction":`column`,"field-label-size":`auto`}},KC=e=>typeof e==`string`?{message:e}:e,qC=e=>{if(e==null)return{};if(typeof e!=`object`||Array.isArray(e))return h.warn(`${BC}: FormError 'fields' must be an object of { [path]: message } - ignoring it`),{};let t={};for(let[n,r]of Object.entries(e)){let e=$x(n);e?h.warn(`${BC}: FormError 'fields' ${e}`):r&&(t[n]=KC(r))}return t};var JC=class extends Error{constructor(e=``,t){super(e,t),this.name=`FormError`,this.fields=qC(t?.fields)}};const YC=e=>e==null?()=>``:typeof e==`function`?e:(h.warn(`${BC}: 'errorMessage' must be a function of the error, like (error) => error.body?.error`),()=>``),XC=(e,t)=>{if(e instanceof JC)return String(e.message??``).split(`
`)[0];try{let n=t(e);return typeof n==`string`?n:``}catch(e){return h.error(`${BC}: the errorMessage function failed`,e),``}},ZC=(e,t)=>{let n={...e??{}};for(let e of t)delete n[e];return n},QC=(e,t,n)=>{let r=Object.keys(n);r.length!==0&&(e.errors.set(e=>({...e??{},...n})),e.serverPaths=r,nw(t))},$C=(e,t,n)=>{e.submitting.set(!1);let r=n instanceof JC?n.fields:{},i=XC(n,e.errorMessage);e.formError.set(i===``&&Object.keys(r).length>0?null:i),n instanceof JC?(QC(e,t,r),h.debug(`${BC}: onSubmit threw a FormError - the form shows its message`,n)):i===``?h.warn(`${BC}: onSubmit failed - the form shows 'imp.form.submitFailed' above its buttons. Throw a FormError, or pass 'errorMessage', to show a message of your own`,n):h.debug(`${BC}: onSubmit failed - the form shows the text of errorMessage`,n)},ew=(e,t,n,r)=>{n&&typeof n.then==`function`?(e.submitting.set(!0),n.then(()=>{e.submitting.set(!1),r()},n=>$C(e,t,n))):(e.submitting.set(!1),r())},tw=e=>{if(e.getAttribute?.(`aria-invalid`)===`true`)return e;for(let t of[...e.shadowRoot?.children??[],...e.children]){let e=tw(t);if(e)return e}return null},nw=e=>{let t=tw(e);(t?.localName===`fieldset`?t.querySelector(`input, select, textarea, button, [tabindex]`):t)?.focus()},rw=(e,t,n,r)=>{let i=Object.keys(t.errors.get()??{});if(i.length>0){h.debug(`${BC}: submit blocked by ${i.length} invalid field(s) - ${i.join(`, `)}`),t.submitting.set(!1),nw(n);return}if(typeof e!=`function`){h.warn(`${BC}: nothing to submit to - pass 'onSubmit' to handle the values`),t.submitting.set(!1);return}let a=t.values.get(),o=r(a),s;try{s=e(t.secrets.mergeInto(a))}catch(e){$C(t,n,e);return}ew(t,n,s,o)},iw=e=>{let t=e.serverPaths;e.serverPaths=[],t.length!==0&&e.errors.set(e=>ZC(e,t))},aw=(e,t,n,{settled:r,whenChecksSettle:i,beginSave:a})=>{t.submitting.get()||(t.formError.set(null),iw(t),t.submits.set(e=>(e??0)+1),r()?rw(e,t,n,a):(t.submitting.set(!0),i().then(()=>rw(e,t,n,a))))},ow=e=>Kv({kind:`error`,title:M([e,N],e=>e||F(`imp.form.submitFailed`)),open:M([e],e=>e!==null)}),sw=(e,t)=>e.length===0?[t]:[...e.slice(0,-1),t,e.at(-1)],cw=e=>{if(e instanceof Node)return e;let t=e?.currentTarget??e?.target;return t instanceof Node?t:null},lw=(e,t,n)=>{let r=cw(t);r===null?h.warn(`${BC}: ${e} takes the click event, or a node inside the form`):r.dispatchEvent(new CustomEvent(`imp:form-action`,{bubbles:!0,composed:!0,cancelable:!0,detail:n}))&&h.warn(`${BC}: ${e} found no form around the node - nothing happened`)},uw=e=>lw(`submitForm`,e,{action:`submit`}),dw=e=>{if(e.key!==`Enter`||e.isComposing||e.shiftKey||e.altKey||e.ctrlKey||e.metaKey)return!1;let t=e.composedPath()[0]?.localName;return t===`input`||t===`select`},fw={styles:WC,props:HC,setup:(e,t,n)=>{let r=I(BC,`layout`,t.layout,VC,`vertical`),i={values:A(e,Uu,t.initialValues??null),errors:A(e,Wu,{}),touched:A(e,Gu,{}),submitting:A(e,Ku,!1),submits:A(e,qu,0),validating:A(e,Ju,{}),dirty:A(e,`imp.form.dirty`,!1),formError:A(e,`imp.form.formError`,null),secrets:cS(e),errorMessage:YC(t.errorMessage),serverPaths:[]},a=i.values.get(),o=0,s=()=>i.dirty.set(!bt(i.values.get(),a)||i.secrets.holdsAny()),c=e=>{let t=o;return()=>{o===t&&(a=e,i.secrets.clear(),s())}};i.values.watch(e,s),Ko(e,i.secrets.subscribe(s));let l=()=>Object.keys(i.validating.get()??{}).length===0,u=[];i.validating.watch(e,()=>{if(l())for(let e of u.splice(0))e()});let d=()=>l()?Promise.resolve():new Promise(e=>u.push(e)),f=()=>aw(t.onSubmit,i,m,{settled:l,whenChecksSettle:d,beginSave:c}),p=e=>{o++,e!==void 0&&(a=e),i.values.set(a),i.secrets.clear(),i.dirty.set(!1),i.serverPaths=[],i.errors.set({}),i.touched.set({}),i.submits.set(0),i.validating.set({}),i.formError.set(null)},m=O(`form`,{class:[`root`,r===`inline`&&`inline`],novalidate:!0,events:{submit:e=>{e.preventDefault(),f()},keydown:e=>{dw(e)&&(e.preventDefault(),f())},[Yu]:e=>{e.stopPropagation(),e.preventDefault(),e.detail.action===`reset`?p(e.detail.values):f()}}},...sw(n,ow(i.formError)));for(let[e,t]of Object.entries(GC[r]))m.style.setProperty(`--imp-${e}`,t);return bb(m,[[`gap`,yb(t.gap,ty(BC,`gap`,4))]])}},pw=(...e)=>z(BC,()=>fw,()=>P(Xu))(...e);[...IS,...PS];const mw=e=>`imp.imageUpload.${e}`;mw(`prompt`),mw(`maxSize`),mw(`tooLarge`),mw(`wrongType`),mw(`unreadable`),mw(`heifUnreadable`),mw(`preparing`),mw(`frame`),mw(`zoom`),mw(`done`),mw(`cancel`),mw(`change`),mw(`adjust`),mw(`remove`),mw(`preview`),[...IS,...PS];const $=e=>`imp.richTextEditor.${e}`;$(`toolbar`),$(`bold`),$(`italic`),$(`strike`),$(`code`),$(`heading1`),$(`heading2`),$(`heading3`),$(`quote`),$(`codeBlock`),$(`bullets`),$(`numbers`),$(`link`),$(`image`),$(`emoji`),$(`alignStart`),$(`alignCenter`),$(`alignEnd`),$(`linkAddress`),$(`linkApply`),$(`linkRemove`),$(`imageAdding`),$(`imageFailed`),$(`heifFailed`),$(`keys`),[...IS,...PS,...FS];const hw=`segmented`,gw=[...IS,...PS,`options`,`multiple`,`size`,`block`,`validate`,`validateAsync`],_w=e=>`color-mix(in oklab, ${U(`color-primary`)} ${e}, ${U(`color-surface`)})`,vw=()=>`
  ${LS()}

  .row {
    display: inline-flex;
    flex-wrap: wrap;
    row-gap: ${U(`space-1`)};
    align-items: stretch;
    align-self: flex-start;
    max-inline-size: 100%;
  }

  .row.block {
    display: flex;
    align-self: stretch;
  }

  .block .segment {
    flex: 1 1 0;
    min-inline-size: 0;
  }

  ${Us(`.row`)}

  .segment {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${U(`space-2`)};
    box-sizing: border-box;
    margin: 0;
    border: ${U(`border-width`)} solid ${U(`color-border`)};
    ${zs()}
    background-color: ${U(`color-surface`)};
    color: ${U(`color-text`)};
    ${W()}
    font-weight: ${U(`font-weight-bold`)};
    line-height: ${U(`line-height-tight`)};
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color ${U(`duration-fast`)} ease-out,
      border-color ${U(`duration-fast`)} ease-out,
      color ${U(`duration-fast`)} ease-out;
  }

  ${ac()}

  .segment:hover:not(:disabled) {
    background-color: ${U(`color-surface-hover`)};
  }

  ${Bs(`.segment`)}

  ${Vs(`.segment[aria-checked='true'], .segment[aria-pressed='true']`)}

  .segment[aria-checked='true'],
  .segment[aria-pressed='true'] {
    border-color: ${U(`color-primary`)};
    background-color: ${_w(`12%`)};
    color: color-mix(in oklab, ${U(`color-primary`)} 62%, ${U(`color-text`)});
  }

  .segment[aria-checked='true']:hover:not(:disabled),
  .segment[aria-pressed='true']:hover:not(:disabled) {
    background-color: ${_w(`20%`)};
  }

  .segment:focus-visible {
    ${G()}
    z-index: 3;
  }

  .segment:disabled {
    cursor: not-allowed;
    opacity: ${U(`disabled-opacity`)};
  }

  .field[aria-invalid='true'] .segment:not([aria-checked='true']):not([aria-pressed='true']) {
    border-color: ${U(`color-danger`)};
  }

  @media (prefers-reduced-motion: reduce) {
    .segment { transition: none }
  }

  ${Ws}

  @media (forced-colors: active) {
    .segment[aria-checked='true'],
    .segment[aria-pressed='true'] {
      background-color: Highlight;
      color: HighlightText;
      forced-color-adjust: none;
    }
  }
`,yw=({self:e,option:t,size:n,multiple:r,choose:i})=>{let a=t.icon!==null,o=O(`button`,{type:`button`,class:[`segment`,`size-${n}`,a&&`square`],...r?{"aria-pressed":`false`}:{role:`radio`,"aria-checked":`false`},events:{click:()=>i(t,{focus:!1})}},a?K(t.icon,{size:`1.25em`}):R(e,t.label));return a&&L(e,t.label,e=>{o.setAttribute(`aria-label`,String(e)),o.title=String(e)}),o},bw={styles:vw,props:gw,setup:(e,t,n)=>{n.length>0&&h.warn(`${hw}: takes no content - pass the choices as 'options'`);let r=!!t.multiple,i=I(hw,`size`,t.size,Ys,`md`),a=nC(hw,t.options??[]),o=ES(hw,t,{self:e,emptyWhen:r?iC:void 0}),s=r?`aria-pressed`:`aria-checked`,c=e=>r?new Set(Array.isArray(e)?e.map(tC):[]):new Set(e===void 0?[]:[tC(e)]),l=!1;function u(e,{focus:t}){o.touch();let n=d.find(t=>t.option===e);if(t&&n.node.focus(),r){let t=c(o.read());t.delete(e.value)||t.add(e.value),o.commit(a.filter(({value:e})=>t.has(e)).map(({raw:e})=>e))}else c(o.read()).has(e.value)||o.commit(e.raw);o.check()}let d=a.map(t=>({option:t,node:yw({self:e,option:t,size:i,multiple:r,choose:u})})),f=({option:e})=>!l&&!e.disabled,p=e=>{let t=c(e),n=d.find(({option:e})=>t.has(e.value)&&!e.disabled)??d.find(({option:e})=>!e.disabled);for(let e of d)e.node.setAttribute(s,String(t.has(e.option.value))),r||(e.node.tabIndex=e===n?0:-1)},m=B({class:[`row`,t.block&&`block`],events:{keydown:e=>{if(r)return;let t=ep(e.key,{orientation:`both`,element:m,edges:!1});if(t===null)return;let n=m.getRootNode().activeElement,i=d.findIndex(({node:e})=>e===n);if(i===-1)return;let a=rp(t,d,i,f);a&&u(a.option,{focus:!0}),e.preventDefault()}}},...d.map(({node:e})=>e));L(e,t.disabled,e=>{l=!!e;for(let{node:e,option:t}of d)e.disabled=l||t.disabled}),Ko(e,o.watch(p));let g=RS(e,t,m,{grouping:!0});return r||g.root.setAttribute(`role`,`radiogroup`),g.attach(o),g.root}},xw=(...e)=>z(hw,()=>bw,()=>P(Xu))(...e);[...IS,...PS,...FS],[...IS,...PS];const Sw=`textField`,Cw=[`text`,`email`,`tel`,`url`,`password`,`search`,`number`,`time`],ww=[...IS,...PS,...FS,`type`,`rows`,`step`,`placeholder`,`readonly`,`autocomplete`,`stepper`],Tw=e=>e==null?``:String(e),Ew=e=>{if(e.trim()===``)return;let t=Number(e);return Number.isNaN(t)?e:t},Dw=e=>typeof e==`string`&&e.trim()!==``?{key:`imp.form.number`}:null,Ow=/^([01]\d|2[0-3]):[0-5]\d$/,kw=(e,t)=>n=>n==null||n===``?null:Ow.test(n)?e!==void 0&&n<e?{key:`imp.form.min`,params:{min:e}}:t!==void 0&&n>t?{key:`imp.form.max`,params:{max:t}}:null:{key:`imp.form.pattern`},Aw=e=>e.rows!==void 0&&(e.type!==void 0&&e.type!==`text`&&h.warn(`${Sw}: 'rows' makes a multi-line field, which has no 'type' - ignoring type '${e.type}'`),!0),jw=(e,t)=>e.step===void 0?{}:t?{step:e.step}:(h.warn(`${Sw}: 'step' applies to type 'number' only - ignoring it`),{}),Mw=(e,t)=>e.stepper?t?!0:(h.warn(`${Sw}: 'stepper' applies to type 'number' only - ignoring it`),!1):!1,Nw=()=>`
  .stepper {
    display: flex;
    align-items: stretch;
  }

  .stepper input {
    flex: 1 1 auto;
    min-inline-size: 0;
    appearance: textfield;
  }

  .stepper input::-webkit-inner-spin-button,
  .stepper input::-webkit-outer-spin-button {
    appearance: none;
    margin: 0;
  }

  ${Us(`.stepper`)}
`,Pw={styles:()=>`${LS()}\n${OS()}\n${Nw()}`,props:ww,setup:(e,t,n)=>{n.length>0&&h.warn(`${Sw}: takes no content - pass 'label' and 'help' instead of children`);let r=Aw(t),i=r?null:I(Sw,`type`,t.type,Cw,`text`),a=i===`number`,o=i===`time`,s=typeof t.validate==`function`?t.validate:null;(a||o)&&t.validate!==void 0&&s===null&&h.warn(`${Sw}: 'validate' must be a function returning a message or null - ignoring it`);let c=o?kw(t.min,t.max):null,l=a?(e,t)=>Dw(e)??s?.(e,t)??null:o?(e,t)=>c(e)??s?.(e,t)??null:t.validate,u=o?{...t,min:void 0,max:void 0,validate:l}:{...t,validate:l},d=ES(Sw,u,{self:e}),f=O(r?`textarea`:`input`,{id:AS,...r?{rows:t.rows}:{type:i},...t.placeholder===void 0?{}:{placeholder:t.placeholder},...t.autocomplete===void 0?{}:{autocomplete:t.autocomplete},...t.readonly?{readonly:!0}:{},...jw(t,a),...o&&t.min!==void 0?{min:t.min}:{},...o&&t.max!==void 0?{max:t.max}:{},events:{input:()=>d.commit(a?Ew(f.value):f.value),blur:()=>{d.leave(),d.check()}}});L(e,t.disabled,e=>{f.disabled=!!e}),Ko(e,d.watch(e=>{let t=Tw(e);f.value!==t&&(f.value=t)}));let p=e=>{e>0?f.stepUp():f.stepDown(),d.touch(),d.commit(Ew(f.value)),d.check()},m=(n,r,i)=>J({square:!0,label:lp(e,r),disabled:t.readonly?!0:t.disabled,events:{click:()=>p(n)}},K(i)),g=Mw(t,a)?B({class:`stepper`},m(-1,`imp.form.stepDown`,Xd),f,m(1,`imp.form.stepUp`,nf)):null,_=RS(e,t,f,{presented:g});return _.attach(d),_.root}},Fw=(...e)=>z(Sw,()=>Pw,()=>P(Xu))(...e);[...IS,...PS],{...Xu};const Iw=/* @__PURE__ */ new Map;let Lw=0;const Rw=(e,t)=>new Promise(n=>{Lw+=1,Iw.set(Lw,n),e.set({...t,id:Lw})}),zw=async(e,{title:t,label:n,value:r=``,confirmLabel:i})=>{let a=await Rw(e,{kind:`name`,title:t,label:n,value:r,confirmLabel:i});return typeof a==`string`&&a.trim()?a.trim():null},Bw=async(e,{title:t,message:n,items:r=[],confirmLabel:i,isDanger:a=!1})=>!!await Rw(e,{kind:`confirm`,title:t,message:n,items:r,confirmLabel:i,isDanger:a}),Vw=(e,t,n)=>Z({horizontalAlign:`end`,gap:2},J({events:{click:()=>t(null)}},`Cancel`),n),Hw=(e,t)=>J({variant:e.isDanger?`danger`:`primary`,events:{click:t}},e.confirmLabel),Uw=(e,t,n)=>(e.focusTarget=Fw({field:`name`,label:t.label,required:!0}),pw({initialValues:{name:t.value},onSubmit:e=>n(e.name)},e.focusTarget,Vw(t,n,Hw(t,uw)))),Ww=(e,t,n)=>(e.focusTarget=Hw(t,()=>n(!0)),Zb({gap:4},Ef(t.message),t.items.length>0?Es(t.items.map(e=>ds(e))):null,Vw(t,n,e.focusTarget))),Gw=T(`rfm-dialog-host`,{setup:e=>{let t=j(e,`rfm.dialog`),n=j(e,`rfm.dialog-open`),r=M([t],e=>e?.title??``),i=e=>{let r=t.get(),i=r?Iw.get(r.id):void 0;i&&(Iw.delete(r.id),n.set(!1),i(e))};return t.watch(e,t=>{t&&(n.set(!0),requestAnimationFrame(()=>e.focusTarget?.focus()))}),n.watch(e,e=>{e||i(null)}),ux({title:r,open:n},t.view(t=>t?t.kind===`name`?Uw(e,t,i):Ww(e,t,i):null))}}),Kw={folder:zd,image:jd,video:Id,audio:Ad,archive:Ed,pdf:Fd,spreadsheet:Pd,document:Fd,text:Fd,code:Od,file:Td},qw=e=>Kw[e]??Td,Jw=e=>e.isBroken?Ld:qw(e.kind),Yw=e=>{let t=e.lastIndexOf(`.`);return t<=0?``:e.slice(t).toLowerCase()},Xw={".js":`javascript`,".mjs":`javascript`,".cjs":`javascript`,".jsx":`jsx`,".ts":`typescript`,".mts":`typescript`,".cts":`typescript`,".tsx":`tsx`,".json":`json`,".jsonc":`json`,".html":`html`,".htm":`html`,".xml":`xml`,".svg":`svg`,".vue":`vue`,".svelte":`svelte`,".css":`css`,".scss":`scss`,".sass":`scss`,".md":`markdown`,".markdown":`markdown`,".yml":`yaml`,".yaml":`yaml`,".sh":`bash`,".bash":`bash`,".zsh":`bash`,".ps1":`powershell`,".py":`python`,".go":`go`,".rs":`rust`,".java":`java`,".kt":`kotlin`,".swift":`swift`,".dart":`dart`,".scala":`scala`,".cs":`csharp`,".c":`c`,".h":`c`,".cpp":`cpp`,".cc":`cpp`,".cxx":`cpp`,".hpp":`cpp`,".php":`php`,".rb":`ruby`,".pl":`perl`,".lua":`lua`,".r":`r`,".ex":`elixir`,".exs":`elixir`,".hs":`haskell`,".clj":`clojure`,".sql":`sql`,".graphql":`graphql`,".tf":`hcl`,".toml":`toml`,".ini":`ini`,".cfg":`ini`,".conf":`ini`,".diff":`diff`,".patch":`diff`},Zw={dockerfile:`dockerfile`,containerfile:`dockerfile`,makefile:`makefile`,".gitignore":`bash`,".env":`bash`},Qw=e=>{let t=e.slice(e.lastIndexOf(`/`)+1).toLowerCase();return Zw[t]??Xw[Yw(t)]??`text`},$w=[`.mp4`,`.avi`,`.mov`,`.mkv`,`.webm`,`.wmv`,`.flv`,`.m4v`],eT=[`.mp3`,`.wav`,`.flac`,`.ogg`,`.aac`,`.m4a`,`.opus`,`.wma`],tT=[`.html`,`.htm`],nT=e=>{let t=Yw(e.name);return e.isImage?`image`:$w.includes(t)?`video`:eT.includes(t)?`audio`:t===`.pdf`?`pdf`:e.isMarkdown?`markdown`:tT.includes(t)?`html`:null},rT=[`.html`,`.htm`,`.svg`,`.pdf`,`.png`,`.jpg`,`.jpeg`,`.gif`,`.webp`,`.avif`,`.bmp`,`.ico`,`.mp4`,`.webm`,`.mp3`,`.aac`,`.opus`],iT=e=>rT.includes(Yw(e.name)),aT={added:{label:`A`,title:`Added / Untracked`,color:`green`},modified:{label:`M`,title:`Modified`,color:`amber`},deleted:{label:`D`,title:`Deleted`,color:`red`},renamed:{label:`R`,title:`Renamed`,color:`blue`}},oT=/^(---|\+\+\+)[ \t]*\r?\n(?:[\s\S]*?\r?\n)?\1[ \t]*(?:\r?\n|$)/,sT=e=>e.replace(oT,``),cT=(e,t,n)=>[...e].map((e,r)=>n.has(t+r)?ps(e):e),lT=e=>{let t=new Set(e.positions??[]),n=e.path.lastIndexOf(`/`),r=n===-1?``:e.path.slice(0,n+1),i=e.path.slice(n+1);return[V({class:`name`},cT(i,n+1,t)),r?V({class:`directory`},cT(r,0,t)):null]},uT=T(`rfm-search-result`,{styles:`
    :host { display: block }
    .row { display: flex; align-items: center; gap: var(--imp-space-1, 4px) }
    .open {
      flex: 1;
      min-inline-size: 0;
      display: flex;
      align-items: center;
      gap: var(--imp-space-2, 8px);
      padding: var(--imp-space-2, 8px);
      border: var(--imp-border-width, 1px) solid transparent;
      border-radius: var(--imp-radius-item, 6px);
      background: none;
      color: var(--imp-color-text, #0f172a);
      font: inherit;
      text-align: start;
      cursor: pointer;
    }
    .open:focus-visible {
      outline: var(--imp-focus-ring-width, 2px) solid var(--imp-color-primary, #2563eb);
      outline-offset: 1px;
    }
    .row.active .open { background: var(--imp-color-surface-hover, #f1f5f9) }
    .label { display: flex; flex-direction: column; min-inline-size: 0 }
    .name, .directory { overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
    .directory { color: var(--imp-color-secondary, #64748b); font-size: var(--imp-font-size-sm, 0.875rem) }
    mark {
      background: color-mix(in srgb, var(--imp-color-warning, #d97706) 30%, transparent);
      color: inherit;
      border-radius: 2px;
    }
    @media (forced-colors: active) {
      .row.active .open { border-color: Highlight }
    }
  `,setup:(e,{result:t,isActive:n,onOpen:r,onHover:i})=>{let a=B({class:{row:!0,active:n},role:`listitem`,events:{pointermove:i}},$o({class:`open`,type:`button`,tabindex:`-1`,title:t.path,events:{click:e=>r(t,e.shiftKey)}},K(qw(t.kind)),V({class:`label`},lT(t))),J({variant:`ghost`,size:`sm`,square:!0,label:`Reveal ${t.path} in the file explorer`,events:{click:()=>r(t,!0)}},K(Hd,{size:`sm`})));return n&&requestAnimationFrame(()=>a.scrollIntoView({block:`nearest`})),a}}),dT=T(`rfm-search-results`,{styles:`
    :host { display: block }
    .results {
      max-block-size: min(60dvb, 28rem);
      overflow: auto;
    }
    .hints {
      display: flex;
      flex-wrap: wrap;
      gap: var(--imp-space-3, 12px);
      margin-block-start: var(--imp-space-3, 12px);
      color: var(--imp-color-secondary, #64748b);
      font-family: var(--imp-font-family, system-ui, sans-serif);
      font-size: var(--imp-font-size-sm, 0.875rem);
    }
    kbd {
      padding: 0 var(--imp-space-1, 4px);
      border: var(--imp-border-width, 1px) solid var(--imp-color-border, #cbd5e1);
      border-radius: var(--imp-radius-item, 6px);
      font-family: var(--imp-font-family-mono, monospace);
    }
  `,setup:(e,{rows:t,onOpen:n,onHover:r})=>B(B({class:`results`,role:`list`,"aria-label":`Matching files`},t.each(({result:e,isActive:t,position:i})=>uT({result:e,isActive:t,onOpen:n,onHover:()=>r(i)}),({result:e,isActive:t,position:n})=>`${n}:${e.path}:${t}`)),B({class:`hints`},V(ls(`↑`),ls(`↓`),` move`),V(ls(`Enter`),` open`),V(ls(`Shift`),`+`,ls(`Enter`),` reveal in files`),V(ls(`Esc`),` close`)))}),fT=e=>`${e.indexedCount.toLocaleString()} entries${e.truncated?` (partial index)`:``}`,pT=(e,t)=>t?e.results.length===0?`No matches`:e.total>e.results.length?`Top ${e.results.length} of ${e.total.toLocaleString()} matches`:`${e.total} ${e.total===1?`match`:`matches`}`:fT(e),mT=(e,t,n,r)=>{let i=e.path===`/`,a=i?e.query.right:void 0;return Ax(i&&a!==void 0&&t===`right`?{path:e.query.path,right:n,reveal:r}:{path:n,right:a,reveal:r})},hT=T(`rfm-search-palette`,{styles:`:host { --imp-dialog-inline-size: 44rem }`,setup:e=>{let t=To(e,`rfm.api`),n=j(e,`rfm.search-open`),r=j(e,`rfm.active-pane`),i=A(e,`rfm.search-query`,``),a=A(e,`rfm.search-results`,[]),o=A(e,`rfm.search-active`,0),s=A(e,`rfm.search-status`,``),c=Iu(),l=async()=>{e.controller?.abort();let n=new AbortController;e.controller=n;let r=i.get().trim();try{let e=await t.get(`/api/search`,{query:{q:r},signal:n.signal});if(n.signal.aborted)return;a.set(e.results??[]),o.set(0),s.set(pT(e,r))}catch(e){n.signal.aborted||s.set(Ux(e))}},u=()=>{clearTimeout(e.searchTimer),e.searchTimer=setTimeout(l,70)},d=(e,t)=>{n.set(!1),t?q(mT(c.get(),r.get(),wx(e.path),e.path)):e.isDirectory?q(mT(c.get(),r.get(),e.path)):q(jx(e.path))},f=e=>{let t=a.get().length;t!==0&&o.set(n=>Math.min(Math.max(n+e,0),t-1))},p=Fw({value:i,type:`search`,ariaLabel:`Search files`,placeholder:`Search files and folders by name or path`,autocomplete:`off`});p.addEventListener(`keydown`,e=>{if(e.key===`ArrowDown`||e.key===`ArrowUp`)e.preventDefault(),f(e.key===`ArrowDown`?1:-1);else if(e.key===`Enter`){e.preventDefault();let t=a.get()[o.get()];t&&d(t,e.shiftKey)}}),i.watch(e,u),n.watch(e,t=>{t?(l(),requestAnimationFrame(()=>p.focus())):e.controller?.abort()});let m=M([a,o],(e,t)=>e.map((e,n)=>({result:e,position:n,isActive:n===t})));return ux({title:`Search files`,open:n},Zb({gap:3},p,Ef({size:`sm`,tone:`secondary`},s.text()),dT({rows:m,onOpen:d,onHover:e=>{e!==o.get()&&o.set(e)}})))},onRemove:e=>{clearTimeout(e.searchTimer),e.controller?.abort()}}),gT=T(`rfm-search-trigger`,{setup:e=>{let t=j(e,`rfm.search-open`);return xf({text:`Search files (Ctrl+P)`},J({variant:`ghost`,size:`sm`,square:!0,label:`Search files`,events:{click:()=>t.set(!0)}},K(sf)))}}),_T=(e,t)=>{try{return globalThis.localStorage.getItem(e)??t}catch{return t}},vT=(e,t)=>{try{globalThis.localStorage.setItem(e,t)}catch{return}},yT=`rfm-sort`,bT={key:`name`,direction:`ascending`},xT=[`name`,`size`,`modified`],ST=()=>{let[e,t]=_T(yT,``).split(`:`);return xT.includes(e)&&[`ascending`,`descending`].includes(t)?{key:e,direction:t}:bT},CT=e=>e.modifiedAt?new Date(e.modifiedAt).getTime():0,wT={name:(e,t)=>e.name.localeCompare(t.name,void 0,{numeric:!0,sensitivity:`base`}),size:(e,t)=>(e.size??-1)-(t.size??-1),modified:(e,t)=>CT(e)-CT(t)},TT=e=>(t,n)=>{if(t.isDirectory!==n.isDirectory)return t.isDirectory?-1:1;let r=wT[e.key](t,n)||t.name.localeCompare(n.name);return e.direction===`descending`?-r:r},ET=(e,t)=>{let n=t.trim().toLowerCase();return n?e.filter(e=>e.name.toLowerCase().includes(n)):e},DT=(e,{side:t,path:n,api:r,onNavigate:i})=>{let a=`rfm.pane-${t}`,o=A(e,`${a}.listing`),s=A(e,`${a}.loading`,!1),c=A(e,`${a}.filter`,``),l=A(e,`${a}.selected`,[]),u=A(e,`${a}.cursor`,null),d=A(e,`${a}.sort`,ST()),f=M([o,c,d],(e,t,n)=>[...ET(e?.entries??[],t)].sort(TT(n))),p=[],m=n.get(),h=!1,g=null,_=null,v=0,y=e=>f.get().find(t=>t.path===e),b=()=>{if(_===null)return;let e=_;_=null;let t=y(e);t?(l.set([t.path]),u.set(t.path),g=t.path):K_({kind:`warning`,title:`Could not find ${e}`})},x=e=>{let t=new Set(f.get().map(e=>e.path));return e.filter(e=>t.has(e))},S=async()=>{let e=n.get();if(e===null)return;v+=1;let t=v;s.set(!0);try{let n=await r.get(`/api/entries`,{query:{path:e}});if(t!==v)return;o.set({path:n.path,entries:n.entries,totalSize:n.totalSize}),l.set(x),u.set(e=>e!==null&&y(e)?e:null),b()}catch(n){if(t!==v)return;if(n.body?.isFile){q(jx(n.body.path));return}o.set({path:e,entries:[],totalSize:0,error:Ux(n)})}finally{t===v&&s.set(!1)}};n.watch(e,e=>{e!==m&&(!h&&m!==null&&e!==null&&p.push(m),h=!1,m=e,c.set(``),l.set([]),u.set(null),g=null,S())}),c.watch(e,()=>l.set(x)),d.watch(e,e=>vT(yT,`${e.key}:${e.direction}`));let ee=e=>i(e),te=()=>{p.length!==0&&(h=!0,i(p.pop()))},ne=()=>{let e=n.get();e&&e!==`.`&&ee(wx(e))},re=e=>{e&&(e.isDirectory&&!e.isDeleted?ee(e.path):q(Lx(e)))},ie=e=>{_=e,!s.get()&&o.get()?.path===wx(e)&&b()},ae=()=>u.get()===null?null:y(u.get())??null,oe=()=>{let e=new Set(l.get());return f.get().filter(t=>e.has(t.path))},se=()=>{let e=oe();if(e.length>0)return e;let t=ae();return t?[t]:[]},ce=()=>ae()??oe()[0]??null,le=(e,t)=>{let n=f.get().map(e=>e.path),r=n.indexOf(e),i=n.indexOf(t);r!==-1&&i!==-1&&l.set(n.slice(Math.min(r,i),Math.max(r,i)+1))},ue=(e,t)=>{let n=f.get();if(n.length===0)return;let r=n.findIndex(e=>e.path===u.get()),i=n[r===-1?e>0?0:n.length-1:Math.min(Math.max(r+e,0),n.length-1)].path;t?(g=g??u.get()??i,le(g,i)):g=null,u.set(i)},de=e=>{l.set(t=>t.includes(e)?t.filter(t=>t!==e):[...t,e]),g=e};return S(),{side:t,path:n,listing:o,loading:s,filter:c,sort:d,selected:l,cursor:u,visible:f,load:S,navigateTo:ee,back:te,up:ne,open:re,reveal:ie,cursorEntry:ae,focusedOrFirstSelected:ce,selectedEntries:oe,targets:se,moveCursor:ue,toggleCursorSelection:()=>{u.get()!==null&&de(u.get())},pick:(e,{isToggling:t=!1,isExtending:n=!1}={})=>{n&&g!==null?le(g,e):t?de(e):g=e,u.set(e)},selectAll:()=>l.set(f.get().map(e=>e.path)),clearSelection:()=>l.set([]),setSort:({key:e,direction:t})=>d.set(t===`none`||!xT.includes(e)?bT:{key:e,direction:t})}},OT=e=>M([Iu()],t=>t.path===String(e)?t.query:null),kT=()=>{try{return Intl.getCanonicalLocales(N.get())[0]}catch{return}},AT=(e,t)=>{let n=k(`imp.${e}.order`,[]),r=/* @__PURE__ */ new Map,i=/* @__PURE__ */ new Set,a=n=>{i.has(n)||(i.add(n),h.warn(`${e}: two rows share the ${t} '${String(n)}' - showing the first one only, every row needs a unique key`))};return{take:n=>{!Array.isArray(n)&&n!=null&&h.warn(`${e}: the rows must be an array of objects - showing none`);let i=r;return r=/* @__PURE__ */ new Map,(Array.isArray(n)?n:[]).filter((n,o)=>{let s=n?.[t];if(s==null)return h.warn(`${e}: row ${o} has no '${t}' - every row needs a unique key`),!1;if(r.has(s))return a(s),!1;let c=i.get(s),l=c===void 0?0:c.version+(c.row===n?0:1);return r.set(s,{row:n,version:l}),!0})},rowOf:e=>r.get(e).row,show:e=>n.set(e.map(e=>({key:e[t],version:r.get(e[t]).version}))),region:e=>n.each(({key:t})=>e(t,r.get(t).row),e=>e.key)}},jT=`imp.loadMore.loading`,MT=`imp.loadMore.failed`,NT=`imp.loadMore.retry`,PT=[`hasMore`,`onLoadMore`],FT={[jT]:`Loading more`,[MT]:`Could not load more`,[NT]:`Try again`},IT=()=>`
  .load-more {
    position: sticky;
    inset-inline-start: 0;
    box-sizing: border-box;
    inline-size: 100%;
  }

  .load-more-sentinel {
    position: absolute;
    inset-block-end: 0;
    inset-inline-start: 0;
    inline-size: 100%;
    block-size: 12rem;
    pointer-events: none;
  }

  .load-more-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${U(`space-2`)};
    padding-block: ${U(`space-3`)};
    padding-inline: ${U(`space-3`)};
    color: ${U(`color-secondary`)};
    font-size: ${U(`font-size-sm`)};
    line-height: ${U(`line-height-tight`)};
  }

  .load-more-row[hidden] {
    display: none;
  }

  .load-more-row .spinner {
    flex: none;
  }

  ${Vu()}
`,LT=(e,t,n,r)=>{if(n.onLoadMore===void 0)return n.hasMore!==void 0&&h.warn(`${t}: 'hasMore' needs an 'onLoadMore' function - ignoring it`),null;if(typeof n.onLoadMore!=`function`)return h.warn(`${t}: 'onLoadMore' must be a function that loads the next rows`),null;n.hasMore===void 0&&h.warn(`${t}: 'onLoadMore' needs 'hasMore' - pass a state that says more rows exist`);let i=B({class:`load-more-sentinel`,"aria-hidden":`true`}),a=B({class:`load-more-row`,role:`status`,hidden:!0},Hu(),V(N.text(()=>F(jT)))),o=B({class:`load-more-row`,role:`alert`,hidden:!0},V(N.text(()=>F(MT))),J({size:`sm`,events:{click:()=>b()}},N.text(()=>F(NT)))),s=B({class:`load-more`},i,a,o),c=!1,l=!1,u=!1,d=!1,f=!1,p=()=>{a.hidden=!u,o.hidden=!d,r.setAttribute(`aria-busy`,String(u))},m=new IntersectionObserver(e=>{l=e.at(-1)?.isIntersecting===!0,y()}),g=()=>{f||(l=!1,m.unobserve(i),m.observe(i))},_=e=>{u=!1,d=e!==void 0,d&&h.error(`${t}: 'onLoadMore' rejected - showing the retry button`,e),p(),d||g()},v=()=>{u=!0,d=!1,p(),Promise.resolve().then(()=>n.onLoadMore()).then(()=>_(),e=>_(e??/* @__PURE__ */ Error(`onLoadMore rejected`)))};function y(){!f&&c&&l&&!u&&!d&&v()}function b(){u||v()}return L(e,n.hasMore,e=>{c=!!e,c||(d=!1),p(),c&&!u&&g()}),Ko(e,()=>{f=!0,m.disconnect()}),p(),s},RT=`list`,zT=[`label`,`items`,`leading`,`actions`,...PT,`events`],BT=`select`,VT=()=>`
  ${Ks}

  :host {
    display: block;
    inline-size: 100%;
    min-inline-size: 0;
  }

  .root {
    container-type: inline-size;
    ${W()}
    color: ${U(`color-text`)};
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .row {
    display: flex;
    align-items: center;
    gap: ${U(`space-3`)};
    padding-block: ${U(`space-3`)};
    border-block-end: ${U(`border-width`)} solid ${U(`color-border`)};
    content-visibility: auto;
    contain-intrinsic-block-size: auto 3.5rem;
  }

  .row:last-child {
    border-block-end: none;
  }

  ${Lp()}

  .avatar {
    --avatar-size: 2.5rem;
  }

  .visual {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    min-inline-size: 2.5rem;
    color: ${U(`color-secondary`)};
  }

  .leading {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
  }

  .words {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    gap: ${U(`space-1`)};
    min-inline-size: 0;
  }

  .title {
    max-inline-size: 100%;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: ${U(`radius-item`)};
    background: none;
    color: ${U(`color-text`)};
    font: inherit;
    font-size: ${U(`font-size-md`)};
    font-weight: ${U(`font-weight-bold`)};
    line-height: ${U(`line-height-tight`)};
    text-align: start;
    text-decoration: none;
    overflow-wrap: anywhere;
  }

  a.title,
  button.title {
    cursor: pointer;
  }

  a.title:hover,
  button.title:hover {
    color: ${U(`color-primary`)};
    text-decoration: underline;
  }

  .title:focus-visible {${G()}}

  .description {
    margin: 0;
    color: ${U(`color-secondary`)};
    font-size: ${U(`font-size-sm`)};
    line-height: ${U(`line-height-normal`)};
    overflow-wrap: anywhere;
  }

  .tag {
    display: inline-flex;
    flex: none;
  }

  .actions {
    display: flex;
    flex: none;
    align-items: center;
    gap: ${U(`space-2`)};
  }

  ${IT()}

  @container (inline-size <= 28rem) {
    .row {
      flex-wrap: wrap;
    }

    .actions {
      flex-basis: 100%;
      justify-content: flex-end;
    }
  }

  @media (forced-colors: active) {
    a.title:hover,
    button.title:hover {
      color: LinkText;
    }
  }
`,HT=e=>typeof e.nodeType==`number`?e:K(e),UT=e=>e!=null,WT=e=>typeof e.href==`string`&&e.href!==``&&kf(e.href),GT=(e,t)=>UT(t.picture)||UT(t.name)?V({class:`visual`},Ip(e,{name:t.name,picture:t.picture})):UT(t.icon)?V({class:`visual`},HT(t.icon)):null,KT={styles:VT,props:zT,setup:(e,t,n)=>{n.length>0&&h.warn(`${RT}: takes no content - pass every row in 'items'`),t.label===void 0&&h.warn(`${RT}: pass a 'label' - it names the list for a screen reader`);let r=e=>(t[e]!==void 0&&typeof t[e]!=`function`&&h.warn(`${RT}: '${e}' must be a function (item) => content - ignoring it`),typeof t[e]==`function`?t[e]:null),i=r(`leading`),a=r(`actions`),o=typeof t.events?.[BT]==`function`||Array.isArray(t.events?.[BT]),s=AT(RT,`id`),c=!1,l=0,u=e=>{m.dispatchEvent(new CustomEvent(BT,{bubbles:!0,composed:!0,cancelable:!0,detail:{id:e.id,item:e}}))&&WT(e)&&Lf(e.href)},d=e=>{let t=String(e.title??``),n=Mf(RT,e.href);return n===null?o?O(`button`,{class:`title`,type:`button`,events:{click:()=>u(e)}},t):V({class:`title`},t):Rf(Zo({class:`title`,href:Ut(n)},t),()=>u(e))},f=Es({class:`rows`,role:`list`},s.region((t,n)=>ds({class:`row`},i===null?GT(e,n):V({class:`leading`},i(n)),B({class:`words`},d(n),UT(n.description)?gs({class:`description`},String(n.description)):null),yy(e,gy(RT,n.tag)),a===null?null:B({class:`actions`},a(n))))),p=B({class:`empty`,hidden:!0}),m=B({class:`root`,events:cd(t.events,[BT])},f,p),g=()=>{let e=l===0&&!c;p.hidden=!e,e&&p.childNodes.length===0&&p.append(Rc())};t.label!==void 0&&L(e,t.label,e=>f.setAttribute(`aria-label`,String(e)));let _=LT(e,RT,t,f);return _!==null&&(f.after(_),L(e,t.hasMore,e=>{c=!!e,g()})),L(e,t.items,e=>{let t=s.take(e);l=t.length,s.show(t),g()}),m}},qT=(...e)=>z(RT,()=>KT,()=>P(FT))(...e),JT=e=>`color-mix(in oklab, ${U(`color-primary`)} 10%, ${e})`,YT=()=>`
  ${Ks}

  :host {
    display: block;
    inline-size: 100%;
    min-inline-size: 0;
  }

  .root {
    container-type: inline-size;
    ${W()}
    color: ${U(`color-text`)};
    font-size: ${U(`font-size-sm`)};
    line-height: ${U(`line-height-tight`)};
  }

  .region {
    position: relative;
    overflow: auto;
    max-block-size: var(--imp-table-max-block-size, none);
    border: ${U(`border-width`)} solid ${U(`color-border`)};
    border-radius: ${U(`radius-item`)};
    background-color: ${U(`color-surface`)};
    ${Ns()}
  }

  .region:focus-visible {${G()}}

  table {
    inline-size: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }

  caption {${Gs}}

  th,
  td {
    box-sizing: border-box;
    padding-block: ${U(`space-2`)};
    padding-inline: ${U(`space-3`)};
    border-block-end: ${U(`border-width`)} solid ${U(`color-border`)};
    text-align: start;
    vertical-align: middle;
  }

  th {
    position: sticky;
    inset-block-start: 0;
    z-index: 1;
    background-color: ${U(`color-surface-sunken`)};
    color: ${U(`color-secondary`)};
    font-weight: ${U(`font-weight-bold`)};
    white-space: nowrap;
  }

  .rows tr:last-child td {
    border-block-end: none;
  }

  .align-center { text-align: center }

  .align-end { text-align: end }

  .select-cell {
    inline-size: 1%;
    padding-inline-end: 0;
  }

  .select-text {${Gs}}

  .sort {
    display: inline-flex;
    align-items: center;
    gap: ${U(`space-1`)};
    margin: 0;
    padding: 0;
    border: none;
    border-radius: ${U(`radius-item`)};
    background: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }

  .sort:hover,
  th[aria-sort] .sort {
    color: ${U(`color-text`)};
  }

  .sort:focus-visible {${G()}}

  .sort-icon {
    flex: none;
    inline-size: 1rem;
    block-size: 1rem;
    opacity: 0.35;
    transition:
      rotate ${U(`duration-fast`)} ease-out,
      opacity ${U(`duration-fast`)} ease-out;
  }

  .sort:hover .sort-icon,
  .sort:focus-visible .sort-icon {
    opacity: 0.7;
  }

  th[aria-sort] .sort-icon {
    opacity: 1;
  }

  th[aria-sort='ascending'] .sort-icon {
    rotate: 180deg;
  }

  .selectable .rows tr {
    cursor: pointer;
  }

  .selectable .rows tr:hover {
    background-color: ${U(`color-surface-hover`)};
  }

  .rows tr[aria-selected='true'] {
    background-color: ${JT(`transparent`)};
  }

  .empty td {
    border-block-end: none;
  }

  ${kS()}

  .check {
    align-items: center;
  }

  ${IT()}

  @container (inline-size <= 30rem) {
    .region {
      border: none;
      border-radius: 0;
      background-color: transparent;
    }

    table,
    thead,
    tbody,
    tr,
    th,
    td {
      display: block;
    }

    thead tr {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: ${U(`space-2`)} ${U(`space-4`)};
      padding-block-end: ${U(`space-3`)};
    }

    th {
      position: static;
      padding: 0;
      border: none;
      background-color: transparent;
    }

    th.plain {${Gs}}

    .select-cell {
      inline-size: auto;
    }

    .select-all .select-text {
      position: static;
      inline-size: auto;
      block-size: auto;
      margin: 0;
      overflow: visible;
      clip-path: none;
    }

    .rows {
      display: flex;
      flex-direction: column;
      gap: ${U(`space-2`)};
    }

    .rows tr {
      padding-block: ${U(`space-2`)};
      padding-inline: ${U(`space-3`)};
      border: ${U(`border-width`)} solid ${U(`color-border`)};
      border-radius: ${U(`radius-item`)};
      background-color: ${U(`color-surface`)};
      content-visibility: auto;
      contain-intrinsic-block-size: auto 6rem;
    }

    .rows tr[aria-selected='true'] {
      border-color: ${U(`color-primary`)};
      background-color: ${JT(U(`color-surface`))};
    }

    .rows td {
      display: grid;
      grid-template-columns: minmax(5rem, 35%) minmax(0, 1fr);
      gap: ${U(`space-3`)};
      padding-block: ${U(`space-1`)};
      padding-inline: 0;
      border: none;
      text-align: start;
    }

    .rows td::before {
      content: attr(data-label);
      color: ${U(`color-secondary`)};
      font-weight: ${U(`font-weight-bold`)};
    }

    .rows td.select-cell {
      display: block;
    }

    .rows td.select-cell::before {
      content: none;
    }

    .empty td {
      padding: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sort-icon { transition: none }
  }

  @media (forced-colors: active) {
    .rows tr[aria-selected='true'] {
      outline: ${U(`border-width`)} solid Highlight;
      outline-offset: calc(-1 * ${U(`border-width`)});
    }
  }
`,XT=`ascending`,ZT=`descending`,QT=`none`,$T={[QT]:XT,[XT]:ZT,[ZT]:QT},eE=e=>$T[e]??XT,tE=e=>e===XT||e===ZT,nE=e=>e instanceof Date?e.getTime():e,rE=e=>e==null||e===``||Number.isNaN(nE(e)),iE=(e,t)=>typeof e.sortValue==`function`?e.sortValue(t):t[e.key],aE=e=>(t,n)=>{let[r,i]=[nE(t),nE(n)];return typeof r==`number`&&typeof i==`number`?r-i:e.compare(String(t),String(n))},oE=(e,t,n,r)=>{if(!t||!tE(n))return e;let i=aE(new Intl.Collator(r,{numeric:!0})),a=n===ZT?-1:1;return e.map(e=>({row:e,value:iE(t,e)})).toSorted((e,t)=>rE(e.value)||rE(t.value)?Number(rE(e.value))-Number(rE(t.value)):a*i(e.value,t.value)).map(({row:e})=>e)},sE=(e,t)=>!rE(e)&&String(e).toLowerCase().includes(t),cE=(e,t,n)=>n===``?e:e.filter(e=>t.some(t=>sE(e[t.key],n))),lE=`table`,uE=[`none`,`single`,`multiple`],dE=[`label`,`columns`,`rows`,`rowKey`,`filter`,`selection`,`selected`,...PT,`events`],fE=`rowSelect`,pE=`sort`,mE=`imp.table.selectRow`,hE=`imp.table.selectAll`,gE=`imp.table.selection`,_E=[`a`,`button`,`input`,`select`,`textarea`,`label`,`summary`],vE={[mE]:`Select row {row}`,[hE]:`Select all rows`,[gE]:`Selection`,...FT},yE=e=>Array.isArray(e)?e.flatMap(e=>!e||typeof e!=`object`||typeof e.key!=`string`?(h.warn(`${lE}: a column is not an object with a string 'key' - skipping it`),[]):[{key:e.key,label:e.label??e.key,align:I(lE,`align`,e.align,Zs,`start`),sortable:!!e.sortable,sortValue:e.sortValue,render:typeof e.render==`function`?e.render:null}]):(h.warn(`${lE}: 'columns' must be an array of { key, label } - showing none`),[]),bE=e=>Array.isArray(e)?e:[],xE=e=>D(e)?e.get():e,SE=e=>e==null?``:String(e),CE=e=>_E.includes(e.localName)||e.getAttribute?.(`role`)===`button`,wE={styles:YT,props:dE,setup:(e,t,n)=>{n.length>0&&h.warn(`${lE}: takes no content - pass the data as 'columns' and 'rows'`),t.label===void 0&&h.warn(`${lE}: pass a 'label' - it names the table for a screen reader`);let r=I(lE,`selection`,t.selection,uE,`none`);r===`none`&&t.selected!==void 0&&h.warn(`${lE}: 'selected' needs a 'selection' of 'single' or 'multiple'`);let i=r!==`none`,a=yE(t.columns),o=typeof t.rowKey==`string`?t.rowKey:`id`,s=AT(lE,o),c=/* @__PURE__ */ new WeakMap,l=[],u=[],d=``,f={key:null,direction:`none`,clientSide:!0},p=[],m=!1,g=null,_=e=>a.length===0?``:SE(e[a[0].key]),v=e=>F(mE,{row:_(e)}),y=r===`multiple`?O(`input`,{type:`checkbox`,events:{change:()=>pe()}}):null,b=()=>Cs({class:[`select-cell`,y===null?`plain`:null],scope:`col`,role:`columnheader`},y===null?V({class:`select-text`},N.text(()=>F(gE))):us({class:`check select-all`},y,V({class:`select-text`},N.text(()=>F(hE))))),x=a.map(t=>{let n=V(R(e,t.label));return Cs({class:[`align-${t.align}`,t.sortable?null:`plain`],scope:`col`,role:`columnheader`},t.sortable?O(`button`,{class:`sort`,type:`button`,events:{click:()=>me(t)}},n,_p(`sort-icon`)):n)}),S=()=>{for(let[e,t]of a.entries())f.key===t.key?x[e].setAttribute(`aria-sort`,f.direction):x[e].removeAttribute(`aria-sort`)},ee=(e,t)=>{let n={type:r===`single`?`radio`:`checkbox`,"aria-label":v(t),events:{change:t=>fe(e,t.target.checked)}};return r===`single`&&(n.name=`imp-table-selected`),O(`input`,n)},te=xs({class:`rows`,role:`rowgroup`},s.region((e,t)=>{let n=i?ee(e,t):null,r=Ts({class:`row`,role:`row`},n===null?null:H({class:`select-cell`,role:`cell`},us({class:`check`},n)),...a.map(e=>H({class:`align-${e.align}`,role:`cell`,"data-label":SE(xE(e.label))},B({class:`value`},e.render===null?SE(t[e.key]):e.render(t)))));return c.set(r,{key:e,row:t,picker:n}),se(r),r})),ne=H({role:`cell`,colspan:String(a.length+ +!!i)}),re=xs({class:`empty`,role:`rowgroup`,hidden:!0},Ts({role:`row`},ne)),ie=B({class:`region`,role:`region`,tabindex:`0`},bs({role:`table`},es(R(e,t.label)),ws({role:`rowgroup`},Ts({role:`row`},i?b():null,...x)),te,re)),ae=B({class:[`root`,i?`selectable`:null],events:cd(t.events,[fE,pE])},ie),oe=()=>[...te.children].filter(e=>c.has(e));function se(e){if(!i)return;let{key:t,picker:n}=c.get(e),r=p.includes(t);e.setAttribute(`aria-selected`,String(r)),n.checked=r}let ce=()=>{for(let e of oe())se(e);if(y===null)return;let e=u.filter(e=>p.includes(e[o])).length;y.checked=u.length>0&&e===u.length,y.indeterminate=e>0&&e<u.length,y.disabled=u.length===0},le=()=>{let e=u.length===0&&!m;if(re.hidden=!e,!e)return;let t=d===``?`empty`:`noResults`;t!==g&&(g=t,ne.replaceChildren(Rc({variant:t})))},ue=()=>{let e=f.clientSide?a.find(({key:e})=>e===f.key):null;u=oE(cE(l,a,d),e,f.direction,N.get()),s.show(u),le(),ce()},de=e=>{l=s.take(e),ue()},C=e=>{p=e,ce(),D(t.selected)&&(typeof t.selected.set==`function`?t.selected.set(e):h.warn(`${lE}: 'selected' is a read-only state - pass a writable state so ${lE} can write it back`))};function fe(e,t){if(p.includes(e)===t)return ce();let n=r===`single`?[]:p.filter(t=>t!==e);C(t?[...n,e]:n),ae.dispatchEvent(new CustomEvent(fE,{bubbles:!0,composed:!0,detail:{key:e,row:s.rowOf(e),selected:t}}))}function pe(){let e=u.map(e=>e[o]),t=p.filter(t=>!e.includes(t));C(y.checked?[...t,...e]:t)}function me(e){let t=eE(f.key===e.key?f.direction:`none`),n=ae.dispatchEvent(new CustomEvent(pE,{bubbles:!0,composed:!0,cancelable:!0,detail:{key:e.key,direction:t}}));f={key:tE(t)?e.key:null,direction:t,clientSide:n},S(),ue()}te.addEventListener(`click`,e=>{if(!i)return;let t=e.composedPath(),n=t.find(e=>c.has(e));if(!n||t.slice(0,t.indexOf(n)).some(CE))return;let{key:a}=c.get(n);fe(a,r===`single`||!p.includes(a))}),t.label!==void 0&&L(e,t.label,e=>ie.setAttribute(`aria-label`,SE(e)));for(let[t,n]of a.entries())D(n.label)&&n.label.watch(e,e=>{for(let n of oe())n.children[t+ +!!i].setAttribute(`data-label`,SE(e))});i&&(L(e,t.selected,e=>{p=bE(e),ce()}),N.watch(e,()=>{for(let e of oe()){let{row:t,picker:n}=c.get(e);n.setAttribute(`aria-label`,v(t))}})),L(e,t.filter,e=>{d=SE(e).trim().toLowerCase(),ue()});let he=LT(e,lE,t,ie);return he!==null&&(ie.append(he),L(e,t.hasMore,e=>{m=!!e,le()})),L(e,t.rows,de),ae}},TE=(...e)=>z(lE,()=>wE,()=>P(vE))(...e),EE=`timeline`,DE=[`label`,`items`,`actions`,...PT,`events`],OE=`select`,kE=`neutral`,AE=/^\d{4}-\d{2}-\d{2}$/;let jE=null;const ME=()=>jE??=[kE,...mi()],NE=e=>U(e===kE?`color-secondary`:`color-${e}`),PE=()=>ME().map(e=>`  .color-${e} { --timeline-color: ${NE(e)} }`).join(`
`),FE=()=>`
  ${Ks}

  :host {
    display: block;
    min-inline-size: 0;
  }

  .root {
    ${W()}
    color: ${U(`color-text`)};
  }

  ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .event {
    --timeline-marker: 1.75rem;
    position: relative;
    display: grid;
    grid-template-columns: var(--timeline-marker) minmax(0, 1fr) auto;
    column-gap: ${U(`space-3`)};
    padding-block-end: ${U(`space-4`)};
  }

  .event:last-child {
    padding-block-end: 0;
  }

  .event::before {
    position: absolute;
    inset-block: var(--timeline-marker) 0;
    inset-inline-start: calc(var(--timeline-marker) / 2 - ${U(`border-width`)} / 2);
    inline-size: ${U(`border-width`)};
    background-color: ${U(`color-border`)};
    content: '';
  }

  .event:last-child::before {
    display: none;
  }

${PE()}

  .marker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    inline-size: var(--timeline-marker);
    block-size: var(--timeline-marker);
    border: ${U(`border-width`)} solid var(--timeline-color);
    border-radius: 50%;
    background-color: color-mix(in oklab, var(--timeline-color) 14%, ${U(`color-surface`)});
    color: var(--timeline-color);
  }

  .dot {
    inline-size: 0.625rem;
    block-size: 0.625rem;
    border-radius: 50%;
    background-color: var(--timeline-color);
  }

  .words {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${U(`space-1`)};
    min-inline-size: 0;
    padding-block-start: 0.125rem;
  }

  time {
    color: ${U(`color-secondary`)};
    font-size: ${U(`font-size-sm`)};
    font-variant-numeric: tabular-nums;
  }

  .title {
    max-inline-size: 100%;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: ${U(`radius-item`)};
    background: none;
    color: ${U(`color-text`)};
    font: inherit;
    font-size: ${U(`font-size-md`)};
    font-weight: ${U(`font-weight-bold`)};
    line-height: ${U(`line-height-tight`)};
    text-align: start;
    text-decoration: none;
    overflow-wrap: anywhere;
  }

  a.title,
  button.title {
    cursor: pointer;
  }

  a.title:hover,
  button.title:hover {
    color: ${U(`color-primary`)};
    text-decoration: underline;
  }

  .title:focus-visible {${G()}}

  .description {
    margin: 0;
    color: ${U(`color-secondary`)};
    font-size: ${U(`font-size-sm`)};
    line-height: ${U(`line-height-normal`)};
    overflow-wrap: anywhere;
  }

  .actions {
    display: flex;
    align-items: flex-start;
    gap: ${U(`space-2`)};
  }

  ${IT()}

  @media (forced-colors: active) {
    .marker {
      border-color: CanvasText;
      background-color: Canvas;
      color: CanvasText;
    }

    .dot,
    .event::before {
      background-color: CanvasText;
    }

    a.title:hover,
    button.title:hover {
      color: LinkText;
    }
  }
`,IE=e=>e!=null,LE=e=>typeof e.href==`string`&&e.href!==``&&kf(e.href),RE=e=>typeof e.nodeType==`number`?e:K(e,{size:`sm`}),zE=e=>IE(e.color)?ME().includes(e.color)?e.color:(h.warn(`${EE}: item '${e.id}' has the color '${e.color}' - use '${kE}' or a palette name`),kE):kE,BE=e=>{if(!IE(e.time))return null;let t=typeof e.time==`string`&&AE.test(e.time),n=new Date(e.time);return Number.isNaN(n.getTime())?(h.warn(`${EE}: item '${e.id}' has the time '${e.time}', which is not a date`),null):{date:n,dateOnly:t}},VE={dateStyle:`medium`,timeZone:`UTC`},HE={dateStyle:`medium`,timeStyle:`short`},UE=({date:e,dateOnly:t})=>sC(e,t?VE:HE,kT()),WE=e=>O(`time`,{datetime:e.dateOnly?e.date.toISOString().slice(0,10):e.date.toISOString()},UE(e)),GE={styles:FE,props:DE,setup:(e,t,n)=>{n.length>0&&h.warn(`${EE}: takes no content - pass every event in 'items'`),t.label===void 0&&h.warn(`${EE}: pass a 'label' - it names the timeline for a screen reader`),t.actions!==void 0&&typeof t.actions!=`function`&&h.warn(`${EE}: 'actions' must be a function (item) => content - ignoring it`);let r=typeof t.actions==`function`?t.actions:null,i=typeof t.events?.[OE]==`function`||Array.isArray(t.events?.[OE]),a=AT(EE,`id`),o=/* @__PURE__ */ new Map,s=!1,c=0,l=e=>{g.dispatchEvent(new CustomEvent(OE,{bubbles:!0,composed:!0,cancelable:!0,detail:{id:e.id,item:e}}))&&LE(e)&&Lf(e.href)},u=e=>{let t=String(e.title??``),n=Mf(EE,e.href);return n===null?i?O(`button`,{class:`title`,type:`button`,events:{click:()=>l(e)}},t):V({class:`title`},t):Rf(Zo({class:`title`,href:Ut(n)},t),()=>l(e))},d=e=>V({class:[`marker`,`color-${zE(e)}`],"aria-hidden":`true`},IE(e.icon)?RE(e.icon):V({class:`dot`})),f=(e,t)=>{let n=BE(t);if(n===null)return o.delete(e),null;let r=WE(n);return o.set(e,{node:r,moment:n}),r},p=O(`ol`,{class:`events`,role:`list`},a.region((e,t)=>ds({class:[`event`,`color-${zE(t)}`]},d(t),B({class:`words`},f(e,t),u(t),IE(t.description)?gs({class:`description`},String(t.description)):null),r===null?null:B({class:`actions`},r(t))))),m=B({class:`empty`,hidden:!0}),g=B({class:`root`,events:cd(t.events,[OE])},p,m),_=()=>{let e=c===0&&!s;m.hidden=!e,e&&m.childNodes.length===0&&m.append(Rc())},v=()=>{for(let{node:e,moment:t}of o.values())e.textContent=UE(t)};t.label!==void 0&&L(e,t.label,e=>p.setAttribute(`aria-label`,String(e)));let y=LT(e,EE,t,p);return y!==null&&(p.after(y),L(e,t.hasMore,e=>{s=!!e,_()})),L(e,t.items,e=>{let t=a.take(e),n=new Set(t.map(e=>e.id));for(let e of o.keys())n.has(e)||o.delete(e);c=t.length,a.show(t),_()}),N.watch(e,v),g}},KE=(...e)=>z(EE,()=>GE,()=>P(FT))(...e),qE=e=>{let t=aT[e];return t?Y({size:`sm`,color:t.color},t.label):null},JE=e=>[qE(e.gitStatus),e.isExecutable?Y({size:`sm`,color:`lime`},`exec`):null,e.isSymlink?Y({size:`sm`,color:`sky`},`link`):null],YE={folder:`amber`,image:`pink`,video:`violet`,audio:`purple`,archive:`brown`,pdf:`red`,spreadsheet:`green`,code:`blue`},XE=e=>e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey,ZE=(e,t=`md`)=>e.isImage&&!e.isDeleted?ss({class:`thumbnail ${t}`,src:Vx(e.path),alt:``,loading:`lazy`,decoding:`async`}):K(Jw(e),{size:t,color:YE[e.kind]??`secondary`}),QE=T(`rfm-entry-name`,{styles:`
    :host { display: block; min-inline-size: 0 }
    .entry {
      display: flex;
      align-items: center;
      gap: var(--imp-space-2, 8px);
      min-inline-size: 0;
      padding: 2px var(--imp-space-1, 4px);
      border-radius: var(--imp-radius-item, 6px);
      outline: var(--imp-border-width, 1px) solid transparent;
    }
    .entry.cursor {
      outline: var(--imp-focus-ring-width, 2px) solid var(--imp-color-primary, #2563eb);
      background: color-mix(in srgb, var(--imp-color-primary, #2563eb) 8%, transparent);
    }
    .thumbnail {
      inline-size: 1.5rem;
      block-size: 1.5rem;
      object-fit: cover;
      border-radius: var(--imp-radius-item, 6px);
      flex: none;
    }
    a {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--imp-color-text, #0f172a);
      font-family: var(--imp-font-family, system-ui, sans-serif);
      text-decoration: none;
      border-radius: var(--imp-radius-item, 6px);
    }
    a:hover { color: var(--imp-color-primary, #2563eb); text-decoration: underline }
    a:focus-visible {
      outline: var(--imp-focus-ring-width, 2px) solid var(--imp-color-primary, #2563eb);
      outline-offset: 2px;
    }
    .directory a { font-weight: var(--imp-font-weight-bold, 600) }
    .deleted a { text-decoration: line-through; color: var(--imp-color-secondary, #64748b) }
    .broken a { color: var(--imp-color-danger, #dc2626) }
    @media (forced-colors: active) {
      .entry.cursor { outline-color: Highlight }
    }
  `,setup:(e,{entry:t,isCursor:n=!1,onOpen:r})=>{let i=Zo({href:Lx(t),title:t.isDeleted?`${t.name} was deleted, open the diff`:t.name,events:{click:e=>{XE(e)||(e.preventDefault(),r(t))}}},t.name);return e.box=V({class:{entry:!0,cursor:n,directory:t.isDirectory,deleted:t.isDeleted,broken:t.isBroken},"data-path":t.path},ZE(t),i,...JE(t)),e.isCursor=n,e.host.dataset.path=t.path,e.box},onMount:e=>{e.isCursor&&e.box.scrollIntoView({block:`nearest`})}}),$E=[`B`,`KB`,`MB`,`GB`,`TB`,`PB`],eD=e=>{if(typeof e!=`number`||!Number.isFinite(e)||e<0)return``;let t=e,n=0;for(;t>=1024&&n<$E.length-1;)t/=1024,n++;return`${n===0||t>=100?Math.round(t):Math.round(t*10)/10} ${$E[n]}`},tD=[`---`,`--x`,`-w-`,`-wx`,`r--`,`r-x`,`rw-`,`rwx`],nD=(e,t,n)=>{if(!t)return e;let r=e[2]===`x`;return e.slice(0,2)+(r?n.toLowerCase():n.toUpperCase())},rD=(e,t,n)=>{if(typeof e!=`number`)return``;let r=n?`l`:t?`d`:`-`,i=nD(tD[e>>6&7],!!(e&2048),`s`),a=nD(tD[e>>3&7],!!(e&1024),`s`),o=nD(tD[e&7],!!(e&512),`t`);return r+i+a+o},iD=e=>typeof e==`number`?(e&4095).toString(8).padStart(4,`0`):``,aD=e=>{if(e==null)return null;let t=new Date(e);return Number.isNaN(t.getTime())?null:t},oD=[{limit:60,seconds:1,name:`second`},{limit:3600,seconds:60,name:`minute`},{limit:86400,seconds:3600,name:`hour`},{limit:2592e3,seconds:86400,name:`day`},{limit:31536e3,seconds:2592e3,name:`month`},{limit:1/0,seconds:31536e3,name:`year`}],sD=(e,t=Date.now())=>{let n=aD(e);if(!n)return``;let r=Math.max(0,(t-n.getTime())/1e3);if(r<45)return`just now`;let i=oD.find(e=>r<e.limit),a=Math.round(r/i.seconds);return`${a} ${i.name}${a===1?``:`s`} ago`},cD=e=>{let t=aD(e);if(!t)return``;let n=e=>String(e).padStart(2,`0`);return`${t.getFullYear()}-${n(t.getMonth()+1)}-${n(t.getDate())} ${n(t.getHours())}:${n(t.getMinutes())}`},lD=(e,t)=>`${e} ${t}${e===1?``:`s`}`,uD=({entry:e})=>e.isDirectory||e.isDeleted?`—`:V({title:`${e.size??0} bytes`},eD(e.size)),dD=({entry:e})=>{let t=iD(e.mode);return ts({title:t?`Mode ${t}`:`Unavailable`},rD(e.mode,e.isDirectory,e.isSymlink)||`—`)},fD=({entry:e})=>e.isDeleted?`deleted`:V({title:cD(e.modifiedAt)},sD(e.modifiedAt)||`—`),pD=(e,t)=>{let n=/* @__PURE__ */ new Map;return M([e.visible,e.cursor,t],(e,t,r)=>{let i=/* @__PURE__ */ new Map,a=e.map(e=>{let a=e.path===t,o=n.get(e.path),s=o&&o.entry===e&&o.isCursor===a&&o.split===r?o:{id:e.path,entry:e,isCursor:a,split:r};return i.set(e.path,s),s});return n=i,a})},mD=e=>e.composedPath().find(e=>e.tagName===`TR`)?.querySelector(`rfm-entry-name`)?.dataset.path??null,hD=({model:e,isSplit:t,actionsFor:n})=>{let r=!1,i=[{key:`name`,label:`Name`,sortable:!0,render:t=>QE({entry:t.entry,isCursor:t.isCursor,onOpen:e.open})},{key:`size`,label:`Size`,align:`end`,sortable:!0,render:uD},{key:`permissions`,label:`Permissions`,render:dD},{key:`modified`,label:`Modified`,sortable:!0,render:fD},{key:`actions`,label:`Actions`,align:`end`,render:e=>jp({size:`sm`,variant:`ghost`,label:`Actions for ${e.entry.name}`,items:n(e.entry)})}],a=TE({label:M([e.path],e=>`Contents of ${Ox(e??`.`)}`),columns:i,rows:pD(e,t),selection:`multiple`,selected:e.selected,events:{sort:t=>{t.preventDefault(),e.setSort(t.detail)},rowSelect:t=>{r?e.pick(t.detail.key,{isExtending:!0}):e.pick(t.detail.key)}}});return a.addEventListener(`click`,t=>{if(r=t.shiftKey,t.detail!==2)return;let n=mD(t),i=n===null?null:e.visible.get().find(e=>e.path===n);i&&e.open(i)},{capture:!0}),a},gD=({entry:e,isCursor:t,isSelected:n},{model:r,actionsFor:i})=>{let a=B({class:{tile:!0,cursor:t,selected:n,deleted:e.isDeleted},events:{click:t=>{t.composedPath().some(e=>e.tagName===`A`||e.tagName===`INPUT`)||r.pick(e.path,{isToggling:t.ctrlKey||t.metaKey,isExtending:t.shiftKey})},dblclick:()=>r.open(e)}},B({class:`tile-head`},cs({type:`checkbox`,checked:n,"aria-label":`Select ${e.name}`,events:{change:()=>r.pick(e.path,{isToggling:!0})}}),jp({size:`sm`,variant:`ghost`,label:`Actions for ${e.name}`,items:i(e)})),V({class:`visual`},ZE(e,`lg`)),Zo({href:Lx(e),title:e.name,events:{click:t=>{t.button!==0||t.metaKey||t.ctrlKey||t.shiftKey||(t.preventDefault(),r.open(e))}}},e.name),V({class:`badges`},...JE(e)));return t&&requestAnimationFrame(()=>a.scrollIntoView({block:`nearest`})),a},_D=T(`rfm-file-grid`,{styles:`
    :host { display: block }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr));
      gap: var(--imp-space-3, 12px);
      padding: var(--imp-space-3, 12px);
    }
    .tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--imp-space-1, 4px);
      padding: var(--imp-space-2, 8px);
      border: var(--imp-border-width, 1px) solid var(--imp-color-border, #cbd5e1);
      border-radius: var(--imp-radius-container, 10px);
      background: var(--imp-color-surface, #ffffff);
      color: var(--imp-color-text, #0f172a);
      font-family: var(--imp-font-family, system-ui, sans-serif);
      min-inline-size: 0;
      cursor: default;
    }
    .tile:hover { background: var(--imp-color-surface-hover, #f1f5f9) }
    .tile.selected {
      background: color-mix(in srgb, var(--imp-color-primary, #2563eb) 10%, var(--imp-color-surface, #ffffff));
      border-color: color-mix(in srgb, var(--imp-color-primary, #2563eb) 50%, transparent);
    }
    .tile.cursor { outline: var(--imp-focus-ring-width, 2px) solid var(--imp-color-primary, #2563eb) }
    .tile-head { display: flex; align-self: stretch; justify-content: space-between; align-items: center }
    .visual { display: grid; place-items: center; block-size: 4rem }
    .thumbnail.lg { inline-size: 4rem; block-size: 4rem; object-fit: cover; border-radius: var(--imp-radius-item, 6px) }
    a {
      max-inline-size: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: inherit;
      text-decoration: none;
      font-size: var(--imp-font-size-sm, 0.875rem);
    }
    a:hover { color: var(--imp-color-primary, #2563eb); text-decoration: underline }
    a:focus-visible, input:focus-visible {
      outline: var(--imp-focus-ring-width, 2px) solid var(--imp-color-primary, #2563eb);
      outline-offset: 2px;
    }
    .deleted a { text-decoration: line-through; color: var(--imp-color-secondary, #64748b) }
    .badges { display: flex; gap: var(--imp-space-1, 4px); min-block-size: 1.25rem }
    @media (forced-colors: active) {
      .tile.selected { border-color: Highlight }
      .tile.cursor { outline-color: Highlight }
    }
  `,setup:(e,{model:t,isSplit:n,actionsFor:r})=>{let i=M([t.visible,t.cursor,t.selected,n],(e,t,n,r)=>e.map(e=>({entry:e,isCursor:e.path===t,isSelected:n.includes(e.path),split:r})));return B({class:`grid`,role:`list`,"aria-label":`Folder contents`},i.each(e=>gD(e,{model:t,actionsFor:r}),({entry:e,isCursor:t,isSelected:n,split:r})=>`${e.path}:${t}:${n}:${r}:${e.modifiedAt}:${e.gitStatus}`))}}),vD={ascending:`descending`,descending:`none`,none:`ascending`},yD=e=>e.composedPath().some(e=>[`A`,`INPUT`,`BUTTON`].includes(e.tagName)),bD=(e,t,{model:n})=>{let r=M([n.sort],t=>t.key===e?t.direction:`none`);return J({variant:`ghost`,size:`sm`,label:M([r],e=>`Sort by ${t}, ${e}`),events:{click:()=>n.setSort({key:e,direction:vD[r.get()]})}},t,r.view(e=>e===`none`?null:K(e===`ascending`?pd:ld,{size:`sm`})))},xD=({entry:e,isCursor:t,isSelected:n},{model:r,actionsFor:i})=>B({class:{row:!0,selected:n},role:`listitem`,events:{click:t=>{yD(t)||r.pick(e.path,{isToggling:!0,isExtending:t.shiftKey})},dblclick:t=>{yD(t)||r.open(e)}}},cs({type:`checkbox`,checked:n,"aria-label":`Select ${e.name}`,events:{click:t=>r.pick(e.path,{isToggling:!0,isExtending:t.shiftKey})}}),QE({entry:e,isCursor:t,onOpen:r.open}),V({class:`size`},uD({entry:e})),jp({size:`sm`,variant:`ghost`,label:`Actions for ${e.name}`,items:i(e)})),SD=T(`rfm-file-list`,{styles:`
    :host { display: block }
    .head, .row {
      display: grid;
      grid-template-columns: 1.75rem minmax(0, 1fr) auto 2rem;
      align-items: center;
      column-gap: var(--imp-space-1, 4px);
      padding-inline: var(--imp-space-2, 8px);
      color: var(--imp-color-text, #0f172a);
      font-family: var(--imp-font-family, system-ui, sans-serif);
      font-size: var(--imp-font-size-sm, 0.875rem);
    }
    .head {
      padding-block: var(--imp-space-1, 4px);
      border-block-end: var(--imp-border-width, 1px) solid var(--imp-color-border, #cbd5e1);
    }
    .row {
      min-block-size: 2.5rem;
      border-block-end: var(--imp-border-width, 1px) solid var(--imp-color-border, #cbd5e1);
      content-visibility: auto;
      contain-intrinsic-block-size: auto 2.5rem;
      cursor: default;
    }
    .row:hover { background: var(--imp-color-surface-hover, #f1f5f9) }
    .row.selected {
      background: color-mix(in srgb, var(--imp-color-primary, #2563eb) 10%, var(--imp-color-surface, #ffffff));
    }
    .size {
      color: var(--imp-color-secondary, #64748b);
      text-align: end;
      white-space: nowrap;
    }
    input { margin: 0; justify-self: center }
    input:focus-visible {
      outline: var(--imp-focus-ring-width, 2px) solid var(--imp-color-primary, #2563eb);
      outline-offset: 2px;
    }
    @media (forced-colors: active) {
      .row.selected { outline: var(--imp-border-width, 1px) solid Highlight }
    }
  `,setup:(e,{model:t,actionsFor:n})=>{let r=M([t.visible,t.cursor,t.selected],(e,t,n)=>e.map(e=>({entry:e,isCursor:e.path===t,isSelected:n.includes(e.path)}))),i=M([t.visible,t.selected],(e,t)=>e.filter(e=>t.includes(e.path)).length),a=cs({type:`checkbox`,"aria-label":`Select all`,checked:M([i,t.visible],(e,t)=>e>0&&e===t.length),events:{change:e=>e.target.checked?t.selectAll():t.clearSelection()}}),o=()=>{let e=i.get();a.indeterminate=e>0&&e<t.visible.get().length};return o(),i.watch(e,o),t.visible.watch(e,o),B(B({class:`head`},a,V({class:`name`},bD(`name`,`Name`,{model:t})),V({class:`size`},bD(`size`,`Size`,{model:t})),V()),B({role:`list`,"aria-label":`Folder contents`},r.each(e=>xD(e,{model:t,actionsFor:n}),e=>e.entry.path)))}}),CD=T(`rfm-upload-dialog`,{setup:(e,{open:t,directory:n,onUpload:r})=>{e.chosenFiles=[];let i=M([n],e=>`Upload to ${Ox(e??`.`)}`);return ux({title:i,open:t},t.view(n=>n?pw({initialValues:{files:[]},onSubmit:()=>(t.set(!1),r(e.chosenFiles))},Zb({gap:4},zC({field:`files`,label:`Files`,multiple:!0,required:!0,onFiles:t=>{e.chosenFiles=t}}),Z({horizontalAlign:`end`,gap:2},J({events:{click:()=>t.set(!1)}},`Cancel`),J({variant:`primary`,events:{click:uw}},`Upload`)))):null))}}),wD=e=>{let t=document.createElement(`textarea`);t.value=e,t.setAttribute(`readonly`,``),t.style.position=`fixed`,t.style.opacity=`0`,document.body.append(t),t.select();try{return document.execCommand(`copy`)}catch{return!1}finally{t.remove()}},TD=async e=>{try{return await navigator.clipboard.writeText(e),!0}catch{return wD(e)}},ED=e=>({id:`history`,label:e.isDirectory?`Folder history`:`File history`,icon:af,onClick:()=>q(Px(e.path))}),DD=e=>({id:`diff`,label:`View git diff`,icon:kd,onClick:()=>q(Fx({path:e.path}))}),OD=async e=>{let t=await TD(e);K_({kind:t?`success`:`error`,title:t?`Path copied`:`Could not copy the path`})},kD=(e,t)=>{let n=t?null:{id:`open`,label:e.isMarkdown?`Open rendered`:`Open`,icon:e.isDirectory?Bd:wd,onClick:()=>q(Lx(e))};return e.isDirectory?[n]:[n,e.isText?{id:`edit`,label:`Edit`,icon:tf,onClick:()=>q(Mx(e.path))}:null,iT(e)?{id:`raw`,label:`Open raw`,icon:Cd,onClick:()=>Wx(Bx(e.path))}:null]},AD=(e,{operations:t,isSplit:n=!1,onTransfer:r,inViewer:i=!1})=>e.isDeleted?[DD(e),ED(e)]:[...kD(e,i),{id:`download`,label:e.isDirectory?`Download as ZIP`:`Download`,icon:Sd,onClick:()=>Gx(Hx(e))},e.hasGitDiff&&(e.isDirectory||e.isText)?DD(e):null,ED(e),{id:`rename`,label:`Rename`,icon:lf,onClick:()=>t.rename(e)},{id:`copy-path`,label:`Copy path`,icon:vd,onClick:()=>OD(e.path)},n?{id:`copy`,label:`Copy to other pane`,icon:xd,onClick:()=>r(e,!1)}:null,n?{id:`move`,label:`Move to other pane`,icon:fd,onClick:()=>r(e,!0)}:null,{id:`delete`,label:`Delete`,icon:uf,onClick:()=>t.remove([e])}].filter(Boolean),jD=[{value:`list`,label:`List view`,icon:Yd},{value:`grid`,label:`Grid view`,icon:Jd}],MD=(e,t,n)=>J({variant:`ghost`,size:`sm`,square:!0,label:e,events:{click:n}},K(t)),ND=e=>{let t=Ex(e??`.`);return[{id:`.`,label:`root`,icon:Kd,href:`#`},...t.map((e,n)=>({id:t.slice(0,n+1).join(`/`),label:e,href:`#`}))]},PD=(e,t)=>{if(!e)return``;let n=e.entries.filter(e=>!e.isDeleted),r=n.filter(e=>e.isDirectory).length,i=n.length-r,a=[lD(r,`folder`),lD(i,`file`),eD(e.totalSize)];return t>0&&a.push(`${t} selected`),a.join(` · `)},FD=e=>{e.length===1?Gx(Hx(e[0])):e.length>1&&Kx(e.map(e=>e.path))},ID=T(`rfm-file-pane`,{styles:`
    :host { display: block; min-inline-size: 0; min-block-size: 0 }
    .pane {
      display: flex;
      flex-direction: column;
      block-size: 100%;
      min-block-size: 18rem;
      box-sizing: border-box;
      background: var(--imp-color-surface, #ffffff);
      border: var(--imp-border-width, 1px) solid var(--imp-color-border, #cbd5e1);
      border-radius: var(--imp-radius-container, 10px);
      overflow: hidden;
    }
    .pane.active {
      border-color: var(--imp-color-primary, #2563eb);
      box-shadow: 0 0 0 1px var(--imp-color-primary, #2563eb);
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--imp-space-2, 8px);
      padding: var(--imp-space-2, 8px) var(--imp-space-3, 12px);
      border-block-end: var(--imp-border-width, 1px) solid var(--imp-color-border, #cbd5e1);
    }
    .trail { flex: 1 1 12rem; min-inline-size: 0 }
    .filter { flex: 0 1 14rem; min-inline-size: 8rem }
    .spacer { flex: 1 }
    .bar[hidden] { display: none }
    .selection {
      background: color-mix(in srgb, var(--imp-color-primary, #2563eb) 8%, var(--imp-color-surface, #ffffff));
    }
    .body { flex: 1; min-block-size: 0; overflow: auto }
    .state { padding: var(--imp-space-6, 32px) var(--imp-space-3, 12px) }
    .status {
      padding: var(--imp-space-1, 4px) var(--imp-space-3, 12px);
      border-block-start: var(--imp-border-width, 1px) solid var(--imp-color-border, #cbd5e1);
    }
    @media (forced-colors: active) {
      .pane.active { border-color: Highlight }
    }
  `,setup:(e,{model:t,isSplit:n,isActive:r,viewMode:i,operations:a,otherPath:o,onActivate:s})=>{let c=A(e,`rfm.upload-open`,!1),l=M([t.path],e=>e??`.`),u=()=>l.get(),d=(e,t)=>a.transfer(e,o(),t),f=e=>AD(e,{operations:a,isSplit:n.get(),onTransfer:(e,t)=>d([e],t)}),p=cs({type:`file`,multiple:!0,webkitdirectory:!0,hidden:!0,events:{change:()=>{a.upload(u(),[...p.files]),p.value=``}}}),m=Fw({value:t.filter,type:`search`,ariaLabel:`Filter the entries of this folder`,placeholder:`Filter this folder`});m.addEventListener(`keydown`,e=>{e.key===`Escape`&&(t.filter.set(``),e.target.blur?.())});let h=B({class:`bar`},Z({gap:1},MD(`Back`,ud,t.back),MD(`Parent directory`,pd,t.up),MD(`Refresh`,rf,t.load)),B({class:`trail`},fy({label:`Folder path`,items:M([t.path],ND),events:{select:e=>{e.preventDefault(),t.navigateTo(e.detail.id)}}})),B({class:`filter`},m)),g=M([t.selected],e=>e.length>0),_=B({class:`bar`,hidden:g},J({variant:`primary`,size:`sm`,events:{click:()=>a.createItem(u(),!0)}},K(Vd,{size:`sm`}),`New folder`),J({size:`sm`,events:{click:()=>a.createItem(u(),!1)}},K(Md,{size:`sm`}),`New file`),jp({trigger:`arrow`,size:`sm`,label:`Upload`,items:[{id:`files`,label:`Upload files`,icon:Rd,onClick:()=>c.set(!0)},{id:`folder`,label:`Upload folder`,icon:zd,onClick:()=>p.click()}]},Z({gap:2,verticalAlign:`center`},K(ff,{size:`sm`}),`Upload`)),J({size:`sm`,events:{click:()=>a.pasteFromClipboard(u())}},K(yd,{size:`sm`}),`Paste`),V({class:`spacer`}),xw({value:i,ariaLabel:`View mode`,size:`sm`,options:jD})),v=B({class:`bar selection`,hidden:M([g],e=>!e)},Ef({inline:!0,size:`sm`,weight:`bold`},t.selected.text(e=>`${e.length} selected`)),V({class:`spacer`}),n.view(e=>e?[J({size:`sm`,events:{click:()=>d(t.selectedEntries(),!1)}},K(xd,{size:`sm`}),`Copy to other pane`),J({size:`sm`,events:{click:()=>d(t.selectedEntries(),!0)}},K(fd,{size:`sm`}),`Move to other pane`)]:null),J({size:`sm`,events:{click:()=>FD(t.selectedEntries())}},K(Sd,{size:`sm`}),`Download`),J({size:`sm`,variant:`danger`,events:{click:()=>a.remove(t.selectedEntries())}},K(uf,{size:`sm`}),`Delete`),J({size:`sm`,variant:`ghost`,events:{click:t.clearSelection}},K(pf,{size:`sm`}),`Clear`)),y=A(e,`rfm.pane-narrow`,matchMedia(`(max-width: 30rem)`).matches),b=M([t.listing,t.visible,i,y],(e,t,n,r)=>e===void 0?`loading`:e.error?`error`:e.entries.length===0?`empty`:t.length===0?`no-matches`:n===`list`&&r?`compact`:n).view(e=>e===`loading`?B({class:`state`},Pv({label:`Loading the folder`})):e===`error`?B({class:`state`},Rc({icon:Ud,kind:`error`,title:`Could not open this folder`,description:t.listing.get().error},J({events:{click:()=>t.navigateTo(`.`)}},`Go to the root folder`))):e===`empty`?B({class:`state`},Rc({icon:zd,title:`This folder is empty`})):e===`no-matches`?B({class:`state`},Rc({variant:`noResults`,description:`No entries match the filter`})):e===`grid`?_D({model:t,isSplit:n,actionsFor:f}):e===`compact`?SD({model:t,actionsFor:f}):hD({model:t,isSplit:n,actionsFor:f})),x=B({class:`body`},b),S=new ResizeObserver(([e])=>{let t=parseFloat(getComputedStyle(document.documentElement).fontSize);y.set(e.contentRect.width<=30*t)});return S.observe(x),e.abortSignal.addEventListener(`abort`,()=>S.disconnect()),B({class:M([r],e=>({pane:!0,active:e})),events:{pointerdown:s,focusin:s}},h,_,v,x,B({class:`status`},Ef({size:`sm`,tone:`secondary`},M([t.listing,t.selected],(e,t)=>PD(e,t.length)).text())),p,CD({open:c,directory:l,onUpload:e=>a.upload(u(),e)}))}}),LD=e=>e.length===1?`"${e[0].name}"`:`${e.length} items`,RD=e=>K_({kind:e.ok?`success`:`error`,title:e.message}),zD=(e,t)=>K_({kind:`error`,title:e,description:Ux(t)}),BD=()=>K_({kind:`warning`,title:`Nothing selected`}),VD=e=>{let t=/* @__PURE__ */ new Date,n=e=>String(e).padStart(2,`0`);return`pasted-${`${t.getFullYear()}${n(t.getMonth()+1)}${n(t.getDate())}`}-${`${n(t.getHours())}${n(t.getMinutes())}${n(t.getSeconds())}`}.${e}`},HD={"image/png":`png`,"image/jpeg":`jpg`,"image/gif":`gif`,"image/webp":`webp`,"image/svg+xml":`svg`},UD=e=>e?HD[e]?HD[e]:e.startsWith(`image/`)?e.split(`/`)[1]||`img`:e===`text/html`?`html`:`txt`:`txt`,WD=({api:e,dialogRequest:t,onChanged:n})=>{let r=async(e,t)=>{try{let e=await t();return RD(e),await n(),e}catch(t){return zD(e,t),null}},i=async(n,i)=>{let a=await zw(t,{title:i?`New folder`:`New file`,label:`Name`,confirmLabel:`Create`});return a?r(`Could not create "${a}"`,()=>e.post(`/api/create-item`,{body:{path:n,name:a,type:i?`directory`:`file`}})):null},a=async n=>{let i=await zw(t,{title:`Rename`,label:`New name`,value:n.name,confirmLabel:`Rename`});return!i||i===n.name?null:r(`Could not rename "${n.name}"`,()=>e.post(`/api/rename-item`,{body:{path:n.path,newName:i}}))},o=async(r,i)=>{try{let a=await e.post(`/api/delete-items`,{body:{paths:r,recursive:i}});return a.notEmpty?.length>0&&await Bw(t,{title:`Folder not empty`,message:`${a.notEmpty.join(`, `)} is not empty. Delete everything inside?`,confirmLabel:`Delete recursively`,isDanger:!0})?o(r.filter(e=>a.notEmpty.includes(Tx(e))),!0):(RD(a),await n(),a)}catch(e){return zD(`Could not delete`,e),null}},s=async e=>e.length===0?BD():await Bw(t,{title:`Delete`,message:`Permanently delete ${LD(e)}? This cannot be undone.`,confirmLabel:`Delete`,isDanger:!0})?o(e.map(e=>e.path),!1):null,c=async(r,i,a,o=!1)=>{if(r.length===0)return BD();if(i===null)return K_({kind:`warning`,title:`Enable split view to copy or move between panes`});let s=a?`move`:`copy`;try{let s=await e.post(a?`/api/move-items`:`/api/copy-items`,{body:{paths:r.map(e=>e.path),targetPath:i,overwrite:o}});if(s.conflicts?.length>0&&await Bw(t,{title:`Already exists`,message:`These items already exist in the target folder. Overwrite them?`,items:s.conflicts,confirmLabel:`Overwrite`,isDanger:!0})){let e=r.filter(e=>s.conflicts.includes(e.name));return c(e,i,a,!0)}return RD(s),await n(),s}catch(e){return zD(`Could not ${s} ${LD(r)}`,e),null}},l=(t,n)=>{if(n.length===0)return null;let i=new FormData;i.append(`path`,t);for(let e of n)i.append(`files`,e,e.webkitRelativePath||e.name);return K_({title:`Uploading ${n.length} file${n.length===1?``:`s`}`}),r(`Upload failed`,()=>e.post(`/api/upload-files`,{body:i}))},u=async(n,i,a)=>{let o=await zw(t,{title:`Save clipboard content`,label:`File name`,value:VD(a),confirmLabel:`Save`});if(!o)return null;let s=new FormData;return s.append(`path`,n),s.append(`filename`,o),s.append(`file`,i,o),r(`Could not save "${o}"`,()=>e.post(`/api/paste-content`,{body:s}))};return{createItem:i,rename:a,remove:s,transfer:c,upload:l,saveBlob:u,pasteFromClipboard:async e=>{try{let t=await navigator.clipboard.read();for(let n of t){let t=n.types.find(e=>e.startsWith(`image/`));if(t)return u(e,await n.getType(t),UD(t))}let n=await navigator.clipboard.readText();return n.trim()?u(e,new Blob([n],{type:`text/plain`}),`txt`):K_({kind:`warning`,title:`The clipboard is empty`})}catch{return K_({kind:`error`,title:`Clipboard access was denied. Use Ctrl+V instead.`})}}}},GD=async(e,t)=>{try{let n=await e.get(`/api/git/summary`);t.set(n.repository??null)}catch{t.set(null)}},KD=`rfm-view-mode`,qD=[{value:`single`,label:`Single pane`,icon:ef},{value:`split`,label:`Split panes`,icon:bd}],JD=[`INPUT`,`TEXTAREA`,`SELECT`],YD=e=>{let t=e.composedPath()[0];return JD.includes(t?.tagName)||t?.isContentEditable===!0},XD=e=>e.composedPath().some(e=>/^(menu|menuitem|listbox|option)/.test(e.getAttribute?.(`role`)??``)),ZD=(e,t,n,r=`default`)=>J({size:`sm`,variant:r,events:{click:n}},K(t,{size:`sm`}),e),QD=T(`rfm-explorer`,{styles:`
    :host { display: flex; flex-direction: column; flex: 1; min-block-size: 0 }
    .explorer {
      display: flex;
      flex-direction: column;
      gap: var(--imp-space-3, 12px);
      flex: 1;
      min-block-size: 0;
      padding: var(--imp-space-3, 12px);
    }
    .panes {
      flex: 1;
      min-block-size: 0;
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      grid-auto-rows: minmax(0, 1fr);
      gap: var(--imp-space-3, 12px);
    }
    .panes.split { grid-template-columns: repeat(2, minmax(0, 1fr)) }
    @media (max-width: 47.99rem) {
      .explorer { min-block-size: auto }
      .panes, .panes.split { grid-template-columns: minmax(0, 1fr); grid-auto-rows: minmax(24rem, auto) }
    }
  `,setup:e=>{let t=To(e,`rfm.api`),n=j(e,`rfm.dialog`),r=j(e,`rfm.dialog-open`),i=j(e,`rfm.search-open`),a=j(e,`rfm.active-pane`),o=j(e,`rfm.git`),s=OT(Q),c=()=>s.get()??{},l=M([s],e=>e?e.path||`.`:null),u=M([s],e=>e?.right===void 0?null:e.right||`.`),d=M([u],e=>e!==null),f=A(e,`rfm.view-mode`,_T(KD,`list`)),p=A(e,`rfm.layout`,d.get()?`split`:`single`),m=(e,t)=>{let n=c(),r=n.right===void 0?void 0:n.right||`.`;q(Ax({path:e===`left`?t:n.path||`.`,right:e===`right`?t:r}),{replace:!0})},h={left:DT(e,{side:`left`,path:l,api:t,onNavigate:e=>m(`left`,e)}),right:DT(e,{side:`right`,path:u,api:t,onNavigate:e=>m(`right`,e)})},g=()=>d.get()?h[a.get()]:h.left,_=()=>a.get()===`left`?h.right:h.left,v=()=>d.get()?_().path.get():null;d.get()||a.set(`left`);let y=WD({api:t,dialogRequest:n,onChanged:async()=>{await Promise.all([h.left.load(),h.right.load()]),GD(t,o)}});s.watch(e,e=>{e?.reveal&&(g().reveal(e.reveal),q(Ax({path:e.path||`.`,right:e.right}),{replace:!0}))}),f.watch(e,e=>vT(KD,e)),d.watch(e,e=>{p.set(e?`split`:`single`),e||a.set(`left`)}),p.watch(e,e=>{if(e===`split`===d.get())return;let t=c().path||`.`;q(Ax({path:t,right:e===`split`?t:void 0}),{replace:!0})});let b=()=>g().focusedOrFirstSelected(),x={rename:()=>{let e=b();e?y.rename(e):K_({kind:`warning`,title:`Nothing selected`})},view:()=>g().open(b()),edit:()=>{let e=b();e&&!e.isDirectory&&q(Mx(e.path))},copy:()=>y.transfer(g().targets(),v(),!1),move:()=>y.transfer(g().targets(),v(),!0),newFolder:()=>y.createItem(g().path.get(),!0),remove:()=>y.remove(g().targets())};document.addEventListener(`keydown`,e=>{if(e.defaultPrevented||r.get()||i.get()||YD(e)||XD(e))return;let t=g(),n=e.ctrlKey||e.metaKey;e.key===`Tab`&&d.get()&&!n&&!e.altKey?(e.preventDefault(),a.set(a.get()===`left`?`right`:`left`)):n&&e.key.toLowerCase()===`a`?(e.preventDefault(),t.selectAll()):e.key===`ArrowDown`||e.key===`ArrowUp`?(e.preventDefault(),t.moveCursor(e.key===`ArrowDown`?1:-1,e.shiftKey)):e.key===`Enter`&&t.cursorEntry()?(e.preventDefault(),t.open(t.cursorEntry())):e.key===` `&&t.cursorEntry()?(e.preventDefault(),t.toggleCursorSelection()):e.key===`Backspace`?(e.preventDefault(),t.up()):e.key===`Delete`&&(e.preventDefault(),x.remove())},{signal:e.abortSignal}),document.addEventListener(`paste`,e=>{if(r.get()||YD(e)||!e.clipboardData)return;let t=g().path.get(),n=e.clipboardData.files?.[0];if(n){e.preventDefault(),y.saveBlob(t,n,UD(n.type));return}let i=e.clipboardData.getData(`text/html`),a=e.clipboardData.getData(`text/plain`);(i||a)&&(e.preventDefault(),y.saveBlob(t,new Blob([i||a],{type:i?`text/html`:`text/plain`}),i?`html`:`txt`))},{signal:e.abortSignal});let S=e=>ID({model:h[e],isSplit:d,isActive:M([a,d],(t,n)=>n&&t===e),viewMode:f,operations:y,otherPath:v,onActivate:()=>{a.get()!==e&&a.set(e)}});return B({class:`explorer`},Z({gap:2,verticalAlign:`center`,wrap:!0},xw({value:p,ariaLabel:`Pane layout`,size:`sm`,options:qD})),B({class:M([d],e=>({panes:!0,split:e}))},S(`left`),d.view(e=>e?S(`right`):null)),Z({gap:2,wrap:!0},ZD(`Rename`,lf,x.rename),ZD(`View`,wd,x.view),ZD(`Edit`,tf,x.edit),d.view(e=>e?[ZD(`Copy`,xd,x.copy),ZD(`Move`,fd,x.move)]:null),ZD(`New folder`,Vd,x.newFolder),ZD(`Delete`,uf,x.remove,`danger`)))}}),$D=/^\s*(```|~~~)/,eO=/^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/,tO=e=>e.trim().replace(/^\|/,``).replace(/(?<!\\)\|$/,``).split(/(?<!\\)\|/).map(e=>e.trim().replaceAll(`\\|`,`|`)),nO=e=>{let t=e.startsWith(`:`),n=e.endsWith(`:`);return t&&n?`center`:n?`end`:`start`},rO=(e,t)=>e.includes(`|`)&&t!==void 0&&t.includes(`|`)&&eO.test(t),iO=e=>{let t=e.split(`
`),n=[],r=[],i=!1,a=()=>{r.some(e=>e.trim())&&n.push({type:`prose`,text:r.join(`
`)}),r=[]};for(let e=0;e<t.length;e++){let o=t[e];if($D.test(o)&&(i=!i),i||!rO(o,t[e+1])){r.push(o);continue}a();let s=tO(o),c=tO(t[e+1]).map(nO),l=[];for(e+=2;e<t.length&&t[e].includes(`|`)&&t[e].trim();)l.push(tO(t[e])),e++;e--,n.push({type:`table`,header:s,alignments:c,rows:l})}return a(),n},aO=e=>`column${e}`,oO=({header:e,alignments:t,rows:n},r)=>TE({label:`Table ${r}: ${e.join(`, `)}`,columns:e.map((e,n)=>({key:aO(n),label:e,align:t[n]??`start`,render:e=>Wg({text:e[aO(n)]})})),rows:n.map((t,n)=>({id:n,...Object.fromEntries(e.map((e,n)=>[aO(n),t[n]??``]))}))}),sO=e=>{let t=0;return Zb({gap:4},...iO(e).map(e=>e.type===`prose`?Wg({text:e.text}):(t+=1,oO(e,t))))},cO={image:(e,t)=>ss({src:e,alt:t}),video:e=>Ds({src:e,controls:!0,preload:`metadata`}),audio:e=>Qo({src:e,controls:!0,preload:`metadata`}),pdf:(e,t)=>os({src:e,title:t}),html:(e,t)=>os({src:e,title:t})},lO=T(`rfm-media-preview`,{styles:`
    :host { display: block }
    .preview {
      display: grid;
      place-items: center;
      padding: var(--imp-space-4, 16px);
      border: var(--imp-border-width, 1px) solid var(--imp-color-border, #cbd5e1);
      border-radius: var(--imp-radius-container, 10px);
      background-color: var(--imp-color-surface-sunken, #f1f5f9);
    }
    .preview.image {
      background-image: conic-gradient(
        var(--imp-color-surface, #ffffff) 25%,
        var(--imp-color-surface-sunken, #f1f5f9) 0 50%,
        var(--imp-color-surface, #ffffff) 0 75%,
        var(--imp-color-surface-sunken, #f1f5f9) 0
      );
      background-size: 1.25rem 1.25rem;
    }
    .preview.pdf, .preview.html { padding: 0; overflow: hidden }
    img, video { max-inline-size: 100%; max-block-size: 75dvb }
    audio { inline-size: min(100%, 40rem) }
    iframe { inline-size: 100%; block-size: 75dvb; border: 0; background: #ffffff }
  `,setup:(e,{kind:t,source:n,name:r})=>B({class:[`preview`,t]},cO[t](n,r))}),uO=/(!?)\[([^\]]*)\]\(\s*<?([^\s)>]+)>?((?:\s+"[^"]*")?)\s*\)/g,dO=/^([a-z][a-z0-9+.-]*:|\/\/)/i,fO=(e,t)=>{let n=[],r=t.startsWith(`/`)||e===`.`?``:e;for(let e of`${r}/${t}`.split(`/`))if(e!==``&&e!==`.`){if(e===`..`){if(n.length===0)return null;n.pop()}else n.push(e)}return n.join(`/`)||`.`},pO=e=>{try{return decodeURI(e)}catch{return e}},mO=e=>{let t=e.search(/[?#]/);return t===-1?[e,``]:[e.slice(0,t),e.slice(t)]},hO=(e,t,n)=>{if(e.startsWith(`#`)||dO.test(e))return e;let[r,i]=mO(e);if(!r)return e;let a=fO(t,pO(r));return a===null?e:n?Bx(a)+i:r.endsWith(`/`)||a===`.`?Ax({path:a}):jx(a)},gO=(e,t)=>e.replace(uO,(e,n,r,i,a)=>`${n}[${r}](${hO(i,t,n===`!`)}${a})`),_O=(e,t)=>{let n=(e.size??0)>1e6||t.split(`
`).length>2e4;return Bh({code:t,language:n?`text`:Qw(e.path),lineNumbers:!0,id:`source`,label:e.name})},vO=(e,t)=>Rc({icon:Nd,title:`No inline preview`,description:t},J({variant:`primary`,events:{click:()=>Gx(Hx(e))}},K(Sd,{size:`sm`}),`Download`)),yO=(e,t,n)=>{let r=nT(e);return[`image`,`video`,`audio`,`pdf`].includes(r)?lO({kind:r,source:Bx(e.path),name:e.name}):t===null?vO(e,n?`This file is ${eD(e.size)}, too large to show in the browser.`:`There is no inline preview for this type of file.`):r===`markdown`?Cx({label:`Markdown views`,items:[{id:`rendered`,label:`Rendered`,content:sO(gO(sT(t),wx(e.path)))},{id:`source`,label:`Source`,content:_O(e,t)}]}):r===`html`?Cx({label:`HTML views`,items:[{id:`source`,label:`Source`,content:_O(e,t)},{id:`rendered`,label:`Rendered`,content:lO({kind:`html`,source:Bx(e.path),name:e.name})}]}):_O(e,t)},bO=e=>e?typeof e==`string`?Ef({size:`sm`,tone:`secondary`},e):Bf({href:e.href,tone:`secondary`,size:`sm`},e.label):null,xO=({glyph:e,title:t,subtitle:n,badges:r=[],actions:i=[]})=>Z({horizontalAlign:`justify`,verticalAlign:`center`,wrap:!0,gap:3},Z({gap:3,verticalAlign:`center`},K(e,{size:`lg`,color:`primary`}),Zb({gap:1},Z({gap:2,verticalAlign:`center`,wrap:!0},wf({level:1},t),...r),bO(n))),i.length>0?Z({gap:2,wrap:!0},...i):null),SO=(e,t,n)=>Rc({icon:df,kind:`error`,title:e,description:Ux(t)},n?J({events:{click:n}},`Try again`):null),CO=e=>{let t=iD(e.mode),n=[e.isExecutable?Y({size:`sm`,color:`lime`},`executable`):null,e.isSymlink?Y({size:`sm`,color:`sky`},`symlink`):null].filter(Boolean);return[{term:`Size`,details:V({title:`${e.size??0} bytes`},eD(e.size??0))},{term:`Permissions`,details:ts({title:t?`Mode ${t}`:``},rD(e.mode,e.isDirectory,e.isSymlink)||`—`)},{term:`Modified`,details:V({title:cD(e.modifiedAt)},sD(e.modifiedAt)||`—`)},{term:`Kind`,details:e.kind},n.length>0?{term:`Flags`,details:Z({gap:1},...n)}:null].filter(Boolean)},wO=e=>J({size:`sm`,variant:e.id===`delete`?`danger`:`default`,events:{click:e.onClick}},K(e.icon,{size:`sm`}),e.label),TO=T(`rfm-file-details`,{loading:()=>Pv({label:`Loading the file`}),error:(e,t)=>SO(`Could not open the file`,t),setup:async(e,{path:t})=>{let n=To(e,`rfm.api`),r=j(e,`rfm.dialog`),i=j(e,`rfm.git`),a;try{a=await n.get(`/api/file`,{query:{path:t}})}catch(e){if(!e.body?.isDirectory)throw e;return q(Ax({path:e.body.path}),{replace:!0}),null}let{entry:o,content:s,isTooLarge:c}=a,l=wx(o.path),u=WD({api:n,dialogRequest:r,onChanged:()=>GD(n,i)}),d={...u,rename:async e=>{let t=await u.rename(e);t?.ok&&q(jx(t.path),{replace:!0})},remove:async e=>{(await u.remove(e))?.ok&&q(Ax({path:l}),{replace:!0})}};return Zb({gap:4},xO({glyph:Jw(o),title:o.name,subtitle:{href:Ax({path:l}),label:Ox(l)},badges:[qE(o.gitStatus)]}),qp({padding:`sm`},$h({columns:3,items:CO(o)})),Z({gap:2,wrap:!0},...AD(o,{operations:d,inViewer:!0}).map(wO)),yO(o,s,c))}}),EO=T(`rfm-screen-frame`,{styles:`
    :host { display: block }
    .frame {
      display: flex;
      flex-direction: column;
      gap: var(--imp-space-4, 16px);
      padding: var(--imp-space-4, 16px) var(--imp-space-page, 16px);
    }
  `,setup:(e,...t)=>B({class:`frame`},...t)}),DO=T(`rfm-file-view`,{setup:()=>{let e=OT(Q.view);return EO(e.view(e=>e?TO({path:e.path??``}):null))}}),OO=()=>Math.max(10,Math.floor((globalThis.innerHeight-320)/24)),kO=e=>(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()===`s`,AO=(e,t=[])=>xO({glyph:Jw(e),title:e.name,subtitle:{href:Ax({path:wx(e.path)}),label:Ox(wx(e.path))},actions:t}),jO=(e,t)=>Zb({gap:4},AO(e),Rc({icon:Ld,title:`This file cannot be edited`,description:t?`The file is ${eD(e.size)}, too large to edit in the browser.`:`It looks like a binary file, so it cannot be edited as text.`},J({events:{click:()=>q(jx(e.path))}},K(wd,{size:`sm`}),`View details`),J({events:{click:()=>Gx(Hx(e))}},K(Sd,{size:`sm`}),`Download`))),MO=T(`rfm-file-editor-panel`,{loading:()=>Pv({label:`Loading the file`}),error:(e,t)=>SO(`Could not open the file`,t),setup:async(e,{path:t})=>{let n=To(e,`rfm.api`),r=j(e,`rfm.dialog`),i=j(e,`rfm.git`),a;try{a=await n.get(`/api/file`,{query:{path:t}})}catch(e){if(!e.body?.isDirectory)throw e;return q(Ax({path:e.body.path}),{replace:!0}),null}if(e.abortSignal.aborted)return null;let{entry:o,content:s,isTooLarge:c}=a;if(!o.isText||s===null)return jO(o,c);let l=A(e,`rfm.editor-draft`,s),u=A(e,`rfm.editor-saved`,s),d=A(e,`rfm.editor-saving`,!1),f=A(e,`rfm.editor-rows`,OO()),p=M([l,u],(e,t)=>e!==t),m=async()=>{if(d.get())return;let e=l.get();d.set(!0);try{let t=await n.post(`/api/save-file`,{body:{path:o.path,content:e}});u.set(e),K_({kind:`success`,title:t.message}),GD(n,i)}catch(e){K_({kind:`error`,title:`Could not save the file`,description:Ux(e)})}finally{d.set(!1)}};tu(e,()=>!p.get()||Bw(r,{title:`Unsaved changes`,message:`Discard the unsaved changes to ${o.name}?`,confirmLabel:`Discard`,isDanger:!0}));let h={signal:e.abortSignal};return globalThis.addEventListener(`beforeunload`,e=>{p.get()&&e.preventDefault()},h),globalThis.addEventListener(`resize`,()=>f.set(OO()),h),document.addEventListener(`keydown`,e=>{kO(e)&&(e.preventDefault(),m())},h),Zb({gap:3},AO(o,[J({size:`sm`,events:{click:()=>q(jx(o.path))}},K(wd,{size:`sm`}),`View`),J({size:`sm`,variant:`primary`,loading:d,disabled:M([p],e=>!e),events:{click:m}},K(of,{size:`sm`}),`Save`)]),Z({gap:2,verticalAlign:`center`},Ef({inline:!0,size:`sm`,tone:`secondary`},Qw(o.path)),Ef({inline:!0,size:`sm`,tone:`secondary`},p.text(e=>e?`· Unsaved changes`:`· Saved`))),eC({value:l,language:Qw(o.path),lineNumbers:!0,rows:f,ariaLabel:`Contents of ${o.name}`}))}}),NO=T(`rfm-file-editor`,{setup:()=>{let e=OT(Q.edit);return EO(e.view(e=>e?MO({path:e.path??``}):null))}}),PO=({title:e,count:t,actions:n=[]},...r)=>qp({header:Z({horizontalAlign:`justify`,verticalAlign:`center`,wrap:!0},Z({gap:2,verticalAlign:`center`},wf({level:2},e),t===void 0?null:Y({size:`sm`},t)),n.length>0?Z({gap:2},...n):null)},...r),FO=(e,t,n)=>J({size:`sm`,events:{click:n}},K(t,{size:`sm`}),e),IO=(e,t)=>{let n=aT[e.status]??aT.modified,r;return e.canDiff?r=Fx({path:e.servedPath,mode:t}):e.canOpen&&(r=jx(e.servedPath)),{id:e.path,title:e.displayPath,description:e.originalDisplayPath?`Renamed from ${e.originalDisplayPath}`:void 0,tag:{text:e.statusCode,color:n.color},href:r}},LO=(e,t,n,r)=>{if(t.length===0)return null;let i=new Map(t.map(e=>[e.path,e]));return PO({title:e,count:t.length,actions:r},qT({label:e,items:t.map(e=>IO(e,n)),actions:e=>{let t=i.get(e.id);return t.canDiff&&t.canOpen?J({size:`sm`,variant:`ghost`,square:!0,label:`Open ${t.displayPath}`,events:{click:()=>q(jx(t.servedPath))}},K(wd,{size:`sm`})):null}}))},RO=e=>{if(e.isCurrent)return{text:`current`,color:`green`};if(e.isPrunable)return{text:`missing`,color:`red`};if(e.isLocked)return{text:`locked`,color:`amber`};if(e.isDetached)return{text:`detached`,color:`gray`}},zO=(e,t)=>{if(t.length<2)return null;let n=new Map(t.map(e=>[e.path,e]));return PO({title:`Worktrees`,count:t.length},Ef({size:`sm`,tone:`secondary`},`Switching serves that worktree's files.`),qT({label:`Worktrees`,items:t.map(e=>({id:e.path,title:e.label,description:`${e.path} · ${e.shortHead??`—`}`,icon:Wd,tag:RO(e)})),actions:t=>{let r=n.get(t.id);return r.isCurrent?null:J({size:`sm`,disabled:r.isPrunable,events:{click:()=>qx(e,r)}},K(dd,{size:`sm`}),`Switch`)}}))},BO=e=>e.length===0?null:PO({title:`Recent commits`,actions:[FO(`View all`,af,()=>q(Px()))]},KE({label:`Recent commits`,items:e.map(e=>({id:e.hash,time:e.date,title:e.subject,description:`${e.shortHash} · ${e.author}`,href:Fx({commit:e.hash})}))})),VO=e=>{let{repository:t}=e;return[{term:`HEAD`,details:ts(t.head??`—`)},{term:`Upstream`,details:t.upstream??`none`},t.upstream?{term:`Ahead / behind`,details:`↑${t.ahead} ↓${t.behind}`}:null,{term:`Changes`,details:String(e.changeCount)}].filter(Boolean)},HO=T(`rfm-git-status-panel`,{loading:()=>Pv({label:`Reading the repository`}),error:(e,t)=>SO(`Could not read the git status`,t),setup:async e=>{let t=To(e,`rfm.api`),n=await t.get(`/api/git/status`),{repository:r,scopePath:i}=n;return Zb({gap:4},xO({glyph:Wd,title:r.branch,subtitle:i?`${r.repoRoot} · changes in ${i}/ only`:r.repoRoot,actions:[FO(`Commit history`,af,()=>q(Px()))]}),qp({padding:`sm`},$h({columns:3,items:VO(n)})),n.changeCount===0?Kv({kind:`success`,title:i?`No changes in this directory`:`The working tree is clean`}):null,zO(t,n.worktrees),LO(`Staged changes`,n.staged,`staged`,[FO(`View staged diff`,kd,()=>q(Fx({staged:`1`})))]),LO(`Unstaged changes`,n.unstaged,`unstaged`,[FO(`View all changes`,kd,()=>q(Fx({all:`1`})))]),LO(`Untracked files`,n.untracked,`unstaged`),BO(n.recentCommits))}}),UO=T(`rfm-git-status`,{setup:()=>EO(HO())}),WO=e=>e.replace(/^HEAD -> /,``),GO=e=>({id:e.hash,title:e.subject,description:`${e.shortHash} · ${e.author} · ${sD(e.date)}`,href:Fx({commit:e.hash}),tag:e.refs.length>0?{text:WO(e.refs[0]),color:e.refs[0].startsWith(`HEAD`)?`green`:`blue`}:void 0}),KO=(e,t,n,r)=>J({size:`sm`,pressed:M([r],e=>e[t]===n.hash),label:`Compare ${t===`from`?`from`:`to`} ${n.shortHash}`,events:{click:()=>r.set(e=>({...e,[t]:n.hash}))}},e),qO=(e,t)=>e.find(e=>e.hash===t)?.shortHash??``,JO=T(`rfm-git-history-panel`,{loading:()=>Pv({label:`Reading the history`}),error:(e,t)=>SO(`Could not read the history`,t),setup:async(e,{path:t})=>{let n=To(e,`rfm.api`),r=await n.get(`/api/git/log`,{query:{path:t||void 0,skip:0}});if(e.abortSignal.aborted)return null;let i=A(e,`rfm.history-commits`,r.commits),a=A(e,`rfm.history-more`,r.hasMore),o=A(e,`rfm.history-picks`,{from:r.commits[1]?.hash??null,to:r.commits[0]?.hash??null}),s=async()=>{let e=await n.get(`/api/git/log`,{query:{path:t||void 0,skip:i.get().length}});i.set(t=>[...t,...e.commits]),a.set(e.hasMore)},c=()=>{let{from:e,to:t}=o.get();return!e||!t?K_({kind:`warning`,title:`Pick both an A and a B commit`}):e===t?K_({kind:`warning`,title:`Pick two different commits`}):q(Ix(e,t))},l=xO({glyph:af,title:`Commit history`,subtitle:r.repository.branch,actions:[J({size:`sm`,events:{click:()=>q(Nx())}},K(Gd,{size:`sm`}),`Git status`)]}),u=r.scopePath?Kv({kind:`info`,title:`History for ${r.scopePath}`},Bf({href:Px()},`Show the whole history`)):null;return r.commits.length===0?Zb({gap:4},l,u,Rc({icon:af,title:`No commits found${r.scopePath?` for this path`:``}`})):Zb({gap:4},l,u,Z({gap:2,verticalAlign:`center`,wrap:!0},Ef({inline:!0,size:`sm`,tone:`secondary`},`Pick A (from) and B (to) to compare:`),Ef({inline:!0,size:`sm`,weight:`bold`},M([o,i],({from:e,to:t},n)=>e&&t?`${qO(n,e)} → ${qO(n,t)}`:``).text()),J({size:`sm`,events:{click:()=>o.set(({from:e,to:t})=>({from:t,to:e}))}},K(fd,{size:`sm`}),`Swap`),J({size:`sm`,variant:`primary`,events:{click:c}},K(Gd,{size:`sm`}),`Compare`)),qT({label:`Commits`,items:M([i],e=>e.map(GO)),hasMore:a,onLoadMore:s,leading:e=>{let t=i.get().find(t=>t.hash===e.id);return Z({joined:!0},KO(`A`,`from`,t,o),KO(`B`,`to`,t,o))},actions:e=>J({size:`sm`,variant:`ghost`,square:!0,label:`View the changes of ${e.title}`,events:{click:()=>q(Fx({commit:e.id}))}},K(kd,{size:`sm`}))}))}}),YO=T(`rfm-git-history`,{setup:()=>{let e=OT(Q.history);return EO(e.view(e=>e?JO({path:e.path??``}):null))}}),XO=e=>{let t=[],n=0;for(;n<e.length;){let r=e[n];if(r.type===`context`||r.type===`note`){t.push({left:r,right:r}),n++;continue}let i=[],a=[];for(;n<e.length&&e[n].type===`removed`;)i.push(e[n++]);for(;n<e.length&&e[n].type===`added`;)a.push(e[n++]);for(let e=0;e<Math.max(i.length,a.length);e++)t.push({left:i[e]??null,right:a[e]??null})}return t},ZO=e=>e.reduce((e,t)=>({added:e.added+t.added,removed:e.removed+t.removed}),{added:0,removed:0}),QO={added:`+`,removed:`-`,context:` `},$O=e=>`@@ ${e.range} @@${e.heading?` ${e.heading}`:``}`,ek=e=>e.type===`note`?Ts({class:`note`},H({class:`gutter`}),H({class:`gutter`}),H({class:`code`},e.content)):Ts({class:e.type},H({class:`gutter`},e.oldLineNumber??``),H({class:`gutter`},e.newLineNumber??``),H({class:`code`},V({class:`marker`},QO[e.type]),e.content)),tk=e=>bs(xs(e.hunks.flatMap(e=>[Ts({class:`hunk`},H({class:`gutter`,colspan:`2`},`⋯`),H({class:`code`},$O(e))),...e.lines.map(ek)]))),nk=(e,t)=>{if(!e)return[H({class:`gutter`}),H({class:`code empty`})];if(e.type===`note`)return[H({class:`gutter`}),H({class:`code note`},e.content)];let n=t===`left`?e.oldLineNumber:e.newLineNumber;return[H({class:`gutter`},n??``),H({class:[`code`,e.type]},e.content)]},rk=e=>bs({class:`split`},xs(e.hunks.flatMap(e=>[Ts({class:`hunk`},H({class:`gutter`},`⋯`),H({class:`code`},$O(e)),H({class:`gutter`},`⋯`),H({class:`code`})),...XO(e.lines).map(e=>Ts(...nk(e.left,`left`),...nk(e.right,`right`)))]))),ik=(e,t)=>e.isBinary?B({class:`empty-note`},`Binary file, there is no textual diff to show.`):e.hunks.length===0?B({class:`empty-note`},`No changes to show for this file.`):B({class:`scroll`},t.view(t=>t===`split`?rk(e):tk(e))),ak=T(`rfm-diff-file`,{styles:`
    :host { display: block; scroll-margin-block-start: var(--imp-space-4, 16px) }
    details {
      border: var(--imp-border-width, 1px) solid var(--imp-color-border, #cbd5e1);
      border-radius: var(--imp-radius-container, 10px);
      background: var(--imp-color-surface, #ffffff);
      overflow: hidden;
    }
    summary {
      display: flex;
      align-items: center;
      gap: var(--imp-space-2, 8px);
      padding: var(--imp-space-2, 8px) var(--imp-space-3, 12px);
      background: var(--imp-color-surface-sunken, #f1f5f9);
      color: var(--imp-color-text, #0f172a);
      font-family: var(--imp-font-family, system-ui, sans-serif);
      cursor: pointer;
    }
    summary:focus-visible {
      outline: var(--imp-focus-ring-width, 2px) solid var(--imp-color-primary, #2563eb);
      outline-offset: -2px;
    }
    .path {
      flex: 1;
      min-inline-size: 0;
      display: flex;
      align-items: center;
      gap: var(--imp-space-1, 4px);
      overflow: hidden;
      font-family: var(--imp-font-family-mono, monospace);
      font-size: var(--imp-font-size-sm, 0.875rem);
      overflow-wrap: anywhere;
    }
    .from { color: var(--imp-color-secondary, #64748b) }
    .scroll { overflow-x: auto }
    table {
      inline-size: 100%;
      border-collapse: collapse;
      font-family: var(--imp-font-family-mono, monospace);
      font-size: var(--imp-font-size-sm, 0.875rem);
      line-height: 1.5;
      color: var(--imp-color-text, #0f172a);
    }
    table.split { table-layout: fixed }
    table.split .gutter { inline-size: 3.5rem }
    .gutter {
      inline-size: 1%;
      padding: 0 var(--imp-space-2, 8px);
      color: var(--imp-color-secondary, #64748b);
      text-align: end;
      white-space: nowrap;
      user-select: none;
      vertical-align: top;
    }
    .code { padding: 0 var(--imp-space-2, 8px); white-space: pre; }
    table.split .code { white-space: pre-wrap; overflow-wrap: anywhere }
    .marker { display: inline-block; inline-size: 1.25ch; user-select: none; color: var(--imp-color-secondary, #64748b) }
    .added, td.added { background: color-mix(in srgb, var(--imp-color-success, #16a34a) 14%, transparent) }
    .removed, td.removed { background: color-mix(in srgb, var(--imp-color-danger, #dc2626) 14%, transparent) }
    .hunk td { background: color-mix(in srgb, var(--imp-color-info, #0284c7) 10%, transparent); color: var(--imp-color-secondary, #64748b) }
    .note, td.note { color: var(--imp-color-secondary, #64748b); font-style: italic }
    td.empty { background: var(--imp-color-surface-sunken, #f1f5f9) }
    .empty-note {
      padding: var(--imp-space-3, 12px);
      color: var(--imp-color-secondary, #64748b);
      font-family: var(--imp-font-family, system-ui, sans-serif);
    }
    @media (forced-colors: active) {
      .added .marker, .removed .marker { color: CanvasText }
    }
  `,setup:(e,{file:t,mode:n,focus:r})=>{let i=aT[t.status]??aT.modified,a=ns({open:!0},ys(Y({size:`sm`,color:i.color},t.status),V({class:`path`},t.originalPath?V({class:`from`},t.originalPath):null,t.originalPath?K(dd,{size:`sm`}):null,t.path),Y({size:`sm`,color:`green`},`+${t.added}`),Y({size:`sm`,color:`red`},`-${t.removed}`),t.servedPath?J({size:`sm`,variant:`ghost`,square:!0,label:`Open ${t.servedPath}`,events:{click:e=>{e.preventDefault(),q(jx(t.servedPath))}}},K(wd,{size:`sm`})):null),ik(t,n));return r?.watch(e,n=>{n===t.path&&(a.open=!0,e.host.scrollIntoView({behavior:`smooth`,block:`start`}))}),a}}),ok=`rfm-diff-mode`,sk=[{value:`unified`,label:`Unified view`,icon:Yd},{value:`split`,label:`Side by side view`,icon:bd}],ck=T(`rfm-diff-view`,{setup:(e,{files:t,focus:n})=>{if(t.length===0)return Rc({icon:Dd,title:`No changes to show`});let r=A(e,`rfm.diff-mode`,_T(ok,`unified`)===`split`?`split`:`unified`);r.watch(e,e=>vT(ok,e));let i=ZO(t);return Zb({gap:3},Z({horizontalAlign:`justify`,verticalAlign:`center`,wrap:!0},Z({gap:2,verticalAlign:`center`},Ef({inline:!0,weight:`bold`},`${lD(t.length,`file`)} changed`),Y({size:`sm`,color:`green`},`+${i.added}`),Y({size:`sm`,color:`red`},`-${i.removed}`)),xw({value:r,ariaLabel:`Diff layout`,size:`sm`,options:sk})),...t.map(e=>ak({file:e,mode:r,focus:n})))}}),lk={history:{label:`Back to history`,href:()=>Px()},status:{label:`Back to status`,href:()=>Nx()},files:{label:`Back to files`,href:e=>Ax({path:wx(e??`.`)})}},uk=e=>e.commit?`${e.commit.shortHash} · ${e.commit.author} · ${sD(e.commit.date)}`:e.subtitle??``,dk=(e,t,n)=>J({size:`sm`,events:{click:()=>q(n)}},K(t,{size:`sm`}),e),fk=T(`rfm-git-diff-panel`,{loading:()=>Pv({label:`Reading the diff`}),error:(e,t)=>SO(`Could not read the diff`,t),setup:async(e,{query:t})=>{let n=await To(e,`rfm.api`).get(`/api/git/diff`,{query:t}),r=lk[n.back]??lk.status;return Zb({gap:4},xO({glyph:kd,title:n.title,subtitle:uk(n),actions:[n.filePath?dk(`Edit`,tf,Mx(n.filePath)):null,n.filePath?dk(`History`,af,Px(n.filePath)):null,dk(r.label,ud,r.href(n.filePath))].filter(Boolean)}),ck({files:n.files}))}}),pk=T(`rfm-git-diff`,{setup:()=>{let e=OT(Q.diff);return EO(e.view(e=>e?fk({query:e}):null))}}),mk=(e,{revision:t,commit:n})=>qp({header:Ef({size:`sm`,tone:`secondary`,weight:`bold`},e)},Zb({gap:1},ts(n?n.shortHash:t),n?Ef(n.subject):Ef({tone:`secondary`},`Unresolved revision`),n?Ef({size:`sm`,tone:`secondary`},`${n.author} · ${sD(n.date)} (${cD(n.date)})`):null)),hk=e=>e.added===null?Y({size:`sm`},`binary`):Z({gap:1},Y({size:`sm`,color:`green`},`+${e.added}`),Y({size:`sm`,color:`red`},`-${e.deleted}`)),gk=T(`rfm-git-compare-panel`,{loading:()=>Pv({label:`Comparing the commits`}),error:(e,t)=>SO(`Could not compare the commits`,t),setup:async(e,{from:t,to:n})=>{let r=await To(e,`rfm.api`).get(`/api/git/compare`,{query:{from:t,to:n}});if(e.abortSignal.aborted)return null;let i=A(e,`rfm.compare-focus`,null),a=r.changes;return Zb({gap:4},xO({glyph:Gd,title:`Comparing commits`,subtitle:`${lD(a.length,`file`)} changed`,actions:[J({size:`sm`,events:{click:()=>q(Px())}},K(ud,{size:`sm`}),`Back to history`)]}),Z({gap:3,verticalAlign:`center`,wrap:!0},mk(`From (A)`,r.from),K(dd,{color:`secondary`}),mk(`To (B)`,r.to)),a.length>0?qp({header:Z({gap:2,verticalAlign:`center`},wf({level:2},`Changed files`),Y({size:`sm`},a.length))},qT({label:`Changed files`,items:a.map(e=>({id:e.path,title:e.path,description:e.originalPath?`Renamed from ${e.originalPath}`:void 0,tag:{text:e.statusCode,color:(aT[e.status]??aT.modified).color}})),actions:e=>hk(a.find(t=>t.path===e.id)),events:{select:e=>{i.set(null),i.set(e.detail.id)}}})):null,ck({files:r.files,focus:i}))}}),_k=T(`rfm-git-compare`,{setup:()=>{let e=OT(Q.compare);return EO(e.view(e=>e?gk({from:e.from??``,to:e.to??``}):null))}}),vk={states:[`rfm.git`],check:e=>e===void 0?Wc:e?!0:`/`},yk=e=>(e.ctrlKey||e.metaKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()===`p`,bk=T(`rfm-root`,{setup:e=>{let t=wo(e,`rfm.api`,{baseUrl:``,headers:{accept:`application/json`},requestId:!1}),n=A(e,`rfm.git`),r=A(e,`rfm.search-open`,!1);return A(e,`rfm.dialog`,null),A(e,`rfm.dialog-open`,!1),A(e,`rfm.active-pane`,`left`),GD(t,n),globalThis.addEventListener(`keydown`,e=>{yk(e)&&(e.preventDefault(),e.stopPropagation(),r.set(!0))},{capture:!0,signal:e.abortSignal}),ob({logo:gb({label:`Remote File Manager`,icon:K(Bd,{size:`lg`,color:`primary`}),href:Q.href()}),map:Q,navbar:{label:`Sections`},nav:{[Q]:{icon:zd},[Q.view]:{hidden:!0},[Q.edit]:{hidden:!0},[Q.status]:{icon:Gd},[Q.history]:{icon:af},[Q.diff]:{hidden:!0},[Q.compare]:{hidden:!0}},extras:[gT(),Xx(),Ub()],breadcrumbs:!1,maxWidth:`none`},Cv(),Gw(),hT(),Fu({map:Q,guards:{[Q.status]:vk,[Q.history]:vk,[Q.diff]:vk,[Q.compare]:vk},title:({crumbs:e})=>`${e.at(-1)} · Remote File Manager`,screens:{[Q]:()=>QD(),[Q.view]:()=>DO(),[Q.edit]:()=>NO(),[Q.status]:()=>UO(),[Q.history]:()=>YO(),[Q.diff]:()=>pk(),[Q.compare]:()=>_k()},notFound:()=>Rc({title:`Page not found`})}))}}),xk=globalThis.matchMedia(`(prefers-color-scheme: dark)`).matches;await _a({theme:xk?`imp-dark`:`imp-light`,translations:{en:()=>import(`./en-165a835e.js`)}}),at(`#app`,bk());