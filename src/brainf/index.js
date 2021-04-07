const getFromZero = require("./getFromZero.json");

const simpleNumber = (a, b) => {
    if (a > b) {
        return "-".repeat(a - b);
    } else {
        return "+".repeat(b - a);
    }
};

const number = (a, b) => {
    let result = "";
    if (a !== 0) result += "[-]\n";
    const digits = b.toString().split("").map(n => parseInt(n));
    result += digits.map(d => "+".repeat(d)).join("[>++++++++++<-]>");
    return result;
};

const changeCells = (start, end) => {
    return start.map((value, index) =>
        simpleNumber(value, end[index])
    ).join(">");
};

module.exports = {simpleNumber, changeCells, number};