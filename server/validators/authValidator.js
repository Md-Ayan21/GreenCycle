
function validateRegister(req, res, next) {
  const { name, email, password } = req.body;

  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Provide a valid name, email, and password of at least 8 characters",
    });
  }

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  next();
}

module.exports = {
  validateRegister,
  validateLogin,
};
