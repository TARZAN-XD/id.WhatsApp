async function downloadVideo() {
  const url = document.getElementById('videoUrl').value;
  const format = document.getElementById('format').value;
  if (!url) return alert('أدخل رابط الفيديو أولاً');

  const response = await fetch('https://YOUR-RENDER-URL/api/download', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'ELITE123'
    },
    body: JSON.stringify({ url, format })
  });

  const data = await response.json();
  document.getElementById('result').innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
}
