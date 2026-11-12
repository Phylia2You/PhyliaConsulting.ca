(() => {
const header = document.querySelector('.folio-header');
const menu = document.querySelector('[data-folio-menu]');
const nav = document.querySelector('.folio-nav');
const close = () => { header?.classList.remove('menu-open'); menu?.setAttribute('aria-expanded','false'); menu?.setAttribute('aria-label','Open navigation'); if(menu) menu.textContent='☰'; };
menu?.addEventListener('click', () => { const open=!header.classList.contains('menu-open'); header.classList.toggle('menu-open',open); menu.setAttribute('aria-expanded',String(open)); menu.setAttribute('aria-label',open?'Close navigation':'Open navigation'); menu.textContent=open?'×':'☰'; });
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&header?.classList.contains('menu-open')){close();menu?.focus();}});
window.addEventListener('resize',()=>{if(window.innerWidth>800)close();});
document.querySelector('[data-print]')?.addEventListener('click',()=>window.print());
})();

