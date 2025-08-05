const mongoose = require('mongoose');

const validateObjectId = (paramName, entityName = 'ID') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: `Invalid ${entityName} format` });
    }
    next();
  };
};

module.exports = validateObjectId;
