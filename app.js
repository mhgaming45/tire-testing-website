let DATA={players:[],results:[],modes:[],tiers:[],stats:{}};
const $=s=>document.querySelector(s);
const tierRank=t=>({HT1:0,LT1:1,HT2:2,LT2:3,HT3:4,LT3:5,HT4:6,LT4:7,HT5:8,LT5:9}[t]??99);
function tierClass(t){return t||'Unranked'}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderStats(){let s=DATA.stats;$('#stats').innerHTML=[['Players',s.players],['Completed Tests',s.tests],['Passes',s.passes],['Ranked Players',s.ranked]].map(x=>`<div class="stat"><b>${x[1]}</b><span>${x[0]}</span></div>`).join('')}
function renderPlayers(){let q=$('#search').value.toLowerCase(),m=$('#mode').value,t=$('#tier').value;let arr=DATA.players.filter(p=>(p.ign+' '+p.id).toLowerCase().includes(q)&&(m==='all'||p.tiers[m])&&(t==='all'||p.tiers[m]===t||p.bestTier===t));arr.sort((a,b)=>tierRank(a.bestTier)-tierRank(b.bestTier)||b.wins-a.wins);$('#players').innerHTML=arr.map((p,i)=>`<article class="card"><div class="head"><img class="avatar" src="${esc(p.avatar)}"><div><div class="name">${esc(p.ign)}</div><div class="id">Discord ID: ${esc(p.id)}</div></div><div class="tier ${tierClass(p.bestTier)}">${esc(p.bestTier)}</div></div><div class="modes">${DATA.modes.map(m=>`<div class="mode"><span>${esc(m.toUpperCase())}</span><b>${esc(p.tiers[m]||'Unranked')}</b></div>`).join('')}</div><div class="meta"><span>Tests ${p.tests}</span><span>Wins ${p.wins}</span><span>Losses ${p.losses}</span><span>${p.tests?((p.passes/p.tests)*100).toFixed(0):0}%</span></div></article>`).join('')||'<div class="empty">No players found.</div>'}
function renderResults(){let q=$('#search').value.toLowerCase(),m=$('#mode').value,t=$('#tier').value;let arr=DATA.results.filter(r=>(r.player+' '+r.playerId).toLowerCase().includes(q)&&(m==='all'||r.gamemode===m)&&(t==='all'||r.tier===t));$('#results').innerHTML=arr.map(r=>`<div class="result"><img class="avatar" src="${esc(r.playerAvatar)}"><div class="resultmain"><b>${esc(r.player)} • ${esc((r.gamemode||'').toUpperCase())}</b><span>${esc(r.testerId||'')} • ${r.finishedAt?new Date(r.finishedAt).toLocaleString():''}</span></div><div class="badge ${r.result==='PASS'?'pass':'fail'}">${r.result==='PASS'?'✓ PASS':'✕ FAIL'}</div><div class="tier">${esc(r.tier)}</div></div>`).join('')||'<div class="empty">No results found.</div>'}
function render(){renderStats();renderPlayers();renderResults();$('#updated').textContent='Updated '+new Date(DATA.generatedAt).toLocaleTimeString()}
async function load() {
  try {
    const API = (window.MHGAMING_API || '').replace(/\/$/, '');

    const [playersRes, resultsRes] = await Promise.all([
      fetch(API + '/api/players', { cache: 'no-store' }),
      fetch(API + '/api/results', { cache: 'no-store' })
    ]);

    if (!playersRes.ok || !resultsRes.ok) {
      throw new Error('API request failed');
    }

    const playersData = await playersRes.json();
    const resultsData = await resultsRes.json();

    const players = playersData.players || [];
    const modes = (playersData.gamemodes || []).map(x => x.id);
    const tiers = playersData.tiers || [];

    const results = (resultsData.results || []).map(r => {
      const player = players.find(p => p.id === r.playerId);

      return {
        ...r,
        player: player?.ign || r.playerId || 'Unknown',
        playerId: r.playerId || '',
        playerAvatar: player?.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png',
        testerId: r.testerId || 'Unknown'
      };
    });

    const passes = players.reduce((n, p) => n + (p.passes || 0), 0);

    DATA = {
      players: players.map(p => ({
        ...p,
        bestTier: Object.values(p.tiers || {})
          .filter(Boolean)
          .sort((a, b) => tierRank(a) - tierRank(b))[0] || 'Unranked'
      })),
      results,
      modes,
      tiers,
      stats: {
        players: players.length,
        tests: players.reduce((n, p) => n + (p.tests || 0), 0),
        passes,
        ranked: players.filter(p =>
          Object.values(p.tiers || {}).some(t => t)
        ).length
      },
      generatedAt: new Date().toISOString()
    };

    populate();
    render();

  } catch (e) {
    console.error('Website API Error:', e);

    $('#players').innerHTML =
      '<div class="empty">Website could not load the bot database.</div>';

    $('#results').innerHTML =
      '<div class="empty">Website could not load results.</div>';
  }
}
function populate(){let m=$('#mode'),t=$('#tier');m.innerHTML='<option value="all">All Gamemodes</option>'+DATA.modes.map(x=>`<option value="${x}">${x.toUpperCase()}</option>`).join('');t.innerHTML='<option value="all">All Tiers</option>'+DATA.tiers.map(x=>`<option value="${x}">${x}</option>`).join('')}
['input','change'].forEach(ev=>document.addEventListener(ev,e=>{if(['search','mode','tier'].includes(e.target.id)){renderPlayers();renderResults()}}));$('#refresh').onclick=load;document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#players').classList.toggle('hidden',b.dataset.tab!=='players');$('#results').classList.toggle('hidden',b.dataset.tab!=='results')});load();setInterval(load,30000);
