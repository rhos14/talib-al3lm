import{o as im,R as Va}from"./vendor-Coarcxbr.js";const om=()=>{};var Wu={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ih=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},am=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],a=n[t++],c=n[t++],l=((s&7)<<18|(i&63)<<12|(a&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(l>>10)),e[r++]=String.fromCharCode(56320+(l&1023))}else{const i=n[t++],a=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|a&63)}}return e.join("")},vh={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],a=s+1<n.length,c=a?n[s+1]:0,l=s+2<n.length,h=l?n[s+2]:0,f=i>>2,m=(i&3)<<4|c>>4;let E=(c&15)<<2|h>>6,S=h&63;l||(S=64,a||(E=64)),r.push(t[f],t[m],t[E],t[S])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Ih(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):am(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],c=s<n.length?t[n.charAt(s)]:0;++s;const h=s<n.length?t[n.charAt(s)]:64;++s;const m=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||c==null||h==null||m==null)throw new cm;const E=i<<2|c>>4;if(r.push(E),h!==64){const S=c<<4&240|h>>2;if(r.push(S),m!==64){const b=h<<6&192|m;r.push(b)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class cm extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const um=function(n){const e=Ih(n);return vh.encodeByteArray(e,!0)},Ei=function(n){return um(n).replace(/\./g,"")},Ah=function(n){try{return vh.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lm(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hm=()=>lm().__FIREBASE_DEFAULTS__,dm=()=>{if(typeof process>"u"||typeof Wu>"u")return;const n=Wu.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},fm=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&Ah(n[1]);return e&&JSON.parse(e)},zi=()=>{try{return om()||hm()||dm()||fm()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Rh=n=>{var e,t;return(t=(e=zi())==null?void 0:e.emulatorHosts)==null?void 0:t[n]},pm=n=>{const e=Rh(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},Ph=()=>{var n;return(n=zi())==null?void 0:n.config},Sh=n=>{var e;return(e=zi())==null?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bh{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mm(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,i=n.sub||n.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a={iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}},...n};return[Ei(JSON.stringify(t)),Ei(JSON.stringify(a)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ve(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function _m(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Ve())}function gm(){var e;const n=(e=zi())==null?void 0:e.forceEnvironment;if(n==="node")return!0;if(n==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function ym(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Em(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Tm(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function wm(){const n=Ve();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Im(){return!gm()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function vm(){try{return typeof indexedDB=="object"}catch{return!1}}function Am(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)==null?void 0:i.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rm="FirebaseError";class It extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=Rm,Object.setPrototypeOf(this,It.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ws.prototype.create)}}class ws{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],a=i?Pm(i,r):"Error",c=`${this.serviceName}: ${a} (${s}).`;return new It(s,c,r)}}function Pm(n,e){return n.replace(Sm,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const Sm=/\{\$([^}]+)}/g;function bm(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function On(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],a=e[s];if(Gu(i)&&Gu(a)){if(!On(i,a))return!1}else if(i!==a)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function Gu(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Is(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function jr(n){const e={};return n.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[s,i]=r.split("=");e[decodeURIComponent(s)]=decodeURIComponent(i)}}),e}function zr(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}function Cm(n,e){const t=new Vm(n,e);return t.subscribe.bind(t)}class Vm{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let s;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");Nm(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:r},s.next===void 0&&(s.next=zo),s.error===void 0&&(s.error=zo),s.complete===void 0&&(s.complete=zo);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Nm(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function zo(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ne(n){return n&&n._delegate?n._delegate:n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $n(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Na(n){return(await fetch(n,{credentials:"include"})).ok}class sn{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rn="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class km{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new bh;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(s){if(r)return null;throw s}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(xm(e))try{this.getOrInitializeService({instanceIdentifier:Rn})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=Rn){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Rn){return this.instances.has(e)}getOptions(e=Rn){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[i,a]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(i);r===c&&a.resolve(s)}return s}onInit(e,t){const r=this.normalizeInstanceIdentifier(t),s=this.onInitCallbacks.get(r)??new Set;s.add(e),this.onInitCallbacks.set(r,s);const i=this.instances.get(r);return i&&e(i,r),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const s of r)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Dm(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Rn){return this.component?this.component.multipleInstances?e:Rn:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Dm(n){return n===Rn?void 0:n}function xm(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Om{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new km(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var J;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(J||(J={}));const Lm={debug:J.DEBUG,verbose:J.VERBOSE,info:J.INFO,warn:J.WARN,error:J.ERROR,silent:J.SILENT},Um=J.INFO,Mm={[J.DEBUG]:"log",[J.VERBOSE]:"log",[J.INFO]:"info",[J.WARN]:"warn",[J.ERROR]:"error"},Fm=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=Mm[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class ka{constructor(e){this.name=e,this._logLevel=Um,this._logHandler=Fm,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in J))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Lm[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,J.DEBUG,...e),this._logHandler(this,J.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,J.VERBOSE,...e),this._logHandler(this,J.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,J.INFO,...e),this._logHandler(this,J.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,J.WARN,...e),this._logHandler(this,J.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,J.ERROR,...e),this._logHandler(this,J.ERROR,...e)}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bm{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(qm(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function qm(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const ia="@firebase/app",Ku="0.15.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kt=new ka("@firebase/app"),$m="@firebase/app-compat",jm="@firebase/analytics-compat",zm="@firebase/analytics",Hm="@firebase/app-check-compat",Wm="@firebase/app-check",Gm="@firebase/auth",Km="@firebase/auth-compat",Qm="@firebase/database",Ym="@firebase/data-connect",Jm="@firebase/database-compat",Xm="@firebase/functions",Zm="@firebase/functions-compat",e_="@firebase/installations",t_="@firebase/installations-compat",n_="@firebase/messaging",r_="@firebase/messaging-compat",s_="@firebase/performance",i_="@firebase/performance-compat",o_="@firebase/remote-config",a_="@firebase/remote-config-compat",c_="@firebase/storage",u_="@firebase/storage-compat",l_="@firebase/firestore",h_="@firebase/ai",d_="@firebase/firestore-compat",f_="firebase",p_="12.15.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const oa="[DEFAULT]",m_={[ia]:"fire-core",[$m]:"fire-core-compat",[zm]:"fire-analytics",[jm]:"fire-analytics-compat",[Wm]:"fire-app-check",[Hm]:"fire-app-check-compat",[Gm]:"fire-auth",[Km]:"fire-auth-compat",[Qm]:"fire-rtdb",[Ym]:"fire-data-connect",[Jm]:"fire-rtdb-compat",[Xm]:"fire-fn",[Zm]:"fire-fn-compat",[e_]:"fire-iid",[t_]:"fire-iid-compat",[n_]:"fire-fcm",[r_]:"fire-fcm-compat",[s_]:"fire-perf",[i_]:"fire-perf-compat",[o_]:"fire-rc",[a_]:"fire-rc-compat",[c_]:"fire-gcs",[u_]:"fire-gcs-compat",[l_]:"fire-fst",[d_]:"fire-fst-compat",[h_]:"fire-vertex","fire-js":"fire-js",[f_]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ti=new Map,__=new Map,aa=new Map;function Qu(n,e){try{n.container.addComponent(e)}catch(t){kt.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Ln(n){const e=n.name;if(aa.has(e))return kt.debug(`There were multiple attempts to register component ${e}.`),!1;aa.set(e,n);for(const t of Ti.values())Qu(t,n);for(const t of __.values())Qu(t,n);return!0}function Hi(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function Le(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const g_={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Zt=new ws("app","Firebase",g_);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class y_{constructor(e,t,r){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new sn("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Zt.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jn=p_;function E_(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r={name:oa,automaticDataCollectionEnabled:!0,...e},s=r.name;if(typeof s!="string"||!s)throw Zt.create("bad-app-name",{appName:String(s)});if(t||(t=Ph()),!t)throw Zt.create("no-options");const i=Ti.get(s);if(i){if(On(t,i.options)&&On(r,i.config))return i;throw Zt.create("duplicate-app",{appName:s})}const a=new Om(s);for(const l of aa.values())a.addComponent(l);const c=new y_(t,r,a);return Ti.set(s,c),c}function Ch(n=oa){const e=Ti.get(n);if(!e&&n===oa&&Ph())return E_();if(!e)throw Zt.create("no-app",{appName:n});return e}function ft(n,e,t){let r=m_[n]??n;t&&(r+=`-${t}`);const s=r.match(/\s|\//),i=e.match(/\s|\//);if(s||i){const a=[`Unable to register library "${r}" with version "${e}":`];s&&a.push(`library name "${r}" contains illegal characters (whitespace or "/")`),s&&i&&a.push("and"),i&&a.push(`version name "${e}" contains illegal characters (whitespace or "/")`),kt.warn(a.join(" "));return}Ln(new sn(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const T_="firebase-heartbeat-database",w_=1,ss="firebase-heartbeat-store";let Ho=null;function Vh(){return Ho||(Ho=im(T_,w_,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(ss)}catch(t){console.warn(t)}}}}).catch(n=>{throw Zt.create("idb-open",{originalErrorMessage:n.message})})),Ho}async function I_(n){try{const t=(await Vh()).transaction(ss),r=await t.objectStore(ss).get(Nh(n));return await t.done,r}catch(e){if(e instanceof It)kt.warn(e.message);else{const t=Zt.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});kt.warn(t.message)}}}async function Yu(n,e){try{const r=(await Vh()).transaction(ss,"readwrite");await r.objectStore(ss).put(e,Nh(n)),await r.done}catch(t){if(t instanceof It)kt.warn(t.message);else{const r=Zt.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});kt.warn(r.message)}}}function Nh(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const v_=1024,A_=30;class R_{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new S_(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=Ju();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(a=>a.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats.length>A_){const a=b_(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(a,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){kt.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Ju(),{heartbeatsToSend:r,unsentEntries:s}=P_(this._heartbeatsCache.heartbeats),i=Ei(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return kt.warn(t),""}}}function Ju(){return new Date().toISOString().substring(0,10)}function P_(n,e=v_){const t=[];let r=n.slice();for(const s of n){const i=t.find(a=>a.agent===s.agent);if(i){if(i.dates.push(s.date),Xu(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),Xu(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class S_{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return vm()?Am().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await I_(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Yu(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Yu(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function Xu(n){return Ei(JSON.stringify({version:2,heartbeats:n})).length}function b_(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function C_(n){Ln(new sn("platform-logger",e=>new Bm(e),"PRIVATE")),Ln(new sn("heartbeat",e=>new R_(e),"PRIVATE")),ft(ia,Ku,n),ft(ia,Ku,"esm2020"),ft("fire-js","")}C_("");function kh(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const V_=kh,Dh=new ws("auth","Firebase",kh());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wi=new ka("@firebase/auth");function N_(n,...e){wi.logLevel<=J.WARN&&wi.warn(`Auth (${jn}): ${n}`,...e)}function ci(n,...e){wi.logLevel<=J.ERROR&&wi.error(`Auth (${jn}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nt(n,...e){throw xa(n,...e)}function it(n,...e){return xa(n,...e)}function Da(n,e,t){const r={...V_(),[e]:t};return new ws("auth","Firebase",r).create(e,{appName:n.name})}function pt(n){return Da(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function k_(n,e,t){const r=t;if(!(e instanceof r))throw r.name!==e.constructor.name&&nt(n,"argument-error"),Da(n,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function xa(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return Dh.create(n,...e)}function j(n,e,...t){if(!n)throw xa(e,...t)}function Rt(n){const e="INTERNAL ASSERTION FAILED: "+n;throw ci(e),new Error(e)}function Dt(n,e){n||Rt(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ca(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.href)||""}function D_(){return Zu()==="http:"||Zu()==="https:"}function Zu(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function x_(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(D_()||Em()||"connection"in navigator)?navigator.onLine:!0}function O_(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vs{constructor(e,t){this.shortDelay=e,this.longDelay=t,Dt(t>e,"Short delay should be less than long delay!"),this.isMobile=_m()||Tm()}get(){return x_()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oa(n,e){Dt(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xh{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Rt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Rt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Rt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const L_={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const U_=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],M_=new vs(3e4,6e4);function Ut(n,e){return n.tenantId&&!e.tenantId?{...e,tenantId:n.tenantId}:e}async function vt(n,e,t,r,s={}){return Oh(n,s,async()=>{let i={},a={};r&&(e==="GET"?a=r:i={body:JSON.stringify(r)});const c=Is({...a,key:n.config.apiKey}).slice(1),l=await n._getAdditionalHeaders();l["Content-Type"]="application/json",n.languageCode&&(l["X-Firebase-Locale"]=n.languageCode);const h={method:e,headers:l,...i};return ym()||(h.referrerPolicy="strict-origin-when-cross-origin"),n.emulatorConfig&&$n(n.emulatorConfig.host)&&(h.credentials="include"),xh.fetch()(await Lh(n,n.config.apiHost,t,c),h)})}async function Oh(n,e,t){n._canInitEmulator=!1;const r={...L_,...e};try{const s=new B_(n),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const a=await i.json();if("needConfirmation"in a)throw Zs(n,"account-exists-with-different-credential",a);if(i.ok&&!("errorMessage"in a))return a;{const c=i.ok?a.errorMessage:a.error.message,[l,h]=c.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw Zs(n,"credential-already-in-use",a);if(l==="EMAIL_EXISTS")throw Zs(n,"email-already-in-use",a);if(l==="USER_DISABLED")throw Zs(n,"user-disabled",a);const f=r[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(h)throw Da(n,f,h);nt(n,f)}}catch(s){if(s instanceof It)throw s;nt(n,"network-request-failed",{message:String(s)})}}async function As(n,e,t,r,s={}){const i=await vt(n,e,t,r,s);return"mfaPendingCredential"in i&&nt(n,"multi-factor-auth-required",{_serverResponse:i}),i}async function Lh(n,e,t,r){const s=`${e}${t}?${r}`,i=n,a=i.config.emulator?Oa(n.config,s):`${n.config.apiScheme}://${s}`;return U_.includes(t)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(a).toString():a}function F_(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class B_{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(it(this.auth,"network-request-failed")),M_.get())})}}function Zs(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const s=it(n,e,r);return s.customData._tokenResponse=t,s}function el(n){return n!==void 0&&n.enterprise!==void 0}class q_{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return F_(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function $_(n,e){return vt(n,"GET","/v2/recaptchaConfig",Ut(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function j_(n,e){return vt(n,"POST","/v1/accounts:delete",e)}async function Ii(n,e){return vt(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qr(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function z_(n,e=!1){const t=ne(n),r=await t.getIdToken(e),s=La(r);j(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,a=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:Qr(Wo(s.auth_time)),issuedAtTime:Qr(Wo(s.iat)),expirationTime:Qr(Wo(s.exp)),signInProvider:a||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function Wo(n){return Number(n)*1e3}function La(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return ci("JWT malformed, contained fewer than 3 sections"),null;try{const s=Ah(t);return s?JSON.parse(s):(ci("Failed to decode base64 JWT payload"),null)}catch(s){return ci("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function tl(n){const e=La(n);return j(e,"internal-error"),j(typeof e.exp<"u","internal-error"),j(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ar(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof It&&H_(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function H_({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class W_{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const r=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ua{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Qr(this.lastLoginAt),this.creationTime=Qr(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function vi(n){var m;const e=n.auth,t=await n.getIdToken(),r=await ar(n,Ii(e,{idToken:t}));j(r==null?void 0:r.users.length,e,"internal-error");const s=r.users[0];n._notifyReloadListener(s);const i=(m=s.providerUserInfo)!=null&&m.length?Uh(s.providerUserInfo):[],a=K_(n.providerData,i),c=n.isAnonymous,l=!(n.email&&s.passwordHash)&&!(a!=null&&a.length),h=c?l:!1,f={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:a,metadata:new ua(s.createdAt,s.lastLoginAt),isAnonymous:h};Object.assign(n,f)}async function G_(n){const e=ne(n);await vi(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function K_(n,e){return[...n.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function Uh(n){return n.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Q_(n,e){const t=await Oh(n,{},async()=>{const r=Is({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=n.config,a=await Lh(n,s,"/v1/token",`key=${i}`),c=await n._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const l={method:"POST",headers:c,body:r};return n.emulatorConfig&&$n(n.emulatorConfig.host)&&(l.credentials="include"),xh.fetch()(a,l)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function Y_(n,e){return vt(n,"POST","/v2/accounts:revokeToken",Ut(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rr{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){j(e.idToken,"internal-error"),j(typeof e.idToken<"u","internal-error"),j(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):tl(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){j(e.length!==0,"internal-error");const t=tl(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(j(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:s,expiresIn:i}=await Q_(e,t);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:s,expirationTime:i}=t,a=new rr;return r&&(j(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),s&&(j(typeof s=="string","internal-error",{appName:e}),a.accessToken=s),i&&(j(typeof i=="number","internal-error",{appName:e}),a.expirationTime=i),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new rr,this.toJSON())}_performRefresh(){return Rt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ht(n,e){j(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class st{constructor({uid:e,auth:t,stsTokenManager:r,...s}){this.providerId="firebase",this.proactiveRefresh=new W_(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new ua(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await ar(this,this.stsTokenManager.getToken(this.auth,e));return j(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return z_(this,e)}reload(){return G_(this)}_assign(e){this!==e&&(j(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new st({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){j(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await vi(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Le(this.auth.app))return Promise.reject(pt(this.auth));const e=await this.getIdToken();return await ar(this,j_(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const r=t.displayName??void 0,s=t.email??void 0,i=t.phoneNumber??void 0,a=t.photoURL??void 0,c=t.tenantId??void 0,l=t._redirectEventId??void 0,h=t.createdAt??void 0,f=t.lastLoginAt??void 0,{uid:m,emailVerified:E,isAnonymous:S,providerData:b,stsTokenManager:L}=t;j(m&&L,e,"internal-error");const k=rr.fromJSON(this.name,L);j(typeof m=="string",e,"internal-error"),Ht(r,e.name),Ht(s,e.name),j(typeof E=="boolean",e,"internal-error"),j(typeof S=="boolean",e,"internal-error"),Ht(i,e.name),Ht(a,e.name),Ht(c,e.name),Ht(l,e.name),Ht(h,e.name),Ht(f,e.name);const $=new st({uid:m,auth:e,email:s,emailVerified:E,displayName:r,isAnonymous:S,photoURL:a,phoneNumber:i,tenantId:c,stsTokenManager:k,createdAt:h,lastLoginAt:f});return b&&Array.isArray(b)&&($.providerData=b.map(W=>({...W}))),l&&($._redirectEventId=l),$}static async _fromIdTokenResponse(e,t,r=!1){const s=new rr;s.updateFromServerResponse(t);const i=new st({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await vi(i),i}static async _fromGetAccountInfoResponse(e,t,r){const s=t.users[0];j(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?Uh(s.providerUserInfo):[],a=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),c=new rr;c.updateFromIdToken(r);const l=new st({uid:s.localId,auth:e,stsTokenManager:c,isAnonymous:a}),h={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new ua(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(l,h),l}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nl=new Map;function Pt(n){Dt(n instanceof Function,"Expected a class definition");let e=nl.get(n);return e?(Dt(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,nl.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mh{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Mh.type="NONE";const rl=Mh;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ui(n,e,t){return`firebase:${n}:${e}:${t}`}class sr{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=ui(this.userKey,s.apiKey,i),this.fullPersistenceKey=ui("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await Ii(this.auth,{idToken:e}).catch(()=>{});return t?st._fromGetAccountInfoResponse(this.auth,t,e):null}return st._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new sr(Pt(rl),e,r);const s=(await Promise.all(t.map(async h=>{if(await h._isAvailable())return h}))).filter(h=>h);let i=s[0]||Pt(rl);const a=ui(r,e.config.apiKey,e.name);let c=null;for(const h of t)try{const f=await h._get(a);if(f){let m;if(typeof f=="string"){const E=await Ii(e,{idToken:f}).catch(()=>{});if(!E)break;m=await st._fromGetAccountInfoResponse(e,E,f)}else m=st._fromJSON(e,f);h!==i&&(c=m),i=h;break}}catch{}const l=s.filter(h=>h._shouldAllowMigration);return!i._shouldAllowMigration||!l.length?new sr(i,e,r):(i=l[0],c&&await i._set(a,c.toJSON()),await Promise.all(t.map(async h=>{if(h!==i)try{await h._remove(a)}catch{}})),new sr(i,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sl(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if($h(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Fh(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(zh(e))return"Blackberry";if(Hh(e))return"Webos";if(Bh(e))return"Safari";if((e.includes("chrome/")||qh(e))&&!e.includes("edge/"))return"Chrome";if(jh(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Fh(n=Ve()){return/firefox\//i.test(n)}function Bh(n=Ve()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function qh(n=Ve()){return/crios\//i.test(n)}function $h(n=Ve()){return/iemobile/i.test(n)}function jh(n=Ve()){return/android/i.test(n)}function zh(n=Ve()){return/blackberry/i.test(n)}function Hh(n=Ve()){return/webos/i.test(n)}function Ua(n=Ve()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function J_(n=Ve()){var e;return Ua(n)&&!!((e=window.navigator)!=null&&e.standalone)}function X_(){return wm()&&document.documentMode===10}function Wh(n=Ve()){return Ua(n)||jh(n)||Hh(n)||zh(n)||/windows phone/i.test(n)||$h(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gh(n,e=[]){let t;switch(n){case"Browser":t=sl(Ve());break;case"Worker":t=`${sl(Ve())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${jn}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Z_{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=i=>new Promise((a,c)=>{try{const l=e(i);a(l)}catch(l){c(l)}});r.onAbort=t,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function eg(n,e={}){return vt(n,"GET","/v2/passwordPolicy",Ut(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tg=6;class ng{constructor(e){var r;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??tg,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((r=e.allowedNonAlphanumericCharacters)==null?void 0:r.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rg{constructor(e,t,r,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new il(this),this.idTokenSubscription=new il(this),this.beforeStateQueue=new Z_(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Dh,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=Pt(t)),this._initializationPromise=this.queue(async()=>{var r,s,i;if(!this._deleted&&(this.persistenceManager=await sr.create(this,e),(r=this._resolvePersistenceManagerAvailable)==null||r.call(this),!this._deleted)){if((s=this._popupRedirectResolver)!=null&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((i=this.currentUser)==null?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Ii(this,{idToken:e}),r=await st._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var i;if(Le(this.app)){const a=this.app.settings.authIdToken;return a?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(c,c))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let r=t,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const a=(i=this.redirectUser)==null?void 0:i._redirectEventId,c=r==null?void 0:r._redirectEventId,l=await this.tryRedirectSignIn(e);(!a||a===c)&&(l!=null&&l.user)&&(r=l.user,s=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(r)}catch(a){r=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return j(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await vi(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=O_()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Le(this.app))return Promise.reject(pt(this));const t=e?ne(e):null;return t&&j(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&j(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Le(this.app)?Promise.reject(pt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Le(this.app)?Promise.reject(pt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Pt(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await eg(this),t=new ng(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new ws("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await Y_(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&Pt(e)||this._popupRedirectResolver;j(t,this,"argument-error"),this.redirectPersistenceManager=await sr.create(this,[Pt(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)==null?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((t=this.currentUser)==null?void 0:t.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let a=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(j(c,this,"internal-error"),c.then(()=>{a||i(this.currentUser)}),typeof t=="function"){const l=e.addObserver(t,r,s);return()=>{a=!0,l()}}else{const l=e.addObserver(t);return()=>{a=!0,l()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return j(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Gh(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var s;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await((s=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:s.getHeartbeatsHeader());t&&(e["X-Firebase-Client"]=t);const r=await this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e}async _getAppCheckToken(){var t;if(Le(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken());return e!=null&&e.error&&N_(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function At(n){return ne(n)}class il{constructor(e){this.auth=e,this.observer=null,this.addObserver=Cm(t=>this.observer=t)}get next(){return j(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Wi={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function sg(n){Wi=n}function Kh(n){return Wi.loadJS(n)}function ig(){return Wi.recaptchaEnterpriseScript}function og(){return Wi.gapiScript}function ag(n){return`__${n}${Math.floor(Math.random()*1e6)}`}class cg{constructor(){this.enterprise=new ug}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class ug{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}const lg="recaptcha-enterprise",Qh="NO_RECAPTCHA",ol="onFirebaseAuthREInstanceReady";class Wt{constructor(e){this.type=lg,this.auth=At(e)}async verify(e="verify",t=!1){async function r(i){if(!t){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(a,c)=>{$_(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(l=>{if(l.recaptchaKey===void 0)c(new Error("recaptcha Enterprise site key undefined"));else{const h=new q_(l);return i.tenantId==null?i._agentRecaptchaConfig=h:i._tenantRecaptchaConfigs[i.tenantId]=h,a(h.siteKey)}}).catch(l=>{c(l)})})}function s(i,a,c){const l=window.grecaptcha;el(l)?l.enterprise.ready(()=>{l.enterprise.execute(i,{action:e}).then(h=>{a(h)}).catch(()=>{a(Qh)})}):c(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new cg().execute("siteKey",{action:"verify"}):new Promise((i,a)=>{r(this.auth).then(async c=>{if(!t&&el(window.grecaptcha)&&Wt.scriptInjectionDeferred)await Wt.scriptInjectionDeferred.promise,s(c,i,a);else{if(typeof window>"u"){a(new Error("RecaptchaVerifier is only supported in browser"));return}let l=ig();l.length!==0&&(l+=c+`&onload=${ol}`),Wt.scriptInjectionDeferred=new bh,window[ol]=()=>{var h;(h=Wt.scriptInjectionDeferred)==null||h.resolve()},Kh(l).then(()=>{var h;return(h=Wt.scriptInjectionDeferred)==null?void 0:h.promise}).then(()=>{s(c,i,a)}).catch(h=>{a(h)})}}).catch(c=>{a(c)})})}}Wt.scriptInjectionDeferred=null;async function al(n,e,t,r=!1,s=!1){const i=new Wt(n);let a;if(s)a=Qh;else try{a=await i.verify(t)}catch{a=await i.verify(t,!0)}const c={...e};if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in c){const l=c.phoneEnrollmentInfo.phoneNumber,h=c.phoneEnrollmentInfo.recaptchaToken;Object.assign(c,{phoneEnrollmentInfo:{phoneNumber:l,recaptchaToken:h,captchaResponse:a,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in c){const l=c.phoneSignInInfo.recaptchaToken;Object.assign(c,{phoneSignInInfo:{recaptchaToken:l,captchaResponse:a,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return c}return r?Object.assign(c,{captchaResp:a}):Object.assign(c,{captchaResponse:a}),Object.assign(c,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(c,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),c}async function Ai(n,e,t,r,s){var i;if((i=n._getRecaptchaConfig())!=null&&i.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const a=await al(n,e,t,t==="getOobCode");return r(n,a)}else return r(n,e).catch(async a=>{if(a.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const c=await al(n,e,t,t==="getOobCode");return r(n,c)}else return Promise.reject(a)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hg(n,e){const t=Hi(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(On(i,e??{}))return s;nt(s,"already-initialized")}return t.initialize({options:e})}function dg(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(Pt);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function fg(n,e,t){const r=At(n);j(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!1,i=Yh(e),{host:a,port:c}=pg(e),l=c===null?"":`:${c}`,h={url:`${i}//${a}${l}/`},f=Object.freeze({host:a,port:c,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!r._canInitEmulator){j(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),j(On(h,r.config.emulator)&&On(f,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=h,r.emulatorConfig=f,r.settings.appVerificationDisabledForTesting=!0,$n(a)?Na(`${i}//${a}${l}`):mg()}function Yh(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function pg(n){const e=Yh(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:cl(r.substr(i.length+1))}}else{const[i,a]=r.split(":");return{host:i,port:cl(a)}}}function cl(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function mg(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ma{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Rt("not implemented")}_getIdTokenResponse(e){return Rt("not implemented")}_linkToIdToken(e,t){return Rt("not implemented")}_getReauthenticationResolver(e){return Rt("not implemented")}}async function _g(n,e){return vt(n,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function gg(n,e){return As(n,"POST","/v1/accounts:signInWithPassword",Ut(n,e))}async function yg(n,e){return vt(n,"POST","/v1/accounts:sendOobCode",Ut(n,e))}async function Eg(n,e){return yg(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Tg(n,e){return As(n,"POST","/v1/accounts:signInWithEmailLink",Ut(n,e))}async function wg(n,e){return As(n,"POST","/v1/accounts:signInWithEmailLink",Ut(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class is extends Ma{constructor(e,t,r,s=null){super("password",r),this._email=e,this._password=t,this._tenantId=s}static _fromEmailAndPassword(e,t){return new is(e,t,"password")}static _fromEmailAndCode(e,t,r=null){return new is(e,t,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Ai(e,t,"signInWithPassword",gg);case"emailLink":return Tg(e,{email:this._email,oobCode:this._password});default:nt(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const r={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Ai(e,r,"signUpPassword",_g);case"emailLink":return wg(e,{idToken:t,email:this._email,oobCode:this._password});default:nt(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ir(n,e){return As(n,"POST","/v1/accounts:signInWithIdp",Ut(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ig="http://localhost";class Un extends Ma{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Un(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):nt("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s,...i}=t;if(!r||!s)return null;const a=new Un(r,s);return a.idToken=i.idToken||void 0,a.accessToken=i.accessToken||void 0,a.secret=i.secret,a.nonce=i.nonce,a.pendingToken=i.pendingToken||null,a}_getIdTokenResponse(e){const t=this.buildRequest();return ir(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,ir(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,ir(e,t)}buildRequest(){const e={requestUri:Ig,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=Is(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vg(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function Ag(n){const e=jr(zr(n)).link,t=e?jr(zr(e)).deep_link_id:null,r=jr(zr(n)).deep_link_id;return(r?jr(zr(r)).link:null)||r||t||e||n}class Fa{constructor(e){const t=jr(zr(e)),r=t.apiKey??null,s=t.oobCode??null,i=vg(t.mode??null);j(r&&s&&i,"argument-error"),this.apiKey=r,this.operation=i,this.code=s,this.continueUrl=t.continueUrl??null,this.languageCode=t.lang??null,this.tenantId=t.tenantId??null}static parseLink(e){const t=Ag(e);try{return new Fa(t)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pr{constructor(){this.providerId=pr.PROVIDER_ID}static credential(e,t){return is._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const r=Fa.parseLink(t);return j(r,"argument-error"),is._fromEmailAndCode(e,r.code,r.tenantId)}}pr.PROVIDER_ID="password";pr.EMAIL_PASSWORD_SIGN_IN_METHOD="password";pr.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ba{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rs extends Ba{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gt extends Rs{constructor(){super("facebook.com")}static credential(e){return Un._fromParams({providerId:Gt.PROVIDER_ID,signInMethod:Gt.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Gt.credentialFromTaggedObject(e)}static credentialFromError(e){return Gt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Gt.credential(e.oauthAccessToken)}catch{return null}}}Gt.FACEBOOK_SIGN_IN_METHOD="facebook.com";Gt.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kt extends Rs{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Un._fromParams({providerId:Kt.PROVIDER_ID,signInMethod:Kt.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return Kt.credentialFromTaggedObject(e)}static credentialFromError(e){return Kt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return Kt.credential(t,r)}catch{return null}}}Kt.GOOGLE_SIGN_IN_METHOD="google.com";Kt.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qt extends Rs{constructor(){super("github.com")}static credential(e){return Un._fromParams({providerId:Qt.PROVIDER_ID,signInMethod:Qt.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Qt.credentialFromTaggedObject(e)}static credentialFromError(e){return Qt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Qt.credential(e.oauthAccessToken)}catch{return null}}}Qt.GITHUB_SIGN_IN_METHOD="github.com";Qt.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yt extends Rs{constructor(){super("twitter.com")}static credential(e,t){return Un._fromParams({providerId:Yt.PROVIDER_ID,signInMethod:Yt.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return Yt.credentialFromTaggedObject(e)}static credentialFromError(e){return Yt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return Yt.credential(t,r)}catch{return null}}}Yt.TWITTER_SIGN_IN_METHOD="twitter.com";Yt.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Jh(n,e){return As(n,"POST","/v1/accounts:signUp",Ut(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xt{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,s=!1){const i=await st._fromIdTokenResponse(e,r,s),a=ul(r);return new xt({user:i,providerId:a,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const s=ul(r);return new xt({user:e,providerId:s,_tokenResponse:r,operationType:t})}}function ul(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function YA(n){var s;if(Le(n.app))return Promise.reject(pt(n));const e=At(n);if(await e._initializationPromise,(s=e.currentUser)!=null&&s.isAnonymous)return new xt({user:e.currentUser,providerId:null,operationType:"signIn"});const t=await Jh(e,{returnSecureToken:!0}),r=await xt._fromIdTokenResponse(e,"signIn",t,!0);return await e._updateCurrentUser(r.user),r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ri extends It{constructor(e,t,r,s){super(t.code,t.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,Ri.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,s){return new Ri(e,t,r,s)}}function Xh(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?Ri._fromErrorAndOperation(n,i,e,r):i})}async function Rg(n,e,t=!1){const r=await ar(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return xt._forOperation(n,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Pg(n,e,t=!1){const{auth:r}=n;if(Le(r.app))return Promise.reject(pt(r));const s="reauthenticate";try{const i=await ar(n,Xh(r,s,e,n),t);j(i.idToken,r,"internal-error");const a=La(i.idToken);j(a,r,"internal-error");const{sub:c}=a;return j(n.uid===c,r,"user-mismatch"),xt._forOperation(n,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&nt(r,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Zh(n,e,t=!1){if(Le(n.app))return Promise.reject(pt(n));const r="signIn",s=await Xh(n,r,e),i=await xt._fromIdTokenResponse(n,r,s);return t||await n._updateCurrentUser(i.user),i}async function Sg(n,e){return Zh(At(n),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ed(n){const e=At(n);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function JA(n,e,t){const r=At(n);await Ai(r,{requestType:"PASSWORD_RESET",email:e,clientType:"CLIENT_TYPE_WEB"},"getOobCode",Eg)}async function XA(n,e,t){if(Le(n.app))return Promise.reject(pt(n));const r=At(n),a=await Ai(r,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",Jh).catch(l=>{throw l.code==="auth/password-does-not-meet-requirements"&&ed(n),l}),c=await xt._fromIdTokenResponse(r,"signIn",a);return await r._updateCurrentUser(c.user),c}function ZA(n,e,t){return Le(n.app)?Promise.reject(pt(n)):Sg(ne(n),pr.credential(e,t)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&ed(n),r})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function bg(n,e){return vt(n,"POST","/v1/accounts:update",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function eR(n,{displayName:e,photoURL:t}){if(e===void 0&&t===void 0)return;const r=ne(n),i={idToken:await r.getIdToken(),displayName:e,photoUrl:t,returnSecureToken:!0},a=await ar(r,bg(r.auth,i));r.displayName=a.displayName||null,r.photoURL=a.photoUrl||null;const c=r.providerData.find(({providerId:l})=>l==="password");c&&(c.displayName=r.displayName,c.photoURL=r.photoURL),await r._updateTokensIfNecessary(a)}function Cg(n,e,t,r){return ne(n).onIdTokenChanged(e,t,r)}function Vg(n,e,t){return ne(n).beforeAuthStateChanged(e,t)}function tR(n,e,t,r){return ne(n).onAuthStateChanged(e,t,r)}function nR(n){return ne(n).signOut()}const Pi="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class td{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Pi,"1"),this.storage.removeItem(Pi),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ng=1e3,kg=10;class nd extends td{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Wh(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),s=this.localCache[t];r!==s&&e(t,s,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((a,c,l)=>{this.notifyListeners(a,l)});return}const r=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const a=this.storage.getItem(r);!t&&this.localCache[r]===a||this.notifyListeners(r,a)},i=this.storage.getItem(r);X_()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,kg):s()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},Ng)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}nd.type="LOCAL";const Dg=nd;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rd extends td{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}rd.type="SESSION";const sd=rd;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xg(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gi{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const r=new Gi(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:s,data:i}=t.data,a=this.handlersMap[s];if(!(a!=null&&a.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const c=Array.from(a).map(async h=>h(t.origin,i)),l=await xg(c);t.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:l})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Gi.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qa(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Og{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,a;return new Promise((c,l)=>{const h=qa("",20);s.port1.start();const f=setTimeout(()=>{l(new Error("unsupported_event"))},r);a={messageChannel:s,onMessage(m){const E=m;if(E.data.eventId===h)switch(E.data.status){case"ack":clearTimeout(f),i=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),c(E.data.response);break;default:clearTimeout(f),clearTimeout(i),l(new Error("invalid_response"));break}}},this.handlers.add(a),s.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:h,data:t},[s.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mt(){return window}function Lg(n){mt().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function id(){return typeof mt().WorkerGlobalScope<"u"&&typeof mt().importScripts=="function"}async function Ug(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function Mg(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)==null?void 0:n.controller)||null}function Fg(){return id()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const od="firebaseLocalStorageDb",Bg=1,Si="firebaseLocalStorage",ad="fbase_key";class Ps{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Ki(n,e){return n.transaction([Si],e?"readwrite":"readonly").objectStore(Si)}function qg(){const n=indexedDB.deleteDatabase(od);return new Ps(n).toPromise()}function cd(){const n=indexedDB.open(od,Bg);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(Si,{keyPath:ad})}catch(s){t(s)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(Si)?e(r):(r.close(),await qg(),e(await cd()))})})}async function ll(n,e,t){const r=Ki(n,!0).put({[ad]:e,value:t});return new Ps(r).toPromise()}async function $g(n,e){const t=Ki(n,!1).get(e),r=await new Ps(t).toPromise();return r===void 0?null:r.value}function hl(n,e){const t=Ki(n,!0).delete(e);return new Ps(t).toPromise()}const jg=800,zg=3;class ud{constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise?this.dbPromise:(this.dbPromise=cd(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>zg)throw r;this.dbPromise&&((await this.dbPromise).close(),this.dbPromise=null)}}async initializeServiceWorkerMessaging(){return id()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Gi._getInstance(Fg()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var t,r;if(this.activeServiceWorker=await Ug(),!this.activeServiceWorker)return;this.sender=new Og(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(r=e[0])!=null&&r.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||Mg()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await ll(e,Pi,"1"),await hl(e,Pi)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>ll(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>$g(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>hl(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const i=Ki(s,!1).getAll();return new Ps(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),jg)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}ud.type="LOCAL";const Hg=ud;new vs(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ld(n,e){return e?Pt(e):(j(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $a extends Ma{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return ir(e,this._buildIdpRequest())}_linkToIdToken(e,t){return ir(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return ir(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function Wg(n){return Zh(n.auth,new $a(n),n.bypassAuthState)}function Gg(n){const{auth:e,user:t}=n;return j(t,e,"internal-error"),Pg(t,new $a(n),n.bypassAuthState)}async function Kg(n){const{auth:e,user:t}=n;return j(t,e,"internal-error"),Rg(t,new $a(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hd{constructor(e,t,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:s,tenantId:i,error:a,type:c}=e;if(a){this.reject(a);return}const l={auth:this.auth,requestUri:t,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(l))}catch(h){this.reject(h)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return Wg;case"linkViaPopup":case"linkViaRedirect":return Kg;case"reauthViaPopup":case"reauthViaRedirect":return Gg;default:nt(this.auth,"internal-error")}}resolve(e){Dt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Dt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qg=new vs(2e3,1e4);async function rR(n,e,t){if(Le(n.app))return Promise.reject(it(n,"operation-not-supported-in-this-environment"));const r=At(n);k_(n,e,Ba);const s=ld(r,t);return new bn(r,"signInViaPopup",e,s).executeNotNull()}class bn extends hd{constructor(e,t,r,s,i){super(e,t,s,i),this.provider=r,this.authWindow=null,this.pollId=null,bn.currentPopupAction&&bn.currentPopupAction.cancel(),bn.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return j(e,this.auth,"internal-error"),e}async onExecution(){Dt(this.filter.length===1,"Popup operations only handle one event");const e=qa();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(it(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(it(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,bn.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if((r=(t=this.authWindow)==null?void 0:t.window)!=null&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(it(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,Qg.get())};e()}}bn.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yg="pendingRedirect",li=new Map;class Jg extends hd{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=li.get(this.auth._key());if(!e){try{const r=await Xg(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}li.set(this.auth._key(),e)}return this.bypassAuthState||li.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function Xg(n,e){const t=ty(e),r=ey(n);if(!await r._isAvailable())return!1;const s=await r._get(t)==="true";return await r._remove(t),s}function Zg(n,e){li.set(n._key(),e)}function ey(n){return Pt(n._redirectPersistence)}function ty(n){return ui(Yg,n.config.apiKey,n.name)}async function ny(n,e,t=!1){if(Le(n.app))return Promise.reject(pt(n));const r=At(n),s=ld(r,e),a=await new Jg(r,s,t).execute();return a&&!t&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ry=600*1e3;class sy{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!iy(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!dd(e)){const s=((r=e.error.code)==null?void 0:r.split("auth/")[1])||"internal-error";t.onError(it(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=ry&&this.cachedEventUids.clear(),this.cachedEventUids.has(dl(e))}saveEventToCache(e){this.cachedEventUids.add(dl(e)),this.lastProcessedEventTime=Date.now()}}function dl(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function dd({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function iy(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return dd(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function oy(n,e={}){return vt(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ay=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,cy=/^https?/;async function uy(n){if(n.config.emulator)return;const{authorizedDomains:e}=await oy(n);for(const t of e)try{if(ly(t))return}catch{}nt(n,"unauthorized-domain")}function ly(n){const e=ca(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const a=new URL(n);return a.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&a.hostname===r}if(!cy.test(t))return!1;if(ay.test(n))return r===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hy=new vs(3e4,6e4);function fl(){const n=mt().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function dy(n){return new Promise((e,t)=>{var s,i,a;function r(){fl(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{fl(),t(it(n,"network-request-failed"))},timeout:hy.get()})}if((i=(s=mt().gapi)==null?void 0:s.iframes)!=null&&i.Iframe)e(gapi.iframes.getContext());else if((a=mt().gapi)!=null&&a.load)r();else{const c=ag("iframefcb");return mt()[c]=()=>{gapi.load?r():t(it(n,"network-request-failed"))},Kh(`${og()}?onload=${c}`).catch(l=>t(l))}}).catch(e=>{throw hi=null,e})}let hi=null;function fy(n){return hi=hi||dy(n),hi}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const py=new vs(5e3,15e3),my="__/auth/iframe",_y="emulator/auth/iframe",gy={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},yy=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Ey(n){const e=n.config;j(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Oa(e,_y):`https://${n.config.authDomain}/${my}`,r={apiKey:e.apiKey,appName:n.name,v:jn},s=yy.get(n.config.apiHost);s&&(r.eid=s);const i=n._getFrameworks();return i.length&&(r.fw=i.join(",")),`${t}?${Is(r).slice(1)}`}async function Ty(n){const e=await fy(n),t=mt().gapi;return j(t,n,"internal-error"),e.open({where:document.body,url:Ey(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:gy,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const a=it(n,"network-request-failed"),c=mt().setTimeout(()=>{i(a)},py.get());function l(){mt().clearTimeout(c),s(r)}r.ping(l).then(l,()=>{i(a)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wy={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Iy=500,vy=600,Ay="_blank",Ry="http://localhost";class pl{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Py(n,e,t,r=Iy,s=vy){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let c="";const l={...wy,width:r.toString(),height:s.toString(),top:i,left:a},h=Ve().toLowerCase();t&&(c=qh(h)?Ay:t),Fh(h)&&(e=e||Ry,l.scrollbars="yes");const f=Object.entries(l).reduce((E,[S,b])=>`${E}${S}=${b},`,"");if(J_(h)&&c!=="_self")return Sy(e||"",c),new pl(null);const m=window.open(e||"",c,f);j(m,n,"popup-blocked");try{m.focus()}catch{}return new pl(m)}function Sy(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const by="__/auth/handler",Cy="emulator/auth/handler",Vy=encodeURIComponent("fac");async function ml(n,e,t,r,s,i){j(n.config.authDomain,n,"auth-domain-config-required"),j(n.config.apiKey,n,"invalid-api-key");const a={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:jn,eventId:s};if(e instanceof Ba){e.setDefaultLanguage(n.languageCode),a.providerId=e.providerId||"",bm(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,m]of Object.entries({}))a[f]=m}if(e instanceof Rs){const f=e.getScopes().filter(m=>m!=="");f.length>0&&(a.scopes=f.join(","))}n.tenantId&&(a.tid=n.tenantId);const c=a;for(const f of Object.keys(c))c[f]===void 0&&delete c[f];const l=await n._getAppCheckToken(),h=l?`#${Vy}=${encodeURIComponent(l)}`:"";return`${Ny(n)}?${Is(c).slice(1)}${h}`}function Ny({config:n}){return n.emulator?Oa(n,Cy):`https://${n.authDomain}/${by}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Go="webStorageSupport";class ky{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=sd,this._completeRedirectFn=ny,this._overrideRedirectResult=Zg}async _openPopup(e,t,r,s){var a;Dt((a=this.eventManagers[e._key()])==null?void 0:a.manager,"_initialize() not called before _openPopup()");const i=await ml(e,t,r,ca(),s);return Py(e,i,qa())}async _openRedirect(e,t,r,s){await this._originValidation(e);const i=await ml(e,t,r,ca(),s);return Lg(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(Dt(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await Ty(e),r=new sy(e);return t.register("authEvent",s=>(j(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Go,{type:Go},s=>{var a;const i=(a=s==null?void 0:s[0])==null?void 0:a[Go];i!==void 0&&t(!!i),nt(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=uy(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Wh()||Bh()||Ua()}}const Dy=ky;var _l="@firebase/auth",gl="1.13.3";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xy{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){j(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oy(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Ly(n){Ln(new sn("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:a,authDomain:c}=r.options;j(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const l={apiKey:a,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Gh(n)},h=new rg(r,s,i,l);return dg(h,t),h},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Ln(new sn("auth-internal",e=>{const t=At(e.getProvider("auth").getImmediate());return(r=>new xy(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),ft(_l,gl,Oy(n)),ft(_l,gl,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Uy=300,My=Sh("authIdTokenMaxAge")||Uy;let yl=null;const Fy=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>My)return;const s=t==null?void 0:t.token;yl!==s&&(yl=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function sR(n=Ch()){const e=Hi(n,"auth");if(e.isInitialized())return e.getImmediate();const t=hg(n,{popupRedirectResolver:Dy,persistence:[Hg,Dg,sd]}),r=Sh("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const a=Fy(i.toString());Vg(t,a,()=>a(t.currentUser)),Cg(t,c=>a(c))}}const s=Rh("auth");return s&&fg(t,`http://${s}`),t}function By(){var n;return((n=document.getElementsByTagName("head"))==null?void 0:n[0])??document}sg({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=s=>{const i=it("internal-error");i.customData=s,t(i)},r.type="text/javascript",r.charset="UTF-8",By().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Ly("Browser");var El=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var en,fd;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(I,_){function y(){}y.prototype=_.prototype,I.F=_.prototype,I.prototype=new y,I.prototype.constructor=I,I.D=function(v,w,R){for(var g=Array(arguments.length-2),Me=2;Me<arguments.length;Me++)g[Me-2]=arguments[Me];return _.prototype[w].apply(v,g)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(r,t),r.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(I,_,y){y||(y=0);const v=Array(16);if(typeof _=="string")for(var w=0;w<16;++w)v[w]=_.charCodeAt(y++)|_.charCodeAt(y++)<<8|_.charCodeAt(y++)<<16|_.charCodeAt(y++)<<24;else for(w=0;w<16;++w)v[w]=_[y++]|_[y++]<<8|_[y++]<<16|_[y++]<<24;_=I.g[0],y=I.g[1],w=I.g[2];let R=I.g[3],g;g=_+(R^y&(w^R))+v[0]+3614090360&4294967295,_=y+(g<<7&4294967295|g>>>25),g=R+(w^_&(y^w))+v[1]+3905402710&4294967295,R=_+(g<<12&4294967295|g>>>20),g=w+(y^R&(_^y))+v[2]+606105819&4294967295,w=R+(g<<17&4294967295|g>>>15),g=y+(_^w&(R^_))+v[3]+3250441966&4294967295,y=w+(g<<22&4294967295|g>>>10),g=_+(R^y&(w^R))+v[4]+4118548399&4294967295,_=y+(g<<7&4294967295|g>>>25),g=R+(w^_&(y^w))+v[5]+1200080426&4294967295,R=_+(g<<12&4294967295|g>>>20),g=w+(y^R&(_^y))+v[6]+2821735955&4294967295,w=R+(g<<17&4294967295|g>>>15),g=y+(_^w&(R^_))+v[7]+4249261313&4294967295,y=w+(g<<22&4294967295|g>>>10),g=_+(R^y&(w^R))+v[8]+1770035416&4294967295,_=y+(g<<7&4294967295|g>>>25),g=R+(w^_&(y^w))+v[9]+2336552879&4294967295,R=_+(g<<12&4294967295|g>>>20),g=w+(y^R&(_^y))+v[10]+4294925233&4294967295,w=R+(g<<17&4294967295|g>>>15),g=y+(_^w&(R^_))+v[11]+2304563134&4294967295,y=w+(g<<22&4294967295|g>>>10),g=_+(R^y&(w^R))+v[12]+1804603682&4294967295,_=y+(g<<7&4294967295|g>>>25),g=R+(w^_&(y^w))+v[13]+4254626195&4294967295,R=_+(g<<12&4294967295|g>>>20),g=w+(y^R&(_^y))+v[14]+2792965006&4294967295,w=R+(g<<17&4294967295|g>>>15),g=y+(_^w&(R^_))+v[15]+1236535329&4294967295,y=w+(g<<22&4294967295|g>>>10),g=_+(w^R&(y^w))+v[1]+4129170786&4294967295,_=y+(g<<5&4294967295|g>>>27),g=R+(y^w&(_^y))+v[6]+3225465664&4294967295,R=_+(g<<9&4294967295|g>>>23),g=w+(_^y&(R^_))+v[11]+643717713&4294967295,w=R+(g<<14&4294967295|g>>>18),g=y+(R^_&(w^R))+v[0]+3921069994&4294967295,y=w+(g<<20&4294967295|g>>>12),g=_+(w^R&(y^w))+v[5]+3593408605&4294967295,_=y+(g<<5&4294967295|g>>>27),g=R+(y^w&(_^y))+v[10]+38016083&4294967295,R=_+(g<<9&4294967295|g>>>23),g=w+(_^y&(R^_))+v[15]+3634488961&4294967295,w=R+(g<<14&4294967295|g>>>18),g=y+(R^_&(w^R))+v[4]+3889429448&4294967295,y=w+(g<<20&4294967295|g>>>12),g=_+(w^R&(y^w))+v[9]+568446438&4294967295,_=y+(g<<5&4294967295|g>>>27),g=R+(y^w&(_^y))+v[14]+3275163606&4294967295,R=_+(g<<9&4294967295|g>>>23),g=w+(_^y&(R^_))+v[3]+4107603335&4294967295,w=R+(g<<14&4294967295|g>>>18),g=y+(R^_&(w^R))+v[8]+1163531501&4294967295,y=w+(g<<20&4294967295|g>>>12),g=_+(w^R&(y^w))+v[13]+2850285829&4294967295,_=y+(g<<5&4294967295|g>>>27),g=R+(y^w&(_^y))+v[2]+4243563512&4294967295,R=_+(g<<9&4294967295|g>>>23),g=w+(_^y&(R^_))+v[7]+1735328473&4294967295,w=R+(g<<14&4294967295|g>>>18),g=y+(R^_&(w^R))+v[12]+2368359562&4294967295,y=w+(g<<20&4294967295|g>>>12),g=_+(y^w^R)+v[5]+4294588738&4294967295,_=y+(g<<4&4294967295|g>>>28),g=R+(_^y^w)+v[8]+2272392833&4294967295,R=_+(g<<11&4294967295|g>>>21),g=w+(R^_^y)+v[11]+1839030562&4294967295,w=R+(g<<16&4294967295|g>>>16),g=y+(w^R^_)+v[14]+4259657740&4294967295,y=w+(g<<23&4294967295|g>>>9),g=_+(y^w^R)+v[1]+2763975236&4294967295,_=y+(g<<4&4294967295|g>>>28),g=R+(_^y^w)+v[4]+1272893353&4294967295,R=_+(g<<11&4294967295|g>>>21),g=w+(R^_^y)+v[7]+4139469664&4294967295,w=R+(g<<16&4294967295|g>>>16),g=y+(w^R^_)+v[10]+3200236656&4294967295,y=w+(g<<23&4294967295|g>>>9),g=_+(y^w^R)+v[13]+681279174&4294967295,_=y+(g<<4&4294967295|g>>>28),g=R+(_^y^w)+v[0]+3936430074&4294967295,R=_+(g<<11&4294967295|g>>>21),g=w+(R^_^y)+v[3]+3572445317&4294967295,w=R+(g<<16&4294967295|g>>>16),g=y+(w^R^_)+v[6]+76029189&4294967295,y=w+(g<<23&4294967295|g>>>9),g=_+(y^w^R)+v[9]+3654602809&4294967295,_=y+(g<<4&4294967295|g>>>28),g=R+(_^y^w)+v[12]+3873151461&4294967295,R=_+(g<<11&4294967295|g>>>21),g=w+(R^_^y)+v[15]+530742520&4294967295,w=R+(g<<16&4294967295|g>>>16),g=y+(w^R^_)+v[2]+3299628645&4294967295,y=w+(g<<23&4294967295|g>>>9),g=_+(w^(y|~R))+v[0]+4096336452&4294967295,_=y+(g<<6&4294967295|g>>>26),g=R+(y^(_|~w))+v[7]+1126891415&4294967295,R=_+(g<<10&4294967295|g>>>22),g=w+(_^(R|~y))+v[14]+2878612391&4294967295,w=R+(g<<15&4294967295|g>>>17),g=y+(R^(w|~_))+v[5]+4237533241&4294967295,y=w+(g<<21&4294967295|g>>>11),g=_+(w^(y|~R))+v[12]+1700485571&4294967295,_=y+(g<<6&4294967295|g>>>26),g=R+(y^(_|~w))+v[3]+2399980690&4294967295,R=_+(g<<10&4294967295|g>>>22),g=w+(_^(R|~y))+v[10]+4293915773&4294967295,w=R+(g<<15&4294967295|g>>>17),g=y+(R^(w|~_))+v[1]+2240044497&4294967295,y=w+(g<<21&4294967295|g>>>11),g=_+(w^(y|~R))+v[8]+1873313359&4294967295,_=y+(g<<6&4294967295|g>>>26),g=R+(y^(_|~w))+v[15]+4264355552&4294967295,R=_+(g<<10&4294967295|g>>>22),g=w+(_^(R|~y))+v[6]+2734768916&4294967295,w=R+(g<<15&4294967295|g>>>17),g=y+(R^(w|~_))+v[13]+1309151649&4294967295,y=w+(g<<21&4294967295|g>>>11),g=_+(w^(y|~R))+v[4]+4149444226&4294967295,_=y+(g<<6&4294967295|g>>>26),g=R+(y^(_|~w))+v[11]+3174756917&4294967295,R=_+(g<<10&4294967295|g>>>22),g=w+(_^(R|~y))+v[2]+718787259&4294967295,w=R+(g<<15&4294967295|g>>>17),g=y+(R^(w|~_))+v[9]+3951481745&4294967295,I.g[0]=I.g[0]+_&4294967295,I.g[1]=I.g[1]+(w+(g<<21&4294967295|g>>>11))&4294967295,I.g[2]=I.g[2]+w&4294967295,I.g[3]=I.g[3]+R&4294967295}r.prototype.v=function(I,_){_===void 0&&(_=I.length);const y=_-this.blockSize,v=this.C;let w=this.h,R=0;for(;R<_;){if(w==0)for(;R<=y;)s(this,I,R),R+=this.blockSize;if(typeof I=="string"){for(;R<_;)if(v[w++]=I.charCodeAt(R++),w==this.blockSize){s(this,v),w=0;break}}else for(;R<_;)if(v[w++]=I[R++],w==this.blockSize){s(this,v),w=0;break}}this.h=w,this.o+=_},r.prototype.A=function(){var I=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);I[0]=128;for(var _=1;_<I.length-8;++_)I[_]=0;_=this.o*8;for(var y=I.length-8;y<I.length;++y)I[y]=_&255,_/=256;for(this.v(I),I=Array(16),_=0,y=0;y<4;++y)for(let v=0;v<32;v+=8)I[_++]=this.g[y]>>>v&255;return I};function i(I,_){var y=c;return Object.prototype.hasOwnProperty.call(y,I)?y[I]:y[I]=_(I)}function a(I,_){this.h=_;const y=[];let v=!0;for(let w=I.length-1;w>=0;w--){const R=I[w]|0;v&&R==_||(y[w]=R,v=!1)}this.g=y}var c={};function l(I){return-128<=I&&I<128?i(I,function(_){return new a([_|0],_<0?-1:0)}):new a([I|0],I<0?-1:0)}function h(I){if(isNaN(I)||!isFinite(I))return m;if(I<0)return k(h(-I));const _=[];let y=1;for(let v=0;I>=y;v++)_[v]=I/y|0,y*=4294967296;return new a(_,0)}function f(I,_){if(I.length==0)throw Error("number format error: empty string");if(_=_||10,_<2||36<_)throw Error("radix out of range: "+_);if(I.charAt(0)=="-")return k(f(I.substring(1),_));if(I.indexOf("-")>=0)throw Error('number format error: interior "-" character');const y=h(Math.pow(_,8));let v=m;for(let R=0;R<I.length;R+=8){var w=Math.min(8,I.length-R);const g=parseInt(I.substring(R,R+w),_);w<8?(w=h(Math.pow(_,w)),v=v.j(w).add(h(g))):(v=v.j(y),v=v.add(h(g)))}return v}var m=l(0),E=l(1),S=l(16777216);n=a.prototype,n.m=function(){if(L(this))return-k(this).m();let I=0,_=1;for(let y=0;y<this.g.length;y++){const v=this.i(y);I+=(v>=0?v:4294967296+v)*_,_*=4294967296}return I},n.toString=function(I){if(I=I||10,I<2||36<I)throw Error("radix out of range: "+I);if(b(this))return"0";if(L(this))return"-"+k(this).toString(I);const _=h(Math.pow(I,6));var y=this;let v="";for(;;){const w=ee(y,_).g;y=$(y,w.j(_));let R=((y.g.length>0?y.g[0]:y.h)>>>0).toString(I);if(y=w,b(y))return R+v;for(;R.length<6;)R="0"+R;v=R+v}},n.i=function(I){return I<0?0:I<this.g.length?this.g[I]:this.h};function b(I){if(I.h!=0)return!1;for(let _=0;_<I.g.length;_++)if(I.g[_]!=0)return!1;return!0}function L(I){return I.h==-1}n.l=function(I){return I=$(this,I),L(I)?-1:b(I)?0:1};function k(I){const _=I.g.length,y=[];for(let v=0;v<_;v++)y[v]=~I.g[v];return new a(y,~I.h).add(E)}n.abs=function(){return L(this)?k(this):this},n.add=function(I){const _=Math.max(this.g.length,I.g.length),y=[];let v=0;for(let w=0;w<=_;w++){let R=v+(this.i(w)&65535)+(I.i(w)&65535),g=(R>>>16)+(this.i(w)>>>16)+(I.i(w)>>>16);v=g>>>16,R&=65535,g&=65535,y[w]=g<<16|R}return new a(y,y[y.length-1]&-2147483648?-1:0)};function $(I,_){return I.add(k(_))}n.j=function(I){if(b(this)||b(I))return m;if(L(this))return L(I)?k(this).j(k(I)):k(k(this).j(I));if(L(I))return k(this.j(k(I)));if(this.l(S)<0&&I.l(S)<0)return h(this.m()*I.m());const _=this.g.length+I.g.length,y=[];for(var v=0;v<2*_;v++)y[v]=0;for(v=0;v<this.g.length;v++)for(let w=0;w<I.g.length;w++){const R=this.i(v)>>>16,g=this.i(v)&65535,Me=I.i(w)>>>16,En=I.i(w)&65535;y[2*v+2*w]+=g*En,W(y,2*v+2*w),y[2*v+2*w+1]+=R*En,W(y,2*v+2*w+1),y[2*v+2*w+1]+=g*Me,W(y,2*v+2*w+1),y[2*v+2*w+2]+=R*Me,W(y,2*v+2*w+2)}for(I=0;I<_;I++)y[I]=y[2*I+1]<<16|y[2*I];for(I=_;I<2*_;I++)y[I]=0;return new a(y,0)};function W(I,_){for(;(I[_]&65535)!=I[_];)I[_+1]+=I[_]>>>16,I[_]&=65535,_++}function K(I,_){this.g=I,this.h=_}function ee(I,_){if(b(_))throw Error("division by zero");if(b(I))return new K(m,m);if(L(I))return _=ee(k(I),_),new K(k(_.g),k(_.h));if(L(_))return _=ee(I,k(_)),new K(k(_.g),_.h);if(I.g.length>30){if(L(I)||L(_))throw Error("slowDivide_ only works with positive integers.");for(var y=E,v=_;v.l(I)<=0;)y=ae(y),v=ae(v);var w=ce(y,1),R=ce(v,1);for(v=ce(v,2),y=ce(y,2);!b(v);){var g=R.add(v);g.l(I)<=0&&(w=w.add(y),R=g),v=ce(v,1),y=ce(y,1)}return _=$(I,w.j(_)),new K(w,_)}for(w=m;I.l(_)>=0;){for(y=Math.max(1,Math.floor(I.m()/_.m())),v=Math.ceil(Math.log(y)/Math.LN2),v=v<=48?1:Math.pow(2,v-48),R=h(y),g=R.j(_);L(g)||g.l(I)>0;)y-=v,R=h(y),g=R.j(_);b(R)&&(R=E),w=w.add(R),I=$(I,g)}return new K(w,I)}n.B=function(I){return ee(this,I).h},n.and=function(I){const _=Math.max(this.g.length,I.g.length),y=[];for(let v=0;v<_;v++)y[v]=this.i(v)&I.i(v);return new a(y,this.h&I.h)},n.or=function(I){const _=Math.max(this.g.length,I.g.length),y=[];for(let v=0;v<_;v++)y[v]=this.i(v)|I.i(v);return new a(y,this.h|I.h)},n.xor=function(I){const _=Math.max(this.g.length,I.g.length),y=[];for(let v=0;v<_;v++)y[v]=this.i(v)^I.i(v);return new a(y,this.h^I.h)};function ae(I){const _=I.g.length+1,y=[];for(let v=0;v<_;v++)y[v]=I.i(v)<<1|I.i(v-1)>>>31;return new a(y,I.h)}function ce(I,_){const y=_>>5;_%=32;const v=I.g.length-y,w=[];for(let R=0;R<v;R++)w[R]=_>0?I.i(R+y)>>>_|I.i(R+y+1)<<32-_:I.i(R+y);return new a(w,I.h)}r.prototype.digest=r.prototype.A,r.prototype.reset=r.prototype.u,r.prototype.update=r.prototype.v,fd=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.B,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=h,a.fromString=f,en=a}).apply(typeof El<"u"?El:typeof self<"u"?self:typeof window<"u"?window:{});var ei=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var pd,Hr,md,di,la,_d,gd,yd;(function(){var n,e=Object.defineProperty;function t(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof ei=="object"&&ei];for(var u=0;u<o.length;++u){var d=o[u];if(d&&d.Math==Math)return d}throw Error("Cannot find global object")}var r=t(this);function s(o,u){if(u)e:{var d=r;o=o.split(".");for(var p=0;p<o.length-1;p++){var A=o[p];if(!(A in d))break e;d=d[A]}o=o[o.length-1],p=d[o],u=u(p),u!=p&&u!=null&&e(d,o,{configurable:!0,writable:!0,value:u})}}s("Symbol.dispose",function(o){return o||Symbol("Symbol.dispose")}),s("Array.prototype.values",function(o){return o||function(){return this[Symbol.iterator]()}}),s("Object.entries",function(o){return o||function(u){var d=[],p;for(p in u)Object.prototype.hasOwnProperty.call(u,p)&&d.push([p,u[p]]);return d}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var i=i||{},a=this||self;function c(o){var u=typeof o;return u=="object"&&o!=null||u=="function"}function l(o,u,d){return o.call.apply(o.bind,arguments)}function h(o,u,d){return h=l,h.apply(null,arguments)}function f(o,u){var d=Array.prototype.slice.call(arguments,1);return function(){var p=d.slice();return p.push.apply(p,arguments),o.apply(this,p)}}function m(o,u){function d(){}d.prototype=u.prototype,o.Z=u.prototype,o.prototype=new d,o.prototype.constructor=o,o.Ob=function(p,A,P){for(var O=Array(arguments.length-2),G=2;G<arguments.length;G++)O[G-2]=arguments[G];return u.prototype[A].apply(p,O)}}var E=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?o=>o&&AsyncContext.Snapshot.wrap(o):o=>o;function S(o){const u=o.length;if(u>0){const d=Array(u);for(let p=0;p<u;p++)d[p]=o[p];return d}return[]}function b(o,u){for(let p=1;p<arguments.length;p++){const A=arguments[p];var d=typeof A;if(d=d!="object"?d:A?Array.isArray(A)?"array":d:"null",d=="array"||d=="object"&&typeof A.length=="number"){d=o.length||0;const P=A.length||0;o.length=d+P;for(let O=0;O<P;O++)o[d+O]=A[O]}else o.push(A)}}class L{constructor(u,d){this.i=u,this.j=d,this.h=0,this.g=null}get(){let u;return this.h>0?(this.h--,u=this.g,this.g=u.next,u.next=null):u=this.i(),u}}function k(o){a.setTimeout(()=>{throw o},0)}function $(){var o=I;let u=null;return o.g&&(u=o.g,o.g=o.g.next,o.g||(o.h=null),u.next=null),u}class W{constructor(){this.h=this.g=null}add(u,d){const p=K.get();p.set(u,d),this.h?this.h.next=p:this.g=p,this.h=p}}var K=new L(()=>new ee,o=>o.reset());class ee{constructor(){this.next=this.g=this.h=null}set(u,d){this.h=u,this.g=d,this.next=null}reset(){this.next=this.g=this.h=null}}let ae,ce=!1,I=new W,_=()=>{const o=Promise.resolve(void 0);ae=()=>{o.then(y)}};function y(){for(var o;o=$();){try{o.h.call(o.g)}catch(d){k(d)}var u=K;u.j(o),u.h<100&&(u.h++,o.next=u.g,u.g=o)}ce=!1}function v(){this.u=this.u,this.C=this.C}v.prototype.u=!1,v.prototype.dispose=function(){this.u||(this.u=!0,this.N())},v.prototype[Symbol.dispose]=function(){this.dispose()},v.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function w(o,u){this.type=o,this.g=this.target=u,this.defaultPrevented=!1}w.prototype.h=function(){this.defaultPrevented=!0};var R=(function(){if(!a.addEventListener||!Object.defineProperty)return!1;var o=!1,u=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const d=()=>{};a.addEventListener("test",d,u),a.removeEventListener("test",d,u)}catch{}return o})();function g(o){return/^[\s\xa0]*$/.test(o)}function Me(o,u){w.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o&&this.init(o,u)}m(Me,w),Me.prototype.init=function(o,u){const d=this.type=o.type,p=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;this.target=o.target||o.srcElement,this.g=u,u=o.relatedTarget,u||(d=="mouseover"?u=o.fromElement:d=="mouseout"&&(u=o.toElement)),this.relatedTarget=u,p?(this.clientX=p.clientX!==void 0?p.clientX:p.pageX,this.clientY=p.clientY!==void 0?p.clientY:p.pageY,this.screenX=p.screenX||0,this.screenY=p.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=o.pointerType,this.state=o.state,this.i=o,o.defaultPrevented&&Me.Z.h.call(this)},Me.prototype.h=function(){Me.Z.h.call(this);const o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var En="closure_listenable_"+(Math.random()*1e6|0),Sp=0;function bp(o,u,d,p,A){this.listener=o,this.proxy=null,this.src=u,this.type=d,this.capture=!!p,this.ha=A,this.key=++Sp,this.da=this.fa=!1}function Ms(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function Fs(o,u,d){for(const p in o)u.call(d,o[p],p,o)}function Cp(o,u){for(const d in o)u.call(void 0,o[d],d,o)}function Hc(o){const u={};for(const d in o)u[d]=o[d];return u}const Wc="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Gc(o,u){let d,p;for(let A=1;A<arguments.length;A++){p=arguments[A];for(d in p)o[d]=p[d];for(let P=0;P<Wc.length;P++)d=Wc[P],Object.prototype.hasOwnProperty.call(p,d)&&(o[d]=p[d])}}function Bs(o){this.src=o,this.g={},this.h=0}Bs.prototype.add=function(o,u,d,p,A){const P=o.toString();o=this.g[P],o||(o=this.g[P]=[],this.h++);const O=wo(o,u,p,A);return O>-1?(u=o[O],d||(u.fa=!1)):(u=new bp(u,this.src,P,!!p,A),u.fa=d,o.push(u)),u};function To(o,u){const d=u.type;if(d in o.g){var p=o.g[d],A=Array.prototype.indexOf.call(p,u,void 0),P;(P=A>=0)&&Array.prototype.splice.call(p,A,1),P&&(Ms(u),o.g[d].length==0&&(delete o.g[d],o.h--))}}function wo(o,u,d,p){for(let A=0;A<o.length;++A){const P=o[A];if(!P.da&&P.listener==u&&P.capture==!!d&&P.ha==p)return A}return-1}var Io="closure_lm_"+(Math.random()*1e6|0),vo={};function Kc(o,u,d,p,A){if(Array.isArray(u)){for(let P=0;P<u.length;P++)Kc(o,u[P],d,p,A);return null}return d=Jc(d),o&&o[En]?o.J(u,d,c(p)?!!p.capture:!1,A):Vp(o,u,d,!1,p,A)}function Vp(o,u,d,p,A,P){if(!u)throw Error("Invalid event type");const O=c(A)?!!A.capture:!!A;let G=Ro(o);if(G||(o[Io]=G=new Bs(o)),d=G.add(u,d,p,O,P),d.proxy)return d;if(p=Np(),d.proxy=p,p.src=o,p.listener=d,o.addEventListener)R||(A=O),A===void 0&&(A=!1),o.addEventListener(u.toString(),p,A);else if(o.attachEvent)o.attachEvent(Yc(u.toString()),p);else if(o.addListener&&o.removeListener)o.addListener(p);else throw Error("addEventListener and attachEvent are unavailable.");return d}function Np(){function o(d){return u.call(o.src,o.listener,d)}const u=kp;return o}function Qc(o,u,d,p,A){if(Array.isArray(u))for(var P=0;P<u.length;P++)Qc(o,u[P],d,p,A);else p=c(p)?!!p.capture:!!p,d=Jc(d),o&&o[En]?(o=o.i,P=String(u).toString(),P in o.g&&(u=o.g[P],d=wo(u,d,p,A),d>-1&&(Ms(u[d]),Array.prototype.splice.call(u,d,1),u.length==0&&(delete o.g[P],o.h--)))):o&&(o=Ro(o))&&(u=o.g[u.toString()],o=-1,u&&(o=wo(u,d,p,A)),(d=o>-1?u[o]:null)&&Ao(d))}function Ao(o){if(typeof o!="number"&&o&&!o.da){var u=o.src;if(u&&u[En])To(u.i,o);else{var d=o.type,p=o.proxy;u.removeEventListener?u.removeEventListener(d,p,o.capture):u.detachEvent?u.detachEvent(Yc(d),p):u.addListener&&u.removeListener&&u.removeListener(p),(d=Ro(u))?(To(d,o),d.h==0&&(d.src=null,u[Io]=null)):Ms(o)}}}function Yc(o){return o in vo?vo[o]:vo[o]="on"+o}function kp(o,u){if(o.da)o=!0;else{u=new Me(u,this);const d=o.listener,p=o.ha||o.src;o.fa&&Ao(o),o=d.call(p,u)}return o}function Ro(o){return o=o[Io],o instanceof Bs?o:null}var Po="__closure_events_fn_"+(Math.random()*1e9>>>0);function Jc(o){return typeof o=="function"?o:(o[Po]||(o[Po]=function(u){return o.handleEvent(u)}),o[Po])}function Se(){v.call(this),this.i=new Bs(this),this.M=this,this.G=null}m(Se,v),Se.prototype[En]=!0,Se.prototype.removeEventListener=function(o,u,d,p){Qc(this,o,u,d,p)};function ke(o,u){var d,p=o.G;if(p)for(d=[];p;p=p.G)d.push(p);if(o=o.M,p=u.type||u,typeof u=="string")u=new w(u,o);else if(u instanceof w)u.target=u.target||o;else{var A=u;u=new w(p,o),Gc(u,A)}A=!0;let P,O;if(d)for(O=d.length-1;O>=0;O--)P=u.g=d[O],A=qs(P,p,!0,u)&&A;if(P=u.g=o,A=qs(P,p,!0,u)&&A,A=qs(P,p,!1,u)&&A,d)for(O=0;O<d.length;O++)P=u.g=d[O],A=qs(P,p,!1,u)&&A}Se.prototype.N=function(){if(Se.Z.N.call(this),this.i){var o=this.i;for(const u in o.g){const d=o.g[u];for(let p=0;p<d.length;p++)Ms(d[p]);delete o.g[u],o.h--}}this.G=null},Se.prototype.J=function(o,u,d,p){return this.i.add(String(o),u,!1,d,p)},Se.prototype.K=function(o,u,d,p){return this.i.add(String(o),u,!0,d,p)};function qs(o,u,d,p){if(u=o.i.g[String(u)],!u)return!0;u=u.concat();let A=!0;for(let P=0;P<u.length;++P){const O=u[P];if(O&&!O.da&&O.capture==d){const G=O.listener,Ee=O.ha||O.src;O.fa&&To(o.i,O),A=G.call(Ee,p)!==!1&&A}}return A&&!p.defaultPrevented}function Dp(o,u){if(typeof o!="function")if(o&&typeof o.handleEvent=="function")o=h(o.handleEvent,o);else throw Error("Invalid listener argument");return Number(u)>2147483647?-1:a.setTimeout(o,u||0)}function Xc(o){o.g=Dp(()=>{o.g=null,o.i&&(o.i=!1,Xc(o))},o.l);const u=o.h;o.h=null,o.m.apply(null,u)}class xp extends v{constructor(u,d){super(),this.m=u,this.l=d,this.h=null,this.i=!1,this.g=null}j(u){this.h=arguments,this.g?this.i=!0:Xc(this)}N(){super.N(),this.g&&(a.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Ar(o){v.call(this),this.h=o,this.g={}}m(Ar,v);var Zc=[];function eu(o){Fs(o.g,function(u,d){this.g.hasOwnProperty(d)&&Ao(u)},o),o.g={}}Ar.prototype.N=function(){Ar.Z.N.call(this),eu(this)},Ar.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var So=a.JSON.stringify,Op=a.JSON.parse,Lp=class{stringify(o){return a.JSON.stringify(o,void 0)}parse(o){return a.JSON.parse(o,void 0)}};function tu(){}function nu(){}var Rr={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function bo(){w.call(this,"d")}m(bo,w);function Co(){w.call(this,"c")}m(Co,w);var Tn={},ru=null;function $s(){return ru=ru||new Se}Tn.Ia="serverreachability";function su(o){w.call(this,Tn.Ia,o)}m(su,w);function Pr(o){const u=$s();ke(u,new su(u))}Tn.STAT_EVENT="statevent";function iu(o,u){w.call(this,Tn.STAT_EVENT,o),this.stat=u}m(iu,w);function De(o){const u=$s();ke(u,new iu(u,o))}Tn.Ja="timingevent";function ou(o,u){w.call(this,Tn.Ja,o),this.size=u}m(ou,w);function Sr(o,u){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return a.setTimeout(function(){o()},u)}function br(){this.g=!0}br.prototype.ua=function(){this.g=!1};function Up(o,u,d,p,A,P){o.info(function(){if(o.g)if(P){var O="",G=P.split("&");for(let te=0;te<G.length;te++){var Ee=G[te].split("=");if(Ee.length>1){const Ie=Ee[0];Ee=Ee[1];const ct=Ie.split("_");O=ct.length>=2&&ct[1]=="type"?O+(Ie+"="+Ee+"&"):O+(Ie+"=redacted&")}}}else O=null;else O=P;return"XMLHTTP REQ ("+p+") [attempt "+A+"]: "+u+`
`+d+`
`+O})}function Mp(o,u,d,p,A,P,O){o.info(function(){return"XMLHTTP RESP ("+p+") [ attempt "+A+"]: "+u+`
`+d+`
`+P+" "+O})}function Qn(o,u,d,p){o.info(function(){return"XMLHTTP TEXT ("+u+"): "+Bp(o,d)+(p?" "+p:"")})}function Fp(o,u){o.info(function(){return"TIMEOUT: "+u})}br.prototype.info=function(){};function Bp(o,u){if(!o.g)return u;if(!u)return null;try{const P=JSON.parse(u);if(P){for(o=0;o<P.length;o++)if(Array.isArray(P[o])){var d=P[o];if(!(d.length<2)){var p=d[1];if(Array.isArray(p)&&!(p.length<1)){var A=p[0];if(A!="noop"&&A!="stop"&&A!="close")for(let O=1;O<p.length;O++)p[O]=""}}}}return So(P)}catch{return u}}var js={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},au={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},cu;function Vo(){}m(Vo,tu),Vo.prototype.g=function(){return new XMLHttpRequest},cu=new Vo;function Cr(o){return encodeURIComponent(String(o))}function qp(o){var u=1;o=o.split(":");const d=[];for(;u>0&&o.length;)d.push(o.shift()),u--;return o.length&&d.push(o.join(":")),d}function Ft(o,u,d,p){this.j=o,this.i=u,this.l=d,this.S=p||1,this.V=new Ar(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new uu}function uu(){this.i=null,this.g="",this.h=!1}var lu={},No={};function ko(o,u,d){o.M=1,o.A=Hs(at(u)),o.u=d,o.R=!0,hu(o,null)}function hu(o,u){o.F=Date.now(),zs(o),o.B=at(o.A);var d=o.B,p=o.S;Array.isArray(p)||(p=[String(p)]),Au(d.i,"t",p),o.C=0,d=o.j.L,o.h=new uu,o.g=$u(o.j,d?u:null,!o.u),o.P>0&&(o.O=new xp(h(o.Y,o,o.g),o.P)),u=o.V,d=o.g,p=o.ba;var A="readystatechange";Array.isArray(A)||(A&&(Zc[0]=A.toString()),A=Zc);for(let P=0;P<A.length;P++){const O=Kc(d,A[P],p||u.handleEvent,!1,u.h||u);if(!O)break;u.g[O.key]=O}u=o.J?Hc(o.J):{},o.u?(o.v||(o.v="POST"),u["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.B,o.v,o.u,u)):(o.v="GET",o.g.ea(o.B,o.v,null,u)),Pr(),Up(o.i,o.v,o.B,o.l,o.S,o.u)}Ft.prototype.ba=function(o){o=o.target;const u=this.O;u&&$t(o)==3?u.j():this.Y(o)},Ft.prototype.Y=function(o){try{if(o==this.g)e:{const G=$t(this.g),Ee=this.g.ya(),te=this.g.ca();if(!(G<3)&&(G!=3||this.g&&(this.h.h||this.g.la()||Nu(this.g)))){this.K||G!=4||Ee==7||(Ee==8||te<=0?Pr(3):Pr(2)),Do(this);var u=this.g.ca();this.X=u;var d=$p(this);if(this.o=u==200,Mp(this.i,this.v,this.B,this.l,this.S,G,u),this.o){if(this.U&&!this.L){t:{if(this.g){var p,A=this.g;if((p=A.g?A.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!g(p)){var P=p;break t}}P=null}if(o=P)Qn(this.i,this.l,o,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,xo(this,o);else{this.o=!1,this.m=3,De(12),wn(this),Vr(this);break e}}if(this.R){o=!0;let Ie;for(;!this.K&&this.C<d.length;)if(Ie=jp(this,d),Ie==No){G==4&&(this.m=4,De(14),o=!1),Qn(this.i,this.l,null,"[Incomplete Response]");break}else if(Ie==lu){this.m=4,De(15),Qn(this.i,this.l,d,"[Invalid Chunk]"),o=!1;break}else Qn(this.i,this.l,Ie,null),xo(this,Ie);if(du(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),G!=4||d.length!=0||this.h.h||(this.m=1,De(16),o=!1),this.o=this.o&&o,!o)Qn(this.i,this.l,d,"[Invalid Chunked Response]"),wn(this),Vr(this);else if(d.length>0&&!this.W){this.W=!0;var O=this.j;O.g==this&&O.aa&&!O.P&&(O.j.info("Great, no buffering proxy detected. Bytes received: "+d.length),$o(O),O.P=!0,De(11))}}else Qn(this.i,this.l,d,null),xo(this,d);G==4&&wn(this),this.o&&!this.K&&(G==4?Mu(this.j,this):(this.o=!1,zs(this)))}else rm(this.g),u==400&&d.indexOf("Unknown SID")>0?(this.m=3,De(12)):(this.m=0,De(13)),wn(this),Vr(this)}}}catch{}finally{}};function $p(o){if(!du(o))return o.g.la();const u=Nu(o.g);if(u==="")return"";let d="";const p=u.length,A=$t(o.g)==4;if(!o.h.i){if(typeof TextDecoder>"u")return wn(o),Vr(o),"";o.h.i=new a.TextDecoder}for(let P=0;P<p;P++)o.h.h=!0,d+=o.h.i.decode(u[P],{stream:!(A&&P==p-1)});return u.length=0,o.h.g+=d,o.C=0,o.h.g}function du(o){return o.g?o.v=="GET"&&o.M!=2&&o.j.Aa:!1}function jp(o,u){var d=o.C,p=u.indexOf(`
`,d);return p==-1?No:(d=Number(u.substring(d,p)),isNaN(d)?lu:(p+=1,p+d>u.length?No:(u=u.slice(p,p+d),o.C=p+d,u)))}Ft.prototype.cancel=function(){this.K=!0,wn(this)};function zs(o){o.T=Date.now()+o.H,fu(o,o.H)}function fu(o,u){if(o.D!=null)throw Error("WatchDog timer not null");o.D=Sr(h(o.aa,o),u)}function Do(o){o.D&&(a.clearTimeout(o.D),o.D=null)}Ft.prototype.aa=function(){this.D=null;const o=Date.now();o-this.T>=0?(Fp(this.i,this.B),this.M!=2&&(Pr(),De(17)),wn(this),this.m=2,Vr(this)):fu(this,this.T-o)};function Vr(o){o.j.I==0||o.K||Mu(o.j,o)}function wn(o){Do(o);var u=o.O;u&&typeof u.dispose=="function"&&u.dispose(),o.O=null,eu(o.V),o.g&&(u=o.g,o.g=null,u.abort(),u.dispose())}function xo(o,u){try{var d=o.j;if(d.I!=0&&(d.g==o||Oo(d.h,o))){if(!o.L&&Oo(d.h,o)&&d.I==3){try{var p=d.Ba.g.parse(u)}catch{p=null}if(Array.isArray(p)&&p.length==3){var A=p;if(A[0]==0){e:if(!d.v){if(d.g)if(d.g.F+3e3<o.F)Ys(d),Ks(d);else break e;qo(d),De(18)}}else d.xa=A[1],0<d.xa-d.K&&A[2]<37500&&d.F&&d.A==0&&!d.C&&(d.C=Sr(h(d.Va,d),6e3));_u(d.h)<=1&&d.ta&&(d.ta=void 0)}else vn(d,11)}else if((o.L||d.g==o)&&Ys(d),!g(u))for(A=d.Ba.g.parse(u),u=0;u<A.length;u++){let te=A[u];const Ie=te[0];if(!(Ie<=d.K))if(d.K=Ie,te=te[1],d.I==2)if(te[0]=="c"){d.M=te[1],d.ba=te[2];const ct=te[3];ct!=null&&(d.ka=ct,d.j.info("VER="+d.ka));const An=te[4];An!=null&&(d.za=An,d.j.info("SVER="+d.za));const jt=te[5];jt!=null&&typeof jt=="number"&&jt>0&&(p=1.5*jt,d.O=p,d.j.info("backChannelRequestTimeoutMs_="+p)),p=d;const zt=o.g;if(zt){const Xs=zt.g?zt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Xs){var P=p.h;P.g||Xs.indexOf("spdy")==-1&&Xs.indexOf("quic")==-1&&Xs.indexOf("h2")==-1||(P.j=P.l,P.g=new Set,P.h&&(Lo(P,P.h),P.h=null))}if(p.G){const jo=zt.g?zt.g.getResponseHeader("X-HTTP-Session-Id"):null;jo&&(p.wa=jo,re(p.J,p.G,jo))}}d.I=3,d.l&&d.l.ra(),d.aa&&(d.T=Date.now()-o.F,d.j.info("Handshake RTT: "+d.T+"ms")),p=d;var O=o;if(p.na=qu(p,p.L?p.ba:null,p.W),O.L){gu(p.h,O);var G=O,Ee=p.O;Ee&&(G.H=Ee),G.D&&(Do(G),zs(G)),p.g=O}else Lu(p);d.i.length>0&&Qs(d)}else te[0]!="stop"&&te[0]!="close"||vn(d,7);else d.I==3&&(te[0]=="stop"||te[0]=="close"?te[0]=="stop"?vn(d,7):Bo(d):te[0]!="noop"&&d.l&&d.l.qa(te),d.A=0)}}Pr(4)}catch{}}var zp=class{constructor(o,u){this.g=o,this.map=u}};function pu(o){this.l=o||10,a.PerformanceNavigationTiming?(o=a.performance.getEntriesByType("navigation"),o=o.length>0&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(a.chrome&&a.chrome.loadTimes&&a.chrome.loadTimes()&&a.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function mu(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function _u(o){return o.h?1:o.g?o.g.size:0}function Oo(o,u){return o.h?o.h==u:o.g?o.g.has(u):!1}function Lo(o,u){o.g?o.g.add(u):o.h=u}function gu(o,u){o.h&&o.h==u?o.h=null:o.g&&o.g.has(u)&&o.g.delete(u)}pu.prototype.cancel=function(){if(this.i=yu(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function yu(o){if(o.h!=null)return o.i.concat(o.h.G);if(o.g!=null&&o.g.size!==0){let u=o.i;for(const d of o.g.values())u=u.concat(d.G);return u}return S(o.i)}var Eu=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Hp(o,u){if(o){o=o.split("&");for(let d=0;d<o.length;d++){const p=o[d].indexOf("=");let A,P=null;p>=0?(A=o[d].substring(0,p),P=o[d].substring(p+1)):A=o[d],u(A,P?decodeURIComponent(P.replace(/\+/g," ")):"")}}}function Bt(o){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let u;o instanceof Bt?(this.l=o.l,Nr(this,o.j),this.o=o.o,this.g=o.g,kr(this,o.u),this.h=o.h,Uo(this,Ru(o.i)),this.m=o.m):o&&(u=String(o).match(Eu))?(this.l=!1,Nr(this,u[1]||"",!0),this.o=Dr(u[2]||""),this.g=Dr(u[3]||"",!0),kr(this,u[4]),this.h=Dr(u[5]||"",!0),Uo(this,u[6]||"",!0),this.m=Dr(u[7]||"")):(this.l=!1,this.i=new Or(null,this.l))}Bt.prototype.toString=function(){const o=[];var u=this.j;u&&o.push(xr(u,Tu,!0),":");var d=this.g;return(d||u=="file")&&(o.push("//"),(u=this.o)&&o.push(xr(u,Tu,!0),"@"),o.push(Cr(d).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),d=this.u,d!=null&&o.push(":",String(d))),(d=this.h)&&(this.g&&d.charAt(0)!="/"&&o.push("/"),o.push(xr(d,d.charAt(0)=="/"?Kp:Gp,!0))),(d=this.i.toString())&&o.push("?",d),(d=this.m)&&o.push("#",xr(d,Yp)),o.join("")},Bt.prototype.resolve=function(o){const u=at(this);let d=!!o.j;d?Nr(u,o.j):d=!!o.o,d?u.o=o.o:d=!!o.g,d?u.g=o.g:d=o.u!=null;var p=o.h;if(d)kr(u,o.u);else if(d=!!o.h){if(p.charAt(0)!="/")if(this.g&&!this.h)p="/"+p;else{var A=u.h.lastIndexOf("/");A!=-1&&(p=u.h.slice(0,A+1)+p)}if(A=p,A==".."||A==".")p="";else if(A.indexOf("./")!=-1||A.indexOf("/.")!=-1){p=A.lastIndexOf("/",0)==0,A=A.split("/");const P=[];for(let O=0;O<A.length;){const G=A[O++];G=="."?p&&O==A.length&&P.push(""):G==".."?((P.length>1||P.length==1&&P[0]!="")&&P.pop(),p&&O==A.length&&P.push("")):(P.push(G),p=!0)}p=P.join("/")}else p=A}return d?u.h=p:d=o.i.toString()!=="",d?Uo(u,Ru(o.i)):d=!!o.m,d&&(u.m=o.m),u};function at(o){return new Bt(o)}function Nr(o,u,d){o.j=d?Dr(u,!0):u,o.j&&(o.j=o.j.replace(/:$/,""))}function kr(o,u){if(u){if(u=Number(u),isNaN(u)||u<0)throw Error("Bad port number "+u);o.u=u}else o.u=null}function Uo(o,u,d){u instanceof Or?(o.i=u,Jp(o.i,o.l)):(d||(u=xr(u,Qp)),o.i=new Or(u,o.l))}function re(o,u,d){o.i.set(u,d)}function Hs(o){return re(o,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),o}function Dr(o,u){return o?u?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function xr(o,u,d){return typeof o=="string"?(o=encodeURI(o).replace(u,Wp),d&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function Wp(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var Tu=/[#\/\?@]/g,Gp=/[#\?:]/g,Kp=/[#\?]/g,Qp=/[#\?@]/g,Yp=/#/g;function Or(o,u){this.h=this.g=null,this.i=o||null,this.j=!!u}function In(o){o.g||(o.g=new Map,o.h=0,o.i&&Hp(o.i,function(u,d){o.add(decodeURIComponent(u.replace(/\+/g," ")),d)}))}n=Or.prototype,n.add=function(o,u){In(this),this.i=null,o=Yn(this,o);let d=this.g.get(o);return d||this.g.set(o,d=[]),d.push(u),this.h+=1,this};function wu(o,u){In(o),u=Yn(o,u),o.g.has(u)&&(o.i=null,o.h-=o.g.get(u).length,o.g.delete(u))}function Iu(o,u){return In(o),u=Yn(o,u),o.g.has(u)}n.forEach=function(o,u){In(this),this.g.forEach(function(d,p){d.forEach(function(A){o.call(u,A,p,this)},this)},this)};function vu(o,u){In(o);let d=[];if(typeof u=="string")Iu(o,u)&&(d=d.concat(o.g.get(Yn(o,u))));else for(o=Array.from(o.g.values()),u=0;u<o.length;u++)d=d.concat(o[u]);return d}n.set=function(o,u){return In(this),this.i=null,o=Yn(this,o),Iu(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[u]),this.h+=1,this},n.get=function(o,u){return o?(o=vu(this,o),o.length>0?String(o[0]):u):u};function Au(o,u,d){wu(o,u),d.length>0&&(o.i=null,o.g.set(Yn(o,u),S(d)),o.h+=d.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],u=Array.from(this.g.keys());for(let p=0;p<u.length;p++){var d=u[p];const A=Cr(d);d=vu(this,d);for(let P=0;P<d.length;P++){let O=A;d[P]!==""&&(O+="="+Cr(d[P])),o.push(O)}}return this.i=o.join("&")};function Ru(o){const u=new Or;return u.i=o.i,o.g&&(u.g=new Map(o.g),u.h=o.h),u}function Yn(o,u){return u=String(u),o.j&&(u=u.toLowerCase()),u}function Jp(o,u){u&&!o.j&&(In(o),o.i=null,o.g.forEach(function(d,p){const A=p.toLowerCase();p!=A&&(wu(this,p),Au(this,A,d))},o)),o.j=u}function Xp(o,u){const d=new br;if(a.Image){const p=new Image;p.onload=f(qt,d,"TestLoadImage: loaded",!0,u,p),p.onerror=f(qt,d,"TestLoadImage: error",!1,u,p),p.onabort=f(qt,d,"TestLoadImage: abort",!1,u,p),p.ontimeout=f(qt,d,"TestLoadImage: timeout",!1,u,p),a.setTimeout(function(){p.ontimeout&&p.ontimeout()},1e4),p.src=o}else u(!1)}function Zp(o,u){const d=new br,p=new AbortController,A=setTimeout(()=>{p.abort(),qt(d,"TestPingServer: timeout",!1,u)},1e4);fetch(o,{signal:p.signal}).then(P=>{clearTimeout(A),P.ok?qt(d,"TestPingServer: ok",!0,u):qt(d,"TestPingServer: server error",!1,u)}).catch(()=>{clearTimeout(A),qt(d,"TestPingServer: error",!1,u)})}function qt(o,u,d,p,A){try{A&&(A.onload=null,A.onerror=null,A.onabort=null,A.ontimeout=null),p(d)}catch{}}function em(){this.g=new Lp}function Mo(o){this.i=o.Sb||null,this.h=o.ab||!1}m(Mo,tu),Mo.prototype.g=function(){return new Ws(this.i,this.h)};function Ws(o,u){Se.call(this),this.H=o,this.o=u,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}m(Ws,Se),n=Ws.prototype,n.open=function(o,u){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=o,this.D=u,this.readyState=1,Ur(this)},n.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const u={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};o&&(u.body=o),(this.H||a).fetch(new Request(this.D,u)).then(this.Pa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,Lr(this)),this.readyState=0},n.Pa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,Ur(this)),this.g&&(this.readyState=3,Ur(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof a.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Pu(this)}else o.text().then(this.Oa.bind(this),this.ga.bind(this))};function Pu(o){o.j.read().then(o.Ma.bind(o)).catch(o.ga.bind(o))}n.Ma=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var u=o.value?o.value:new Uint8Array(0);(u=this.B.decode(u,{stream:!o.done}))&&(this.response=this.responseText+=u)}o.done?Lr(this):Ur(this),this.readyState==3&&Pu(this)}},n.Oa=function(o){this.g&&(this.response=this.responseText=o,Lr(this))},n.Na=function(o){this.g&&(this.response=o,Lr(this))},n.ga=function(){this.g&&Lr(this)};function Lr(o){o.readyState=4,o.l=null,o.j=null,o.B=null,Ur(o)}n.setRequestHeader=function(o,u){this.A.append(o,u)},n.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],u=this.h.entries();for(var d=u.next();!d.done;)d=d.value,o.push(d[0]+": "+d[1]),d=u.next();return o.join(`\r
`)};function Ur(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(Ws.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function Su(o){let u="";return Fs(o,function(d,p){u+=p,u+=":",u+=d,u+=`\r
`}),u}function Fo(o,u,d){e:{for(p in d){var p=!1;break e}p=!0}p||(d=Su(d),typeof o=="string"?d!=null&&Cr(d):re(o,u,d))}function he(o){Se.call(this),this.headers=new Map,this.L=o||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}m(he,Se);var tm=/^https?$/i,nm=["POST","PUT"];n=he.prototype,n.Fa=function(o){this.H=o},n.ea=function(o,u,d,p){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);u=u?u.toUpperCase():"GET",this.D=o,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():cu.g(),this.g.onreadystatechange=E(h(this.Ca,this));try{this.B=!0,this.g.open(u,String(o),!0),this.B=!1}catch(P){bu(this,P);return}if(o=d||"",d=new Map(this.headers),p)if(Object.getPrototypeOf(p)===Object.prototype)for(var A in p)d.set(A,p[A]);else if(typeof p.keys=="function"&&typeof p.get=="function")for(const P of p.keys())d.set(P,p.get(P));else throw Error("Unknown input type for opt_headers: "+String(p));p=Array.from(d.keys()).find(P=>P.toLowerCase()=="content-type"),A=a.FormData&&o instanceof a.FormData,!(Array.prototype.indexOf.call(nm,u,void 0)>=0)||p||A||d.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[P,O]of d)this.g.setRequestHeader(P,O);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(o),this.v=!1}catch(P){bu(this,P)}};function bu(o,u){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=u,o.o=5,Cu(o),Gs(o)}function Cu(o){o.A||(o.A=!0,ke(o,"complete"),ke(o,"error"))}n.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=o||7,ke(this,"complete"),ke(this,"abort"),Gs(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Gs(this,!0)),he.Z.N.call(this)},n.Ca=function(){this.u||(this.B||this.v||this.j?Vu(this):this.Xa())},n.Xa=function(){Vu(this)};function Vu(o){if(o.h&&typeof i<"u"){if(o.v&&$t(o)==4)setTimeout(o.Ca.bind(o),0);else if(ke(o,"readystatechange"),$t(o)==4){o.h=!1;try{const P=o.ca();e:switch(P){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var u=!0;break e;default:u=!1}var d;if(!(d=u)){var p;if(p=P===0){let O=String(o.D).match(Eu)[1]||null;!O&&a.self&&a.self.location&&(O=a.self.location.protocol.slice(0,-1)),p=!tm.test(O?O.toLowerCase():"")}d=p}if(d)ke(o,"complete"),ke(o,"success");else{o.o=6;try{var A=$t(o)>2?o.g.statusText:""}catch{A=""}o.l=A+" ["+o.ca()+"]",Cu(o)}}finally{Gs(o)}}}}function Gs(o,u){if(o.g){o.m&&(clearTimeout(o.m),o.m=null);const d=o.g;o.g=null,u||ke(o,"ready");try{d.onreadystatechange=null}catch{}}}n.isActive=function(){return!!this.g};function $t(o){return o.g?o.g.readyState:0}n.ca=function(){try{return $t(this)>2?this.g.status:-1}catch{return-1}},n.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.La=function(o){if(this.g){var u=this.g.responseText;return o&&u.indexOf(o)==0&&(u=u.substring(o.length)),Op(u)}};function Nu(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.F){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function rm(o){const u={};o=(o.g&&$t(o)>=2&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let p=0;p<o.length;p++){if(g(o[p]))continue;var d=qp(o[p]);const A=d[0];if(d=d[1],typeof d!="string")continue;d=d.trim();const P=u[A]||[];u[A]=P,P.push(d)}Cp(u,function(p){return p.join(", ")})}n.ya=function(){return this.o},n.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function Mr(o,u,d){return d&&d.internalChannelParams&&d.internalChannelParams[o]||u}function ku(o){this.za=0,this.i=[],this.j=new br,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Mr("failFast",!1,o),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Mr("baseRetryDelayMs",5e3,o),this.Za=Mr("retryDelaySeedMs",1e4,o),this.Ta=Mr("forwardChannelMaxRetries",2,o),this.va=Mr("forwardChannelRequestTimeoutMs",2e4,o),this.ma=o&&o.xmlHttpFactory||void 0,this.Ua=o&&o.Rb||void 0,this.Aa=o&&o.useFetchStreams||!1,this.O=void 0,this.L=o&&o.supportsCrossDomainXhr||!1,this.M="",this.h=new pu(o&&o.concurrentRequestLimit),this.Ba=new em,this.S=o&&o.fastHandshake||!1,this.R=o&&o.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=o&&o.Pb||!1,o&&o.ua&&this.j.ua(),o&&o.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&o&&o.detectBufferingProxy||!1,this.ia=void 0,o&&o.longPollingTimeout&&o.longPollingTimeout>0&&(this.ia=o.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}n=ku.prototype,n.ka=8,n.I=1,n.connect=function(o,u,d,p){De(0),this.W=o,this.H=u||{},d&&p!==void 0&&(this.H.OSID=d,this.H.OAID=p),this.F=this.X,this.J=qu(this,null,this.W),Qs(this)};function Bo(o){if(Du(o),o.I==3){var u=o.V++,d=at(o.J);if(re(d,"SID",o.M),re(d,"RID",u),re(d,"TYPE","terminate"),Fr(o,d),u=new Ft(o,o.j,u),u.M=2,u.A=Hs(at(d)),d=!1,a.navigator&&a.navigator.sendBeacon)try{d=a.navigator.sendBeacon(u.A.toString(),"")}catch{}!d&&a.Image&&(new Image().src=u.A,d=!0),d||(u.g=$u(u.j,null),u.g.ea(u.A)),u.F=Date.now(),zs(u)}Bu(o)}function Ks(o){o.g&&($o(o),o.g.cancel(),o.g=null)}function Du(o){Ks(o),o.v&&(a.clearTimeout(o.v),o.v=null),Ys(o),o.h.cancel(),o.m&&(typeof o.m=="number"&&a.clearTimeout(o.m),o.m=null)}function Qs(o){if(!mu(o.h)&&!o.m){o.m=!0;var u=o.Ea;ae||_(),ce||(ae(),ce=!0),I.add(u,o),o.D=0}}function sm(o,u){return _u(o.h)>=o.h.j-(o.m?1:0)?!1:o.m?(o.i=u.G.concat(o.i),!0):o.I==1||o.I==2||o.D>=(o.Sa?0:o.Ta)?!1:(o.m=Sr(h(o.Ea,o,u),Fu(o,o.D)),o.D++,!0)}n.Ea=function(o){if(this.m)if(this.m=null,this.I==1){if(!o){this.V=Math.floor(Math.random()*1e5),o=this.V++;const A=new Ft(this,this.j,o);let P=this.o;if(this.U&&(P?(P=Hc(P),Gc(P,this.U)):P=this.U),this.u!==null||this.R||(A.J=P,P=null),this.S)e:{for(var u=0,d=0;d<this.i.length;d++){t:{var p=this.i[d];if("__data__"in p.map&&(p=p.map.__data__,typeof p=="string")){p=p.length;break t}p=void 0}if(p===void 0)break;if(u+=p,u>4096){u=d;break e}if(u===4096||d===this.i.length-1){u=d+1;break e}}u=1e3}else u=1e3;u=Ou(this,A,u),d=at(this.J),re(d,"RID",o),re(d,"CVER",22),this.G&&re(d,"X-HTTP-Session-Id",this.G),Fr(this,d),P&&(this.R?u="headers="+Cr(Su(P))+"&"+u:this.u&&Fo(d,this.u,P)),Lo(this.h,A),this.Ra&&re(d,"TYPE","init"),this.S?(re(d,"$req",u),re(d,"SID","null"),A.U=!0,ko(A,d,null)):ko(A,d,u),this.I=2}}else this.I==3&&(o?xu(this,o):this.i.length==0||mu(this.h)||xu(this))};function xu(o,u){var d;u?d=u.l:d=o.V++;const p=at(o.J);re(p,"SID",o.M),re(p,"RID",d),re(p,"AID",o.K),Fr(o,p),o.u&&o.o&&Fo(p,o.u,o.o),d=new Ft(o,o.j,d,o.D+1),o.u===null&&(d.J=o.o),u&&(o.i=u.G.concat(o.i)),u=Ou(o,d,1e3),d.H=Math.round(o.va*.5)+Math.round(o.va*.5*Math.random()),Lo(o.h,d),ko(d,p,u)}function Fr(o,u){o.H&&Fs(o.H,function(d,p){re(u,p,d)}),o.l&&Fs({},function(d,p){re(u,p,d)})}function Ou(o,u,d){d=Math.min(o.i.length,d);const p=o.l?h(o.l.Ka,o.l,o):null;e:{var A=o.i;let G=-1;for(;;){const Ee=["count="+d];G==-1?d>0?(G=A[0].g,Ee.push("ofs="+G)):G=0:Ee.push("ofs="+G);let te=!0;for(let Ie=0;Ie<d;Ie++){var P=A[Ie].g;const ct=A[Ie].map;if(P-=G,P<0)G=Math.max(0,A[Ie].g-100),te=!1;else try{P="req"+P+"_"||"";try{var O=ct instanceof Map?ct:Object.entries(ct);for(const[An,jt]of O){let zt=jt;c(jt)&&(zt=So(jt)),Ee.push(P+An+"="+encodeURIComponent(zt))}}catch(An){throw Ee.push(P+"type="+encodeURIComponent("_badmap")),An}}catch{p&&p(ct)}}if(te){O=Ee.join("&");break e}}O=void 0}return o=o.i.splice(0,d),u.G=o,O}function Lu(o){if(!o.g&&!o.v){o.Y=1;var u=o.Da;ae||_(),ce||(ae(),ce=!0),I.add(u,o),o.A=0}}function qo(o){return o.g||o.v||o.A>=3?!1:(o.Y++,o.v=Sr(h(o.Da,o),Fu(o,o.A)),o.A++,!0)}n.Da=function(){if(this.v=null,Uu(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var o=4*this.T;this.j.info("BP detection timer enabled: "+o),this.B=Sr(h(this.Wa,this),o)}},n.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,De(10),Ks(this),Uu(this))};function $o(o){o.B!=null&&(a.clearTimeout(o.B),o.B=null)}function Uu(o){o.g=new Ft(o,o.j,"rpc",o.Y),o.u===null&&(o.g.J=o.o),o.g.P=0;var u=at(o.na);re(u,"RID","rpc"),re(u,"SID",o.M),re(u,"AID",o.K),re(u,"CI",o.F?"0":"1"),!o.F&&o.ia&&re(u,"TO",o.ia),re(u,"TYPE","xmlhttp"),Fr(o,u),o.u&&o.o&&Fo(u,o.u,o.o),o.O&&(o.g.H=o.O);var d=o.g;o=o.ba,d.M=1,d.A=Hs(at(u)),d.u=null,d.R=!0,hu(d,o)}n.Va=function(){this.C!=null&&(this.C=null,Ks(this),qo(this),De(19))};function Ys(o){o.C!=null&&(a.clearTimeout(o.C),o.C=null)}function Mu(o,u){var d=null;if(o.g==u){Ys(o),$o(o),o.g=null;var p=2}else if(Oo(o.h,u))d=u.G,gu(o.h,u),p=1;else return;if(o.I!=0){if(u.o)if(p==1){d=u.u?u.u.length:0,u=Date.now()-u.F;var A=o.D;p=$s(),ke(p,new ou(p,d)),Qs(o)}else Lu(o);else if(A=u.m,A==3||A==0&&u.X>0||!(p==1&&sm(o,u)||p==2&&qo(o)))switch(d&&d.length>0&&(u=o.h,u.i=u.i.concat(d)),A){case 1:vn(o,5);break;case 4:vn(o,10);break;case 3:vn(o,6);break;default:vn(o,2)}}}function Fu(o,u){let d=o.Qa+Math.floor(Math.random()*o.Za);return o.isActive()||(d*=2),d*u}function vn(o,u){if(o.j.info("Error code "+u),u==2){var d=h(o.bb,o),p=o.Ua;const A=!p;p=new Bt(p||"//www.google.com/images/cleardot.gif"),a.location&&a.location.protocol=="http"||Nr(p,"https"),Hs(p),A?Xp(p.toString(),d):Zp(p.toString(),d)}else De(2);o.I=0,o.l&&o.l.pa(u),Bu(o),Du(o)}n.bb=function(o){o?(this.j.info("Successfully pinged google.com"),De(2)):(this.j.info("Failed to ping google.com"),De(1))};function Bu(o){if(o.I=0,o.ja=[],o.l){const u=yu(o.h);(u.length!=0||o.i.length!=0)&&(b(o.ja,u),b(o.ja,o.i),o.h.i.length=0,S(o.i),o.i.length=0),o.l.oa()}}function qu(o,u,d){var p=d instanceof Bt?at(d):new Bt(d);if(p.g!="")u&&(p.g=u+"."+p.g),kr(p,p.u);else{var A=a.location;p=A.protocol,u=u?u+"."+A.hostname:A.hostname,A=+A.port;const P=new Bt(null);p&&Nr(P,p),u&&(P.g=u),A&&kr(P,A),d&&(P.h=d),p=P}return d=o.G,u=o.wa,d&&u&&re(p,d,u),re(p,"VER",o.ka),Fr(o,p),p}function $u(o,u,d){if(u&&!o.L)throw Error("Can't create secondary domain capable XhrIo object.");return u=o.Aa&&!o.ma?new he(new Mo({ab:d})):new he(o.ma),u.Fa(o.L),u}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function ju(){}n=ju.prototype,n.ra=function(){},n.qa=function(){},n.pa=function(){},n.oa=function(){},n.isActive=function(){return!0},n.Ka=function(){};function Js(){}Js.prototype.g=function(o,u){return new Ge(o,u)};function Ge(o,u){Se.call(this),this.g=new ku(u),this.l=o,this.h=u&&u.messageUrlParams||null,o=u&&u.messageHeaders||null,u&&u.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=u&&u.initMessageHeaders||null,u&&u.messageContentType&&(o?o["X-WebChannel-Content-Type"]=u.messageContentType:o={"X-WebChannel-Content-Type":u.messageContentType}),u&&u.sa&&(o?o["X-WebChannel-Client-Profile"]=u.sa:o={"X-WebChannel-Client-Profile":u.sa}),this.g.U=o,(o=u&&u.Qb)&&!g(o)&&(this.g.u=o),this.A=u&&u.supportsCrossDomainXhr||!1,this.v=u&&u.sendRawJson||!1,(u=u&&u.httpSessionIdParam)&&!g(u)&&(this.g.G=u,o=this.h,o!==null&&u in o&&(o=this.h,u in o&&delete o[u])),this.j=new Jn(this)}m(Ge,Se),Ge.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},Ge.prototype.close=function(){Bo(this.g)},Ge.prototype.o=function(o){var u=this.g;if(typeof o=="string"){var d={};d.__data__=o,o=d}else this.v&&(d={},d.__data__=So(o),o=d);u.i.push(new zp(u.Ya++,o)),u.I==3&&Qs(u)},Ge.prototype.N=function(){this.g.l=null,delete this.j,Bo(this.g),delete this.g,Ge.Z.N.call(this)};function zu(o){bo.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var u=o.__sm__;if(u){e:{for(const d in u){o=d;break e}o=void 0}(this.i=o)&&(o=this.i,u=u!==null&&o in u?u[o]:void 0),this.data=u}else this.data=o}m(zu,bo);function Hu(){Co.call(this),this.status=1}m(Hu,Co);function Jn(o){this.g=o}m(Jn,ju),Jn.prototype.ra=function(){ke(this.g,"a")},Jn.prototype.qa=function(o){ke(this.g,new zu(o))},Jn.prototype.pa=function(o){ke(this.g,new Hu)},Jn.prototype.oa=function(){ke(this.g,"b")},Js.prototype.createWebChannel=Js.prototype.g,Ge.prototype.send=Ge.prototype.o,Ge.prototype.open=Ge.prototype.m,Ge.prototype.close=Ge.prototype.close,yd=function(){return new Js},gd=function(){return $s()},_d=Tn,la={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},js.NO_ERROR=0,js.TIMEOUT=8,js.HTTP_ERROR=6,di=js,au.COMPLETE="complete",md=au,nu.EventType=Rr,Rr.OPEN="a",Rr.CLOSE="b",Rr.ERROR="c",Rr.MESSAGE="d",Se.prototype.listen=Se.prototype.J,Hr=nu,he.prototype.listenOnce=he.prototype.K,he.prototype.getLastError=he.prototype.Ha,he.prototype.getLastErrorCode=he.prototype.ya,he.prototype.getStatus=he.prototype.ca,he.prototype.getResponseJson=he.prototype.La,he.prototype.getResponseText=he.prototype.la,he.prototype.send=he.prototype.ea,he.prototype.setWithCredentials=he.prototype.Fa,pd=he}).apply(typeof ei<"u"?ei:typeof self<"u"?self:typeof window<"u"?window:{});/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fe{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Fe.UNAUTHENTICATED=new Fe(null),Fe.GOOGLE_CREDENTIALS=new Fe("google-credentials-uid"),Fe.FIRST_PARTY=new Fe("first-party-uid"),Fe.MOCK_USER=new Fe("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let mr="12.15.0";function qy(n){mr=n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mn=new ka("@firebase/firestore");function Zn(){return Mn.logLevel}function U(n,...e){if(Mn.logLevel<=J.DEBUG){const t=e.map(ja);Mn.debug(`Firestore (${mr}): ${n}`,...t)}}function Ot(n,...e){if(Mn.logLevel<=J.ERROR){const t=e.map(ja);Mn.error(`Firestore (${mr}): ${n}`,...t)}}function Et(n,...e){if(Mn.logLevel<=J.WARN){const t=e.map(ja);Mn.warn(`Firestore (${mr}): ${n}`,...t)}}function ja(n){if(typeof n=="string")return n;try{return(function(t){return JSON.stringify(t)})(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function B(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,Ed(n,r,t)}function Ed(n,e,t){let r=`FIRESTORE (${mr}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch{r+=" CONTEXT: "+t}throw Ot(r),new Error(r)}function M(n,e,t,r){let s="Unexpected state";typeof t=="string"?s=t:r=t,n||Ed(e,s,r)}function H(n,e){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const V={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class x extends It{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ct{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $y{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class jy{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(Fe.UNAUTHENTICATED)))}shutdown(){}}class zy{constructor(e){this.t=e,this.currentUser=Fe.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){M(this.o===void 0,42304);let r=this.i;const s=l=>this.i!==r?(r=this.i,t(l)):Promise.resolve();let i=new Ct;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Ct,e.enqueueRetryable((()=>s(this.currentUser)))};const a=()=>{const l=i;e.enqueueRetryable((async()=>{await l.promise,await s(this.currentUser)}))},c=l=>{U("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit((l=>c(l))),setTimeout((()=>{if(!this.auth){const l=this.t.getImmediate({optional:!0});l?c(l):(U("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Ct)}}),0),a()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((r=>this.i!==e?(U("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(M(typeof r.accessToken=="string",31837,{l:r}),new $y(r.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return M(e===null||typeof e=="string",2055,{h:e}),new Fe(e)}}class Hy{constructor(e,t,r){this.T=e,this.P=t,this.R=r,this.type="FirstParty",this.user=Fe.FIRST_PARTY,this.I=new Map}A(){return this.R?this.R():null}get headers(){this.I.set("X-Goog-AuthUser",this.T);const e=this.A();return e&&this.I.set("Authorization",e),this.P&&this.I.set("X-Goog-Iam-Authorization-Token",this.P),this.I}}class Wy{constructor(e,t,r){this.T=e,this.P=t,this.R=r}getToken(){return Promise.resolve(new Hy(this.T,this.P,this.R))}start(e,t){e.enqueueRetryable((()=>t(Fe.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class Tl{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Gy{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Le(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){M(this.o===void 0,3512);const r=i=>{i.error!=null&&U("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const a=i.token!==this.m;return this.m=i.token,U("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable((()=>r(i)))};const s=i=>{U("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit((i=>s(i))),setTimeout((()=>{if(!this.appCheck){const i=this.V.getImmediate({optional:!0});i?s(i):U("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.p)return Promise.resolve(new Tl(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?(M(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new Tl(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ky(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class za{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const s=Ky(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<t&&(r+=e.charAt(s[i]%62))}return r}}function Y(n,e){return n<e?-1:n>e?1:0}function ha(n,e){const t=Math.min(n.length,e.length);for(let r=0;r<t;r++){const s=n.charAt(r),i=e.charAt(r);if(s!==i)return Ko(s)===Ko(i)?Y(s,i):Ko(s)?1:-1}return Y(n.length,e.length)}const Qy=55296,Yy=57343;function Ko(n){const e=n.charCodeAt(0);return e>=Qy&&e<=Yy}function cr(n,e,t){return n.length===e.length&&n.every(((r,s)=>t(r,e[s])))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lt="__name__";class ut{constructor(e,t,r){t===void 0?t=0:t>e.length&&B(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&B(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return ut.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof ut?e.forEach((r=>{t.push(r)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const i=ut.compareSegments(e.get(s),t.get(s));if(i!==0)return i}return Y(e.length,t.length)}static compareSegments(e,t){const r=ut.isNumericId(e),s=ut.isNumericId(t);return r&&!s?-1:!r&&s?1:r&&s?ut.extractNumericId(e).compare(ut.extractNumericId(t)):ha(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return en.fromString(e.substring(4,e.length-2))}}class Z extends ut{construct(e,t,r){return new Z(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new x(V.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter((s=>s.length>0)))}return new Z(t)}static emptyPath(){return new Z([])}}const Jy=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Te extends ut{construct(e,t,r){return new Te(e,t,r)}static isValidIdentifier(e){return Jy.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Te.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===lt}static keyField(){return new Te([lt])}static fromServerFormat(e){const t=[];let r="",s=0;const i=()=>{if(r.length===0)throw new x(V.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let a=!1;for(;s<e.length;){const c=e[s];if(c==="\\"){if(s+1===e.length)throw new x(V.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const l=e[s+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new x(V.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=l,s+=2}else c==="`"?(a=!a,s++):c!=="."||a?(r+=c,s++):(i(),s++)}if(i(),a)throw new x(V.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Te(t)}static emptyPath(){return new Te([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class F{constructor(e){this.path=e}static fromPath(e){return new F(Z.fromString(e))}static fromName(e){return new F(Z.fromString(e).popFirst(5))}static empty(){return new F(Z.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&Z.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return Z.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new F(new Z(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ha(n,e,t){if(!t)throw new x(V.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function Xy(n,e,t,r){if(e===!0&&r===!0)throw new x(V.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function wl(n){if(!F.isDocumentKey(n))throw new x(V.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function Il(n){if(F.isDocumentKey(n))throw new x(V.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function Ss(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function Qi(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=(function(r){return r.constructor?r.constructor.name:null})(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":B(12329,{type:typeof n})}function tt(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new x(V.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Qi(n);throw new x(V.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function me(n,e){const t={typeString:n};return e&&(t.value=e),t}function bs(n,e){if(!Ss(n))throw new x(V.INVALID_ARGUMENT,"JSON must be an object");let t;for(const r in e)if(e[r]){const s=e[r].typeString,i="value"in e[r]?{value:e[r].value}:void 0;if(!(r in n)){t=`JSON missing required field: '${r}'`;break}const a=n[r];if(s&&typeof a!==s){t=`JSON field '${r}' must be a ${s}.`;break}if(i!==void 0&&a!==i.value){t=`Expected '${r}' field to equal '${i.value}'`;break}}if(t)throw new x(V.INVALID_ARGUMENT,t);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vl=-62135596800,Al=1e6;class se{static now(){return se.fromMillis(Date.now())}static fromDate(e){return se.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*Al);return new se(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new x(V.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new x(V.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<vl)throw new x(V.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new x(V.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Al}_compareTo(e){return this.seconds===e.seconds?Y(this.nanoseconds,e.nanoseconds):Y(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:se._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(bs(e,se._jsonSchema))return new se(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-vl;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}se._jsonSchemaVersion="firestore/timestamp/1.0",se._jsonSchema={type:me("string",se._jsonSchemaVersion),seconds:me("number"),nanoseconds:me("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class z{static fromTimestamp(e){return new z(e)}static min(){return new z(new se(0,0))}static max(){return new z(new se(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const os=-1;function Zy(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=z.fromTimestamp(r===1e9?new se(t+1,0):new se(t,r));return new on(s,F.empty(),e)}function eE(n){return new on(n.readTime,n.key,os)}class on{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new on(z.min(),F.empty(),os)}static max(){return new on(z.max(),F.empty(),os)}}function tE(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=F.comparator(n.documentKey,e.documentKey),t!==0?t:Y(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nE="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class rE{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((e=>e()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _r(n){if(n.code!==V.FAILED_PRECONDITION||n.message!==nE)throw n;U("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class N{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e((t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)}),(t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)}))}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&B(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new N(((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(r,s)}}))}toPromise(){return new Promise(((e,t)=>{this.next(e,t)}))}wrapUserFunction(e){try{const t=e();return t instanceof N?t:N.resolve(t)}catch(t){return N.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction((()=>e(t))):N.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction((()=>e(t))):N.reject(t)}static resolve(e){return new N(((t,r)=>{t(e)}))}static reject(e){return new N(((t,r)=>{r(e)}))}static waitFor(e){return new N(((t,r)=>{let s=0,i=0,a=!1;e.forEach((c=>{++s,c.next((()=>{++i,a&&i===s&&t()}),(l=>r(l)))})),a=!0,i===s&&t()}))}static or(e){let t=N.resolve(!1);for(const r of e)t=t.next((s=>s?N.resolve(s):r()));return t}static forEach(e,t){const r=[];return e.forEach(((s,i)=>{r.push(t.call(this,s,i))})),this.waitFor(r)}static mapArray(e,t){return new N(((r,s)=>{const i=e.length,a=new Array(i);let c=0;for(let l=0;l<i;l++){const h=l;t(e[h]).next((f=>{a[h]=f,++c,c===i&&r(a)}),(f=>s(f)))}}))}static doWhile(e,t){return new N(((r,s)=>{const i=()=>{e()===!0?t().next((()=>{i()}),s):r()};i()}))}}function sE(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function gr(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yi{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.ae(r),this.ue=r=>t.writeSequenceNumber(r))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ue&&this.ue(e),e}}Yi.ce=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wa=-1;function Ji(n){return n==null}function as(n){return n===0&&1/n==-1/0}function iE(n){return typeof n=="number"&&Number.isInteger(n)&&!as(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}function oE(n){return typeof n=="string"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Td="";function aE(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=Rl(e)),e=cE(n.get(t),e);return Rl(e)}function cE(n,e){let t=e;const r=n.length;for(let s=0;s<r;s++){const i=n.charAt(s);switch(i){case"\0":t+="";break;case Td:t+="";break;default:t+=i}}return t}function Rl(n){return n+Td+""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oe{constructor(e,t){this.comparator=e,this.root=t||Re.EMPTY}insert(e,t){return new oe(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Re.BLACK,null,null))}remove(e){return new oe(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Re.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return t+r.left.size;s<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal(((t,r)=>(e(t,r),!1)))}toString(){const e=[];return this.inorderTraversal(((t,r)=>(e.push(`${t}:${r}`),!1))),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new ti(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new ti(this.root,e,this.comparator,!1)}getReverseIterator(){return new ti(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new ti(this.root,e,this.comparator,!0)}}class ti{constructor(e,t,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?r(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Re{constructor(e,t,r,s,i){this.key=e,this.value=t,this.color=r??Re.RED,this.left=s??Re.EMPTY,this.right=i??Re.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,s,i){return new Re(e??this.key,t??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,r),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return Re.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return Re.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Re.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Re.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw B(43730,{key:this.key,value:this.value});if(this.right.isRed())throw B(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw B(27949);return e+(this.isRed()?0:1)}}Re.EMPTY=null,Re.RED=!0,Re.BLACK=!1;Re.EMPTY=new class{constructor(){this.size=0}get key(){throw B(57766)}get value(){throw B(16141)}get color(){throw B(16727)}get left(){throw B(29726)}get right(){throw B(36894)}copy(e,t,r,s,i){return this}insert(e,t,r){return new Re(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _e{constructor(e){this.comparator=e,this.data=new oe(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal(((t,r)=>(e(t),!1)))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Pl(this.data.getIterator())}getIteratorFrom(e){return new Pl(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach((r=>{t=t.add(r)})),t}isEqual(e){if(!(e instanceof _e)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach((t=>{e.push(t)})),e}toString(){const e=[];return this.forEach((t=>e.push(t))),"SortedSet("+e.toString()+")"}copy(e){const t=new _e(this.comparator);return t.data=e,t}}class Pl{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qe{constructor(e){this.fields=e,e.sort(Te.comparator)}static empty(){return new Qe([])}unionWith(e){let t=new _e(Te.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new Qe(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return cr(this.fields,e.fields,((t,r)=>t.isEqual(r)))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bi(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function gn(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function uE(n,e){const t=[];for(const r in n)Object.prototype.hasOwnProperty.call(n,r)&&t.push(e(n[r],r,n));return t}function wd(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Id extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ge{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new Id("Invalid base64 string: "+i):i}})(e);return new ge(t)}static fromUint8Array(e){const t=(function(s){let i="";for(let a=0;a<s.length;++a)i+=String.fromCharCode(s[a]);return i})(e);return new ge(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Y(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}ge.EMPTY_BYTE_STRING=new ge("");const lE=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function an(n){if(M(!!n,39018),typeof n=="string"){let e=0;const t=lE.exec(n);if(M(!!t,46558,{timestamp:n}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:ue(n.seconds),nanos:ue(n.nanos)}}function ue(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function cn(n){return typeof n=="string"?ge.fromBase64String(n):ge.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vd="server_timestamp",Ad="__type__",Rd="__previous_value__",Pd="__local_write_time__";function Xi(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[Ad])==null?void 0:r.stringValue)===vd}function Cs(n){const e=n.mapValue.fields[Rd];return Xi(e)?Cs(e):e}function ur(n){const e=an(n.mapValue.fields[Pd].timestampValue);return new se(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hE{constructor(e,t,r,s,i,a,c,l,h,f,m){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=a,this.autoDetectLongPolling=c,this.longPollingOptions=l,this.useFetchStreams=h,this.isUsingEmulator=f,this.apiKey=m}}const da="(default)";class cs{constructor(e,t){this.projectId=e,this.database=t||da}static empty(){return new cs("","")}get isDefaultDatabase(){return this.database===da}isEqual(e){return e instanceof cs&&e.projectId===this.projectId&&e.database===this.database}}function dE(n,e){if(!Object.prototype.hasOwnProperty.apply(n.options,["projectId"]))throw new x(V.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new cs(n.options.projectId,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sd="__type__",fE="__max__",ni={mapValue:{}},bd="__vector__",us="value",lr={nullValue:"NULL_VALUE"},ze={booleanValue:!0},Ae={booleanValue:!1};function ye(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Xi(n)?4:pE(n)?9007199254740991:Ci(n)?10:11:B(28295,{value:n})}function rt(n,e,t){if(n===e)return!0;const r=ye(n);if(r!==ye(e))return!1;switch(r){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return ur(n).isEqual(ur(e));case 3:return(function(i,a){if(typeof i.timestampValue=="string"&&typeof a.timestampValue=="string"&&i.timestampValue.length===a.timestampValue.length)return i.timestampValue===a.timestampValue;const c=an(i.timestampValue),l=an(a.timestampValue);return c.seconds===l.seconds&&c.nanos===l.nanos})(n,e);case 5:return n.stringValue===e.stringValue;case 6:return(function(i,a){return cn(i.bytesValue).isEqual(cn(a.bytesValue))})(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return(function(i,a){return ue(i.geoPointValue.latitude)===ue(a.geoPointValue.latitude)&&ue(i.geoPointValue.longitude)===ue(a.geoPointValue.longitude)})(n,e);case 2:return(function(i,a,c){if("integerValue"in i&&"integerValue"in a)return ue(i.integerValue)===ue(a.integerValue);let l,h;if("doubleValue"in i&&"doubleValue"in a)l=ue(i.doubleValue),h=ue(a.doubleValue);else{if(!(c!=null&&c.Ee))return!1;l=ue(i.integerValue??i.doubleValue),h=ue(a.integerValue??a.doubleValue)}return l===h?!!(c!=null&&c.he)||as(l)===as(h):!!(c===void 0||c.Te)&&isNaN(l)&&isNaN(h)})(n,e,t);case 9:return cr(n.arrayValue.values||[],e.arrayValue.values||[],((s,i)=>rt(s,i,t)));case 10:case 11:return(function(i,a,c){const l=i.mapValue.fields||{},h=a.mapValue.fields||{};if(bi(l)!==bi(h))return!1;for(const f in l)if(l.hasOwnProperty(f)&&(h[f]===void 0||!rt(l[f],h[f],c)))return!1;return!0})(n,e,t);default:return B(52216,{left:n})}}function ls(n,e){return(n.values||[]).find((t=>rt(t,e)))!==void 0}function He(n,e){if(n===e)return 0;const t=ye(n),r=ye(e);if(t!==r)return Y(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return Y(n.booleanValue,e.booleanValue);case 2:return(function(i,a){const c=ue(i.integerValue||i.doubleValue),l=ue(a.integerValue||a.doubleValue);return c<l?-1:c>l?1:c===l?0:isNaN(c)?isNaN(l)?0:-1:1})(n,e);case 3:return Sl(n.timestampValue,e.timestampValue);case 4:return Sl(ur(n),ur(e));case 5:return ha(n.stringValue,e.stringValue);case 6:return(function(i,a){const c=cn(i),l=cn(a);return c.compareTo(l)})(n.bytesValue,e.bytesValue);case 7:return(function(i,a){const c=i.split("/"),l=a.split("/");for(let h=0;h<c.length&&h<l.length;h++){const f=Y(c[h],l[h]);if(f!==0)return f}return Y(c.length,l.length)})(n.referenceValue,e.referenceValue);case 8:return(function(i,a){const c=Y(ue(i.latitude),ue(a.latitude));return c!==0?c:Y(ue(i.longitude),ue(a.longitude))})(n.geoPointValue,e.geoPointValue);case 9:return bl(n.arrayValue,e.arrayValue);case 10:return(function(i,a){var E,S,b,L;const c=i.fields||{},l=a.fields||{},h=(E=c[us])==null?void 0:E.arrayValue,f=(S=l[us])==null?void 0:S.arrayValue,m=Y(((b=h==null?void 0:h.values)==null?void 0:b.length)||0,((L=f==null?void 0:f.values)==null?void 0:L.length)||0);return m!==0?m:bl(h,f)})(n.mapValue,e.mapValue);case 11:return(function(i,a){if(i===ni.mapValue&&a===ni.mapValue)return 0;if(i===ni.mapValue)return 1;if(a===ni.mapValue)return-1;const c=i.fields||{},l=Object.keys(c),h=a.fields||{},f=Object.keys(h);l.sort(),f.sort();for(let m=0;m<l.length&&m<f.length;++m){const E=ha(l[m],f[m]);if(E!==0)return E;const S=He(c[l[m]],h[f[m]]);if(S!==0)return S}return Y(l.length,f.length)})(n.mapValue,e.mapValue);default:throw B(23264,{Pe:t})}}function Sl(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return Y(n,e);const t=an(n),r=an(e),s=Y(t.seconds,r.seconds);return s!==0?s:Y(t.nanos,r.nanos)}function bl(n,e){const t=n.values||[],r=e.values||[];for(let s=0;s<t.length&&s<r.length;++s){const i=He(t[s],r[s]);if(i!==void 0&&i!==0)return i}return Y(t.length,r.length)}function hr(n){return fa(n)}function fa(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?(function(t){const r=an(t);return`time(${r.seconds},${r.nanos})`})(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?(function(t){return cn(t).toBase64()})(n.bytesValue):"referenceValue"in n?(function(t){return F.fromName(t).toString()})(n.referenceValue):"geoPointValue"in n?(function(t){return`geo(${t.latitude},${t.longitude})`})(n.geoPointValue):"arrayValue"in n?(function(t){let r="[",s=!0;for(const i of t.values||[])s?s=!1:r+=",",r+=fa(i);return r+"]"})(n.arrayValue):"mapValue"in n?(function(t){const r=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const a of r)i?i=!1:s+=",",s+=`${a}:${fa(t.fields[a])}`;return s+"}"})(n.mapValue):B(61005,{value:n})}function fi(n){switch(ye(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=Cs(n);return e?16+fi(e):16;case 5:return 2*n.stringValue.length;case 6:return cn(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return(function(r){return(r.values||[]).reduce(((s,i)=>s+fi(i)),0)})(n.arrayValue);case 10:case 11:return(function(r){let s=0;return gn(r.fields,((i,a)=>{s+=i.length+fi(a)})),s})(n.mapValue);default:throw B(13486,{value:n})}}function Cl(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function ht(n){return!!n&&"integerValue"in n}function Cn(n){return!!n&&"doubleValue"in n}function un(n){return ht(n)||Cn(n)}function dr(n){return!!n&&"arrayValue"in n}function Ye(n){return!!n&&"nullValue"in n}function We(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Vn(n){return!!n&&"mapValue"in n}function Ci(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[Sd])==null?void 0:r.stringValue)===bd}function pa(n){var e,t;return(t=(((e=n==null?void 0:n.mapValue)==null?void 0:e.fields)||{})[us])==null?void 0:t.arrayValue}function Yr(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const e={mapValue:{fields:{}}};return gn(n.mapValue.fields,((t,r)=>e.mapValue.fields[t]=Yr(r))),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Yr(n.arrayValue.values[t]);return e}return{...n}}function pE(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===fE}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ue{constructor(e){this.value=e}static empty(){return new Ue({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!Vn(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Yr(t)}setAll(e){let t=Te.emptyPath(),r={},s=[];e.forEach(((a,c)=>{if(!t.isImmediateParentOf(c)){const l=this.getFieldsMap(t);this.applyChanges(l,r,s),r={},s=[],t=c.popLast()}a?r[c.lastSegment()]=Yr(a):s.push(c.lastSegment())}));const i=this.getFieldsMap(t);this.applyChanges(i,r,s)}delete(e){const t=this.field(e.popLast());Vn(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return rt(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=t.mapValue.fields[e.get(r)];Vn(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,r){gn(t,((s,i)=>e[s]=i));for(const s of r)delete e[s]}clone(){return new Ue(Yr(this.value))}}function Cd(n){const e=[];return gn(n.fields,((t,r)=>{const s=new Te([t]);if(Vn(r)){const i=Cd(r.mapValue).fields;if(i.length===0)e.push(s);else for(const a of i)e.push(s.child(a))}else e.push(s)})),new Qe(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zi(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:as(e)?"-0":e}}function Ga(n){return{integerValue:""+n}}function Ka(n,e,t){return Number.isInteger(e)&&(t!=null&&t.preferIntegers)||iE(e)?Ga(e):Zi(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eo{constructor(){this._=void 0}}function mE(n,e,t){return n instanceof Vi?(function(s,i){const a={fields:{[Ad]:{stringValue:vd},[Pd]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&Xi(i)&&(i=Cs(i)),i&&(a.fields[Rd]=i),{mapValue:a}})(t,e):n instanceof hs?Nd(n,e):n instanceof ds?kd(n,e):n instanceof fs?(function(s,i){const a=Vd(s,i),c=Di(a)+Di(s.Re);return ht(a)&&ht(s.Re)?Ga(c):Zi(s.serializer,c)})(n,e):n instanceof Ni?(function(s,i){return Vl(s,i,Math.min)})(n,e):n instanceof ki?(function(s,i){return Vl(s,i,Math.max)})(n,e):void 0}function _E(n,e,t){return n instanceof hs?Nd(n,e):n instanceof ds?kd(n,e):t}function Vd(n,e){return n instanceof fs?un(e)?e:{integerValue:0}:null}class Vi extends eo{}class hs extends eo{constructor(e){super(),this.elements=e}}function Nd(n,e){const t=Dd(e);for(const r of n.elements)t.some((s=>rt(s,r)))||t.push(r);return{arrayValue:{values:t}}}class ds extends eo{constructor(e){super(),this.elements=e}}function kd(n,e){let t=Dd(e);for(const r of n.elements)t=t.filter((s=>!rt(s,r)));return{arrayValue:{values:t}}}class Qa extends eo{constructor(e,t){super(),this.serializer=e,this.Re=t}}class fs extends Qa{}class Ni extends Qa{}class ki extends Qa{}function Vl(n,e,t){if(!un(e))return n.Re;const r=t(Di(e),Di(n.Re));return ht(e)&&ht(n.Re)?Ga(r):Zi(n.serializer,r)}function Di(n){return ue(n.integerValue||n.doubleValue)}function Dd(n){return dr(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}function gE(n,e){return n.field.isEqual(e.field)&&(function(r,s){return r instanceof hs&&s instanceof hs||r instanceof ds&&s instanceof ds?cr(r.elements,s.elements,rt):r instanceof fs&&s instanceof fs||r instanceof Ni&&s instanceof Ni||r instanceof ki&&s instanceof ki?rt(r.Re,s.Re):r instanceof Vi&&s instanceof Vi})(n.transform,e.transform)}class yE{constructor(e,t){this.version=e,this.transformResults=t}}class Xe{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Xe}static exists(e){return new Xe(void 0,e)}static updateTime(e){return new Xe(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function pi(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class to{}function xd(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new no(n.key,Xe.none()):new Vs(n.key,n.data,Xe.none());{const t=n.data,r=Ue.empty();let s=new _e(Te.comparator);for(let i of e.fields)if(!s.has(i)){let a=t.field(i);a===null&&i.length>1&&(i=i.popLast(),a=t.field(i)),a===null?r.delete(i):r.set(i,a),s=s.add(i)}return new yn(n.key,r,new Qe(s.toArray()),Xe.none())}}function EE(n,e,t){n instanceof Vs?(function(s,i,a){const c=s.value.clone(),l=kl(s.fieldTransforms,i,a.transformResults);c.setAll(l),i.convertToFoundDocument(a.version,c).setHasCommittedMutations()})(n,e,t):n instanceof yn?(function(s,i,a){if(!pi(s.precondition,i))return void i.convertToUnknownDocument(a.version);const c=kl(s.fieldTransforms,i,a.transformResults),l=i.data;l.setAll(Od(s)),l.setAll(c),i.convertToFoundDocument(a.version,l).setHasCommittedMutations()})(n,e,t):(function(s,i,a){i.convertToNoDocument(a.version).setHasCommittedMutations()})(0,e,t)}function Jr(n,e,t,r){return n instanceof Vs?(function(i,a,c,l){if(!pi(i.precondition,a))return c;const h=i.value.clone(),f=Dl(i.fieldTransforms,l,a);return h.setAll(f),a.convertToFoundDocument(a.version,h).setHasLocalMutations(),null})(n,e,t,r):n instanceof yn?(function(i,a,c,l){if(!pi(i.precondition,a))return c;const h=Dl(i.fieldTransforms,l,a),f=a.data;return f.setAll(Od(i)),f.setAll(h),a.convertToFoundDocument(a.version,f).setHasLocalMutations(),c===null?null:c.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map((m=>m.field)))})(n,e,t,r):(function(i,a,c){return pi(i.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):c})(n,e,t)}function TE(n,e){let t=null;for(const r of n.fieldTransforms){const s=e.data.field(r.field),i=Vd(r.transform,s||null);i!=null&&(t===null&&(t=Ue.empty()),t.set(r.field,i))}return t||null}function Nl(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!(function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&cr(r,s,((i,a)=>gE(i,a)))})(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class Vs extends to{constructor(e,t,r,s=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class yn extends to{constructor(e,t,r,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Od(n){const e=new Map;return n.fieldMask.fields.forEach((t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}})),e}function kl(n,e,t){const r=new Map;M(n.length===t.length,32656,{Ie:t.length,Ae:n.length});for(let s=0;s<t.length;s++){const i=n[s],a=i.transform,c=e.data.field(i.field);r.set(i.field,_E(a,c,t[s]))}return r}function Dl(n,e,t){const r=new Map;for(const s of n){const i=s.transform,a=t.data.field(s.field);r.set(s.field,mE(i,a,e))}return r}class no extends to{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class wE extends to{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xi{constructor(e,t){this.position=e,this.inclusive=t}}function xl(n,e,t){let r=0;for(let s=0;s<n.position.length;s++){const i=e[s],a=n.position[s];if(i.field.isKeyField()?r=F.comparator(F.fromName(a.referenceValue),t.key):r=He(a,t.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function Ol(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!rt(n.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ld{}class pe extends Ld{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new vE(e,t,r):t==="array-contains"?new PE(e,r):t==="in"?new SE(e,r):t==="not-in"?new bE(e,r):t==="array-contains-any"?new CE(e,r):new pe(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new AE(e,r):new RE(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(He(t,this.value)):t!==null&&ye(this.value)===ye(t)&&this.matchesComparison(He(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return B(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class ot extends Ld{constructor(e,t){super(),this.filters=e,this.op=t,this.Ve=null}static create(e,t){return new ot(e,t)}matches(e){return Ud(this)?this.filters.find((t=>!t.matches(e)))===void 0:this.filters.find((t=>t.matches(e)))!==void 0}getFlattenedFilters(){return this.Ve!==null||(this.Ve=this.filters.reduce(((e,t)=>e.concat(t.getFlattenedFilters())),[])),this.Ve}getFilters(){return Object.assign([],this.filters)}}function Ud(n){return n.op==="and"}function Md(n){return IE(n)&&Ud(n)}function IE(n){for(const e of n.filters)if(e instanceof ot)return!1;return!0}function ma(n){if(n instanceof pe)return n.field.canonicalString()+n.op.toString()+hr(n.value);if(Md(n))return n.filters.map((e=>ma(e))).join(",");{const e=n.filters.map((t=>ma(t))).join(",");return`${n.op}(${e})`}}function Fd(n,e){return n instanceof pe?(function(r,s){return s instanceof pe&&r.op===s.op&&r.field.isEqual(s.field)&&rt(r.value,s.value)})(n,e):n instanceof ot?(function(r,s){return s instanceof ot&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce(((i,a,c)=>i&&Fd(a,s.filters[c])),!0):!1})(n,e):void B(19439)}function Bd(n){return n instanceof pe?(function(t){return`${t.field.canonicalString()} ${t.op} ${hr(t.value)}`})(n):n instanceof ot?(function(t){return t.op.toString()+" {"+t.getFilters().map(Bd).join(" ,")+"}"})(n):"Filter"}class vE extends pe{constructor(e,t,r){super(e,t,r),this.key=F.fromName(r.referenceValue)}matches(e){const t=F.comparator(e.key,this.key);return this.matchesComparison(t)}}class AE extends pe{constructor(e,t){super(e,"in",t),this.keys=qd("in",t)}matches(e){return this.keys.some((t=>t.isEqual(e.key)))}}class RE extends pe{constructor(e,t){super(e,"not-in",t),this.keys=qd("not-in",t)}matches(e){return!this.keys.some((t=>t.isEqual(e.key)))}}function qd(n,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map((r=>F.fromName(r.referenceValue)))}class PE extends pe{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return dr(t)&&ls(t.arrayValue,this.value)}}class SE extends pe{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&ls(this.value.arrayValue,t)}}class bE extends pe{constructor(e,t){super(e,"not-in",t)}matches(e){if(ls(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!ls(this.value.arrayValue,t)}}class CE extends pe{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!dr(t)||!t.arrayValue.values)&&t.arrayValue.values.some((r=>ls(this.value.arrayValue,r)))}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ps{constructor(e,t="asc"){this.field=e,this.dir=t}}function VE(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ce{constructor(e,t,r,s,i,a,c){this.key=e,this.documentType=t,this.version=r,this.readTime=s,this.createTime=i,this.data=a,this.documentState=c}static newInvalidDocument(e){return new Ce(e,0,z.min(),z.min(),z.min(),Ue.empty(),0)}static newFoundDocument(e,t,r,s){return new Ce(e,1,t,z.min(),r,s,0)}static newNoDocument(e,t){return new Ce(e,2,t,z.min(),z.min(),Ue.empty(),0)}static newUnknownDocument(e,t){return new Ce(e,3,t,z.min(),z.min(),Ue.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(z.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Ue.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Ue.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=z.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Ce&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Ce(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class NE{constructor(e,t=null,r=[],s=[],i=null,a=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=a,this.endAt=c,this.de=null}}function Ll(n,e=null,t=[],r=[],s=null,i=null,a=null){return new NE(n,e,t,r,s,i,a)}function $d(n){const e=H(n);if(e.de===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map((r=>ma(r))).join(","),t+="|ob:",t+=e.orderBy.map((r=>(function(i){return i.field.canonicalString()+i.dir})(r))).join(","),Ji(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map((r=>hr(r))).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map((r=>hr(r))).join(",")),e.de=t}return e.de}function jd(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!VE(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!Fd(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!Ol(n.startAt,e.startAt)&&Ol(n.endAt,e.endAt)}function Pn(n){return!!n.isCorePipeline}function zd(n){return!!n.path&&F.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zn{constructor(e,t=null,r=[],s=[],i=null,a="F",c=null,l=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=a,this.startAt=c,this.endAt=l,this.fe=null,this.me=null,this.pe=null,this.startAt,this.endAt}}function kE(n,e,t,r,s,i,a,c){return new zn(n,e,t,r,s,i,a,c)}function ro(n){return new zn(n)}function Ul(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function DE(n){return F.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function Hd(n){return n.collectionGroup!==null}function Xr(n){const e=H(n);if(e.fe===null){e.fe=[];const t=new Set;for(const i of e.explicitOrderBy)e.fe.push(i),t.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let c=new _e(Te.comparator);return a.filters.forEach((l=>{l.getFlattenedFilters().forEach((h=>{h.isInequality()&&(c=c.add(h.field))}))})),c})(e).forEach((i=>{t.has(i.canonicalString())||i.isKeyField()||e.fe.push(new ps(i,r))})),t.has(Te.keyField().canonicalString())||e.fe.push(new ps(Te.keyField(),r))}return e.fe}function _t(n){const e=H(n);return e.me||(e.me=xE(e,Xr(n))),e.me}function xE(n,e){if(n.limitType==="F")return Ll(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map((s=>{const i=s.dir==="desc"?"asc":"desc";return new ps(s.field,i)}));const t=n.endAt?new xi(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new xi(n.startAt.position,n.startAt.inclusive):null;return Ll(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function _a(n,e){const t=n.filters.concat([e]);return new zn(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function OE(n,e){const t=n.explicitOrderBy.concat([e]);return new zn(n.path,n.collectionGroup,t,n.filters.slice(),n.limit,n.limitType,n.startAt,n.endAt)}function ga(n,e,t){return new zn(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function LE(n,e){return jd(_t(n),_t(e))&&n.limitType===e.limitType}function Zr(n){return`Query(target=${(function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map((s=>Bd(s))).join(", ")}]`),Ji(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map((s=>(function(a){return`${a.field.canonicalString()} (${a.dir})`})(s))).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map((s=>hr(s))).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map((s=>hr(s))).join(",")),`Target(${r})`})(_t(n))}; limitType=${n.limitType})`}function so(n,e){return e.isFoundDocument()&&(function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):F.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)})(n,e)&&(function(r,s){for(const i of Xr(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0})(n,e)&&(function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0})(n,e)&&(function(r,s){return!(r.startAt&&!(function(a,c,l){const h=xl(a,c,l);return a.inclusive?h<=0:h<0})(r.startAt,Xr(r),s)||r.endAt&&!(function(a,c,l){const h=xl(a,c,l);return a.inclusive?h>=0:h>0})(r.endAt,Xr(r),s))})(n,e)}function Ya(n){return(e,t)=>{let r=!1;for(const s of Xr(n)){const i=UE(s,e,t);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function UE(n,e,t){const r=n.field.isKeyField()?F.comparator(e.key,t.key):(function(i,a,c){const l=a.data.field(i),h=c.data.field(i);return l!==null&&h!==null?He(l,h):B(42886)})(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return B(19790,{direction:n.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ME{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var fe,X;function FE(n){switch(n){case V.OK:return B(64938);case V.CANCELLED:case V.UNKNOWN:case V.DEADLINE_EXCEEDED:case V.RESOURCE_EXHAUSTED:case V.INTERNAL:case V.UNAVAILABLE:case V.UNAUTHENTICATED:return!1;case V.INVALID_ARGUMENT:case V.NOT_FOUND:case V.ALREADY_EXISTS:case V.PERMISSION_DENIED:case V.FAILED_PRECONDITION:case V.ABORTED:case V.OUT_OF_RANGE:case V.UNIMPLEMENTED:case V.DATA_LOSS:return!0;default:return B(15467,{code:n})}}function Wd(n){if(n===void 0)return Ot("GRPC error has no .code"),V.UNKNOWN;switch(n){case fe.OK:return V.OK;case fe.CANCELLED:return V.CANCELLED;case fe.UNKNOWN:return V.UNKNOWN;case fe.DEADLINE_EXCEEDED:return V.DEADLINE_EXCEEDED;case fe.RESOURCE_EXHAUSTED:return V.RESOURCE_EXHAUSTED;case fe.INTERNAL:return V.INTERNAL;case fe.UNAVAILABLE:return V.UNAVAILABLE;case fe.UNAUTHENTICATED:return V.UNAUTHENTICATED;case fe.INVALID_ARGUMENT:return V.INVALID_ARGUMENT;case fe.NOT_FOUND:return V.NOT_FOUND;case fe.ALREADY_EXISTS:return V.ALREADY_EXISTS;case fe.PERMISSION_DENIED:return V.PERMISSION_DENIED;case fe.FAILED_PRECONDITION:return V.FAILED_PRECONDITION;case fe.ABORTED:return V.ABORTED;case fe.OUT_OF_RANGE:return V.OUT_OF_RANGE;case fe.UNIMPLEMENTED:return V.UNIMPLEMENTED;case fe.DATA_LOSS:return V.DATA_LOSS;default:return B(39323,{code:n})}}(X=fe||(fe={}))[X.OK=0]="OK",X[X.CANCELLED=1]="CANCELLED",X[X.UNKNOWN=2]="UNKNOWN",X[X.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",X[X.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",X[X.NOT_FOUND=5]="NOT_FOUND",X[X.ALREADY_EXISTS=6]="ALREADY_EXISTS",X[X.PERMISSION_DENIED=7]="PERMISSION_DENIED",X[X.UNAUTHENTICATED=16]="UNAUTHENTICATED",X[X.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",X[X.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",X[X.ABORTED=10]="ABORTED",X[X.OUT_OF_RANGE=11]="OUT_OF_RANGE",X[X.UNIMPLEMENTED=12]="UNIMPLEMENTED",X[X.INTERNAL=13]="INTERNAL",X[X.UNAVAILABLE=14]="UNAVAILABLE",X[X.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hn{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[t]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){gn(this.inner,((t,r)=>{for(const[s,i]of r)e(s,i)}))}isEmpty(){return wd(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const BE=new oe(F.comparator);function $e(){return BE}const Gd=new oe(F.comparator);function er(...n){let e=Gd;for(const t of n)e=e.insert(t.key,t);return e}function Kd(n){let e=Gd;return n.forEach(((t,r)=>e=e.insert(t,r.overlayedDocument))),e}function Jt(){return es()}function Qd(){return es()}function es(){return new Hn((n=>n.toString()),((n,e)=>n.isEqual(e)))}const qE=new oe(F.comparator),$E=new _e(F.comparator);function Q(...n){let e=$E;for(const t of n)e=e.add(t);return e}const jE=new _e(Y);function zE(){return jE}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function HE(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const WE=new en([4294967295,4294967295],0);function Ml(n){const e=HE().encode(n),t=new fd;return t.update(e),new Uint8Array(t.digest())}function Fl(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new en([t,r],0),new en([s,i],0)]}class Ja{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Wr(`Invalid padding: ${t}`);if(r<0)throw new Wr(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Wr(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Wr(`Invalid padding when bitmap length is 0: ${t}`);this.ge=8*e.length-t,this.ye=en.fromNumber(this.ge)}we(e,t,r){let s=e.add(t.multiply(en.fromNumber(r)));return s.compare(WE)===1&&(s=new en([s.getBits(0),s.getBits(1)],0)),s.modulo(this.ye).toNumber()}be(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;const t=Ml(e),[r,s]=Fl(t);for(let i=0;i<this.hashCount;i++){const a=this.we(r,s,i);if(!this.be(a))return!1}return!0}static create(e,t,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),a=new Ja(i,s,t);return r.forEach((c=>a.insert(c))),a}insert(e){if(this.ge===0)return;const t=Ml(e),[r,s]=Fl(t);for(let i=0;i<this.hashCount;i++){const a=this.we(r,s,i);this.ve(a)}}ve(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Wr extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ns{constructor(e,t,r,s,i,a){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=s,this.augmentedDocumentUpdates=i,this.resolvedLimboDocuments=a}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const s=new Map;return s.set(e,ks.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new Ns(z.min(),s,new oe(Y),$e(),$e(),Q())}}class ks{constructor(e,t,r,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new ks(r,t,Q(),Q(),Q())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mi{constructor(e,t,r,s){this.Se=e,this.removedTargetIds=t,this.key=r,this.De=s}}class Yd{constructor(e,t){this.targetId=e,this.xe=t}}class Jd{constructor(e,t,r=ge.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=s}}class Bl{constructor(e){this.targetId=e,this.Ce=0,this.Fe=ql(),this.Oe=ge.EMPTY_BYTE_STRING,this.Me=!1,this.Ne=!0}get current(){return this.Me}get resumeToken(){return this.Oe}get Le(){return this.Ce!==0}get Be(){return this.Ne}Ue(e){e.approximateByteSize()>0&&(this.Ne=!0,this.Oe=e)}ke(){let e=Q(),t=Q(),r=Q();return this.Fe.forEach(((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:r=r.add(s);break;default:B(38017,{changeType:i})}})),new ks(this.Oe,this.Me,e,t,r)}qe(){this.Ne=!1,this.Fe=ql()}$e(e,t){this.Ne=!0,this.Fe=this.Fe.insert(e,t)}Ke(e){this.Ne=!0,this.Fe=this.Fe.remove(e)}We(){this.Ce+=1}Qe(){this.Ce-=1,M(this.Ce>=0,3241,{Ce:this.Ce,targetId:this.targetId})}Ge(){this.Ne=!0,this.Me=!0}}const Br="WatchChangeAggregator";class GE{constructor(e){this.ze=e,this.je=new Map,this.He=$e(),this.Je=ri(),this.Ye=$e(),this.Ze=ri(),this.Xe=new oe(Y)}et(e){for(const t of e.Se)e.De&&e.De.isFoundDocument()?this.tt(t,e.De):this.nt(t,e.key,e.De);for(const t of e.removedTargetIds)this.nt(t,e.key,e.De)}rt(e){this.forEachTarget(e,(t=>{const r=this.je.get(t);if(r)switch(e.state){case 0:this.it(t)&&r.Ue(e.resumeToken);break;case 1:r.Qe(),r.Le||r.qe(),r.Ue(e.resumeToken);break;case 2:r.Qe(),r.Le||this.removeTarget(t);break;case 3:this.it(t)&&(r.Ge(),r.Ue(e.resumeToken));break;case 4:this.it(t)&&(this.st(t),r.Ue(e.resumeToken));break;default:B(56790,{state:e.state})}else U(Br,`handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`)}))}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.je.forEach(((r,s)=>{this.it(s)&&t(s)}))}_t(e){var t;return Pn(e)?e.getPipelineSourceType()==="documents"&&((t=e.getPipelineDocuments())==null?void 0:t.length)===1:zd(e)}ot(e){const t=e.targetId,r=e.xe.count,s=this.ut(t);if(s){const i=s.target;if(this._t(i))if(r===0){const a=new F(Pn(i)?Z.fromString(i.getPipelineDocuments()[0]):i.path);this.nt(t,a,Ce.newNoDocument(a,z.min()))}else M(r===1,20013,"Single document existence filter with count: "+r);else{const a=this.ct(t);if(a!==r){const c=this.lt(e),l=c?this.Et(c,e,a):1;if(l!==0){this.st(t);const h=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Xe=this.Xe.insert(t,h)}}}}}lt(e){const t=e.xe.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=t;let a,c;try{a=cn(r).toUint8Array()}catch(l){if(l instanceof Id)return Et("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{c=new Ja(a,s,i)}catch(l){return Et(l instanceof Wr?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return c.ge===0?null:c}Et(e,t,r){return t.xe.count===r-this.Pt(e,t.targetId)?0:2}Pt(e,t){const r=this.ze.getRemoteKeysForTarget(t);let s=0;return r.forEach((i=>{const a=this.ze.Tt(),c=`projects/${a.projectId}/databases/${a.database}/documents/${i.path.canonicalString()}`;e.mightContain(c)||(this.nt(t,i,null),s++)})),s}Rt(e){const t=new Map;this.je.forEach(((i,a)=>{const c=this.ut(a);if(c){if(i.current&&this._t(c.target)){const l=Pn(c.target)?Z.fromString(c.target.getPipelineDocuments()[0]):c.target.path,h=new F(l);this.It(h).has(a)||this.At(a,h)||this.nt(a,h,Ce.newNoDocument(h,e))}i.Be&&(t.set(a,i.ke()),i.qe())}}));let r=Q();this.Ze.forEach(((i,a)=>{let c=!0;a.forEachWhile((l=>{const h=this.ut(l);return!h||h.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)})),c&&(r=r.add(i))})),this.He.forEach(((i,a)=>a.setReadTime(e))),this.Ye.forEach(((i,a)=>a.setReadTime(e)));const s=new Ns(e,t,this.Xe,this.He,this.Ye,r);return this.He=$e(),this.Je=ri(),this.Ye=$e(),this.Ze=ri(),this.Xe=new oe(Y),s}tt(e,t){const r=this.je.get(e);if(!r||!this.it(e))return void U(Br,`addDocumentToTarget received document for unknown inactive target (${e})`);const s=this.At(e,t.key)?2:0;r.$e(t.key,s),Pn(this.ut(e).target)&&this.ut(e).target.getPipelineFlavor()!=="exact"?this.Ye=this.Ye.insert(t.key,t):this.He=this.He.insert(t.key,t),this.Je=this.Je.insert(t.key,this.It(t.key).add(e)),this.Ze=this.Ze.insert(t.key,this.Vt(t.key).add(e))}nt(e,t,r){const s=this.je.get(e);s&&this.it(e)?(this.At(e,t)?s.$e(t,1):s.Ke(t),this.Ze=this.Ze.insert(t,this.Vt(t).delete(e)),this.Ze=this.Ze.insert(t,this.Vt(t).add(e)),r&&(Pn(this.ut(e).target)&&this.ut(e).target.getPipelineFlavor()!=="exact"?this.Ye=this.Ye.insert(t,r):this.He=this.He.insert(t,r))):U(Br,`removeDocumentFromTarget received document for unknown or inactive target (${e})`)}removeTarget(e){this.je.delete(e)}ct(e){const t=this.je.get(e);if(!t)return 0;const r=t.ke();return this.ze.getRemoteKeysForTarget(e).size+r.addedDocuments.size-r.removedDocuments.size}We(e){let t=this.je.get(e);t||(U(Br,`recordPendingTargetRequest set up tracking for target ID ${e}`),t=new Bl(e),this.je.set(e,t)),t.We()}Vt(e){let t=this.Ze.get(e);return t||(t=new _e(Y),this.Ze=this.Ze.insert(e,t)),t}It(e){let t=this.Je.get(e);return t||(t=new _e(Y),this.Je=this.Je.insert(e,t)),t}it(e){const t=this.ut(e)!==null;return t||U(Br,"Detected inactive target",e),t}ut(e){const t=this.je.get(e);return t===void 0||t.Le?null:this.ze.dt(e)}st(e){this.je.set(e,new Bl(e)),this.ze.getRemoteKeysForTarget(e).forEach((t=>{this.nt(e,t,null)}))}At(e,t){return this.ze.getRemoteKeysForTarget(e).has(t)}}function ri(){return new oe(F.comparator)}function ql(){return new oe(F.comparator)}const KE={asc:"ASCENDING",desc:"DESCENDING"},QE={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},YE={and:"AND",or:"OR"};class JE{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function ya(n,e){return n.useProto3Json||Ji(e)?e:{value:e}}function Oi(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Xa(n){const e=an(n);return new se(e.seconds,e.nanos)}function Xd(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function _i(n,e){return Oi(n,e.toTimestamp())}function gt(n){return M(!!n,49232),z.fromTimestamp(Xa(n))}function Za(n,e){return Ea(n,e).canonicalString()}function Ea(n,e){const t=(function(s){return new Z(["projects",s.projectId,"databases",s.database])})(n).child("documents");return e===void 0?t:t.child(e)}function Zd(n){const e=Z.fromString(n);return M(sf(e),10190,{key:e.toString()}),e}function Li(n,e){return Za(n.databaseId,e.path)}function Qo(n,e){const t=Zd(e);if(t.get(1)!==n.databaseId.projectId)throw new x(V.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new x(V.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new F(tf(t))}function ef(n,e){return Za(n.databaseId,e)}function XE(n){const e=Zd(n);return e.length===4?Z.emptyPath():tf(e)}function Ta(n){return new Z(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function tf(n){return M(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function $l(n,e,t){return{name:Li(n,e),fields:t.value.mapValue.fields}}function ZE(n,e){let t;if("targetChange"in e){e.targetChange;const r=(function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:B(39313,{state:h})})(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=(function(h,f){return h.useProto3Json?(M(f===void 0||typeof f=="string",58123),ge.fromBase64String(f||"")):(M(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),ge.fromUint8Array(f||new Uint8Array))})(n,e.targetChange.resumeToken),a=e.targetChange.cause,c=a&&(function(h){const f=h.code===void 0?V.UNKNOWN:Wd(h.code);return new x(f,h.message||"")})(a);t=new Jd(r,s,i,c||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=Qo(n,r.document.name),i=gt(r.document.updateTime),a=r.document.createTime?gt(r.document.createTime):z.min(),c=new Ue({mapValue:{fields:r.document.fields}}),l=Ce.newFoundDocument(s,i,a,c),h=r.targetIds||[],f=r.removedTargetIds||[];t=new mi(h,f,l.key,l)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=Qo(n,r.document),i=r.readTime?gt(r.readTime):z.min(),a=Ce.newNoDocument(s,i),c=r.removedTargetIds||[];t=new mi([],c,a.key,a)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=Qo(n,r.document),i=r.removedTargetIds||[];t=new mi([],i,s,null)}else{if(!("filter"in e))return B(11601,{ft:e});{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,a=new ME(s,i),c=r.targetId;t=new Yd(c,a)}}return t}function eT(n,e){let t;if(e instanceof Vs)t={update:$l(n,e.key,e.value)};else if(e instanceof no)t={delete:Li(n,e.key)};else if(e instanceof yn)t={update:$l(n,e.key,e.data),updateMask:lT(e.fieldMask)};else{if(!(e instanceof wE))return B(16599,{gt:e.type});t={verify:Li(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map((r=>(function(i,a){const c=a.transform;if(c instanceof Vi)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof hs)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof ds)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof fs)return{fieldPath:a.field.canonicalString(),increment:c.Re};if(c instanceof Ni)return{fieldPath:a.field.canonicalString(),minimum:c.Re};if(c instanceof ki)return{fieldPath:a.field.canonicalString(),maximum:c.Re};throw B(20930,{transform:a.transform})})(0,r)))),e.precondition.isNone||(t.currentDocument=(function(s,i){return i.updateTime!==void 0?{updateTime:_i(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:B(27497)})(n,e.precondition)),t}function tT(n,e){return n&&n.length>0?(M(e!==void 0,14353),n.map((t=>(function(s,i){let a=s.updateTime?gt(s.updateTime):gt(i);return a.isEqual(z.min())&&(a=gt(i)),new yE(a,s.transformResults||[])})(t,e)))):[]}function nT(n,e){return{documents:[ef(n,e.path)]}}function rT(n,e){const t={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=ef(n,s);const i=(function(h){if(h.length!==0)return rf(ot.create(h,"and"))})(e.filters);i&&(t.structuredQuery.where=i);const a=(function(h){if(h.length!==0)return h.map((f=>(function(E){return{field:tr(E.field),direction:aT(E.dir)}})(f)))})(e.orderBy);a&&(t.structuredQuery.orderBy=a);const c=ya(n,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=(function(h){return{before:h.inclusive,values:h.position}})(e.startAt)),e.endAt&&(t.structuredQuery.endAt=(function(h){return{before:!h.inclusive,values:h.position}})(e.endAt)),{yt:t,parent:s}}function sT(n){let e=XE(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let s=null;if(r>0){M(r===1,65062);const f=t.from[0];f.allDescendants?s=f.collectionId:e=e.child(f.collectionId)}let i=[];t.where&&(i=(function(m){const E=nf(m);return E instanceof ot&&Md(E)?E.getFilters():[E]})(t.where));let a=[];t.orderBy&&(a=(function(m){return m.map((E=>(function(b){return new ps(nr(b.field),(function(k){switch(k){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}})(b.direction))})(E)))})(t.orderBy));let c=null;t.limit&&(c=(function(m){let E;return E=typeof m=="object"?m.value:m,Ji(E)?null:E})(t.limit));let l=null;t.startAt&&(l=(function(m){const E=!!m.before,S=m.values||[];return new xi(S,E)})(t.startAt));let h=null;return t.endAt&&(h=(function(m){const E=!m.before,S=m.values||[];return new xi(S,E)})(t.endAt)),kE(e,s,a,i,c,"F",l,h)}function iT(n,e){const t=(function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return B(28987,{purpose:s})}})(e.purpose);return t==null?null:{"goog-listen-tags":t}}function oT(n,e){return{structuredPipeline:{pipeline:{stages:e.stages.map((t=>t._toProto(n)))}}}}function nf(n){return n.unaryFilter!==void 0?(function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=nr(t.unaryFilter.field);return pe.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=nr(t.unaryFilter.field);return pe.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=nr(t.unaryFilter.field);return pe.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=nr(t.unaryFilter.field);return pe.create(a,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return B(61313);default:return B(60726)}})(n):n.fieldFilter!==void 0?(function(t){return pe.create(nr(t.fieldFilter.field),(function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return B(58110);default:return B(50506)}})(t.fieldFilter.op),t.fieldFilter.value)})(n):n.compositeFilter!==void 0?(function(t){return ot.create(t.compositeFilter.filters.map((r=>nf(r))),(function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return B(1026)}})(t.compositeFilter.op))})(n):B(30097,{filter:n})}function aT(n){return KE[n]}function cT(n){return QE[n]}function uT(n){return YE[n]}function tr(n){return{fieldPath:n.canonicalString()}}function nr(n){return Te.fromServerFormat(n.fieldPath)}function rf(n){return n instanceof pe?(function(t){if(t.op==="=="){if(We(t.value))return{unaryFilter:{field:tr(t.field),op:"IS_NAN"}};if(Ye(t.value))return{unaryFilter:{field:tr(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(We(t.value))return{unaryFilter:{field:tr(t.field),op:"IS_NOT_NAN"}};if(Ye(t.value))return{unaryFilter:{field:tr(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:tr(t.field),op:cT(t.op),value:t.value}}})(n):n instanceof ot?(function(t){const r=t.getFilters().map((s=>rf(s)));return r.length===1?r[0]:{compositeFilter:{op:uT(t.op),filters:r}}})(n):B(54877,{filter:n})}function lT(n){const e=[];return n.fields.forEach((t=>e.push(t.canonicalString()))),{fieldPaths:e}}function sf(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}function of(n){return!!n&&typeof n._toProto=="function"&&n._protoValueType==="ProtoValue"}function ms(n,e){const t={fields:{}};return e.forEach(((r,s)=>{if(typeof s!="string")throw new Error(`Cannot encode map with non-string key: ${s}`);t.fields[s]=r._toProto(n)})),{mapValue:t}}function af(n){return{stringValue:n}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function io(n){return new JE(n,!0)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class et{constructor(e){this._byteString=e}static fromBase64String(e){try{return new et(ge.fromBase64String(e))}catch(t){throw new x(V.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new et(ge.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:et._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(bs(e,et._jsonSchema))return et.fromBase64String(e.bytes)}}et._jsonSchemaVersion="firestore/bytes/1.0",et._jsonSchema={type:me("string",et._jsonSchemaVersion),bytes:me("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oo{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new x(V.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Te(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}function hT(){return new oo(lt)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ec{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yt{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new x(V.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new x(V.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return Y(this._lat,e._lat)||Y(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:yt._jsonSchemaVersion}}static fromJSON(e){if(bs(e,yt._jsonSchema))return new yt(e.latitude,e.longitude)}}function cf(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */yt._jsonSchemaVersion="firestore/geoPoint/1.0",yt._jsonSchema={type:me("string",yt._jsonSchemaVersion),latitude:me("number"),longitude:me("number")};class dT{bt(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jl="ConnectivityMonitor";class zl{constructor(){this.vt=()=>this.St(),this.Dt=()=>this.xt(),this.Ct=[],this.Ft()}bt(e){this.Ct.push(e)}shutdown(){window.removeEventListener("online",this.vt),window.removeEventListener("offline",this.Dt)}Ft(){window.addEventListener("online",this.vt),window.addEventListener("offline",this.Dt)}St(){U(jl,"Network connectivity changed: AVAILABLE");for(const e of this.Ct)e(0)}xt(){U(jl,"Network connectivity changed: UNAVAILABLE");for(const e of this.Ct)e(1)}static C(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let si=null;function wa(){return si===null?si=(function(){return 268435456+Math.round(2147483648*Math.random())})():si++,"0x"+si.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yo="RestConnection",fT={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class pT{get Ot(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Mt=t+"://"+e.host,this.Nt=`projects/${r}/databases/${s}`,this.Lt=this.databaseId.database===da?`project_id=${r}`:`project_id=${r}&database_id=${s}`}Bt(e,t,r,s,i){const a=wa(),c=this.Ut(e,t.toUriEncodedString());U(Yo,`Sending RPC '${e}' ${a}:`,c,r);const l={"google-cloud-resource-prefix":this.Nt,"x-goog-request-params":this.Lt};this.kt(l,s,i);const{host:h}=new URL(c),f=$n(h);return this.qt(e,c,l,r,f).then((m=>(U(Yo,`Received RPC '${e}' ${a}: `,m),m)),(m=>{throw Et(Yo,`RPC '${e}' ${a} failed with error: `,m,"url: ",c,"request:",r),m}))}$t(e,t,r,s,i,a){return this.Bt(e,t,r,s,i)}kt(e,t,r){e["X-Goog-Api-Client"]=(function(){return"gl-js/ fire/"+mr})(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach(((s,i)=>e[i]=s)),r&&r.headers.forEach(((s,i)=>e[i]=s))}Ut(e,t){const r=fT[e];let s=`${this.Mt}/v1/${t}:${r}`;return this.databaseInfo.apiKey&&(s=`${s}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),s}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mT{constructor(e){this.Kt=e.Kt,this.Wt=e.Wt}Qt(e){this.Gt=e}zt(e){this.jt=e}Ht(e){this.Jt=e}onMessage(e){this.Yt=e}close(){this.Wt()}send(e){this.Kt(e)}Zt(){this.Gt()}Xt(){this.jt()}en(e){this.Jt(e)}tn(e){this.Yt(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const be="WebChannelConnection",qr=(n,e,t)=>{n.listen(e,(r=>{try{t(r)}catch(s){setTimeout((()=>{throw s}),0)}}))};class or extends pT{constructor(e){super(e),this.nn=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static rn(){if(!or.sn){const e=gd();qr(e,_d.STAT_EVENT,(t=>{t.stat===la.PROXY?U(be,"STAT_EVENT: detected buffering proxy"):t.stat===la.NOPROXY&&U(be,"STAT_EVENT: detected no buffering proxy")})),or.sn=!0}}qt(e,t,r,s,i){const a=wa();return new Promise(((c,l)=>{const h=new pd;h.setWithCredentials(!0),h.listenOnce(md.COMPLETE,(()=>{try{switch(h.getLastErrorCode()){case di.NO_ERROR:const m=h.getResponseJson();U(be,`XHR for RPC '${e}' ${a} received:`,JSON.stringify(m)),c(m);break;case di.TIMEOUT:U(be,`RPC '${e}' ${a} timed out`),l(new x(V.DEADLINE_EXCEEDED,"Request time out"));break;case di.HTTP_ERROR:const E=h.getStatus();if(U(be,`RPC '${e}' ${a} failed with status:`,E,"response text:",h.getResponseText()),E>0){let S=h.getResponseJson();Array.isArray(S)&&(S=S[0]);const b=S==null?void 0:S.error;if(b&&b.status&&b.message){const L=(function($){const W=$.toLowerCase().replace(/_/g,"-");return Object.values(V).indexOf(W)>=0?W:V.UNKNOWN})(b.status);l(new x(L,b.message))}else l(new x(V.UNKNOWN,"Server responded with status "+h.getStatus()))}else l(new x(V.UNAVAILABLE,"Connection failed."));break;default:B(9055,{_n:e,streamId:a,an:h.getLastErrorCode(),un:h.getLastError()})}}finally{U(be,`RPC '${e}' ${a} completed.`)}}));const f=JSON.stringify(s);U(be,`RPC '${e}' ${a} sending request:`,s),h.send(t,"POST",f,r,15)}))}cn(e,t,r){const s=wa(),i=[this.Mt,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=this.createWebChannelTransport(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},l=this.longPollingOptions.timeoutSeconds;l!==void 0&&(c.longPollingTimeout=Math.round(1e3*l)),this.useFetchStreams&&(c.useFetchStreams=!0),this.kt(c.initMessageHeaders,t,r),c.encodeInitMessageHeaders=!0;const h=i.join("");U(be,`Creating RPC '${e}' stream ${s}: ${h}`,c);const f=a.createWebChannel(h,c);this.En(f);let m=!1,E=!1;const S=new mT({Kt:b=>{E?U(be,`Not sending because RPC '${e}' stream ${s} is closed:`,b):(m||(U(be,`Opening RPC '${e}' stream ${s} transport.`),f.open(),m=!0),U(be,`RPC '${e}' stream ${s} sending:`,b),f.send(b))},Wt:()=>f.close()});return qr(f,Hr.EventType.OPEN,(()=>{E||(U(be,`RPC '${e}' stream ${s} transport opened.`),S.Zt())})),qr(f,Hr.EventType.CLOSE,(()=>{E||(E=!0,U(be,`RPC '${e}' stream ${s} transport closed`),S.en(),this.hn(f))})),qr(f,Hr.EventType.ERROR,(b=>{E||(E=!0,Et(be,`RPC '${e}' stream ${s} transport errored. Name:`,b.name,"Message:",b.message),S.en(new x(V.UNAVAILABLE,"The operation could not be completed")))})),qr(f,Hr.EventType.MESSAGE,(b=>{var L;if(!E){const k=b.data[0];M(!!k,16349);const $=k,W=($==null?void 0:$.error)||((L=$[0])==null?void 0:L.error);if(W){U(be,`RPC '${e}' stream ${s} received error:`,W);const K=W.status;let ee=(function(I){const _=fe[I];if(_!==void 0)return Wd(_)})(K),ae=W.message;K==="NOT_FOUND"&&ae.includes("database")&&ae.includes("does not exist")&&ae.includes(this.databaseId.database)&&Et(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),ee===void 0&&(ee=V.INTERNAL,ae="Unknown error status: "+K+" with message "+W.message),E=!0,S.en(new x(ee,ae)),f.close()}else U(be,`RPC '${e}' stream ${s} received:`,k),S.tn(k)}})),or.rn(),setTimeout((()=>{S.Xt()}),0),S}terminate(){this.nn.forEach((e=>e.close())),this.nn=[]}En(e){this.nn.push(e)}hn(e){this.nn=this.nn.filter((t=>t===e))}kt(e,t,r){super.kt(e,t,r),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return yd()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _T(n){return new or(n)}or.sn=!1;class uf{constructor(e,t,r=1e3,s=1.5,i=6e4){this.Tn=e,this.timerId=t,this.Pn=r,this.Rn=s,this.In=i,this.An=0,this.Vn=null,this.dn=Date.now(),this.reset()}reset(){this.An=0}fn(){this.An=this.In}mn(e){this.cancel();const t=Math.floor(this.An+this.pn()),r=Math.max(0,Date.now()-this.dn),s=Math.max(0,t-r);s>0&&U("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.An} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.Vn=this.Tn.enqueueAfterDelay(this.timerId,s,(()=>(this.dn=Date.now(),e()))),this.An*=this.Rn,this.An<this.Pn&&(this.An=this.Pn),this.An>this.In&&(this.An=this.In)}gn(){this.Vn!==null&&(this.Vn.skipDelay(),this.Vn=null)}cancel(){this.Vn!==null&&(this.Vn.cancel(),this.Vn=null)}pn(){return(Math.random()-.5)*this.An}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hl="PersistentStream";class lf{constructor(e,t,r,s,i,a,c,l){this.Tn=e,this.yn=r,this.wn=s,this.connection=i,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=c,this.listener=l,this.state=0,this.bn=0,this.vn=null,this.Sn=null,this.stream=null,this.Dn=0,this.xn=new uf(e,t)}Cn(){return this.state===1||this.state===5||this.Fn()}Fn(){return this.state===2||this.state===3}start(){this.Dn=0,this.state!==4?this.auth():this.On()}async stop(){this.Cn()&&await this.close(0)}Mn(){this.state=0,this.xn.reset()}Nn(){this.Fn()&&this.vn===null&&(this.vn=this.Tn.enqueueAfterDelay(this.yn,6e4,(()=>this.Ln())))}Bn(e){this.Un(),this.stream.send(e)}async Ln(){if(this.Fn())return this.close(0)}Un(){this.vn&&(this.vn.cancel(),this.vn=null)}kn(){this.Sn&&(this.Sn.cancel(),this.Sn=null)}async close(e,t){this.Un(),this.kn(),this.xn.cancel(),this.bn++,e!==4?this.xn.reset():t&&t.code===V.RESOURCE_EXHAUSTED?(Ot(t.toString()),Ot("Using maximum backoff delay to prevent overloading the backend."),this.xn.fn()):t&&t.code===V.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.qn(),this.stream.close(),this.stream=null),this.state=e,await this.listener.Ht(t)}qn(){}auth(){this.state=1;const e=this.$n(this.bn),t=this.bn;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([r,s])=>{this.bn===t&&this.Kn(r,s)}),(r=>{e((()=>{const s=new x(V.UNKNOWN,"Fetching auth token failed: "+r.message);return this.Wn(s)}))}))}Kn(e,t){const r=this.$n(this.bn);this.stream=this.Qn(e,t),this.stream.Qt((()=>{r((()=>this.listener.Qt()))})),this.stream.zt((()=>{r((()=>(this.state=2,this.Sn=this.Tn.enqueueAfterDelay(this.wn,1e4,(()=>(this.Fn()&&(this.state=3),Promise.resolve()))),this.listener.zt())))})),this.stream.Ht((s=>{r((()=>this.Wn(s)))})),this.stream.onMessage((s=>{r((()=>++this.Dn==1?this.Gn(s):this.onNext(s)))}))}On(){this.state=5,this.xn.mn((async()=>{this.state=0,this.start()}))}Wn(e){return U(Hl,`close with error: ${e}`),this.stream=null,this.close(4,e)}$n(e){return t=>{this.Tn.enqueueAndForget((()=>this.bn===e?t():(U(Hl,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class gT extends lf{constructor(e,t,r,s,i,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,s,a),this.serializer=i}Qn(e,t){return this.connection.cn("Listen",e,t)}Gn(e){return this.onNext(e)}onNext(e){this.xn.reset();const t=ZE(this.serializer,e),r=(function(i){if(!("targetChange"in i))return z.min();const a=i.targetChange;return a.targetIds&&a.targetIds.length?z.min():a.readTime?gt(a.readTime):z.min()})(e);return this.listener.zn(t,r)}jn(e){const t={};t.database=Ta(this.serializer),t.addTarget=(function(i,a){let c;const l=a.target;if(c=Pn(l)?{pipelineQuery:oT(i,l)}:zd(l)?{documents:nT(i,l)}:{query:rT(i,l).yt},c.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){c.resumeToken=Xd(i,a.resumeToken);const h=ya(i,a.expectedCount);h!==null&&(c.expectedCount=h)}else if(a.snapshotVersion.compareTo(z.min())>0){c.readTime=Oi(i,a.snapshotVersion.toTimestamp());const h=ya(i,a.expectedCount);h!==null&&(c.expectedCount=h)}return c})(this.serializer,e);const r=iT(this.serializer,e);r&&(t.labels=r),this.Bn(t)}Hn(e){const t={};t.database=Ta(this.serializer),t.removeTarget=e,this.Bn(t)}}class yT extends lf{constructor(e,t,r,s,i,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,s,a),this.serializer=i}get Jn(){return this.Dn>0}start(){this.lastStreamToken=void 0,super.start()}qn(){this.Jn&&this.Yn([])}Qn(e,t){return this.connection.cn("Write",e,t)}Gn(e){return M(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,M(!e.writeResults||e.writeResults.length===0,55816),this.listener.Zn()}onNext(e){M(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.xn.reset();const t=tT(e.writeResults,e.commitTime),r=gt(e.commitTime);return this.listener.Xn(r,t)}er(){const e={};e.database=Ta(this.serializer),this.Bn(e)}Yn(e){const t={streamToken:this.lastStreamToken,writes:e.map((r=>eT(this.serializer,r)))};this.Bn(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ET{}class TT extends ET{constructor(e,t,r,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=s,this.tr=!1}nr(){if(this.tr)throw new x(V.FAILED_PRECONDITION,"The client has already been terminated.")}Bt(e,t,r,s){return this.nr(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([i,a])=>this.connection.Bt(e,Ea(t,r),s,i,a))).catch((i=>{throw i.name==="FirebaseError"?(i.code===V.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new x(V.UNKNOWN,i.toString())}))}$t(e,t,r,s,i){return this.nr(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([a,c])=>this.connection.$t(e,Ea(t,r),s,a,c,i))).catch((a=>{throw a.name==="FirebaseError"?(a.code===V.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new x(V.UNKNOWN,a.toString())}))}terminate(){this.tr=!0,this.connection.terminate()}}function wT(n,e,t,r){return new TT(n,e,t,r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const IT="ComponentProvider",Wl=new Map;function vT(n,e,t,r,s){return new hE(n,e,t,s.host,s.ssl,s.experimentalForceLongPolling,s.experimentalAutoDetectLongPolling,cf(s.experimentalLongPollingOptions),s.useFetchStreams,s.isUsingEmulator,r)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gl={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},hf=41943040;class Be{static withCacheSize(e){return new Be(e,Be.DEFAULT_COLLECTION_PERCENTILE,Be.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}}Be.DEFAULT_COLLECTION_PERCENTILE=10,Be.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Be.DEFAULT=new Be(hf,Be.DEFAULT_COLLECTION_PERCENTILE,Be.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Be.DISABLED=new Be(-1,0,0);/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Kl="LruGarbageCollector",df=1048576;function Ql([n,e],[t,r]){const s=Y(n,t);return s===0?Y(e,r):s}class AT{constructor(e){this.rr=e,this.buffer=new _e(Ql),this.ir=0}sr(){return++this.ir}_r(e){const t=[e,this.sr()];if(this.buffer.size<this.rr)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();Ql(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class RT{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.ar=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.ur(6e4)}stop(){this.ar&&(this.ar.cancel(),this.ar=null)}get started(){return this.ar!==null}ur(e){U(Kl,`Garbage collection scheduled in ${e}ms`),this.ar=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,(async()=>{this.ar=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){gr(t)?U(Kl,"Ignoring IndexedDB error during garbage collection: ",t):await _r(t)}await this.ur(3e5)}))}}class PT{constructor(e,t){this.cr=e,this.params=t}calculateTargetCount(e,t){return this.cr.lr(e).next((r=>Math.floor(t/100*r)))}nthSequenceNumber(e,t){if(t===0)return N.resolve(Yi.ce);const r=new AT(t);return this.cr.forEachTarget(e,(s=>r._r(s.sequenceNumber))).next((()=>this.cr.Er(e,(s=>r._r(s))))).next((()=>r.maxValue))}removeTargets(e,t,r){return this.cr.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.cr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(U("LruGarbageCollector","Garbage collection skipped; disabled"),N.resolve(Gl)):this.getCacheSize(e).next((r=>r<this.params.cacheSizeCollectionThreshold?(U("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Gl):this.hr(e,t)))}getCacheSize(e){return this.cr.getCacheSize(e)}hr(e,t){let r,s,i,a,c,l,h;const f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next((m=>(m>this.params.maximumSequenceNumbersToCollect?(U("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${m}`),s=this.params.maximumSequenceNumbersToCollect):s=m,a=Date.now(),this.nthSequenceNumber(e,s)))).next((m=>(r=m,c=Date.now(),this.removeTargets(e,r,t)))).next((m=>(i=m,l=Date.now(),this.removeOrphanedDocuments(e,r)))).next((m=>(h=Date.now(),Zn()<=J.DEBUG&&U("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${a-f}ms
	Determined least recently used ${s} in `+(c-a)+`ms
	Removed ${i} targets in `+(l-c)+`ms
	Removed ${m} documents in `+(h-l)+`ms
Total Duration: ${h-f}ms`),N.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:m}))))}}function ST(n,e){return new PT(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bT="firestore.googleapis.com",Yl=!0;class Jl{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new x(V.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=bT,this.ssl=Yl}else this.host=e.host,this.ssl=e.ssl??Yl;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=hf;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<df)throw new x(V.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Xy("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=cf(e.experimentalLongPollingOptions??{}),(function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new x(V.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new x(V.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new x(V.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(r,s){return r.timeoutSeconds===s.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class ao{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Jl({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new x(V.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new x(V.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Jl(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=(function(r){if(!r)return new jy;switch(r.type){case"firstParty":return new Wy(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new x(V.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const r=Wl.get(t);r&&(U(IT,"Removing Datastore"),Wl.delete(t),r.terminate())})(this),Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mt{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new Mt(this.firestore,e,this._query)}}class de{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new tn(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new de(this.firestore,e,this._key)}toJSON(){return{type:de._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(bs(t,de._jsonSchema))return new de(e,r||null,new F(Z.fromString(t.referencePath)))}}de._jsonSchemaVersion="firestore/documentReference/1.0",de._jsonSchema={type:me("string",de._jsonSchemaVersion),referencePath:me("string")};class tn extends Mt{constructor(e,t,r){super(e,t,ro(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new de(this.firestore,null,new F(e))}withConverter(e){return new tn(this.firestore,e,this._path)}}function oR(n,e,...t){if(n=ne(n),Ha("collection","path",e),n instanceof ao){const r=Z.fromString(e,...t);return Il(r),new tn(n,null,r)}{if(!(n instanceof de||n instanceof tn))throw new x(V.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(Z.fromString(e,...t));return Il(r),new tn(n.firestore,null,r)}}function aR(n,e){if(n=tt(n,ao),Ha("collectionGroup","collection id",e),e.indexOf("/")>=0)throw new x(V.INVALID_ARGUMENT,`Invalid collection ID '${e}' passed to function collectionGroup(). Collection IDs must not contain '/'.`);return new Mt(n,null,(function(r){return new zn(Z.emptyPath(),r)})(e))}function cR(n,e,...t){if(n=ne(n),arguments.length===1&&(e=za.newId()),Ha("doc","path",e),n instanceof ao){const r=Z.fromString(e,...t);return wl(r),new de(n,null,new F(r))}{if(!(n instanceof de||n instanceof tn))throw new x(V.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(Z.fromString(e,...t));return wl(r),new de(n.firestore,n instanceof tn?n.converter:null,new F(r))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class je{constructor(e){this._values=(e||[]).map((t=>t))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0})(this._values,e._values)}toJSON(){return{type:je._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(bs(e,je._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((t=>typeof t=="number")))return new je(e.vectorValues);throw new x(V.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}je._jsonSchemaVersion="firestore/vectorValue/1.0",je._jsonSchema={type:me("string",je._jsonSchemaVersion),vectorValues:me("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const CT=/^__.*__$/;class VT{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new yn(e,this.data,this.fieldMask,t,this.fieldTransforms):new Vs(e,this.data,t,this.fieldTransforms)}}class ff{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new yn(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function pf(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw B(40011,{dataSource:n})}}class tc{constructor(e,t,r,s,i,a){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.validatePath(),this.fieldTransforms=i||[],this.fieldMask=a||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new tc({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){var s;const t=(s=this.path)==null?void 0:s.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePathSegment(e),r}childContextForFieldPath(e){var s;const t=(s=this.path)==null?void 0:s.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePath(),r}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return Ui(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find((t=>e.isPrefixOf(t)))!==void 0||this.fieldTransforms.find((t=>e.isPrefixOf(t.field)))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(pf(this.dataSource)&&CT.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class NT{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||io(e)}createContext(e,t,r,s=!1){return new tc({dataSource:e,methodName:t,targetDoc:r,path:Te.emptyPath(),arrayElement:!1,hasConverter:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function nc(n){const e=n._freezeSettings(),t=io(n._databaseId);return new NT(n._databaseId,!!e.ignoreUndefinedProperties,t)}function mf(n,e,t,r,s,i={}){const a=n.createContext(i.merge||i.mergeFields?2:0,e,t,s);rc("Data must be an object, but it was:",a,r);const c=_f(r,a);let l,h;if(i.merge)l=new Qe(a.fieldMask),h=a.fieldTransforms;else if(i.mergeFields){const f=[];for(const m of i.mergeFields){const E=Fn(e,m,t);if(!a.contains(E))throw new x(V.INVALID_ARGUMENT,`Field '${E}' is specified in your field mask but missing from your input data.`);Ef(f,E)||f.push(E)}l=new Qe(f),h=a.fieldTransforms.filter((m=>l.covers(m.field)))}else l=null,h=a.fieldTransforms;return new VT(new Ue(c),l,h)}class co extends ec{_toFieldTransform(e){if(e.dataSource!==2)throw e.dataSource===1?e.createError(`${this._methodName}() can only appear at the top level of your update data`):e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof co}}function kT(n,e,t,r){const s=n.createContext(1,e,t);rc("Data must be an object, but it was:",s,r);const i=[],a=Ue.empty();gn(r,((l,h)=>{const f=yf(e,l,t);h=ne(h);const m=s.childContextForFieldPath(f);if(h instanceof co)i.push(f);else{const E=ln(h,m);E!=null&&(i.push(f),a.set(f,E))}}));const c=new Qe(i);return new ff(a,c,s.fieldTransforms)}function DT(n,e,t,r,s,i){const a=n.createContext(1,e,t),c=[Fn(e,r,t)],l=[s];if(i.length%2!=0)throw new x(V.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let E=0;E<i.length;E+=2)c.push(Fn(e,i[E])),l.push(i[E+1]);const h=[],f=Ue.empty();for(let E=c.length-1;E>=0;--E)if(!Ef(h,c[E])){const S=c[E];let b=l[E];b=ne(b);const L=a.childContextForFieldPath(S);if(b instanceof co)h.push(S);else{const k=ln(b,L);k!=null&&(h.push(S),f.set(S,k))}}const m=new Qe(h);return new ff(f,m,a.fieldTransforms)}function xT(n,e,t,r=!1){return ln(t,n.createContext(r?4:3,e))}function ln(n,e,t){if(gf(n=ne(n)))return rc("Unsupported field value:",e,n),_f(n,e);if(n instanceof ec)return(function(s,i){if(!pf(i.dataSource))throw i.createError(`${s._methodName}() can only be used with update() and set()`);if(!i.path)throw i.createError(`${s._methodName}() is not currently supported inside arrays`);const a=s._toFieldTransform(i);a&&i.fieldTransforms.push(a)})(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return(function(s,i){const a=[];let c=0;for(const l of s){let h=ln(l,i.childContextForArray(c));h==null&&(h={nullValue:"NULL_VALUE"}),a.push(h),c++}return{arrayValue:{values:a}}})(n,e)}return(function(s,i,a){if((s=ne(s))===null)return{nullValue:"NULL_VALUE"};if(typeof s=="number")return Ka(i.serializer,s,a);if(typeof s=="boolean")return{booleanValue:s};if(typeof s=="string")return{stringValue:s};if(s instanceof Date){const c=se.fromDate(s);return{timestampValue:Oi(i.serializer,c)}}if(s instanceof se){const c=new se(s.seconds,1e3*Math.floor(s.nanoseconds/1e3));return{timestampValue:Oi(i.serializer,c)}}if(s instanceof yt)return{geoPointValue:{latitude:s.latitude,longitude:s.longitude}};if(s instanceof et)return{bytesValue:Xd(i.serializer,s._byteString)};if(s instanceof de){const c=i.databaseId,l=s.firestore._databaseId;if(!l.isEqual(c))throw i.createError(`Document reference is for database ${l.projectId}/${l.database} but should be for database ${c.projectId}/${c.database}`);return{referenceValue:Za(s.firestore._databaseId||i.databaseId,s._key.path)}}if(s instanceof je)return(function(l,h){const f=l instanceof je?l.toArray():l;return{mapValue:{fields:{[Sd]:{stringValue:bd},[us]:{arrayValue:{values:f.map((E=>{if(typeof E!="number")throw h.createError("VectorValues must only contain numeric values.");return Zi(h.serializer,E)}))}}}}}})(s,i);if(of(s))return s._toProto(i.serializer);throw i.createError(`Unsupported field value: ${Qi(s)}`)})(n,e,t)}function _f(n,e){const t={};return wd(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):gn(n,((r,s)=>{const i=ln(s,e.childContextForField(r));i!=null&&(t[r]=i)})),{mapValue:{fields:t}}}function gf(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof se||n instanceof yt||n instanceof et||n instanceof de||n instanceof ec||n instanceof je||of(n))}function rc(n,e,t){if(!gf(t)||!Ss(t)){const r=Qi(t);throw r==="an object"?e.createError(n+" a custom object"):e.createError(n+" "+r)}}function Fn(n,e,t){if((e=ne(e))instanceof oo)return e._internalPath;if(typeof e=="string")return yf(n,e);throw Ui("Field path arguments must be of type string or ",n,!1,void 0,t)}const OT=new RegExp("[~\\*/\\[\\]]");function yf(n,e,t){if(e.search(OT)>=0)throw Ui(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new oo(...e.split("."))._internalPath}catch{throw Ui(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function Ui(n,e,t,r,s){const i=r&&!r.isEmpty(),a=s!==void 0;let c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let l="";return(i||a)&&(l+=" (found",i&&(l+=` in field ${r}`),a&&(l+=` in document ${s}`),l+=")"),new x(V.INVALID_ARGUMENT,c+n+l)}function Ef(n,e){return n.some((t=>t.isEqual(e)))}function Tf(n){return typeof n._readUserData=="function"}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ne{constructor(e){this.optionDefinitions=e}_getKnownOptions(e,t){const r=Ue.empty();for(const s in this.optionDefinitions)if(this.optionDefinitions.hasOwnProperty(s)){const i=this.optionDefinitions[s];if(s in e){const a=e[s];let c;i.nestedOptions&&Ss(a)?c={mapValue:{fields:new Ne(i.nestedOptions).getOptionsProto(t,a)}}:a&&(c=ln(a,t)??void 0),c&&r.set(Te.fromServerFormat(i.serverName),c)}}return r}getOptionsProto(e,t,r){const s=this._getKnownOptions(t,e);if(r){const i=new Map(uE(r,((a,c)=>[Te.fromServerFormat(c),a!==void 0?ln(a,e):null])));s.setAll(i)}return s.value.mapValue.fields??{}}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function LT(n){return typeof n=="object"&&n!==null&&!!("nullValue"in n&&(n.nullValue===null||n.nullValue==="NULL_VALUE")||"booleanValue"in n&&(n.booleanValue===null||typeof n.booleanValue=="boolean")||"integerValue"in n&&(n.integerValue===null||typeof n.integerValue=="number"||typeof n.integerValue=="string")||"doubleValue"in n&&(n.doubleValue===null||typeof n.doubleValue=="number")||"timestampValue"in n&&(n.timestampValue===null||(function(t){return typeof t=="object"&&t!==null&&"seconds"in t&&(t.seconds===null||typeof t.seconds=="number"||typeof t.seconds=="string")&&"nanos"in t&&(t.nanos===null||typeof t.nanos=="number")})(n.timestampValue))||"stringValue"in n&&(n.stringValue===null||typeof n.stringValue=="string")||"bytesValue"in n&&(n.bytesValue===null||n.bytesValue instanceof Uint8Array)||"referenceValue"in n&&(n.referenceValue===null||typeof n.referenceValue=="string")||"geoPointValue"in n&&(n.geoPointValue===null||(function(t){return typeof t=="object"&&t!==null&&"latitude"in t&&(t.latitude===null||typeof t.latitude=="number")&&"longitude"in t&&(t.longitude===null||typeof t.longitude=="number")})(n.geoPointValue))||"arrayValue"in n&&(n.arrayValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("values"in t)||t.values!==null&&!Array.isArray(t.values))})(n.arrayValue))||"mapValue"in n&&(n.mapValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("fields"in t)||t.fields!==null&&!Ss(t.fields))})(n.mapValue))||"fieldReferenceValue"in n&&(n.fieldReferenceValue===null||typeof n.fieldReferenceValue=="string")||"functionValue"in n&&(n.functionValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("name"in t)||t.name!==null&&typeof t.name!="string"||!("args"in t)||t.args!==null&&!Array.isArray(t.args))})(n.functionValue))||"pipelineValue"in n&&(n.pipelineValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("stages"in t)||t.stages!==null&&!Array.isArray(t.stages))})(n.pipelineValue)))}function UT(n){return new je(n)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function D(n){let e;return n instanceof Wn?n:(e=Ss(n)?$T(n):n instanceof Array?jT(n):wf(n,void 0),e)}function Jo(n){if(n instanceof Wn)return n;if(n instanceof je)return _s(n);if(Array.isArray(n))return _s(UT(n));throw new Error("Unsupported value: "+typeof n)}function sc(n){return oE(n)?gi(n):D(n)}class Wn{constructor(){this._protoValueType="ProtoValue"}add(e){return new C("add",[this,D(e)],"add")}asBoolean(){if(this instanceof hn)return this;if(this instanceof Er)return new vf(this);if(this instanceof yr)return new qT(this);if(this instanceof C)return new If(this);throw new x("invalid-argument",`Conversion of type ${typeof this} to BooleanExpression not supported.`)}subtract(e){return new C("subtract",[this,D(e)],"subtract")}multiply(e){return new C("multiply",[this,D(e)],"multiply")}divide(e){return new C("divide",[this,D(e)],"divide")}mod(e){return new C("mod",[this,D(e)],"mod")}equal(e){return new C("equal",[this,D(e)],"equal").asBoolean()}notEqual(e){return new C("not_equal",[this,D(e)],"notEqual").asBoolean()}lessThan(e){return new C("less_than",[this,D(e)],"lessThan").asBoolean()}lessThanOrEqual(e){return new C("less_than_or_equal",[this,D(e)],"lessThanOrEqual").asBoolean()}greaterThan(e){return new C("greater_than",[this,D(e)],"greaterThan").asBoolean()}greaterThanOrEqual(e){return new C("greater_than_or_equal",[this,D(e)],"greaterThanOrEqual").asBoolean()}arrayConcat(e,...t){const r=[e,...t].map((s=>D(s)));return new C("array_concat",[this,...r],"arrayConcat")}arrayContains(e){return new C("array_contains",[this,D(e)],"arrayContains").asBoolean()}arrayContainsAll(e){const t=Array.isArray(e)?new Gr(e.map(D),"arrayContainsAll"):e;return new C("array_contains_all",[this,t],"arrayContainsAll").asBoolean()}arrayContainsAny(e){const t=Array.isArray(e)?new Gr(e.map(D),"arrayContainsAny"):e;return new C("array_contains_any",[this,t],"arrayContainsAny").asBoolean()}arrayReverse(){return new C("array_reverse",[this])}arrayLength(){return new C("array_length",[this],"arrayLength")}equalAny(e){const t=Array.isArray(e)?new Gr(e.map(D),"equalAny"):e;return new C("equal_any",[this,t],"equalAny").asBoolean()}notEqualAny(e){const t=Array.isArray(e)?new Gr(e.map(D),"notEqualAny"):e;return new C("not_equal_any",[this,t],"notEqualAny").asBoolean()}exists(){return new C("exists",[this],"exists").asBoolean()}charLength(){return new C("char_length",[this],"charLength")}like(e){return new C("like",[this,D(e)],"like").asBoolean()}regexContains(e){return new C("regex_contains",[this,D(e)],"regexContains").asBoolean()}regexFind(e){return new C("regex_find",[this,D(e)],"regexFind")}regexFindAll(e){return new C("regex_find_all",[this,D(e)],"regexFindAll")}regexMatch(e){return new C("regex_match",[this,D(e)],"regexMatch").asBoolean()}stringContains(e){return new C("string_contains",[this,D(e)],"stringContains").asBoolean()}startsWith(e){return new C("starts_with",[this,D(e)],"startsWith").asBoolean()}endsWith(e){return new C("ends_with",[this,D(e)],"endsWith").asBoolean()}toLower(){return new C("to_lower",[this],"toLower")}toUpper(){return new C("to_upper",[this],"toUpper")}trim(e){const t=[this];return e&&t.push(D(e)),new C("trim",t,"trim")}ltrim(e){const t=[this];return e&&t.push(D(e)),new C("ltrim",t,"ltrim")}rtrim(e){const t=[this];return e&&t.push(D(e)),new C("rtrim",t,"rtrim")}type(){return new C("type",[this])}isType(e){return new C("is_type",[this,_s(e)],"isType").asBoolean()}stringConcat(e,...t){const r=[e,...t].map(D);return new C("string_concat",[this,...r],"stringConcat")}stringIndexOf(e){return new C("string_index_of",[this,D(e)],"stringIndexOf")}stringRepeat(e){return new C("string_repeat",[this,D(e)],"stringRepeat")}stringReplaceAll(e,t){return new C("string_replace_all",[this,D(e),D(t)],"stringReplaceAll")}stringReplaceOne(e,t){return new C("string_replace_one",[this,D(e),D(t)],"stringReplaceOne")}concat(e,...t){const r=[e,...t].map(D);return new C("concat",[this,...r],"concat")}reverse(){return new C("reverse",[this],"reverse")}arrayFilter(e,t){return new C("array_filter",[this,D(e),t],"arrayFilter")}arrayTransform(e,t){return new C("array_transform",[this,D(e),t],"arrayTransform")}arrayTransformWithIndex(e,t,r){return new C("array_transform",[this,D(e),D(t),r],"arrayTransformWithIndex")}arraySlice(e,t){const r=[this,D(e)];return t!==void 0&&r.push(D(t)),new C("array_slice",r,"arraySlice")}arrayFirst(){return new C("array_first",[this],"arrayFirst")}arrayFirstN(e){return new C("array_first_n",[this,D(e)],"arrayFirstN")}arrayLast(){return new C("array_last",[this],"arrayLast")}arrayLastN(e){return new C("array_last_n",[this,D(e)],"arrayLastN")}arrayMaximum(){return new C("maximum",[this],"arrayMaximum")}arrayMaximumN(e){return new C("maximum_n",[this,D(e)],"arrayMaximumN")}arrayMinimum(){return new C("minimum",[this],"arrayMinimum")}arrayMinimumN(e){return new C("minimum_n",[this,D(e)],"arrayMinimumN")}arrayIndexOf(e){return new C("array_index_of",[this,D(e),D("first")],"arrayIndexOf")}arrayLastIndexOf(e){return new C("array_index_of",[this,D(e),D("last")],"arrayLastIndexOf")}arrayIndexOfAll(e){return new C("array_index_of_all",[this,D(e)],"arrayIndexOfAll")}byteLength(){return new C("byte_length",[this],"byteLength")}ceil(){return new C("ceil",[this])}floor(){return new C("floor",[this])}abs(){return new C("abs",[this])}exp(){return new C("exp",[this])}mapGet(e){return new C("map_get",[this,_s(e)],"mapGet")}mapSet(e,t,...r){const s=[this,D(e),D(t),...r.map(D)];return new C("map_set",s,"mapSet")}mapKeys(){return new C("map_keys",[this],"mapKeys")}mapValues(){return new C("map_values",[this],"mapValues")}mapEntries(){return new C("map_entries",[this],"mapEntries")}getField(e){return new C("get_field",[this,D(e)],"get_field")}count(){return Ke._create("count",[this],"count")}sum(){return Ke._create("sum",[this],"sum")}average(){return Ke._create("average",[this],"average")}minimum(){return Ke._create("minimum",[this],"minimum")}maximum(){return Ke._create("maximum",[this],"maximum")}first(){return Ke._create("first",[this],"first")}last(){return Ke._create("last",[this],"last")}arrayAgg(){return Ke._create("array_agg",[this],"arrayAgg")}arrayAggDistinct(){return Ke._create("array_agg_distinct",[this],"arrayAggDistinct")}countDistinct(){return Ke._create("count_distinct",[this],"countDistinct")}logicalMaximum(e,...t){const r=[e,...t];return new C("maximum",[this,...r.map(D)],"logicalMaximum")}logicalMinimum(e,...t){const r=[e,...t];return new C("minimum",[this,...r.map(D)],"minimum")}vectorLength(){return new C("vector_length",[this],"vectorLength")}cosineDistance(e){return new C("cosine_distance",[this,Jo(e)],"cosineDistance")}dotProduct(e){return new C("dot_product",[this,Jo(e)],"dotProduct")}euclideanDistance(e){return new C("euclidean_distance",[this,Jo(e)],"euclideanDistance")}unixMicrosToTimestamp(){return new C("unix_micros_to_timestamp",[this],"unixMicrosToTimestamp")}timestampToUnixMicros(){return new C("timestamp_to_unix_micros",[this],"timestampToUnixMicros")}unixMillisToTimestamp(){return new C("unix_millis_to_timestamp",[this],"unixMillisToTimestamp")}timestampToUnixMillis(){return new C("timestamp_to_unix_millis",[this],"timestampToUnixMillis")}unixSecondsToTimestamp(){return new C("unix_seconds_to_timestamp",[this],"unixSecondsToTimestamp")}timestampToUnixSeconds(){return new C("timestamp_to_unix_seconds",[this],"timestampToUnixSeconds")}timestampAdd(e,t){return new C("timestamp_add",[this,D(e),D(t)],"timestampAdd")}timestampSubtract(e,t){return new C("timestamp_subtract",[this,D(e),D(t)],"timestampSubtract")}timestampDiff(e,t){return new C("timestamp_diff",[this,sc(e),D(t)],"timestampDiff")}timestampExtract(e,t){const r=[this,D(e)];return t&&r.push(D(t)),new C("timestamp_extract",r,"timestampExtract")}documentId(){return new C("document_id",[this],"documentId")}parent(){return new C("parent",[this],"parent")}substring(e,t){const r=D(e);return new C("substring",t===void 0?[this,r]:[this,r,D(t)],"substring")}arrayGet(e){return new C("array_get",[this,D(e)],"arrayGet")}isError(){return new C("is_error",[this],"isError").asBoolean()}ifError(e){const t=new C("if_error",[this,D(e)],"ifError");return e instanceof hn?t.asBoolean():t}isAbsent(){return new C("is_absent",[this],"isAbsent").asBoolean()}mapRemove(e){return new C("map_remove",[this,D(e)],"mapRemove")}mapMerge(e,...t){const r=D(e),s=t.map(D);return new C("map_merge",[this,r,...s],"mapMerge")}pow(e){return new C("pow",[this,D(e)])}trunc(e){return e===void 0?new C("trunc",[this]):new C("trunc",[this,D(e)],"trunc")}round(e){return e===void 0?new C("round",[this]):new C("round",[this,D(e)],"round")}collectionId(){return new C("collection_id",[this])}length(){return new C("length",[this])}ln(){return new C("ln",[this])}sqrt(){return new C("sqrt",[this])}stringReverse(){return new C("string_reverse",[this])}ifAbsent(e){return new C("if_absent",[this,D(e)],"ifAbsent")}ifNull(e){return new C("if_null",[this,D(e)],"ifNull")}coalesce(e,...t){return new C("coalesce",[this,D(e),...t.map(D)],"coalesce")}join(e){return new C("join",[this,D(e)],"join")}log10(){return new C("log10",[this])}arraySum(){return new C("sum",[this])}split(e){return new C("split",[this,D(e)])}timestampTruncate(e,t){const r=[this,D(e)];return t&&r.push(D(t)),new C("timestamp_trunc",r)}ascending(){return zT(this)}descending(){return HT(this)}as(e){return new FT(this,e,"as")}}class Ke{constructor(e,t){this.name=e,this.params=t,this.exprType="AggregateFunction",this._protoValueType="ProtoValue"}static _create(e,t,r){const s=new Ke(e,t);return s._methodName=r,s}as(e){return new MT(this,e,"as")}_toProto(e){return{functionValue:{name:this.name,args:this.params.map((t=>t._toProto(e)))}}}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e)))}}class MT{constructor(e,t,r){this.aggregate=e,this.alias=t,this._methodName=r}_readUserData(e){this.aggregate._readUserData(e)}}class FT{constructor(e,t,r){this.expr=e,this.alias=t,this._methodName=r,this.exprType="AliasedExpression",this.selectable=!0}_readUserData(e){this.expr._readUserData(e)}}class Gr extends Wn{constructor(e,t){super(),this.Rr=e,this._methodName=t,this.expressionType="ListOfExpressions"}_toProto(e){return{arrayValue:{values:this.Rr.map((t=>t._toProto(e)))}}}_readUserData(e){this.Rr.forEach((t=>t._readUserData(e)))}}class yr extends Wn{constructor(e,t){super(),this.fieldPath=e,this._methodName=t,this.expressionType="Field",this.selectable=!0}get _fieldPath(){return this.fieldPath}get fieldName(){return this.fieldPath.canonicalString()}get alias(){return this.fieldName}get expr(){return this}geoDistance(e){return new C("geo_distance",[this,D(e)],"geoDistance")}_toProto(e){return{fieldReferenceValue:this.fieldPath.canonicalString()}}_readUserData(e){}}function gi(n){return BT(n,"field")}function BT(n,e){return new yr(typeof n=="string"?lt===n?hT()._internalPath:Fn("field",n):n._internalPath,e)}class Er extends Wn{constructor(e,t){super(),this.value=e,this._methodName=t,this.expressionType="Constant"}static _fromProto(e){const t=new Er(e,void 0);return t._protoValue=e,t}_toProto(e){return M(this._protoValue!==void 0,237),this._protoValue}_getValue(){return this._protoValue}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,LT(this._protoValue)||(this._protoValue=ln(this.value,e))}}function _s(n,e){return wf(n,"constant")}function wf(n,e){const t=new Er(n,e);return typeof n=="boolean"?new vf(t):t}class C extends Wn{constructor(e,t,r,s){super(),this.name=e,this.params=t,this.expressionType="Function",this._optionsProto=void 0,r!==void 0&&(this._methodName=r),s!==void 0&&(this._options=s)}get _optionsUtil(){return new Ne({})}_toProto(e){const t={functionValue:{name:this.name,args:this.params.map((r=>r._toProto(e)))}};return this._optionsProto&&(t.functionValue.options=this._optionsProto),t}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e))),this._options&&(this._optionsProto=this._optionsUtil.getOptionsProto(e,this._options))}}class hn extends Wn{get _methodName(){return this._expr._methodName}countIf(){return Ke._create("count_if",[this],"countIf")}not(){return new C("not",[this],"not").asBoolean()}conditional(e,t){return new C("conditional",[this,e,t],"conditional")}ifError(e){const t=D(e),r=new C("if_error",[this,t],"ifError");return t instanceof hn?r.asBoolean():r}_toProto(e){return this._expr._toProto(e)}_readUserData(e){this._expr._readUserData(e)}}class If extends hn{constructor(e){super(),this._expr=e,this.expressionType="Function"}}class vf extends hn{constructor(e){super(),this._expr=e,this.expressionType="Constant"}_getValue(){return this._expr._getValue()}}class qT extends hn{constructor(e){super(),this._expr=e,this.expressionType="Field"}}function $T(n,e){const t=[];for(const r in n)if(Object.prototype.hasOwnProperty.call(n,r)){const s=n[r];t.push(_s(r)),t.push(D(s))}return new C("map",t,"map")}function jT(n){return(function(t,r){return new C("array",t.map((s=>D(s))),r)})(n,"array")}function zT(n){return new Af(sc(n),"ascending","ascending")}function HT(n){return new Af(sc(n),"descending","descending")}class Af{constructor(e,t,r){this.expr=e,this.direction=t,this._methodName=r,this._protoValueType="ProtoValue"}_toProto(e){return{mapValue:{fields:{direction:af(this.direction),expression:this.expr._toProto(e)}}}}_readUserData(e){this.expr._readUserData(e)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ze{constructor(e){this.optionsProto=void 0,{rawOptions:this.rawOptions,...this.knownOptions}=e}_readUserData(e){this.optionsProto=this._optionsUtil.getOptionsProto(e,this.knownOptions,this.rawOptions)}_toProto(e){return{name:this._name,options:this.optionsProto}}}class Rf extends Ze{get _name(){return"add_fields"}get _optionsUtil(){return new Ne({})}constructor(e,t){super(t),this.fields=e}_toProto(e){return{...super._toProto(e),args:[ms(e,this.fields)]}}_readUserData(e){super._readUserData(e),dn(this.fields,e)}}class Pf extends Ze{get _name(){return"aggregate"}get _optionsUtil(){return new Ne({})}constructor(e,t,r){super(r),this.groups=e,this.accumulators=t}_toProto(e){return{...super._toProto(e),args:[ms(e,this.accumulators),ms(e,this.groups)]}}_readUserData(e){super._readUserData(e),dn(this.groups,e),dn(this.accumulators,e)}}class Sf extends Ze{get _name(){return"distinct"}get _optionsUtil(){return new Ne({})}constructor(e,t){super(t),this.groups=e}_toProto(e){return{...super._toProto(e),args:[ms(e,this.groups)]}}_readUserData(e){super._readUserData(e),dn(this.groups,e)}}class uo extends Ze{get _name(){return"collection"}get _optionsUtil(){return new Ne({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.Vr=e.startsWith("/")?e:"/"+e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:this.Vr}]}}_readUserData(e){super._readUserData(e)}}class lo extends Ze{get _name(){return"collection_group"}get _optionsUtil(){return new Ne({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.collectionId=e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:""},{stringValue:this.collectionId}]}}_readUserData(e){super._readUserData(e)}}class ic extends Ze{get _name(){return"database"}get _optionsUtil(){return new Ne({})}_toProto(e){return{...super._toProto(e)}}_readUserData(e){super._readUserData(e)}}class oc extends Ze{get _name(){return"documents"}get _optionsUtil(){return new Ne({})}constructor(e,t){if(super(t),!e||e.length===0)throw new x(V.INVALID_ARGUMENT,"Empty document paths are not allowed in DocumentsSource");const r=e.map((i=>i.startsWith("/")?i:"/"+i)),s=new Set(r);if(s.size!==r.length)throw new x(V.INVALID_ARGUMENT,"Duplicate document paths are not allowed in DocumentsSource");this.dr=r,this.mr=s}_toProto(e){return{...super._toProto(e),args:this.dr.map((t=>({referenceValue:t})))}}_readUserData(e){super._readUserData(e)}}class ho extends Ze{get _name(){return"where"}get _optionsUtil(){return new Ne({})}constructor(e,t){super(t),this.condition=e}_toProto(e){return{...super._toProto(e),args:[this.condition._toProto(e)]}}_readUserData(e){super._readUserData(e),dn(this.condition,e)}}class Bn extends Ze{get _name(){return"limit"}get _optionsUtil(){return new Ne({})}constructor(e,t){M(!isNaN(e)&&e!==1/0&&e!==-1/0,34860),super(t),this.limit=e}_toProto(e){return{...super._toProto(e),args:[Ka(e,this.limit)]}}}class Xl extends Ze{get _name(){return"offset"}get _optionsUtil(){return new Ne({})}constructor(e,t){super(t),this.offset=e}_toProto(e){return{...super._toProto(e),args:[Ka(e,this.offset)]}}}class WT extends Ze{get _name(){return"select"}get _optionsUtil(){return new Ne({})}constructor(e,t){super(t),this.selections=e}_toProto(e){return{...super._toProto(e),args:[ms(e,this.selections)]}}_readUserData(e){super._readUserData(e),dn(this.selections,e)}}class St extends Ze{get _name(){return"sort"}get _optionsUtil(){return new Ne({})}constructor(e,t){super(t),this.orderings=e}_toProto(e){return{...super._toProto(e),args:this.orderings.map((t=>t._toProto(e)))}}_readUserData(e){super._readUserData(e),dn(this.orderings,e)}}class ac extends Ze{get _name(){return"replace_with"}get _optionsUtil(){return new Ne({})}constructor(e,t){super(t),this.map=e}_toProto(e){return{...super._toProto(e),args:[this.map._toProto(e),af(ac.pr)]}}_readUserData(e){super._readUserData(e),dn(this.map,e)}}ac.pr="full_replace";function dn(n,e){return Tf(n)?n._readUserData(e):Array.isArray(n)?n.forEach((t=>t._readUserData(e))):n instanceof Map?n.forEach((t=>t._readUserData(e))):Object.values(n).forEach((t=>t._readUserData(e))),n}// Copyright 2024 Google LLC* @license
class Oe{constructor(e,t,r){this.serializer=e,this.stages=t,this.listenOptions=r,this.isCorePipeline=!0}getPipelineCollection(){return fo(this)}getPipelineCollectionGroup(){return cc(this)}getPipelineCollectionId(){return GT(this)}getPipelineDocuments(){return Ia(this)}getPipelineFlavor(){return(function(t){let r="exact";return t.stages.forEach(((s,i)=>{s._name!==Sf.name&&s._name!==Pf.name||(r="keyless"),s._name===WT.name&&r==="exact"&&(r="augmented"),s._name===Rf.name&&i<t.stages.length-1&&r==="exact"&&(r="augmented")})),r})(this)}getPipelineSourceType(){return nn(this)}}function nn(n){const e=n.stages[0];return e instanceof uo||e instanceof lo||e instanceof ic||e instanceof oc?e._name:"unknown"}function fo(n){if(nn(n)==="collection")return n.stages[0].Vr}function cc(n){if(nn(n)==="collection_group")return n.stages[0].collectionId}function GT(n){switch(nn(n)){case"collection":return Z.fromString(fo(n)).lastSegment();case"collection_group":return cc(n);default:return}}function Ia(n){if(nn(n)==="documents")return n.stages[0].dr}class ts{constructor(e,t,r,s){this._db=e,this.userDataReader=t,this._userDataWriter=r,this.stages=s}wr(e,t){const r=this.userDataReader.createContext(3,e);return Tf(t)?t._readUserData(r):Array.isArray(t)?t.forEach((s=>s._readUserData(r))):t.forEach((s=>s._readUserData(r))),t}where(e){const t=this.stages.map((r=>r));return this.wr("where",e),t.push(new ho(e,{})),new ts(this._db,this.userDataReader,this._userDataWriter,t)}limit(e){const t=this.stages.map((r=>r));return t.push(new Bn(e,{})),new ts(this._db,this.userDataReader,this._userDataWriter,t)}sort(e,...t){const r=this.stages.map((s=>s));return"orderings"in e?r.push(new St(this.wr("sort",e.orderings),{})):r.push(new St(this.wr("sort",[e,...t]),{})),new ts(this._db,this.userDataReader,this._userDataWriter,r)}br(e){return{pipeline:{stages:this.stages.map((t=>t._toProto(e)))}}}}// Copyright 2024 Google LLC* @license
class T{constructor(e,t){this.type=e,this.value=t}static vr(){return new T("ERROR",void 0)}static Sr(){return new T("UNSET",void 0)}static Dr(){return new T("NULL",lr)}static newValue(e){return Ye(e)?new T("NULL",lr):(function(r){return!!r&&"booleanValue"in r})(e)?new T("BOOLEAN",e):ht(e)?new T("INT",e):Cn(e)?new T("DOUBLE",e):(function(r){return!!r&&"timestampValue"in r&&!!r.timestampValue})(e)?new T("TIMESTAMP",e):(function(r){return!!r&&"stringValue"in r})(e)?new T("STRING",e):(function(r){return!!r&&"bytesValue"in r})(e)?new T("BYTES",e):e.referenceValue?new T("REFERENCE",e):e.geoPointValue?new T("GEO_POINT",e):dr(e)?new T("ARRAY",e):Ci(e)?new T("VECTOR",e):Vn(e)?new T("MAP",e):new T("ERROR",void 0)}Cr(){return this.type==="ERROR"||this.type==="UNSET"}Fr(){return this.type==="NULL"}}function ns(n){if(!n.Cr())return n.value}function bf(n){return n instanceof hn?n._expr:n}function q(n){if((n=bf(n))instanceof yr)return new KT(n);if(n instanceof Er)return new QT(n);if(n instanceof Gr)return new YT(n);if(n instanceof C){if(n.name==="add")return new ZT(n);if(n.name==="subtract")return new ew(n);if(n.name==="multiply")return new tw(n);if(n.name==="divide")return new nw(n);if(n.name==="mod")return new rw(n);if(n.name==="and")return new sw(n);if(n.name==="equal")return new _w(n);if(n.name==="not_equal")return new gw(n);if(n.name==="less_than")return new yw(n);if(n.name==="less_than_or_equal")return new Ew(n);if(n.name==="greater_than")return new Tw(n);if(n.name==="greater_than_or_equal")return new ww(n);if(n.name==="array_concat")return new Iw(n);if(n.name==="array_reverse")return new vw(n);if(n.name==="array_contains")return new Aw(n);if(n.name==="array_contains_all")return new Rw(n);if(n.name==="array_contains_any")return new Pw(n);if(n.name==="array_length")return new Sw(n);if(n.name==="array_element")return new bw(n);if(n.name==="equal_any")return new Cf(n);if(n.name==="not_equal_any")return new ow(n);if(n.name==="is_nan")return new aw(n);if(n.name==="is_not_nan")return new cw(n);if(n.name==="is_null")return new uw(n);if(n.name==="is_not_null")return new lw(n);if(n.name==="is_error")return new hw(n);if(n.name==="exists")return new dw(n);if(n.name==="not")return new po(n);if(n.name==="or")return new iw(n);if(n.name==="xor")return new uc(n);if(n.name==="conditional")return new fw(n);if(n.name==="maximum")return new pw(n);if(n.name==="minimum")return new mw(n);if(n.name==="reverse")return new Cw(n);if(n.name==="replace_first")return new Vw(n);if(n.name==="replace_all")return new Nw(n);if(n.name==="char_length")return new kw(n);if(n.name==="byte_length")return new Dw(n);if(n.name==="like")return new xw(n);if(n.name==="regex_contains")return new Ow(n);if(n.name==="regex_match")return new Lw(n);if(n.name==="string_contains")return new Uw(n);if(n.name==="starts_with")return new Mw(n);if(n.name==="ends_with")return new Fw(n);if(n.name==="to_lower")return new Bw(n);if(n.name==="to_upper")return new qw(n);if(n.name==="trim")return new $w(n);if(n.name==="string_concat")return new jw(n);if(n.name==="map_get")return new zw(n);if(n.name==="cosine_distance")return new Hw(n);if(n.name==="dot_product")return new Ww(n);if(n.name==="euclidean_distance")return new Gw(n);if(n.name==="vector_length")return new Kw(n);if(n.name==="unix_micros_to_timestamp")return new Zw(n);if(n.name==="timestamp_to_unix_micros")return new nI(n);if(n.name==="unix_millis_to_timestamp")return new eI(n);if(n.name==="timestamp_to_unix_millis")return new rI(n);if(n.name==="unix_seconds_to_timestamp")return new tI(n);if(n.name==="timestamp_to_unix_seconds")return new sI(n);if(n.name==="timestamp_add")return new iI(n);if(n.name==="timestamp_subtract")return new oI(n)}throw new Error(`Unknown Expr : ${n}`)}class KT{constructor(e){this.expr=e}evaluate(e,t){if(this.expr.fieldName===lt)return T.newValue({referenceValue:Li(e.serializer,t.key)});if(this.expr.fieldName==="__update_time__")return T.newValue({timestampValue:_i(e.serializer,t.version)});if(this.expr.fieldName==="__create_time__")return T.newValue({timestampValue:_i(e.serializer,t.createTime)});const r=t.data.field(this.expr._fieldPath);return r?Xi(r)?T.newValue((function(i,a){if(i.serverTimestampBehavior==="estimate")return{timestampValue:_i(i.serializer,z.fromTimestamp(ur(a)))};if(i.serverTimestampBehavior==="previous"){const c=Cs(a);if(c)return c}return{nullValue:"NULL_VALUE"}})(e,r)):T.newValue(r):T.Sr()}}class QT{constructor(e){this.expr=e}evaluate(e,t){return T.newValue(this.expr._getValue())}}class YT{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.Rr.map((s=>q(s).evaluate(e,t)));return r.some((s=>s.Cr()))?T.vr():T.newValue({arrayValue:{values:r.map((s=>s.value))}})}}function Pe(n){return Cn(n)?Number(n.doubleValue):Number(n.integerValue)}function Tt(n){return BigInt(n.integerValue)}const JT=BigInt("0x7fffffffffffffff"),XT=-BigInt("0x8000000000000000");class Ds{constructor(e){this.expr=e}evaluate(e,t){M(this.expr.params.length>=2,24778);const r=q(this.expr.params[0]).evaluate(e,t),s=q(this.expr.params[1]).evaluate(e,t);let i=this.Or(r,s);for(const a of this.expr.params.slice(2)){const c=q(a).evaluate(e,t);i=this.Or(i,c)}return i}Or(e,t){if(e.Cr()||t.Cr())return T.vr();if(e.Fr()||t.Fr())return T.Dr();const r=e.value,s=t.value;if(!Cn(r)&&!ht(r)||!Cn(s)&&!ht(s))return T.vr();if(Cn(r)||Cn(s)){const i=this.Mr(r,s);return i?T.newValue(i):T.vr()}if(ht(r)&&ht(s)){const i=this.Nr(r,s);return i===void 0?T.vr():typeof i=="number"?T.newValue({doubleValue:i}):i<XT||i>JT?T.vr():T.newValue({integerValue:`${i}`})}return T.vr()}}function Lt(n,e){return ye(n)!==ye(e)?"TYPE_MISMATCH":We(n)||We(e)?"NOT_EQ":Ye(n)&&Ye(e)?"EQ":Ye(n)||Ye(e)?"NULL":dr(n)&&dr(e)?(function(r,s){var a,c,l;if(((a=r.values)==null?void 0:a.length)!==((c=s.values)==null?void 0:c.length))return"NOT_EQ";let i=!1;for(let h=0;h<(((l=r.values)==null?void 0:l.length)??0);h++){const f=r.values[h],m=s.values[h];switch(Lt(f,m)){case"EQ":break;case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":i=!0;break;default:B(44609,{Lr:f,Br:m})}}return i?"NULL":"EQ"})(n.arrayValue,e.arrayValue):Ci(n)&&Ci(e)||Vn(n)&&Vn(e)?(function(r,s){const i=r.fields||{},a=s.fields||{};if(bi(i)!==bi(a))return"NOT_EQ";let c=!1;for(const l in i)if(i.hasOwnProperty(l)){if(a[l]===void 0)return"NOT_EQ";switch(Lt(i[l],a[l])){case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":c=!0}}return c?"NULL":"EQ"})(n.mapValue,e.mapValue):(function(r,s){return rt(r,s,{Te:!1,Ee:!0,he:!0})})(n,e)?"EQ":"NOT_EQ"}class ZT extends Ds{Nr(e,t){return Tt(e)+Tt(t)}Mr(e,t){return{doubleValue:Pe(e)+Pe(t)}}}class ew extends Ds{constructor(e){super(e),this.expr=e}Nr(e,t){return Tt(e)-Tt(t)}Mr(e,t){return{doubleValue:Pe(e)-Pe(t)}}}class tw extends Ds{constructor(e){super(e),this.expr=e}Nr(e,t){return Tt(e)*Tt(t)}Mr(e,t){return{doubleValue:Pe(e)*Pe(t)}}}class nw extends Ds{constructor(e){super(e),this.expr=e}Nr(e,t){const r=Tt(t);if(r!==BigInt(0))return Tt(e)/r}Mr(e,t){const r=Pe(t);return r===0?{doubleValue:as(r)?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY}:{doubleValue:Pe(e)/r}}}class rw extends Ds{constructor(e){super(e),this.expr=e}Nr(e,t){const r=Tt(t);if(r!==BigInt(0))return Tt(e)%r}Mr(e,t){const r=Pe(t);if(r!==0)return{doubleValue:Pe(e)%r}}}class sw{constructor(e){this.expr=e}evaluate(e,t){var i;let r=!1,s=!1;for(const a of this.expr.params){const c=q(a).evaluate(e,t);switch(c.type){case"BOOLEAN":if(!((i=c.value)!=null&&i.booleanValue))return T.newValue(Ae);break;case"NULL":s=!0;break;default:r=!0}}return r?T.vr():s?T.Dr():T.newValue(ze)}}class po{constructor(e){this.expr=e}evaluate(e,t){var s;M(this.expr.params.length===1,9634);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return T.newValue({booleanValue:!((s=r.value)!=null&&s.booleanValue)});case"NULL":return T.Dr();default:return T.vr()}}}class iw{constructor(e){this.expr=e}evaluate(e,t){var i;let r=!1,s=!1;for(const a of this.expr.params){const c=q(a).evaluate(e,t);switch(c.type){case"BOOLEAN":if((i=c.value)!=null&&i.booleanValue)return T.newValue(ze);break;case"NULL":s=!0;break;default:r=!0}}return r?T.vr():s?T.Dr():T.newValue(Ae)}}class uc{constructor(e){this.expr=e}evaluate(e,t){var i;let r=!1,s=!1;for(const a of this.expr.params){const c=q(a).evaluate(e,t);switch(c.type){case"BOOLEAN":r=uc.xor(r,!!((i=c.value)!=null&&i.booleanValue));break;case"NULL":s=!0;break;default:return T.vr()}}return s?T.Dr():T.newValue({booleanValue:r})}static xor(e,t){return(e||t)&&!(e&&t)}}class Cf{constructor(e){this.expr=e}evaluate(e,t){var a,c;M(this.expr.params.length===2,55094);let r=!1;const s=q(this.expr.params[0]).evaluate(e,t);switch(s.type){case"NULL":r=!0;break;case"ERROR":case"UNSET":return T.vr()}const i=q(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return T.vr()}if(r)return T.Dr();for(const l of((c=(a=i.value)==null?void 0:a.arrayValue)==null?void 0:c.values)??[])switch(Ye(s.value)&&Ye(l)?"EQ":Lt(s.value,l)){case"EQ":return T.newValue(ze);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:B(44608,{value:s.value,candidate:l})}return r?T.Dr():T.newValue(Ae)}}class ow{constructor(e){this.expr=e}evaluate(e,t){return new po(new C("not",[new C("equal_any",this.expr.params)])).evaluate(e,t)}}class aw{constructor(e){this.expr=e}evaluate(e,t){M(this.expr.params.length===1,23322);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return T.newValue(Ae);case"DOUBLE":return T.newValue({booleanValue:isNaN(Pe(r.value))});case"NULL":return T.Dr();default:return T.vr()}}}class cw{constructor(e){this.expr=e}evaluate(e,t){return M(this.expr.params.length===1,50406),new po(new C("not",[new C("is_nan",this.expr.params)])).evaluate(e,t)}}class uw{constructor(e){this.expr=e}evaluate(e,t){switch(M(this.expr.params.length===1,23123),q(this.expr.params[0]).evaluate(e,t).type){case"NULL":return T.newValue(ze);case"UNSET":case"ERROR":return T.vr();default:return T.newValue(Ae)}}}class lw{constructor(e){this.expr=e}evaluate(e,t){return M(this.expr.params.length===1,23167),new po(new C("not",[new C("is_null",this.expr.params)])).evaluate(e,t)}}class hw{constructor(e){this.expr=e}evaluate(e,t){return M(this.expr.params.length===1,5228),q(this.expr.params[0]).evaluate(e,t).type==="ERROR"?T.newValue(ze):T.newValue(Ae)}}class dw{constructor(e){this.expr=e}evaluate(e,t){switch(M(this.expr.params.length===1,6877),q(this.expr.params[0]).evaluate(e,t).type){case"ERROR":return T.vr();case"UNSET":return T.newValue(Ae);default:return T.newValue(ze)}}}class fw{constructor(e){this.expr=e}evaluate(e,t){var s;M(this.expr.params.length===3,11706);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return(s=r.value)!=null&&s.booleanValue?q(this.expr.params[1]).evaluate(e,t):q(this.expr.params[2]).evaluate(e,t);case"NULL":return q(this.expr.params[2]).evaluate(e,t);default:return T.vr()}}}class pw{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((i=>q(i).evaluate(e,t)));let s;for(const i of r)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||He(i.value,s.value)>0?i:s}return s===void 0?T.Dr():s}}class mw{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((i=>q(i).evaluate(e,t)));let s;for(const i of r)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||He(i.value,s.value)<0?i:s}return s===void 0?T.Dr():s}}class Tr{constructor(e){this.expr=e}evaluate(e,t){M(this.expr.params.length===2,31033,`${this.expr.name}() function should have exactly 2 params`);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"ERROR":case"UNSET":return T.vr()}const s=q(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ERROR":case"UNSET":return T.vr()}return this.Ur(r,s)}}class _w extends Tr{constructor(e){super(e),this.expr=e}Ur(e,t){if(e.Fr()&&t.Fr())return T.newValue(ze);if(e.Fr()||t.Fr()||We(e.value)||We(t.value)||ye(e.value)!==ye(t.value))return T.newValue(Ae);switch(Lt(e.value,t.value)){case"EQ":return T.newValue(ze);case"NOT_EQ":return T.newValue(Ae);case"NULL":return T.Dr();default:B(44615,{left:e,right:t})}}}class gw extends Tr{constructor(e){super(e),this.expr=e}Ur(e,t){switch(Lt(e.value,t.value)){case"EQ":return T.newValue(Ae);case"NOT_EQ":case"TYPE_MISMATCH":return T.newValue(ze);case"NULL":return T.Dr();default:B(44614,{left:e,right:t})}}}class yw extends Tr{constructor(e){super(e),this.expr=e}Ur(e,t){return ye(e.value)!==ye(t.value)||We(e.value)||We(t.value)?T.newValue(Ae):T.newValue({booleanValue:He(e.value,t.value)<0})}}class Ew extends Tr{constructor(e){super(e),this.expr=e}Ur(e,t){return ye(e.value)!==ye(t.value)||We(e.value)||We(t.value)?T.newValue(Ae):Lt(e.value,t.value)==="EQ"?T.newValue(ze):T.newValue({booleanValue:He(e.value,t.value)<0})}}class Tw extends Tr{constructor(e){super(e),this.expr=e}Ur(e,t){return ye(e.value)!==ye(t.value)||We(e.value)||We(t.value)?T.newValue(Ae):T.newValue({booleanValue:He(e.value,t.value)>0})}}class ww extends Tr{constructor(e){super(e),this.expr=e}Ur(e,t){return ye(e.value)!==ye(t.value)||We(e.value)||We(t.value)?T.newValue(Ae):Lt(e.value,t.value)==="EQ"?T.newValue(ze):T.newValue({booleanValue:He(e.value,t.value)>0})}}class Iw{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class vw{constructor(e){this.expr=e}evaluate(e,t){var s;M(this.expr.params.length===1,216);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return T.Dr();case"ARRAY":{const i=((s=r.value.arrayValue)==null?void 0:s.values)??[];return T.newValue({arrayValue:{values:[...i].reverse()}})}default:return T.vr()}}}class Aw{constructor(e){this.expr=e}evaluate(e,t){return M(this.expr.params.length===2,52884),new Cf(new C("eq_any",[this.expr.params[1],this.expr.params[0]])).evaluate(e,t)}}class Rw{constructor(e){this.expr=e}evaluate(e,t){var l,h,f,m;M(this.expr.params.length===2,1392);let r=!1;const s=q(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return T.vr()}const i=q(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return T.vr()}if(r)return T.Dr();const a=((h=(l=i.value)==null?void 0:l.arrayValue)==null?void 0:h.values)??[],c=((m=(f=s.value)==null?void 0:f.arrayValue)==null?void 0:m.values)??[];for(const E of a){let S=!1;r=!1;for(const b of c){switch(Ye(E)&&Ye(b)?"EQ":Lt(E,b)){case"EQ":S=!0;break;case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:B(44613,{value:b,search:E})}if(S)break}if(!S)return T.newValue(Ae)}return T.newValue(ze)}}class Pw{constructor(e){this.expr=e}evaluate(e,t){var l,h,f,m;M(this.expr.params.length===2,2680);let r=!1;const s=q(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return T.vr()}const i=q(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return T.vr()}if(r)return T.Dr();const a=((h=(l=i.value)==null?void 0:l.arrayValue)==null?void 0:h.values)??[],c=((m=(f=s.value)==null?void 0:f.arrayValue)==null?void 0:m.values)??[];for(const E of c)for(const S of a)switch(Ye(E)&&Ye(S)?"EQ":Lt(E,S)){case"EQ":return T.newValue(ze);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:B(44608,{value:E,search:S})}return r?T.Dr():T.newValue(Ae)}}class Sw{constructor(e){this.expr=e}evaluate(e,t){var s,i,a;M(this.expr.params.length===1,38605);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return T.Dr();case"ARRAY":return T.newValue({integerValue:`${((a=(i=(s=r.value)==null?void 0:s.arrayValue)==null?void 0:i.values)==null?void 0:a.length)??0}`});default:return T.vr()}}}class bw{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class Cw{constructor(e){this.expr=e}evaluate(e,t){var s,i;M(this.expr.params.length===1,1508);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return T.Dr();case"BYTES":{const a=(s=r.value)==null?void 0:s.bytesValue;if(typeof a=="string"){const c=ge.fromBase64String(a).toUint8Array();return c.reverse(),T.newValue({bytesValue:ge.fromUint8Array(c).toBase64()})}return T.newValue({bytesValue:new Uint8Array(a).reverse()})}case"STRING":{const a=(i=r.value)==null?void 0:i.stringValue,c=new Intl.__PRIVATE_Segmenter(void 0,{granularity:"grapheme"}).segment(a),l=Array.from(c,(h=>h.segment)).reverse();return T.newValue({stringValue:l.join("")})}default:return T.vr()}}}class Vw{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class Nw{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class kw{constructor(e){this.expr=e}evaluate(e,t){M(this.expr.params.length===1,19400);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return T.Dr();case"STRING":{const s=(function(a){let c=0;for(let l=0;l<a.length;l++){const h=a.codePointAt(l);if(h===void 0)return;if(h<=65535)if(h>=55296&&h<=57343)if(h<=56319){const f=a.codePointAt(l+1);f!==void 0&&f>=56320&&f<=57343?(c+=1,l++):c+=1}else c+=1;else c+=1;else{if(!(h<=1114111))return;c+=1,l++}}return c})(r.value.stringValue);return s===void 0?T.vr():T.newValue({integerValue:s})}default:return T.vr()}}}class Dw{constructor(e){this.expr=e}evaluate(e,t){var s,i;M(this.expr.params.length===1,8486);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BYTES":{const a=(s=r.value)==null?void 0:s.bytesValue;return typeof a=="string"?T.newValue({integerValue:ge.fromBase64String(a).toUint8Array().length}):T.newValue({integerValue:new Uint8Array(a).length})}case"STRING":{const a=(function(l){let h=0;for(let f=0;f<l.length;f++){const m=l.codePointAt(f);if(m===void 0)return;if(m>=55296&&m<=57343){if(!(m<=56319))return;{const E=l.codePointAt(f+1);if(E===void 0||!(E>=56320&&E<=57343))return;h+=4,f++}}else if(m<=127)h+=1;else if(m<=2047)h+=2;else if(m<=65535)h+=3;else{if(!(m<=1114111))return;h+=4,f++}}return h})((i=r.value)==null?void 0:i.stringValue);return a===void 0?T.vr():T.newValue({integerValue:a})}case"NULL":return T.Dr();default:return T.vr()}}}class wr{constructor(e){this.expr=e}evaluate(e,t){var a,c;M(this.expr.params.length===2,39773,`${this.expr.name}() function should have exactly two parameters`);let r=!1;const s=q(this.expr.params[0]).evaluate(e,t);switch(s.type){case"STRING":break;case"NULL":r=!0;break;default:return T.vr()}const i=q(this.expr.params[1]).evaluate(e,t);switch(i.type){case"STRING":break;case"NULL":r=!0;break;default:return T.vr()}return r?T.Dr():this.kr((a=s.value)==null?void 0:a.stringValue,(c=i.value)==null?void 0:c.stringValue)}}class xw extends wr{kr(e,t){try{const r=(function(a){let c="";for(let l=0;l<a.length;l++){const h=a.charAt(l);switch(h){case"_":c+=".";break;case"%":c+=".*";break;case"\\":case".":case"*":case"?":case"+":case"^":case"$":case"|":case"(":case")":case"[":case"]":case"{":case"}":c+="\\"+h;break;default:c+=h}}return"^"+c+"$"})(t),s=Va.compile(r);return T.newValue({booleanValue:s.matches(e)})}catch(r){return Et(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${r}`),T.vr()}}}class Ow extends wr{kr(e,t){try{const r=Va.compile(t);return T.newValue({booleanValue:r.matcher(e).find()})}catch{return Et(`Invalid regex pattern found in regex_contains: ${t}, returning error`),T.vr()}}}class Lw extends wr{kr(e,t){try{return T.newValue({booleanValue:Va.compile(t).matches(e)})}catch{return Et(`Invalid regex pattern found in regex_match: ${t}, returning error`),T.vr()}}}class Uw extends wr{kr(e,t){return T.newValue({booleanValue:e.includes(t)})}}class Mw extends wr{kr(e,t){return T.newValue({booleanValue:e.startsWith(t)})}}class Fw extends wr{kr(e,t){return T.newValue({booleanValue:e.endsWith(t)})}}class Bw{constructor(e){this.expr=e}evaluate(e,t){var s,i;M(this.expr.params.length===1,29079);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return T.newValue({stringValue:(i=(s=r.value)==null?void 0:s.stringValue)==null?void 0:i.toLowerCase()});case"NULL":return T.Dr();default:return T.vr()}}}class qw{constructor(e){this.expr=e}evaluate(e,t){var s,i;M(this.expr.params.length===1,60487);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return T.newValue({stringValue:(i=(s=r.value)==null?void 0:s.stringValue)==null?void 0:i.toUpperCase()});case"NULL":return T.Dr();default:return T.vr()}}}class $w{constructor(e){this.expr=e}evaluate(e,t){var s,i;M(this.expr.params.length===1,28544);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return T.newValue({stringValue:(i=(s=r.value)==null?void 0:s.stringValue)==null?void 0:i.trim()});case"NULL":return T.Dr();default:return T.vr()}}}class jw{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((a=>q(a).evaluate(e,t)));let s="",i=!1;for(const a of r)switch(a.type){case"STRING":s+=a.value.stringValue;break;case"NULL":i=!0;break;default:return T.vr()}return i?T.Dr():T.newValue({stringValue:s})}}class zw{constructor(e){this.expr=e}evaluate(e,t){var a,c,l,h;M(this.expr.params.length===2,4483);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"UNSET":return T.Sr();case"MAP":break;default:return T.vr()}const s=q(this.expr.params[1]).evaluate(e,t);if(s.type!=="STRING")return T.vr();const i=(h=(c=(a=r.value)==null?void 0:a.mapValue)==null?void 0:c.fields)==null?void 0:h[(l=s.value)==null?void 0:l.stringValue];return i===void 0?T.Sr():T.newValue(i)}}class lc{constructor(e){this.expr=e}evaluate(e,t){var h,f;M(this.expr.params.length===2,25231,`${this.expr.name}() function should have exactly 2 params`);let r=!1;const s=q(this.expr.params[0]).evaluate(e,t);switch(s.type){case"VECTOR":break;case"NULL":r=!0;break;default:return T.vr()}const i=q(this.expr.params[1]).evaluate(e,t);switch(i.type){case"VECTOR":break;case"NULL":r=!0;break;default:return T.vr()}if(r)return T.Dr();const a=pa(s.value),c=pa(i.value);if(a===void 0||c===void 0||((h=a.values)==null?void 0:h.length)!==((f=c.values)==null?void 0:f.length))return T.vr();const l=this.qr(a,c);return l===void 0||isNaN(l)?T.vr():T.newValue({doubleValue:l})}}class Hw extends lc{qr(e,t){const r=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(r.length===0)return;let i=0,a=0,c=0;for(let h=0;h<r.length;h++){if(!un(r[h])||!un(s[h]))return;const f=Pe(r[h]),m=Pe(s[h]);i+=f*m,a+=f*f,c+=m*m}const l=Math.sqrt(a)*Math.sqrt(c);if(l!==0)return 1-Math.max(-1,Math.min(1,i/l))}}class Ww extends lc{qr(e,t){const r=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(r.length===0)return 0;let i=0;for(let a=0;a<r.length;a++){if(!un(r[a])||!un(s[a]))return;i+=Pe(r[a])*Pe(s[a])}return i}}class Gw extends lc{qr(e,t){const r=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(r.length===0)return 0;let i=0;for(let a=0;a<r.length;a++){if(!un(r[a])||!un(s[a]))return;const c=Pe(r[a]),l=Pe(s[a]);i+=Math.pow(c-l,2)}return Math.sqrt(i)}}class Kw{constructor(e){this.expr=e}evaluate(e,t){var s;M(this.expr.params.length===1,39044);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"VECTOR":{const i=pa(r.value);return T.newValue({integerValue:((s=i==null?void 0:i.values)==null?void 0:s.length)??0})}case"NULL":return T.Dr();default:return T.vr()}}}const gs=BigInt(-62135596800),ys=BigInt(253402300799),Mi=BigInt(1e3),rn=BigInt(1e6),Qw=gs*Mi,Yw=ys*Mi+BigInt(999),Jw=gs*rn,Xw=ys*rn+BigInt(999999);function hc(n){return n>=Jw&&n<=Xw}function Vf(n){return n>=gs&&n<=ys}function Es(n,e){const t=BigInt(n);return!(t<gs||t>ys)&&!(e<0||e>=1e9)&&(t!==gs||e===0)&&!(t===ys&&e>999999999)}function Nf(n,e){return e<0?{seconds:n-1,nanos:e+1e9}:{seconds:n,nanos:e}}function dc(n){return BigInt(n.seconds)*rn+BigInt(Math.trunc(n.nanoseconds/1e3))}class fc{constructor(e){this.expr=e}evaluate(e,t){M(this.expr.params.length===1,49262,`${this.expr.name}() function should have exactly one parameter`);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return this.toTimestamp(BigInt(r.value.integerValue));case"NULL":return T.Dr();default:return T.vr()}}}class Zw extends fc{toTimestamp(e){if(!hc(e))return T.vr();let t=Number(e/rn),r=Number(e%rn*BigInt(1e3));const s=Nf(t,r);return t=s.seconds,r=s.nanos,Es(t,r)?T.newValue({timestampValue:{seconds:t,nanos:r}}):T.vr()}}class eI extends fc{toTimestamp(e){if(!(function(a){return a>=Qw&&a<=Yw})(e))return T.vr();let t=Number(e/Mi),r=Number(e%Mi*BigInt(1e6));const s=Nf(t,r);return t=s.seconds,r=s.nanos,Es(t,r)?T.newValue({timestampValue:{seconds:t,nanos:r}}):T.vr()}}class tI extends fc{toTimestamp(e){if(!Vf(e))return T.vr();const t=Number(e);return T.newValue({timestampValue:{seconds:t,nanos:0}})}}class pc{constructor(e){this.expr=e}evaluate(e,t){M(this.expr.params.length===1,1265,`${this.expr.name}() function should have exactly one parameter`);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"TIMESTAMP":break;case"NULL":return T.Dr();default:return T.vr()}const s=Xa(r.value.timestampValue);return Es(s.seconds,s.nanoseconds)?this.$r(s):T.vr()}}class nI extends pc{$r(e){const t=dc(e);return hc(t)?T.newValue({integerValue:`${t.toString()}`}):T.vr()}}class rI extends pc{$r(e){const t=dc(e),r=t/BigInt(1e3),s=t%BigInt(1e3);return r>BigInt(0)||s===BigInt(0)?T.newValue({integerValue:r.toString()}):T.newValue({integerValue:(r-BigInt(1)).toString()})}}class sI extends pc{$r(e){const t=BigInt(e.seconds);return Vf(t)?T.newValue({integerValue:t.toString()}):T.vr()}}class kf{constructor(e){this.expr=e}evaluate(e,t){M(this.expr.params.length===3,2775,`${this.expr.name}() function should have exactly 3 parameters`);let r=!1;const s=q(this.expr.params[0]).evaluate(e,t);switch(s.type){case"TIMESTAMP":break;case"NULL":r=!0;break;default:return T.vr()}const i=q(this.expr.params[1]).evaluate(e,t);let a;switch(i.type){case"STRING":if(a=(function(W){switch(W){case"microsecond":return"microsecond";case"millisecond":return"millisecond";case"second":return"second";case"minute":return"minute";case"hour":return"hour";case"day":return"day";default:return}})(i.value.stringValue),a===void 0)return T.vr();break;case"NULL":r=!0;break;default:return T.vr()}const c=q(this.expr.params[2]).evaluate(e,t);switch(c.type){case"INT":break;case"NULL":r=!0;break;default:return T.vr()}if(r)return T.Dr();const l=BigInt(c.value.integerValue);let h;try{switch(a){case"microsecond":h=l;break;case"millisecond":h=l*BigInt(1e3);break;case"second":h=l*BigInt(1e6);break;case"minute":h=l*BigInt(6e7);break;case"hour":h=l*BigInt(36e8);break;case"day":h=l*BigInt(864e8);break;default:return T.vr()}if(a!=="microsecond"&&l!==BigInt(0)&&h/l!==BigInt(this.Kr(a)))return T.vr()}catch($){return Et(`Error during timestamp arithmetic: ${$}`),T.vr()}const f=Xa(s.value.timestampValue);if(!Es(f.seconds,f.nanoseconds))return T.vr();const m=dc(f),E=this.Wr(m,h);if(!hc(E))return T.vr();const S=Number(E/rn),b=E%rn,L=Number((b<0?b+rn:b)*BigInt(1e3)),k=b<0?S-1:S;return Es(k,L)?T.newValue({timestampValue:{seconds:k,nanos:L}}):T.vr()}Kr(e){switch(e){case"millisecond":return 1e3;case"second":return 1e6;case"minute":return 6e7;case"hour":return 36e8;case"day":return 864e8;default:return 1}}}class iI extends kf{Wr(e,t){return e+t}}class oI extends kf{Wr(e,t){return e-t}}function Ts(n){if((n=bf(n))instanceof yr)return`fld(${n.fieldName})`;if(n instanceof Er)return`cst(${(function(t){return t===null?"null":typeof t=="number"?t.toString():typeof t=="string"?`"${t}"`:t instanceof de?`ref(${t.path})`:t instanceof je?`vec(${JSON.stringify(t)})`:JSON.stringify(t)})(n.value)})`;if(n instanceof C)return`fn(${n.name},[${n.params.map(Ts).join(",")}])`;if(n.expressionType==="ListOfExpressions")return`list([${n.Rr.map(Ts).join(",")}])`;throw new Error(`Unrecognized expr ${JSON.stringify(n,null,2)}`)}function aI(n){if(n instanceof Rf)return`${n._name}(${ii(n.fields)})`;if(n instanceof Pf){let e=`${n._name}(${ii(n.accumulators)})`;return n.groups.size>0&&(e+=`grouping(${ii(n.groups)})`),e}if(n instanceof Sf)return`${n._name}(${ii(n.groups)})`;if(n instanceof uo)return`${n._name}(${n.Vr})`;if(n instanceof lo)return`${n._name}(${n.collectionId})`;if(n instanceof ic)return`${n._name}()`;if(n instanceof oc)return`${n._name}(${n.dr.sort()})`;if(n instanceof ho)return`${n._name}(${Ts(n.condition)})`;if(n instanceof Bn)return`${n._name}(${n.limit})`;if(n instanceof St)return`${n._name}(${(function(t){return t.map((r=>`${Ts(r.expr)}${r.direction}`)).join(",")})(n.orderings)})`;throw new Error(`Unrecognized stage ${n._name}`)}function ii(n){return`${Array.from(n.entries()).sort().map((([e,t])=>`${e}=${Ts(t)}`)).join(",")}`}function Vt(n){return n.stages.map((e=>aI(e))).join("|")}function Df(n,e){return Vt(n)===Vt(e)}function we(n){return n instanceof Oe}function Zl(n){return we(n)?Vt(n):Zr(n)}function xf(n){return we(n)?Vt(n):(function(t){return`${$d(_t(t))}|lt:${t.limitType}`})(n)}function mo(n,e){return n instanceof Oe&&e instanceof Oe?Df(n,e):!(n instanceof Oe&&!(e instanceof Oe)||!(n instanceof Oe)&&e instanceof Oe)&&LE(n,e)}function Of(n){return Pn(n)?Vt(n):$d(n)}function Lf(n,e){return n instanceof Oe&&e instanceof Oe?Df(n,e):!(n instanceof Oe&&!(e instanceof Oe)||!(n instanceof Oe)&&e instanceof Oe)&&jd(n,e)}function cI(n,e){const t=(function(s){let i=!1;const a=[];for(const c of s)if(c instanceof St)if(i=!0,c.orderings.some((l=>l.expr instanceof yr&&l.expr.fieldName===lt)))a.push(c);else{const l=c.orderings.map((h=>h));l.push(gi(lt).ascending()),a.push(new St(l,{}))}else c instanceof Bn&&(i||(a.push(new St([gi(lt).ascending()],{})),i=!0)),a.push(c);return i||a.push(new St([gi(lt).ascending()],{})),a})(n.stages);if(n.userDataReader){const r=n.userDataReader.createContext(3,"toCorePipeline");t.forEach((s=>s._readUserData(r)))}return new Oe(n.userDataReader.serializer,t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uI{constructor(e,t,r,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&EE(i,e,r[s])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Jr(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Jr(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=Qd();return this.mutations.forEach((s=>{const i=e.get(s.key),a=i.overlayedDocument;let c=this.applyToLocalView(a,i.mutatedFields);c=t.has(s.key)?null:c;const l=xd(a,c);l!==null&&r.set(s.key,l),a.isValidDocument()||a.convertToNoDocument(z.min())})),r}keys(){return this.mutations.reduce(((e,t)=>e.add(t.key)),Q())}isEqual(e){return this.batchId===e.batchId&&cr(this.mutations,e.mutations,((t,r)=>Nl(t,r)))&&cr(this.baseMutations,e.baseMutations,((t,r)=>Nl(t,r)))}}class mc{constructor(e,t,r,s){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=s}static from(e,t,r){M(e.mutations.length===r.length,58842,{Qr:e.mutations.length,Gr:r.length});let s=(function(){return qE})();const i=e.mutations;for(let a=0;a<i.length;a++)s=s.insert(i[a].key,r[a].version);return new mc(e,t,r,s)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lI{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bt{constructor(e,t,r,s,i=z.min(),a=z.min(),c=ge.EMPTY_BYTE_STRING,l=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=c,this.expectedCount=l}withSequenceNumber(e){return new bt(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new bt(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new bt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new bt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hI{constructor(e){this.zr=e}}function dI(n){const e=sT({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?ga(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fI{constructor(){this.Hi=new pI}addToCollectionParentIndex(e,t){return this.Hi.add(t),N.resolve()}getCollectionParents(e,t){return N.resolve(this.Hi.getEntries(t))}addFieldIndex(e,t){return N.resolve()}deleteFieldIndex(e,t){return N.resolve()}deleteAllFieldIndexes(e){return N.resolve()}createTargetIndexes(e,t){return N.resolve()}getDocumentsMatchingTarget(e,t){return N.resolve(null)}getIndexType(e,t){return N.resolve(0)}getFieldIndexes(e,t){return N.resolve([])}getNextCollectionGroupToUpdate(e){return N.resolve(null)}getMinOffset(e,t){return N.resolve(on.min())}getMinOffsetFromCollectionGroup(e,t){return N.resolve(on.min())}updateCollectionGroup(e,t,r){return N.resolve()}updateIndexEntries(e,t){return N.resolve()}}class pI{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t]||new _e(Z.comparator),i=!s.has(r);return this.index[t]=s.add(r),i}has(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t];return s&&s.has(r)}getEntries(e){return(this.index[e]||new _e(Z.comparator)).toArray()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fn{constructor(e){this.Ds=e}next(){return this.Ds+=2,this.Ds}static xs(){return new fn(0)}static Cs(){return new fn(-1)}}// Copyright 2024 Google LLC* @license
function Uf(n,e){var r;let t=e;for(const s of n.stages)t=_I({serializer:n.serializer,serverTimestampBehavior:(r=n.listenOptions)==null?void 0:r.serverTimestampBehavior},s,t);return t}function _o(n,e){return Uf(n,[e]).length>0}function mI(n,e){return we(n)?_o(n,e):so(n,e)}function _I(n,e,t){if(e instanceof uo)return(function(s,i,a){return a.filter((c=>c.isFoundDocument()&&`/${c.key.getCollectionPath().canonicalString()}`===i.Vr))})(0,e,t);if(e instanceof ho)return(function(s,i,a){return a.filter((c=>{const l=ns(q(i.condition).evaluate(s,c));return l!==void 0&&rt(l,ze)}))})(n,e,t);if(e instanceof lo)return(function(s,i,a){return a.filter((c=>c.isFoundDocument()&&c.key.getCollectionPath().lastSegment()===i.collectionId))})(0,e,t);if(e instanceof ic)return(function(s,i,a){return a.filter((c=>c.isFoundDocument()))})(0,0,t);if(e instanceof oc)return(function(s,i,a){return a.filter((c=>c.isFoundDocument()&&i.mr.has(c.key.path.toStringWithLeadingSlash())))})(0,e,t);if(e instanceof Bn)return(function(s,i,a){return a.slice(0,i.limit)})(0,e,t);if(e instanceof St)return(function(s,i,a){const c=i.orderings.map((l=>({ks:q(l.expr),direction:l.direction})));return[...a].sort(((l,h)=>{for(const{ks:f,direction:m}of c){const E=ns(f.evaluate(s,l)),S=ns(f.evaluate(s,h)),b=He(E??lr,S??lr);if(b!==0)return m==="ascending"?b:-b}return 0}))})(n,e,t);throw new Error(`Unknown stage: ${e._name}`)}function va(n){const e=(function(r){for(let s=r.stages.length-1;s>=0;s--){const i=r.stages[s];if(i instanceof St)return i.orderings}throw new Error("Pipeline must contain at least one Sort stage")})(n);return(t,r)=>{for(const s of e){const i=ns(q(s.expr).evaluate({serializer:n.serializer},t)),a=ns(q(s.expr).evaluate({serializer:n.serializer},r)),c=He(i||lr,a||lr);if(c!==0)return s.direction==="ascending"?c:-c}return 0}}function Xo(n){for(let e=n.stages.length-1;e>=0;e--){const t=n.stages[e];if(t instanceof Bn)return{limit:t.limit}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gI{constructor(){this.changes=new Hn((e=>e.toString()),((e,t)=>e.isEqual(t))),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Ce.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?N.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yI{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class EI{constructor(e,t,r,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next((s=>(r=s,this.remoteDocumentCache.getEntry(e,t)))).next((s=>(r!==null&&Jr(r.mutation,s,Qe.empty(),se.now()),s)))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next((r=>this.getLocalViewOfDocuments(e,r,Q()).next((()=>r))))}getLocalViewOfDocuments(e,t,r=Q()){const s=Jt();return this.populateOverlays(e,s,t).next((()=>this.computeViews(e,t,s,r).next((i=>{let a=er();return i.forEach(((c,l)=>{a=a.insert(c,l.overlayedDocument)})),a}))))}getOverlayedDocuments(e,t){const r=Jt();return this.populateOverlays(e,r,t).next((()=>this.computeViews(e,t,r,Q())))}populateOverlays(e,t,r){const s=[];return r.forEach((i=>{t.has(i)||s.push(i)})),this.documentOverlayCache.getOverlays(e,s).next((i=>{i.forEach(((a,c)=>{t.set(a,c)}))}))}computeViews(e,t,r,s){let i=$e();const a=es(),c=(function(){return es()})();return t.forEach(((l,h)=>{const f=r.get(h.key);s.has(h.key)&&(f===void 0||f.mutation instanceof yn)?i=i.insert(h.key,h):f!==void 0?(a.set(h.key,f.mutation.getFieldMask()),Jr(f.mutation,h,f.mutation.getFieldMask(),se.now())):a.set(h.key,Qe.empty())})),this.recalculateAndSaveOverlays(e,i).next((l=>(l.forEach(((h,f)=>a.set(h,f))),t.forEach(((h,f)=>c.set(h,new yI(f,a.get(h)??null)))),c)))}recalculateAndSaveOverlays(e,t){const r=es();let s=new oe(((a,c)=>a-c)),i=Q();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next((a=>{for(const c of a)c.keys().forEach((l=>{const h=t.get(l);if(h===null)return;let f=r.get(l)||Qe.empty();f=c.applyToLocalView(h,f),r.set(l,f);const m=(s.get(c.batchId)||Q()).add(l);s=s.insert(c.batchId,m)}))})).next((()=>{const a=[],c=s.getReverseIterator();for(;c.hasNext();){const l=c.getNext(),h=l.key,f=l.value,m=Qd();f.forEach((E=>{if(!i.has(E)){const S=xd(t.get(E),r.get(E));S!==null&&m.set(E,S),i=i.add(E)}})),a.push(this.documentOverlayCache.saveOverlays(e,h,m))}return N.waitFor(a)})).next((()=>r))}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next((r=>this.recalculateAndSaveOverlays(e,r)))}getDocumentsMatchingQuery(e,t,r,s){return we(t)?this.getDocumentsMatchingPipeline(e,t,r,s):DE(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):Hd(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,s):this.getDocumentsMatchingCollectionQuery(e,t,r,s)}getNextDocuments(e,t,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,s).next((i=>{const a=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,s-i.size):N.resolve(Jt());let c=os,l=i;return a.next((h=>N.forEach(h,((f,m)=>(c<m.largestBatchId&&(c=m.largestBatchId),i.get(f)?N.resolve():this.remoteDocumentCache.getEntry(e,f).next((E=>{l=l.insert(f,E)}))))).next((()=>this.populateOverlays(e,h,i))).next((()=>this.computeViews(e,l,h,Q()))).next((f=>({batchId:c,changes:Kd(f)})))))}))}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new F(t)).next((r=>{let s=er();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s}))}getDocumentsMatchingCollectionGroupQuery(e,t,r,s){const i=t.collectionGroup;let a=er();return this.indexManager.getCollectionParents(e,i).next((c=>N.forEach(c,(l=>{const h=(function(m,E){return new zn(E,null,m.explicitOrderBy.slice(),m.filters.slice(),m.limit,m.limitType,m.startAt,m.endAt)})(t,l.child(i));return this.getDocumentsMatchingCollectionQuery(e,h,r,s).next((f=>{f.forEach(((m,E)=>{a=a.insert(m,E)}))}))})).next((()=>a))))}getDocumentsMatchingCollectionQuery(e,t,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next((a=>(i=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s)))).next((a=>this.retrieveMatchingLocalDocuments(i,a,(c=>so(t,c)))))}getDocumentsMatchingPipeline(e,t,r,s){if(nn(t)==="collection_group"){const i=cc(t);let a=er();return this.indexManager.getCollectionParents(e,i).next((c=>N.forEach(c,(l=>{const h=(function(m,E){const S=m.stages.map((b=>b instanceof lo?new uo(E.canonicalString(),{}):b));return new Oe(m.serializer,S)})(t,l.child(i));return this.getDocumentsMatchingPipeline(e,h,r,s).next((f=>{f.forEach(((m,E)=>{a=a.insert(m,E)}))}))})).next((()=>a))))}{let i;return this.getOverlaysForPipeline(e,t,r.largestBatchId).next((a=>{switch(i=a,nn(t)){case"collection":return this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s);case"documents":let c=Q();for(const l of Ia(t))c=c.add(F.fromPath(l));return this.remoteDocumentCache.getEntries(e,c);case"database":return this.remoteDocumentCache.getAllEntries(e);default:throw new x("invalid-argument",`Invalid pipeline source to execute offline: ${Vt(t)}`)}})).next((a=>this.retrieveMatchingLocalDocuments(i,a,(c=>_o(t,c)))))}}retrieveMatchingLocalDocuments(e,t,r){e.forEach(((i,a)=>{const c=a.getKey();t.get(c)===null&&(t=t.insert(c,Ce.newInvalidDocument(c)))}));let s=er();return t.forEach(((i,a)=>{const c=e.get(i);c!==void 0&&Jr(c.mutation,a,Qe.empty(),se.now()),r(a)&&(s=s.insert(i,a))})),s}getOverlaysForPipeline(e,t,r){switch(nn(t)){case"collection":return this.documentOverlayCache.getOverlaysForCollection(e,Z.fromString(fo(t)),r);case"collection_group":throw new x("invalid-argument",`Unexpected collection group pipeline: ${Vt(t)}`);case"documents":return this.documentOverlayCache.getOverlays(e,Ia(t).map((s=>F.fromPath(s))));case"database":return this.documentOverlayCache.getAllOverlays(e,r);default:throw new x("invalid-argument",`Failed to get overlays for pipeline: ${Vt(t)}`)}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class TI{constructor(e){this.serializer=e,this.Hs=new Map,this.Js=new Map}getBundleMetadata(e,t){return N.resolve(this.Hs.get(t))}saveBundleMetadata(e,t){return this.Hs.set(t.id,(function(s){return{id:s.id,version:s.version,createTime:gt(s.createTime)}})(t)),N.resolve()}getNamedQuery(e,t){return N.resolve(this.Js.get(t))}saveNamedQuery(e,t){return this.Js.set(t.name,(function(s){return{name:s.name,query:dI(s.bundledQuery),readTime:gt(s.readTime)}})(t)),N.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wI{constructor(){this.overlays=new oe(F.comparator),this.Ys=new Map}getOverlay(e,t){return N.resolve(this.overlays.get(t))}getOverlays(e,t){const r=Jt();return N.forEach(t,(s=>this.getOverlay(e,s).next((i=>{i!==null&&r.set(s,i)})))).next((()=>r))}getAllOverlays(e,t){const r=Jt();return this.overlays.forEach(((s,i)=>{i.largestBatchId>t&&r.set(s,i)})),N.resolve(r)}saveOverlays(e,t,r){return r.forEach(((s,i)=>{this.Hr(e,t,i)})),N.resolve()}removeOverlaysForBatchId(e,t,r){const s=this.Ys.get(r);return s!==void 0&&(s.forEach((i=>this.overlays=this.overlays.remove(i))),this.Ys.delete(r)),N.resolve()}getOverlaysForCollection(e,t,r){const s=Jt(),i=t.length+1,a=new F(t.child("")),c=this.overlays.getIteratorFrom(a);for(;c.hasNext();){const l=c.getNext().value,h=l.getKey();if(!t.isPrefixOf(h.path))break;h.path.length===i&&l.largestBatchId>r&&s.set(l.getKey(),l)}return N.resolve(s)}getOverlaysForCollectionGroup(e,t,r,s){let i=new oe(((h,f)=>h-f));const a=this.overlays.getIterator();for(;a.hasNext();){const h=a.getNext().value;if(h.getKey().getCollectionGroup()===t&&h.largestBatchId>r){let f=i.get(h.largestBatchId);f===null&&(f=Jt(),i=i.insert(h.largestBatchId,f)),f.set(h.getKey(),h)}}const c=Jt(),l=i.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach(((h,f)=>c.set(h,f))),!(c.size()>=s)););return N.resolve(c)}Hr(e,t,r){const s=this.overlays.get(r.key);if(s!==null){const a=this.Ys.get(s.largestBatchId).delete(r.key);this.Ys.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new lI(t,r));let i=this.Ys.get(t);i===void 0&&(i=Q(),this.Ys.set(t,i)),this.Ys.set(t,i.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class II{constructor(){this.sessionToken=ge.EMPTY_BYTE_STRING}getSessionToken(e){return N.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,N.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _c{constructor(){this.Zs=new _e(ve.Xs),this.e_=new _e(ve.t_)}isEmpty(){return this.Zs.isEmpty()}addReference(e,t){const r=new ve(e,t);this.Zs=this.Zs.add(r),this.e_=this.e_.add(r)}n_(e,t){e.forEach((r=>this.addReference(r,t)))}removeReference(e,t){this.r_(new ve(e,t))}i_(e,t){e.forEach((r=>this.removeReference(r,t)))}s_(e){const t=new F(new Z([])),r=new ve(t,e),s=new ve(t,e+1),i=[];return this.e_.forEachInRange([r,s],(a=>{this.r_(a),i.push(a.key)})),i}__(){this.Zs.forEach((e=>this.r_(e)))}r_(e){this.Zs=this.Zs.delete(e),this.e_=this.e_.delete(e)}o_(e){const t=new F(new Z([])),r=new ve(t,e),s=new ve(t,e+1);let i=Q();return this.e_.forEachInRange([r,s],(a=>{i=i.add(a.key)})),i}containsKey(e){const t=new ve(e,0),r=this.Zs.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class ve{constructor(e,t){this.key=e,this.a_=t}static Xs(e,t){return F.comparator(e.key,t.key)||Y(e.a_,t.a_)}static t_(e,t){return Y(e.a_,t.a_)||F.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vI{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.gs=1,this.u_=new _e(ve.Xs)}checkEmpty(e){return N.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,s){const i=this.gs;this.gs++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new uI(i,t,r,s);this.mutationQueue.push(a);for(const c of s)this.u_=this.u_.add(new ve(c.key,i)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return N.resolve(a)}lookupMutationBatch(e,t){return N.resolve(this.c_(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=this.l_(r),i=s<0?0:s;return N.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return N.resolve(this.mutationQueue.length===0?Wa:this.gs-1)}getAllMutationBatches(e){return N.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new ve(t,0),s=new ve(t,Number.POSITIVE_INFINITY),i=[];return this.u_.forEachInRange([r,s],(a=>{const c=this.c_(a.a_);i.push(c)})),N.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new _e(Y);return t.forEach((s=>{const i=new ve(s,0),a=new ve(s,Number.POSITIVE_INFINITY);this.u_.forEachInRange([i,a],(c=>{r=r.add(c.a_)}))})),N.resolve(this.E_(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1;let i=r;F.isDocumentKey(i)||(i=i.child(""));const a=new ve(new F(i),0);let c=new _e(Y);return this.u_.forEachWhile((l=>{const h=l.key.path;return!!r.isPrefixOf(h)&&(h.length===s&&(c=c.add(l.a_)),!0)}),a),N.resolve(this.E_(c))}E_(e){const t=[];return e.forEach((r=>{const s=this.c_(r);s!==null&&t.push(s)})),t}removeMutationBatch(e,t){M(this.h_(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.u_;return N.forEach(t.mutations,(s=>{const i=new ve(s.key,t.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)})).next((()=>{this.u_=r}))}bs(e){}containsKey(e,t){const r=new ve(t,0),s=this.u_.firstAfterOrEqual(r);return N.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,N.resolve()}h_(e,t){return this.l_(e)}l_(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}c_(e){const t=this.l_(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AI{constructor(e){this.T_=e,this.docs=(function(){return new oe(F.comparator)})(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,s=this.docs.get(r),i=s?s.size:0,a=this.T_(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:a}),this.size+=a-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return N.resolve(r?r.document.mutableCopy():Ce.newInvalidDocument(t))}getEntries(e,t){let r=$e();return t.forEach((s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():Ce.newInvalidDocument(s))})),N.resolve(r)}getAllEntries(e){let t=$e();return this.docs.forEach(((r,s)=>{t=t.insert(r,s.document)})),N.resolve(t)}getDocumentsMatchingQuery(e,t,r,s){let i,a;we(t)?(i=Z.fromString(fo(t)),a=f=>_o(t,f)):(i=t.path,a=f=>so(t,f));let c=$e();const l=new F(i.child("__id-9223372036854775808__")),h=this.docs.getIteratorFrom(l);for(;h.hasNext();){const{key:f,value:{document:m}}=h.getNext();if(!i.isPrefixOf(f.path))break;f.path.length>i.length+1||tE(eE(m),r)<=0||(s.has(m.key)||a(m))&&(c=c.insert(m.key,m.mutableCopy()))}return N.resolve(c)}getAllFromCollectionGroup(e,t,r,s){B(9500)}P_(e,t){return N.forEach(this.docs,(r=>t(r)))}newChangeBuffer(e){return new RI(this)}getSize(e){return N.resolve(this.size)}}class RI extends gI{constructor(e){super(),this.zs=e}applyChanges(e){const t=[];return this.changes.forEach(((r,s)=>{s.isValidDocument()?t.push(this.zs.addEntry(e,s)):this.zs.removeEntry(r)})),N.waitFor(t)}getFromCache(e,t){return this.zs.getEntry(e,t)}getAllFromCache(e,t){return this.zs.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class PI{constructor(e){this.persistence=e,this.R_=new Hn((t=>Of(t)),Lf),this.lastRemoteSnapshotVersion=z.min(),this.highestTargetId=0,this.I_=0,this.A_=new _c,this.targetCount=0,this.V_=fn.xs()}forEachTarget(e,t){return this.R_.forEach(((r,s)=>t(s))),N.resolve()}getLastRemoteSnapshotVersion(e){return N.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return N.resolve(this.I_)}allocateTargetId(e){return this.highestTargetId=this.V_.next(),N.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.I_&&(this.I_=t),N.resolve()}Ms(e){this.R_.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.V_=new fn(t),this.highestTargetId=t),e.sequenceNumber>this.I_&&(this.I_=e.sequenceNumber)}addTargetData(e,t){return this.Ms(t),this.targetCount+=1,N.resolve()}updateTargetData(e,t){return this.Ms(t),N.resolve()}removeTargetData(e,t){return this.R_.delete(t.target),this.A_.s_(t.targetId),this.targetCount-=1,N.resolve()}removeTargets(e,t,r){let s=0;const i=[];return this.R_.forEach(((a,c)=>{c.sequenceNumber<=t&&r.get(c.targetId)===null&&(this.R_.delete(a),i.push(this.removeMatchingKeysForTargetId(e,c.targetId)),s++)})),N.waitFor(i).next((()=>s))}getTargetCount(e){return N.resolve(this.targetCount)}getTargetData(e,t){const r=this.R_.get(t)||null;return N.resolve(r)}addMatchingKeys(e,t,r){return this.A_.n_(t,r),N.resolve()}removeMatchingKeys(e,t,r){this.A_.i_(t,r);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach((a=>{i.push(s.markPotentiallyOrphaned(e,a))})),N.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.A_.s_(t),N.resolve()}getMatchingKeysForTargetId(e,t){const r=this.A_.o_(t);return N.resolve(r)}containsKey(e,t){return N.resolve(this.A_.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mf{constructor(e,t){this.d_={},this.overlays={},this.f_=new Yi(0),this.m_=!1,this.m_=!0,this.p_=new II,this.referenceDelegate=e(this),this.g_=new PI(this),this.indexManager=new fI,this.remoteDocumentCache=(function(s){return new AI(s)})((r=>this.referenceDelegate.y_(r))),this.serializer=new hI(t),this.w_=new TI(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.m_=!1,Promise.resolve()}get started(){return this.m_}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new wI,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.d_[e.toKey()];return r||(r=new vI(t,this.referenceDelegate),this.d_[e.toKey()]=r),r}getGlobalsCache(){return this.p_}getTargetCache(){return this.g_}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.w_}runTransaction(e,t,r){U("MemoryPersistence","Starting transaction:",e);const s=new SI(this.f_.next());return this.referenceDelegate.b_(),r(s).next((i=>this.referenceDelegate.v_(s).next((()=>i)))).toPromise().then((i=>(s.raiseOnCommittedEvent(),i)))}S_(e,t){return N.or(Object.values(this.d_).map((r=>()=>r.containsKey(e,t))))}}class SI extends rE{constructor(e){super(),this.currentSequenceNumber=e}}class gc{constructor(e){this.persistence=e,this.D_=new _c,this.x_=null}static C_(e){return new gc(e)}get F_(){if(this.x_)return this.x_;throw B(60996)}addReference(e,t,r){return this.D_.addReference(r,t),this.F_.delete(r.toString()),N.resolve()}removeReference(e,t,r){return this.D_.removeReference(r,t),this.F_.add(r.toString()),N.resolve()}markPotentiallyOrphaned(e,t){return this.F_.add(t.toString()),N.resolve()}removeTarget(e,t){this.D_.s_(t.targetId).forEach((s=>this.F_.add(s.toString())));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next((s=>{s.forEach((i=>this.F_.add(i.toString())))})).next((()=>r.removeTargetData(e,t)))}b_(){this.x_=new Set}v_(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return N.forEach(this.F_,(r=>{const s=F.fromPath(r);return this.O_(e,s).next((i=>{i||t.removeEntry(s,z.min())}))})).next((()=>(this.x_=null,t.apply(e))))}updateLimboDocument(e,t){return this.O_(e,t).next((r=>{r?this.F_.delete(t.toString()):this.F_.add(t.toString())}))}y_(e){return 0}O_(e,t){return N.or([()=>N.resolve(this.D_.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.S_(e,t)])}}class Fi{constructor(e,t){this.persistence=e,this.M_=new Hn((r=>aE(r.path)),((r,s)=>r.isEqual(s))),this.garbageCollector=ST(this,t)}static C_(e,t){return new Fi(e,t)}b_(){}v_(e){return N.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}lr(e){const t=this.Ls(e);return this.persistence.getTargetCache().getTargetCount(e).next((r=>t.next((s=>r+s))))}Ls(e){let t=0;return this.Er(e,(r=>{t++})).next((()=>t))}Er(e,t){return N.forEach(this.M_,((r,s)=>this.Us(e,r,s).next((i=>i?N.resolve():t(s)))))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.P_(e,(a=>this.Us(e,a,t).next((c=>{c||(r++,i.removeEntry(a,z.min()))})))).next((()=>i.apply(e))).next((()=>r))}markPotentiallyOrphaned(e,t){return this.M_.set(t,e.currentSequenceNumber),N.resolve()}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.M_.set(r,e.currentSequenceNumber),N.resolve()}removeReference(e,t,r){return this.M_.set(r,e.currentSequenceNumber),N.resolve()}updateLimboDocument(e,t){return this.M_.set(t,e.currentSequenceNumber),N.resolve()}y_(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=fi(e.data.value)),t}Us(e,t,r){return N.or([()=>this.persistence.S_(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.M_.get(t);return N.resolve(s!==void 0&&s>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yc{constructor(e,t,r,s){this.targetId=e,this.fromCache=t,this.wo=r,this.bo=s}static vo(e,t){let r=Q(),s=Q();for(const i of t.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new yc(e,t.fromCache,r,s)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bI(n,e){return F.comparator(n.key,e.key)}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class CI{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class VI{constructor(){this.So=!1,this.Do=!1,this.xo=100,this.Co=(function(){return Im()?8:sE(Ve())>0?6:4})()}initialize(e,t){this.Fo=e,this.indexManager=t,this.So=!0}getDocumentsMatchingQuery(e,t,r,s){const i={result:null};return this.Oo(e,t).next((a=>{i.result=a})).next((()=>{if(!i.result)return this.Mo(e,t,s,r).next((a=>{i.result=a}))})).next((()=>{if(i.result)return;const a=new CI;return this.No(e,t,a).next((c=>{if(i.result=c,this.Do)return this.Lo(e,t,a,c.size)}))})).next((()=>i.result))}Lo(e,t,r,s){return we(t)?N.resolve():r.documentReadCount<this.xo?(Zn()<=J.DEBUG&&U("QueryEngine","SDK will not create cache indexes for query:",Zr(t),"since it only creates cache indexes for collection contains","more than or equal to",this.xo,"documents"),N.resolve()):(Zn()<=J.DEBUG&&U("QueryEngine","Query:",Zr(t),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.Co*s?(Zn()<=J.DEBUG&&U("QueryEngine","The SDK decides to create cache indexes for query:",Zr(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,_t(t))):N.resolve())}Oo(e,t){if(we(t))return N.resolve(null);let r=t;if(Ul(r))return N.resolve(null);let s=_t(r);return this.indexManager.getIndexType(e,s).next((i=>i===0?null:(r.limit!==null&&i===1&&(r=ga(r,null,"F"),s=_t(r)),this.indexManager.getDocumentsMatchingTarget(e,s).next((a=>{const c=Q(...a);return this.Fo.getDocuments(e,c).next((l=>this.indexManager.getMinOffset(e,s).next((h=>{const f=this.Bo(r,l);return this.Uo(r,f,c,h.readTime)?this.Oo(e,ga(r,null,"F")):this.ko(e,f,r,h)}))))})))))}Mo(e,t,r,s){return(we(t)?(function(a){for(const c of a.stages){if(c instanceof Bn||c instanceof Xl)return!1;if(c instanceof ho){if(c.condition instanceof If&&c.condition._expr.name==="exists"&&c.condition._expr.params[0]instanceof yr&&c.condition._expr.params[0].fieldName===lt)continue;return!1}}return!0})(t):Ul(t))||s.isEqual(z.min())?N.resolve(null):this.Fo.getDocuments(e,r).next((i=>{const a=this.Bo(t,i);return this.Uo(t,a,r,s)?N.resolve(null):(Zn()<=J.DEBUG&&U("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),Zl(t)),this.ko(e,a,t,Zy(s,os)).next((c=>c)))}))}Bo(e,t){let r,s;return we(e)?(r=new _e(bI),s=i=>_o(e,i)):(r=new _e(Ya(e)),s=i=>so(e,i)),t.forEach(((i,a)=>{s(a)&&(r=r.add(a))})),r}Uo(e,t,r,s){if(we(e))return(function(c){return c.stages.some((l=>l instanceof Bn||l instanceof Xl))})(e);if(e.limit===null)return!1;if(r.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}No(e,t,r){return Zn()<=J.DEBUG&&U("QueryEngine","Using full collection scan to execute query:",Zl(t)),this.Fo.getDocumentsMatchingQuery(e,t,on.min(),r)}ko(e,t,r,s){return this.Fo.getDocumentsMatchingQuery(e,r,s).next((i=>(t.forEach((a=>{i=i.insert(a.key,a)})),i)))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ec="LocalStore",NI=3e8;class kI{constructor(e,t,r,s){this.persistence=e,this.qo=t,this.serializer=s,this.$o=new oe(Y),this.Ko=new Hn((i=>Of(i)),Lf),this.Wo=new Map,this.Qo=e.getRemoteDocumentCache(),this.g_=e.getTargetCache(),this.w_=e.getBundleCache(),this.Go(r)}Go(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new EI(this.Qo,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Qo.setIndexManager(this.indexManager),this.qo.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(t=>e.collect(t,this.$o)))}}function DI(n,e,t,r){return new kI(n,e,t,r)}async function Ff(n,e){const t=H(n);return await t.persistence.runTransaction("Handle user change","readonly",(r=>{let s;return t.mutationQueue.getAllMutationBatches(r).next((i=>(s=i,t.Go(e),t.mutationQueue.getAllMutationBatches(r)))).next((i=>{const a=[],c=[];let l=Q();for(const h of s){a.push(h.batchId);for(const f of h.mutations)l=l.add(f.key)}for(const h of i){c.push(h.batchId);for(const f of h.mutations)l=l.add(f.key)}return t.localDocuments.getDocuments(r,l).next((h=>({zo:h,removedBatchIds:a,addedBatchIds:c})))}))}))}function xI(n,e){const t=H(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",(r=>{const s=e.batch.keys(),i=t.Qo.newChangeBuffer({trackRemovals:!0});return(function(c,l,h,f){const m=h.batch,E=m.keys();let S=N.resolve();return E.forEach((b=>{S=S.next((()=>f.getEntry(l,b))).next((L=>{const k=h.docVersions.get(b);M(k!==null,48541),L.version.compareTo(k)<0&&(m.applyToRemoteDocument(L,h),L.isValidDocument()&&(L.setReadTime(h.commitVersion),f.addEntry(L)))}))})),S.next((()=>c.mutationQueue.removeMutationBatch(l,m)))})(t,r,e,i).next((()=>i.apply(r))).next((()=>t.mutationQueue.performConsistencyCheck(r))).next((()=>t.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId))).next((()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,(function(c){let l=Q();for(let h=0;h<c.mutationResults.length;++h)c.mutationResults[h].transformResults.length>0&&(l=l.add(c.batch.mutations[h].key));return l})(e)))).next((()=>t.localDocuments.getDocuments(r,s)))}))}function Bf(n){const e=H(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",(t=>e.g_.getLastRemoteSnapshotVersion(t)))}function OI(n,e){const t=H(n),r=e.snapshotVersion;let s=t.$o;return t.persistence.runTransaction("Apply remote event","readwrite-primary",(i=>{const a=t.Qo.newChangeBuffer({trackRemovals:!0});s=t.$o;const c=[];e.targetChanges.forEach(((f,m)=>{const E=s.get(m);if(!E)return;c.push(t.g_.removeMatchingKeys(i,f.removedDocuments,m).next((()=>t.g_.addMatchingKeys(i,f.addedDocuments,m))));let S=E.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(m)!==null?S=S.withResumeToken(ge.EMPTY_BYTE_STRING,z.min()).withLastLimboFreeSnapshotVersion(z.min()):f.resumeToken.approximateByteSize()>0&&(S=S.withResumeToken(f.resumeToken,r)),s=s.insert(m,S),(function(L,k,$){return L.resumeToken.approximateByteSize()===0||k.snapshotVersion.toMicroseconds()-L.snapshotVersion.toMicroseconds()>=NI?!0:$.addedDocuments.size+$.modifiedDocuments.size+$.removedDocuments.size>0})(E,S,f)&&c.push(t.g_.updateTargetData(i,S))}));let l=$e(),h=Q();if(e.documentUpdates.forEach((f=>{e.resolvedLimboDocuments.has(f)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(i,f))})),c.push(LI(i,a,e.documentUpdates).next((f=>{l=f.jo,h=f.Ho}))),!r.isEqual(z.min())){const f=t.g_.getLastRemoteSnapshotVersion(i).next((m=>t.g_.setTargetsMetadata(i,i.currentSequenceNumber,r)));c.push(f)}return N.waitFor(c).next((()=>a.apply(i))).next((()=>t.localDocuments.getLocalViewOfDocuments(i,l,h))).next((()=>l))})).then((i=>(t.$o=s,i)))}function LI(n,e,t){let r=Q(),s=Q();return t.forEach((i=>r=r.add(i))),e.getEntries(n,r).next((i=>{let a=$e();return t.forEach(((c,l)=>{const h=i.get(c);l.isFoundDocument()!==h.isFoundDocument()&&(s=s.add(c)),l.isNoDocument()&&l.version.isEqual(z.min())?(e.removeEntry(c,l.readTime),a=a.insert(c,l)):!h.isValidDocument()||l.version.compareTo(h.version)>0||l.version.compareTo(h.version)===0&&h.hasPendingWrites?(e.addEntry(l),a=a.insert(c,l)):U(Ec,"Ignoring outdated watch update for ",c,". Current version:",h.version," Watch version:",l.version)})),{jo:a,Ho:s}}))}function UI(n,e){const t=H(n);return t.persistence.runTransaction("Get next mutation batch","readonly",(r=>(e===void 0&&(e=Wa),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e))))}function MI(n,e){const t=H(n);return t.persistence.runTransaction("Allocate target","readwrite",(r=>{let s;return t.g_.getTargetData(r,e).next((i=>i?(s=i,N.resolve(s)):t.g_.allocateTargetId(r).next((a=>(s=new bt(e,a,"TargetPurposeListen",r.currentSequenceNumber),t.g_.addTargetData(r,s).next((()=>s)))))))})).then((r=>{const s=t.$o.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.$o=t.$o.insert(r.targetId,r),t.Ko.set(e,r.targetId)),r}))}async function Aa(n,e,t){const r=H(n),s=r.$o.get(e),i=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",i,(a=>r.persistence.referenceDelegate.removeTarget(a,s)))}catch(a){if(!gr(a))throw a;U(Ec,`Failed to update sequence numbers for target ${e}: ${a}`)}r.$o=r.$o.remove(e),r.Ko.delete(s.target)}function eh(n,e,t){const r=H(n);let s=z.min(),i=Q();return r.persistence.runTransaction("Execute query","readwrite",(a=>(function(l,h,f){const m=H(l),E=m.Ko.get(f);return E!==void 0?N.resolve(m.$o.get(E)):m.g_.getTargetData(h,f)})(r,a,we(e)?e:_t(e)).next((c=>{if(c)return s=c.lastLimboFreeSnapshotVersion,r.g_.getMatchingKeysForTargetId(a,c.targetId).next((l=>{i=l}))})).next((()=>r.qo.getDocumentsMatchingQuery(a,e,t?s:z.min(),t?i:Q()))).next((c=>(FI(r,c),{documents:c,Jo:i})))))}function FI(n,e){e.forEach(((t,r)=>{const s=r.key.getCollectionGroup(),i=n.Wo.get(s)||z.min();r.readTime.compareTo(i)>0&&n.Wo.set(s,r.readTime)}))}class th{constructor(){this.activeTargetIds=zE()}na(e){this.activeTargetIds=this.activeTargetIds.add(e)}ra(e){this.activeTargetIds=this.activeTargetIds.delete(e)}ta(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class BI{constructor(){this.Ua=new th,this.ka={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.Ua.na(e),this.ka[e]||"not-current"}updateQueryState(e,t,r){this.ka[e]=t}removeLocalQueryTarget(e){this.Ua.ra(e)}isLocalQueryTarget(e){return this.Ua.activeTargetIds.has(e)}clearQueryState(e){delete this.ka[e]}getAllActiveQueryTargets(){return this.Ua.activeTargetIds}isActiveQueryTarget(e){return this.Ua.activeTargetIds.has(e)}start(){return this.Ua=new th,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}function Zo(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qI{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.qa=0,this.$a=null,this.Ka=!0}Wa(){this.qa===0&&(this.Qa("Unknown"),this.$a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this.$a=null,this.Ga("Backend didn't respond within 10 seconds."),this.Qa("Offline"),Promise.resolve()))))}za(e){this.state==="Online"?this.Qa("Unknown"):(this.qa++,this.qa>=1&&(this.ja(),this.Ga(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.Qa("Offline")))}set(e){this.ja(),this.qa=0,e==="Online"&&(this.Ka=!1),this.Qa(e)}Qa(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}Ga(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.Ka?(Ot(t),this.Ka=!1):U("OnlineStateTracker",t)}ja(){this.$a!==null&&(this.$a.cancel(),this.$a=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wt="RemoteStore";class $I{constructor(e,t,r,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.Ha=[],this.Ja=new Map,this.Ya=new Map,this.Za=new Map,this.Xa=new fn(1e3),this.eu=new fn(1001),this.tu=new Set,this.nu=[],this.ru=i,this.ru.bt((a=>{r.enqueueAndForget((async()=>{Gn(this)&&(U(wt,"Restarting streams for network reachability change."),await(async function(l){const h=H(l);h.tu.add(4),await xs(h),h.iu.set("Unknown"),h.tu.delete(4),await go(h)})(this))}))})),this.iu=new qI(r,s)}}async function go(n){if(Gn(n))for(const e of n.nu)await e(!0)}async function xs(n){for(const e of n.nu)await e(!1)}function Ra(n,e){return n.Ya.get(e)||void 0}function qf(n,e){const t=H(n),r=Ra(t,e.targetId);if(r!==void 0&&t.Ja.has(r))return;const s=(function(c,l){const h=Ra(c,l);h!==void 0&&c.Za.delete(h);const f=(function(E,S){return S%2!=0?E.eu.next():E.Xa.next()})(c,l);return c.Ya.set(l,f),c.Za.set(f,l),f})(t,e.targetId);U(wt,"remoteStoreListen mapping SDK target ID to remote",e.targetId,s);const i=new bt(e.target,s,e.purpose,e.sequenceNumber,e.snapshotVersion,e.lastLimboFreeSnapshotVersion,e.resumeToken);t.Ja.set(s,i),vc(t)?Ic(t):Ir(t).Fn()&&wc(t,i)}function Tc(n,e){const t=H(n),r=Ir(t),s=Ra(t,e);U(wt,"remoteStoreUnlisten removing mapping of SDK target ID to remote",e,s),t.Ja.delete(s),t.Ya.delete(e),t.Za.delete(s),r.Fn()&&$f(t,s),t.Ja.size===0&&(r.Fn()?r.Nn():Gn(t)&&t.iu.set("Unknown"))}function wc(n,e){if(n.su.We(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(z.min())>0){const t=n.Za.get(e.targetId);if(t===void 0)return void U(wt,"SDK target ID not found for remote ID: "+e.targetId);const r=n.remoteSyncer.getRemoteKeysForTarget(t).size;e=e.withExpectedCount(r)}Ir(n).jn(e)}function $f(n,e){n.su.We(e),Ir(n).Hn(e)}function Ic(n){n.su=new GE({getRemoteKeysForTarget:e=>{const t=n.Za.get(e);return t!==void 0?n.remoteSyncer.getRemoteKeysForTarget(t):Q()},dt:e=>n.Ja.get(e)||null,Tt:()=>n.datastore.serializer.databaseId}),Ir(n).start(),n.iu.Wa()}function vc(n){return Gn(n)&&!Ir(n).Cn()&&n.Ja.size>0}function Gn(n){return H(n).tu.size===0}function jf(n){n.su=void 0}async function jI(n){n.iu.set("Online")}async function zI(n){n.Ja.forEach(((e,t)=>{wc(n,e)}))}async function HI(n,e){jf(n),vc(n)?(n.iu.za(e),Ic(n)):n.iu.set("Unknown")}async function WI(n,e,t){if(n.iu.set("Online"),e instanceof Jd&&e.state===2&&e.cause)try{await(async function(s,i){const a=i.cause;for(const c of i.targetIds){if(s.Ja.has(c)){const l=s.Za.get(c);l!==void 0&&(await s.remoteSyncer.rejectListen(l,a),s.Ya.delete(l),s.Za.delete(c)),s.Ja.delete(c)}s.su.removeTarget(c)}})(n,e)}catch(r){U(wt,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await Bi(n,r)}else if(e instanceof mi?n.su.et(e):e instanceof Yd?n.su.ot(e):n.su.rt(e),!t.isEqual(z.min()))try{const r=await Bf(n.localStore);t.compareTo(r)>=0&&await(function(i,a){const c=i.su.Rt(a);c.targetChanges.forEach(((h,f)=>{if(h.resumeToken.approximateByteSize()>0){const m=i.Ja.get(f);m&&i.Ja.set(f,m.withResumeToken(h.resumeToken,a))}})),c.targetMismatches.forEach(((h,f)=>{const m=i.Ja.get(h);if(!m)return;i.Ja.set(h,m.withResumeToken(ge.EMPTY_BYTE_STRING,m.snapshotVersion)),$f(i,h);const E=new bt(m.target,h,f,m.sequenceNumber);wc(i,E)}));const l=(function(f,m){const E=new Map;m.targetChanges.forEach(((b,L)=>{const k=f.Za.get(L);k!==void 0&&E.set(k,b)}));let S=new oe(Y);return m.targetMismatches.forEach(((b,L)=>{const k=f.Za.get(b);k!==void 0&&(S=S.insert(k,L))})),new Ns(m.snapshotVersion,E,S,m.documentUpdates,m.augmentedDocumentUpdates,m.resolvedLimboDocuments)})(i,c);return i.remoteSyncer.applyRemoteEvent(l)})(n,t)}catch(r){U(wt,"Failed to raise snapshot:",r),await Bi(n,r)}}async function Bi(n,e,t){if(!gr(e))throw e;n.tu.add(1),await xs(n),n.iu.set("Offline"),t||(t=()=>Bf(n.localStore)),n.asyncQueue.enqueueRetryable((async()=>{U(wt,"Retrying IndexedDB access"),await t(),n.tu.delete(1),await go(n)}))}function zf(n,e){return e().catch((t=>Bi(n,t,e)))}async function yo(n){const e=H(n),t=pn(e);let r=e.Ha.length>0?e.Ha[e.Ha.length-1].batchId:Wa;for(;GI(e);)try{const s=await UI(e.localStore,r);if(s===null){e.Ha.length===0&&t.Nn();break}r=s.batchId,KI(e,s)}catch(s){await Bi(e,s)}Hf(e)&&Wf(e)}function GI(n){return Gn(n)&&n.Ha.length<10}function KI(n,e){n.Ha.push(e);const t=pn(n);t.Fn()&&t.Jn&&t.Yn(e.mutations)}function Hf(n){return Gn(n)&&!pn(n).Cn()&&n.Ha.length>0}function Wf(n){pn(n).start()}async function QI(n){pn(n).er()}async function YI(n){const e=pn(n);for(const t of n.Ha)e.Yn(t.mutations)}async function JI(n,e,t){const r=n.Ha.shift(),s=mc.from(r,e,t);await zf(n,(()=>n.remoteSyncer.applySuccessfulWrite(s))),await yo(n)}async function XI(n,e){e&&pn(n).Jn&&await(async function(r,s){if((function(a){return FE(a)&&a!==V.ABORTED})(s.code)){const i=r.Ha.shift();pn(r).Mn(),await zf(r,(()=>r.remoteSyncer.rejectFailedWrite(i.batchId,s))),await yo(r)}})(n,e),Hf(n)&&Wf(n)}async function nh(n,e){const t=H(n);t.asyncQueue.verifyOperationInProgress(),U(wt,"RemoteStore received new credentials");const r=Gn(t);t.tu.add(3),await xs(t),r&&t.iu.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.tu.delete(3),await go(t)}async function ZI(n,e){const t=H(n);e?(t.tu.delete(2),await go(t)):e||(t.tu.add(2),await xs(t),t.iu.set("Unknown"))}function Ir(n){return n._u||(n._u=(function(t,r,s){const i=H(t);return i.nr(),new gT(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(n.datastore,n.asyncQueue,{Qt:jI.bind(null,n),zt:zI.bind(null,n),Ht:HI.bind(null,n),zn:WI.bind(null,n)}),n.nu.push((async e=>{e?(n._u.Mn(),vc(n)?Ic(n):n.iu.set("Unknown")):(await n._u.stop(),jf(n))}))),n._u}function pn(n){return n.ou||(n.ou=(function(t,r,s){const i=H(t);return i.nr(),new yT(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(n.datastore,n.asyncQueue,{Qt:()=>Promise.resolve(),zt:QI.bind(null,n),Ht:XI.bind(null,n),Zn:YI.bind(null,n),Xn:JI.bind(null,n)}),n.nu.push((async e=>{e?(n.ou.Mn(),await yo(n)):(await n.ou.stop(),n.Ha.length>0&&(U(wt,`Stopping write stream with ${n.Ha.length} pending writes`),n.Ha=[]))}))),n.ou}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ac{constructor(e,t,r,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new Ct,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((a=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,i){const a=Date.now()+r,c=new Ac(e,t,a,s,i);return c.start(r),c}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new x(V.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Rc(n,e){if(Ot("AsyncQueue",`${e}: ${n}`),gr(n))return new x(V.UNAVAILABLE,`${e}: ${n}`);throw n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nn{static emptySet(e){return new Nn(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||F.comparator(t.key,r.key):(t,r)=>F.comparator(t.key,r.key),this.keyedMap=er(),this.sortedSet=new oe(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal(((t,r)=>(e(t),!1)))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Nn)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach((t=>{e.push(t.toString())})),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new Nn;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rh{constructor(){this.au=new oe(F.comparator)}track(e){const t=e.doc.key,r=this.au.get(t);r?e.type!==0&&r.type===3?this.au=this.au.insert(t,e):e.type===3&&r.type!==1?this.au=this.au.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.au=this.au.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.au=this.au.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.au=this.au.remove(t):e.type===1&&r.type===2?this.au=this.au.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.au=this.au.insert(t,{type:2,doc:e.doc}):B(63341,{ft:e,uu:r}):this.au=this.au.insert(t,e)}cu(){const e=[];return this.au.inorderTraversal(((t,r)=>{e.push(r)})),e}}class fr{constructor(e,t,r,s,i,a,c,l,h){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=a,this.syncStateChanged=c,this.excludesMetadataChanges=l,this.hasCachedResults=h}static fromInitialDocuments(e,t,r,s,i){const a=[];return t.forEach((c=>{a.push({type:0,doc:c})})),new fr(e,t,Nn.emptySet(t),a,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&mo(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==r[s].type||!t[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ev{constructor(){this.lu=void 0,this.Eu=[]}hu(){return this.Eu.some((e=>e.Tu()))}}class tv{constructor(){this.queries=sh(),this.onlineState="Unknown",this.Pu=new Set}terminate(){(function(t,r){const s=H(t),i=s.queries;s.queries=sh(),i.forEach(((a,c)=>{for(const l of c.Eu)l.onError(r)}))})(this,new x(V.ABORTED,"Firestore shutting down"))}}function sh(){return new Hn((n=>xf(n)),mo)}async function Pc(n,e){const t=H(n);let r=3;const s=e.query;let i=t.queries.get(s);i?!i.hu()&&e.Tu()&&(r=2):(i=new ev,r=e.Tu()?0:1);try{switch(r){case 0:i.lu=await t.onListen(s,!0);break;case 1:i.lu=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(a){const c=Rc(a,`Initialization of query '${we(e.query)?Vt(e.query):Zr(e.query)}' failed`);return void e.onError(c)}t.queries.set(s,i),i.Eu.push(e),e.Ru(t.onlineState),i.lu&&e.Iu(i.lu)&&bc(t)}async function Sc(n,e){const t=H(n),r=e.query;let s=3;const i=t.queries.get(r);if(i){const a=i.Eu.indexOf(e);a>=0&&(i.Eu.splice(a,1),i.Eu.length===0?s=e.Tu()?0:1:!i.hu()&&e.Tu()&&(s=2))}switch(s){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function nv(n,e){const t=H(n);let r=!1;for(const s of e){const i=s.query,a=t.queries.get(i);if(a){for(const c of a.Eu)c.Iu(s)&&(r=!0);a.lu=s}}r&&bc(t)}function rv(n,e,t){const r=H(n),s=r.queries.get(e);if(s)for(const i of s.Eu)i.onError(t);r.queries.delete(e)}function bc(n){n.Pu.forEach((e=>{e.next()}))}var Pa;(function(n){n.Default="default",n.Cache="cache"})(Pa||(Pa={}));class Cc{constructor(e,t,r){this.query=e,this.Au=t,this.Vu=!1,this.du=null,this.onlineState="Unknown",this.options=r||{}}Iu(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new fr(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Vu?this.fu(e)&&(this.Au.next(e),t=!0):this.mu(e,this.onlineState)&&(this.pu(e),t=!0),this.du=e,t}onError(e){this.Au.error(e)}Ru(e){this.onlineState=e;let t=!1;return this.du&&!this.Vu&&this.mu(this.du,e)&&(this.pu(this.du),t=!0),t}mu(e,t){if(!e.fromCache||!this.Tu())return!0;const r=t!=="Offline";return(!this.options.waitForSyncWhenOnline||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}fu(e){if(e.docChanges.length>0)return!0;const t=this.du&&this.du.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}pu(e){e=fr.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Vu=!0,this.Au.next(e)}Tu(){return this.options.source!==Pa.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gf{constructor(e){this.key=e}}class Kf{constructor(e){this.key=e}}class sv{constructor(e,t){this.query=e,this.Ou=t,this.Mu=null,this.hasCachedResults=!1,this.current=!1,this.Nu=Q(),this.mutatedKeys=Q(),this.Lu=we(e)?va(e):Ya(e),this.Bu=new Nn(this.Lu)}get Uu(){return this.Ou}ku(e,t){const r=t?t.qu:new rh,s=t?t.Bu:this.Bu;let i=t?t.mutatedKeys:this.mutatedKeys,a=s,c=!1;const[l,h]=this.$u(this.query,s);e.inorderTraversal(((m,E)=>{const S=s.get(m),b=mI(this.query,E)?E:null,L=!!S&&this.mutatedKeys.has(S.key),k=!!b&&(b.hasLocalMutations||this.mutatedKeys.has(b.key)&&b.hasCommittedMutations);let $=!1;S&&b?S.data.isEqual(b.data)?L!==k&&(r.track({type:3,doc:b}),$=!0):this.Ku(S,b)||(r.track({type:2,doc:b}),$=!0,(l&&this.Lu(b,l)>0||h&&this.Lu(b,h)<0)&&(c=!0)):!S&&b?(r.track({type:0,doc:b}),$=!0):S&&!b&&(r.track({type:1,doc:S}),$=!0,(l||h)&&(c=!0)),$&&(b?(a=a.add(b),i=k?i.add(m):i.delete(m)):(a=a.delete(m),i=i.delete(m)))}));const f=this.Wu(this.query);if(f)if(we(this.query)){const m=[];a.forEach((b=>m.push(b)));const E=Uf(this.query,m);let S=new Nn(va(this.query));for(const b of E)S=S.add(b);a.forEach((b=>{S.has(b.key)||(i=i.delete(b.key),r.track({type:1,doc:b}))})),a=S}else{const m=this.Qu(this.query);for(;a.size>f;){const E=m==="F"?a.last():a.first();a=a.delete(E.key),i=i.delete(E.key),r.track({type:1,doc:E})}}return{Bu:a,qu:r,Uo:c,mutatedKeys:i}}Wu(e){var t;return we(e)?(t=Xo(e))==null?void 0:t.limit:e.limit||void 0}Qu(e){if(we(e)){const t=Xo(e);return t&&t.limit<0?"L":"F"}return e.limitType}$u(e,t){var r;if(we(e)){const s=(r=Xo(e))==null?void 0:r.limit;return[t.size===s?t.last():null,null]}return[e.limitType==="F"&&t.size===this.Wu(this.query)?t.last():null,e.limitType==="L"&&t.size===this.Wu(this.query)?t.first():null]}Ku(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,s){const i=this.Bu;this.Bu=e.Bu,this.mutatedKeys=e.mutatedKeys;const a=e.qu.cu();a.sort(((f,m)=>(function(S,b){const L=k=>{switch(k){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return B(20277,{ft:k})}};return L(S)-L(b)})(f.type,m.type)||this.Lu(f.doc,m.doc))),this.Gu(r),s=s??!1;const c=t&&!s?this.zu():[],l=this.Nu.size===0&&this.current&&!s?1:0,h=l!==this.Mu;return this.Mu=l,a.length!==0||h?{snapshot:new fr(this.query,e.Bu,i,a,e.mutatedKeys,l===0,h,!1,!!r&&r.resumeToken.approximateByteSize()>0),ju:c}:{ju:c}}Ru(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Bu:this.Bu,qu:new rh,mutatedKeys:this.mutatedKeys,Uo:!1},!1)):{ju:[]}}Hu(e){return!this.Ou.has(e)&&!!this.Bu.has(e)&&!this.Bu.get(e).hasLocalMutations}Gu(e){e&&(e.addedDocuments.forEach((t=>this.Ou=this.Ou.add(t))),e.modifiedDocuments.forEach((t=>{})),e.removedDocuments.forEach((t=>this.Ou=this.Ou.delete(t))),this.current=e.current)}zu(){if(!this.current)return[];const e=this.Nu;this.Nu=Q(),this.Bu.forEach((r=>{this.Hu(r.key)&&(this.Nu=this.Nu.add(r.key))}));const t=[];return e.forEach((r=>{this.Nu.has(r)||t.push(new Kf(r))})),this.Nu.forEach((r=>{e.has(r)||t.push(new Gf(r))})),t}Ju(e){this.Ou=e.Jo,this.Nu=Q();const t=this.ku(e.documents);return this.applyChanges(t,!0)}Yu(){return fr.fromInitialDocuments(this.query,this.Bu,this.mutatedKeys,this.Mu===0,this.hasCachedResults)}}const Vc="SyncEngine";class iv{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class ov{constructor(e){this.key=e,this.Zu=!1}}class av{constructor(e,t,r,s,i,a){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=a,this.Xu={},this.ec=new Hn((c=>xf(c)),mo),this.tc=new Map,this.nc=new Set,this.rc=new oe(F.comparator),this.sc=new Map,this._c=new _c,this.oc={},this.ac=new Map,this.uc=fn.Cs(),this.onlineState="Unknown",this.cc=void 0}get isPrimaryClient(){return this.cc===!0}}async function cv(n,e,t=!0){const r=ep(n);let s;const i=r.ec.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.Yu()):s=await Qf(r,e,t,!0),s}async function uv(n,e){const t=ep(n);await Qf(t,e,!0,!1)}async function Qf(n,e,t,r){const s=await MI(n.localStore,we(e)?e:_t(e)),i=s.targetId,a=n.sharedClientState.addLocalQueryTarget(i,t);let c;return r&&(c=await lv(n,e,i,a==="current",s.resumeToken)),n.isPrimaryClient&&t&&qf(n.remoteStore,s),c}async function lv(n,e,t,r,s){n.lc=(m,E,S)=>(async function(L,k,$,W){let K=k.view.ku($);K.Uo&&(K=await eh(L.localStore,k.query,!1).then((({documents:I})=>k.view.ku(I,K))));const ee=W&&W.targetChanges.get(k.targetId),ae=W&&W.targetMismatches.get(k.targetId)!=null,ce=k.view.applyChanges(K,L.isPrimaryClient,ee,ae);return oh(L,k.targetId,ce.ju),ce.snapshot})(n,m,E,S);const i=await eh(n.localStore,e,!0),a=new sv(e,i.Jo),c=a.ku(i.documents),l=ks.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",s),h=a.applyChanges(c,n.isPrimaryClient,l);oh(n,t,h.ju);const f=new iv(e,t,a);return n.ec.set(e,f),n.tc.has(t)?n.tc.get(t).push(e):n.tc.set(t,[e]),h.snapshot}async function hv(n,e,t){const r=H(n),s=r.ec.get(e),i=r.tc.get(s.targetId);if(i.length>1)return r.tc.set(s.targetId,i.filter((a=>!mo(a,e)))),void r.ec.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await Aa(r.localStore,s.targetId,!1).then((()=>{r.sharedClientState.clearQueryState(s.targetId),t&&Tc(r.remoteStore,s.targetId),Sa(r,s.targetId)})).catch(_r)):(Sa(r,s.targetId),await Aa(r.localStore,s.targetId,!0))}async function dv(n,e){const t=H(n),r=t.ec.get(e),s=t.tc.get(r.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),Tc(t.remoteStore,r.targetId))}async function fv(n,e,t){const r=Tv(n);try{const s=await(function(a,c){const l=H(a),h=se.now(),f=c.reduce(((S,b)=>S.add(b.key)),Q());let m,E;return l.persistence.runTransaction("Locally write mutations","readwrite",(S=>{let b=$e(),L=Q();return l.Qo.getEntries(S,f).next((k=>{b=k,b.forEach((($,W)=>{W.isValidDocument()||(L=L.add($))}))})).next((()=>l.localDocuments.getOverlayedDocuments(S,b))).next((k=>{m=k;const $=[];for(const W of c){const K=TE(W,m.get(W.key).overlayedDocument);K!=null&&$.push(new yn(W.key,K,Cd(K.value.mapValue),Xe.exists(!0)))}return l.mutationQueue.addMutationBatch(S,h,$,c)})).next((k=>{E=k;const $=k.applyToLocalDocumentSet(m,L);return l.documentOverlayCache.saveOverlays(S,k.batchId,$)}))})).then((()=>({batchId:E.batchId,changes:Kd(m)})))})(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),(function(a,c,l){let h=a.oc[a.currentUser.toKey()];h||(h=new oe(Y)),h=h.insert(c,l),a.oc[a.currentUser.toKey()]=h})(r,s.batchId,t),await Os(r,s.changes),await yo(r.remoteStore)}catch(s){const i=Rc(s,"Failed to persist write");t.reject(i)}}async function Yf(n,e){const t=H(n);try{const r=await OI(t.localStore,e);e.targetChanges.forEach(((s,i)=>{const a=t.sc.get(i);a&&(M(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?a.Zu=!0:s.modifiedDocuments.size>0?M(a.Zu,14607):s.removedDocuments.size>0&&(M(a.Zu,42227),a.Zu=!1))})),await Os(t,r,e)}catch(r){await _r(r)}}function ih(n,e,t){const r=H(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const s=[];r.ec.forEach(((i,a)=>{const c=a.view.Ru(e);c.snapshot&&s.push(c.snapshot)})),(function(a,c){const l=H(a);l.onlineState=c;let h=!1;l.queries.forEach(((f,m)=>{for(const E of m.Eu)E.Ru(c)&&(h=!0)})),h&&bc(l)})(r.eventManager,e),s.length&&r.Xu.zn(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function pv(n,e,t){const r=H(n);r.sharedClientState.updateQueryState(e,"rejected",t);const s=r.sc.get(e),i=s&&s.key;if(i){let a=new oe(F.comparator);a=a.insert(i,Ce.newNoDocument(i,z.min()));const c=Q().add(i),l=new Ns(z.min(),new Map,new oe(Y),a,$e(),c);await Yf(r,l),r.rc=r.rc.remove(i),r.sc.delete(e),Nc(r)}else await Aa(r.localStore,e,!1).then((()=>Sa(r,e,t))).catch(_r)}async function mv(n,e){const t=H(n),r=e.batch.batchId;try{const s=await xI(t.localStore,e);Xf(t,r,null),Jf(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await Os(t,s)}catch(s){await _r(s)}}async function _v(n,e,t){const r=H(n);try{const s=await(function(a,c){const l=H(a);return l.persistence.runTransaction("Reject batch","readwrite-primary",(h=>{let f;return l.mutationQueue.lookupMutationBatch(h,c).next((m=>(M(m!==null,37113),f=m.keys(),l.mutationQueue.removeMutationBatch(h,m)))).next((()=>l.mutationQueue.performConsistencyCheck(h))).next((()=>l.documentOverlayCache.removeOverlaysForBatchId(h,f,c))).next((()=>l.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(h,f))).next((()=>l.localDocuments.getDocuments(h,f)))}))})(r.localStore,e);Xf(r,e,t),Jf(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await Os(r,s)}catch(s){await _r(s)}}function Jf(n,e){(n.ac.get(e)||[]).forEach((t=>{t.resolve()})),n.ac.delete(e)}function Xf(n,e,t){const r=H(n);let s=r.oc[r.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),r.oc[r.currentUser.toKey()]=s}}function Sa(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.tc.get(e))n.ec.delete(r),t&&n.Xu.Ec(r,t);n.tc.delete(e),n.isPrimaryClient&&n._c.s_(e).forEach((r=>{n._c.containsKey(r)||Zf(n,r)}))}function Zf(n,e){n.nc.delete(e.path.canonicalString());const t=n.rc.get(e);t!==null&&(Tc(n.remoteStore,t),n.rc=n.rc.remove(e),n.sc.delete(t),Nc(n))}function oh(n,e,t){for(const r of t)r instanceof Gf?(n._c.addReference(r.key,e),gv(n,r)):r instanceof Kf?(U(Vc,"Document no longer in limbo: "+r.key),n._c.removeReference(r.key,e),n._c.containsKey(r.key)||Zf(n,r.key)):B(19791,{hc:r})}function gv(n,e){const t=e.key,r=t.path.canonicalString();n.rc.get(t)||n.nc.has(r)||(U(Vc,"New document in limbo: "+t),n.nc.add(r),Nc(n))}function Nc(n){for(;n.nc.size>0&&n.rc.size<n.maxConcurrentLimboResolutions;){const e=n.nc.values().next().value;n.nc.delete(e);const t=new F(Z.fromString(e)),r=n.uc.next();n.sc.set(r,new ov(t)),n.rc=n.rc.insert(t,r),qf(n.remoteStore,new bt(_t(ro(t.path)),r,"TargetPurposeLimboResolution",Yi.ce))}}async function Os(n,e,t){const r=H(n),s=[],i=[],a=[];r.ec.isEmpty()||(r.ec.forEach(((c,l)=>{a.push(r.lc(l,e,t).then((h=>{var f;if((h||t)&&r.isPrimaryClient){const m=h?!h.fromCache:(f=t==null?void 0:t.targetChanges.get(l.targetId))==null?void 0:f.current;r.sharedClientState.updateQueryState(l.targetId,m?"current":"not-current")}if(h){s.push(h);const m=yc.vo(l.targetId,h);i.push(m)}})))})),await Promise.all(a),r.Xu.zn(s),await(async function(l,h){const f=H(l);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",(m=>N.forEach(h,(E=>N.forEach(E.wo,(S=>f.persistence.referenceDelegate.addReference(m,E.targetId,S))).next((()=>N.forEach(E.bo,(S=>f.persistence.referenceDelegate.removeReference(m,E.targetId,S)))))))))}catch(m){if(!gr(m))throw m;U(Ec,"Failed to update sequence numbers: "+m)}for(const m of h){const E=m.targetId;if(!m.fromCache){const S=f.$o.get(E),b=S.snapshotVersion,L=S.withLastLimboFreeSnapshotVersion(b);f.$o=f.$o.insert(E,L)}}})(r.localStore,i))}async function yv(n,e){const t=H(n);if(!t.currentUser.isEqual(e)){U(Vc,"User change. New user:",e.toKey());const r=await Ff(t.localStore,e);t.currentUser=e,(function(i,a){i.ac.forEach((c=>{c.forEach((l=>{l.reject(new x(V.CANCELLED,a))}))})),i.ac.clear()})(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await Os(t,r.zo)}}function Ev(n,e){const t=H(n),r=t.sc.get(e);if(r&&r.Zu)return Q().add(r.key);{let s=Q();const i=t.tc.get(e);if(!i)return s;for(const a of i??[]){const c=t.ec.get(a);s=s.unionWith(c.view.Uu)}return s}}function ep(n){const e=H(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=Yf.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=Ev.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=pv.bind(null,e),e.Xu.zn=nv.bind(null,e.eventManager),e.Xu.Ec=rv.bind(null,e.eventManager),e}function Tv(n){const e=H(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=mv.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=_v.bind(null,e),e}class qi{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=io(e.databaseInfo.databaseId),this.sharedClientState=this.Rc(e),this.persistence=this.Ic(e),await this.persistence.start(),this.localStore=this.Ac(e),this.gcScheduler=this.Vc(e,this.localStore),this.indexBackfillerScheduler=this.dc(e,this.localStore)}Vc(e,t){return null}dc(e,t){return null}Ac(e){return DI(this.persistence,new VI,e.initialUser,this.serializer)}Ic(e){return new Mf(gc.C_,this.serializer)}Rc(e){return new BI}async terminate(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}qi.provider={build:()=>new qi};class wv extends qi{constructor(e){super(),this.cacheSizeBytes=e}Vc(e,t){M(this.persistence.referenceDelegate instanceof Fi,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new RT(r,e.asyncQueue,t)}Ic(e){const t=this.cacheSizeBytes!==void 0?Be.withCacheSize(this.cacheSizeBytes):Be.DEFAULT;return new Mf((r=>Fi.C_(r,t)),this.serializer)}}class ba{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>ih(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=yv.bind(null,this.syncEngine),await ZI(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return(function(){return new tv})()}createDatastore(e){const t=io(e.databaseInfo.databaseId),r=_T(e.databaseInfo);return wT(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return(function(r,s,i,a,c){return new $I(r,s,i,a,c)})(this.localStore,this.datastore,e.asyncQueue,(t=>ih(this.syncEngine,t,0)),(function(){return zl.C()?new zl:new dT})())}createSyncEngine(e,t){return(function(s,i,a,c,l,h,f){const m=new av(s,i,a,c,l,h);return f&&(m.cc=!0),m})(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await(async function(s){const i=H(s);U(wt,"RemoteStore shutting down."),i.tu.add(5),await xs(i),i.ru.shutdown(),i.iu.set("Unknown")})(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()}}ba.provider={build:()=>new ba};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kc{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.mc(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.mc(this.observer.error,e):Ot("Uncaught Error in snapshot listener:",e.toString()))}gc(){this.muted=!0}mc(e,t){setTimeout((()=>{this.muted||e(t)}),0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mn="FirestoreClient";class Iv{constructor(e,t,r,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this._databaseInfo=s,this.user=Fe.UNAUTHENTICATED,this.clientId=za.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,(async a=>{U(mn,"Received user=",a.uid),await this.authCredentialListener(a),this.user=a})),this.appCheckCredentials.start(r,(a=>(U(mn,"Received new app check token=",a),this.appCheckCredentialListener(a,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Ct;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=Rc(t,"Failed to shutdown persistence");e.reject(r)}})),e.promise}}async function ea(n,e){n.asyncQueue.verifyOperationInProgress(),U(mn,"Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener((async s=>{r.isEqual(s)||(await Ff(e.localStore,s),r=s)})),e.persistence.setDatabaseDeletedListener((()=>n.terminate())),n._offlineComponents=e}async function ah(n,e){n.asyncQueue.verifyOperationInProgress();const t=await vv(n);U(mn,"Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener((r=>nh(e.remoteStore,r))),n.setAppCheckTokenChangeListener(((r,s)=>nh(e.remoteStore,s))),n._onlineComponents=e}async function vv(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){U(mn,"Using user provided OfflineComponentProvider");try{await ea(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!(function(s){return s.name==="FirebaseError"?s.code===V.FAILED_PRECONDITION||s.code===V.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11})(t))throw t;Et("Error using user provided cache. Falling back to memory cache: "+t),await ea(n,new qi)}}else U(mn,"Using default OfflineComponentProvider"),await ea(n,new wv(void 0));return n._offlineComponents}async function tp(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(U(mn,"Using user provided OnlineComponentProvider"),await ah(n,n._uninitializedComponentsProvider._online)):(U(mn,"Using default OnlineComponentProvider"),await ah(n,new ba))),n._onlineComponents}function Av(n){return tp(n).then((e=>e.syncEngine))}async function $i(n){const e=await tp(n),t=e.eventManager;return t.onListen=cv.bind(null,e.syncEngine),t.onUnlisten=hv.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=uv.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=dv.bind(null,e.syncEngine),t}function Rv(n,e,t,r){const s=new kc(r),i=new Cc(e,s,t);return n.asyncQueue.enqueueAndForget((async()=>Pc(await $i(n),i))),()=>{s.gc(),n.asyncQueue.enqueueAndForget((async()=>Sc(await $i(n),i)))}}function Pv(n,e,t={}){const r=new Ct;return n.asyncQueue.enqueueAndForget((async()=>(function(i,a,c,l,h){const f=new kc({next:E=>{f.gc(),a.enqueueAndForget((()=>Sc(i,m)));const S=E.docs.has(c);!S&&E.fromCache?h.reject(new x(V.UNAVAILABLE,"Failed to get document because the client is offline.")):S&&E.fromCache&&l&&l.source==="server"?h.reject(new x(V.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):h.resolve(E)},error:E=>h.reject(E)}),m=new Cc(ro(c.path),f,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return Pc(i,m)})(await $i(n),n.asyncQueue,e,t,r))),r.promise}function Sv(n,e,t={}){const r=new Ct;return n.asyncQueue.enqueueAndForget((async()=>(function(i,a,c,l,h){const f=new kc({next:E=>{f.gc(),a.enqueueAndForget((()=>Sc(i,m))),E.fromCache&&l.source==="server"?h.reject(new x(V.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):h.resolve(E)},error:E=>h.reject(E)}),m=new Cc(c instanceof ts?cI(c):c,f,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return Pc(i,m)})(await $i(n),n.asyncQueue,e,t,r))),r.promise}function bv(n,e){const t=new Ct;return n.asyncQueue.enqueueAndForget((async()=>fv(await Av(n),e,t))),t.promise}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ch="AsyncQueue";class uh{constructor(e=Promise.resolve()){this.qc=[],this.$c=!1,this.Kc=[],this.Wc=null,this.Qc=!1,this.Gc=!1,this.zc=[],this.xn=new uf(this,"async_queue_retry"),this.jc=()=>{const r=Zo();r&&U(ch,"Visibility state changed to "+r.visibilityState),this.xn.gn()},this.Hc=e;const t=Zo();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.jc)}get isShuttingDown(){return this.$c}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Jc(),this.Yc(e)}enterRestrictedMode(e){if(!this.$c){this.$c=!0,this.Gc=e||!1;const t=Zo();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.jc)}}enqueue(e){if(this.Jc(),this.$c)return new Promise((()=>{}));const t=new Ct;return this.Yc((()=>this.$c&&this.Gc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.qc.push(e),this.Zc())))}async Zc(){if(this.qc.length!==0){try{await this.qc[0](),this.qc.shift(),this.xn.reset()}catch(e){if(!gr(e))throw e;U(ch,"Operation failed with retryable error: "+e)}this.qc.length>0&&this.xn.mn((()=>this.Zc()))}}Yc(e){const t=this.Hc.then((()=>(this.Qc=!0,e().catch((r=>{throw this.Wc=r,this.Qc=!1,Ot("INTERNAL UNHANDLED ERROR: ",lh(r)),r})).then((r=>(this.Qc=!1,r))))));return this.Hc=t,t}enqueueAfterDelay(e,t,r){this.Jc(),this.zc.indexOf(e)>-1&&(t=0);const s=Ac.createAndSchedule(this,e,t,r,(i=>this.Xc(i)));return this.Kc.push(s),s}Jc(){this.Wc&&B(47125,{el:lh(this.Wc)})}verifyOperationInProgress(){}async tl(){let e;do e=this.Hc,await e;while(e!==this.Hc)}nl(e){for(const t of this.Kc)if(t.timerId===e)return!0;return!1}rl(e){return this.tl().then((()=>{this.Kc.sort(((t,r)=>t.targetTimeMs-r.targetTimeMs));for(const t of this.Kc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.tl()}))}il(e){this.zc.push(e)}Xc(e){const t=this.Kc.indexOf(e);this.Kc.splice(t,1)}}function lh(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}class _n extends ao{constructor(e,t,r,s){super(e,t,r,s),this.type="firestore",this._queue=new uh,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new uh(e),this._firestoreClient=void 0,await e}}}function uR(n,e,t){const r=Hi(n,"firestore");if(r.isInitialized(t)){const s=r.getImmediate({identifier:t}),i=r.getOptions(t);if(On(i,e))return s;throw new x(V.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(e.cacheSizeBytes!==void 0&&e.localCache!==void 0)throw new x(V.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(e.cacheSizeBytes!==void 0&&e.cacheSizeBytes!==-1&&e.cacheSizeBytes<df)throw new x(V.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return e.host&&$n(e.host)&&Na(e.host),r.initialize({options:e,instanceIdentifier:t})}function Ls(n){if(n._terminated)throw new x(V.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||Cv(n),n._firestoreClient}function Cv(n){var r,s,i,a;const e=n._freezeSettings(),t=vT(n._databaseId,((r=n._app)==null?void 0:r.options.appId)||"",n._persistenceKey,(s=n._app)==null?void 0:s.options.apiKey,e);n._componentsProvider||(i=e.localCache)!=null&&i._offlineComponentProvider&&((a=e.localCache)!=null&&a._onlineComponentProvider)&&(n._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),n._firestoreClient=new Iv(n._authCredentials,n._appCheckCredentials,n._queue,t,n._componentsProvider&&(function(l){const h=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(h),_online:h}})(n._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vv{convertValue(e,t="none"){switch(ye(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ue(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(cn(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw B(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return gn(e,((s,i)=>{r[s]=this.convertValue(i,t)})),r}convertVectorValue(e){var r,s,i;const t=(i=(s=(r=e.fields)==null?void 0:r[us].arrayValue)==null?void 0:s.values)==null?void 0:i.map((a=>ue(a.doubleValue)));return new je(t)}convertGeoPoint(e){return new yt(ue(e.latitude),ue(e.longitude))}convertArray(e,t){return(e.values||[]).map((r=>this.convertValue(r,t)))}convertServerTimestamp(e,t){switch(t){case"previous":const r=Cs(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(ur(e));default:return null}}convertTimestamp(e){const t=an(e);return new se(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=Z.fromString(e);M(sf(r),9688,{name:e});const s=new cs(r.get(1),r.get(3)),i=new F(r.popFirst(5));return s.isEqual(t)||Ot(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dc extends Vv{constructor(e){super(),this.firestore=e}convertBytes(e){return new et(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new de(this.firestore,null,t)}}const hh="@firebase/firestore",dh="4.16.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fh(n){return(function(t,r){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of r)if(i in s&&typeof s[i]=="function")return!0;return!1})(n,["next","error","complete"])}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class np{constructor(e,t,r,s,i){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new de(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new Nv(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e;return((e=this._document)==null?void 0:e.data.clone().value.mapValue.fields)??void 0}get(e){if(this._document){const t=this._document.data.field(Fn("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class Nv extends np{data(){return super.data()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rp(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new x(V.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class xc{}class sp extends xc{}function lR(n,e,...t){let r=[];e instanceof xc&&r.push(e),r=r.concat(t),(function(i){const a=i.filter((l=>l instanceof Lc)).length,c=i.filter((l=>l instanceof Oc)).length;if(a>1||a>0&&c>0)throw new x(V.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")})(r);for(const s of r)n=s._apply(n);return n}class Oc extends sp{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new Oc(e,t,r)}_apply(e){const t=this._parse(e);return ip(e._query,t),new Mt(e.firestore,e.converter,_a(e._query,t))}_parse(e){const t=nc(e.firestore);return(function(i,a,c,l,h,f,m){let E;if(h.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new x(V.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){mh(m,f);const b=[];for(const L of m)b.push(ph(l,i,L));E={arrayValue:{values:b}}}else E=ph(l,i,m)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||mh(m,f),E=xT(c,a,m,f==="in"||f==="not-in");return pe.create(h,f,E)})(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}class Lc extends xc{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new Lc(e,t)}_parse(e){const t=this._queryConstraints.map((r=>r._parse(e))).filter((r=>r.getFilters().length>0));return t.length===1?t[0]:ot.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:((function(s,i){let a=s;const c=i.getFlattenedFilters();for(const l of c)ip(a,l),a=_a(a,l)})(e._query,t),new Mt(e.firestore,e.converter,_a(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class Uc extends sp{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new Uc(e,t)}_apply(e){const t=(function(s,i,a){if(s.startAt!==null)throw new x(V.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new x(V.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new ps(i,a)})(e._query,this._field,this._direction);return new Mt(e.firestore,e.converter,OE(e._query,t))}}function hR(n,e="asc"){const t=e,r=Fn("orderBy",n);return Uc._create(r,t)}function ph(n,e,t){if(typeof(t=ne(t))=="string"){if(t==="")throw new x(V.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Hd(e)&&t.indexOf("/")!==-1)throw new x(V.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const r=e.path.child(Z.fromString(t));if(!F.isDocumentKey(r))throw new x(V.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return Cl(n,new F(r))}if(t instanceof de)return Cl(n,t._key);throw new x(V.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Qi(t)}.`)}function mh(n,e){if(!Array.isArray(n)||n.length===0)throw new x(V.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function ip(n,e){const t=(function(s,i){for(const a of s)for(const c of a.getFlattenedFilters())if(i.indexOf(c.op)>=0)return c.op;return null})(n.filters,(function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}})(e.op));if(t!==null)throw t===e.op?new x(V.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new x(V.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}function op(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}class Kr{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class kn extends np{constructor(e,t,r,s,i,a){super(e,t,r,s,a),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new yi(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(Fn("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new x(V.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=kn._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}kn._jsonSchemaVersion="firestore/documentSnapshot/1.0",kn._jsonSchema={type:me("string",kn._jsonSchemaVersion),bundleSource:me("string","DocumentSnapshot"),bundleName:me("string"),bundle:me("string")};class yi extends kn{data(e={}){return super.data(e)}}class Dn{constructor(e,t,r,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new Kr(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((r=>{e.call(t,new yi(this._firestore,this._userDataWriter,r.key,r,new Kr(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new x(V.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(s,i){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map((c=>{we(s._snapshot.query)?va(s._snapshot.query):Ya(s.query._query);const l=new yi(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Kr(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);return c.doc,{type:"added",doc:l,oldIndex:-1,newIndex:a++}}))}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter((c=>i||c.type!==3)).map((c=>{const l=new yi(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Kr(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);let h=-1,f=-1;return c.type!==0&&(h=a.indexOf(c.doc.key),a=a.delete(c.doc.key)),c.type!==1&&(a=a.add(c.doc),f=a.indexOf(c.doc.key)),{type:kv(c.type),doc:l,oldIndex:h,newIndex:f}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new x(V.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=Dn._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=za.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],r=[],s=[];return this.docs.forEach((i=>{i._document!==null&&(t.push(i._document),r.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),s.push(i.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function kv(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return B(61501,{type:n})}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Dn._jsonSchemaVersion="firestore/querySnapshot/1.0",Dn._jsonSchema={type:me("string",Dn._jsonSchemaVersion),bundleSource:me("string","QuerySnapshot"),bundleName:me("string"),bundle:me("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dv{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=nc(e)}set(e,t,r){this._verifyNotCommitted();const s=ta(e,this._firestore),i=op(s.converter,t,r),a=mf(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,r);return this._mutations.push(a.toMutation(s._key,Xe.none())),this}update(e,t,r,...s){this._verifyNotCommitted();const i=ta(e,this._firestore);let a;return a=typeof(t=ne(t))=="string"||t instanceof oo?DT(this._dataReader,"WriteBatch.update",i._key,t,r,s):kT(this._dataReader,"WriteBatch.update",i._key,t),this._mutations.push(a.toMutation(i._key,Xe.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=ta(e,this._firestore);return this._mutations=this._mutations.concat(new no(t._key,Xe.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new x(V.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function ta(n,e){if((n=ne(n)).firestore!==e)throw new x(V.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dR(n){n=tt(n,de);const e=tt(n.firestore,_n),t=Ls(e);return Pv(t,n._key).then((r=>ap(e,n,r)))}function fR(n){n=tt(n,Mt);const e=tt(n.firestore,_n),t=Ls(e),r=new Dc(e);return rp(n._query),Sv(t,n._query).then((s=>new Dn(e,r,n,s)))}function pR(n,e,t){n=tt(n,de);const r=tt(n.firestore,_n),s=op(n.converter,e,t),i=nc(r);return Mc(r,[mf(i,"setDoc",n._key,s,n.converter!==null,t).toMutation(n._key,Xe.none())])}function mR(n){return Mc(tt(n.firestore,_n),[new no(n._key,Xe.none())])}function _R(n,...e){var h,f,m;n=ne(n);let t={includeMetadataChanges:!1,source:"default"},r=0;typeof e[r]!="object"||fh(e[r])||(t=e[r++]);const s={includeMetadataChanges:t.includeMetadataChanges,source:t.source};if(fh(e[r])){const E=e[r];e[r]=(h=E.next)==null?void 0:h.bind(E),e[r+1]=(f=E.error)==null?void 0:f.bind(E),e[r+2]=(m=E.complete)==null?void 0:m.bind(E)}let i,a,c;if(n instanceof de)a=tt(n.firestore,_n),c=ro(n._key.path),i={next:E=>{e[r]&&e[r](ap(a,n,E))},error:e[r+1],complete:e[r+2]};else{const E=tt(n,Mt);a=tt(E.firestore,_n),c=E._query;const S=new Dc(a);i={next:b=>{e[r]&&e[r](new Dn(a,S,E,b))},error:e[r+1],complete:e[r+2]},rp(n._query)}const l=Ls(a);return Rv(l,c,s,i)}function Mc(n,e){const t=Ls(n);return bv(t,e)}function ap(n,e,t){const r=t.docs.get(e._key),s=new Dc(n);return new kn(n,s,e._key,r,new Kr(t.hasPendingWrites,t.fromCache),e.converter)}function gR(n){return n=tt(n,_n),Ls(n),new Dv(n,(e=>Mc(n,e)))}(function(e,t=!0){qy(jn),Ln(new sn("firestore",((r,{instanceIdentifier:s,options:i})=>{const a=r.getProvider("app").getImmediate(),c=new _n(new zy(r.getProvider("auth-internal")),new Gy(a,r.getProvider("app-check-internal")),dE(a,s),a);return i={useFetchStreams:t,...i},c._setSettings(i),c}),"PUBLIC").setMultipleInstances(!0)),ft(hh,dh,e),ft(hh,dh,"esm2020")})();var xv="firebase",Ov="12.15.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ft(xv,Ov,"app");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cp="firebasestorage.googleapis.com",up="storageBucket",Lv=120*1e3,Uv=600*1e3,Mv=1e3;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class le extends It{constructor(e,t,r=0){super(na(e),`Firebase Storage: ${t} (${na(e)})`),this.status_=r,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,le.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return na(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var ie;(function(n){n.UNKNOWN="unknown",n.OBJECT_NOT_FOUND="object-not-found",n.BUCKET_NOT_FOUND="bucket-not-found",n.PROJECT_NOT_FOUND="project-not-found",n.QUOTA_EXCEEDED="quota-exceeded",n.UNAUTHENTICATED="unauthenticated",n.UNAUTHORIZED="unauthorized",n.UNAUTHORIZED_APP="unauthorized-app",n.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",n.INVALID_CHECKSUM="invalid-checksum",n.CANCELED="canceled",n.INVALID_EVENT_NAME="invalid-event-name",n.INVALID_URL="invalid-url",n.INVALID_DEFAULT_BUCKET="invalid-default-bucket",n.NO_DEFAULT_BUCKET="no-default-bucket",n.CANNOT_SLICE_BLOB="cannot-slice-blob",n.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",n.NO_DOWNLOAD_URL="no-download-url",n.INVALID_ARGUMENT="invalid-argument",n.INVALID_ARGUMENT_COUNT="invalid-argument-count",n.APP_DELETED="app-deleted",n.INVALID_ROOT_OPERATION="invalid-root-operation",n.INVALID_FORMAT="invalid-format",n.INTERNAL_ERROR="internal-error",n.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(ie||(ie={}));function na(n){return"storage/"+n}function Fc(){const n="An unknown error occurred, please check the error payload for server response.";return new le(ie.UNKNOWN,n)}function Fv(n){return new le(ie.OBJECT_NOT_FOUND,"Object '"+n+"' does not exist.")}function Bv(n){return new le(ie.QUOTA_EXCEEDED,"Quota for bucket '"+n+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function qv(){const n="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new le(ie.UNAUTHENTICATED,n)}function $v(){return new le(ie.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function jv(n){return new le(ie.UNAUTHORIZED,"User does not have permission to access '"+n+"'.")}function lp(){return new le(ie.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function hp(){return new le(ie.CANCELED,"User canceled the upload/download.")}function zv(n){return new le(ie.INVALID_URL,"Invalid URL '"+n+"'.")}function Hv(n){return new le(ie.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+n+"'.")}function Wv(){return new le(ie.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+up+"' property when initializing the app?")}function dp(){return new le(ie.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function Gv(){return new le(ie.SERVER_FILE_WRONG_SIZE,"Server recorded incorrect upload file size, please retry the upload.")}function Kv(){return new le(ie.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function Qv(n){return new le(ie.UNSUPPORTED_ENVIRONMENT,`${n} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function Ca(n){return new le(ie.INVALID_ARGUMENT,n)}function fp(){return new le(ie.APP_DELETED,"The Firebase app was deleted.")}function Yv(n){return new le(ie.INVALID_ROOT_OPERATION,"The operation '"+n+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function rs(n,e){return new le(ie.INVALID_FORMAT,"String does not match format '"+n+"': "+e)}function $r(n){throw new le(ie.INTERNAL_ERROR,"Internal error: "+n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Je{constructor(e,t){this.bucket=e,this.path_=t}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,t){let r;try{r=Je.makeFromUrl(e,t)}catch{return new Je(e,"")}if(r.path==="")return r;throw Hv(e)}static makeFromUrl(e,t){let r=null;const s="([A-Za-z0-9.\\-_]+)";function i(ee){ee.path.charAt(ee.path.length-1)==="/"&&(ee.path_=ee.path_.slice(0,-1))}const a="(/(.*))?$",c=new RegExp("^gs://"+s+a,"i"),l={bucket:1,path:3};function h(ee){ee.path_=decodeURIComponent(ee.path)}const f="v[A-Za-z0-9_]+",m=t.replace(/[.]/g,"\\."),E="(/([^?#]*).*)?$",S=new RegExp(`^https?://${m}/${f}/b/${s}/o${E}`,"i"),b={bucket:1,path:3},L=t===cp?"(?:storage.googleapis.com|storage.cloud.google.com)":t,k="([^?#]*)",$=new RegExp(`^https?://${L}/${s}/${k}`,"i"),K=[{regex:c,indices:l,postModify:i},{regex:S,indices:b,postModify:h},{regex:$,indices:{bucket:1,path:2},postModify:h}];for(let ee=0;ee<K.length;ee++){const ae=K[ee],ce=ae.regex.exec(e);if(ce){const I=ce[ae.indices.bucket];let _=ce[ae.indices.path];_||(_=""),r=new Je(I,_),ae.postModify(r);break}}if(r==null)throw zv(e);return r}}class Jv{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xv(n,e,t){let r=1,s=null,i=null,a=!1,c=0;function l(){return c===2}let h=!1;function f(...k){h||(h=!0,e.apply(null,k))}function m(k){s=setTimeout(()=>{s=null,n(S,l())},k)}function E(){i&&clearTimeout(i)}function S(k,...$){if(h){E();return}if(k){E(),f.call(null,k,...$);return}if(l()||a){E(),f.call(null,k,...$);return}r<64&&(r*=2);let K;c===1?(c=2,K=0):K=(r+Math.random())*1e3,m(K)}let b=!1;function L(k){b||(b=!0,E(),!h&&(s!==null?(k||(c=2),clearTimeout(s),m(0)):k||(c=1)))}return m(0),i=setTimeout(()=>{a=!0,L(!0)},t),L}function Zv(n){n(!1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function eA(n){return n!==void 0}function tA(n){return typeof n=="function"}function nA(n){return typeof n=="object"&&!Array.isArray(n)}function Eo(n){return typeof n=="string"||n instanceof String}function _h(n){return Bc()&&n instanceof Blob}function Bc(){return typeof Blob<"u"}function gh(n,e,t,r){if(r<e)throw Ca(`Invalid value for '${n}'. Expected ${e} or greater.`);if(r>t)throw Ca(`Invalid value for '${n}'. Expected ${t} or less.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vr(n,e,t){let r=e;return t==null&&(r=`https://${e}`),`${t}://${r}/v0${n}`}function pp(n){const e=encodeURIComponent;let t="?";for(const r in n)if(n.hasOwnProperty(r)){const s=e(r)+"="+e(n[r]);t=t+s+"&"}return t=t.slice(0,-1),t}var xn;(function(n){n[n.NO_ERROR=0]="NO_ERROR",n[n.NETWORK_ERROR=1]="NETWORK_ERROR",n[n.ABORT=2]="ABORT"})(xn||(xn={}));/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mp(n,e){const t=n>=500&&n<600,s=[408,429].indexOf(n)!==-1,i=e.indexOf(n)!==-1;return t||s||i}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rA{constructor(e,t,r,s,i,a,c,l,h,f,m,E=!0,S=!1){this.url_=e,this.method_=t,this.headers_=r,this.body_=s,this.successCodes_=i,this.additionalRetryCodes_=a,this.callback_=c,this.errorCallback_=l,this.timeout_=h,this.progressCallback_=f,this.connectionFactory_=m,this.retry=E,this.isUsingEmulator=S,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((b,L)=>{this.resolve_=b,this.reject_=L,this.start_()})}start_(){const e=(r,s)=>{if(s){r(!1,new oi(!1,null,!0));return}const i=this.connectionFactory_();this.pendingConnection_=i;const a=c=>{const l=c.loaded,h=c.lengthComputable?c.total:-1;this.progressCallback_!==null&&this.progressCallback_(l,h)};this.progressCallback_!==null&&i.addUploadProgressListener(a),i.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&i.removeUploadProgressListener(a),this.pendingConnection_=null;const c=i.getErrorCode()===xn.NO_ERROR,l=i.getStatus();if(!c||mp(l,this.additionalRetryCodes_)&&this.retry){const f=i.getErrorCode()===xn.ABORT;r(!1,new oi(!1,null,f));return}const h=this.successCodes_.indexOf(l)!==-1;r(!0,new oi(h,i))})},t=(r,s)=>{const i=this.resolve_,a=this.reject_,c=s.connection;if(s.wasSuccessCode)try{const l=this.callback_(c,c.getResponse());eA(l)?i(l):i()}catch(l){a(l)}else if(c!==null){const l=Fc();l.serverResponse=c.getErrorText(),this.errorCallback_?a(this.errorCallback_(c,l)):a(l)}else if(s.canceled){const l=this.appDelete_?fp():hp();a(l)}else{const l=lp();a(l)}};this.canceled_?t(!1,new oi(!1,null,!0)):this.backoffId_=Xv(e,t,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&Zv(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class oi{constructor(e,t,r){this.wasSuccessCode=e,this.connection=t,this.canceled=!!r}}function sA(n,e){e!==null&&e.length>0&&(n.Authorization="Firebase "+e)}function iA(n,e){n["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function oA(n,e){e&&(n["X-Firebase-GMPID"]=e)}function aA(n,e){e!==null&&(n["X-Firebase-AppCheck"]=e)}function cA(n,e,t,r,s,i,a=!0,c=!1){const l=pp(n.urlParams),h=n.url+l,f=Object.assign({},n.headers);return oA(f,e),sA(f,t),iA(f,i),aA(f,r),new rA(h,n.method,f,n.body,n.successCodes,n.additionalRetryCodes,n.handler,n.errorHandler,n.timeout,n.progressCallback,s,a,c)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uA(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function lA(...n){const e=uA();if(e!==void 0){const t=new e;for(let r=0;r<n.length;r++)t.append(n[r]);return t.getBlob()}else{if(Bc())return new Blob(n);throw new le(ie.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function hA(n,e,t){return n.webkitSlice?n.webkitSlice(e,t):n.mozSlice?n.mozSlice(e,t):n.slice?n.slice(e,t):null}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dA(n){if(typeof atob>"u")throw Qv("base-64");return atob(n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dt={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class ra{constructor(e,t){this.data=e,this.contentType=t||null}}function fA(n,e){switch(n){case dt.RAW:return new ra(_p(e));case dt.BASE64:case dt.BASE64URL:return new ra(gp(n,e));case dt.DATA_URL:return new ra(mA(e),_A(e))}throw Fc()}function _p(n){const e=[];for(let t=0;t<n.length;t++){let r=n.charCodeAt(t);if(r<=127)e.push(r);else if(r<=2047)e.push(192|r>>6,128|r&63);else if((r&64512)===55296)if(!(t<n.length-1&&(n.charCodeAt(t+1)&64512)===56320))e.push(239,191,189);else{const i=r,a=n.charCodeAt(++t);r=65536|(i&1023)<<10|a&1023,e.push(240|r>>18,128|r>>12&63,128|r>>6&63,128|r&63)}else(r&64512)===56320?e.push(239,191,189):e.push(224|r>>12,128|r>>6&63,128|r&63)}return new Uint8Array(e)}function pA(n){let e;try{e=decodeURIComponent(n)}catch{throw rs(dt.DATA_URL,"Malformed data URL.")}return _p(e)}function gp(n,e){switch(n){case dt.BASE64:{const s=e.indexOf("-")!==-1,i=e.indexOf("_")!==-1;if(s||i)throw rs(n,"Invalid character '"+(s?"-":"_")+"' found: is it base64url encoded?");break}case dt.BASE64URL:{const s=e.indexOf("+")!==-1,i=e.indexOf("/")!==-1;if(s||i)throw rs(n,"Invalid character '"+(s?"+":"/")+"' found: is it base64 encoded?");e=e.replace(/-/g,"+").replace(/_/g,"/");break}}let t;try{t=dA(e)}catch(s){throw s.message.includes("polyfill")?s:rs(n,"Invalid character found")}const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r}class yp{constructor(e){this.base64=!1,this.contentType=null;const t=e.match(/^data:([^,]+)?,/);if(t===null)throw rs(dt.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const r=t[1]||null;r!=null&&(this.base64=gA(r,";base64"),this.contentType=this.base64?r.substring(0,r.length-7):r),this.rest=e.substring(e.indexOf(",")+1)}}function mA(n){const e=new yp(n);return e.base64?gp(dt.BASE64,e.rest):pA(e.rest)}function _A(n){return new yp(n).contentType}function gA(n,e){return n.length>=e.length?n.substring(n.length-e.length)===e:!1}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xt{constructor(e,t){let r=0,s="";_h(e)?(this.data_=e,r=e.size,s=e.type):e instanceof ArrayBuffer?(t?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),r=this.data_.length):e instanceof Uint8Array&&(t?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),r=e.length),this.size_=r,this.type_=s}size(){return this.size_}type(){return this.type_}slice(e,t){if(_h(this.data_)){const r=this.data_,s=hA(r,e,t);return s===null?null:new Xt(s)}else{const r=new Uint8Array(this.data_.buffer,e,t-e);return new Xt(r,!0)}}static getBlob(...e){if(Bc()){const t=e.map(r=>r instanceof Xt?r.data_:r);return new Xt(lA.apply(null,t))}else{const t=e.map(a=>Eo(a)?fA(dt.RAW,a).data:a.data_);let r=0;t.forEach(a=>{r+=a.byteLength});const s=new Uint8Array(r);let i=0;return t.forEach(a=>{for(let c=0;c<a.length;c++)s[i++]=a[c]}),new Xt(s,!0)}}uploadData(){return this.data_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ep(n){let e;try{e=JSON.parse(n)}catch{return null}return nA(e)?e:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yA(n){if(n.length===0)return null;const e=n.lastIndexOf("/");return e===-1?"":n.slice(0,e)}function EA(n,e){const t=e.split("/").filter(r=>r.length>0).join("/");return n.length===0?t:n+"/"+t}function Tp(n){const e=n.lastIndexOf("/",n.length-2);return e===-1?n:n.slice(e+1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function TA(n,e){return e}class xe{constructor(e,t,r,s){this.server=e,this.local=t||e,this.writable=!!r,this.xform=s||TA}}let ai=null;function wA(n){return!Eo(n)||n.length<2?n:Tp(n)}function wp(){if(ai)return ai;const n=[];n.push(new xe("bucket")),n.push(new xe("generation")),n.push(new xe("metageneration")),n.push(new xe("name","fullPath",!0));function e(i,a){return wA(a)}const t=new xe("name");t.xform=e,n.push(t);function r(i,a){return a!==void 0?Number(a):a}const s=new xe("size");return s.xform=r,n.push(s),n.push(new xe("timeCreated")),n.push(new xe("updated")),n.push(new xe("md5Hash",null,!0)),n.push(new xe("cacheControl",null,!0)),n.push(new xe("contentDisposition",null,!0)),n.push(new xe("contentEncoding",null,!0)),n.push(new xe("contentLanguage",null,!0)),n.push(new xe("contentType",null,!0)),n.push(new xe("metadata","customMetadata",!0)),ai=n,ai}function IA(n,e){function t(){const r=n.bucket,s=n.fullPath,i=new Je(r,s);return e._makeStorageReference(i)}Object.defineProperty(n,"ref",{get:t})}function vA(n,e,t){const r={};r.type="file";const s=t.length;for(let i=0;i<s;i++){const a=t[i];r[a.local]=a.xform(r,e[a.server])}return IA(r,n),r}function Ip(n,e,t){const r=Ep(e);return r===null?null:vA(n,r,t)}function AA(n,e,t,r){const s=Ep(e);if(s===null||!Eo(s.downloadTokens))return null;const i=s.downloadTokens;if(i.length===0)return null;const a=encodeURIComponent;return i.split(",").map(h=>{const f=n.bucket,m=n.fullPath,E="/b/"+a(f)+"/o/"+a(m),S=vr(E,t,r),b=pp({alt:"media",token:h});return S+b})[0]}function vp(n,e){const t={},r=e.length;for(let s=0;s<r;s++){const i=e[s];i.writable&&(t[i.server]=n[i.local])}return JSON.stringify(t)}class Kn{constructor(e,t,r,s){this.url=e,this.method=t,this.handler=r,this.timeout=s,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nt(n){if(!n)throw Fc()}function qc(n,e){function t(r,s){const i=Ip(n,s,e);return Nt(i!==null),i}return t}function RA(n,e){function t(r,s){const i=Ip(n,s,e);return Nt(i!==null),AA(i,s,n.host,n._protocol)}return t}function Us(n){function e(t,r){let s;return t.getStatus()===401?t.getErrorText().includes("Firebase App Check token is invalid")?s=$v():s=qv():t.getStatus()===402?s=Bv(n.bucket):t.getStatus()===403?s=jv(n.path):s=r,s.status=t.getStatus(),s.serverResponse=r.serverResponse,s}return e}function $c(n){const e=Us(n);function t(r,s){let i=e(r,s);return r.getStatus()===404&&(i=Fv(n.path)),i.serverResponse=s.serverResponse,i}return t}function PA(n,e,t){const r=e.fullServerUrl(),s=vr(r,n.host,n._protocol),i="GET",a=n.maxOperationRetryTime,c=new Kn(s,i,qc(n,t),a);return c.errorHandler=$c(e),c}function SA(n,e,t){const r=e.fullServerUrl(),s=vr(r,n.host,n._protocol),i="GET",a=n.maxOperationRetryTime,c=new Kn(s,i,RA(n,t),a);return c.errorHandler=$c(e),c}function bA(n,e){const t=e.fullServerUrl(),r=vr(t,n.host,n._protocol),s="DELETE",i=n.maxOperationRetryTime;function a(l,h){}const c=new Kn(r,s,a,i);return c.successCodes=[200,204],c.errorHandler=$c(e),c}function CA(n,e){return n&&n.contentType||e&&e.type()||"application/octet-stream"}function Ap(n,e,t){const r=Object.assign({},t);return r.fullPath=n.path,r.size=e.size(),r.contentType||(r.contentType=CA(null,e)),r}function VA(n,e,t,r,s){const i=e.bucketOnlyServerUrl(),a={"X-Goog-Upload-Protocol":"multipart"};function c(){let K="";for(let ee=0;ee<2;ee++)K=K+Math.random().toString().slice(2);return K}const l=c();a["Content-Type"]="multipart/related; boundary="+l;const h=Ap(e,r,s),f=vp(h,t),m="--"+l+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+f+`\r
--`+l+`\r
Content-Type: `+h.contentType+`\r
\r
`,E=`\r
--`+l+"--",S=Xt.getBlob(m,r,E);if(S===null)throw dp();const b={name:h.fullPath},L=vr(i,n.host,n._protocol),k="POST",$=n.maxUploadRetryTime,W=new Kn(L,k,qc(n,t),$);return W.urlParams=b,W.headers=a,W.body=S.uploadData(),W.errorHandler=Us(e),W}class ji{constructor(e,t,r,s){this.current=e,this.total=t,this.finalized=!!r,this.metadata=s||null}}function jc(n,e){let t=null;try{t=n.getResponseHeader("X-Goog-Upload-Status")}catch{Nt(!1)}return Nt(!!t&&(e||["active"]).indexOf(t)!==-1),t}function NA(n,e,t,r,s){const i=e.bucketOnlyServerUrl(),a=Ap(e,r,s),c={name:a.fullPath},l=vr(i,n.host,n._protocol),h="POST",f={"X-Goog-Upload-Protocol":"resumable","X-Goog-Upload-Command":"start","X-Goog-Upload-Header-Content-Length":`${r.size()}`,"X-Goog-Upload-Header-Content-Type":a.contentType,"Content-Type":"application/json; charset=utf-8"},m=vp(a,t),E=n.maxUploadRetryTime;function S(L){jc(L);let k;try{k=L.getResponseHeader("X-Goog-Upload-URL")}catch{Nt(!1)}return Nt(Eo(k)),k}const b=new Kn(l,h,S,E);return b.urlParams=c,b.headers=f,b.body=m,b.errorHandler=Us(e),b}function kA(n,e,t,r){const s={"X-Goog-Upload-Command":"query"};function i(h){const f=jc(h,["active","final"]);let m=null;try{m=h.getResponseHeader("X-Goog-Upload-Size-Received")}catch{Nt(!1)}m||Nt(!1);const E=Number(m);return Nt(!isNaN(E)),new ji(E,r.size(),f==="final")}const a="POST",c=n.maxUploadRetryTime,l=new Kn(t,a,i,c);return l.headers=s,l.errorHandler=Us(e),l}const yh=256*1024;function DA(n,e,t,r,s,i,a,c){const l=new ji(0,0);if(a?(l.current=a.current,l.total=a.total):(l.current=0,l.total=r.size()),r.size()!==l.total)throw Gv();const h=l.total-l.current;let f=h;s>0&&(f=Math.min(f,s));const m=l.current,E=m+f;let S="";f===0?S="finalize":h===f?S="upload, finalize":S="upload";const b={"X-Goog-Upload-Command":S,"X-Goog-Upload-Offset":`${l.current}`},L=r.slice(m,E);if(L===null)throw dp();function k(ee,ae){const ce=jc(ee,["active","final"]),I=l.current+f,_=r.size();let y;return ce==="final"?y=qc(e,i)(ee,ae):y=null,new ji(I,_,ce==="final",y)}const $="POST",W=e.maxUploadRetryTime,K=new Kn(t,$,k,W);return K.headers=b,K.body=L.uploadData(),K.progressCallback=c||null,K.errorHandler=Us(n),K}const qe={RUNNING:"running",PAUSED:"paused",SUCCESS:"success",CANCELED:"canceled",ERROR:"error"};function sa(n){switch(n){case"running":case"pausing":case"canceling":return qe.RUNNING;case"paused":return qe.PAUSED;case"success":return qe.SUCCESS;case"canceled":return qe.CANCELED;case"error":return qe.ERROR;default:return qe.ERROR}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xA{constructor(e,t,r){if(tA(e)||t!=null||r!=null)this.next=e,this.error=t??void 0,this.complete=r??void 0;else{const i=e;this.next=i.next,this.error=i.error,this.complete=i.complete}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xn(n){return(...e)=>{Promise.resolve().then(()=>n(...e))}}class OA{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=xn.NO_ERROR,this.sendPromise_=new Promise(e=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=xn.ABORT,e()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=xn.NETWORK_ERROR,e()}),this.xhr_.addEventListener("load",()=>{e()})})}send(e,t,r,s,i){if(this.sent_)throw $r("cannot .send() more than once");if($n(e)&&r&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(t,e,!0),i!==void 0)for(const a in i)i.hasOwnProperty(a)&&this.xhr_.setRequestHeader(a,i[a].toString());return s!==void 0?this.xhr_.send(s):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw $r("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw $r("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw $r("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw $r("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(e){return this.xhr_.getResponseHeader(e)}addUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",e)}removeUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",e)}}class LA extends OA{initXhr(){this.xhr_.responseType="text"}}function Sn(){return new LA}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class UA{isExponentialBackoffExpired(){return this.sleepTime>this.maxSleepTime}constructor(e,t,r=null){this._transferred=0,this._needToFetchStatus=!1,this._needToFetchMetadata=!1,this._observers=[],this._error=void 0,this._uploadUrl=void 0,this._request=void 0,this._chunkMultiplier=1,this._resolve=void 0,this._reject=void 0,this._ref=e,this._blob=t,this._metadata=r,this._mappings=wp(),this._resumable=this._shouldDoResumable(this._blob),this._state="running",this._errorHandler=s=>{if(this._request=void 0,this._chunkMultiplier=1,s._codeEquals(ie.CANCELED))this._needToFetchStatus=!0,this.completeTransitions_();else{const i=this.isExponentialBackoffExpired();if(mp(s.status,[]))if(i)s=lp();else{this.sleepTime=Math.max(this.sleepTime*2,Mv),this._needToFetchStatus=!0,this.completeTransitions_();return}this._error=s,this._transition("error")}},this._metadataErrorHandler=s=>{this._request=void 0,s._codeEquals(ie.CANCELED)?this.completeTransitions_():(this._error=s,this._transition("error"))},this.sleepTime=0,this.maxSleepTime=this._ref.storage.maxUploadRetryTime,this._promise=new Promise((s,i)=>{this._resolve=s,this._reject=i,this._start()}),this._promise.then(null,()=>{})}_makeProgressCallback(){const e=this._transferred;return t=>this._updateProgress(e+t)}_shouldDoResumable(e){return e.size()>256*1024}_start(){this._state==="running"&&this._request===void 0&&(this._resumable?this._uploadUrl===void 0?this._createResumable():this._needToFetchStatus?this._fetchStatus():this._needToFetchMetadata?this._fetchMetadata():this.pendingTimeout=setTimeout(()=>{this.pendingTimeout=void 0,this._continueUpload()},this.sleepTime):this._oneShotUpload())}_resolveToken(e){Promise.all([this._ref.storage._getAuthToken(),this._ref.storage._getAppCheckToken()]).then(([t,r])=>{switch(this._state){case"running":e(t,r);break;case"canceling":this._transition("canceled");break;case"pausing":this._transition("paused");break}})}_createResumable(){this._resolveToken((e,t)=>{const r=NA(this._ref.storage,this._ref._location,this._mappings,this._blob,this._metadata),s=this._ref.storage._makeRequest(r,Sn,e,t);this._request=s,s.getPromise().then(i=>{this._request=void 0,this._uploadUrl=i,this._needToFetchStatus=!1,this.completeTransitions_()},this._errorHandler)})}_fetchStatus(){const e=this._uploadUrl;this._resolveToken((t,r)=>{const s=kA(this._ref.storage,this._ref._location,e,this._blob),i=this._ref.storage._makeRequest(s,Sn,t,r);this._request=i,i.getPromise().then(a=>{a=a,this._request=void 0,this._updateProgress(a.current),this._needToFetchStatus=!1,a.finalized&&(this._needToFetchMetadata=!0),this.completeTransitions_()},this._errorHandler)})}_continueUpload(){const e=yh*this._chunkMultiplier,t=new ji(this._transferred,this._blob.size()),r=this._uploadUrl;this._resolveToken((s,i)=>{let a;try{a=DA(this._ref._location,this._ref.storage,r,this._blob,e,this._mappings,t,this._makeProgressCallback())}catch(l){this._error=l,this._transition("error");return}const c=this._ref.storage._makeRequest(a,Sn,s,i,!1);this._request=c,c.getPromise().then(l=>{this._increaseMultiplier(),this._request=void 0,this._updateProgress(l.current),l.finalized?(this._metadata=l.metadata,this._transition("success")):this.completeTransitions_()},this._errorHandler)})}_increaseMultiplier(){yh*this._chunkMultiplier*2<32*1024*1024&&(this._chunkMultiplier*=2)}_fetchMetadata(){this._resolveToken((e,t)=>{const r=PA(this._ref.storage,this._ref._location,this._mappings),s=this._ref.storage._makeRequest(r,Sn,e,t);this._request=s,s.getPromise().then(i=>{this._request=void 0,this._metadata=i,this._transition("success")},this._metadataErrorHandler)})}_oneShotUpload(){this._resolveToken((e,t)=>{const r=VA(this._ref.storage,this._ref._location,this._mappings,this._blob,this._metadata),s=this._ref.storage._makeRequest(r,Sn,e,t);this._request=s,s.getPromise().then(i=>{this._request=void 0,this._metadata=i,this._updateProgress(this._blob.size()),this._transition("success")},this._errorHandler)})}_updateProgress(e){const t=this._transferred;this._transferred=e,this._transferred!==t&&this._notifyObservers()}_transition(e){if(this._state!==e)switch(e){case"canceling":case"pausing":this._state=e,this._request!==void 0?this._request.cancel():this.pendingTimeout&&(clearTimeout(this.pendingTimeout),this.pendingTimeout=void 0,this.completeTransitions_());break;case"running":const t=this._state==="paused";this._state=e,t&&(this._notifyObservers(),this._start());break;case"paused":this._state=e,this._notifyObservers();break;case"canceled":this._error=hp(),this._state=e,this._notifyObservers();break;case"error":this._state=e,this._notifyObservers();break;case"success":this._state=e,this._notifyObservers();break}}completeTransitions_(){switch(this._state){case"pausing":this._transition("paused");break;case"canceling":this._transition("canceled");break;case"running":this._start();break}}get snapshot(){const e=sa(this._state);return{bytesTransferred:this._transferred,totalBytes:this._blob.size(),state:e,metadata:this._metadata,task:this,ref:this._ref}}on(e,t,r,s){const i=new xA(t||void 0,r||void 0,s||void 0);return this._addObserver(i),()=>{this._removeObserver(i)}}then(e,t){return this._promise.then(e,t)}catch(e){return this.then(null,e)}_addObserver(e){this._observers.push(e),this._notifyObserver(e)}_removeObserver(e){const t=this._observers.indexOf(e);t!==-1&&this._observers.splice(t,1)}_notifyObservers(){this._finishPromise(),this._observers.slice().forEach(t=>{this._notifyObserver(t)})}_finishPromise(){if(this._resolve!==void 0){let e=!0;switch(sa(this._state)){case qe.SUCCESS:Xn(this._resolve.bind(null,this.snapshot))();break;case qe.CANCELED:case qe.ERROR:const t=this._reject;Xn(t.bind(null,this._error))();break;default:e=!1;break}e&&(this._resolve=void 0,this._reject=void 0)}}_notifyObserver(e){switch(sa(this._state)){case qe.RUNNING:case qe.PAUSED:e.next&&Xn(e.next.bind(e,this.snapshot))();break;case qe.SUCCESS:e.complete&&Xn(e.complete.bind(e))();break;case qe.CANCELED:case qe.ERROR:e.error&&Xn(e.error.bind(e,this._error))();break;default:e.error&&Xn(e.error.bind(e,this._error))()}}resume(){const e=this._state==="paused"||this._state==="pausing";return e&&this._transition("running"),e}pause(){const e=this._state==="running";return e&&this._transition("pausing"),e}cancel(){const e=this._state==="running"||this._state==="pausing";return e&&this._transition("canceling"),e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qn{constructor(e,t){this._service=e,t instanceof Je?this._location=t:this._location=Je.makeFromUrl(t,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,t){return new qn(e,t)}get root(){const e=new Je(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return Tp(this._location.path)}get storage(){return this._service}get parent(){const e=yA(this._location.path);if(e===null)return null;const t=new Je(this._location.bucket,e);return new qn(this._service,t)}_throwIfRoot(e){if(this._location.path==="")throw Yv(e)}}function MA(n,e,t){return n._throwIfRoot("uploadBytesResumable"),new UA(n,new Xt(e),t)}function FA(n){n._throwIfRoot("getDownloadURL");const e=SA(n.storage,n._location,wp());return n.storage.makeRequestWithTokens(e,Sn).then(t=>{if(t===null)throw Kv();return t})}function BA(n){n._throwIfRoot("deleteObject");const e=bA(n.storage,n._location);return n.storage.makeRequestWithTokens(e,Sn)}function qA(n,e){const t=EA(n._location.path,e),r=new Je(n._location.bucket,t);return new qn(n.storage,r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $A(n){return/^[A-Za-z]+:\/\//.test(n)}function jA(n,e){return new qn(n,e)}function Rp(n,e){if(n instanceof zc){const t=n;if(t._bucket==null)throw Wv();const r=new qn(t,t._bucket);return e!=null?Rp(r,e):r}else return e!==void 0?qA(n,e):n}function zA(n,e){if(e&&$A(e)){if(n instanceof zc)return jA(n,e);throw Ca("To use ref(service, url), the first argument must be a Storage instance.")}else return Rp(n,e)}function Eh(n,e){const t=e==null?void 0:e[up];return t==null?null:Je.makeFromBucketSpec(t,n)}function HA(n,e,t,r={}){n.host=`${e}:${t}`;const s=$n(e);s&&Na(`https://${n.host}/b`),n._isUsingEmulator=!0,n._protocol=s?"https":"http";const{mockUserToken:i}=r;i&&(n._overrideAuthToken=typeof i=="string"?i:mm(i,n.app.options.projectId))}class zc{constructor(e,t,r,s,i,a=!1){this.app=e,this._authProvider=t,this._appCheckProvider=r,this._url=s,this._firebaseVersion=i,this._isUsingEmulator=a,this._bucket=null,this._host=cp,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=Lv,this._maxUploadRetryTime=Uv,this._requests=new Set,s!=null?this._bucket=Je.makeFromBucketSpec(s,this._host):this._bucket=Eh(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=Je.makeFromBucketSpec(this._url,e):this._bucket=Eh(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){gh("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){gh("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const t=await e.getToken();if(t!==null)return t.accessToken}return null}async _getAppCheckToken(){if(Le(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new qn(this,e)}_makeRequest(e,t,r,s,i=!0){if(this._deleted)return new Jv(fp());{const a=cA(e,this._appId,r,s,t,this._firebaseVersion,i,this._isUsingEmulator);return this._requests.add(a),a.getPromise().then(()=>this._requests.delete(a),()=>this._requests.delete(a)),a}}async makeRequestWithTokens(e,t){const[r,s]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,t,r,s).getPromise()}}const Th="@firebase/storage",wh="0.14.3";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pp="storage";function yR(n,e,t){return n=ne(n),MA(n,e,t)}function ER(n){return n=ne(n),FA(n)}function TR(n){return n=ne(n),BA(n)}function wR(n,e){return n=ne(n),zA(n,e)}function IR(n=Ch(),e){n=ne(n);const r=Hi(n,Pp).getImmediate({identifier:e}),s=pm("storage");return s&&WA(r,...s),r}function WA(n,e,t,r={}){HA(n,e,t,r)}function GA(n,{instanceIdentifier:e}){const t=n.getProvider("app").getImmediate(),r=n.getProvider("auth-internal"),s=n.getProvider("app-check-internal");return new zc(t,r,s,e,jn)}function KA(){Ln(new sn(Pp,GA,"PUBLIC").setMultipleInstances(!0)),ft(Th,wh,""),ft(Th,wh,"esm2020")}KA();export{TR as A,Kt as G,uR as a,IR as b,dR as c,cR as d,nR as e,YA as f,sR as g,XA as h,E_ as i,ZA as j,rR as k,fR as l,oR as m,mR as n,tR as o,JA as p,lR as q,hR as r,pR as s,_R as t,eR as u,aR as v,wR as w,yR as x,ER as y,gR as z};
