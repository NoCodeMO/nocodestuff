const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'..');
const sourceFile=path.join(root,'styles','app.css');
const targetFile=path.join(root,'app.css');

function formatCss(source){
  const lines=[];
  let buffer='';
  let indent=0;
  let quote='';
  let escaped=false;
  let inComment=false;

  const emit=value=>{
    const text=value.trim();
    if(text)lines.push(`${'  '.repeat(Math.max(0,indent))}${text}`);
  };

  for(let index=0;index<source.length;index++){
    const char=source[index];
    const next=source[index+1];

    if(inComment){
      buffer+=char;
      if(char==='*'&&next==='/'){
        buffer+='/';
        index++;
        emit(buffer);
        buffer='';
        inComment=false;
      }
      continue;
    }

    if(quote){
      buffer+=char;
      if(escaped){escaped=false;continue}
      if(char==='\\'){escaped=true;continue}
      if(char===quote)quote='';
      continue;
    }

    if((char==='"'||char==="'")){
      quote=char;
      buffer+=char;
      continue;
    }

    if(char==='/'&&next==='*'){
      emit(buffer);
      buffer='/*';
      index++;
      inComment=true;
      continue;
    }

    if(char==='{'){
      const head=buffer.trim();
      if(head)lines.push(`${'  '.repeat(Math.max(0,indent))}${head} {`);
      buffer='';
      indent++;
      continue;
    }

    if(char===';'){
      const declaration=buffer.trim();
      if(declaration)lines.push(`${'  '.repeat(Math.max(0,indent))}${declaration};`);
      buffer='';
      continue;
    }

    if(char==='}'){
      emit(buffer);
      buffer='';
      indent=Math.max(0,indent-1);
      lines.push(`${'  '.repeat(indent)}}`);
      continue;
    }

    if(char==='\r'||char==='\n'||char==='\t'){
      if(buffer&&!/\s$/.test(buffer))buffer+=' ';
      continue;
    }

    buffer+=char;
  }

  emit(buffer);
  return `${lines.join('\n')}\n`;
}

function minifyCss(source){
  let output='';
  let quote='';
  let escaped=false;
  let pendingSpace=false;

  for(let index=0;index<source.length;index++){
    const char=source[index];
    const next=source[index+1];

    if(quote){
      output+=char;
      if(escaped){escaped=false;continue}
      if(char==='\\'){escaped=true;continue}
      if(char===quote)quote='';
      continue;
    }

    if(char==='"'||char==="'"){
      if(pendingSpace&&output&&!/[{}:;,>\n]$/.test(output))output+=' ';
      pendingSpace=false;
      quote=char;
      output+=char;
      continue;
    }

    if(char==='/'&&next==='*'){
      const end=source.indexOf('*/',index+2);
      if(end<0)throw new Error('Unclosed CSS comment');
      const comment=source.slice(index,end+2).trim();
      output=`${output.trimEnd()}\n${comment}\n`;
      pendingSpace=false;
      index=end+1;
      continue;
    }

    if(/\s/.test(char)){
      pendingSpace=true;
      continue;
    }

    const punctuation='{}:;,>';
    const previous=output.at(-1)||'';
    if(pendingSpace&&output&&!output.endsWith('\n')&&!punctuation.includes(previous)&&!punctuation.includes(char))output+=' ';
    pendingSpace=false;
    output+=char;
  }

  return `${output.trim()}\n`;
}

if(!fs.existsSync(sourceFile)){
  console.error(`Missing readable CSS source: ${path.relative(root,sourceFile)}`);
  process.exit(1);
}

const originalSource=fs.readFileSync(sourceFile,'utf8');
const formatted=formatCss(originalSource);
const compiled=minifyCss(formatted).replace(/url\((['"]?)\.\.\/assets\//g,'url($1assets/');
const write=process.argv.includes('--write');

if(write){
  fs.writeFileSync(sourceFile,formatted);
  fs.writeFileSync(targetFile,compiled);
  console.log(`Formatted ${path.relative(root,sourceFile)} and compiled ${path.relative(root,targetFile)}.`);
}else if(originalSource!==formatted){
  console.error('styles/app.css is not formatted. Run: npm run format:css');
  process.exit(1);
}else if(!fs.existsSync(targetFile)||fs.readFileSync(targetFile,'utf8')!==compiled){
  console.error('app.css is not synchronized with styles/app.css. Run: npm run format:css');
  process.exit(1);
}else{
  console.log(`CSS source/build passed: ${formatted.split('\n').length-1} readable source lines, ${compiled.length} production bytes.`);
}
