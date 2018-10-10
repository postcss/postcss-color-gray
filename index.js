import postcss from 'postcss';
import parser from 'postcss-values-parser';
import { lab2rgb } from '@csstools/convert-colors';

export default postcss.plugin('postcss-color-gray', opts => root => {
	// walk all declarations likely containing a gray() function
	root.walkDecls(decl => {
		if (hasGrayFunction(decl)) {
			const { value: originalValue } = decl;

			// parse the declaration value
			const ast = parser(originalValue).parse();

			// walk every node in the value that contains a gray() function
			ast.walk(node => {
				const [lightness, alpha] = getFunctionGrayArgs(node);

				if (lightness !== undefined) {
					// rename the gray() function to rgb()
					node.value = 'rgb';

					// convert the lab gray lightness into rgb
					const [r, g, b] = lab2rgb(lightness, 0, 0).map(
						channel => Math.max(Math.min(Math.round(channel * 2.55), 255), 0)
					);

					// preserve the slash nodes within rgb()
					const openingSlash = node.first;
					const closingSlash = node.last;

					node.removeAll()
					// replace the contents of rgb with `(r,g,b`
					.append(openingSlash)
					.append(parser.number({ value: r }))
					.append(parser.comma({ value: ',' }))
					.append(parser.number({ value: g }))
					.append(parser.comma({ value: ',' }))
					.append(parser.number({ value: b }))

					// if an alpha channel was defined
					if (alpha < 1) {
						// rename the rgb() function to rgba()
						node.value += 'a';

						node
						// append the contents of rgba with `,a`
						.append(parser.comma({ value: ',' }))
						.append(parser.number({ value: alpha }));
					}

					// append the contents of rgb/rgba with `)`
					node.append(closingSlash);
				}
			});

			const modifiedValue = ast.toString();

			// if the modified value has changed from the original value
			if (originalValue !== modifiedValue) {
				// if the original gray() color is to be preserved
				if (Object(opts).preserve) {
					// insert the declaration value with the fallback before the current declaration
					decl.cloneBefore({
						value: modifiedValue
					});
				} else {
					// otherwise, overwrite the declaration value with the fallback
					decl.value = modifiedValue;
				}
			}
		}
	});
});

// return whether a string contains a gray() function
const hasGrayFunctionRegExp = /(^|[^\w-])gray\(/i;
const hasGrayFunction = decl => hasGrayFunctionRegExp.test(Object(decl).value);

// return whether a node matches a specific type
const isNumber = node => Object(node).type === 'number';
const isOperator = node => Object(node).type === 'operator';
const isFunction = node => Object(node).type === 'func';
const isCalcRegExp = /^calc$/i;
const isFunctionCalc = node => isFunction(node) && isCalcRegExp.test(node.value);
const isGrayRegExp = /^gray$/i;
const isFunctionGrayWithArgs = node => isFunction(node) && isGrayRegExp.test(node.value) && node.nodes && node.nodes.length;
const isNumberPercentage = node => isNumber(node) && node.unit === '%';
const isNumberUnitless = node => isNumber(node) && node.unit === '';
const isOperatorSlash = node => isOperator(node) && node.value === '/';

// return valid values from a node, otherwise undefined
const getNumberUnitless = node => isNumberUnitless(node) ? Number(node.value) : undefined;
const getOperatorSlash = node => isOperatorSlash(node) ? null : undefined;
const getAlpha = node => isFunctionCalc(node)
	? String(node)
: isNumberUnitless(node)
	? Number(node.value)
: isNumberPercentage(node)
	? Number(node.value) / 100
: undefined;

// return valid arguments from a gray() function
const functionalGrayArgs = [getNumberUnitless, getOperatorSlash, getAlpha];
const getFunctionGrayArgs = node => {
	const validArgs = [];

	// if the node is a gray() function with arguments
	if (isFunctionGrayWithArgs(node)) {
		// get all the gray() function arguments between `(` and `)`
		const nodes = node.nodes.slice(1, -1);

		// validate each argument
		for (const index in nodes) {
			const arg = typeof functionalGrayArgs[index] === 'function' ? functionalGrayArgs[index](nodes[index]) : undefined;

			// if the argument was validated
			if (arg !== undefined) {
				// push any non-null argument to the valid arguments array
				if (arg !== null) {
					validArgs.push(arg);
				}
			} else {
				// otherwise, return an empty array
				return [];
			}
		}

		// return the valid arguments array
		return validArgs;
	} else {
		// otherwise, return an empty array
		return [];
	}
}
