(function(H5P) {
  'use strict';
  const palette=['#e53935','#fb8c00','#fdd835','#43a047','#00897b','#1e88e5','#3949ab','#8e24aa','#ec407a','#795548','#757575','#000000','#ffffff'];

  function Mandala(params,contentId,extras) {
    H5P.EventDispatcher.call(this);
    this.params=params||{}; this.id=contentId; this.previous=extras&&extras.previousState;
    this.settings=Object.assign({customColor:true,download:true,zoom:true,fullscreen:true,finish:true,threshold:110,maxSize:1536,hideStandardColors:false,showColorValue:false},this.params.behaviour||{});
    const supplied=this.params.l10n||{};
    const language=supplied.language==='en'?'en':supplied.language==='de'?'de':supplied.fill==='Fill'?'en':'de';
    this.t=Object.assign({},MandalaTexts[language]);
    Object.keys(this.t).forEach(key=> {if(typeof supplied[key]==='string'&&supplied[key].trim())this.t[key]=supplied[key];});
    this.customColors=[];this.baseColors=new Set();
    this.colors={};this.history=[];this.future=[];this.tool='fill';this.color=palette[0];this.completed=false;this.ready=false;
    this.zoom=1;this.panX=0;this.panY=0;this.points=new Map();this.cursor={x:0,y:0};
    this.on('resize',()=>this.resize());
    this.on('enterFullScreen',()=> {this.fullscreenActive=true;this.updateFullscreen();this.resize();});
    this.on('exitFullScreen',()=>this.leaveFullscreen());
  }
  Mandala.prototype=Object.create(H5P.EventDispatcher.prototype);
  Mandala.prototype.constructor=Mandala;
  Mandala.prototype.attach=function($container) {
    const el=(tag,cls,text)=> {const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;};
    this.$container=$container;this.root=el('div','h5p-mandala');$container.addClass('h5p-mandala-host');$container.append(this.root);
    if(this.params.title)this.root.append(el('h2','mandala-title',this.params.title));
    if(this.params.description)this.root.append(el('p','mandala-description',this.params.description));
    this.root.append(el('p','mandala-hint',this.t.hint));
    this.toolbar=el('div','mandala-toolbar');this.toolbar.setAttribute('role','group');this.toolbar.setAttribute('aria-label',this.t.fill);this.root.append(this.toolbar);
    this.buttons={};
    const button=(key,fn)=> {const b=el('button','mandala-button',this.t[key]);b.type='button';b.dataset.action=key;b.addEventListener('click',fn);this.toolbar.append(b);this.buttons[key]=b;return b;};
    ['fill','erase'].forEach(key=>button(key,()=>{this.tool=key;this.update();}));
    button('undo',()=>this.undo());button('redo',()=>this.redo());
    button('reset',()=> {if(this.ready&&window.confirm(this.t.confirm))this.resetTask();});
    if(this.settings.zoom){button('zoomIn',()=>this.changeZoom(1.3));button('zoomOut',()=>this.changeZoom(1/1.3));}
    if(this.settings.fullscreen)button('fullscreen',()=>this.toggleFullscreen());
    if(this.settings.download)button('download',()=>this.download());
    if(this.settings.finish)button('finish',()=>this.finish());
    this.palette=el('div','mandala-palette');this.palette.setAttribute('role','group');this.palette.setAttribute('aria-label',this.t.color);this.root.append(this.palette);
    const list=(Array.isArray(this.params.palette)?this.params.palette:[]).filter(v=>v&&/^#[0-9a-f]{6}$/i.test(v.color));
    const offered=(this.settings.hideStandardColors?[]:palette.map(color=>({color,name:color}))).concat(list);
    offered.forEach(item=> {const color=item.color.toLowerCase();if(this.baseColors.has(color))return;this.baseColors.add(color);this.addSwatch(this.palette,color,item.name||color);});
    if(!this.baseColors.size)this.settings.customColor=true;
    this.color=this.baseColors.size?[...this.baseColors][0]:'#e53935';
    if(!this.baseColors.size){this.palette.append(el('span','mandala-no-palette',this.t.noPalette));}
    if(this.settings.customColor){
      const label=el('label','mandala-custom',this.t.color+' ');this.picker=el('input');this.picker.type='color';this.picker.value=this.color;
      this.picker.addEventListener('input',()=>this.selectColor(this.picker.value));
      this.picker.addEventListener('change',()=>{this.selectColor(this.picker.value);this.rememberColor(this.color);this.update();});
      label.append(this.picker);this.palette.append(label);
      this.recentGroup=el('div','mandala-used');this.recentGroup.setAttribute('role','group');this.recentGroup.setAttribute('aria-label',this.t.usedColors);
      this.recentGroup.append(el('span','mandala-used-label',this.t.usedColors));this.recentPalette=el('div','mandala-palette');this.recentGroup.append(this.recentPalette);this.root.append(this.recentGroup);this.recentGroup.hidden=true;
    }
    if(this.settings.showColorValue){this.colorValue=el('output','mandala-color-value');this.root.append(this.colorValue);}
    this.view=el('div','mandala-viewport');this.root.append(this.view);
    this.canvas=el('canvas','mandala-canvas');this.canvas.tabIndex=0;this.canvas.setAttribute('role','img');this.canvas.setAttribute('aria-label',(this.params.alt||'Mandala')+'. '+this.t.hint);this.view.append(this.canvas);
    this.marker=el('span','mandala-marker');this.marker.setAttribute('aria-hidden','true');this.view.append(this.marker);
    this.canvas.addEventListener('focus',()=>{this.marker.style.display='block';this.transform();});this.canvas.addEventListener('blur',()=>this.marker.style.display='none');
    this.status=el('p','mandala-status',this.t.loading);this.status.setAttribute('role','status');this.root.append(this.status);
    this.bindPointers();this.root.addEventListener('keydown',e=>this.keydown(e));
    window.addEventListener('resize',()=> {if(this.root.isConnected)this.resize();});
    document.addEventListener('fullscreenchange',()=> {if(!document.fullscreenElement&&!H5P.isFullscreen&&this.fullscreenActive)this.leaveFullscreen();});
    if(window.ResizeObserver){this.resizeObserver=new ResizeObserver(()=> {const width=this.view.clientWidth;if(width!==this.lastWidth){this.lastWidth=width;this.resize();}});this.resizeObserver.observe(this.view);}
    this.update();
    const image=this.params.image;
    if(!image||!image.path||!/\.(png|jpe?g)$/i.test(image.path)){this.say(this.t.error);return;}
    const img=new Image();img.onload=()=> {try{this.loadImage(img);}catch(e){this.say(this.t.error);}};img.onerror=()=>this.say(this.t.error);img.src=H5P.getPath(image.path,this.id);
  };
  Mandala.prototype.say=function(message){this.status.textContent=message;};
  Mandala.prototype.loadImage=function(img) {
    const limit=Math.max(256,Math.min(2048,Number(this.settings.maxSize)||1536)),scale=Math.min(1,limit/Math.max(img.naturalWidth,img.naturalHeight));
    this.canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));this.canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
    this.ctx=this.canvas.getContext('2d',{willReadFrequently:true});this.ctx.fillStyle='#fff';this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);this.ctx.drawImage(img,0,0,this.canvas.width,this.canvas.height);
    this.regions=new H5P.MandalaRegions(this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height).data,this.canvas.width,this.canvas.height,Math.max(20,Math.min(240,Number(this.settings.threshold)||110)));
    this.ready=true;this.cursor={x:this.canvas.width/2,y:this.canvas.height/2};
    let message='';const state=this.previous;
    if(state&&state.version===1){if(state.signature===this.regions.signature){(Array.isArray(state.fills)?state.fills:[]).forEach(v=> {if(v&&Number.isInteger(v.seed)&&v.seed>=0&&v.seed<this.regions.labels.length&&/^#[0-9a-f]{6}$/i.test(v.color)){const id=this.regions.labels[v.seed];if(id>0)this.colors[id]=v.color;}});(Array.isArray(state.customColors)?state.customColors:[]).slice(-32).forEach(c=>this.rememberColor(c));if(/^#[0-9a-f]{6}$/i.test(state.selectedColor))this.selectColor(state.selectedColor);this.completed=state.completed===true;message=this.completed?this.t.finished:this.t.restored;}else message=this.t.changedImage;}
    this.previous=null;this.resize();this.render();this.say(message);this.trigger('resize');
  };
  Mandala.prototype.addSwatch=function(container,color,name){
    const b=document.createElement('button');b.className='mandala-swatch';b.type='button';b.style.backgroundColor=color;b.dataset.color=color;
    b.title=name;b.setAttribute('aria-label',name);b.addEventListener('click',()=>this.selectColor(color));container.append(b);
  };
  Mandala.prototype.rememberColor=function(color){
    if(!this.settings.customColor||!/^#[0-9a-f]{6}$/i.test(color))return;
    color=color.toLowerCase();if(this.baseColors.has(color)||this.customColors.includes(color))return;
    this.customColors.push(color);if(this.customColors.length>32)this.customColors.shift();
    if(this.recentPalette){this.recentPalette.replaceChildren();this.customColors.forEach(c=>this.addSwatch(this.recentPalette,c,c));this.recentGroup.hidden=!this.customColors.length;}
  };
  Mandala.prototype.selectColor=function(color){if(!/^#[0-9a-f]{6}$/i.test(color))return;this.color=color.toLowerCase();this.tool='fill';if(this.picker)this.picker.value=this.color;this.update();};
  Mandala.prototype.update=function(){
    Object.keys(this.buttons).forEach(key=> {this.buttons[key].disabled=!this.ready|| (this.completed&&['fill','erase','undo','redo'].includes(key));});
    this.root.classList.toggle('mandala-completed',this.completed);
    ['fill','erase'].forEach(key=>this.buttons[key].setAttribute('aria-pressed',String(this.tool===key)));
    this.buttons.undo.disabled=!this.ready||!this.history.length||this.completed;this.buttons.redo.disabled=!this.ready||!this.future.length||this.completed;
    if(this.buttons.finish){this.buttons.finish.disabled=!this.ready||!Object.keys(this.colors).length;this.buttons.finish.textContent=this.completed?this.t.continueEditing:this.t.finish;}
    this.root.querySelectorAll('.mandala-swatch').forEach(b=>{b.disabled=!this.ready||this.completed;b.setAttribute('aria-pressed',String(this.tool==='fill'&&b.dataset.color===this.color));});
    if(this.colorValue){const c=this.tool==='erase'?'#ffffff':this.color;const rgb=[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));this.colorValue.textContent=this.t.activeColor+': '+c.toUpperCase()+' · RGB('+rgb.join(', ')+')';}
    if(this.picker)this.picker.disabled=!this.ready||this.completed;
    this.view.style.cursor=this.completed?'default':this.zoom>1?'grab':'crosshair';
  };
  Mandala.prototype.render=function(){this.ctx.putImageData(new ImageData(this.regions.render(this.colors),this.canvas.width,this.canvas.height),0,0);this.update();this.transform();};
  Mandala.prototype.paint=function(x,y){
    if(!this.ready||this.completed)return;
    const id=this.regions.at(x,y);if(id<=0){this.say(this.t.boundary);return;}
    const color=this.tool==='erase'?null:this.color;if(color)this.rememberColor(color);
    if((this.colors[id]||null)===color)return;
    this.history.push({id,before:this.colors[id]||null,after:color});if(this.history.length>100)this.history.shift();this.future=[];
    this.apply(id,color);this.completed=false;this.render();this.say(this.t.changed);this.trigger('interacted');
  };
  Mandala.prototype.apply=function(id,color){if(color)this.colors[id]=color;else delete this.colors[id];};
  Mandala.prototype.undo=function(){if(!this.ready||this.completed)return;const c=this.history.pop();if(!c)return;this.future.push(c);this.apply(c.id,c.before);this.completed=false;this.render();};
  Mandala.prototype.redo=function(){if(!this.ready||this.completed)return;const c=this.future.pop();if(!c)return;this.history.push(c);this.apply(c.id,c.after);this.completed=false;this.render();};
  Mandala.prototype.resetTask=function(){if(!this.ready)return;this.colors={};this.history=[];this.future=[];this.completed=false;this.render();this.say(this.t.resetDone);};
  Mandala.prototype.getCurrentState=function(){
    if(!this.ready)return this.previous||{};
    if(!Object.keys(this.colors).length&&!this.completed&&!this.customColors.length)return {};
    return {version:1,signature:this.regions.signature,fills:Object.keys(this.colors).map(id=>({seed:this.regions.seeds[id],color:this.colors[id]})),completed:this.completed,customColors:this.customColors.slice(),selectedColor:this.color};
  };
  Mandala.prototype.finish=function(){if(!this.ready||!Object.keys(this.colors).length)return;if(this.completed){this.completed=false;this.update();this.say(this.t.restored);return;}this.completed=true;
    if(this.createXAPIEventTemplate){const event=this.createXAPIEventTemplate('completed');event.data.statement.result={completion:true};this.trigger(event);}this.update();this.say(this.t.finished);this.trigger('resize');
  };
  Mandala.prototype.download=function(){if(!this.ready)return;this.canvas.toBlob(blob=>{if(!blob)return;const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download='mandala.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');};
  Mandala.prototype.transform=function(){if(!this.ready)return;
    const fit=Math.min((this.view.clientWidth-24)/this.canvas.width,(this.view.clientHeight-24)/this.canvas.height);this.scale=Math.max(.01,fit)*this.zoom;
    const width=Math.round(this.canvas.width*this.scale),height=Math.round(this.canvas.height*this.scale);
    // Clamp panning so the image cannot be dragged out of view.
    this.panX=Math.max(-Math.max(0,(width-this.view.clientWidth)/2+12),Math.min(Math.max(0,(width-this.view.clientWidth)/2+12),this.panX));
    this.panY=Math.max(-Math.max(0,(height-this.view.clientHeight)/2+12),Math.min(Math.max(0,(height-this.view.clientHeight)/2+12),this.panY));
    const styles={width:width+'px',height:height+'px',left:Math.round((this.view.clientWidth-width)/2+this.panX)+'px',top:Math.round((this.view.clientHeight-height)/2+this.panY)+'px'};
    Object.keys(styles).forEach(key=> {if(this.canvas.style[key]!==styles[key])this.canvas.style[key]=styles[key];});
    this.marker.style.left=(this.view.clientWidth/2+this.panX+(this.cursor.x-this.canvas.width/2)*this.scale)+'px';this.marker.style.top=(this.view.clientHeight/2+this.panY+(this.cursor.y-this.canvas.height/2)*this.scale)+'px';
  };
  Mandala.prototype.resize=function(){
    if(!this.ready||!this.view)return;
    // Never derive embedded content height from iframe viewport height.
    const height=this.fullscreenActive?Math.max(300,window.innerHeight-240):Math.max(300,Math.min(600,this.view.clientWidth*.78));
    const value=Math.round(height)+'px';if(this.view.style.height!==value)this.view.style.height=value;
    this.transform();
  };
  Mandala.prototype.updateFullscreen=function(){
    this.root.classList.toggle('mandala-expanded',!!this.fullscreenActive);
    if(this.buttons.fullscreen)this.buttons.fullscreen.textContent=this.fullscreenActive?this.t.exitFullscreen:this.t.fullscreen;
  };
  Mandala.prototype.leaveFullscreen=function(){this.fullscreenActive=false;this.root.classList.remove('mandala-overlay');this.updateFullscreen();this.resize();this.trigger('resize');};
  Mandala.prototype.toggleFullscreen=function(){
    if(this.fullscreenActive){
      if(typeof H5P.exitFullScreen==='function'&&H5P.isFullscreen)H5P.exitFullScreen();
      else if(document.fullscreenElement&&document.exitFullscreen){document.exitFullscreen().catch(()=>{});}
      this.leaveFullscreen();return;
    }
    this.fullscreenActive=true;this.updateFullscreen();
    const fallback=()=> {this.root.classList.add('mandala-overlay');this.say(this.t.fullscreenFallback);this.resize();this.trigger('resize');};
    // H5P handles iframe integration and its own full-screen fallback.
    if(typeof H5P.fullScreen==='function'&&H5P.jQuery){
      try{H5P.fullScreen(this.$container,this,()=>this.leaveFullscreen(),undefined,H5P.fullscreenSupported===false);this.resize();return;}catch(error){fallback();return;}
    }
    if(this.root.requestFullscreen){try{const promise=this.root.requestFullscreen();if(promise)promise.then(()=>this.resize()).catch(fallback);else this.resize();}catch(error){fallback();}}
    else fallback();
  };
  Mandala.prototype.changeZoom=function(factor){if(!this.settings.zoom)return;this.zoom=Math.max(1,Math.min(8,this.zoom*factor));if(this.zoom===1){this.panX=0;this.panY=0;}this.transform();};
  Mandala.prototype.bindPointers=function(){
    const v=this.view;let gesture=false;
    v.addEventListener('pointerdown',e=> {if(!this.ready||e.button!==0)return;e.preventDefault();v.setPointerCapture(e.pointerId);this.points.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false});if(this.points.size>1)gesture=true;});
    v.addEventListener('pointermove',e=>{const p=this.points.get(e.pointerId);if(!p)return;const old=[...this.points.values()];const distance=items=>items.length<2?0:Math.hypot(items[0].x-items[1].x,items[0].y-items[1].y);const before=distance(old);const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;p.moved=p.moved||Math.hypot(p.x-p.startX,p.y-p.startY)>6;
      if(this.points.size===2){gesture=true;const after=distance([...this.points.values()]);if(before>0)this.changeZoom(after/before);this.panX+=dx/2;this.panY+=dy/2;this.transform();}
      else if(this.zoom>1&&p.moved){this.panX+=dx;this.panY+=dy;this.transform();}
    });
    v.addEventListener('pointerup',e=>{const p=this.points.get(e.pointerId);if(!p)return;if(!gesture&&!p.moved){const r=this.canvas.getBoundingClientRect();this.paint((e.clientX-r.left)*this.canvas.width/r.width,(e.clientY-r.top)*this.canvas.height/r.height);}this.points.delete(e.pointerId);if(!this.points.size)gesture=false;});
    const cancel=e=>{this.points.delete(e.pointerId);if(!this.points.size)gesture=false;};v.addEventListener('pointercancel',cancel);v.addEventListener('lostpointercapture',cancel);
    v.addEventListener('wheel',e=>{if(!this.settings.zoom||!e.ctrlKey)return;e.preventDefault();this.changeZoom(e.deltaY<0?1.15:1/1.15);},{passive:false});
  };
  Mandala.prototype.keydown=function(e){if(e.key==='Escape'&&this.fullscreenActive){this.toggleFullscreen();return;}if(!this.ready||/INPUT|TEXTAREA/.test(e.target.tagName))return;
    if((e.ctrlKey||e.metaKey)&&['z','y'].includes(e.key.toLowerCase())){e.preventDefault();if(e.key.toLowerCase()==='y'||e.shiftKey)this.redo();else this.undo();return;}
    if(e.target!==this.canvas)return;
    const step=e.shiftKey?1:10;const directions={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]};
    if(directions[e.key]){e.preventDefault();const d=directions[e.key];this.cursor.x=Math.max(0,Math.min(this.canvas.width-1,this.cursor.x+d[0]));this.cursor.y=Math.max(0,Math.min(this.canvas.height-1,this.cursor.y+d[1]));this.transform();}
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();this.paint(this.cursor.x,this.cursor.y);}
  };
  H5P.Mandala=Mandala;
})(H5P);
