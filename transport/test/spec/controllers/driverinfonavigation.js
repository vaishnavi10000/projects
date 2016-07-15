'use strict';

describe('Controller: DriverinfonavigationctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('transportApp'));

  var DriverinfonavigationctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DriverinfonavigationctrlCtrl = $controller('DriverinfonavigationctrlCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(DriverinfonavigationctrlCtrl.awesomeThings.length).toBe(3);
  });
});
