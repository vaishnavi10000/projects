'use strict';

describe('Controller: AddstudentCtrl', function () {

  // load the controller's module
  beforeEach(module('transportApp'));

  var AddstudentCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AddstudentCtrl = $controller('AddstudentCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(AddstudentCtrl.awesomeThings.length).toBe(3);
  });
});
