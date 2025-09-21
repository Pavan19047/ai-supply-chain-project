import * as functions from "firebase-functions";

// Simple health check function
export const api = functions.https.onRequest((request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (request.method === "OPTIONS") {
    response.status(200).send();
    return;
  }
  
  if (request.path === "/health" || request.path === "/api/health") {
    response.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      message: "AI Supply Chain API is running on Firebase!" 
    });
    return;
  }
  
  response.json({ 
    message: "AI Supply Chain Management API",
    endpoints: ["/health"],
    version: "1.0.0",
    deployed: new Date().toISOString()
  });
});