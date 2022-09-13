const pkg = require("pg");
const { Client } = pkg;
const dotenv = require("dotenv");
const dayjs = require('dayjs');


dotenv.config();
const credentials = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};


exports.status_log_widget = async (req) => {
    
    const client = new Client(credentials);
    await client.connect();

    let { date } = req.query;
    date = dayjs(date).format('DD/MM/YYYY')
    console.log(date)
    let filteredArr = (arr) =>
    {
        let res=[]
        arr.map((item) => {
        item.status_log.forEach((ele) => {
            if (ele.changed_date === date) {
                ele["order_id"] = item["order_id"]
                res.push(ele)
            }
        })
        delete item["order"]
        })
        
        return res
    }



    let query = `SELECT order_id,status_log FROM aqai.order_items WHERE status_log @> '[{"changed_date": "${date}"}]';`
    let result = await client.query(query);
  console.log(result.rows)
    let final_out = filteredArr(result.rows);
    let count = final_out.length
  
    console.log("final out",result.rows)

    client.end();
    return ([final_out,count]);


}