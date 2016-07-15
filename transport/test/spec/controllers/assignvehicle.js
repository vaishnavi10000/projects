'use strict';

describe('Controller: AssignvehicleCtrl', function () {

  // load the controller's module
  beforeEach(module('transportApp'));

  var AssignvehicleCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AssignvehicleCtrl = $controller('AssignvehicleCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(AssignvehicleCtrl.awesomeThings.length).toBe(3);
  });
});
