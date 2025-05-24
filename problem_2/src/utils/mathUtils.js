function mean(arr) {
  if (!arr || arr.length === 0) {
    return 0;
  }
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

function standardDeviation(arr, meanVal = null) {
  if (!arr || arr.length < 2) {
    return 0;
  }
  const avg = meanVal === null ? mean(arr) : meanVal;
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

function covariance(arrX, arrY, meanX = null, meanY = null) {
  if (!arrX || !arrY || arrX.length !== arrY.length || arrX.length < 2) {
    return 0;
  }
  const avgX = meanX === null ? mean(arrX) : meanX;
  const avgY = meanY === null ? mean(arrY) : meanY;

  let sumOfProducts = 0;
  for (let i = 0; i < arrX.length; i++) {
    sumOfProducts += (arrX[i] - avgX) * (arrY[i] - avgY);
  }
  return sumOfProducts / (arrX.length - 1);
}

function pearsonCorrelation(arrX, arrY) {
  if (!arrX || !arrY || arrX.length !== arrY.length || arrX.length < 2) {
    return 0;
  }

  const meanX = mean(arrX);
  const meanY = mean(arrY);

  const stdDevX = standardDeviation(arrX, meanX);
  const stdDevY = standardDeviation(arrY, meanY);

  if (stdDevX === 0 || stdDevY === 0) {
    return 0;
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