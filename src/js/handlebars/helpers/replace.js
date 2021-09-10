module.exports = function(target, replacement, options) {
    let string = options.fn(this);
    if (!string) {
        return string;
    }
    return string.replace(target, replacement);
};
