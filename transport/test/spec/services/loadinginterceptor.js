'use strict';

describe('Service: loadingInterceptor', function () {

  // load the service's module
  beforeEach(module('transportApp'));

  // instantiate service
  var loadingInterceptor;
  beforeEach(inject(function (_loadingInterceptor_) {
    loadingInterceptor = _loadingInterceptor_;
  }));

  it('should do something', function () {
    expect(!!loadingInterceptor).toBe(true);
  });

});
