[![Testing](https://github.com/EBI-Metagenomics/ebi-metagenomics-client/actions/workflows/test.yml/badge.svg?branch=new-client)](https://github.com/EBI-Metagenomics/ebi-metagenomics-client/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/EBI-Metagenomics/ebi-metagenomics-client/branch/new-client/graph/badge.svg?token=WyXvRIQvq8)](https://codecov.io/gh/EBI-Metagenomics/ebi-metagenomics-client)

# ebi-metagenomics-client
[React](https://reactjs.org)-based web frontend for 
[MGnify, the EBI metagenomics resource](https://www.ebi.ac.uk/metagenomics). 

#### Requirements:

- Node.js >=10.13.0

#### How to setup your project?

**MGnify-web**
It is usually preferable to use the [mgnify-web parent repo](https://github.com/EBI-Metagenomics/mgnify-web) for development.
The parent repo lets you work on the API and this client side-by-side.

To work on the web client alone, you can connect to one of the remote MGnify APIs:
Export the following env variables in env-config.sh file. 
Adjust exports if need depending on whether you are in your dev or
prod environment.

```bash
source env-config.sh
```

If you are using [Webstorm](https://www.jetbrains.com/webstorm/), 
there are run configurations to import in `.idea/runConfigurations`. 

##### Run `npm install` in the project's main directory.

Serve with own server, or use built-in dev system by calling 'npm run server:watch'' in main directory.

```bash
npm install
npm run start --watch
```

#### Integration tests
Start the frontend as above, then use the Cypress test suite:
```bash
npm test
```

Or for a single test file e.g.:
```bash
cypress run --spec cypress/integration/index.js
```