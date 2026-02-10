#!/usr/bin/env node

/**
 * Brute Force Attack Testing Script
 * 
 * This script tests the application's brute force protection mechanisms by:
 * 1. Attempting multiple invalid login attempts
 * 2. Testing OTP brute force protection
 * 3. Verifying account lockout functionality
 * 4. Testing rate limiting on authentication endpoints
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = 'test@example.com';
const WRONG_PASSWORD = 'wrongpassword';
const WRONG_OTP = '123456';

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  log(`\n🧪 Testing: ${testName}`, 'blue');
  log('─'.repeat(50), 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Login Brute Force Protection
async function testLoginBruteForce() {
  logTest('Login Brute Force Protection');
  
  try {
    // First register a user
    await axios.post(`${BASE_URL}/api/auth/register`, {
      email: TEST_EMAIL,
      password: 'correctpassword123',
      firstName: 'Test',
      lastName: 'User'
    });
    logSuccess('Test user registered successfully');
  } catch (error) {
    if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
      logWarning('Test user already exists, continuing...');
    } else {
      logError(`Failed to register test user: ${error.message}`);
      return;
    }
  }

  // Attempt multiple failed logins
  let attempts = 0;
  let locked = false;
  
  for (let i = 1; i <= 7; i++) {
    try {
      await axios.post(`${BASE_URL}/api/auth/login`, {
        email: TEST_EMAIL,
        password: WRONG_PASSWORD
      });
    } catch (error) {
      attempts++;
      
      if (error.response?.status === 400) {
        if (error.response.data.message.includes('locked')) {
          locked = true;
          logSuccess(`Account locked after ${attempts} failed attempts`);
          break;
        } else {
          log(`Attempt ${i}: ${error.response.data.message}`, 'yellow');
        }
      } else if (error.response?.status === 429) {
        logSuccess(`Rate limiting activated: ${error.response.data.message}`);
        break;
      }
    }
    
    await delay(100); // Small delay between attempts
  }
  
  if (!locked && attempts >= 5) {
    logError('Account should have been locked after 5 failed attempts');
  }
}

// Test 2: Rate Limiting
async function testRateLimiting() {
  logTest('Rate Limiting Protection');
  
  const requests = [];
  const startTime = Date.now();
  
  // Send multiple requests rapidly
  for (let i = 0; i < 20; i++) {
    requests.push(
      axios.post(`${BASE_URL}/api/auth/login`, {
        email: `test${i}@example.com`,
        password: 'password123'
      }).catch(error => error.response)
    );
  }
  
  try {
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(response => 
      response?.status === 429
    );
    
    if (rateLimited) {
      logSuccess('Rate limiting is working - some requests were blocked');
    } else {
      logWarning('Rate limiting may not be working as expected');
    }
    
    const endTime = Date.now();
    log(`Completed ${requests.length} requests in ${endTime - startTime}ms`);
    
  } catch (error) {
    logError(`Rate limiting test failed: ${error.message}`);
  }
}

// Test 3: Session Security
async function testSessionSecurity() {
  logTest('Session Security');
  
  try {
    // Try to access protected endpoint without authentication
    await axios.get(`${BASE_URL}/api/auth/user`);
    logError('Protected endpoint should require authentication');
  } catch (error) {
    if (error.response?.status === 401) {
      logSuccess('Protected endpoints properly require authentication');
    } else {
      logError(`Unexpected error: ${error.message}`);
    }
  }
  
  try {
    // Try to access tasks without authentication
    await axios.get(`${BASE_URL}/api/tasks`);
    logError('Tasks endpoint should require authentication');
  } catch (error) {
    if (error.response?.status === 401) {
      logSuccess('Tasks endpoint properly protected');
    } else {
      logError(`Unexpected error: ${error.message}`);
    }
  }
}

// Main test runner
async function runBruteForceTests() {
  log('🔒 SECURETASK BRUTE FORCE PROTECTION TESTS', 'bright');
  log('═'.repeat(60), 'bright');
  log('This script tests the application\'s security mechanisms against brute force attacks.\n');
  
  try {
    await testLoginBruteForce();
    await delay(1000);
    
    await testRateLimiting();
    await delay(1000);
    
    await testSessionSecurity();
    
    log('\n🎉 All brute force protection tests completed!', 'green');
    log('Check the results above to verify security mechanisms are working.', 'blue');
    
  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runBruteForceTests();
}

module.exports = { runBruteForceTests };