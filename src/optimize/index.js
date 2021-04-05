module.exports = function(input) {
    let brainF = input.replace(/[^<>+,\.\[\]+\-]/g, "");

    brainF = brainF
            .replace(/<>/g, "")
            .replace(/\+-/g, "")
            .replace(/-\+/g, "")
            .replace(/\[\]/g, "")
            .replace(/></g, "");

    return brainF;
};