logger.info("AI Quality Check BR started for node: " + node.getID());

var descVal = node.getValue("MarketingDescription");
var currentDesc = descVal ? String(descVal.getSimpleValue()) : "";

logger.info("MarketingDescription value: " + currentDesc);

if (!currentDesc || currentDesc.trim().length < 20) {
    logger.info("Description too short. Skipping AI call.");
    updateAIHistory("F", "REJECTED", "Description missing or too short.");
    return;
}

logger.info("Description length OK. Sending to AI.");


var prompt =
"Evaluate the following product description.\n" +
"Grade it from A-F based on:\n" +
"1. clarity\n" +
"2. technical completeness\n" +
"3. use of product attributes\n\n" +
"Return JSON only in this format:\n" +
"{grade, reason}\n\n" +
"Description:\n" + currentDesc;

logger.info("Prompt prepared.");


var payload = {
    "contents": [{
        "parts": [{ "text": prompt }]
    }],
    "generationConfig": {
        "responseMimeType": "application/json"
    }
};

logger.info("Payload created.");
var apiKey = apiKeySecret;

try {

    logger.info("Calling Gemini API...");

    var request = giep.post().path("v1beta/models/gemini-2.5-flash:generateContent");
    var queryMap = new java.util.HashMap();
	queryMap.put("key", apiKey);
    request.pathQuery(queryMap);
    request.body(JSON.stringify(payload));

    var responseObj = request.invoke();

    logger.info("API response received.");

    //var rawResponse = responseObj.asString();
    //logger.info("Raw response: " + rawResponse);

    //var result = JSON.parse(rawResponse);
    var result = JSON.parse(responseObj);

    var aiText = result.candidates[0].content.parts[0].text;
    logger.info("AI returned text: " + aiText);

    var aiEval = JSON.parse(aiText);

    var grade = String(aiEval.grade).toUpperCase();
    var status = "REJECTED";

    logger.info("AI Grade: " + grade);
    logger.info("AI Reason: " + aiEval.reason);

    if (grade == "A" || grade == "B") {
        status = "APPROVED";
    }

    logger.info("Final status decided: " + status);

    updateAIHistory(grade, status, aiEval.reason);

} catch (e) {

    logger.info("Quality Check Failed: " + e);

}



function updateAIHistory(grade, status, reason) {

    logger.info("Updating AI audit history...");

    var localNode = manager.getProductHome().getProductByID(node.getID());

    logger.info("Fetched product: " + localNode.getID());

    var dataContainer = localNode.getDataContainerByTypeID("AI_Audit_Log");

    if (dataContainer != null) {

        logger.info("AI_Audit_Log container found.");

        var entry = dataContainer.addDataContainer().createDataContainerObject(null);

        logger.info("New audit entry created.");

        entry.getValue("QualityGrade_Attr").setSimpleValue(grade);
        entry.getValue("QualityFeedback_Attr").setSimpleValue(reason);
        entry.getValue("AI_Status").setSimpleValue(status);
        
	   var workflowID = manager.getWorkflowHome().getWorkflowByID("NewItemIntroduction");
//		if(localNode.isInState("NewItemIntroduction","Review")){
//			if(entry.getValue("AI_Status").getSimpleValue() == "APPROVED"){
//				localNode.getWorkflowInstance(workflowID).getTaskByID("Review").triggerLaterByID("Validated", "Quality check passed");
//				logger.info("Initiated to Final State");
//			}
//			else if(entry.getValue("AI_Status").getSimpleValue() == "REJECTED"){
//				localNode.getWorkflowInstance(workflowID).getTaskByID("Review").triggerLaterByID("Reject", "Quality check faild");
//				logger.info("Initiated to Review State");
//			}
//		}
	   localNode.getWorkflowInstance(workflowID).setSimpleVariable("AI Status", entry.getValue("AI_Status").getSimpleValue());
	   logger.info("AI Status is after setting ===== "+localNode.getWorkflowInstance(workflowID).getSimpleVariable("AI Status"));
	   
        var formatter = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        var date = formatter.format(new java.util.Date());

        entry.getValue("AI_Quality_LastChecked").setSimpleValue(date);

        logger.info("Audit entry saved. Grade: " + grade + " Status: " + status);

    } else {

        logger.warning("Data Container 'AI_Audit_Log' not found on object.");

    }
}