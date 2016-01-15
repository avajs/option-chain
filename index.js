'use strict';
var objectAssign = require('object-assign');

module.exports = function (options) {
	var chainables = options.chainables || {};

	return function (fn, target) {
		function wrap(createOpts, extensionOpts, ctx) {
			function wrappedOpts() {
				return objectAssign(createOpts(), extensionOpts);
			}

			function wrappedFn() {
				var args = Array.prototype.slice.call(arguments);
				return fn.call(ctx || this, wrappedOpts(), args);
			}

			Object.keys(chainables).forEach(function (key) {
				Object.defineProperty(wrappedFn, key, {
					enumerable: true,
					configurable: true,
					get: function () {
						return wrap(wrappedOpts, chainables[key], ctx || this);
					}
				});
			});

			return wrappedFn;
		}

		function copyDefaults() {
			return objectAssign({}, options.defaults);
		}

		if (target) {
			Object.keys(chainables).forEach(function (key) {
				Object.defineProperty(target, key, {
					enumerable: true,
					configurable: true,
					get: function () {
						return wrap(copyDefaults, chainables[key], this);
					}
				});
			});
		}

		return wrap(copyDefaults);
	};
};
