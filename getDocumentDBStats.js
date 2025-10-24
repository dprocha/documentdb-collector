function getDetailedInformation() {
  var adminDB = db.getSiblingDB("admin");
  var formatSize = 1024 * 1024 * 1024;
  var totalIndexSize = 0,
      totalStorageSize = 0,
      totalDataSize = 0;

  var result = {
    databases: [],
    totals: {},
    additionalInfo: {}
  };

  function toNumber(value) {
    if (value === undefined || value === null) return 0;
    if (typeof value === "number") return value;
    if (typeof value === "object" && value.toString) {
      // Convert BSON Long / NumberLong / Decimal128 to number or float
      var strVal = value.toString();
      return parseFloat(strVal);
    }
    return Number(value);
  }

  var dbs = adminDB.runCommand({ listDatabases: 1 }).databases;

  dbs.forEach(function (database) {
    if (!/admin|config|local/.test(database.name)) {
      var currentDB = db.getSiblingDB(database.name);
      var stats = currentDB.stats(1);

      var dbInfo = {
        name: database.name,
        collections: toNumber(stats.collections),
        countDocuments: toNumber(stats.objects),
        views: toNumber(stats.views),
        indexes: toNumber(stats.indexes),
        indexSizeGB: parseFloat((toNumber(stats.indexSize) / formatSize).toFixed(2)),
        dataSizeGB: parseFloat((toNumber(stats.dataSize) / formatSize).toFixed(2)),
        storageSizeGB: parseFloat((toNumber(stats.storageSize) / formatSize).toFixed(2))
      };

      totalDataSize += toNumber(stats.dataSize);
      totalStorageSize += toNumber(stats.storageSize);
      totalIndexSize += toNumber(stats.indexSize);

      result.databases.push(dbInfo);
    }
  });

  result.totals = {
    dataSizeGB: parseFloat((totalDataSize / formatSize).toFixed(2)),
    storageSizeGB: parseFloat((totalStorageSize / formatSize).toFixed(2)),
    indexSizeGB: parseFloat((totalIndexSize / formatSize).toFixed(2))
  };

  // Additional cluster/system info
  var serverStatus = adminDB.serverStatus();
  var hostInfo = adminDB.hostInfo();

  if (!serverStatus.errmsg) {
    result.additionalInfo.version = serverStatus.version || null;
    result.additionalInfo.storageEngine = serverStatus.storageEngine
      ? serverStatus.storageEngine.name
      : null;
    result.additionalInfo.cpuCores = hostInfo.system
      ? toNumber(hostInfo.system.numCores)
      : null;
    result.additionalInfo.memoryMB = hostInfo.system
      ? toNumber(hostInfo.system.memSizeMB)
      : null;
    result.additionalInfo.hosts = serverStatus.repl
      ? serverStatus.repl.hosts
      : null;
  }

  // Output strict JSON with double quotes
  print(JSON.stringify(result, null, 2));
}

getDetailedInformation();
