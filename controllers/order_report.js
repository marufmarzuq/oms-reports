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

//generate order_reports widget count
exports.orderWidgetCount = async (req, res) => {
    let client
    try {
         client = new Client(credentials);
        client.connect();


        let { from_date, to_date } = req.query;
        let query = `select order_status ,count(*) FROM aqai.orders where ((ordered_date >= '${from_date}' and ordered_date <= '${to_date}')) and order_status !='' group by order_status;`;
        let result = await client.query(query);
console.log(result)
console.log(query)
        let final_out = (result.rows).map((item) => {
            console.log(item)
            return {
                title: item.order_status,
                value: item.count,
                type:"number"
            }
        })
        client.end();
        console.log(final_out)
        res.send(final_out)
    }catch (err) {
        console.error(err)
        client.end();
        res.send({msg:'Server Error'})
    }
    
}

//generate order_reports line chart data
exports.orderReportForEachDay = async (req, res) => {
    try {
        let client = new Client(credentials);
        client.connect();

        let { from_date, to_date } = req.query;

    
        let query = `select ordered_date as title,count(id) as value from aqai.orders where ordered_date >= '${from_date}' and ordered_date <= '${to_date}' group by ordered_date ORDER BY ordered_date ;`
        let result = await client.query(query);
        let final_out = (result.rows).map((item) => {
            console.log(item.title)
            return {
                date: dayjs(item.title).format("YYYY-MM-DD"),
                value: +item.value
            }
        })
        client.end();
        res.send({data:final_out})
    }catch (err) {
        console.error(err)
        client.end();
        res.send({msg:'Server Error'})
    }


}

//generate cancellation reasons count 
exports.OrderReportCancelReason = async(req,res) => {
    try {
        let client = new Client(credentials);
        client.connect();

        function addslashes(str) {

            return (str + "").replace(/[\\"']/g, "\\$&").replace(/\u0000/g, "\\0");
        
          }
        
          reason = addslashes(`don't`);
         
        let { from_date, to_date } = req.query;

        let query1 = `select count(*) as option1 from aqai.orders where (ordered_date >= '${from_date}' and ordered_date <='${to_date}') and reason in (E'I have entered wrong details / duplicate order',
    'मैंने गलत मात्रा दर्ज कर दी है',
    'ನಾನು ಪ್ರಮಾಣವನ್ನು ತಪ್ಪಾಗಿ ನಮೂದಿಸಿದ್ದೀನಿ.',
    'ഞാന്‍ തെറ്റായ എണ്ണം ആണ് എന്‍റര്‍ ചെയ്തത്. ',
    'நான் தவறான அளவை உள்ளிட்டேன்',
    'నేను పరిమాణాన్ని తప్పుగా  నమోదు చేశాను'
    )`

        let res1 = await client.query(query1);
        let i_have_entered_wrong_details_duplicate_order = res1.rows[0].option1;


        let query2 = `select count(*) as option2 from aqai.orders where (ordered_date >= '${from_date}' and ordered_date <='${to_date}') and reason in (E'I have placed the order only for product / service enquiry','कम-से-कम ऑर्डर मात्रा अधिक है। मैं कम मात्रा में फिर से ऑर्डर करना चाहता/चाहती हूं।',
    'ಆರ್ಡರ್ ಕನಿಷ್ಟ ಪ್ರಮಾಣಕ್ಕಿಂತ ಹೆಚ್ಚಾಗಿದೆ. ನಾನು ಕಡಿಮೆ ಪ್ರಮಾಣವನ್ನು ಮತ್ತೆ ಆರ್ಡರ್ ಮಾಡಲು ಬಯಸುತ್ತೇನೆ.',
    'മിനിമം എണ്ണം കൂടുതല്‍ ആണ്. ഞാന്‍ കുറഞ്ഞ എണ്ണത്തിന് റീ-ഓര്‍ഡര്‍ ചെയ്യാന്‍ ആഗ്രഹിക്കുന്നു.',
    'குறைந்தபட்ச ஆர்டர் அளவு அதிகமாக இருக்கிறது. நான் குறைந்த அளவிற்கு மீண்டும் ஆர்டர் செய்ய விரும்புகிறேன்.',
    'కనీస ఆర్డర్ పరిమాణం ఎక్కువగా ఉంది. నేను మరొకసారి తక్కువ పరిమాణానికి ఆర్డర్ చేయాలనుకుంటున్నాను.')`
        let res2 = await client.query(query2);
        let i_have_placed_the_order_only_for_product_service_enquiry = res2.rows[0].option2;
    

        let query3 = `select count(*) as option3 from aqai.orders where (ordered_date >= '${from_date}' and ordered_date <='${to_date}') and reason in (E'I wish to order less quantity / less price',
    'मैंने उत्पाद संबंधित पूछताछ करने के लिए ग्राहक सेवा से बात करने का ऑर्डर दिया।',
    'ನಾನು ಉತ್ಪನ್ನದ ಬಗ್ಗೆ ವಿಚಾರಿಸಲು ಗ್ರಾಹಕ ಸೇವಾಕೇಂದ್ರದೊಂದಿಗೆ ಮಾತನಾಡಲು ಆರ್ಡರ್ ಮಾಡಿದೆ',
    'കസ്റ്റമര്‍ സര്‍വീസുമായി സംസാരിച്ച് ഈ ഉല്‍പ്പന്നത്തെപ്പറ്റി അന്വേഷിക്കുവാന്‍ വേണ്ടിയാണ് ഞാന്‍ ഓര്‍ഡര്‍ ചെയ്തത്. ',
    'ஒரு தயாரிப்பை பற்றி விசாரணை செய்ய வாடிக்கையாளர் சேவையுடன் பேசுவதற்கு ஆர்டர் செய்துள்ளேன்.',
    'ప్రొడక్ట్ గురించి విచారించడం కొరకు కస్టమర్ సర్వీస్ తో మాట్లాడటానికి నేను ఆర్డర్ చేశాను.'
    )`
        let res3 = await client.query(query3);
        let I_wish_to_order_less_quantity_less_price = res3.rows[0].option3;

        let query4 = `select count(*) as option4 from aqai.orders where (ordered_date >= '${from_date}' and ordered_date <='${to_date}') and reason in (E'No response or support from customer care',
    'मैंने गलत पता दर्ज कर दिया',
    'ನಾನು ತಪ್ಪಾದ ವಿಳಾಸ ನೀಡಿದ್ದೇನೆ',
    'ഞാന്‍ തെറ്റായ വിലാസം ആണ് എന്‍റര്‍ ചെയ്തത്.',
    'நான் தவறான முகவரியை உள்ளிட்டேன்.',
    'నేను చిరునామా ను తప్పుగా నమోదు చేశాను')`
        let res4 = await client.query(query4);
        let no_response_or_support_from_customer_care = res4.rows[0].option4;

        let query5 = `select count(*) as option5 from aqai.orders where (ordered_date >= '${from_date}' and ordered_date <='${to_date}') and reason in (E'Delivery is delayed. I ${reason} need the product now ', 'डुप्लीकेट ऑर्डर','ನಕಲಿ ಆರ್ಡರ್','ഡ്യൂപ്ലിക്കേറ്റ് ഓര്‍ഡര്‍','மீண்டும் செய்யப்பட்ட ஆர்டர்.','డూప్లికేట్ ఆర్డర్')`
        let res5 = await client.query(query5);
        let delivery_is_delayed_i_dont_need_the_product_now = res5.rows[0].option5;
        

        let query6 = `select count(*) as option6 from aqai.orders where (ordered_date >= '${from_date}' and ordered_date <='${to_date}') and reason in (E'I have changed my mind. But I might order later. ',
    ' कीमत ज्यादा है।','ಬೆಲೆ ಹೆಚ್ಚಾಗಿದೆ.','വില കൂടുതല്‍ ആണ്.','விலை அதிகமாக உள்ளது.','ధర ఎక్కువగా ఉంది.')`
    
        let res6 = await client.query(query6);
        let i_have_changed_my_mind_but_i_might_order_later = res6.rows[0].option6;
        


        let query7 = `select count(reason) from aqai.orders where reason is not null and reason != 'null'`
        let res7 = await client.query(query7);
        let overall_count = res7.rows[0].count;
        

        let others_count = overall_count - (+(i_have_entered_wrong_details_duplicate_order) +
            +(i_have_placed_the_order_only_for_product_service_enquiry) +
            +(I_wish_to_order_less_quantity_less_price) +
            +(no_response_or_support_from_customer_care) +
            +(delivery_is_delayed_i_dont_need_the_product_now) +
            +(i_have_changed_my_mind_but_i_might_order_later)
            )
        
        

        let final_res = [
            {
                label: `I have entered wrong details / duplicate order`,
                value: +i_have_entered_wrong_details_duplicate_order,
                type:'number',
                fill:"orange"
            },
            {
                label: `I have placed the order only for product / service enquiry`,
                value: +i_have_placed_the_order_only_for_product_service_enquiry,
                type:'number',
                fill:"#47c5f4"
            },
            {
                label: `I wish to order less quantity / less price`,
                value: +I_wish_to_order_less_quantity_less_price,
                type:'number',
                fill:"#82ca9d"
            },
            {
                label: `No response or support from customer care`,
                value: +no_response_or_support_from_customer_care,
                type:'number',
                fill:"#875fc0"
            },
            {
                label: `Delivery is delayed. I don\'t need the product now. `,
                value: +delivery_is_delayed_i_dont_need_the_product_now,
                type:'number',
                fill:"yellow"
            },
            {
                label: `I have changed my mind. But I might order later. `,
                value: +i_have_changed_my_mind_but_i_might_order_later,
                type:'number',
                fill:"#ffb72c"
            },
            {
                label: 'Others',
                value: +others_count,
                type:'number',
                fill:"#eb4786"
            }

        
        ] 
        client.end();
        res.send(final_res)

    } catch (err) {
        console.error(err)
        client.end();
        res.send({msg:'Server Error'})
    }
}
