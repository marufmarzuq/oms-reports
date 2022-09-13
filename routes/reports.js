const express = require("express");
const router = express.Router();




const { oms_report,widget_count} = require("../controllers/status_report");
const{getSalesOrderReport, getSalesWidget} = require ("../controllers/so_invoice_report")
const{getProductReports} = require("../controllers/product_report")
const {orderWidgetCount,orderReportForEachDay,OrderReportCancelReason} = require('../controllers/order_report')
const {get_bu_types} = require ("../controllers/product")

router.get("/get-sales-order",getSalesOrderReport)
router.get("/get-sales-widget", getSalesWidget)
router.get("/get-bu-types", get_bu_types)

router.get("/get-product-report",getProductReports)

router.get('/get-order-report-widget', orderWidgetCount);
router.get('/get-order-count-for-each-day', orderReportForEachDay);
router.get('/get-order-cancellation-count', OrderReportCancelReason);

router.get('/get-status-log', oms_report);
router.get('/get-status-log-widget', widget_count);


module.exports = router;