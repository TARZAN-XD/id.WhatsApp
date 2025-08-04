async function getChannelInfo() {
    const link = document.getElementById('channelLink').value.trim();
    const resultDiv = document.getElementById('result');

    if (!link) {
        return alert('❌ أدخل رابط القناة');
    }

    resultDiv.innerHTML = '<div class="text-center text-warning">⏳ جاري الجلب...</div>';

    try {
        const res = await fetch(`/api/channel-info?link=${encodeURIComponent(link)}`);
        const data = await res.json();

        if (data.status !== 200) {
            resultDiv.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
            return;
        }

        resultDiv.innerHTML = `
            <div class="card mt-3 p-3 text-center">
                <img src="${data.image}" class="img-fluid rounded mb-3" style="max-width:150px;">
                <h4>${data.name}</h4>
                <p>${data.description}</p>
                <p><strong>المعرف:</strong> ${data.id}</p>
                <button class="btn btn-success mb-2" onclick="copyToClipboard('${data.id}')">📋 نسخ المعرف</button>
                <a href="${data.link}" target="_blank" class="btn btn-primary">فتح القناة</a>
            </div>
        `;
    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = `<div class="alert alert-danger">❌ حدث خطأ أثناء الجلب</div>`;
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert('✅ تم نسخ المعرف');
}
