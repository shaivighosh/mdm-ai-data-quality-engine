var apiKey = apiKeySecret;


var attributeMap = new java.util.HashMap();
attributeMap.put("Product Name", node.getValue("ProductName_001").getSimpleValue());
attributeMap.put("Material", node.getValue("Material_001").getSimpleValue());
attributeMap.put("Dimensions", node.getValue("Dimensions_001").getSimpleValue());


var productDetails = "";
var it = attributeMap.entrySet().iterator();

while (it.hasNext()) {
    var entry = it.next();
    productDetails += entry.getKey() + ": " + entry.getValue() + "\n";
}

var promptText = "Write a 2-sentence marketing description using ONLY the following attributes:\n" + productDetails;


var payload = {
  "contents": [{
    "parts": [{ "text": promptText }]
  }]
};

var apiPath = "/v1beta/models/gemini-2.5-flash:generateContent";
var request = giep.post().path(apiPath);

var queryMap = new java.util.HashMap();
queryMap.put("key", apiKey);

request.pathQuery(queryMap);
request.header("Content-Type", "application/json");
request.body(JSON.stringify(payload));

var maxRetries = 2;
var attempt = 0;
var success = false;

while (attempt < maxRetries && !success) {

    try {

        logger.info("Calling Gemini API. Attempt: " + (attempt + 1));

        var responseObj = request.invoke();
        var jsonResponse = JSON.parse(responseObj);


        if (jsonResponse 
            && jsonResponse.candidates 
            && jsonResponse.candidates.length > 0 
            && jsonResponse.candidates[0].content 
            && jsonResponse.candidates[0].content.parts 
            && jsonResponse.candidates[0].content.parts.length > 0) {

            var aiResult = jsonResponse.candidates[0].content.parts[0].text;

            node.getValue("MarketingDescription").setSimpleValue(aiResult);

            success = true;
            logger.info("Gemini desc OK.");

        } else {
            logger.info("Gemini response NOT OK.");
        }

    } catch (e) {

        logger.info("Gemini call failed: " + e);

       
        try {
            java.lang.Thread.sleep(6000);  
        } catch (e) {
            logger.info("Sleep interrupted: " + e);
        }

        attempt++;
    }
}

if (!success) {
    logger.info("Gemini enrichment failed after retries.");
}