!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports,require("@tiptap/core"),require("@tiptap/pm/state"),require("@tiptap/pm/view")):"function"==typeof define&&define.amd?define(["exports","@tiptap/core","@tiptap/pm/state","@tiptap/pm/view"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self)["@tiptap-pro/extension-invisible-characters"]={},e.core,e.state,e.view)}(this,(function(e,t,i,n){"use strict";const r=new i.PluginKey("invisibleCharacters"),s=(e,t)=>{const s=r,a=n.DecorationSet.create(e.doc,[]),o=(e,i,n,r)=>t.builders.sort(((e,t)=>e.priority>t.priority?1:-1)).reduce(((t,r)=>r.createDecoration(e,i,n.doc,t)),r);return new i.Plugin({key:s,state:{init:()=>{const{$from:r,$to:s}=new i.AllSelection(e.doc);return t.injectCSS&&document&&((e,t)=>{const i=document.querySelector("style[data-tiptap-extension-invisible-characters-style]");if(null!==i)return i;const n=document.createElement("style");t&&n.setAttribute("nonce",t),n.setAttribute("data-tiptap-extension-invisible-characters-style",""),n.innerHTML=e,document.getElementsByTagName("head")[0].appendChild(n)})(".Tiptap-invisible-character {\n  height: 0;\n  padding: 0;\n  pointer-events: none;\n  user-select: none;\n  width: 0;\n}\n\n.Tiptap-invisible-character::before {\n  caret-color: inherit;\n  color: #aaa;\n  display: inline-block;\n  font-style: normal;\n  font-weight: 400;\n  line-height: 1em;\n  width: 0;\n}\n\n.Tiptap-invisible-character--space::before {\n  content: '·'\n}\n\n.Tiptap-invisible-character--break::before {\n  content: '¬'\n}\n\n.Tiptap-invisible-character--paragraph::before {\n  content: '¶'\n}\n\n.Tiptap-invisible-character + img.ProseMirror-separator {\n  height: 0 !important;\n  pointer-events: none;\n  user-select: none;\n  width: 0 !important;\n}\n\n.is-empty[data-placeholder].has-focus > .Tiptap-invisible-character {\n  display: none;\n}\n",t.injectNonce),{visible:t.visible,decorations:o(r.pos,s.pos,e,n.DecorationSet.empty)}},apply:(e,t,i,n)=>{const r=((e,t)=>void 0===t?e:{...e,visible:t})(t,e.getMeta("setInvisibleCharactersVisible")),s=(({mapping:e})=>{const t=[];return e.maps.forEach(((i,n)=>{i.forEach(((i,r,s,a)=>{t.push([e.slice(n+1).map(s),e.slice(n+1).map(a)])}))})),t})(e).reduce(((e,[t,i])=>o(t,i,n,e)),r.decorations.map(e.mapping,e.doc));return{...r,decorations:s}}},props:{decorations(e){const{visible:t,decorations:i}=this.getState(e);return t?i:a}}})},a=(e,t,i)=>n.Decoration.widget(e,(()=>{const e=document.createElement("span");return e.classList.add("Tiptap-invisible-character"),e.classList.add(`Tiptap-invisible-character--${t}`),i&&(e.textContent=i),e}),{key:t,marks:[],side:1e3}),o=(e,t)=>t+e.nodeSize-1;class c{constructor(e){this.predicate=e.predicate,this.type=e.type,this.position=e.position||o,this.content=e.content,this.priority=e.priority||100}createDecoration(e,t,i,n){let r=n;return i.nodesBetween(e,t,((e,t)=>{if(this.test(e)){const n=this.position(e,t),s=r.find(n,n,(e=>e.key===this.type));r=r.remove(s).add(i,[a(n,this.type,this.content)])}})),r}test(e){return this.predicate(e)}}class p extends c{constructor(){super({type:"break",predicate:e=>e.type===e.type.schema.nodes.hardBreak})}}class d extends c{constructor(){super({type:"paragraph",predicate:e=>e.type===e.type.schema.nodes.paragraph})}}class l{constructor(e){this.predicate=e.predicate,this.type=e.type,this.content=e.content,this.priority=e.priority||100}createDecoration(e,t,i,n){const r=((e,t,i)=>{const n=[];return i.nodesBetween(e,t,((i,r)=>{var s;if(i.isText){const a=Math.max(e,r)-r;n.push({pos:r+a,text:(null===(s=i.text)||void 0===s?void 0:s.slice(a,t-r))||""})}})),n})(e,t,i);return r.reduce(((e,t)=>t.text.split("").reduce(((e,n,r)=>this.test(n)?e.add(i,[a(t.pos+r,this.type,this.content)]):e),e)),n)}test(e){return this.predicate(e)}}class h extends l{constructor(){super({type:"space",predicate:e=>" "===e})}}const u=t.Extension.create({name:"invisibleCharacters",addOptions:()=>({visible:!0,builders:[new h,new d,new p],injectCSS:!0,injectNonce:void 0}),addProseMirrorPlugins(){return[s(this.editor.state,this.options)]},addStorage(){return{visibility:()=>this.options.visible}},onBeforeCreate(){this.storage.visibility=()=>{var e;return null===(e=r.getState(this.editor.state))||void 0===e?void 0:e.visible}},addCommands:()=>({showInvisibleCharacters:(e=!0)=>({dispatch:t,tr:i})=>(t&&i.setMeta("setInvisibleCharactersVisible",e),!0),hideInvisibleCharacters:()=>({dispatch:e,tr:t})=>(e&&t.setMeta("setInvisibleCharactersVisible",!1),!0),toggleInvisibleCharacters:()=>({dispatch:e,tr:t,state:i})=>{var n;const s=!(null===(n=r.getState(i))||void 0===n?void 0:n.visible);return e&&t.setMeta("setInvisibleCharactersVisible",s),!0}})});e.HardBreakNode=p,e.InvisibleCharacter=l,e.InvisibleCharacters=u,e.InvisibleNode=c,e.ParagraphNode=d,e.SpaceCharacter=h,e.default=u,Object.defineProperty(e,"__esModule",{value:!0})}));
