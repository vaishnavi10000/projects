'use strict';

describe('Directive: navMenu', function () {

  // load the directive's module
  beforeEach(module('transportApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<nav-menu></nav-menu>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the navMenu directive');
  }));
});
