
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

mongo localhost:27017/jobs -unaukri -pnaukri

http://docs.mongodb.org/manual/reference/configuration-options/