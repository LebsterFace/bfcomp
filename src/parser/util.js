const A = require("arcsecond");

const asType = type => value => ({type, value}),
	inside = (char1, char2) => A.between(A.char(char1))(A.char(char2)),
	peek = A.peek.map(String.fromCharCode);

module.exports = {asType, inside, peek};