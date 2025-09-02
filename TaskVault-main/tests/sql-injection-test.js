#!/usr/bin/env node

/**
 * SQL Injection Testing Script
 * 
 * This script tests the application's SQL injection protection by:
 * 1. Testing login form with SQL injection payloads
 * 2. Testing task creation with malicious inputs
 * 3. Testing search and filter parameters
 * 4. Verifying input sanitization is working
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Common SQL injection payloads
const SQL_INJECTION_PAYLOADS = [
  "' OR '1'='1",
  "' OR 1=1--",
  "' OR 1=1#",
  "'; DROP TABLE users;--",
  "' UNION SELECT * FROM users--",
  "admin'--",
  "admin'/*",
  "' OR 'x'='x",
  "') OR ('1'='1",
  "' OR 1=1 LIMIT 1--",
  "1' OR '1'='1' AND '1'='1",
  "'; INSERT INTO users (email, password) VALUES ('hacker@evil.com', 'password')--",
  "<script>alert('XSS')</script>",
  "'; EXEC xp_cmdshell('dir')--",
  "' AND (SELECT COUNT(*) FROM users) > 0--"
];

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

// Test 1: Login Form SQL Injection
async function testLoginSQLInjection() {
  logTest('Login Form SQL Injection Protection');
  
  let vulnerabilities = 0;
  let protected = 0;
  
  for (const payload of SQL_INJECTION_PAYLOADS.slice(0, 10)) {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: payload,
        password: 'anypassword'
      });
      
      // If we get a successful response, this might indicate a vulnerability
      if (response.status === 200) {
        logError(`Potential vulnerability with payload: ${payload}`);
        vulnerabilities++;
      }
      
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data.message;
        
        // Check for SQL errors that might leak information
        if (message && (
          message.includes('SQL') || 
          message.includes('syntax') || 
          message.includes('mysql') || 
          message.includes('postgresql') ||
          message.includes('database')
        )) {
          logError(`SQL error leaked with payload: ${payload}`);
          logError(`Error message: ${message}`);
          vulnerabilities++;
        } else if (status === 400 && (
          message.includes('Invalid') || 
          message.includes('validation') ||
          message.includes('email')
        )) {
          protected++;
        }
      } else {
        logWarning(`Network error testing payload: ${payload}`);
      }
    }
    
    await delay(100); // Avoid overwhelming the server
  }
  
  log(`\nResults: ${protected} protected, ${vulnerabilities} potential vulnerabilities`);
  
  if (vulnerabilities === 0) {
    logSuccess('Login form appears protected against SQL injection');
  } else {
    logError(`Found ${vulnerabilities} potential SQL injection vulnerabilities`);
  }
}

// Test 2: Registration Form SQL Injection
async function testRegistrationSQLInjection() {
  logTest('Registration Form SQL Injection Protection');
  
  let vulnerabilities = 0;
  let protected = 0;
  
  const testPayloads = SQL_INJECTION_PAYLOADS.slice(0, 8);
  
  for (const payload of testPayloads) {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/register`, {
        email: payload,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });
      
      if (response.status === 200) {
        logError(`Registration succeeded with malicious email: ${payload}`);
        vulnerabilities++;
      }
      
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data.message;
        
        if (message && (
          message.includes('SQL') || 
          message.includes('syntax') || 
          message.includes('database')
        )) {
          logError(`SQL error in registration: ${payload}`);
          vulnerabilities++;
        } else if (status === 400) {
          protected++;
        }
      }
    }
    
    await delay(100);
  }
  
  if (vulnerabilities === 0) {
    logSuccess('Registration form appears protected against SQL injection');
  } else {
    logError(`Found ${vulnerabilities} potential vulnerabilities in registration`);
  }
}

// Test 3: Task Creation SQL Injection (requires authentication)
async function testTaskSQLInjection() {
  logTest('Task Creation SQL Injection Protection');
  
  try {
    // Try to create tasks with malicious content
    const maliciousDescriptions = [
      "'; DROP TABLE tasks;--",
      "Normal task'; INSERT INTO tasks (description) VALUES ('Hacked')--",
      "<script>alert('XSS in task')</script>",
      "' OR 1=1--"
    ];
    
    for (const description of maliciousDescriptions) {
      try {
        await axios.post(`${BASE_URL}/api/tasks`, {
          description: description
        });
        logError(`Task created with malicious description: ${description}`);
      } catch (error) {
        if (error.response?.status === 401) {
          logSuccess('Task endpoint properly requires authentication');
          break;
        } else if (error.response?.status === 400) {
          logSuccess('Task creation rejected malicious input');
        }
      }
    }
    
  } catch (error) {
    logError(`Task injection test failed: ${error.message}`);
  }
}

// Test 4: Input Sanitization
async function testInputSanitization() {
  logTest('Input Sanitization');
  
  const xssPayloads = [
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "javascript:alert('XSS')",
    "<svg onload=alert('XSS')>",
    "';alert('XSS');//"
  ];
  
  for (const payload of xssPayloads) {
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        email: 'test@example.com',
        password: 'password123',
        firstName: payload,
        lastName: 'User'
      });
      logError(`XSS payload not sanitized: ${payload}`);
    } catch (error) {
      if (error.response?.status === 400) {
        logSuccess(`XSS payload properly rejected: ${payload.substring(0, 30)}...`);
      }
    }
    
    await delay(100);
  }
}

// Test 5: Error Information Disclosure
async function testErrorDisclosure() {
  logTest('Error Information Disclosure');
  
  try {
    // Try to trigger database errors
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: null
    });
  } catch (error) {
    const message = error.response?.data?.message || '';
    
    if (message.includes('SQL') || 
        message.includes('database') || 
        message.includes('postgres') ||
        message.includes('column') ||
        message.includes('table')) {
      logError('Application leaks database information in error messages');
      logError(`Leaked message: ${message}`);
    } else {
      logSuccess('Error messages do not reveal database information');
    }
  }
}

// Main test runner
async function runSQLInjectionTests() {
  log('🛡️  SECURETASK SQL INJECTION PROTECTION TESTS', 'bright');
  log('═'.repeat(60), 'bright');
  log('This script tests the application\'s protection against SQL injection attacks.\n');
  
  try {
    await testLoginSQLInjection();
    await delay(500);
    
    await testRegistrationSQLInjection();
    await delay(500);
    
    await testTaskSQLInjection();
    await delay(500);
    
    await testInputSanitization();
    await delay(500);
    
    await testErrorDisclosure();
    
    log('\n🎉 All SQL injection protection tests completed!', 'green');
    log('Review the results above to verify your application is secure.', 'blue');
    
  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runSQLInjectionTests();
}

module.exports = { runSQLInjectionTests };