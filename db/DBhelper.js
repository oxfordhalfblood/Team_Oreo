const sqlite3 = require ('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let db = new sqlite3.Database("./db/nodupli.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log("sucessfully connected to nodupli database.");
});

function Dbhelper() {
    /* Constructor */
}

/* Functions on DOCUMENT table */
Dbhelper.prototype.addDocument = function(username, filename, oldfilename, date, transactionId, callback) {
    let sql = "insert into DOCUMENT (username, filename, oldfilename, dateupld, transactionId) VALUES (?, ?, ?, ?,?);";
    let values = [username, filename, oldfilename, date, transactionId];

    db.serialize(function() {
        db.run(sql, values, callback);
    });
};

Dbhelper.prototype.getDocuments = function(username, callback) {
    let sql = "select filename, oldfilename, dateupld, transactionId from DOCUMENT  where username = ?;";
    let values = [username];

    db.serialize(function() {
        db.all(sql, values, function (err, rows) {
            let arr = [];
            if (err) {
                console.error(err);
            }
            else {
                rows.forEach(function (row) {
                    let d = new Date(row.dateupld);

                    arr.push({
                        ["filename"]: row.filename,
                        ["oldfilename"]: row.oldfilename,
                        ["date"]: d.toLocaleDateString() + " " + d.toLocaleTimeString(),
                        ["transactionId"]: row.transactionId
                    });
                });
            }
            callback(arr);
        });
    });
};

Dbhelper.prototype.deleteDocument = function(filename, callback) {
    let sql = `delete from DOCUMENT where filename = ?;`;
    let values = filename;

    db.serialize(function() {
        db.run(sql, values, function (err) {
            if (err) {
                callback(err);
            } else {
                /* Remove the physical file */
                let filePath = path.join(__dirname, '..', 'uploads', filename);
                fs.unlinkSync(filePath);
                callback(false);
            }
        });
    });
};

/* This shouldn't be here but whatever..
* Takes a filename to absolute path, reads the file contents, returns it to the callback
* along with any errors that have occurred. Errors are handled in the callback so the server
* can respond as appropriate. */
Dbhelper.prototype.getDocumentContent = function (filename, callback) {
    let filePath = path.join(__dirname, '..', 'uploads', filename);

    fs.readFile(filePath, 'utf8', callback);
};

Dbhelper.prototype.saveDocumentContent = function (filename, content, callback) {
    let filePath = path.join(__dirname, '..', 'uploads', filename);

    fs.writeFile(filePath, content, 'utf8', callback);
};


/* Functions on USER table */
Dbhelper.prototype.getAllUsers = function(callback) {
    db.serialize(function() {
        db.all("SELECT * FROM USER;", callback)
    });
};

Dbhelper.prototype.getUser = function(id, callback) {
    db.serialize(function() {
        db.all("SELECT * FROM USER where username = '" + id + "'", callback)
    });
};

Dbhelper.prototype.addUser = function(username, fname, lname, usertype, password, callback) {
    let sql = "insert into USER (username, fname, lname, usertype, passwd) VALUES (?, ?, ?, ?, ?);";
    let values = [username, fname, lname, usertype, password];

    db.serialize(function() {
        db.run(sql, values, callback);
    });
};

Dbhelper.prototype.deleteUser = function(username, callback) {
    let sql = `delete from  USER where username = ?;`;
    let values = username;

    db.serialize(function() {
        db.run(sql, values, callback);
    });
};

Dbhelper.prototype.updateUserFullname = function (username, fname, lname, callback) {
    let sql = `update USER set fname = ?, lname = ? where username = ?;`;
    let values = [fname, lname, username];

    db.serialize(function() {
        db.run(sql, values, callback);
    });
};

Dbhelper.prototype.updateUserPassword = function (username, passwd, callback) {
    let sql = `update USER set passwd = ? where username = ?;`;
    let values = [passwd, username];

    db.serialize(function() {
        db.run(sql, values, callback);
    });
};

Dbhelper.prototype.test = function () {

};

Dbhelper.prototype.test2 = function () {
    this.getDocuments("ia000", function (results) {
        for (i=0; i<results.length; i++) {
            console.log(results[i]["filename"] + " " + results[i]["date"]);
        }
    });
};

Dbhelper.prototype.test1 = function () {
    let arr = [];
    this.getDocuments("ia000", f);
    function f(err, rows) {
        if(err){
            console.error(err);
        }
        else {
            rows.forEach(function(row) {
                let d = new Date(row.dateupld);
                let item = {
                    ["filename"]: row.filename,
                    ["date"]: d.toLocaleDateString() + " " + d.toLocaleTimeString()
                };

                //console.log(row.filename + " " + d.toLocaleDateString() + " " + d.toLocaleTimeString());
                arr.push(item);
            });
        }
        for (i=0; i<arr.length; i++) {
            console.log(arr[i]["filename"] + arr[i]["date"]);
        }
    }
};
module.exports = Dbhelper;