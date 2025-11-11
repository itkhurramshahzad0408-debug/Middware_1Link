/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/currentRecord', 'N/https', 'N/url', 'N/ui/dialog'], function (currentRecord, https, url, dialog) {

    function pageInit(context) {
        // This is required so the script has a valid entry point.
        console.log('Client Script Loaded Successfully');
    }

    function callLink1API() {
        try {
            var record = currentRecord.get();
            debugger;
            var recordId = record.id;
            // id want to use custom middlware
            // var response = https.post({
            //     url: 'https://middleware-zzzzzzzzzzzzzzzz.vercel.app/api/testLink1',
            //     body: JSON.stringify(payload),
            //     headers: {
            //         'Content-Type': 'application/json'
            //     }
            // });

            var suiteletUrl = url.resolveScript({
                scriptId: 'customscript_sw_suitlet_for_1link',
                deploymentId: 'customdeploy_sw_suitlet_for_1link',
                params: {
                    'recordId': recordId
                }
            });
            var width = 600;
            var height = 400;

            // calculate position for center
            var left = (screen.width / 2) - (width / 2);
            var top = (screen.height / 2) - (height / 2);

            // open centered popup
            window.open(
                suiteletUrl,
                'popup',
                'width=' + width + ',height=' + height +
                ',top=' + top + ',left=' + left +
                ',resizable=yes,scrollbars=yes'
            );

            // POST request with payload
            // var response = https.post({
            //     url: suiteletUrl,
            //     body: JSON.stringify(payload),
            //     headers: {
            //         'Content-Type': 'application/json'
            //     }
            // });
        } catch (e) {
            alert('Error occurred: ' + e.name + ' - ' + e.message);
            console.log('Exception Details:', e);
        }
    }

    return {
        pageInit: pageInit,
        callLink1API: callLink1API
    };
});
