module.exports = function(...args) {
    return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
};
