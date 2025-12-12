import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { unverifiedGuard } from './unverified.guard';

describe('unverifiedGuard', () => {
    const executeGuard: CanActivateFn = (...guardParameters) =>
        TestBed.runInInjectionContext(() => unverifiedGuard(...guardParameters));

    beforeEach(() => {
        TestBed.configureTestingModule({});
    });

    it('should be created', () => {
        expect(executeGuard).toBeTruthy();
    });
});
