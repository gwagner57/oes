/**
 * @fileOverview  Defines error classes (also called "exception" classes)
 * for property constraint violations
 * @author Gerd Wagner
 */
class ConstraintViolation extends Error {
  constructor (msg) {
    super( msg);
  }
}
class NoConstraintViolation extends ConstraintViolation {
  constructor ( val) {
    super("okay");
    if (val !== undefined) this.checkedValue = val;
  }
}
class MandatoryValueConstraintViolation extends ConstraintViolation {
  constructor (msg) {
    super( msg);
  }
}
class RangeConstraintViolation extends ConstraintViolation {
  constructor (msg) {
    super( msg);
  }
}
class StringLengthConstraintViolation extends ConstraintViolation {
  constructor (msg) {
    super( msg);
  }
}
class IntervalConstraintViolation extends ConstraintViolation {
  constructor (msg) {
    super( msg);
  }
}
class PatternConstraintViolation extends ConstraintViolation {
  constructor (msg) {
    super( msg);
  }
}
class CardinalityConstraintViolation extends ConstraintViolation {
  constructor (msg) {
    super( msg);
  }
}
class UniquenessConstraintViolation extends ConstraintViolation {
  constructor (msg) {
    super( msg);
  }
}
class ReferentialIntegrityConstraintViolation extends ConstraintViolation {
  constructor (msg) {
    super( msg);
  }
}
class FrozenValueConstraintViolation extends ConstraintViolation {
  constructor (msg) {
    super( msg);
  }
}
