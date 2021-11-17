module.exports = function(singular, plural, options) {
    let amount = options.fn(this);
    if (amount == 1) {
        return singular;
    }
    return plural;
};
