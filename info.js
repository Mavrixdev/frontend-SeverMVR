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

      <div class="contact-icons">
      
        <a href="mailto:${d.contact.email}" class="icon-btn email-btn" title="Email">
          <svg viewBox="0 0 24 24">
            <path d="M2 4h20v16H2z"/>
            <path d="M2 6l10 7 10-7"/>
          </svg>
        </a>
      
        <a href="tel:${d.contact.phone}" class="icon-btn phone-btn" title="Gọi điện">
          <svg viewBox="0 0 24 24">
            <path d="M6 2h12v20H6z"/>
            <path d="M10 18h4"/>
          </svg>
        </a>
      
        <a href="${d.contact.facebook}" target="_blank" class="icon-btn facebook-btn" title="Facebook">
          <svg viewBox="0 0 24 24">
            <path d="M14 2h4v4h-4v4h4v4h-4v8h-4V14H6v-4h4V6a4 4 0 0 1 4-4z"/>
          </svg>
        </a>
      
        <a href="${d.contact.github}" target="_blank" class="icon-btn github-btn" title="GitHub">
          <svg viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 0 0-3 19.5"/>
          </svg>
        </a>
      
        <a href="${d.contact.zalo}" target="_blank" class="icon-btn zalo-btn" title="Zalo">
          <svg viewBox="0 0 24 24">
            <path d="M4 4h16v16H4z"/>
            <path d="M8 8h8M8 12h8M8 16h5"/>
          </svg>
        </a>
      
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

