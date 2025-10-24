# DocumentDB Database Stats Collector

The purpose of this script is to collect the data required by a MongoDB Solutions Architect to perform a cluster sizing analysis from DocumentDB to MongoDB.

This guide shows you how to:
1. Create a read-only monitoring user for Amazon DocumentDB
2. Connect to the cluster using `mongosh`
3. Run the `getDocumentDBStats.js` script to output cluster/database stats as valid JSON

## Prerequisites
1. Download and install [Mongo Shell](https://www.mongodb.com/docs/mongodb-shell/)
2. Download the stats script to a terminal that will be used to access the cluster
3. DB User with Sufficient Permissions. Admin/Root acceptable, Minimum noted below.
4. An Amazon DocumentDB cluster up and **`available`**
5. Network access to the cluster (public access or VPN/bastion/SSM tunnel)
6. The following info from the AWS Console:
  - Cluster endpoint (e.g. `docdb-cluster.cluster-abcdefghij.us-east-1.docdb.amazonaws.com`)
  - Port (default: `27017`)
  - Admin username and password
  - The Amazon RDS CA bundle file: `ca-bundle.pem`

## 1.  Create User to execute Script
Example command for creating a database user with the minimum required permissions:
```javascript
db.getSiblingDB("admin").createUser({
    user: "ADMIN_USER",
    pwd: "ADMIN_PASSWORD",
    roles: ["readAnyDatabase", "clusterMonitor" ]
})
```

## 2. Execute Script using Mongo Shell CLI
 * Considering that javascript file is in the current directory
```bash
mongosh 'xxx.us-east-2.docdb.amazonaws.com:27017' getDocumentDBStats.js --tls --tlsCAFile {your-global-bundle.pem} --retryWrites=false --username {username} --password {password} > output.json

```

## 3. Output JSON

* [Example of output.json](output.json)
* Send the output file to the MongoDB Solutions Architect for analysis.