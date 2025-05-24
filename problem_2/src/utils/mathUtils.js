// src/utils/mathUtils.js

/**
 * Calculates the mean (average) of an array of numbers.
 * @param {number[]} arr - The array of numbers.
 * @returns {number} The mean.
 */
function mean(arr) {
  if (!arr || arr.length === 0) {
    return 0;
  }
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

/**
 * Calculates the standard deviation of an array of numbers.
 * @param {number[]} arr - The array of numbers.
 * @param {number} [meanVal] - The pre-calculated mean. If not provided, it will be calculated.
 * @returns {number} The standard deviation.
 */
function standardDeviation(arr, meanVal = null) {
  if (!arr || arr.length < 2) { // Need at least 2 points for std dev
    return 0;
  }
  const avg = meanVal === null ? mean(arr) : meanVal;
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / (arr.length - 1); // Sample standard deviation
  return Math.sqrt(variance);
}

/**
 * Calculates the covariance between two arrays of numbers.
 * Arrays must be of the same length and aligned.
 * @param {number[]} arrX - The first array of numbers.
 * @param {number[]} arrY - The second array of numbers.
 * @param {number} [meanX] - The pre-calculated mean of arrX.
 * @param {number} [meanY] - The pre-calculated mean of arrY.
 * @returns {number} The covariance.
 */
function covariance(arrX, arrY, meanX = null, meanY = null) {
  if (!arrX || !arrY || arrX.length !== arrY.length || arrX.length < 2) {
    return 0; // Need at least 2 points for covariance
  }
  const avgX = meanX === null ? mean(arrX) : meanX;
  const avgY = meanY === null ? mean(arrY) : meanY;

  let sumOfProducts = 0;
  for (let i = 0; i < arrX.length; i++) {
    sumOfProducts += (arrX[i] - avgX) * (arrY[i] - avgY);
  }
  return sumOfProducts / (arrX.length - 1); // Sample covariance
}

/**
 * Calculates Pearson's Correlation Coefficient between two arrays of numbers.
 * Arrays must be of the same length and aligned.
 * @param {number[]} arrX - The first array of numbers.
 * @param {number[]} arrY - The second array of numbers.
 * @returns {number} The Pearson correlation coefficient, or 0 if calculation is not possible.
 */
function pearsonCorrelation(arrX, arrY) {
  if (!arrX || !arrY || arrX.length !== arrY.length || arrX.length < 2) {
    return 0; // Not enough data points to calculate correlation
  }

  const meanX = mean(arrX);
  const meanY = mean(arrY);

  const stdDevX = standardDeviation(arrX, meanX);
  const stdDevY = standardDeviation(arrY, meanY);

  if (stdDevX === 0 || stdDevY === 0) {
    return 0; // No variance in one of the series, correlation is undefined or 0.
  }

  const covXY = covariance(arrX, arrY, meanX, meanY);

  return covXY / (stdDevX * stdDevY);
}

module.exports = {
  mean,
  standardDeviation,
  covariance,
  pearsonCorrelation,
};