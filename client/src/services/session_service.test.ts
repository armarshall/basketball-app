import { expect, test, describe, beforeEach } from "@jest/globals";
import { login, logout, get_user_data } from "./session_service";

// NOTE: ENSURE DATABASE IS RUNNING TO GET ACCURATE RESULTS
describe("session_service integration tests", () => {
  beforeEach(() => {
    sessionStorage.clear();
    logout();
  });

  test("login should add user to session storage on successful login", async () => {
    const result = await login("test@test.com", "test");

    // result == true indicates success
    expect(result).toBe(true);

    // Assert in session storage
    const userData = get_user_data();
    expect(userData).toBeDefined();
    if (userData) {
      const user = JSON.parse(userData);
      expect(user.email).toBe("test@test.com");
    }
  });

  test("login should not add user to session storage on failed login with wrong password", async () => {
    const result = await login("t@test.com", "wrongpassword");

    // false indicates failure
    expect(result).toBe(false);

    expect(get_user_data()).toBeNull();
  });

  test("logout should remove user from session storage", async () => {
    await login("test@test.com", "test");
    logout();

    expect(sessionStorage.getItem("user")).toBeNull();
  });
});
