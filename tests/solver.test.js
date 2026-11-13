import test from 'node:test'
import assert from 'node:assert/strict'
import katex from 'katex'
import { createEvaluator, factorExpression, solveLimit } from '../src/math/solver.js'
import { formulas, lessons } from '../src/content/course.js'

const cases = [
  ['(x^2-4)/(x-2)', '2', '4'],
  ['(x^3-8)/(x-2)', '2', '12'],
  ['(x^2-1)/(x-1)', '1', '2'],
  ['(x^2-2x+1)/(x-1)', '1', '0'],
  ['(x^3)/(x^2)', '0', '0'],
  ['(x-1)^2/(x-1)^2', '1', '1'],
  ['0/x', '0', '0'],
  ['1/(1/x)', '0', '0'],
  ['x/x-x/x', '0', '0'],
  ['(x^2-1/9)/(x-1/3)', '1/3', '\\frac{2}{3}'],
  ['(0.1*x-0.02)/(x-0.2)', '0.2', '\\frac{1}{10}'],
  ['x^2+2x+1', '3', '16'],
  ['(x+1)/(x+3)', '2', '\\frac{3}{5}'],
  ['1/x^2', '0', '+\\infty'],
  ['-1/(x-1)^4', '1', '-\\infty'],
  ['sin(x)/x', '0', '1'],
  ['sin(3x)/x', '0', '3'],
  ['sin(-2x)/x', '0', '-2'],
  ['sin(x/2)/x', '0', '\\frac{1}{2}'],
  ['sin(0x)/x', '0', '0'],
  ['(1-cos(x))/x^2', '0', '\\frac{1}{2}'],
  ['(1-cos(2x))/x^2', '0', '2'],
  ['(exp(x)-1)/x', '0', '1'],
  ['(exp(-3x)-1)/x', '0', '-3'],
  ['log(1+x)/x', '0', '1'],
  ['log(1+2x)/x', '0', '2'],
  ['(2x^2+1)/(x^2-3)', 'Infinity', '2'],
  ['(x+1)/(x^2+1)', '-Infinity', '0'],
  ['x^3', '-Infinity', '-\\infty'],
  ['-x^2', '-Infinity', '-\\infty'],
  ['0/x', 'Infinity', '0']
]

for (const [expression, point, expected] of cases) test(`${expression}, x → ${point}`, () => {
  const result = solveLimit(expression, point)
  assert.equal(result.status, 'solved', JSON.stringify(result))
  assert.equal(result.result, expected)
  for (const step of result.steps) if (step.math) assert.doesNotThrow(() => katex.renderToString(step.math, { throwOnError: true, strict: false }))
})

test('one-sided rational poles use multiplicity and sign', () => {
  const r = solveLimit('-2/(x-3)^3', '3')
  assert.equal(r.status, 'dne')
  assert.equal(r.left, '+\\infty')
  assert.equal(r.right, '-\\infty')
  assert.equal(solveLimit('1/x', '0', 'x', 'left').result, '-\\infty')
  assert.equal(solveLimit('1/x', '0', 'x', 'right').result, '+\\infty')
})

test('jump and oscillation never become numerical limits', () => {
  const jump = solveLimit('abs(x)/x', '0')
  assert.equal(jump.status, 'dne')
  assert.equal(jump.left, '-1')
  assert.equal(jump.right, '1')
  assert.equal(solveLimit('abs(x)/x', '0', 'x', 'right').result, '1')
  for (const f of ['sin(1/x)', 'cos(1/x)']) for (const dir of ['both', 'left', 'right']) assert.equal(solveLimit(f, '0', 'x', dir).status, 'dne')
  for (const step of jump.steps) assert.doesNotThrow(() => katex.renderToString(step.math, { throwOnError: true, strict: false }))
})

test('continuous compositions and non-default variables', () => {
  assert.equal(solveLimit('sin(x)+sqrt(x)+log(x)', '1').status, 'solved')
  assert.equal(solveLimit('(t^2-4)/(t-2)', '2', 't').result, '4')
  assert.equal(solveLimit('cos(x)', 'pi').status, 'solved')
  assert.equal(solveLimit('x²-۴', '۲').result, '0')
})

test('unsupported singularities are explicitly declined', () => {
  for (const f of ['sqrt(x)', '(sqrt(x+1)-1)/x', 'floor(x)', 'exp(1/x)', 'sin(x)/x^2', '1/sin(pi)']) assert.equal(solveLimit(f, '0').status, 'unsupported', f)
  assert.equal(solveLimit('sin(x)', 'Infinity').status, 'unsupported')
})

test('invalid domains and unsafe or excessive inputs are rejected', () => {
  for (const f of ['1/0', '1/(x-x)', '(1/0)^0', '0^0', '0^-1', 'x=2', 'import("bad")', 'x[0]', 'x^100', 'y+1', 'sin(', 'factorial(999)', 'x;2']) assert.equal(solveLimit(f, '0').status, 'error', f)
  assert.equal(solveLimit('x', 'x').status, 'error')
  assert.equal(solveLimit('x', 'NaN').status, 'error')
  assert.equal(solveLimit('x', '2', 'e').status, 'error')
})

test('function values preserve holes and graph stays real-valued', () => {
  const f = createEvaluator('(x^2-4)/(x-2)')
  assert.equal(f(2), null)
  assert.equal(f(3), 5)
  assert.equal(createEvaluator('sqrt(x)')(-1), null)
  assert.equal(createEvaluator('1/x')(0), null)
  assert.ok(!Number.isFinite(solveLimit('(x^2-4)/(x-2)', '2').functionValue))
})

test('displayed symbolic factorization retains polynomial powers', () => {
  const factor = factorExpression('x^2-4')
  assert.ok(factor && factor.includes('2'))
  assert.equal(factorExpression('x^{2}-4'), null)
  const step = solveLimit('(x^2-4)/(x-2)', '2').steps.find(s => s.title === 'تجزیهٔ صورت')
  assert.ok(step.math.includes('2'))
  assert.ok(step.math.includes('x'))
})

test('all educational mathematics is valid KaTeX', () => {
  const all = formulas.flatMap(f => [f.math, f.example]).concat(lessons.flatMap(l => [...l.blocks.map(b => b.math), l.example?.math]))
  for (const math of all.filter(Boolean)) assert.doesNotThrow(() => katex.renderToString(math, { throwOnError: true, strict: false }), math)
  assert.equal(new Set(lessons.map(l => l.id)).size, lessons.length)
  assert.ok(lessons.every(l => l.source && l.exercise))
})
