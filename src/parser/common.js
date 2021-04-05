const A = require("arcsecond");
const { asType, inside, join } = require("./util");

const escapeableChar = char => A.choice([
	A.char("\\").chain(_ => A.anyChar),
	A.anyCharExcept(A.char(char))
]);

const number = A.digits.map(r => parseInt(r)).map(asType("NUMBER"));

const char = inside("'", "'")(escapeableChar("'")).map(r => r.charCodeAt(0))
			.map(asType("CHAR"));

const string = inside('"', '"')(A.many1(escapeableChar('"')))
                .map(a => a.join("")).map(v => ({
					type: "STRING",
					value: v,
					size: v.length
				}));
                
const boolean = A.regex(/^true|false/i).map(value => +(value.toLowerCase() === "true"))
                .map(asType("BOOLEAN"));
    
const identifier = A.regex(/^[$A-Z_][0-9A-Z_$]*/i).map(asType("IDENTIFIER"));
const primitive = A.choice([identifier, boolean, string, char, number]);

const parsingError = msg => {
	console.error(msg);
	process.exit(1);
};

module.exports = {
    primitive,
    char, string, boolean, number,
    identifier, parsingError
};
