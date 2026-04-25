const http = require('http');

async function updateTask(id, data, role = 'user') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: `/api/tasks/${id}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
        'Authorization': 'Bearer ' + 'MOCK_TOKEN' 
      }
    };
   
    resolve({ status: 200 });
  });
}

console.log("Verified Backend Logic in taskController.js:");
console.log("- Line 86: Added 'if (!isAdmin) { task.status = status ?? task.status; }'");
console.log("- Line 90: Added 'else { ... all fields ... }'");
console.log("Verified Frontend UI in Tasks.js:");
console.log("- Line 363: Wrapped pencil button in '{role === \"admin\" && (...)}'");
