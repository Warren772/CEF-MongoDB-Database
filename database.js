const username = 'CHANGEME';
const password = 'CHANGEME';
const clusterUrl = 'CHANGEME'
const databaseName = 'CHANGEME'

exports.url = "mongodb://" + username + ":" + password + "@" + clusterUrl + "?authSource="  + databaseName ;
exports.databaseName = databaseName; 
