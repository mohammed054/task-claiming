const fs = require("fs");
const path = require("path");

const defDir = path.join(__dirname, "definitions");
const files = fs.readdirSync(defDir).filter((f) => f.endsWith(".js"));

for (const file of files) {
  const filePath = path.join(defDir, file);
  let content = fs.readFileSync(filePath, "utf8");
  // Replace `- **Branch**: \`task/...``` line
  content = content
    .split("\n")
    .filter((line) => !line.includes("- **Branch**:"))
    .join("\n");
  fs.writeFileSync(filePath, content, "utf8");
}

console.log("Completely removed all - **Branch**: lines.");
