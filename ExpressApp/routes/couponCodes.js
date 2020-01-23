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

Each new Coupon gets one row in POSTS and the following rows in POSTSMETA (for example)
+-------+-------------+---------------------+---------------------+--------------+--------------+--------------------------------------------------------------------------------+-------------+----------------+-------------+---------------+-------------+---------+--------+---------------------+---------------------+-----------------------+-------------+-----------------------------------------------------------------+------------+-------------+----------------+---------------+
| ID    | post_author | post_date           | post_date_gmt       | post_content | post_title   | post_excerpt                                                                   | post_status | comment_status | ping_status | post_password | post_name   | to_ping | pinged | post_modified       | post_modified_gmt   | post_content_filtered | post_parent | guid                                                            | menu_order | post_type   | post_mime_type | comment_count |
+-------+-------------+---------------------+---------------------+--------------+--------------+--------------------------------------------------------------------------------+-------------+----------------+-------------+---------------+-------------+---------+--------+---------------------+---------------------+-----------------------+-------------+-----------------------------------------------------------------+------------+-------------+----------------+---------------+
| 25243 |           1 | 2020-01-07 07:16:26 | 2020-01-07 12:16:26 |              | free4members | If you are an IG member you can use this coupon to take core classes for free. | publish     | closed         | closed      |               | free2member |         |        | 2020-01-20 17:31:54 | 2020-01-20 22:31:54 |                       |           0 | https://ithacagenerator.org/?post_type=shop_coupon&#038;p=25243 |          0 | shop_coupon |                |             0 |
+-------+-------------+---------------------+---------------------+--------------+--------------+--------------------------------------------------------------------------------+-------------+----------------+-------------+---------------+-------------+---------+--------+---------------------+---------------------+-----------------------+-------------+-----------------------------------------------------------------+------------+-------------+----------------+---------------+

+---------+---------+------------------------+------------------+
| meta_id | post_id | meta_key               | meta_value       |
+---------+---------+------------------------+------------------+
|  747040 |   25243 | _edit_lock             | 1579661282:1     |
|  747041 |   25243 | _edit_last             | 1                |
|  747042 |   25243 | discount_type          | fixed_product    |
|  747043 |   25243 | coupon_amount          | 20               | <-
|  747044 |   25243 | individual_use         | no               |
|  747045 |   25243 | usage_limit            | 0                |
|  747046 |   25243 | usage_limit_per_user   | 0                |
|  747047 |   25243 | limit_usage_to_x_items | 0                |
|  747048 |   25243 | usage_count            | 0                |
|  747049 |   25243 | date_expires           | 1583038800       | <- that's a unix timestamp, set it to sometime way in the future
|  747050 |   25243 | free_shipping          | no               |
|  747051 |   25243 | exclude_sale_items     | no               |
|  747056 |   25243 | product_categories     | a:1:{i:0;i:140;} |
+---------+---------+------------------------+------------------+
*/