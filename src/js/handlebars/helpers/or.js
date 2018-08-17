module.exports = function(...args) {
    return Array.prototype.slice.call(args, 0, -1).some(Boolean);
};
