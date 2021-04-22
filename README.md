# DIG31-backend
DIG31 - UX3 Backend

## Getting started:

1. Ensure NodeJs is installed by typing: `node -v` in the directory's terminal. If not, install NodeJs and continue with these instructions.

2. To setup using the package.json file (i.e. pulled from github), all you need to do is run:  
    2.1 `npm init -y` to initialise the directory using default values  
    2.2 `npm install` to install all dependencies listed in the packate.json file.  

    2.3 Alternatively, run the following commands:  
            2.3.1 `npm i dotenv`  
            2.3.2 `npm i express express-jwt jsonwebtoken mongoose mongoose-type-email cors`  
            2.3.3 `npm i -g nodemon`  

3. To start run `nodemon server.js` OR `npm run dev` (if runing nodemon, refer to package.json for dev dependency)

Deviations from A2:
- Some schema models modified to improve interconnectivity e.g. placeName, type, activityHistory, imageURL, activityDuration were included as references to other entities rathern than stand-alone entities.
- Same for itemId of ActivityHistory?