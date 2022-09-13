const {status_log_widget} = require('../Helpers/status_log')

exports.oms_report = async (req, res) => {
 
    let {sort_field,sort_value,limit,currPage} = req.query
    let final_out = await status_log_widget(req);
    let [result, countArr] = final_out;
     console.log(result)
    //sorting the data
    if (sort_value == 'ASC') {
        result = result.sort((a, b) => (a[sort_field] > b[sort_field]) ? 1 : ((b[sort_field] > a[sort_field]) ? -1 : 0)); 
    } else {
        result = result.sort((a, b) => (a[sort_field] < b[sort_field]) ? 1 : ((b[sort_field] < a[sort_field]) ? -1 : 0)); 
    }

    //limiting the data based on page number
    let final_limited_out = []
    for (let i = ((currPage-1)*limit); i < (limit*currPage); i++){
        let val = result[i]
        if(val!==(null||undefined))
        final_limited_out.push(val)
    }

    //generating the total pages count
    let count = countArr;
    let pages=0
    if (count < 10) {
        pages=1
    } else {
        pages = Math.ceil(count / 10);
    }
    // console.log("final result",final_limited_out)

    res.send({result:final_limited_out,total_count:count,page_count:pages});
}

exports.widget_count = async (req, res) => {
 
    let [filtered_data] = await status_log_widget(req);
    

    const getCount = (val) => {
        return filtered_data.filter((item) => {
            return item.to_status == val
        }).length
    }

    
    let total_count = filtered_data.length;
    let pending_count = getCount('pending');
    let processing_count = getCount('processing');
    let dispatched_count = getCount('dispatched');
    let delivered_count = getCount('delivered');
    let partials_count = getCount('partials');
    let cancell_count =  getCount('cancelled');

    let final_count_out = [
        {
            title: 'Total',
            value: total_count,
            type:'number'
        },
        {
            title: 'Pending',
            value: pending_count,
            type:'number'
        },
        {
            title: 'Processing',
            value: processing_count,
            type:'number'
        },
        {
            title: 'Dispatched',
            value: dispatched_count,
            type:'number'
        },
        {
            title: 'Delivered',
            value: delivered_count,
            type:'number'
        },
        {
            title: 'Partial',
            value: partials_count,
            type:'number'
        },
        {
            title: 'Cancelled',
            value: cancell_count,
            type:'number'
        }
    ]
       
console.log("final count",final_count_out)
    res.send(final_count_out)
}