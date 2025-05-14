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
  const inputFile = path.join(__dirname, 'input.lua');
  const outputFile = path.join(__dirname, 'output.lua');

  // Write input to file
  fs.writeFileSync(inputFile, inputCode);

  // Run Prometheus with "Strong" preset
  const command = `lua Prometheus-master/cli.lua ${inputFile} ${outputFile} --preset Strong`;

  exec(command, (err, stdout, stderr) => {
    if (err || stderr) {
      console.error(err || stderr);
      return res.status(500).json({ error: stderr || err.message });
    }

    // Read and send obfuscated code
    fs.readFile(outputFile, 'utf8', (readErr, data) => {
      if (readErr) {
        return res.status(500).json({ error: readErr.message });
      }
      res.json({ obfuscatedCode: data });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
