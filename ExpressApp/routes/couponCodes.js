// jshint esversion:8
const fs = require('fs');
const wordListPath = require('word-list');
const wordArray = fs.readFileSync(wordListPath, 'utf8').split('\n');
const Filter = require('bad-words');
const filter = new Filter();

const mysql = require('mysql');
const mysql_credentials = require(`${homedir}/mysql-credentials.json`);
const mysqlConnection = mysql.createConnection({
  host     : 'localhost',
  user     : mysql_credentials.user,
  password : mysql_credentials.password,
  database : mysql_credentials.database
});

function validWord(notWord, v) {
  if (notWord === v) {
    return false;
  }
  return v.length >= 6 && v.length <= 8 && !filter.isProfane(v);
}

async function insertCouponCode() {

}

// this should synthesize a coupon code,
// and insert rows into the appropriate tables in the mysql wordpress database
// see https://stackoverflow.com/questions/42979138/how-woocommerce-coupons-are-stored-in-database
async function generateCouponCode() {
  wordArray.sort(() => Math.random() - 0.5);
  const word1 = wordArray.find(validWord.bind(null, null));
  const word2 = wordArray.find(validWord.bind(null, word1));
  const couponCode = `${word1}-${word2}`;

  // now that we have a coupon code, it's time to put it in mysql

  return couponCode;
}

module.exports = {
  generateCouponCode
};





/*

POSTS
+-----------------------+---------------------+------+-----+---------------------+----------------+
| Field                 | Type                | Null | Key | Default             | Extra          |
+-----------------------+---------------------+------+-----+---------------------+----------------+
| ID                    | bigint(20) unsigned | NO   | PRI | NULL                | auto_increment |
| post_author           | bigint(20) unsigned | NO   | MUL | 0                   |                |
| post_date             | datetime            | NO   |     | 0000-00-00 00:00:00 |                |
| post_date_gmt         | datetime            | NO   |     | 0000-00-00 00:00:00 |                |
| post_content          | longtext            | NO   |     | NULL                |                |
| post_title            | text                | NO   |     | NULL                |                |
| post_excerpt          | text                | NO   |     | NULL                |                |
| post_status           | varchar(20)         | NO   |     | publish             |                |
| comment_status        | varchar(20)         | NO   |     | open                |                |
| ping_status           | varchar(20)         | NO   |     | open                |                |
| post_password         | varchar(255)        | NO   |     |                     |                |
| post_name             | varchar(200)        | NO   | MUL |                     |                |
| to_ping               | text                | NO   |     | NULL                |                |
| pinged                | text                | NO   |     | NULL                |                |
| post_modified         | datetime            | NO   |     | 0000-00-00 00:00:00 |                |
| post_modified_gmt     | datetime            | NO   |     | 0000-00-00 00:00:00 |                |
| post_content_filtered | longtext            | NO   |     | NULL                |                |
| post_parent           | bigint(20) unsigned | NO   | MUL | 0                   |                |
| guid                  | varchar(255)        | NO   |     |                     |                |
| menu_order            | int(11)             | NO   |     | 0                   |                |
| post_type             | varchar(20)         | NO   | MUL | post                |                |
| post_mime_type        | varchar(100)        | NO   |     |                     |                |
| comment_count         | bigint(20)          | NO   |     | 0                   |                |
+-----------------------+---------------------+------+-----+---------------------+----------------+

POSTMETA
+------------+---------------------+------+-----+---------+----------------+
| Field      | Type                | Null | Key | Default | Extra          |
+------------+---------------------+------+-----+---------+----------------+
| meta_id    | bigint(20) unsigned | NO   | PRI | NULL    | auto_increment |
| post_id    | bigint(20) unsigned | NO   | MUL | 0       |                |
| meta_key   | varchar(255)        | YES  | MUL | NULL    |                |
| meta_value | longtext            | YES  |     | NULL    |                |
+------------+---------------------+------+-----+---------+----------------+
*/