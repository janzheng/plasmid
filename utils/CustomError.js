
// gpt-4 generated

// CustomError.js
// allows you to throw new CustomError("Error message", {data})
// access through error.message, error.data
export default class CustomError extends Error {
  constructor(message, data) {
    super(message);
    this.data = data;
  }
}
