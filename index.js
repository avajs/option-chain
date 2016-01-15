'use strict';
var objectAssign = require('object-assign');

module.exports = function (options) {
	var chainables = options.chainables || {};

	return function (fn, target) {
		function wrap(createOpts, extensionOpts) {
			function wrappedOpts() {
				return objectAssign(createOpts(), extensionOpts);
			}

			function wrappedFn() {
				var args = Array.prototype.slice.call(arguments);
				return fn(wrappedOpts(), args);
			}

			Object.keys(chainables).forEach(function (key) {
				Object.defineProperty(wrappedFn, key, {
					enumerable: true,
					configurable: true,
					get: function () {
						return wrap(wrappedOpts, chainables[key]);
					}
				});
			});

			return wrappedFn;
		}

		var ret = wrap(function () {
			return objectAssign({}, options.defaults);
		});

		if (target) {
			objectAssign(target, ret);
		}

		return ret;
	};
};
