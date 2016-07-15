'use strict';

describe('Controller: CreaterouteCtrl', function () {

  // load the controller's module
  beforeEach(module('transportApp'));

  var CreaterouteCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CreaterouteCtrl = $controller('CreaterouteCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(CreaterouteCtrl.awesomeThings.length).toBe(3);
  });
});
