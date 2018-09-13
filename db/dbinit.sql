/* Drop schema */
DROP TABLE IF EXISTS DOCUMENT;
DROP TABLE IF EXISTS USER;
DROP TABLE IF EXISTS USERTYPE;

/* Create schema */
CREATE TABLE USERTYPE(
	usertype	VARCHAR(20)     NOT NULL,
	CONSTRAINT USERTYPE_PKEY PRIMARY KEY(usertype));

CREATE TABLE USER(
	username	VARCHAR(10)     NOT NULL,
	fname		VARCHAR(20)     NOT NULL,
	lname		VARCHAR(20)     NOT NULL,
    usertype	VARCHAR(20)     NOT NULL,
    passwd		VARCHAR(20)     NOT NULL,
	CONSTRAINT USER_PKEY PRIMARY KEY(username),
	CONSTRAINT USER_FKEY FOREIGN KEY(usertype) REFERENCES USERTYPE(usertype));
        
CREATE TABLE DOCUMENT(
	username	VARCHAR(10)     NOT NULL,
	filename	VARCHAR(300)    NOT NULL,
	oldfilename	VARCHAR(300)    NOT NULL,
	dateupld	VARCHAR(20)		NOT NULL,
	CONSTRAINT DOCUMENT_FKEY FOREIGN KEY(username) REFERENCES USER(username),
    CONSTRAINT DOCUMENT_PKEY PRIMARY KEY(filename, username),
    CONSTRAINT DOCUMENT_UNIQUE UNIQUE(filename));
    
    

/* Populate schema */
INSERT INTO USERTYPE(usertype) VALUES("admin");
INSERT INTO USERTYPE(usertype) VALUES("student");

INSERT INTO USER(username, fname, lname, usertype, passwd) VALUES("ia000", "ifran", "A", "admin", "ifran000");
INSERT INTO USER(username, fname, lname, usertype, passwd) VALUES("jd002", "john", "D", "student", "john001");
INSERT INTO USER(username, fname, lname, usertype, passwd) VALUES("dj003", "darryl", "J", "student", "dj002");

INSERT INTO DOCUMENT(username, filename, dateupld) VALUES("dj003", "dj003_20180818.txt", '2018-08-18');
INSERT INTO DOCUMENT(username, filename, dateupld) VALUES("dj003", "dj003_20180814.txt", '2018-08-14');
INSERT INTO DOCUMENT(username, filename, dateupld) VALUES("dj003", "dj003_20180812.txt", '2018-08-12');
