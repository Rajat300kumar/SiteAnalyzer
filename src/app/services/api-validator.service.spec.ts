import { TestBed } from '@angular/core/testing';

import { ApiValidatorService } from './api-validator.service';

describe('ApiValidatorService', () => {
  let service: ApiValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
