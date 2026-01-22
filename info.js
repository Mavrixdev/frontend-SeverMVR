document.addEventListener('DOMContentLoaded', async () => {
  const card = document.getElementById('info-card');

  try {
    // 🔥 FIX: Dùng API WEB thay vì localhost
    const res = await fetch('https://api-mvr.vercel.app/gioithieu', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    const d = json.data;

    card.classList.remove('loading');

    card.innerHTML = `
      <div class="avatar-wrap">
        <img src="${d.avatar}" alt="avatar" class="avatar" />
      </div>

      <h1 class="name">${d.name}</h1>
      <p class="bio">${d.bio}</p>

      <div class="contact">
        <h2>Liên hệ</h2>

        ${d.contact.email ? `
        <button class="contact-btn" onclick="window.location.href='mailto:${d.contact.email}'">
            <span class="btn-text">📧 ${d.contact.email}</span>
        </button>` : ''}

        <div class="contact-icons">

          ${d.contact.email ? `
          <a href="mailto:${d.contact.email}" class="icon-btn email-btn" title="Email">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor">
              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Z"/>
            </svg>
          </a>` : ''}

          ${d.contact.phone ? `
          <a href="tel:${d.contact.phone}" class="icon-btn phone-btn" title="Phone">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
              <path d="M11 1a1 1 0 0 1 1 1v12H5V2a1 1 0 0 1 1-1z"/>
            </svg>
          </a>` : ''}

          ${d.contact.facebook ? `
          <a href="${d.contact.facebook}" target="_blank" class="icon-btn facebook-btn" title="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
              <path d="M16 8.049c0-4.446-3.58-8.05-8-8.05S0 3.603 0 8.05C0 12.067 2.93 15.397 6.75 16v-5.625H4.72V8.05H6.75V6.275c0-2.017 1.2-3.131 3.02-3.131.88 0 1.79.157 1.79.157v1.98H10.55c-.99 0-1.3.621-1.3 1.258V8.05H11.5l-.35 2.326H9.25V16c3.82-.603 6.75-3.933 6.75-7.951Z"/>
            </svg>
          </a>` : ''}

          ${d.contact.github ? `
          <a href="${d.contact.github}" target="_blank" class="icon-btn github-btn" title="GitHub">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59"/>
            </svg>
          </a>` : ''}

          ${d.contact.zalo ? `
          <a href="${d.contact.zalo}" target="_blank" class="icon-btn zalo-btn" title="Zalo">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
              <path d="M82.6 380.9c..."/>
            </svg>
          </a>` : ''}
        </div>
      </div>

      <div class="skills">
        <h2>Kỹ năng</h2>
        <ul>${d.skills.map(skill => `<li>${skill}</li>`).join('')}</ul>
      </div>

      <div class="location">📍 ${d.location}</div>

      ${d.website ? `<div class="website"><a href="${d.website}" target="_blank">Website cá nhân</a></div>` : ''}
    `;

  } catch (err) {
    card.classList.remove('loading');
    card.innerHTML = `
      <div class="error">
        Không thể tải thông tin: ${err.message}
      </div>`;
  }
});
