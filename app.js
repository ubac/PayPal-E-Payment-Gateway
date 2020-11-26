const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'ASKD9jRzv3lIob1uDoNaSQpGILC1Se8y6hYwtsVljV9sb-Pcvkpi8R-Cn9lWfuNFxUgegVjWQbqvwwz-',
    'client_secret': 'EII-nAAYId0AXMeFTP4COaMrQyDLmGMK56NJGA1X-Pbv3Uu4ArdPAos5mfTLuaCXs2rlNo5DqTwddv5V'
  });

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

app.post('/pay',(req, res)=>{
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Nvidia 2080 Ti",
                    "sku": "002",
                    "price": "2.00",
                    "currency": "INR",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "INR",
                "total": "2.00"
            },
            "description": "Graphics card for gaming"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if(payment.links[i].rel === 'approval_url'){
                    res.redirect(payment.links[i].href);

                }                
            }            
        }
    });
});

app.get('/success', (req, res)=>{
    const payerId = req.query.PayerId;
    const paymentId = req.query.paymentId

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "INR",
                "total": "2.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    })
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(3000,()=> console.log('server started'));