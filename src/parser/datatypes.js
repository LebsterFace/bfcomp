const A = require("arcsecond"),
      { char, boolean, number, string } = require("./common");

const types = {
    byte: {
        parser: number,
        size: 1,
        toCells: v => [v]
    },
    char: {
        parser: char,
        size: 1,
        toCells: v => [v]
    },
    boolean: {
        parser: boolean,
        size: 1,
        toCells: v => [v]
    },
    string: {
        parser: string,
        size: null,
        toCells: str => [...str].map(c => c.charCodeAt(0))
    }
};

const dataType = A.choice(Object.keys(types).map(A.str));

const valueParser = type => {
    if (type in types) {
        return types[type].parser;
    } else {
        return A.fail("Unknown type '" + type + "'!");
    }
};

module.exports = {types, dataType, valueParser};