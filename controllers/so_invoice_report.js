const pkg = require("pg");
const { Client } = pkg;
const dotenv = require("dotenv");

dotenv.config();
const credentials = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

exports.getSalesOrderReport = async (req, res) => {
  let { filters, sort, currPage, limit, start_date, end_date } = req.query;
  // console.log(currPage, limit,start_date,end_date)
  let client = new Client(credentials);
  client.connect();
  // sort = JSON.parse(sort)
  let sort_key = sort
    ? `ORDER BY ${sort["field"]} ${sort["value"]}`
    : "ORDER BY id DESC";
  let limits = `LIMIT ${limit}`;
  let filter_key = `ordered_date >= '${start_date}' AND ordered_date <= '${end_date}'`;
  let offset = `OFFSET ${(currPage - 1) * limit}`;
  // filters ,pagination, limit and offset logic block ////////////////////////

  // Pagination block ends here ////////////////////////////////////////////////////////////
  let so_data;
  //   if(filters){
  //     filters = JSON.parse(filters);
  // for (let i = 0; i < filters.length; i++) {
  //       filter_key = filter_key + ` AND ${filters[i]["field"]} = ${filters[i]["value"]}`
  // }

  let count_query = `SELECT count(id) from aqai.orders where ${filter_key}`;
  let count_result = await client
    .query(count_query)
    .catch((err) => console.log(err));
  let count = count_result.rows[0].count;

  let pages = 0;

  if (count < 10) {
    pages = 1;
  } else {
    pages = Math.ceil(count / 10);
  }

  console.log(pages);

  let sales_order_report_query = `SELECT id,sales_order_no,net_amount,ordered_date,invoice_no,final_order_amount
   FROM aqai.orders WHERE ${filter_key} GROUP BY id ${sort_key} ${offset} ${limits}`;

  // console.log(sales_order_report_query)
  let sales_order_report_result = await client
    .query(sales_order_report_query)
    .catch((err) => console.log(err));
  so_data = sales_order_report_result.rows;
  // }
  client.end();
  res
    .status(200)
    .send({ result: so_data, total_count: count, page_count: pages });
};

exports.getSalesWidget = async (req, res) => {
  let { filters, sort, currPage, limit, start_date, end_date } = req.query;
  console.log("hi");
  let client = new Client(credentials);
  client.connect();
  let so_report_widget_query = `SELECT id,sales_order_no,invoice_no,net_amount,ordered_date FROM aqai.orders WHERE ordered_date >= '${start_date}' AND ordered_date <= '${end_date}'`;
  let so_report_widget_result = client
    .query(so_report_widget_query)
    .then(async (resp) => {
      let final_output = await processSoInvoiceData(resp.rows);
      res.send({ status : true, msg : "SO/Invoice Widget Data",data: final_output });
    })
    .catch((err) => {
      console.log(err);
    });

  const processSoInvoiceData = (orderData) => {
    let res_arr = [];
    let reference = {
      total_orders: 0,
      total_sales_orders: 0,
      total_sales_order_revenue: 0,
      total_invoice_revenue: 0,
      total_invoices: 0,
    };
    orderData.forEach((element) => {
      reference["total_orders"] += 1;
      if (element.sales_order_no) {
        reference["total_sales_orders"] += 1;
        reference["total_sales_order_revenue"] =
          +reference["total_sales_order_revenue"] + +element.net_amount;
      }
      if (element.invoice_no) {
        reference["total_invoices"] += 1;
        reference["total_invoice_revenue"] =
          +reference["total_invoice_revenue"] + +element.net_amount;
      }
    });

    reference["pending_invoices"] =
      reference["total_sales_orders"] - reference["total_invoices"];
    reference["pending_revenue"] =
      reference["total_sales_order_revenue"] -
      reference["total_invoice_revenue"];

    console.log(reference);

    let generateDataFormat = (title, value, type) => {
      return { title: title, value: value, type: type };
    };

    res_arr.push(generateDataFormat("Total orders",Number(reference["total_orders"]),"number"));
    res_arr.push(generateDataFormat("Total sales orders",Number(reference["total_sales_orders"]),"number"));
    res_arr.push(generateDataFormat("Total sales order revenue",Number(reference["total_sales_order_revenue"]).toFixed(2),"currency"));
    res_arr.push(generateDataFormat("Total invoices",Number(reference["total_invoices"]),"number"));
    res_arr.push(generateDataFormat("Total invoice revenue",Number(reference["total_invoice_revenue"]).toFixed(2),"currency"));
    res_arr.push(generateDataFormat("Pending invoices",Number(reference["pending_invoices"]).toFixed(2),"number"));
    res_arr.push(generateDataFormat("Pending invoice revenue",Number(reference["pending_revenue"]).toFixed(2),"currency"));

    return res_arr;
  };
};
