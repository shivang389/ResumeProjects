#!/usr/bin/env node

/**
 * Master Test Runner
 * 
 * Runs all security tests for SecureTask application
 */

const { runBruteForceTests } = require('./brute-force-test');
const { runSQLInjectionTests } = require('./sql-injection-test');

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

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runAllTests() {
  log('🔐 SECURETASK COMPREHENSIVE SECURITY TEST SUITE', 'bright');
  log('═'.repeat(70), 'bright');
  log('Running all security tests to verify application protection\n');

  try {
    // Run SQL Injection Tests
    log('Starting SQL Injection Tests...', 'blue');
    await runSQLInjectionTests();
    await delay(2000);

    // Run Brute Force Tests
    log('\nStarting Brute Force Protection Tests...', 'blue');
    await runBruteForceTests();

    log('\n🎉 ALL SECURITY TESTS COMPLETED SUCCESSFULLY!', 'green');
    log('Your SecureTask application has been thoroughly tested.', 'blue');

  } catch (error) {
    log(`\n❌ Test suite failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run all tests
runAllTests();