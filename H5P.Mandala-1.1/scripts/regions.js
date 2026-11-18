/* Immutable raster segmentation. No vector conversion. MIT. */
(function(root) {
  'use strict';
  function Regions(data, width, height, threshold) {
    this.width=width; this.height=height; this.source=data;
    this.labels=new Int32Array(width*height); this.seeds=[null];
    const n=width*height, queue=new Uint32Array(n);
    let hash=2166136261;
    for(let i=0;i<n;i++) {
      const k=i*4;
      hash=Math.imul(hash ^ data[k],16777619);
      hash=Math.imul(hash ^ data[k+1],16777619);
      hash=Math.imul(hash ^ data[k+2],16777619);
      if((data[k]+data[k+1]+data[k+2])/3<=threshold) this.labels[i]=-1;
    }
    this.signature=width+'x'+height+':'+threshold+':'+(hash>>>0).toString(16);
    let id=0;
    for(let p=0;p<n;p++) {
      if(this.labels[p]!==0) continue;
      ++id; this.seeds.push(p); let head=0,tail=1; queue[0]=p; this.labels[p]=id;
      while(head<tail) {
        const q=queue[head++], x=q%width;
        const neighbors=[x>0?q-1:-1,x<width-1?q+1:-1,q>=width?q-width:-1,q<n-width?q+width:-1];
        for(let j=0;j<4;j++) {
          const v=neighbors[j];
          if(v>=0 && this.labels[v]===0) {this.labels[v]=id;queue[tail++]=v;}
        }
      }
    }
    this.count=id;
  }
  Regions.prototype.at=function(x,y) {
    if(x<0||y<0||x>=this.width||y>=this.height) return -1;
    return this.labels[Math.floor(y)*this.width+Math.floor(x)];
  };
  Regions.prototype.render=function(colors) {
    const out=new Uint8ClampedArray(this.source), rgb={};
    Object.keys(colors).forEach(id=> {const s=colors[id];if(/^#[0-9a-f]{6}$/i.test(s)) rgb[id]=[parseInt(s.slice(1,3),16),parseInt(s.slice(3,5),16),parseInt(s.slice(5,7),16)];});
    for(let i=0;i<this.labels.length;i++) {
      const c=rgb[this.labels[i]];if(!c) continue;
      const k=i*4;
      // Retain grey antialiasing from original raster.
      for(let j=0;j<3;j++) out[k+j]=Math.round(c[j]*this.source[k+j]/255);
    }
    return out;
  };
  if(typeof module!=='undefined'&&module.exports) module.exports=Regions;
  else root.H5P.MandalaRegions=Regions;
})(typeof window!=='undefined'?window:globalThis);
