/* Native color and language widgets for H5P's authoring form. MIT. */
(function(Editor,$) {
  'use strict';
  Editor.Mandala=Editor.Mandala||{};Editor.widgets=Editor.widgets||{};
  const node=(tag,className,text)=> {const e=document.createElement(tag);if(className)e.className=className;if(text)e.textContent=text;return e;};
  const attach=(wrapper,element)=> {if(wrapper&&typeof wrapper.append==='function')wrapper.append(element);else wrapper.appendChild(element);};
  function Color(parent,field,params,setValue){this.parent=parent;this.field=field;this.params=typeof params==='string'?params:field.default||'#e53935';this.setValue=setValue;this.changeCallbacks=[];}
  Color.prototype.appendTo=function(wrapper){
    this.container=node('div','field text mandala-editor-color');
    const label=node('label','h5peditor-label',this.field.label||'Farbe');const row=node('div','mandala-editor-color-row');
    this.picker=node('input');this.picker.type='color';this.picker.setAttribute('aria-label',(this.field.label||'Farbe')+' – Farbpicker');this.picker.value=/^#[0-9a-f]{6}$/i.test(this.params)?this.params:'#e53935';
    this.hex=node('input');this.hex.type='text';this.hex.maxLength=7;this.hex.value=this.params;this.hex.setAttribute('aria-label',(this.field.label||'Farbe')+' – #RRGGBB');this.hex.placeholder='#RRGGBB';
    label.append(row);row.append(this.picker,this.hex);this.container.append(label);
    this.error=node('div','mandala-editor-error');this.error.setAttribute('role','alert');this.container.append(this.error);
    this.picker.addEventListener('input',()=>{this.hex.value=this.picker.value;this.save();});this.hex.addEventListener('input',()=>this.save());
    attach(wrapper,this.container);this.save();
  };
  Color.prototype.save=function(){const valid=/^#[0-9a-f]{6}$/i.test(this.hex.value);this.hex.setAttribute('aria-invalid',String(!valid));this.error.textContent=valid?'':'Bitte einen Farbcode im Format #RRGGBB eingeben.';if(valid){this.params=this.hex.value.toLowerCase();this.picker.value=this.params;this.setValue(this.field,this.params);this.changeCallbacks.forEach(fn=>fn(this.params));}return valid;};
  Color.prototype.validate=function(){return this.hex?this.save():/^#[0-9a-f]{6}$/i.test(this.params);};
  Color.prototype.remove=function(){if(this.container)this.container.remove();this.changeCallbacks=[];};
  function Texts(parent,field,params,setValue){
    this.parent=parent;this.field=field;this.setValue=setValue;this.changeCallbacks=[];this.inputs={};this.drafts={};
    const old=params&&typeof params==='object'?params:{};
    this.language=old.language==='en'?'en':old.language==='de'?'de':old.fill==='Fill'?'en':'de';
    this.params=Object.assign({language:this.language},MandalaTexts[this.language]);
    Object.keys(MandalaTexts.de).forEach(key=> {if(typeof old[key]==='string'&&old[key].trim())this.params[key]=old[key];});
  }
  Texts.prototype.appendTo=function(wrapper){
    this.container=node('fieldset','field group mandala-editor-texts');this.container.append(node('legend','h5peditor-label',this.field.label||'Textänderungen (Standardsprache: Deutsch)'));
    this.container.append(node('p','h5peditor-field-description','Standardsprache: Deutsch. Englisch ist mit vollständigen Vorgabetexten hinterlegt. Die Auswahl wechselt die Bedienoberfläche der Aktivität. Eigene Texte können darunter angepasst werden.'));
    const label=node('label','mandala-editor-language','Sprache der Bedienoberfläche ');this.select=node('select');
    [['de','Deutsch (Standard)'],['en','English']].forEach(pair=>{const option=node('option','',pair[1]);option.value=pair[0];this.select.append(option);});
    this.select.value=this.language;label.append(this.select);this.container.append(label);
    this.select.addEventListener('change',()=>this.changeLanguage(this.select.value));
    Object.keys(MandalaTexts.de).forEach(key=>{const row=node('label','mandala-editor-text-row',MandalaTexts.de[key]);const input=node('textarea');input.rows=key==='hint'||key==='finished'?3:1;input.maxLength=2000;input.value=this.params[key];input.dataset.textKey=key;row.append(input);this.container.append(row);this.inputs[key]=input;input.addEventListener('input',()=>{this.params[key]=input.value;this.commit();});});
    attach(wrapper,this.container);this.commit();
  };
  Texts.prototype.commit=function(){this.setValue(this.field,Object.assign({},this.params));this.changeCallbacks.forEach(fn=>fn(this.params));};
  Texts.prototype.changeLanguage=function(language){
    if(!MandalaTexts[language])return;this.drafts[this.language]=Object.assign({},this.params);this.language=language;
    this.params=Object.assign({language:language},this.drafts[language]||MandalaTexts[language]);this.params.language=language;
    Object.keys(this.inputs).forEach(key=>this.inputs[key].value=this.params[key]||MandalaTexts[language][key]);this.commit();
  };
  Texts.prototype.validate=function(){Object.keys(MandalaTexts.de).forEach(key=>{if(!this.params[key]||!this.params[key].trim()){this.params[key]=MandalaTexts[this.language][key];if(this.inputs[key])this.inputs[key].value=this.params[key];}});this.commit();return true;};
  Texts.prototype.remove=function(){if(this.container)this.container.remove();this.inputs={};this.changeCallbacks=[];};
  Editor.widgets.mandalaColor=Editor.Mandala.Color=Color;
  Editor.widgets.mandalaTexts=Editor.Mandala.Texts=Texts;
})(H5PEditor,H5P.jQuery);
