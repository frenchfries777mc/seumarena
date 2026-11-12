(() => {
  const bc = new BroadcastChannel('fakepeer'), owners = new Map(), peers = new Map(); let seq = 0;
  class Em { constructor() { this.h = {}; } on(e, f) { (this.h[e] = this.h[e] || []).push(f); return this; } emit(e, ...a) { for (const f of this.h[e] || []) try { f(...a); } catch (er) { console.error(er); } } }
  class Conn extends Em { constructor(peer, other, cid) { super(); this.peer = peer; this.peer_ = other; this.cid = cid; this.open = false; }
    send(d) { if (this.closed) return; bc.postMessage({ k: 'data', cid: this.cid, to: this.peer_, d: JSON.parse(JSON.stringify(d)) }); }
    close() { if (!this.open && this.closed) return; this.open = false; this.closed = true; bc.postMessage({ k: 'close', cid: this.cid, to: this.peer_ }); this.emit('close'); } }
  class Peer extends Em {
    constructor(id) { super(); this.id = id || ('p' + Math.random().toString(36).slice(2, 9)); this.open = false; this.destroyed = false; this.disconnected = false; this.conns = new Map();
      let taken = false; const q = Math.random(); this._q = q;
      bc.postMessage({ k: 'claim', id: this.id, q });
      this._onTaken = () => { taken = true; };
      peers.set(this.id + q, this);
      setTimeout(() => { if (this.destroyed) return; if (taken) { this.emit('error', { type: 'unavailable-id' }); return; } owners.set(this.id, this); this.open = true; this.emit('open', this.id); }, 200); }
    connect(to) { const cid = 'c' + (++seq) + Math.random().toString(36).slice(2, 6), c = new Conn(this, to, cid); this.conns.set(cid, c);
      bc.postMessage({ k: 'req', cid, from: this.id, to });
      setTimeout(() => { if (!c.open && !c.closed && !this.destroyed) { this.conns.delete(cid); this.emit('error', { type: 'peer-unavailable', message: 'Could not connect to peer ' + to }); } }, 300);
      return c; }
    destroy() { if (this.destroyed) return; this.destroyed = true; this.open = false; for (const c of this.conns.values()) c.close(); if (owners.get(this.id) === this) owners.delete(this.id); }
    reconnect() {}
  }
  bc.onmessage = ({ data: m }) => {
    if (m.k === 'claim') { const o = owners.get(m.id); if (o && !o.destroyed) bc.postMessage({ k: 'taken', id: m.id, q: m.q }); }
    else if (m.k === 'taken') { const p = peers.get(m.id + m.q); if (p) p._onTaken(); }
    else if (m.k === 'req') { const o = owners.get(m.to); if (!o || o.destroyed) return; const c = new Conn(o, m.from, m.cid); o.conns.set(m.cid, c); bc.postMessage({ k: 'ack', cid: m.cid, to: m.from }); o.emit('connection', c); setTimeout(() => { c.open = true; c.emit('open'); }, 20); }
    else if (m.k === 'ack') { for (const o of owners.values()) { const c = o.conns.get(m.cid); if (c && !c.open) { c.open = true; c.emit('open'); } } }
    else if (m.k === 'data' || m.k === 'close') { for (const o of owners.values()) { const c = o.conns.get(m.cid); if (!c) continue; if (m.k === 'data' && !c.closed) c.emit('data', m.d); else if (m.k === 'close' && !c.closed) { c.open = false; c.closed = true; c.emit('close'); } } }
  };
  window.Peer = Peer;
})();
