/*
 * frameworkContext.js
 */

// Private
var context = {}

function setContext(key, value) {
    context[key] = value;
}

function getContext(key) {
    return context[key];
}

// Public
module.exports = {
    setContext: setContext,
    getContext: getContext

};