// FIX - Salva direto como arquivo, não como base64
let fileReal = null;

function detectarFormatoReal(file, cb){
  if(file.type.startsWith('image/')){ cb('1:1'); return; }
  const url=URL.createObjectURL(file);
  const v=document.createElement('video');
  v.preload='metadata';
  v.onloadedmetadata=()=>{ 
    URL.revokeObjectURL(url); 
    const r=v.videoWidth/v.videoHeight; 
    if(r<0.8) cb('9:16'); 
    else if(r>1.25) cb('16:9'); 
    else if(r>=0.8 && r<1) cb('4:5'); 
    else cb('1:1'); 
  };
  v.onerror=()=>cb('9:16');
  v.src=url;
}

const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const btnAdvance = document.getElementById('btnAdvance');
const captionModal = document.getElementById('captionModal');
const loadingOverlay = document.getElementById('loadingOverlay');

// Quando escolhe arquivo
fileInput.addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  fileReal = file;
  detectarFormatoReal(file, (formato)=>{
    const url = URL.createObjectURL(file);
    window._formato = formato;
    previewContainer.innerHTML = `<video src="${url}" controls autoplay playsinline style="width:100%;height:100%;object-fit:contain;"></video><div style="position:absolute;bottom:20px;left:20px;background:rgba(0,0,0,0.7);color:#00ff88;padding:6px 10px;border-radius:8px;font-size:12px">${formato}</div>`;
    document.getElementById('modalThumbnail').src = url;
    btnAdvance.classList.add('active');
    btnAdvance.style.color = '#00ff88';
    btnAdvance.style.cursor = 'pointer';
  });
});

previewContainer.addEventListener('click', ()=>fileInput.click());
document.getElementById('btnGaleria')?.addEventListener('click', ()=>fileInput.click());
document.getElementById('openCameraBtn')?.addEventListener('click', ()=>fileInput.click());

btnAdvance.addEventListener('click', ()=>{
  if(!fileReal) return alert('Escolha um vídeo da galeria primeiro');
  captionModal.classList.add('show');
});

document.getElementById('closeModalBtn').addEventListener('click', ()=>captionModal.classList.remove('show'));

// PUBLICAR - AGORA SEM TRAVAR
document.getElementById('publishFinalBtn').addEventListener('click', ()=>{
  if(!fileReal){ alert('Arquivo sumiu, escolha de novo'); return; }
  
  loadingOverlay.classList.add('show');
  loadingOverlay.querySelector('.loading-text').textContent = 'Postando...';

  try{
    // Salva em IndexedDB que aguenta vídeo grande
    const req = indexedDB.open('KoneatDB', 1);
    req.onupgradeneeded = (e)=>{
      const db = e.target.result;
      if(!db.objectStoreNames.contains('videos')) db.createObjectStore('videos', {keyPath:'id'});
    };
    req.onsuccess = (e)=>{
      const db = e.target.result;
      const tx = db.transaction('videos','readwrite');
      const store = tx.objectStore('videos');
      const id = 'post_'+Date.now();
      const selectedType = document.querySelector('.type-tab.active')?.dataset.type || 'post';
      
      store.add({
        id: id,
        file: fileReal,
        formato: window._formato || '9:16',
        tipo: selectedType==='virais' ? 'viral' : 'geral',
        caption: document.getElementById('postCaptionInput').value,
        created: Date.now()
      });

      tx.oncomplete = ()=>{
        loadingOverlay.querySelector('.loading-text').textContent = 'Postado! Redirecionando...';
        // Salva também um atalho no localStorage pro perfil abrir rápido
        try{
          const url = URL.createObjectURL(fileReal);
          const lista = JSON.parse(localStorage.getItem('koneat_videos')||'[]');
          lista.unshift({id, src:url, formato:window._formato, tipo:selectedType==='virais'?'viral':'geral'});
          localStorage.setItem('koneat_videos', JSON.stringify(lista.slice(0,10)));
        }catch(e){}
        
        setTimeout(()=>{ window.location.href = './passo2.html'; }, 500);
      };
      tx.onerror = ()=>{
        loadingOverlay.classList.remove('show');
        alert('Erro ao salvar. Tente um vídeo menor que 30MB');
      };
    };
    req.onerror = ()=>{
      loadingOverlay.classList.remove('show');
      alert('Erro no banco. Tente recarregar a página');
    };

  }catch(err){
    loadingOverlay.classList.remove('show');
    alert('Erro: '+err.message);
  }
});
