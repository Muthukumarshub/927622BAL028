const axios = require("axios");
const { API_ENDPOINTS, WINDOW_SIZE, FETCH_TIMEOUT, AUTH_TOKEN } = require("../utils/constants");

let numbersWindow = [];

async function fetchNumbers(numberId) {
  const apiUrl = API_ENDPOINTS[numberId];
  if (!apiUrl) {
    console.error(`Invalid number ID: ${numberId}`);
    return [];
  }

  try {
    const response = await axios.get(apiUrl, {
      timeout: FETCH_TIMEOUT,
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });

    if (response.data && Array.isArray(response.data.numbers)) {
      return response.data.numbers;
    } else {
      console.warn(`Response from ${apiUrl} did not contain a valid 'numbers' array.`);
      return [];
    }
  } catch (error) {
    if (axios.isCancel(error)) {
      console.error(`Request to ${apiUrl} was cancelled:`, error.message);
    } else if (error.code === 'ECONNABORTED') {
      console.error(`Request to ${apiUrl} timed out after ${FETCH_TIMEOUT}ms.`);
    } else if (error.response) {
      console.error(`Error fetching from ${apiUrl}: Status ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error(`No response received from ${apiUrl}:`, error.message);
    } else {
      console.error(`Error setting up request to ${apiUrl}:`, error.message);
    }
    return [];
  }
}

function processNumbers(newNumbers) {
  const windowPrevState = [...numbersWindow];

  const uniqueNumbersInWindow = new Set(numbersWindow);

  newNumbers.forEach((num) => {
    if (!uniqueNumbersInWindow.has(num)) {
      if (numbersWindow.length >= WINDOW_SIZE) {
        uniqueNumbersInWindow.delete(numbersWindow.shift());
      }
      numbersWindow.push(num);
      uniqueNumbersInWindow.add(num);
    }
  });

  const windowCurrState = [...numbersWindow];

  const sum = windowCurrState.reduce((acc, num) => acc + num, 0);
  const avg = windowCurrState.length > 0 ? (sum / windowCurrState.length) : 0;

  return {
    windowPrevState,
    windowCurrState,
    numbers: newNumbers,
    avg: parseFloat(avg.toFixed(2)),
  };
}

async function getAverageData(numberId) {
  const fetchedNumbers = await fetchNumbers(numberId);
  const result = processNumbers(fetchedNumbers);
  return result;
}

module.exports = {
  getAverageData,
};