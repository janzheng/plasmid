"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("@tiptap/core"),t=require("@tiptap/pm/state"),i=require("@tiptap/pm/view");const r=new t.PluginKey("invisibleCharacters"),n=(e,n)=>{const s=r,a=i.DecorationSet.create(e.doc,[]),o=(e,t,i,r)=>n.builders.sort(((e,t)=>e.priority>t.priority?1:-1)).reduce(((r,n)=>n.createDecoration(e,t,i.doc,r)),r);return new t.Plugin({key:s,state:{init:()=>{const{$from:r,$to:s}=new t.AllSelection(e.doc);return n.injectCSS&&document&&((e,t)=>{const i=document.querySelector("style[data-tiptap-extension-invisible-characters-style]");if(null!==i)return i;const r=document.createElement("style");t&&r.setAttribute("nonce",t),r.setAttribute("data-tiptap-extension-invisible-characters-style",""),r.innerHTML=e,document.getElementsByTagName("head")[0].appendChild(r)})(".Tiptap-invisible-character {\n  height: 0;\n  padding: 0;\n  pointer-events: none;\n  user-select: none;\n  width: 0;\n}\n\n.Tiptap-invisible-character::before {\n  caret-color: inherit;\n  color: #aaa;\n  display: inline-block;\n  font-style: normal;\n  font-weight: 400;\n  line-height: 1em;\n  width: 0;\n}\n\n.Tiptap-invisible-character--space::before {\n  content: '·'\n}\n\n.Tiptap-invisible-character--break::before {\n  content: '¬'\n}\n\n.Tiptap-invisible-character--paragraph::before {\n  content: '¶'\n}\n\n.Tiptap-invisible-character + img.ProseMirror-separator {\n  height: 0 !important;\n  pointer-events: none;\n  user-select: none;\n  width: 0 !important;\n}\n\n.is-empty[data-placeholder].has-focus > .Tiptap-invisible-character {\n  display: none;\n}\n",n.injectNonce),{visible:n.visible,decorations:o(r.pos,s.pos,e,i.DecorationSet.empty)}},apply:(e,t,i,r)=>{const n=((e,t)=>void 0===t?e:{...e,visible:t})(t,e.getMeta("setInvisibleCharactersVisible")),s=(({mapping:e})=>{const t=[];return e.maps.forEach(((i,r)=>{i.forEach(((i,n,s,a)=>{t.push([e.slice(r+1).map(s),e.slice(r+1).map(a)])}))})),t})(e).reduce(((e,[t,i])=>o(t,i,r,e)),n.decorations.map(e.mapping,e.doc));return{...n,decorations:s}}},props:{decorations(e){const{visible:t,decorations:i}=this.getState(e);return t?i:a}}})},s=(e,t,r)=>i.Decoration.widget(e,(()=>{const e=document.createElement("span");return e.classList.add("Tiptap-invisible-character"),e.classList.add(`Tiptap-invisible-character--${t}`),r&&(e.textContent=r),e}),{key:t,marks:[],side:1e3}),a=(e,t)=>t+e.nodeSize-1;class o{constructor(e){this.predicate=e.predicate,this.type=e.type,this.position=e.position||a,this.content=e.content,this.priority=e.priority||100}createDecoration(e,t,i,r){let n=r;return i.nodesBetween(e,t,((e,t)=>{if(this.test(e)){const r=this.position(e,t),a=n.find(r,r,(e=>e.key===this.type));n=n.remove(a).add(i,[s(r,this.type,this.content)])}})),n}test(e){return this.predicate(e)}}class c extends o{constructor(){super({type:"break",predicate:e=>e.type===e.type.schema.nodes.hardBreak})}}class p extends o{constructor(){super({type:"paragraph",predicate:e=>e.type===e.type.schema.nodes.paragraph})}}class d{constructor(e){this.predicate=e.predicate,this.type=e.type,this.content=e.content,this.priority=e.priority||100}createDecoration(e,t,i,r){const n=((e,t,i)=>{const r=[];return i.nodesBetween(e,t,((i,n)=>{var s;if(i.isText){const a=Math.max(e,n)-n;r.push({pos:n+a,text:(null===(s=i.text)||void 0===s?void 0:s.slice(a,t-n))||""})}})),r})(e,t,i);return n.reduce(((e,t)=>t.text.split("").reduce(((e,r,n)=>this.test(r)?e.add(i,[s(t.pos+n,this.type,this.content)]):e),e)),r)}test(e){return this.predicate(e)}}class l extends d{constructor(){super({type:"space",predicate:e=>" "===e})}}const h=e.Extension.create({name:"invisibleCharacters",addOptions:()=>({visible:!0,builders:[new l,new p,new c],injectCSS:!0,injectNonce:void 0}),addProseMirrorPlugins(){return[n(this.editor.state,this.options)]},addStorage(){return{visibility:()=>this.options.visible}},onBeforeCreate(){this.storage.visibility=()=>{var e;return null===(e=r.getState(this.editor.state))||void 0===e?void 0:e.visible}},addCommands:()=>({showInvisibleCharacters:(e=!0)=>({dispatch:t,tr:i})=>(t&&i.setMeta("setInvisibleCharactersVisible",e),!0),hideInvisibleCharacters:()=>({dispatch:e,tr:t})=>(e&&t.setMeta("setInvisibleCharactersVisible",!1),!0),toggleInvisibleCharacters:()=>({dispatch:e,tr:t,state:i})=>{var n;const s=!(null===(n=r.getState(i))||void 0===n?void 0:n.visible);return e&&t.setMeta("setInvisibleCharactersVisible",s),!0}})});exports.HardBreakNode=c,exports.InvisibleCharacter=d,exports.InvisibleCharacters=h,exports.InvisibleNode=o,exports.ParagraphNode=p,exports.SpaceCharacter=l,exports.default=h;