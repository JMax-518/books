const path = require('path');
const electron = require('frappejs/client/electron');
const { writeFile } = require('frappejs/server/utils');
const appClient = require('../client');
const SetupWizard = require('../setup');

(async () => {
    const configFilePath = path.join(require('os').homedir(), '.config', 'frappe-accounting', 'settings.json');

    let settings, dbPath;
    try {
        settings = require(configFilePath);
    } catch(e) {
        settings = {}
    }

    if (settings.dbPath) {
        dbPath = settings.dbPath;
        electron.start({
            dbPath,
            models: require('../models')
        }).then(() => {
            appClient.start();
        });
    } else {
        const setup = new SetupWizard();
        window.setup = setup;
        const values = await setup.start();
        const {
            companyName,
            file,
            country,
            name,
            email,
            abbreviation,
            bankName
        } = values;

        dbPath = path.join(file[0].path, companyName + '.db');

        electron.start({
            dbPath,
            models: require('../models')
        }).then(async () => {
            await writeFile(configFilePath, JSON.stringify({
                directory: path.dirname(dbPath),
                dbPath: dbPath
            }));

            const doc = await frappe.getDoc('AccountingSettings');

            await doc.set('companyName', companyName);
            await doc.set('file', dbPath);
            await doc.set('country', country);
            await doc.set('fullname', name);
            await doc.set('email', email);
            await doc.set('abbreviation', abbreviation);
            await doc.set('bankName', bankName);

            await doc.update();

            appClient.start();
        })
    }


})();

