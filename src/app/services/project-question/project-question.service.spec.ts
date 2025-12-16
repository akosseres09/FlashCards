import { TestBed } from '@angular/core/testing';

import { ProjectQuestionService } from './project-question.service';

describe('ProjectQuestionService', () => {
  let service: ProjectQuestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectQuestionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
