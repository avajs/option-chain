import test from 'ava';
import fn from './';

test('defaults and args are passed', t => {
	t.plan(2);
	fn({
		defaults: {foo: 'bar'}
	}, function (opts, args) {
		t.same(opts, {foo: 'bar'});
		t.same(args, ['uni', 'corn']);
	})('uni', 'corn');
});

test('chainables extend the options passed', t => {
	t.plan(2);
	fn({
		defaults: {foo: 'bar'},
		chainables: {
			moo: {cow: true}
		}
	}, function (opts, args) {
		t.same(opts, {foo: 'bar', cow: true});
		t.same(args, ['duck', 'goose']);
	}).moo('duck', 'goose');
});

test('last item in the chain takes precedence', t => {
	t.plan(4);

	const config = {
		chainables: {
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
	var ctx = {};

	var result = fn({
		chainables: {
			def: {},
			foo: {foo: true},
			notFoo: {foo: false},
			bar: {bar: true}
		}
	}, function (opts, args) {
		return [opts, args];
	}, ctx);

	t.is(result, ctx);
	t.same(ctx.def(), [{}, []]);
	t.same(ctx.foo('baz'), [{foo: true}, ['baz']]);
	t.same(ctx.notFoo('quz'), [{foo: false}, ['quz']]);
	t.same(ctx.bar.foo.notFoo(), [{foo: false, bar: true}, []]);
});

test('this is preserved', t => {
	var ctx = {};

	fn({
		chainables: {
			def: {},
			foo: {foo: true},
			notFoo: {foo: false},
			bar: {bar: true}
		}
	}, function (opts) {
		t.is(this, ctx);
		return opts;
	}, ctx);

	t.same(ctx.def(), {});
	t.same(ctx.foo.bar(), {foo: true, bar: true});
});

test('this is preserved correctly using prototypes', t => {
	function Constructor() {}

	fn({
		chainables: {
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
		chainables: {
			foo: {foo: true}
		}
	}, function returnArgs() {
		return Array.prototype.slice.call(arguments);
	});

	t.same(def('a', 'b'), [{}, 'a', 'b']);
	t.same(def.foo('c', 'd'), [{foo: true}, 'c', 'd']);
});
