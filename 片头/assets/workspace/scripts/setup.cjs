const fs = require('node:fs');
const path = require('node:path');
const {root, systemInfo, platformError, prepareDependencies} = require('./runtime.cjs');
async function main() {
  console.log('系统识别：' + JSON.stringify(systemInfo()));
  const error = platformError();
  if (error) throw Error(error);
  prepareDependencies();
  await require('./resources.cjs').prepareResources();
  const browser = await require('@remotion/renderer').ensureBrowser({chromeMode: 'headless-shell'});
  fs.mkdirSync(path.join(root, '.runtime'), {recursive: true});
  fs.writeFileSync(path.join(root, '.runtime/browser.json'), JSON.stringify({path: browser.path}, null, 2));
  require('./doctor.cjs').doctor();
}
if (require.main === module) main().catch(error => {console.error(error.message); process.exitCode = 1;});
module.exports = {main};
