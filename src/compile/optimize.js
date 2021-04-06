function optimize(brainF, n = 0) {
    brainF = brainF.replace(/\[\]/g, "");

    const inversePairs = (achar, bchar) => brainF.replace(new RegExp(`(\\${achar}+)(\\${bchar}+)`, "g"), (_, a, b) => {
        if (a.length > b.length) {
            return achar.repeat(a.length - b.length);
        } else {
            return bchar.repeat(b.length - a.length);
        }
    });

    brainF = inversePairs(">", "<");
    brainF = inversePairs("<", ">");
    brainF = inversePairs("+", "-");
    brainF = inversePairs("-", "+");
    brainF = inversePairs("[", "]");

    return n === 0 ? brainF : optimize(brainF, n - 1);
}

module.exports = function(input) {
    let brainF = input.replace(/(.*) # .+/g, "$1");
    brainF = brainF.replace(/[^<>+,\.\[\]+\-]/g, "");

    return optimize(brainF, 15);
};