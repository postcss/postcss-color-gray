'use strict';

var postcss = require('postcss');
var colorGray = require('./');
var test = require('tape');

function useGray() {
  return postcss().use(colorGray());
}

test('filterDeclarations()', function(t) {
  t.plan(8);

  t.equal(
    useGray().process('a {color: gray(200); background: gray(00000034%)}').css,
    'a {color: rgb(200, 200, 200); background: rgb(87, 87, 87)}',
    'should convert gray(A) to rgb(A,A,A).'
  );

  t.equal(
    useGray().process('a {color: gray( 1,  4.5%)}; b {color: gray(030%,0.75 \t)}').css,
    'a {color: rgba(1, 1, 1, 0.045)}; b {color: rgba(77, 77, 77, 0.75)}',
    'should convert gray(A,B) to rgba(A,A,A,B).'
  );

  t.equal(
    useGray().process('a {border-color: gray;}').css,
    'a {border-color: gray;}',
    'should not modify original CSS when gray() is not used.'
  );

  t.throws(
    function() {
      return useGray().process('a {color: gray()}').css;
    },
    /Unable to parse color from string "gray\(\)"/,
    'should throw an error when gray() doesn\'t take any arguments.'
  );

  t.throws(
    function() {
      return useGray().process('a {color: gray(,foo)}').css;
    },
    /<css input>:1:4: Unable to parse color from string "gray\(,foo\)"/,
    'should throw an error when gray() args start with a comma.'
  );

  t.throws(
    function() {
      return useGray().process('a {color: gray(foo,)}').css;
    },
    /<css input>:1:4: Unable to parse color from string "gray\(foo,\)"/,
    'should throw an error when gray() args end with a comma.'
  );

  t.throws(
    function() {
      return useGray().process('a {color: gray(red)}', {from: 'fixture.css'}).css;
    },
    /fixture\.css:1:4: Unable to parse color from string "gray\(red\)"/,
    'should throw a detailed error when a source file is specified.'
  );

  t.throws(
    function() {
      return useGray().process('a {color: gray(,)}', {map: true}).css;
    },
    /<css input>:1:4: Unable to parse color from string "gray\(,\)"/,
    'should throw a detailed error when source map is enabled but file isn\'t specified.'
  );
});
