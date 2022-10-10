
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import rehypeParse from 'rehype-parse'
import remarkRehype from 'remark-rehype'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'
import remarkGfm from 'remark-gfm'
import rehypeStringify from 'rehype-stringify'


// uses rehype to convert HTML that contains raw markdown to markdown, then uses remark to convert markdown to HTML. Useful for converting Notion's HTML to markdown when it includes citations / footnotes
export const htmlToMdToHtml = async (html = '# Hello, Neptune!') => {

  // console.log('htmlToMdToHtml:::', html)
  let md = await unified()
    .use(rehypeParse)
    .use(rehypeRemark)
    .use(remarkGfm, {})
    .use(remarkStringify)
    .process(html)

  md = String(md).replaceAll('\\', '') // skip excluded markdown from html
  // console.log('md:::', md)

  let _html = String(await unified()
    .use(remarkParse)
    .use(remarkGfm, {})
    .use(remarkRehype, {footnoteLabel: 'References'})
    .use(rehypeStringify)
    .process(md))

  return _html
}
