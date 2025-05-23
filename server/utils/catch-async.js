/**
 * Catch async errors middleware
 * Eliminates the need for try/catch blocks in controllers
 */
const catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  catchAsync
};
