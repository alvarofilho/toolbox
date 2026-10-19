import { field } from '@app/core/models/tool';

import { result, tool } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

function evaluateExpression(expression: string): number {
	if (expression.length > 256) {
		throw new Error('Expressão longa demais / Expression is too long');
	}
	const tokens = expression.match(/\d+(?:\.\d+)?|[()+\-*/^]/g) ?? [];
	if (tokens.join('') !== expression.replace(/\s/g, '') || tokens.length > 128) {
		throw new Error(
			'Use números e operadores +, -, *, /, ^ e parênteses / Use numbers and basic operators',
		);
	}
	let position = 0;
	let depth = 0;
	const take = () => tokens[position++];
	const expressionValue = (): number => {
		let value = term();
		while (tokens[position] === '+' || tokens[position] === '-') {
			const operator = take();
			const right = term();
			value = operator === '+' ? value + right : value - right;
		}
		return value;
	};
	const term = (): number => {
		let value = power();
		while (tokens[position] === '*' || tokens[position] === '/') {
			const operator = take();
			const right = power();
			if (operator === '/' && right === 0) {
				throw new Error('Divisão por zero / Division by zero');
			}
			value = operator === '*' ? value * right : value / right;
		}
		return value;
	};
	const power = (): number => {
		const value = primary();
		if (tokens[position] === '^') {
			take();
			return value ** unary();
		}
		return value;
	};
	const unary = (): number => {
		if (tokens[position] === '+') {
			take();
			return unary();
		}
		if (tokens[position] === '-') {
			take();
			return -unary();
		}
		return power();
	};
	const primary = (): number => {
		if (tokens[position] === '(') {
			take();
			if (++depth > 32) {
				throw new Error('Parênteses aninhados demais / Too many nested parentheses');
			}
			const value = expressionValue();
			depth--;
			if (take() !== ')') {
				throw new Error('Parênteses não fechados / Unclosed parentheses');
			}
			return value;
		}
		const token = take();
		if (!token || !/^\d+(?:\.\d+)?$/.test(token)) {
			throw new Error('Número esperado / Expected a number');
		}
		return Number(token);
	};
	if (!tokens.length) {
		throw new Error('Informe uma expressão / Enter an expression');
	}
	const value = expressionValue();
	if (position !== tokens.length || !Number.isFinite(value)) {
		throw new Error(
			'Expressão inválida ou resultado não finito / Invalid expression or non-finite result',
		);
	}
	return value;
}

export const definition = tool('math-evaluator', [source], (v) =>
	result({ value: evaluateExpression(field(v, 'input')) }),
);
