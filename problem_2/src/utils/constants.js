// src/utils/constants.js

const TEST_SERVER_BASE_URL = "http://20.244.56.144/evaluation-service";
const FETCH_TIMEOUT = 5000; // Increased timeout to 5 seconds to reduce timeout errors
const CACHE_EXPIRY_SECONDS = 60; // Cache data for 60 seconds (1 minute) to reduce API calls

// The access token for authenticating with the third-party test server.
// For production, consider using environment variables (e.g., process.env.AUTH_TOKEN).
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ4MDcwMDUzLCJpYXQiOjE3NDgwNjk3NTMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjNjMjg2NTE5LWViOGUtNDgwNC1hNWY1LTQ3NzYwNmIzYmM2NiIsInN1YiI6Im1haWwybXV0aHVrdW1hcjAwN0BnbWFpbC5jb20ifSwiZW1haWwiOiJtYWlsMm11dGh1a3VtYXIwMDdAZ21haWwuY29tIiwibmFtZSI6Im11dGh1a3VtYXIgayIsInJvbGxObyI6IjkyNzYyMmJhbDAyOCIsImFjY2Vzc0NvZGUiOiJ3aGVRVXkiLCJjbGllbnRJRCI6IjNjMjg2NTE5LWViOGUtNDgwNC1hNWY1LTQ3NzYwNmIzYmM2NiIsImNsaWVudFNlY3JldCI6InNndERXYUZxeXlaYmt4c2YifQ.lq8N12Fuf7dRTZHpUDi1RBxtW9IQF9p8ruiPP9Bt1A4";

module.exports = {
  TEST_SERVER_BASE_URL,
  FETCH_TIMEOUT,
  CACHE_EXPIRY_SECONDS,
  AUTH_TOKEN,
};