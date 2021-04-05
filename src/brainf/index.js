const simpleNumber = (a, b) => {
    if (a > b) {
        return "-".repeat(a - b);
    } else {
        return "+".repeat(b - a);
    }
};

const changeCells = (start, end) => {
    return start.map((value, index) =>
        simpleNumber(value, end[index])
    ).join(">");
};

module.exports = {simpleNumber, changeCells};