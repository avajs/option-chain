import test from 'ava';
import fn from '.';

test('defaults and args are passed', t => {
	t.plan(2);

	fn({
		defaults: {foo: 'bar'}
	}, (opts, args) => {
		t.deepEqual(opts, {foo: 'bar'});
		t.deepEqual(args, ['uni', 'corn']);
	})('uni', 'corn');
});

test('chainableMethods extend the options passed', t => {
	t.plan(2);

	fn({
		defaults: {foo: 'bar'},
		chainableMethods: {
			moo: {cow: true}
		}
	}, (opts, args) => {
		t.deepEqual(opts, {foo: 'bar', cow: true});
		t.deepEqual(args, ['duck', 'goose']);
	}).moo('duck', 'goose');
});

test('last item in the chain takes precedence', t => {
	t.plan(4);

	const config = {
		chainableMethods: {
			foo: {foo: true},
			notFoo: {foo: false}
		}
	};

	let expected = true;

	function isExpected(opts) {
		t.is(opts.foo, expected);
	}

	const notFoo = fn(config, isExpected).notFoo;
	const foo = fn(config, isExpected).foo;

	foo();
	notFoo.foo();

	expected = false;

	notFoo();
	foo.notFoo();
});

test('can extend a target object', t => {
	const ctx = {};

	const result = fn({
		chainableMethods: {
			def: {},
			foo: {foo: true},
			notFoo: {foo: false},
			bar: {bar: true}
		}
	}, (opts, args) => [opts, args], ctx);

	t.is(result, ctx);
	t.deepEqual(ctx.def(), [{}, []]);
	t.deepEqual(ctx.foo('baz'), [{foo: true}, ['baz']]);
	t.deepEqual(ctx.notFoo('quz'), [{foo: false}, ['quz']]);
	t.deepEqual(ctx.bar.foo.notFoo(), [{foo: false, bar: true}, []]);
});

test('this is preserved', t => {
	const ctx = {};

	fn({
		chainableMethods: {
			def: {},
			foo: {foo: true},
			notFoo: {foo: false},
			bar: {bar: true}
		}
	}, function (opts) {
		t.is(this, ctx);
		return opts;
	}, ctx);

	t.deepEqual(ctx.def(), {});
	t.deepEqual(ctx.foo.bar(), {foo: true, bar: true});
});

test('this is preserved correctly using prototypes', t => {
	function Constructor() {}

	fn({
		chainableMethods: {
			def: {},
			foo: {foo: true},
			notFoo: {foo: false},
			bar: {bar: true}
		}
	}, function (opts) {
		return [this, opts];
	}, Constructor.prototype);

	const c1 = new Constructor();
	const c2 = new Constructor();

	t.is(c1.def()[0], c1);
	t.is(c1.foo.bar()[0], c1);
	t.is(c2.def()[0], c2);
	t.is(c2.bar.foo()[0], c2);
});

test('spread option spreads arguments', t => {
	const def = fn({
		spread: true,
		chainableMethods: {
			foo: {foo: true}
		}
	}, function () {
		return Array.prototype.slice.call(arguments);
	});

	t.deepEqual(def('a', 'b'), [{}, 'a', 'b']);
	t.deepEqual(def.foo('c', 'd'), [{foo: true}, 'c', 'd']);
});
