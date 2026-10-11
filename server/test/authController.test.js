const assert = require("node:assert/strict");
const { after, test } = require("node:test");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { login } = require("../controllers/authController");
const { allowRoles } = require("../middleware/roleMiddleware");

const originalFindOne = User.findOne;
const originalJwtSecret = process.env.JWT_SECRET;
process.env.JWT_SECRET = "test-only-jwt-secret";

after(() => {
  User.findOne = originalFindOne;

  if (originalJwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalJwtSecret;
  }
});

function createResponse() {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

async function createShopUser() {
  return {
    _id: "shop-test-id",
    name: "Test Shop",
    email: "shop@example.test",
    role: "shop",
    isActive: true,
    password: await bcrypt.hash("correct horse", 4),
    comparePassword: User.schema.methods.comparePassword,
  };
}

test("shop login verifies the password and returns the shop role", async () => {
  const user = await createShopUser();
  User.findOne = (query) => {
    assert.deepEqual(query, { email: "shop@example.test" });
    return {
      select: async (fields) => {
        assert.equal(fields, "+password");
        return user;
      },
    };
  };

  const response = createResponse();
  await login(
    {
      body: { email: " SHOP@EXAMPLE.TEST ", password: "correct horse" },
    },
    response,
    (error) => {
      throw error;
    }
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.user.role, "shop");
  assert.equal(typeof response.body.token, "string");
});

test("shop login rejects an incorrect password", async () => {
  const user = await createShopUser();
  User.findOne = () => ({
    select: async () => user,
  });

  const response = createResponse();
  await login(
    { body: { email: user.email, password: "wrong password" } },
    response,
    (error) => {
      throw error;
    }
  );

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, "Invalid email or password");
});

test("role middleware allows shop access and rejects cross-role access", () => {
  let nextCalled = false;
  const shopResponse = createResponse();
  allowRoles("shop")({ user: { role: "shop" } }, shopResponse, () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true);

  const adminResponse = createResponse();
  allowRoles("admin")({ user: { role: "shop" } }, adminResponse, () => {
    assert.fail("shop users must not pass admin-only authorization");
  });
  assert.equal(adminResponse.statusCode, 403);
});
