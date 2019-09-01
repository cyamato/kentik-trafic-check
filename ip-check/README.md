# IBM TOC IP Activity Lookup

This is a quick and dirty tool for unauthenticated check if there is any data in Kentik for an IP Address.  On the backend, this tool is written in Javascript using Restify on NodeJS.  The frontend is written in Javascript using the React framework.  There are two versions of this project.  The first, IP-Check, provides only basic information as too if there is data and how much has been sent or received by that IP Address in the last 30 days.  The second, IP-Activity, provides more detail including top-10 talkers and where it was seen.  The config.yaml file located in the root of each version provides all of the settings and authentication to the Kentik Data Engine API. 

## Getting Started

To start either version of this project enter the root for that version and use the command
```
npm start
```
This will load that version of this project using a PM2 process controller

### Prerequisites

Node version v11.9.0
NPM version v6.9.0

### Installing

Clone the git repository to an empty directory.  Enter the root directory for the version you would like to run.  Use NPM to install being sure the copy and execute the PM2 command given at the end.  The project will be running.

```
git clone https://github.com/cyamato/ip-check.git
cd ./<ip-check | ip-activity>
npm install
```

## Built With
* [NodeJS](http://www.nodejs.org/) - Server Side Javascript Engine
* [NPM](https://www.npmjs.com/) - Node Package Manager
* [PM2](https://pm2.io/) - Process Manager
* [Rrestify](https://www.restify.com) - Backend NodeJS Framework
* [React](https://www.reactjs.org) - Frontend Javascript Framework
* [React-i18lnext](https://react.i18next.com) - Internationalization Framework
* [Kentik](https://www.kentik.com) - Kentik Dataengine APIs

## Authors

* **Craig Yamato** - *Initial work* - [Craig](https://github.com/cyamato)

See also the list of [contributors](https://github.com/cyamato/ip-check/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
