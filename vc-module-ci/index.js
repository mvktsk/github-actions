const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');

const src = __dirname;

// These are option configurations for the @actions/exec lib`
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
        
        let err = '';

        await exec.exec(`dotnet`, ['tool', 'install', '--global', 'VirtoCommerce.GlobalTool', '--version', '1.0.0'], options);
        
    } catch (err) {
        core.setFailed(`Could not Install VirtoCommerce.GlobalTool because: ${err.message}`);
        process.exit(1);
    }
    return result;
}

//Build Package
async function buildPackage() {
    try {
        
        let err = '';

        await exec.exec(`vc-build`, ['Compress', '-skip', 'Test'], options);
        
    } catch (err) {
        core.setFailed(`Could not Build Package because: ${err.message}`);
        process.exit(1);
    }
    return result;
}


try {
    installVcGlobalTool().then(result => { 
        buildPackage(); 
    })
} catch (error) {
    core.setFailed(error.message);
}