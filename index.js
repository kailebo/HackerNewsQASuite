const { spawn } = require("child_process");
/* 
 # OUTLINE
Thank you for taking the time to review my code. I created a test suite for Hacker News. I broke the 
tests into three categories  each with three tests:
 A - Site Navigation
    .1 Top Bar Navigation  links work
    .2 Search box yields relevant results
    .3 Footer Navigation links work
 B - Displayed Content
    .1 Top 100 Newest Articles are sorted Chronologically
    .2 First few pages of Show section do not contain fundraiser links (as per Hacker News Show rules)
    .3 Displayed Comment Count matches actual number of comments on top articles
 C - User Interactions
    .1 New Users can Create Account
    .2 Users can login and logout
    .3 Users can recover their account through Forgot password with their email

 # TEST DESIGN:
 Page Object Model (POM) Testing:
    - I created class POMs to handle most of the site navigation and element locating code.
    - I setup and access these POM through custom fixtures. In ./POM/pomFixtureExtend.ts you can see how
    I extend the base set of fixtures from playwright/test to include all my POMs and a user profile, which
    allows me to cleanly and quickly access them in each test.
 Data Driven Test Parameters:
    - I created .json test-data files for each of the A and B test which allows you to quickly see
    what setup parameters of the test can be changed and modify them.
    - For the C test I decided to save the test parameter data as a custom user fixture. Mostly
    just to mixup my approach. 
 API Control Email Inbox:
    - I used Mailslurp to create and control an email inbox in test C.3 to test Forgot Password functionality.
   
 # RUNNING TESTS
    - Run all 3 sets of tests by running this file with 'node index.js'
        - Or comment out run some sets at the bottom of this file
    - Running A and B Tests:
        Expect A.1-3, B.1-2 to Pass
        B.3 Occasionally  fails: 
            - Occasionally the displayed comment count does not match the number of displayed comments. Other times the comment page doesn't load
            increase the number of articles checked. Therefore I built in code to retry failed articles a set number of times to distinguish page
            load fails from actual comment count discrepancies
            - I have also manually counted a few time to confirm that sometime there are comment count discrepancies            
    - Running C Tests
        reCaptcha: (manual solving)
         - If you run these test more than once you will likely start getting reCaptcha tests on some steps
         - I have added code that checks for reCaptcha and will pause the test for a little while to give time for user to solve it.
         - Obviously this takes away from these test automation, but I think my overall test design could still run automatically in a
         professional where environment where disabling reCaptcha or paying for a solver could be options.
        Test Config
         - To lower the chances of reCaptchas appearing on first run I removed checking the 'submit' and 'login' buttons from test A.1
         and added a random delay in between actions with slowMo config setting.
*/
//Run node index.js to run all tests
function runTests(testToRun=[]) {
    //Build npx command string based on function inputs
    let runTestsCmd = ['playwright','test']
    if (testToRun ) {
        runTestsCmd.push(...testToRun)        
    }    
    runTestsCmd.push('--project chromium')
    const process = spawn('npx', runTestsCmd, { stdio: 'inherit', shell: true });

    process.on('close', (code) => {
        if (code === 0) {
            console.log('Tests passed')
        } else {
            console.error(`Tests failed with exit code: ${code}`);
            process.exit(code);
        }
    })
}
const testsToRun = []
//Run A tests
testsToRun.push('A-siteNavigation.spec.ts');
//Run B tests
testsToRun.push('B-contentDisplay.spec.ts');
//Run C tests - manual reCaptcha solving required.
// testsToRun.push('C-userInteractions.spec.ts');

runTests(testsToRun);
