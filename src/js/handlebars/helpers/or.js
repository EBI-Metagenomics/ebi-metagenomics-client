module.exports = function(a, b) {
    return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
};
