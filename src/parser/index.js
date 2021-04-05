const A = require("arcsecond"),
	{dataType, valueParser, types} = require("./datatypes"),
	{identifier, primitive} = require("./common"),
	{asType} = require("./util");

const variables = {};

const invocation = A.sequenceOf([
	A.letters, A.whitespace,
	A.sepBy(A.sequenceOf([A.char(","), A.optionalWhitespace]))(identifier)
]).map(([keyword ,, args]) => ({keyword, args})).map(asType("INVOCATION"));

const declaration = A.coroutine(function*() {
	const valueDataType = yield dataType;
	yield A.whitespace;
	
	const name = (yield identifier).value;
	
	yield A.optionalWhitespace;
	yield A.char("=");
	yield A.optionalWhitespace;
	
	if (name in variables) return A.fail(`Duplicate variable '${name}'`);
	const valParser = valueParser(valueDataType);
	variables[name] = { name, valParser, valueDataType };

	const value = yield valParser;

	return { name, value, valueDataType };
}).map(asType("DECLARATION"));

const assignment = A.coroutine(function*() {
	const existingVarNames = Object.values(variables).map(obj => A.str(obj.name));
	if (existingVarNames.length === 0) return A.fail("No existing variables");
	const name = yield A.choice(existingVarNames);
	
	yield A.optionalWhitespace;
	yield A.char("=");
	yield A.optionalWhitespace;

	const value = yield variables[name].valParser;
	return {name, value, valueDataType: variables[name].valueDataType};
}).map(asType("ASSIGNMENT"));

const statement = A.takeLeft(A.choice([
	declaration,
	assignment,
	invocation,
]))(A.char(";"));

module.exports = code =>
	A.coroutine(function*() {
		const results = [];

		while (true) {
			const out = yield A.possibly(statement);
			if (out === null) {
				yield A.endOfInput;
				return results;
			} else {
				results.push(out);
				yield A.optionalWhitespace;
			}
		}

	}).run(code);