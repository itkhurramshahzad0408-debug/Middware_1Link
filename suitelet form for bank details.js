/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/record', 'N/https', 'N/encode', 'N/log'],
    function (ui, record, https, encode, log) {

        var CLIENT_ID = '96e753e193f8dd58ac86807c60299a11';
        var CLIENT_SECRET = '101e673862bcba10a747d7dff697ce87';
        var TOKEN_URL = 'https://sandboxapi.1link.net.pk/uat-1link/sandbox/oauth2/token';
        var IBFT_URL = 'https://sandboxapi.1link.net.pk/uat-1link/sandbox/funds-transfer-rest-service/path-1';
        function onRequest(context) {
            try {
                if (context.request.method === 'GET') {
                    // Load Vendor
                    var vendorId = context.request.parameters.recordId;
                    var vendorRec = record.load({ type: record.Type.VENDOR, id: vendorId });

                    var form = ui.createForm({ title: 'Pay Vendor via 1LINK' });

                    // Vendor Fields (auto-populated, read-only)
                    var fldVendorName = form.addField({
                        id: 'custpage_vendor_name',
                        type: ui.FieldType.TEXT,
                        label: 'Vendor Name'
                    });
                    fldVendorName.defaultValue = vendorRec.getValue('companyname');
                    fldVendorName.updateDisplayType({ displayType: ui.FieldDisplayType.INLINE });

                    var fldVendorAccount = form.addField({
                        id: 'custpage_vendor_account',
                        type: ui.FieldType.TEXT,
                        label: 'Vendor Bank Account'
                    });
                    fldVendorAccount.defaultValue = vendorRec.getValue('custentity_vendor_bank_account');
                    fldVendorAccount.updateDisplayType({ displayType: ui.FieldDisplayType.INLINE });

                    // hidden field to carry vendorId
                    form.addField({
                        id: 'custpage_vendor_id',
                        type: ui.FieldType.TEXT,
                        label: 'Vendor ID'
                    }).defaultValue = vendorId;

                    // Sender Fields (user input)
                    form.addField({
                        id: 'custpage_sender_account',
                        type: ui.FieldType.TEXT,
                        label: 'Sender Bank Account'
                    });

                    form.addField({
                        id: 'custpage_from_bankimd',
                        type: ui.FieldType.TEXT,
                        label: 'From Bank IMD (Sender Bank)'
                    });

                    form.addField({
                        id: 'custpage_to_bankimd',
                        type: ui.FieldType.TEXT,
                        label: 'To Bank IMD (Vendor Bank)'
                    });

                    form.addField({
                        id: 'custpage_pan',
                        type: ui.FieldType.TEXT,
                        label: 'Sender PAN (Card Number)'
                    });

                    form.addField({
                        id: 'custpage_expiry',
                        type: ui.FieldType.TEXT,
                        label: 'Card Expiry Date (MMYY)'
                    });

                    form.addField({
                        id: 'custpage_amount',
                        type: ui.FieldType.CURRENCY,
                        label: 'Payment Amount'
                    });

                    form.addField({
                        id: 'custpage_location',
                        type: ui.FieldType.TEXT,
                        label: 'Merchant Location'
                    });

                    form.addField({
                        id: 'custpage_city',
                        type: ui.FieldType.TEXT,
                        label: 'Merchant City'
                    });

                    form.addSubmitButton('Make Payment');
                    context.response.writePage(form);

                } else {
                    // POST: User submitted the form
                    var vendorId = context.request.parameters.custpage_vendor_id;
                    var senderAcc = context.request.parameters.custpage_sender_account;
                    var fromBankIMD = context.request.parameters.custpage_from_bankimd;
                    var toBankIMD = context.request.parameters.custpage_to_bankimd;
                    var pan = context.request.parameters.custpage_pan;
                    var expiry = context.request.parameters.custpage_expiry;
                    var amount = context.request.parameters.custpage_amount;
                    var vendorAcc = context.request.parameters.custpage_vendor_account;
                    var vendorName = context.request.parameters.custpage_vendor_name;
                    var location = context.request.parameters.custpage_location;
                    var city = context.request.parameters.custpage_city;

                    // Step 1: Get OAuth2 token
                    var tokenResponse = https.post({
                        url: TOKEN_URL,
                        body: 'grant_type=client_credentials'
                            + '&client_id=' + encodeURIComponent(CLIENT_ID)
                            + '&client_secret=' + encodeURIComponent(CLIENT_SECRET)
                            + '&scope=1LinkApi',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    });

                    var tokenResult = JSON.parse(tokenResponse.body);
                    if (!tokenResult.access_token) {
                        throw new Error('Failed to retrieve access token: ' + tokenResponse.body);
                    }
                    var accessToken = tokenResult.access_token;

                    // --- Generate system values ---
                    var now = new Date();
                    var transmissionDateTime = zeroPad(now.getMonth() + 1, 2) +
                        zeroPad(now.getDate(), 2) +
                        zeroPad(now.getHours(), 2) +
                        zeroPad(now.getMinutes(), 2) +
                        zeroPad(now.getSeconds(), 2);
                    var stan = zeroPad(Math.floor(Math.random() * 999999), 6);
                    var time = zeroPad(now.getHours(), 2) +
                        zeroPad(now.getMinutes(), 2) +
                        zeroPad(now.getSeconds(), 2);
                    var date = zeroPad(now.getMonth() + 1, 2) +
                        zeroPad(now.getDate(), 2);
                    var rrn = zeroPad(Math.floor(Math.random() * 999999999999), 12);

                    // --- Step 2: Build payload ---
                    var payload = {
                        "TransactionAmount": zeroPad(amount, 12),
                        "TransmissionDateAndTime": transmissionDateTime,
                        "STAN": stan,
                        "Time": time,
                        "Date": date,
                        "MerchantType": "0003",
                        "FromBankIMD": fromBankIMD,
                        "RRN": rrn,
                        "CardAcceptorTerminalId": "40260275",
                        "CardAcceptorIdCode": "402626030259047",
                        "CardAcceptorNameLocation": {
                            "Location": location,
                            "City": city,
                            "Country": "PK"
                        },
                        "CurrencyCodeTransaction": "586",
                        "AccountNumberFrom": senderAcc,
                        "AccountNumberTo": vendorAcc,
                        "ToBankIMD": toBankIMD,
                        "PAN": pan,
                        "ExpiryDate": expiry,
                        "PosEntryMode": "021"
                    };

                    log.debug("IBFT Payload", JSON.stringify(payload));

                    // Step 3: Call IBFT API
                    var ibftResponse = https.post({
                        url: IBFT_URL,
                        body: JSON.stringify(payload),
                        headers: {
                            'Authorization': 'Bearer ' + accessToken,
                            'Content-Type': 'application/json',
                            'X-IBM-Client-Id': CLIENT_ID
                        }
                    });

                    log.debug("IBFT Response", ibftResponse.body);

                    var responseJson = {};
                    try {
                        responseJson = JSON.parse(ibftResponse.body);
                    } catch (e) {
                        responseJson = {};
                    }
                    var message;
                    if (ibftResponse.code == 200 || responseJson.ResponseCode == "00") {
                        message = "Payment Successful via 1LINK";
                    } else {
                        message = "Payment Failed: " + (responseJson.ResponseDetail || "Unknown Error");
                    }

                    // --- Update vendor record comments field ---
                    record.submitFields({
                        type: record.Type.VENDOR,
                        id: vendorId,
                        values: {
                            comments: message
                        }
                    });
                    // context.response.write('<html><body><script>window.close();</script></body></html>');
                    // --- Send message back to browser ---
                    var html = '<html><body><script>'
                        + 'alert("' + message.replace(/"/g, '') + '");'
                        + 'if (window.opener) { window.opener.location.reload(); }'
                        + 'window.close();'
                        + '</script></body></html>';
                    context.response.write(html);
                }
            } catch (e) {
                log.error('Error in Suitelet', e);
                context.response.write('Error: ' + e.message);
            }
        }
        function zeroPad(num, width) {
            num = num + '';
            while (num.length < width) {
                num = '0' + num;
            }
            return num;
        }


        return { onRequest: onRequest };
    });
