function TextBox(x, y, width, height, config){
  let self = Object.assign({
    textTestId: 'textTest',
    svgId: 'svg',
    fontSize: 16,
    fontFamily: '微软雅黑',
    fontWeight: 'normal',
    lineHeight: 1,
    color: 'black',
    textIndext: true,
    align: 'left',
    letterSpacing: 0,
    wordSpacing: 1,
    scaleX: 1,
    scaleY: 1
  }, config);
  
  self.x = x;
  self.y = y;
  self.width = width;
  self.height = height;
  self.content = null;
  self.lines = [];
  // this.content = null;
  // this.textTestId = obj.textTestId;
  // this.svgId = obj.svgId;
  // this.fontSize = obj.fontSize;
  // this.fontFamily = obj.fontFamily;
  // this.fontWeight = obj.fontWeight;
  // this.lineHeight = obj.lineHeight,
  // this.color = obj.color;
  // this.textIndent = obj.textIndent;
  // this.align = obj.align;
  // this.letterSpacing = obj.letterSpacing;
  // this.wordSpacing = obj.wordSpacing;
  // let _content = null;
  // 
  // this.setContent = function(content){
  //   _content = content;
  // }
  // 
  // this.getContent = function(){
  //   return _content;
  // }
  
  if(self.width < self.fontSize){
    throw 'width 必须大于 fontSize';
  }
  
  if(self.textTestId == null){
    throw '必须提供textTestId';
  }
  
  var textTest = document.getElementById('textTest');
  if(textTest == null){
    throw '提供的textTestId无效';
  }
  
  let svg = d3.select(self.svgId);
  if(svg == null){
    throw '提供的svgId无效';
  }
  
  this.getLines = function(content){
    if(content !== self.content){
      self.content = content;
      self.lines = [];
    }
    
    // let startTime = new Date().getTime();
    // console.log('开始执行时间：' + startTime);
    //--------------------------------------
    if(self.lines.length>0){
      return self.lines;
    }else{
      let contents = self.content.split('\n');
      let rowIndex = 0;
      let lineHeight = self.fontSize * self.lineHeight;
      for(let i = 0; i < contents.length; i++){
        let text = contents[i];
        let lines = convert(text);
        for(let j = 0; j < lines.length; j++){
          let line = lines[j];
          line.y = self.y + rowIndex * lineHeight;
          line.x = self.x;
          line.text = text.substr(line.index, line.length);
          
          if(self.align === 'left'){
            if(line.row === 0 && self.textIndext){
              line.x += self.fontSize
            }
          }else if(self.align === 'center'){
            if(!line.stretch){
              line.x += (self.width - line.width) / 2;
            }
          }else{
            //right
            if(!line.stretch){
              line.x += self.width - line.width;
            }
          }
          
          self.lines.push(line);
          rowIndex++;
        }
      }
    }
    //--------------------------------------
    // let endTime = new Date().getTime();
    // console.log('结束执行时间：' + endTime);
    // console.log('执行时长：' + (endTime - startTime));
    // console.log(self.lines);
    return self.lines;
  }
  
  function convert(text){
    
    let lines = [];

    textTest.setAttribute("font-size", self.fontSize + "px");
    textTest.setAttribute('font-family', self.fontFamily);
    textTest.setAttribute('font-weight', self.fontWeight);
    
    let line = {
      index: 0, //开始字符串索引
      length: 0, //字符串长度
      width: 0 ,//行的宽度
      stretch: false,
      row: 0 //段落的第几行,首行要缩进
    };
    
    if(text.length === 0){
      lines.push(line);
      return lines;
    }
    
    let rowLimitWidth = self.align === 'left' && self.textIndent ? self.width - self.fontSize * 2 : self.width;
    for(let i = 0; i < text.length; i++){
      
      textTest.textContent = text[i];
      let textLength = textTest.getComputedTextLength();
      if(textLength + line.width < rowLimitWidth){
        //行宽加了当前这个字的宽度依然小于限定宽度
        line.width += textLength;
      }else if(textLength + line.width === rowLimitWidth){
        //行宽正好和限定宽度一样
        line.width += textLength;
        line.length = i - line.index + 1;
        line.stretch = true;
        lines.push(line);
        
        rowLimitWidth = self.width;
        
        line = {
          index: i + 1,
          length: 0,
          width: 0,
          stretch: false,
          row: line.row + 1
        };
      }else{
        //行宽小于限定宽度,但是加了当前这个字会超过限定宽度,比较加之前和加之后哪个更接近限定宽度
        if(rowLimitWidth - line.width < line.width + textLength - rowLimitWidth){
          //加之前更接近
          line.length = i - line.index;
          line.stretch = true;
          lines.push(line);
          
          rowLimitWidth = self.width;
          
          line = {
            index: i,
            length: 0,
            width: textLength,
            stretch: false,
            row: line.row + 1
          }
        }else{
          //加之后更接近
          line.width += textLength;
          line.length = i - line.index + 1;
          line.stretch = true;
          lines.push(line);
          
          rowLimitWidth = self.width;
          
          line = {
            index: i + 1,
            length: 0,
            width: 0,
            stretch: false,
            row: line.row + 1
          };
        }
      }
    }
    
    if(line.width>0){
      line.length = text.length - line.index;
      lines.push(line);
    }
    
    return lines;
  }
  
  this.drawText = function(content){
    let lines = this.getLines(content);
    console.log(lines);
    for(let i = 0; i < lines.length; i++){
      let line = lines[i];
      let text = svg.append('text')
        .text(line.text)
        .attr('x', line.x)
        .attr('y', line.y)
        .attr('alignment-baseline', 'text-before-edge')
        .attr('font-size', self.fontSize)
        .attr('font-weight', self.fontWeight)
        .attr('font-family', self.fontFamily)
      
      if(line.stretch){
        text.attr('textLength', self.width);
      }
    }
    
    return lines.length * self.fontSize * self.lineHeight;
  }
  
  this.drawArticle = function(article){
    let contents = article.split('\n');
    for(let i = 0; i < contents.length; i++){
      let content = contents[i];
      if(content.length > 0){
        let height = this.drawText(content);
        self.y += height;
      }else{
        self.y += self.fontSize * self.lineHeight;
      }
      
    }
  }
  
  /**
  * 测量并返回字符串中每个字符的宽度数组
  * @param {String} content 传入字符串
  * @return {Array}
  */
  this.getTextLengthArray = function(content){
    
    let startTime = new Date().getTime();
    console.log('开始执行时间：' + startTime);
    //--------------------------------------
    
    textTest.setAttribute("font-size", self.fontSize + "px");
    textTest.setAttribute('font-family', self.fontFamily);
    textTest.setAttribute('font-weight', self.fontWeight);
    
    let array = [];
    for(let i in content){
      textTest.textContent = content[i];
      array.push(textTest.getComputedTextLength());
    }
    
    //--------------------------------------
    let endTime = new Date().getTime();
    console.log('结束执行时间：' + endTime);
    console.log('执行时长：' + (endTime - startTime));
    
    return array;
  }
}