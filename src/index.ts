import { server as WebSocketServer } from "websocket";
import http from "http";

// Create HTTP server
const httpServer = http.createServer((request, response) => {
  console.log(new Date() + " Received request for " + request.url);
  response.writeHead(404);
  response.end();
});

httpServer.listen(8080, () => {
  console.log(new Date() + " Server is listening on port 8080");
});

// Create WebSocket server
const wsServer = new WebSocketServer({
  httpServer: httpServer,
  autoAcceptConnections: false,
});

// Function to validate origin
function originIsAllowed(origin: string): boolean {
  // You can add your own logic here
  return true;
}

// Handle WebSocket requests
wsServer.on("request", (request) => {
  if (!originIsAllowed(request.origin)) {
    request.reject();
    console.log(
      new Date() + " Connection from origin " + request.origin + " rejected."
    );
    return;
  }

  const connection = request.accept("echo-protocol", request.origin);
  console.log(new Date() + " Connection accepted.");

  connection.on("message", (message) => {
    if (message.type === "utf8") {
      console.log("Received Message: " + message.utf8Data);
      connection.sendUTF(message.utf8Data);
    } else if (message.type === "binary") {
      console.log(
        "Received Binary Message of " + message.binaryData.length + " bytes"
      );
      connection.sendBytes(message.binaryData);
    }
  });

  connection.on("close", (reasonCode, description) => {
    console.log(
      new Date() + " Peer " + connection.remoteAddress + " disconnected."
    );
  });
});
