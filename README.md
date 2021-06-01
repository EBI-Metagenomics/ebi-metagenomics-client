[![Testing](https://github.com/EBI-Metagenomics/ebi-metagenomics-client/actions/workflows/test.yml/badge.svg?branch=new-client)](https://github.com/EBI-Metagenomics/ebi-metagenomics-client/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/EBI-Metagenomics/ebi-metagenomics-client/branch/new-client/graph/badge.svg?token=WyXvRIQvq8)](https://codecov.io/gh/EBI-Metagenomics/ebi-metagenomics-client)

# ebi-metagenomics-client

This is the source ocode for the future version of the Mgnify website

#### Requirements:

-   Node.js >=10.13.0

#### How to setup your project?

Export the following env variables in env-config.sh file. Adjust exports if need depending on whether you are in your dev or
prod environment.

```
source env-config.sh
```

##### Run `npm install` in the project's main directory.

Serve with own server, or use built-in dev system by calling 'npm run server:watch'' in main directory.

```
export DEPLOYMENT_SUBFOLDER=“/metagenomics”;
npm install

npm run watch

```
