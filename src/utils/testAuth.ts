import { authService } from "../services/auth/authService";

// Test data
const testUser = {
  name: "Test User",
  email: "test@example.com",
  password: "password123",
};

const testCredentials = {
  email: "test@example.com",
  password: "password123",
};

export const testAuthFlow = async () => {
  console.log("🧪 Starting Authentication Flow Test...\n");

  try {
    // Test 1: Check if user is authenticated (should be false initially)
    console.log("1. Testing initial authentication state...");
    const isAuth = await authService.isAuthenticated();
    console.log(`   Is authenticated: ${isAuth}`);
    console.log("   ✅ Expected: false\n");

    // Test 2: Try to register a new user
    console.log("2. Testing user registration...");
    const registerResult = await authService.register(testUser);
    if (registerResult.success) {
      console.log("   ✅ Registration successful");
      console.log(
        `   User: ${registerResult.data?.user.name} (${registerResult.data?.user.email})`
      );
    } else {
      console.log(`   ❌ Registration failed: ${registerResult.error}`);
    }
    console.log("");

    // Test 3: Try to login with the registered user
    console.log("3. Testing user login...");
    const loginResult = await authService.login(testCredentials);
    if (loginResult.success) {
      console.log("   ✅ Login successful");
      console.log(
        `   User: ${loginResult.data?.user.name} (${loginResult.data?.user.email})`
      );
    } else {
      console.log(`   ❌ Login failed: ${loginResult.error}`);
    }
    console.log("");

    // Test 4: Check if user is now authenticated
    console.log("4. Testing authentication state after login...");
    const isAuthAfterLogin = await authService.isAuthenticated();
    console.log(`   Is authenticated: ${isAuthAfterLogin}`);
    console.log("   ✅ Expected: true\n");

    // Test 5: Get user profile
    console.log("5. Testing get profile...");
    const profileResult = await authService.getProfile();
    if (profileResult.success) {
      console.log("   ✅ Profile retrieved successfully");
      console.log(
        `   User: ${profileResult.data?.user.name} (${profileResult.data?.user.email})`
      );
    } else {
      console.log(`   ❌ Get profile failed: ${profileResult.error}`);
    }
    console.log("");

    // Test 6: Test auto-login
    console.log("6. Testing auto-login...");
    const autoLoginResult = await authService.autoLogin();
    if (autoLoginResult.success) {
      console.log("   ✅ Auto-login successful");
      console.log(
        `   User: ${autoLoginResult.data?.user.name} (${autoLoginResult.data?.user.email})`
      );
    } else {
      console.log(`   ❌ Auto-login failed: ${autoLoginResult.error}`);
    }
    console.log("");

    // Test 7: Test logout
    console.log("7. Testing logout...");
    const logoutResult = await authService.logout();
    if (logoutResult.success) {
      console.log("   ✅ Logout successful");
    } else {
      console.log(`   ❌ Logout failed: ${logoutResult.error}`);
    }
    console.log("");

    // Test 8: Check if user is no longer authenticated
    console.log("8. Testing authentication state after logout...");
    const isAuthAfterLogout = await authService.isAuthenticated();
    console.log(`   Is authenticated: ${isAuthAfterLogout}`);
    console.log("   ✅ Expected: false\n");

    console.log("🎉 Authentication Flow Test Completed!");
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
};

export const testApiConnection = async () => {
  console.log("🔌 Testing API Connection...\n");

  try {
    // Test API health check by trying to access a public endpoint
    console.log("⚠️  API connection test requires backend implementation");
    console.log(
      "   Make sure your NestJS backend is running on http://localhost:3000"
    );
  } catch (error) {
    console.error("❌ API connection test failed:", error);
  }
};

// Export test functions for use in development
export default {
  testAuthFlow,
  testApiConnection,
};
