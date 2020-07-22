const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');

const src = __dirname;

// Required inputs
const token = core.getInput('token')

// These are option configurations for the @actions/exec lib`
let output = '';
let err = '';
const options = {};
options.listeners = {
    stdout: (data) => {
        output += data.toString();
    },
    stderr: (data) => {
        err += data.toString();
    }
};
options.cwd = './';


//Install VirtoCommerce.GlobalTool
async function installVcGlobalTool() {
    try {
        await exec.exec(`dotnet`, ['tool', 'install', '--global', 'VirtoCommerce.GlobalTool', '--version', '1.0.0'], options);
        console.log('VirtoCommerce.GlobalTool installed')
    } catch (err) {
        core.setFailed(`Could not Install VirtoCommerce.GlobalTool because: ${err.message}`);
        process.exit(1);
    }
}

//SonarCloud Begin
async function beginSonarCloud() {
    console.log('SonarCloud Begin')
    try {
        
        repoName = github.context.repo.repo.substring(github.context.repo.repo.indexOf('/') + 1);
        branchName = github.context.eventName === 'pull_request' ? github.context.payload.pull_request.head.ref : github.context.ref;
        if (branchName.indexOf('refs/heads/') > -1) {
            branchName = branchName.slice('refs/heads/'.length);
        }
    
        commandStr = "dotnet sonarscanner begin /k:'VirtoCommerce_" + repoName + "'";
        commandStr += " /o:'virto-commerce'";
        commandStr += " /d:sonar.host.url='https://sonarcloud.io'";
        commandStr += " /d:sonar.login='" + token + "'";
        commandStr += " /d:sonar.branch='" + branchName + "'";

        await exec.exec(`commandStr`, [], options);
    } catch (err) {
        core.setFailed(`Could not Begin SonarCloud because: ${err.message}`);
        process.exit(1);
    }

}

//SonarCloud build
async function buildSonarCloud() {
    console.log('SonarCloud build')
    try {
        await exec.exec(`vc-build`, ['Compile'], options);
    } catch (err) {
        core.setFailed(`Could not Build SonarCloud because: ${err.message}`);
        process.exit(1);
    }

}

//SonarCloud End
async function endSonarCloud() {
    console.log('SonarCloud End')
    try {
        commandStr = "dotnet sonarscanner end /d:sonar.login=" + token;
        await exec.exec(`vc-build`, ['Compile'], options);
    } catch (err) {
        core.setFailed(`Could not End SonarCloud because: ${err.message}`);
        process.exit(1);
    }

}



//Build Package
async function buildPackage() {
    try {
        await exec.exec(`vc-build`, ['Compress', '-skip', 'Test'], options);
        console.log('Package build')
    } catch (err) {
        core.setFailed(`Could not Build Package because: ${err.message}`);
        process.exit(1);
    }
}


try {
    beginSonarCloud().then(result => { 
        buildSonarCloud().then(result =>{
            endSonarCloud()
        }); 
    });
} catch (error) {
    core.setFailed(error.message);
}