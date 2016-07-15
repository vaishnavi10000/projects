'use strict';

describe('Controller: SelecteddriverinfoctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('transportApp'));

  var SelecteddriverinfoctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SelecteddriverinfoctrlCtrl = $controller('SelecteddriverinfoctrlCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(SelecteddriverinfoctrlCtrl.awesomeThings.length).toBe(3);
  });
});
