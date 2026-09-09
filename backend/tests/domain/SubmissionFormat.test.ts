import { TextSubmission } from '../../src/domain/submission/TextSubmission';
import { CodeSubmission } from '../../src/domain/submission/CodeSubmission';
import { DiagramSubmission } from '../../src/domain/submission/DiagramSubmission';
import { SubmissionFormatFactory } from '../../src/domain/submission/SubmissionFormatFactory';
import { SubmissionType } from '../../src/domain/enums';

describe('SubmissionFormat Implementations', () => {
  describe('TextSubmission', () => {
    it('validates non-empty text', () => {
      const s = new TextSubmission('I will use a Strategy pattern for fee calculation in the parking lot system.');
      expect(s.validate().isValid).toBe(true);
    });

    it('fails on empty content', () => {
      const s = new TextSubmission('');
      const v = s.validate();
      expect(v.isValid).toBe(false);
      expect(v.errors).toContain('Submission content cannot be empty.');
    });

    it('fails on content that is too short', () => {
      const s = new TextSubmission('Too short');
      const v = s.validate();
      expect(v.isValid).toBe(false);
    });

    it('renders trimmed content', () => {
      const s = new TextSubmission('  hello world  ');
      expect(s.render()).toBe('hello world');
    });
  });

  describe('CodeSubmission', () => {
    it('validates a valid Python submission', () => {
      const s = new CodeSubmission('python', 'class ParkingLot:\n    def __init__(self):\n        self.floors = []');
      expect(s.validate().isValid).toBe(true);
    });

    it('fails for unsupported language', () => {
      const s = new CodeSubmission('cobol', 'some code here with enough characters to pass length');
      const v = s.validate();
      expect(v.isValid).toBe(false);
      expect(v.errors.some((e) => e.includes('Unsupported language'))).toBe(true);
    });

    it('renders with language header', () => {
      const s = new CodeSubmission('python', 'class Foo: pass');
      expect(s.render()).toContain('Language: python');
    });
  });

  describe('DiagramSubmission', () => {
    it('validates valid Mermaid text', () => {
      const s = new DiagramSubmission('classDiagram\n  ParkingLot --> Floor');
      expect(s.validate().isValid).toBe(true);
    });

    it('fails on empty diagram', () => {
      const s = new DiagramSubmission('');
      expect(s.validate().isValid).toBe(false);
    });

    it('fails if no class or relationship keywords', () => {
      const s = new DiagramSubmission('This is just plain text with no structure');
      expect(s.validate().isValid).toBe(false);
    });
  });

  describe('SubmissionFormatFactory', () => {
    it('creates TextSubmission from text payload', () => {
      const s = SubmissionFormatFactory.create({
        type: SubmissionType.TEXT,
        content: 'some content about design patterns for the parking lot system',
      });
      expect(s.type).toBe(SubmissionType.TEXT);
    });

    it('creates CodeSubmission from code payload', () => {
      const s = SubmissionFormatFactory.create({
        type: SubmissionType.CODE,
        language: 'typescript',
        content: 'interface Vehicle { park(): void; }',
      });
      expect(s.type).toBe(SubmissionType.CODE);
    });

    it('creates DiagramSubmission from diagram payload', () => {
      const s = SubmissionFormatFactory.create({
        type: SubmissionType.DIAGRAM,
        diagramText: 'classDiagram\n  ParkingLot --> Spot',
      });
      expect(s.type).toBe(SubmissionType.DIAGRAM);
    });
  });
});
