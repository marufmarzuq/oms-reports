const pkg = require("pg");
const { Client } = pkg;
const dotenv = require("dotenv");
const res = require("express/lib/response");

dotenv.config();
const credentials = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};

exports.get_bu_types = async (req, res) => {
    ////declaring the client
    let client = new Client(credentials);
    /////connecting db
    await client.connect();
    //////query
    let bu_query = `select id,name from aqai.product_business_type pbt`
    /////querying the db
    client.query(bu_query).then((resp) => {
        console.log(resp)
        ////then it is success
        res.send({
            status: true, 
            msg: "List of bu types", 
            data: resp.rows
        })
    }).catch((err) => {
        ///catch means failure
        res.send({
            status: false, 
            msg: "something went wrong", 
        })
    })
}

