// jshint esversion:8
const fs = require('fs');
const wordListPath = require('word-list');
const wordArray = fs.readFileSync(wordListPath, 'utf8').split('\n');
const Filter = require('bad-words');
const filter = new Filter();
const uuidv4 = require('uuid/v4');

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

// executes the query, and on success returns the
async function executeQuery(query, params=null) {
  let args = [query];
  if(params) {
    args.push(params);
  }

  return await new Promise((r, j) => {
    mysqlConnection.query(...args, function (error, results, fields) {
      if (error) {
        j(error);
      } else {
        r({results, fields});
      }
    });
  });
}

async function insertCouponCode(couponcode, name) {
  let insertid = '';
  const prefix = mysql_credentials.prefix;
  const now = moment().format('YYYY-MM-DD HH:mm:ss');
  const now_gmt = moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss');

  const params1 = {now, now_gmt, couponcode};
  const query1 = `INSERT INTO ${prefix}posts SET post_author=1, post_date=NOW(), post_date=:now, post_date_gmt=:now_gmt, post_content='', post_title=:couponcode, post_excerpt='As an IG member ${mysql.escape(name)} can use this coupon to take core classes for free.', post_status='publish', comment_status='closed', ping_status='closed', post_password='', post_name='${couponcode}', to_ping='', pinged='', post_modified=:now, post_modified_gmt=:now_gmt, post_content_filtered='', post_parent=0, guid='https://ithacagenerator.org/?post_type=shop_coupon&#038;p=${uuidv4()}', menu_order=0, post_type='shop_coupon', post_mime_type='', comment_count=0`;
  const {results1, fields1} = await executeQuery(query1, params1);
  if (!results1.insertId) {
    throw {message: 'POST INSERT failed in insertCouponCode, no insertId returned'};
  }
  insertId = results1.insertId;

  const query2 = `UPDATE ${prefix}posts SET guid='https://ithacagenerator.org/?post_type=shop_coupon&#038;p=:insertId' WHERE ID=:insertId`;
  const params2 = {insertId};

  await executeQuery(query2, params2);

  const query3 = `INSERT INTO ${prefix}postmeta (post_id, meta_key, meta_value) VALUES (:insertId, '_edit_lock', '1579822317:5'), (:insertId, '_edit_last', '5'), (:insertId, 'discount_type', 'percent'), (:insertId, 'coupon_amount', '100'), (:insertId, 'individual_use', 'no'), (:insertId, 'usage_limit', '0'), (:insertId, 'usage_limit_per_user', '0'), (:insertId, 'limit_usage_to_x_items '0'), (:insertId, 'usage_count', '0'), (:insertId, 'date_expires', '2147483647'), (:insertId, 'free_shipping', 'no'), (:insertId, 'exclude_sale_items', 'no'), (:insertId, 'product_categories', 'a:1:{i:0;i:140;}')`;
  const params3 = {insertId};

  await executeQuery(query3, params3);

  return true;
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
| 25243 |           1 | 2020-01-07 07:16:26 | 2020-01-07 12:16:26 |              | free4members | If you are an IG member you can use this coupon to take core classes for free. | publish     | closed         | closed      |               | free2member |         |        | 2020-01-22 22:01:08 | 2020-01-23 03:01:08 |                       |           0 | https://ithacagenerator.org/?post_type=shop_coupon&#038;p=25243 |          0 | shop_coupon |                |             0 |
+-------+-------------+---------------------+---------------------+--------------+--------------+--------------------------------------------------------------------------------+-------------+----------------+-------------+---------------+-------------+---------+--------+---------------------+---------------------+-----------------------+-------------+-----------------------------------------------------------------+------------+-------------+----------------+---------------+

TWO STEPS TO INSERT THIS
(1) INSERT INTO ${prefix}posts SET post_author=1, post_date=NOW(), post_date='${moment().format('YYYY-MM-DD HH:mm:ss')}', post_date_gmt='${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}', post_content='', post_title='${couponcode}', post_excerpt='As an IG member ${name} can use this coupon to take core classes for free.', post_status='publish', comment_status='closed', ping_status='closed', post_password='', post_name='${couponcode}', to_ping='', pinged='', post_modified='${moment().format('YYYY-MM-DD HH:mm:ss')}', post_modified_gmt='${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}', post_content_filtered='', post_parent=0, guid='https://ithacagenerator.org/?post_type=shop_coupon&#038;p=${uuid}', menu_order=0, post_type='shop_coupon', post_mime_type='', comment_count=0
(2) UPDATE ${prefix}posts SET guid='https://ithacagenerator.org/?post_type=shop_coupon&#038;p=${insertid}' WHERE ID=${insertid}


+---------+---------+------------------------+------------------+
| meta_id | post_id | meta_key               | meta_value       |
+---------+---------+------------------------+------------------+
|  747040 |   25243 | _edit_lock             | 1579822317:5     | <- just use this value
|  747041 |   25243 | _edit_last             | 5                | <- just use this value
|  747042 |   25243 | discount_type          | percent          | <- just use this value
|  747043 |   25243 | coupon_amount          | 100              | <- just use this value
|  747044 |   25243 | individual_use         | no               | <- just use this value
|  747045 |   25243 | usage_limit            | 0                | <- just use this value
|  747046 |   25243 | usage_limit_per_user   | 0                | <- just use this value
|  747047 |   25243 | limit_usage_to_x_items | 0                | <- just use this value
|  747048 |   25243 | usage_count            | 0                | <- just use this value
|  747049 |   25243 | date_expires           | 1583038800       | <- this is a unix timestamp, set it to 2^31-1 = 2147483647 on creation
|  747050 |   25243 | free_shipping          | no               | <- just use this value
|  747051 |   25243 | exclude_sale_items     | no               | <- just use this value
|  747056 |   25243 | product_categories     | a:1:{i:0;i:140;} | <- just use this value; emprically derived for 'core classes' product category
+---------+---------+------------------------+------------------+    no idea what the format of the meta_value is...

ISSUE ONE MULTI INSERT QUERY ACCORDINGLY

INSERT INTO ${prefix}postmeta(post_id, meta_key, meta_value) VALUES
(${insertid}, '_edit_lock',             '1579822317:5'),
(${insertid}, '_edit_last',             '5'),
(${insertid}, 'discount_type',          'percent'),
(${insertid}, 'coupon_amount',          '100'),
(${insertid}, 'individual_use',         'no'),
(${insertid}, 'usage_limit',            '0'),
(${insertid}, 'usage_limit_per_user',   '0'),
(${insertid}, 'limit_usage_to_x_items', '0'),
(${insertid}, 'usage_count',            '0'),
(${insertid}, 'date_expires',           '2147483647'),
(${insertid}, 'free_shipping',          'no'),
(${insertid}, 'exclude_sale_items',     'no'),
(${insertid}, 'product_categories',     'a:1:{i:0;i:140;}');

*/