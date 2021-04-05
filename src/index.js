const parser = require("./parser"),
	compile = require("./compile"),
	optimize =  require("./optimize"),
	path = require("path");

const {inspect} = require("util"),
    fs = require("fs"),
	deepLog = obj => console.log(inspect(obj, {depth: Infinity, colors: true}));

const code = fs.readFileSync(path.resolve(__dirname, "../bfcode/src.bf"), "utf-8"),
	  result = parser(code);

if (result.isError) throw result.error;
const compiled = compile(result.result);

fs.writeFileSync(path.resolve(__dirname, "../bfcode/compiled.bf"), compiled);
fs.writeFileSync(path.resolve(__dirname, "../bfcode/result.bf"), optimize(compiled));