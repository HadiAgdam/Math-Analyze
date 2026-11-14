import { useMemo } from 'react'
import katex from 'katex'

export default function MathFormula({ children, block = true, className = '' }) {
  const html = useMemo(() => katex.renderToString(String(children ?? ''), { displayMode: block, throwOnError: false, errorColor: 'var(--theme-link)', trust: false, strict: 'ignore' }), [children, block])
  return <span dir="ltr" className={`math ${block ? 'math-block' : ''} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
}
