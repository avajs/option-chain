import test from 'ava';
import fn from './';

test('defaults and args are passed', t => {
	t.plan(2);
	fn({
		defaults: {foo: 'bar'}
	})(function (opts, args) {
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
	})(function (opts, args) {
		t.same(opts, {foo: 'bar', cow: true});
		t.same(args, ['duck', 'goose']);
	}).moo('duck', 'goose');
});

test('last item in the chain takes precedence', t => {
	t.plan(4);

	const config = fn({
		chainables: {
			foo: {foo: true},
			notFoo: {foo: false}
		}
	});

	let expected = true;

	function isExpected(opts) {
		t.is(opts.foo, expected);
	}

	const notFoo = config(isExpected).notFoo;
	const foo = config(isExpected).foo;

	foo();
	notFoo.foo();

	expected = false;

	notFoo();
	foo.notFoo();
});
