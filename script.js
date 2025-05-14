document.getElementById('obfuscateBtn').addEventListener('click', async () => {
  const input = document.getElementById('inputCode').value;
  const res = await fetch('/obfuscate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: input })
  });

  const data = await res.json();
  document.getElementById('outputCode').value = data.obfuscatedCode || `Error: ${data.error}`;
});
