const fs = require('fs');
const execSync = require('child_process').execSync;

module.exports = function(context) {
    const basePath = context.opts.projectRoot;
    const baseWWW = basePath + '/www';

console.log(basePath + "/../");
    process.chdir(basePath + '/../');
    console.log("Compilando aplicacao...");

//    execSync("ng build --prod --base-href .",{stdio:[0,1,2]});
//    execSync("ng build --prod --base-href . --env=cstar-hmg",{stdio:[0,1,2]});
    execSync("ng build --prod --base-href . --env=cstar-prd",{stdio:[0,1,2]});

    var files = fs.readdirSync(baseWWW);
    for (var i = 0; i < files.length; i++) {
      if (files[i].endsWith('.gz')) {
        fs.unlinkSync(baseWWW + '/' + files[i]);
      }
    }
    fs.writeFileSync(baseWWW + '/.gitignore');
};
