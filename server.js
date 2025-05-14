const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('.'));

app.post('/obfuscate', (req, res) => {
  const inputCode = req.body.code;
  const inputFile = path.resolve(__dirname, 'input.lua');
  const outputFile = path.resolve(__dirname, 'output.lua');

  // Write input code to the input.lua file
  fs.writeFileSync(inputFile, inputCode);

  // Adjusted path to Prometheus folder (not nested)
  const command = `lua Prometheus-master/cli.lua ${inputFile} ${outputFile} --preset Strong`;

  exec(command, (err, stdout, stderr) => {
    if (err || stderr) {
      console.error("Error executing Prometheus:", stderr || err.message);
      return res.status(500).json({ error: stderr || err.message });
    }

    // Read and send back the obfuscated code
    fs.readFile(outputFile, 'utf8', (readErr, data) => {
      if (readErr) {
        console.error("Error reading output file:", readErr.message);
        return res.status(500).json({ error: readErr.message });
      }
      res.json({ obfuscatedCode: data });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
