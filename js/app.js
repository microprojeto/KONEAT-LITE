// COLE ISSO INTEIRO NO SEU js/app.js
document.addEventListener('DOMContentLoaded', () => {
    // ... SEU CÓDIGO ATUAL DO 1 AO 10 CONTINUA IGUAL ...

    // 11. FIX DO GARGALO - MÓDULO DE VÍDEO
    const STORAGE_KEY = 'koneat_videos';
    function getVideos(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); }catch{ return []; } }
    function saveVideos(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

    function detectarFormato(file, cb){
        if(!file.type.startsWith('video/')){ cb('9:16'); return; }
        const url = URL.createObjectURL(file);
        const v = document.createElement('video');
        v.preload='metadata';
        v.onloadedmetadata=()=>{ URL.revokeObjectURL(url); const r=v.videoWidth/v.videoHeight; if(r<0.8)cb('9:16'); else if(r>1.2)cb('16:9'); else if(r>=0.8&&r<=1)cb('4:5'); else cb('1:1'); };
        v.onerror=()=>cb('9:16'); v.src=url;
    }

    window.KoneatPostVideo = function(file, tipo){
        if(!file) return alert('Selecione um vídeo na Galeria primeiro');
        if(file.size>25*1024*1024) return alert('Vídeo >25MB no modo lab. No prod usaremos Firebase.');
        detectarFormato(file, (formato)=>{
            const reader = new FileReader();
            reader.onload=(e)=>{
                const list=getVideos();
                list.unshift({ id:Date.now(), tipo:tipo, src:e.target.result, formato:formato, username:(localStorage.getItem('koneat_username')||'usuario').replace('@',''), name:localStorage.getItem('koneat_name')||'Usuário' });
                saveVideos(list);
                alert('Vídeo postado com sucesso!');
                window.location.href = tipo==='viral' ? './passo1.html' : './passo2.html';
            };
            reader.readAsDataURL(file);
        });
    };

    const feedPasso2 = document.getElementById('feedPasso2');
    if(feedPasso2){
        const videos=getVideos();
        if(videos.length===0) feedPasso2.innerHTML='<div style="color:#8e8e93;text-align:center;padding:60px 20px;">Nenhum vídeo ainda. Poste seu primeiro 9:16, 16:9 ou 4:5 em Criar</div>';
        else{ feedPasso2.innerHTML=''; videos.forEach(v=>{ const d=document.createElement('div'); d.style.cssText=`margin-bottom:16px;background:#111;border-radius:12px;overflow:hidden;aspect-ratio:${v.formato.replace(':','/')};position:relative;`; d.innerHTML=`<video src="${v.src}" controls playsinline style="width:100%;height:100%;object-fit:cover;"></video><div style="position:absolute;bottom:0;left:0;right:0;padding:8px;background:linear-gradient(transparent,rgba(0,0,0,.7));color:#fff;font-size:12px;display:flex;justify-content:space-between;"><span>@${v.username} • ${v.formato}</span><span>${v.tipo==='viral'?'🔥 VIRAL':'GERAL'}</span></div>`; feedPasso2.appendChild(d); }); }
    }

    const feedVirais = document.getElementById('feedVirais');
    if(feedVirais){
        const virais=getVideos().filter(v=>v.tipo==='viral');
        if(virais.length===0) feedVirais.innerHTML='<div style="color:#8e8e93;text-align:center;padding:40px 20px;">Virais start vazio. Poste um vídeo como VIRAL</div>';
        else{ feedVirais.innerHTML=''; virais.forEach(v=>{ const d=document.createElement('div'); d.style.cssText=`margin-bottom:16px;background:#111;border-radius:12px;overflow:hidden;aspect-ratio:${v.formato.replace(':','/')};`; d.innerHTML=`<video src="${v.src}" controls playsinline style="width:100%;height:100%;object-fit:cover;"></video>`; feedVirais.appendChild(d); }); }
    }

    const profileGrid = document.getElementById('profileGrid');
    window.renderProfileVideos = function(){
        if(!profileGrid) return;
        const myVideos=getVideos();
        if(myVideos.length===0) return;
        profileGrid.innerHTML=''; myVideos.forEach(v=>{ const el=document.createElement('div'); el.style.cssText=`background:#111;border-radius:8px;overflow:hidden;aspect-ratio:${v.formato.replace(':','/')};position:relative;`; el.innerHTML=`<video src="${v.src}" muted playsinline style="width:100%;height:100%;object-fit:cover;"></video>`; profileGrid.appendChild(el); });
    };

    // Hook galeria criar.html
    let tempFile=null;
    const inputGaleria = document.getElementById('inputGaleria') || (()=>{ const h=document.createElement('input'); h.type='file'; h.id='inputGaleria'; h.accept='video/*'; h.style.display='none'; document.body.appendChild(h); return h; })();
    document.getElementById('btnGaleria')?.addEventListener('click', ()=>inputGaleria.click());
    document.getElementById('galeriaArea')?.addEventListener('click', ()=>inputGaleria.click());
    inputGaleria.addEventListener('change', e=>{ tempFile=e.target.files[0]; window._koneat_temp_file=tempFile; });
    document.getElementById('btnPostarViral')?.addEventListener('click', ()=>{ const f=tempFile||window._koneat_temp_file||inputGaleria.files[0]; window.KoneatPostVideo(f,'viral'); });
    document.getElementById('btnAvancar')?.addEventListener('click', ()=>{ const f=tempFile||window._koneat_temp_file||inputGaleria.files[0]; window.KoneatPostVideo(f,'geral'); });
    document.getElementById('btnPostarGeral')?.addEventListener('click', ()=>{ const f=tempFile||window._koneat_temp_file||inputGaleria.files[0]; window.KoneatPostVideo(f,'geral'); });

    renderPasso2?.(); renderVirais?.(); window.renderProfileVideos?.();
    // Chama renders se existirem
    if(typeof renderPasso2==='function') renderPasso2();
    if(typeof renderVirais==='function') renderVirais();
});
