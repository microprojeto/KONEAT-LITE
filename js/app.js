document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (menuBtn && dropdownMenu) {
        menuBtn.addEventListener('click', (e) => { e.stopPropagation(); dropdownMenu.classList.toggle('show'); });
        document.addEventListener('click', () => { dropdownMenu.classList.remove('show'); });
    }
    const tabBtns = document.querySelectorAll('.tab-btn');
    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
    const profileName = document.getElementById("profileName");
    const profileTag = document.getElementById("profileTag");
    const profileBio = document.getElementById("profileBio");
    const headerUsername = document.getElementById("headerUsername");
    if (profileName || profileTag) {
        const savedName = localStorage.getItem("koneat_name") || "Koneat User";
        const rawUsername = localStorage.getItem("koneat_username") || "koneat_user";
        const cleanUsername = rawUsername.replace("@", "").trim().toLowerCase();
        const savedBio = localStorage.getItem("koneat_bio") || "";
        if (headerUsername) headerUsername.textContent = cleanUsername;
        if (profileName) profileName.textContent = savedName;
        if (profileTag) profileTag.textContent = cleanUsername ? `@${cleanUsername}` : "";
        if (profileBio) profileBio.textContent = savedBio;
    }
});
