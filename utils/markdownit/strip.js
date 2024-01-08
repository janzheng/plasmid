
// stripped down version of markdownit.js w/ just md.strip
// so you don't need sanitize-html dep

import MarkdownIt from 'markdown-it'
import MarkdownItAttrs from 'markdown-it-attrs'


export let md = new MarkdownIt({
  html: true,
  typographer: true,
  linkify: true,
  breaks: true,
})
md.use(MarkdownItAttrs)

md['strip'] = function (md, start = '<p>', end = "</p>") {
  // add functionality to strip the annoying <p></p> from a rendered markdown
  // really useful for rendering markdown content in to an H1, etc.
  // usage: $md.strip($md.render( post.fields['Title'] || ''))
  // return md.substring(3, md.length-5)
  return md.substring(start.length, md.length - (end.length))
}