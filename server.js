const express = require('express');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/obfuscate', async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    const inputFile = path.join(__dirname, 'temp_input.lua');
    const outputFile = path.join(__dirname, 'temp_output.lua');
    await fs.writeFile(inputFile, code);

    const prometheusPath = path.join(__dirname, 'prometheus', 'cli.lua');
    const command = `luajit ${prometheusPath} --preset Medium ${inputFile} ${outputFile}`;

    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.error('Prometheus error:', stderr);
        return res.status(500).json({ error: 'Obfuscation failed: ' + stderr });
      }

      try {
        const obfuscatedCode = await fs.readFile(outputFile, 'utf8');
        await fs.unlink(inputFile);
        await fs.unlink(outputFile);
        res.json({ obfuscated: obfuscatedCode });
      } catch (err) {
        res.status(500).json({ error: 'Failed to read obfuscated code' });
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});