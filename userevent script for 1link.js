/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/ui/serverWidget', 'N/log'], function(ui, log) {
    function beforeLoad(context) {
        try{
        if (context.type === context.UserEventType.VIEW) {
            var form = context.form;
            form.addButton({
                id: 'custpage_send_to_link1',
                label: 'Send to 1LINK',
                functionName: 'callLink1API'
            });

           form.clientScriptModulePath = 'SuiteScripts/client script for 1link.js';
        }
    }catch(e){
        log.debug('exeption', e);
    }
    }
    return { beforeLoad: beforeLoad };
});
