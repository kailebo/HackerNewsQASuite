const { spawn } = require("child_process");

//Run node index.js to run all tests
function runTests(testToRun='') {
    //Build npx command string based on function inputs
    let runTestsCmd = ['playwright','test']
    if (testToRun ) {
        runTestsCmd.push(testToRun)        
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

runTests();
