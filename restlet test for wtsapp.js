/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 */
define(['N/log'], function (log) {

    function doPost(context) {
        try {
            // Twilio sends data in application/x-www-form-urlencoded
            var from = context.From || '';
            var to = context.To || '';
            var body = context.Body || '';

            // Log inbound message
            log.debug('Inbound WhatsApp', {
                From: from,
                To: to,
                Body: body
            });

            // Example: if user replies "Approve", you can handle logic here
            if (body.toLowerCase().trim() === 'approve') {
                log.debug('Action', 'User approved via WhatsApp');
                // TODO: add logic to update Sales Order, etc.
            }

            if (body.toLowerCase().trim() === 'reject') {
                log.debug('Action', 'User rejected via WhatsApp');
                // TODO: add logic to update Sales Order, etc.
            }

            // Respond back to Twilio
            return {
                message: 'Received message from ' + from + ': ' + body
            };

        } catch (e) {
            log.error('Error in doPost', e);
            return { error: e.message };
        }
    }

    return {
        post: doPost
    };
});
