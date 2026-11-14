import test from 'node:test'
import assert from 'node:assert/strict'
import katex from 'katex'
import { solveAnalysis, solveProblem } from '../src/math/analysisSolver.js'
import { proofMath as m, parseExpression } from '../src/math/solver.js'
import { domainBarriers, domainRadius, rationalAt, witnessDelta, positive, less } from '../src/math/proofCertificates.js'
import { analysisExamples, proofReferences } from '../src/content/proofMethods.js'

const cases = [
  ['(x^2-4)/(x-2)', '2', '4', 'epsilon'],
  ['3*x', '2', '6', 'epsilon'],
  ['x^2', '-2', '4', 'epsilon'],
  ['(x^2-1/9)/(x-1/3)', '1/3', '\\frac{2}{3}', 'epsilon'],
  ['0/x', '0', '0', 'epsilon'],
  ['1/(1/x)', '0', '0', 'epsilon'],
  ['1/x^2', '0', '+\\infty', 'epsilon'],
  ['-1/(x-2)^4', '2', '-\\infty', 'epsilon'],
  ['(2*x^2+1)/(x^2-3)', 'Infinity', '2', 'epsilon'],
  ['1/x', '-Infinity', '0', 'epsilon'],
  ['x^3', '-Infinity', '-\\infty', 'epsilon'],
  ['0/x', 'Infinity', '0', 'epsilon'],
  ['x*sin(1/x)', '0', '0', 'squeeze'],
  ['x^2*cos(1/x^2)', '0', '0', 'squeeze'],
  ['sin(x)/x', 'Infinity', '0', 'squeeze'],
  ['sin(x)/x', '0', '1', 'squeeze'],
  ['sin(-2*x)/x', '0', '-2', 'epsilon'],
  ['sin(0*x)/x', '0', '0', 'epsilon'],
  ['floor(x^2)', '0', '0', 'epsilon'],
  ['floor(-x^2)', '0', '-1', 'epsilon'],
  ['floor(x+1/2)', '0', '0', 'epsilon'],
  ['floor(x-1/2)', '0', '-1', 'epsilon'],
  ['rationalSplit(x)', '0', '0', 'squeeze']
]

for (const [expression, point, expected, method] of cases) test(`analysis: ${expression} → ${point} by ${method}`, () => {
  const r = solveAnalysis(expression, point, 'x', { method })
  assert.equal(r.status, 'solved', r.message)
  assert.equal(r.result, expected)
  assert.equal(r.rigorous, true)
  assert.ok(r.methods.includes(method))
  assert.ok(r.steps.every(s => s.title && s.text))
  for (const s of r.steps) if (s.math) assert.doesNotThrow(() => katex.renderToString(s.math, { throwOnError: true, strict: false }), s.math)
})

test('epsilon certificates satisfy exact polynomial error inequalities', () => {
  for (const [expression, point] of cases.filter(c => c[3] === 'epsilon' && !c[1].includes('Infinity') && !c[0].includes('sin') && !c[0].includes('floor') && !c[0].includes('1/x^2') && !c[0].includes('^4'))) {
    const parsed = parseExpression(expression), a = m.asRational(parseExpression(point).tree, 'x')
    const at = m.div(a.p[0], a.q[0])
    const rational = m.asRational(parsed.tree, 'x')
    const certificate = rationalAt(rational, at, domainRadius(domainBarriers(parsed.tree, 'x'), at))
    assert.equal(certificate.kind, 'finite')
    assert.ok(m.zero(m.peval(certificate.error, at)))
    for (const eps of [m.rat(1, 1000), m.rat(1), m.rat(100)]) {
      const delta = witnessDelta(certificate, eps)
      assert.ok(delta.n > 0n)
      for (const side of [-1, 1]) for (const divisor of [2, 7, 100]) {
        const h = m.mul(m.rat(side, divisor), delta)
        const x = m.add(at, h), qx = m.peval(certificate.q, x)
        assert.ok(!m.zero(qx))
        const error = positive(m.sub(m.div(m.peval(certificate.p, x), qx), certificate.limit))
        assert.ok(less(error, eps), expression)
        assert.ok(!less(m.mul(certificate.c, positive(h)), error), expression)
      }
    }
  }
})

test('domain bounds retain holes hidden by algebraic cancellation', () => {
  const r = solveAnalysis('(1/(x-1))/(1/(x-1))', '1')
  assert.equal(r.result, '1')
  assert.equal(r.functionValue, null)
  assert.equal(r.continuity.classification, 'removable-hole')
  const far = solveAnalysis('(1/(x-1000))/(1/(x-1000))', 'Infinity')
  assert.equal(far.result, '1')
  assert.ok(!less(m.rat(1, 1001), far.certificate.radius))
})

test('proof notation retains inequality symbols and named subproblems', () => {
  const r = solveAnalysis('(x^2-4)/(x-2)', '2')
  const bound = r.steps.find(s => s.title === 'برآورد تغییر چندجمله‌ای‌ها با نامساوی')
  assert.ok(bound.math.includes('\\le'))
  assert.ok(bound.math.includes('\\qquad'))
  const composition = solveAnalysis('sin(x^2)+sqrt(x+1)', '0')
  assert.ok(composition.steps.some(s => s.math?.includes('\\phi(x)=')))
  const infinite = solveAnalysis('x^3', 'Infinity')
  assert.ok(infinite.steps.some(s => s.math?.includes('0<|t-(0)|')))
})

test('pole proofs contain an actual bound and M-dependent delta', () => {
  const r = solveAnalysis('-2/(x-3)^3', '3')
  assert.equal(r.status, 'dne')
  assert.equal(r.left, '+\\infty')
  assert.equal(r.right, '-\\infty')
  assert.ok(r.steps.some(s => s.math?.includes('M')))
  assert.ok(r.certificate.lower.n > 0n)
  const right = solveAnalysis('-2/(x-3)^3', '3', 'x', { direction: 'right' })
  assert.equal(right.result, '-\\infty')
})

test('sequential counterexamples respect the requested side', () => {
  for (const expr of ['sin(1/x)', 'cos(1/x)', 'dirichlet(x)']) for (const direction of ['both', 'left', 'right']) {
    const r = solveAnalysis(expr, '0', 'x', { direction, method: 'sequential' })
    assert.equal(r.status, 'dne')
    assert.equal(r.rigorous, true)
    for (const s of r.steps) if (s.math) assert.doesNotThrow(() => katex.renderToString(s.math, { throwOnError: true, strict: false }))
  }
  const left = solveAnalysis('sin(1/x)', '0', 'x', { direction: 'left' })
  assert.ok(left.steps.some(s => s.math?.includes('x_n=-')))
  assert.equal(solveAnalysis('abs(x)/x', '0', 'x', { direction: 'right', method: 'epsilon' }).result, '1')
})

test('continuity uses a two-sided proof and exact point values', () => {
  const options = { task: 'continuity' }
  assert.equal(solveAnalysis('x^2', '2', 'x', options).continuity.classification, 'continuous')
  assert.equal(solveAnalysis('(x^2-4)/(x-2)', '2', 'x', options).continuity.classification, 'removable-hole')
  assert.equal(solveAnalysis('(x^2-4)/(x-2)', '2', 'x', { ...options, pointValue: '4' }).continuity.classification, 'continuous')
  assert.equal(solveAnalysis('(x^2-4)/(x-2)', '2', 'x', { ...options, pointValue: '7' }).continuity.classification, 'removable')
  assert.equal(solveAnalysis('floor(x)', '0', 'x', options).continuity.classification, 'jump')
  assert.equal(solveAnalysis('floor(-x^2)', '0', 'x', options).continuity.classification, 'removable')
  assert.equal(solveAnalysis('floor(x^2)', '0', 'x', options).continuity.classification, 'continuous')
  assert.equal(solveAnalysis('x*sin(1/x)', '0', 'x', { ...options, pointValue: '0' }).continuity.classification, 'continuous')
  assert.equal(solveAnalysis('sin(1/x)', '0', 'x', { ...options, pointValue: '0' }).continuity.classification, 'second-kind')
  assert.equal(solveAnalysis('rationalSplit(x)', '0', 'x', options).continuity.classification, 'continuous')
  assert.equal(solveAnalysis('rationalSplit(x)', '1', 'x', options).continuity.classification, 'second-kind')
  assert.equal(solveAnalysis('x', '0', 'x', { ...options, pointValue: '0.00000000000000000001' }).continuity.classification, 'removable')
  assert.equal(solveAnalysis('1/x', '0', 'x', { ...options, direction: 'right' }).direction, 'both')
})

test('composition verifies hypotheses symbolically instead of testing a number', () => {
  const r = solveAnalysis('sin(x^2)+sqrt(x+1)', '0', 'x', { task: 'continuity', method: 'theorems' })
  assert.equal(r.status, 'solved')
  assert.equal(r.continuity.status, 'continuous')
  assert.ok(r.steps.some(s => s.title.includes('ترکیب')))
  assert.equal(solveAnalysis('1/sin(x)', '0').status, 'unsupported')
  assert.equal(solveAnalysis('1/sin(x)', '1').status, 'unsupported')
  assert.equal(solveAnalysis('sqrt(x)', '-1').status, 'unsupported')
  assert.equal(solveAnalysis('log(x)', '0').status, 'unsupported')
  assert.equal(solveAnalysis('sin(x)', '1', 'x', { method: 'epsilon' }).status, 'unsupported')
  const unknown = solveAnalysis('sin(x)', '1', 'x', { task: 'continuity', pointValue: '1' })
  assert.equal(unknown.status, 'unsupported')
  assert.equal(unknown.continuity.status, 'unknown')
})

test('analysis never silently falls back to a computational answer', () => {
  const r = solveProblem('(exp(x)-1)/x', '0', 'x', { method: 'auto' })
  assert.equal(r.computational.status, 'solved')
  assert.equal(r.analysis.status, 'unsupported')
  assert.equal(r.analysis.rigorous, false)
  assert.equal(solveAnalysis('x^2', '0', 'x', { method: 'sequential' }).status, 'unsupported')
  assert.equal(solveProblem('dirichlet(x)', '0', 'x').computational.status, 'unsupported')
  assert.equal(solveAnalysis('x', 'pi').status, 'unsupported')
  assert.equal(solveAnalysis('x', 'Infinity', 'x', { direction: 'left' }).direction, 'both')
  assert.equal(solveAnalysis('x', 'Infinity', 'x', { task: 'continuity' }).status, 'error')
})

test('all example proofs and continuity statements render as valid KaTeX', () => {
  for (const example of analysisExamples) {
    const r = solveAnalysis(example.expression, example.point, 'x', example)
    assert.ok(['solved', 'dne'].includes(r.status), `${example.label}: ${r.message}`)
    for (const s of r.steps) if (s.math) assert.doesNotThrow(() => katex.renderToString(s.math, { throwOnError: true, strict: false }), s.math)
    for (const ref of r.references) assert.ok(proofReferences[ref.id])
  }
  const t = solveAnalysis('(t^2-4)/(t-2)', '2', 't')
  assert.equal(t.result, '4')
  assert.ok(!t.steps.some(s => s.math?.includes('f(x)')))
})
