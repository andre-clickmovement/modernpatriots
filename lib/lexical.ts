import { JSDOM } from 'jsdom'
import type { Post } from '@/payload-types'

const FORMAT_BOLD = 1
const FORMAT_ITALIC = 2

type LexicalTextNode = ReturnType<typeof textNode>
type LexicalBlock = ReturnType<typeof paragraph> | ReturnType<typeof heading>

function textNode(text: string, format = 0) {
  return {
    type: 'text',
    text,
    format,
    mode: 'normal',
    style: '',
    detail: 0,
    version: 1,
  }
}

function paragraph(children: LexicalTextNode[]) {
  return {
    type: 'paragraph',
    children: children.length ? children : [textNode('')],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    textFormat: 0,
    textStyle: '',
  }
}

function heading(tag: 'h2' | 'h3' | 'h4', text: string) {
  return {
    type: 'heading',
    tag,
    children: [textNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

function trimText(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim()
}

function splitPlainText(text: string): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  let parts = trimmed.split(/\n\s*\n+/).map((s) => s.trim()).filter(Boolean)
  if (parts.length <= 1 && trimmed.includes('\n')) {
    parts = trimmed.split(/\n/).map((s) => s.trim()).filter(Boolean)
  }

  return parts.map((s) => s.replace(/\s+/g, ' '))
}

function isParagraphOnlyStrong(el: Element): boolean {
  const strong = el.querySelector('strong, b')
  if (!strong) return false

  const full = trimText(el.textContent)
  const strongText = trimText(strong.textContent)
  if (!full || full !== strongText) return false

  const elements = [...el.children]
  return elements.every((child) => {
    const tag = child.tagName.toLowerCase()
    return tag === 'strong' || tag === 'b'
  })
}

function isStandaloneStrong(el: Element): boolean {
  const tag = el.tagName.toLowerCase()
  if (tag !== 'strong' && tag !== 'b') return false
  return trimText(el.textContent).length > 0
}

function parseInlineNodes(parent: Element): LexicalTextNode[] {
  const nodes: LexicalTextNode[] = []

  for (const child of parent.childNodes) {
    if (child.nodeType === 3) {
      const text = child.textContent || ''
      if (text) nodes.push(textNode(text))
      continue
    }

    if (child.nodeType !== 1) continue

    const el = child as Element
    const tag = el.tagName.toLowerCase()

    if (tag === 'strong' || tag === 'b') {
      const t = el.textContent || ''
      if (t) nodes.push(textNode(t, FORMAT_BOLD))
    } else if (tag === 'em' || tag === 'i') {
      const t = el.textContent || ''
      if (t) nodes.push(textNode(t, FORMAT_ITALIC))
    } else if (tag === 'br') {
      continue
    } else {
      nodes.push(...parseInlineNodes(el))
    }
  }

  return nodes.filter((n) => n.text.length > 0)
}

const SKIP_TAGS = new Set([
  'script',
  'style',
  'blockquote',
  'iframe',
  'noscript',
  'img',
])

const CONTAINER_TAGS = new Set(['div', 'article', 'section', 'main', 'header', 'footer'])

function appendPlainText(text: string, blocks: LexicalBlock[]) {
  for (const part of splitPlainText(text)) {
    blocks.push(paragraph([textNode(part)]))
  }
}

function walkNodes(parent: Element, blocks: LexicalBlock[]) {
  for (const node of parent.childNodes) {
    if (node.nodeType === 3) {
      appendPlainText(node.textContent || '', blocks)
      continue
    }

    if (node.nodeType !== 1) continue

    const el = node as Element
    const tag = el.tagName.toLowerCase()

    if (SKIP_TAGS.has(tag)) continue

    if (tag === 'strong' || tag === 'b') {
      if (isStandaloneStrong(el)) {
        const text = trimText(el.textContent)
        if (text) blocks.push(heading('h3', text))
      }
      continue
    }

    if (tag === 'h2' || tag === 'h3' || tag === 'h4') {
      const text = trimText(el.textContent)
      if (text) blocks.push(heading(tag, text))
      continue
    }

    if (tag === 'p') {
      if (isParagraphOnlyStrong(el)) {
        const text = trimText(el.querySelector('strong, b')?.textContent || el.textContent)
        if (text) blocks.push(heading('h3', text))
      } else {
        const inline = parseInlineNodes(el)
        if (inline.length) blocks.push(paragraph(inline))
      }
      continue
    }

    if (tag === 'li') {
      const inline = parseInlineNodes(el)
      if (inline.length) blocks.push(paragraph(inline))
      continue
    }

    if (CONTAINER_TAGS.has(tag)) {
      walkNodes(el, blocks)
      continue
    }

    if (tag === 'br') continue

    const nestedBlocks = el.querySelector('p, h2, h3, h4, strong, b, li')
    if (nestedBlocks) {
      walkNodes(el, blocks)
    } else {
      const text = trimText(el.textContent)
      if (text) appendPlainText(text, blocks)
    }
  }
}

function sanitizeDocument(doc: Document) {
  for (const selector of ['script', 'style', 'blockquote', 'iframe', 'noscript']) {
    doc.querySelectorAll(selector).forEach((el) => el.remove())
  }
}

/**
 * Converts HTML to a Lexical-compatible JSON structure for Payload CMS.
 * Handles WordPress exports: plain text blocks, standalone strong section titles, and inline bold.
 */
export async function htmlToLexical(html: string): Promise<Post['content']> {
  const dom = new JSDOM(html || '<p></p>')
  const doc = dom.window.document
  sanitizeDocument(doc)

  const body = doc.body
  const children: LexicalBlock[] = []

  walkNodes(body, children)

  if (!children.length) {
    const text = trimText(body.textContent)
    if (text) {
      for (const part of splitPlainText(text)) {
        children.push(paragraph([textNode(part)]))
      }
    }
  }

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}
