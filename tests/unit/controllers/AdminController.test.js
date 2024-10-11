const  Mentor = require('../../../src/app/models/Mentor'); // Import Mentor model
const AdminController = require('../../../src/app/controllers/AdminController'); // Import AdminController
const { Op } = require('sequelize'); // Import Sequelize operators


describe('AdminController', () => {
  let mockReq;
  let mockRes;

  // Set up mock request and response objects before each test
  beforeEach(() => {
    mockReq = {
      query: {}, // Mock request query object
    };
    mockRes = {
      status: jest.fn().mockReturnThis(), // Mock response status method
      json: jest.fn(), // Mock response json method
    };
  });

  describe('searchMentorByName', () => {
    // Test case: should return mentors when found
    it('should return mentors when found', async () => {
      // Mock the mentor data to be returned
      const mockMentors = [{ id: 1, fullName: 'John Doe' }, { id: 2, fullName: 'Jane Doe' }];
      Mentor.findAll.mockResolvedValue(mockMentors);

      mockReq.query.name = 'Doe';

      await AdminController.searchMentorByName(mockReq, mockRes);

      // Assert that findAll was called with correct parameters
      expect(Mentor.findAll).toHaveBeenCalledWith({
        where: {
          name: {
            [Op.like]: '%Doe%' // Case-insensitive search
          }
        },
        order: [['name', 'ASC']], // Order results by name ascending
      });
      // Assert that the response contains the mock mentors
      expect(mockRes.json).toHaveBeenCalledWith({ error_code: 0, data: mockMentors });
    });

    // Test case: should return 404 when no mentors are found
    it('should return 404 when no mentors are found', async () => {
      Mentor.findAll.mockResolvedValue([]);

      mockReq.query.name = 'Nonexistent';

      await AdminController.searchMentorByName(mockReq, mockRes);

      // Assert that a 404 status is returned with appropriate message
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error_code: 1, message: "No mentors found" });
    });

    // Test case: should handle server errors
    it('should handle server errors', async () => {
      Mentor.findAll.mockRejectedValue(new Error('Database error'));

      mockReq.query.name = 'Error';

      await AdminController.searchMentorByName(mockReq, mockRes);

      // Assert that a 500 status is returned with appropriate error message
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error_code: 1,
        message: "An error occurred while searching for mentors"
      });
    });
  });

  describe('searchMentorByMentorId', () => {
    it('should return a mentor when found', async () => {
      const mockMentor = { id: 1, name: 'John Doe' };
      Mentor.findAll.mockResolvedValue([mockMentor]);

      mockReq.query.mentorId = '1';

      await AdminController.searchMentorByMentorId(mockReq, mockRes);

      expect(Mentor.findAll).toHaveBeenCalledWith({
        where: {
          id: '1'
        }
      });
      expect(mockRes.json).toHaveBeenCalledWith({ error_code: 0, data: [mockMentor] });
    });

    it('should return 400 when mentorId is not provided', async () => {
      await AdminController.searchMentorByMentorId(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error_code: 1, message: "Mentor ID is required" });
    });

    it('should return 404 when no mentor is found', async () => {
      Mentor.findAll.mockResolvedValue([]);

      mockReq.query.mentorId = '999';

      await AdminController.searchMentorByMentorId(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error_code: 1, message: "No mentor found with the given ID" });
    });

    it('should handle server errors', async () => {
      Mentor.findAll.mockRejectedValue(new Error('Database error'));

      mockReq.query.mentorId = '1';

      await AdminController.searchMentorByMentorId(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error_code: 1,
        message: "An error occurred while searching for the mentor"
      });
    });
  });
});