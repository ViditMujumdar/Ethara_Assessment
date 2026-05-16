export class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  static ok(data, message) {
    return new ApiResponse(200, data, message);
  }

  static created(data, message = 'Created successfully') {
    return new ApiResponse(201, data, message);
  }

  static noContent(message = 'Success') {
    return new ApiResponse(204, null, message);
  }
}

export const sendResponse = (res, apiResponse) => {
  const { statusCode, message, data, success } = apiResponse;
  if (statusCode === 204) {
    return res.status(204).json({ success: true, message });
  }
  return res.status(statusCode).json({ success, message, data });
};

export default ApiResponse;
