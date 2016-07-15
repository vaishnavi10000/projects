'use strict';

describe('Directive: attachment', function () {

  // load the directive's module
  beforeEach(module('transportApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<attachment></attachment>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the attachment directive');
  }));
});
