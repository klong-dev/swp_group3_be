const Student = require('../../../src/app/models/Student');

describe('Student Model', () => {
  it('should define the Student model', () => {
    expect(Student).toBeDefined();
  });
});
