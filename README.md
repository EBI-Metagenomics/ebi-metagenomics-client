[![Build Status](https://travis-ci.org/EBI-Metagenomics/ebi-metagenomics-client.svg?branch=master)](https://travis-ci.org/EBI-Metagenomics/ebi-metagenomics-client)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/a6b6fad49bc34f10b3498086faacbde6)](https://www.codacy.com/app/mb1069/ebi-metagenomics-client?utm_source=github.com&utm_medium=referral&utm_content=EBI-Metagenomics/ebi-metagenomics-client&utm_campaign=Badge_Coverage)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/a6b6fad49bc34f10b3498086faacbde6)](https://www.codacy.com/app/mb1069/ebi-metagenomics-client?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=EBI-Metagenomics/ebi-metagenomics-client&amp;utm_campaign=Badge_Grade)
 # ebi-metagenomics-client
#### Requirements:
 - npm >= 5.3.0
 - nginx
 
#### How To Install Nginx on Ubuntu 14.04 LTS?

```
sudo apt-get update
sudo apt-get install nginx

sudo service nginx start
sudo service nginx stop
```

#### How to configure Nginx on Ubuntu 14.04?

```
sudo nano /etc/nginx/nginx.conf
//Add server details and project distribution (dist dir) location

sudo service nginx restart
```


#### How to install NodeJs including npm on Debian and Ubuntu based Linux distributions?
https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions

#### How to setup your project?
Export the following env variables in env-config.sh file. Adjust exports if need depending on whether you are in your dev or
prod environment.

```
source env-config.sh
```

##### Run 'npm install' in the project's main directory.
 Serve with own server, or use built-in dev system by calling 'npm run server:watch'' in main directory.
 Access local web server under http://localhost:9000/index.html .
```
export DEPLOYMENT_SUBFOLDER=“/metagenomics”;
npm install

npm run watch 

OR with server:
npm run server:watch
```

If you are working with the [webkit](https://github.com/EBI-Metagenomics/ebi-metagenomics-webkit) as well you can use [npm link](https://docs.npmjs.com/cli/link) to build a symbolic link in the node_modules folder.