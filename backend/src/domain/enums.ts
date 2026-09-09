// ─── Enumerations ─────────────────────────────────────────────────────────────

export enum AttemptStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  EVALUATING = 'evaluating',
  EVALUATED = 'evaluated',
  FAILED = 'failed',
}

export enum FeedbackDimension {
  RESPONSIBILITY_ASSIGNMENT = 'RESPONSIBILITY_ASSIGNMENT',
  ABSTRACTION_QUALITY = 'ABSTRACTION_QUALITY',
  EXTENSIBILITY = 'EXTENSIBILITY',
  SOLID_ADHERENCE = 'SOLID_ADHERENCE',
  PATTERN_CORRECTNESS = 'PATTERN_CORRECTNESS',
  NAMING_CLARITY = 'NAMING_CLARITY',
}

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum SubmissionType {
  TEXT = 'text',
  CODE = 'code',
  DIAGRAM = 'diagram',
}
