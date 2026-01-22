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

          <!-- Email -->
          <a href="mailto:${d.contact.email}" class="icon-btn email-btn" title="Email">
            <svg viewBox="0 0 24 24">
              <path d="M4 4h16v16H4z"/>
              <path d="M4 7l8 6 8-6"/>
            </svg>
          </a>
        
          <!-- Phone -->
          <a href="tel:${d.contact.phone}" class="icon-btn phone-btn" title="Gọi điện">
            <svg viewBox="0 0 24 24">
              <path d="M6 2h12v20H6z"/>
              <path d="M8 4h8v12H8z"/>
              <path d="M10 18h4"/>
            </svg>
          </a>
        
          <!-- Facebook -->
          <a href="${d.contact.facebook}" target="_blank" class="icon-btn facebook-btn" title="Facebook">
            <svg viewBox="0 0 24 24">
              <path d="M14 2h4v4h-4v4h4v4h-4v8h-4V14H6v-4h4V6a4 4 0 0 1 4-4z"/>
            </svg>
          </a>
        
          <!-- GitHub -->
          <a href="${d.contact.github}" target="_blank" class="icon-btn github-btn" title="GitHub">
            <svg viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 0 0-3 19.5c.5 0 .7-.3.7-.6v-2c-3 1-3.5-1.5-3.5-1.5-.5-1.2-1.2-1.6-1.2-1.6C4 15 5 15 5 15c1 .1 1.6 1 1.6 1 1 1.6 2.7 1.1 3.3.8a3 3 0 0 1 .9-1.7C8.6 15 6 13.8 6 10.5A4 4 0 0 1 7 8c-.2-.6 0-1.3.2-2 0 0 1.1-.4 3 1a10.3 10.3 0 0 1 5.6 0c1.9-1.4 3-1 3-1 .2.7.4 1.4.2 2a4 4 0 0 1 1 2.5c0 3.2-2.7 4.5-5.3 4.8a3 3 0 0 1 .8 2.2v3c0 .3.2.6.7.6A10 10 0 0 0 12 2z"/>
            </svg>
          </a>
        
          <!-- Zalo -->
          <a href="${d.contact.zalo}" target="_blank" class="icon-btn zalo-btn" title="Zalo">
            <svg viewBox="0 0 24 24">
              <path d="M4 3h16v18H4z"/>
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

