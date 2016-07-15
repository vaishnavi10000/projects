'use strict';

describe('Service: apiCommunication', function () {

  // load the service's module
  beforeEach(module('transportApp'));

  // instantiate service
  var apiCommunication;
  beforeEach(inject(function (_apiCommunication_) {
    apiCommunication = _apiCommunication_;
  }));

  it('should do something', function () {
    expect(!!apiCommunication).toBe(true);
  });

});
