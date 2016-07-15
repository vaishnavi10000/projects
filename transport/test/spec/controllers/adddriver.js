'use strict';

describe('Controller: AdddriverCtrl', function () {

  // load the controller's module
  beforeEach(module('transportApp'));

  var AdddriverCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdddriverCtrl = $controller('AdddriverCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(AdddriverCtrl.awesomeThings.length).toBe(3);
  });
});
