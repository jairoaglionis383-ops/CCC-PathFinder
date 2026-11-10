function success(res, data = null, message = 'OK', status = 200) {
  return res.status(status).json({ success: true, data, message });
}
function error(res, message = 'Something went wrong', status = 500) {
  return res.status(status).json({ success: false, data: null, message });
}
module.exports = { success, error };
