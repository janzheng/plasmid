
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import rehypeParse from 'rehype-parse'
import remarkRehype from 'remark-rehype'
import rehypeRemark from 'rehype-remark'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkToc from 'remark-toc'
import remarkStringify from 'remark-stringify'
import remarkGfm from 'remark-gfm'
import rehypeStringify from 'rehype-stringify'


// uses rehype to convert HTML that contains raw markdown to markdown, then uses remark to convert markdown to HTML. Useful for converting Notion's HTML to markdown when it includes citations / footnotes
export const htmlToMdToHtml = async (html = '# Hello, Neptune!') => {

  // console.log('htmlToMdToHtml:::', html)
  let md = await unified()
    .use(rehypeParse)
    .use(remarkToc, { heading: 'contents' })
    .use(remarkGfm)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypeRemark)
    .use(remarkStringify) 
    .process(html) 

    md = String(md).replaceAll('\\[', '[') // prevent skip excluded markdown from html — this allows citations to work, 
    // but might break manual escapes, so only set specific items, e.g. \[1]
    md = String(md).replaceAll('\\~', '\~') 
    // md = String(md).replaceAll('\\*', '\\*') // this keeps escaping author note, but migh break bullets?

    // console.log('md:::', md?.value || md)

  let _html = String(await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkToc, { heading: 'contents', tight: false, ordered: true })
    .use(remarkRehype, { footnoteLabel: 'References'})
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypeStringify)
    .process(md))

  return _html
}