
#!shell
sequelize-auto -o "./models" -d jobscrapping -h localhost -u jobscrapping -p 3306 -x job@123# -e mysql


grant all privileges on jobscrapping.* to 'jobscrapping'@'localhost' with grant option;



# MongoDb Download url
https://www.mongodb.com/download-center/community

## Mongodb Compass
https://www.mongodb.com/download-center/compass

https://docs.mongodb.com/compass/master/install/

## Mongodb Compass Documentation
https://docs.mongodb.com/compass/master/


# Moongoose Documentation
https://mongoosejs.com/docs/api.html


https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose



# MongoDb Compass Location
cd /home/digiapt/code/project/python/jobs/mongodb-compass_1.20.5_amd64/usr/bin


https://medium.com/mongoaudit/how-to-enable-authentication-on-mongodb-b9e8a924efac

db.createUser(
  {
    user: "naukri",
    pwd: "naukri",
    roles: [ { role: "readWrite", db: "jobs" } ]
  }
)

mongo localhost:27017/jobs -u naukri -p naukri

http://docs.mongodb.org/manual/reference/configuration-options/

Open /etc/mongod.conf with your favorite code editor and search for the following lines:

security:
    authorization: "enabled"

sudo systemctl restart mongodb

db.createUser(
  {
    user: "root",
    pwd: "root",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  }
)

sudo ufw allow from 172.17.0.1 to any port 27017





mongo mongodb://root:root@localhost:27017


mongo 172.105.35.196:27017/jobs -u naukri -p naukri

mongo 172.105.35.196:27017/jobs -u root -p root


mongo -u root -p --authenticationDatabase admin --host localhost

mongo "mongodb://naukri:naukri@localhost:27017/jobs?keepAlive=true&poolSize=30&autoReconnect=true&socketTimeoutMS=360000&connectTimeoutMS=360000"


mongo "mongodb://naukri:naukri@172.105.35.196:27017/jobs?keepAlive=true&poolSize=30&autoReconnect=true&socketTimeoutMS=360000&connectTimeoutMS=360000"

https://docs.mongodb.com/manual/mongo/
