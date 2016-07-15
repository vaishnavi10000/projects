'use strict';

describe('Controller: AddvehiclesCtrl', function () {

  // load the controller's module
  beforeEach(module('transportApp'));

  var AddvehiclesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AddvehiclesCtrl = $controller('AddvehiclesCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(AddvehiclesCtrl.awesomeThings.length).toBe(3);
  });
});
