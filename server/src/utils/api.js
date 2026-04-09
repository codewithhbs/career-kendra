 const sendError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    error: message,
  });
};

const sendSuccess = (res, data, message = "Success") => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

module.exports = {
  sendError,
  sendSuccess,
};