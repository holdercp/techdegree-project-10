module.exports = (req, res, next) => {
  Object.keys(req.body).forEach((key) => {
    req.body[key] = req.body[key] !== '' ? req.body[key] : null;
  });

  next();
};
