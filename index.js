const valueParser = require("postcss-value-parser");
const {lab2rgb} = require("@csstools/convert-colors");

/**
 * @param {{preserve?: boolean}} opts
 * @returns {import('postcss').Plugin}
 */
module.exports = function creator(opts) {
	const preserve = Boolean(Object(opts).preserve);

	return {
		postcssPlugin: 'postcss-color-gray',
		// walk all declarations likely containing a gray() function
		Declaration(decl) {
			if (hasGrayFunction(decl)) {
				const { value: originalValue } = decl;

				// parse the declaration value
				const ast = valueParser(originalValue);

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

						node.nodes = [
							{
								type: 'word',
								value: `${r}`,
							},
							{
								type: 'div',
								value: ',',
							},
							{
								type: 'word',
								value: `${g}`,
							},
							{
								type: 'div',
								value: ',',
							},
							{
								type: 'word',
								value: `${b}`,
							},
						];

						// if an alpha channel was defined
						if (alpha < 1) {
							// rename the rgb() function to rgba()
							node.value += 'a';

							node.nodes.push({
								type: 'div',
								value: ',',
							})

							node.nodes.push({
								type: 'word',
								value: `${alpha}`,
							});
						}
					}
				});

				const modifiedValue = ast.toString();

				// if the modified value has changed from the original value
				if (originalValue !== modifiedValue) {
					// if the original gray() color is to be preserved
					if (preserve) {
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
		}
	}
}

module.exports.postcss = true;

// return whether a string contains a gray() function
const hasGrayFunctionRegExp = /(^|[^\w-])gray\(/i;
const hasGrayFunction = decl => hasGrayFunctionRegExp.test(Object(decl).value);

// return whether a node matches a specific type
const isNumber = node => Object(node).type === 'word';
const isOperator = node => Object(node).type === 'div';
const isFunction = node => Object(node).type === 'function';
const isFunctionCalc = node => isFunction(node) && node.value === 'calc';
const isNumberPercentage = node => isNumber(node) && unit(node).unit === '%';
const isNumberUnitless = node => isNumber(node) && unit(node).unit === '';
const isOperatorSlash = node => isOperator(node) && node.value === '/';

// return valid values from a node, otherwise undefined
const getNumberUnitless = node => isNumberUnitless(node) ? Number(node.value) : undefined;
const getOperatorSlash = node => isOperatorSlash(node) ? null : undefined;
const getAlpha = node => isFunctionCalc(node)
	? String(node)
: isNumberUnitless(node)
	? Number(node.value)
: isNumberPercentage(node)
	? Number(unit(node).number) / 100
: undefined;

// return valid arguments from a gray() function
const functionalGrayArgs = [getNumberUnitless, getOperatorSlash, getAlpha];
const getFunctionGrayArgs = node => {
	const validArgs = [];

	// if the node is a gray() function with arguments
	if (node.value === 'gray' && node.type === 'function' && node.nodes && node.nodes.length) {
		// get all the gray() function arguments between `(` and `)`
		const nodes = node.nodes;

		// validate each argument
		for (const index in nodes) {
			const arg = typeof functionalGrayArgs[index] === 'function'
				? functionalGrayArgs[index](nodes[index])
				: undefined;

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

function unit(node) {
	let fallback = {
		number: node.value,
		unit: ''
	};

	try {
		const u = valueParser.unit(node.value);
		if (!u) {
			return fallback;
		}

		return u;
	} catch (_) {
		return fallback;
	}
}
