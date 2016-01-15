'use strict';
var objectAssign = require('object-assign');

module.exports = function (options) {
	var chainables = options.chainables || {};

	return function (fn, target) {
		function extend(target, getter, ctx) {
			Object.keys(chainables).forEach(function (key) {
				Object.defineProperty(target, key, {
					enumerable: true,
					configurable: true,
					get: function () {
						return wrap(getter, chainables[key], ctx || this);
					}
				});
			});
		}

		function wrap(createOpts, extensionOpts, ctx) {
			function wrappedOpts() {
				return objectAssign(createOpts(), extensionOpts);
			}

			function wrappedFn() {
				var args = Array.prototype.slice.call(arguments);
				return fn.call(ctx || this, wrappedOpts(), args);
			}

			extend(wrappedFn, wrappedOpts, ctx);

			return wrappedFn;
		}

		function copyDefaults() {
			return objectAssign({}, options.defaults);
		}

		if (target) {
			extend(target, copyDefaults);
		}

		return wrap(copyDefaults);
	};
};
