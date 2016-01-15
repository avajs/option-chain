'use strict';
var objectAssign = require('object-assign');

module.exports = function (options) {
	var chainables = options.chainables || {};

	return function (target, fn) {
		fn = fn || target;

		function wrap(createOpts, extensionOpts) {
			function wrappedOpts() {
				return objectAssign(createOpts(), extensionOpts);
			}

			function wrappedFn() {
				var args = Array.prototype.slice.call(arguments);
				fn(wrappedOpts(), args);
			}

			Object.keys(chainables).forEach(function (key) {
				Object.defineProperty(wrappedFn, key, {
					get: function () {
						return wrap(wrappedOpts, chainables[key]);
					}
				});
			});

			return wrappedFn;
		}

		return wrap(function () {
			return objectAssign({}, options.defaults);
		});
	};
};
