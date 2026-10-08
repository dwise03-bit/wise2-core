export const directions = [[1,0],[-1,0],[0,1],[0,-1]];
export const key = ([x,y]) => `${x},${y}`;
export const same = (a,b) => key(a) === key(b);
export function tile(grid,[x,y]) { return grid[y]?.[x] ?? '#'; }
export function blast(grid,origin,radius) {
  const cells = [origin];
  for (const [dx,dy] of directions) for(let i=1;i<=radius;i++) {
    const p=[origin[0]+dx*i,origin[1]+dy*i],t=tile(grid,p);
    if(t==='#') break;
    cells.push(p);
    if(t==='+') break;
  }
  return cells;
}
export function path(grid,start,goal,blocked=new Set()) {
  const queue=[start], prev=new Map([[key(start),null]]);
  for(let i=0;i<queue.length;i++) {
    const p=queue[i];
    if(same(p,goal)) {
      const result=[];let current=p;
      while(current){ result.unshift(current);current=prev.get(key(current)); }
      return result;
    }
    for(const [dx,dy] of directions) {
      const n=[p[0]+dx,p[1]+dy];
      if(tile(grid,n)==='#'||tile(grid,n)==='+'||blocked.has(key(n))||prev.has(key(n))) continue;
      prev.set(key(n),p);queue.push(n);
    }
  }
  return [];
}
export function detonate(grid,bombs,first) {
  const pending=[first], fired=new Set(), cells=new Map();
  while(pending.length) {
    const bomb=pending.shift(); if(fired.has(bomb.id)) continue;
    fired.add(bomb.id);
    for(const p of blast(grid,bomb.position,bomb.radius)) {
      cells.set(key(p),p);
      for(const other of bombs) if(same(other.position,p)&&!fired.has(other.id)) pending.push(other);
    }
  }
  // Every simultaneous blast sees the same board: a block stops all rays this tick.
  for(const [x,y] of cells.values()) if(grid[y][x]==='+') grid[y][x]='.';
  return {fired,cells:[...cells.values()]};
}
