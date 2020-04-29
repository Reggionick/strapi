'use strict';

const path = require('path');
const fs = require('fs-extra');
const { green, yellow } = require('chalk');
// eslint-disable-next-line node/no-extraneous-require
const strapiAdmin = require('strapi-admin');
const { getConfigUrls } = require('strapi-utils');

const loadConfigFile = require('../load/load-config-files');
const addSlash = require('../utils/addSlash');
/**
 * `$ strapi build`
 */
module.exports = async ({ clean, optimization }) => {
  const dir = process.cwd();
  const env = process.env.NODE_ENV || 'development';

  const envConfigDir = path.join(dir, 'config', 'environments', env);

  if (!fs.existsSync(envConfigDir)) {
    console.log(
      `Missing environment config for env: ${green(env)}.\nMake sure the directory ${yellow(
        `./config/environments/${env}`
      )} exists`
    );
    process.exit(1);
  }

  const conf = await loadConfigFile(envConfigDir, 'server.+(js|json)');
  const { serverUrl, adminPath } = getConfigUrls(conf, true);

  console.log(`Building your admin UI with ${green(env)} configuration ...`);

  if (clean) {
    await strapiAdmin.clean({ dir });
  }

  return strapiAdmin
    .build({
      dir,
      // front end build env is always production for now
      env: 'production',
      optimize: optimization,
      options: {
        backend: serverUrl,
        publicPath: addSlash(adminPath),
      },
    })
    .then(() => {
      process.exit();
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
};
