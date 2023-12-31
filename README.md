# wallet-backend

App URL :     https://wallet-frontend.onrender.com/
Swagger Url : https://wallet-backend-ffne.onrender.com/api/docs/

Its free hosting service, so it will spin down with inactivity. It may take some time to initialise the server on first hit.

===================================================Steps to run the project=========================================================

1. npm i
2. In the .env file in root directory,
        give database connection string for ATLAS_DNS. You can also use local mongodb service
        The structure is as follows  :
        ATLAS_DNS = [database connection string]
        PORT= [port number to run server]
3. run script => npm run start:local
4. After Starting the server, you can access the swagger UI for the application endpoints using :
        http://localhost:[PORT]/api/docs/
        The api documentation is provided in swagger.
5. You can run the test cases using  "npm run testWithCoverage" . It will also generate coverage of the test cases provided. Make sure your server is turned off while running test cases.



===================================================Project structure=========================================================

1. The server related code is maintained in main.js.
2. express-validator is used as middleware for validating incoming requests. The validation functions are maintained in respective files in validator directory.
3. The business logic is wriiten in respectives files in service directory.
4. Mongoose ODM is used for database connection and operations.
5. Jest is being used for unit testing.