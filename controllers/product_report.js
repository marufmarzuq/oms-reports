const pkg = require("pg");
const { Client } = pkg;
const dotenv = require("dotenv");
const dayjs = require("dayjs");

dotenv.config();
const credentials = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

exports.getProductReports = async (req, res) => {
  let { filters, sort, currPage, limit, start_date, end_date } = req.query;
console.log(start_date, end_date)
  let client = new Client(credentials);
  let product_data_query = `SELECT oi.product_id,p.name_en as product_name,AVG(oi.product_price) as average_product_price,
   SUM(oi.mortality) total_mortality,SUM(oi.line_total) as total_sales,
   SUM(oi.quantity) as total_quantity,SUM(oi.product_count) as total_count 
   FROM aqai.order_items oi left join aqai.products p on p.id = oi.product_id 
   WHERE ordered_date >= '${start_date}' AND ordered_date <= '${end_date}' AND oi.item_status != 'cancelled'
   GROUP BY oi.product_id,p.name_en`;
  client.connect();
  let product_data_result = await client.query(product_data_query).then((resp) => {
      // resp.rowCount &&
      console.log(resp.rows)
        res
          .status(200)
          .send({ status: true, msg: "All product Data", result: resp.rows });
    })
    .catch((err) =>
      res
        .status(500)
        .send({ status: true, msg: "Sorry ! Something went wrong" })
    );
    client.end()
};
