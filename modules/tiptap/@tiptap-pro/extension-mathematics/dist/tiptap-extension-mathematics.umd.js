!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports,require("@tiptap/core"),require("@tiptap/pm/state"),require("@tiptap/pm/view"),require("katex")):"function"==typeof define&&define.amd?define(["exports","@tiptap/core","@tiptap/pm/state","@tiptap/pm/view","katex"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self)["@tiptap-pro/extension-mathematics"]={},t.core,t.state,t.view,t.katex)}(this,(function(t,e,i,o,a){"use strict";function n(t){return t&&"object"==typeof t&&"default"in t?t:{default:t}}var s=n(a);const r=t=>{const{regex:e,katexOptions:a={},editor:n}=t;return new i.Plugin({key:new i.PluginKey("mathematics"),state:{init:()=>o.DecorationSet.empty,apply(t,i,r,p){const{selection:d}=p,c=[];return p.doc.descendants(((t,i)=>{if(t.isText&&t.text){let r;for(;r=e.exec(t.text);){const t=i+r.index,e=t+r[0].length,p=r[1];if(p){const i=d.$from.pos-d.$to.pos,r=d.$anchor.pos>=t&&d.$anchor.pos<=e,l=d.$from.pos>=t&&d.$to.pos<=e,u=0===i&&r||l;u&&n.isEditable||c.push(o.Decoration.widget(t,(()=>{const t=document.createElement("span");t.classList.add("Tiptap-mathematics-render"),n.isEditable&&t.classList.add("Tiptap-mathematics-render--editable");try{s.default.render(p,t,a)}catch(e){t.innerHTML=p}return t}))),c.push(o.Decoration.inline(t,e,{class:u&&n.isEditable?"Tiptap-mathematics-editor":"Tiptap-mathematics-editor Tiptap-mathematics-editor--hidden",style:u&&n.isEditable?void 0:"display: inline-block; height: 0; opacity: 0; overflow: hidden; position: absolute; width: 0;"}))}}}})),c.length>0?o.DecorationSet.create(p.doc,c):o.DecorationSet.empty}},props:{decorations(t){return this.getState(t)}}})},p=e.Extension.create({name:"Mathematics",addOptions:()=>({regex:/\$([^\$]*)\$/gi,katexOptions:void 0}),addProseMirrorPlugins(){return[r({...this.options,editor:this.editor})]}});t.Mathematics=p,t.MathematicsPlugin=r,t.default=p,Object.defineProperty(t,"__esModule",{value:!0})}));
