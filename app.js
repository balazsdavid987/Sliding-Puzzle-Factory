'use strict';

var settings =  {
  lang:     'en',
  controls: true,
  url:      null,
  img:      null,
  x:        0,
  y:        0,
  size:     100,
  color1:   '#DEDEDE',
  color2:   '#212121',
  isActive: false,
  moves:    0,
  start:    0,
  state:    [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ]
};

var texts = {
  buttonChooseAnImage: {
    en: 'Choose an image',
    hu: 'Kép kiválasztása'
  },
  buttonShare: {
    en: 'Share',
    hu: 'Megosztás'
  },
  textLanguage: {
    en: 'Language:',
    hu: 'Nyelv:'
  },
  textFrame: {
    en: 'Frame:',
    hu: 'Keret:'
  },
  textBackground: {
    en: 'Background:',
    hu: 'Háttér:'
  },
  textTimeElapsed: {
    en: 'Time elapsed:',
    hu: 'Eltelt idő:'
  },
  textNumberOfMoves: {
    en: 'Number of moves:',
    hu: 'Lépések száma:'
  },
  textPlayAgain: {
    en: 'Would you like to play again?',
    hu: 'Játszol egy újat?'
  },
  textCongratulations: {
    en: 'Congratulations! You\'ve solved the puzzle!',
    hu: 'Gratulálok, kiraktad!'
  },
  textChooseAnImageFirst: {
    en: 'Please choose an image first.',
    hu: 'Először válassz egy képet!'
  },
  textWarning: {
    en: 'Your image will be uploaded to imgur.com and publicly available on the Internet. Are you okay with that?',
    hu: 'A képed feltöltésre kerül az imgur.com-ra és nyilvánosan elérhető lesz az Interneten. Rendben?'
  },
  textUnsuccessfulSharing: {
    en: 'Sharing is unsuccesful.',
    hu: 'Megosztás sikertelen.'
  },
  textImageIsBeingUploaded: {
    en: 'Your image is being uploaded...',
    hu: 'A képed feltöltés alatt...'
  },
  textErrorHasOccured: {
    en: 'An error has occured.',
    hu: 'Hiba történt.'
  },
  textPuzzleIsAvailable: {
    en: 'Your puzzle is available at:',
    hu: 'A kirakó elérhető az alábbi címen:'
  }
};

function parseSettings() {
  if(location.hash) {
    var parsed = location.hash.substr(1).split('&').map(el => el.split('='))
      .reduce((pre, cur) => { pre[cur[0]] = cur[1]; return pre; }, { });

    settings.controls = (parsed.c !== '0');
    settings.lang = (parsed.l == 'hu' ? 'hu' : 'en');

    settings.x = (parsed.x != undefined ? parseInt(parsed.x) : 0);
    settings.y = (parsed.y != undefined ? parseInt(parsed.y) : 0);
    settings.size = (parsed.s != undefined ? parseInt(parsed.s) : 100);
    settings.shuffleMoves = (parsed.m != undefined ? parseInt(parsed.m) : 250);

    if(parsed.u != undefined) {
      settings.url = parsed.u;
    }

    if(parsed.clr1 != undefined) {
      settings.color1 = '#' + parsed.clr1;
    }

    if(parsed.clr2 != undefined) {
      settings.color2 = '#' + parsed.clr2;
    }
  }
}

function addColorPicker(i) {
  var options = [];
  options.push('onFineChange:\'setColor(' + i + ', this)\'');
  options.push('value:\'' + settings['color' + i]+ '\'');
  options.push('valueElement:null');
  options.push('shadow:false');
  options.push('borderWidth:0');
  options.push('width:250');
  options.push('height:150');
  options.push('position:\'top\'');
  options.push('borderColor:\'#FFF\'');
  options.push('backgroundColor:\'transparent\'');
  options.push('insetColor:\'#000\'');
  options.push('padding:0');

  var input = document.createElement('input');
  input.type = 'button';
  input.className = 'jscolor { ' + options.join(',') + ' }';
  document.getElementById('btnColor' +i).appendChild(input);
}

function applyLanguage() {
  document.getElementById('textLanguage').innerText =     texts.textLanguage[settings.lang];
  document.getElementById('btnChooseAnImage').innerText = texts.buttonChooseAnImage[settings.lang];
  document.getElementById('textFrame').innerText =        texts.textFrame[settings.lang];
  document.getElementById('textBackground').innerText =   texts.textBackground[settings.lang];
  document.getElementById('btnShare').value =             texts.buttonShare[settings.lang];
  document.getElementById('timeelapsed').innerText =      texts.textTimeElapsed[settings.lang] + ' 00:00';
  document.getElementById('numberofmoves').innerText =    texts.textNumberOfMoves[settings.lang] + ' 0';
}

// Event listeners

document.getElementById('lang-hu').addEventListener('click', function() {
  setLanguage('hu');
});

document.getElementById('lang-en').addEventListener('click', function() {
  setLanguage('en');
});

document.getElementById('file').addEventListener('change', function(e) {
  selectFile(URL.createObjectURL(e.target.files[0]));
});

document.getElementById('btnShare').addEventListener('click', share);

var btnEvents = [
  // id, property, value
  [ 'btnIncreaseSize', 'size',  1 ],
  [ 'btnDecreaseSize', 'size', -1 ],
  [ 'btnIncreasePositionX', 'x',  1 ],
  [ 'btnDecreasePositionX', 'x', -1 ],
  [ 'btnIncreasePositionY', 'y',  1 ],
  [ 'btnDecreasePositionY', 'y', -1 ]
];

var interval, element;
for(let i = 0; i < btnEvents.length; i++) {
  element = document.getElementById(btnEvents[i][0]);
  element.addEventListener('mousedown',
    createInterval(btnEvents[i][1], btnEvents[i][2])
  );
  element.addEventListener('touchstart',
    createInterval(btnEvents[i][1], btnEvents[i][2])
  );
  element.addEventListener('mouseup', function() {
    clearInterval(interval);
  });
  element.addEventListener('touchend', function() {
    clearInterval(interval);
  });
}

function createInterval(property, value) {
  return function() {
    if(settings.img == null) {
      alert(texts.textChooseAnImageFirst[settings.lang]);
      return;
    }
    interval = setInterval(function() {
      set(property, value);
    }, 16);
  };
}

document.getElementById('game').addEventListener('click', function(e) {
  var rect = this.getBoundingClientRect();
  clickCanvas(e.clientX - rect.left, e.clientY - rect.top);
});

// Event handler functions

function setLanguage(lang) {
  if(settings.lang != lang) {
    settings.lang = lang;
    applyLanguage();
  }
}

function selectFile(file) {
  document.getElementById('no-image').style.display = 'none';

  ctx.help.rect(0, 0, 113, 113);
  ctx.help.fillStyle = 'white';
  ctx.help.fill();

  settings.size = 100;
  settings.x = 0;
  settings.y = 0;

  loadImage(file);
}

function loadImage(file) {
  settings.img = new Image();
  settings.img.crossOrigin = 'Anonymous';
  settings.img.src = file;
  settings.img.onload = draw;
}

function uploadImage() {
  var xmlhttp = new XMLHttpRequest();
  var response;

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4) {
      if (xmlhttp.status == 200) {
        response = JSON.parse(xmlhttp.responseText);
        if(response.data.link != undefined) {
          settings.url = response.data.link;
          onShareSuccess();
        }
        else {
          onShareError(xmlhttp.responseText);
        }
      }
      else {
        onShareError('xmlhttp.status: ' + xmlhttp.status);
      }
    }
  };

  xmlhttp.open('POST', 'https://api.imgur.com/3/image', true);
  xmlhttp.setRequestHeader('Authorization', 'Client-ID bc1317bf562911a');

  var formData = new FormData();
  formData.append('image', document.getElementById('file').files[0]);
  xmlhttp.send(formData);
}

function set(what, value) {
  settings[what] += value;
  draw();
}

function setColor(which, jscolor) {
  settings['color' + which] = '#' + jscolor;
  draw();
}

function share() {
  if(settings.img != null) {
    if(confirm(texts.textWarning[settings.lang])) {
      onShareStart();
    }
    else {
      alert(texts.textUnsuccessfulSharing[settings.lang]);
    }
  }
  else {
    alert(texts.textChooseAnImageFirst[settings.lang]);
  }
}

function clickCanvas(x, y) {
  var x1, x2, y1, y2;
  var row, col;

  for(let i = 0; i <= 16; i++) {
    if(i == 0) {
      col = 3;
      row = -1;
    }
    else {
      col = (i-1) % 4;
      row = Math.floor((i-1) / 4);
    }

    x1 = 2 + size.padding + (size.tile + 2) * col;
    x2 = x1 + size.tile;
    y1 = 2 + size.paddingtop + size.tile + (size.tile + 2) * row;
    y2 = y1 + size.tile;

    if(x >= x1 && x <= x2 && y >= y1 && y <= y2) {
      clickTile(i);
    }
  }
}

function clickTile(tile) {
  // extra tile is clicked and the top right tile is empty
  if(tile == 0) {
    // don't combine the two conditions here becase
    // the extra tile might be clicked when the top
    // right tile is not empty and thus no move is made
    if(settings.state[3] == 0) {
      settings.state[3] = 4;

      draw();

      if(settings.isActive && isSolved()) {
        settings.moves++;
        updateNumberOfMoves();
        settings.isActive = false;
        setTimeout(function() {
          var msg = texts.textCongratulations[settings.lang] + '\n\n';
          msg += texts.textNumberOfMoves[settings.lang] + ' ' + settings.moves + '\n\n';
          msg += texts.textTimeElapsed[settings.lang] + ' ' + getTimeElapsed() + '\n';
          alert(msg);

          clearInterval(interval); // stop timer

          if(confirm(texts.textPlayAgain[settings.lang])) {
            location.reload();
          }
        }, 100);
      }
    }
    return;
  }

  // top right tile is clicked and the extra tile is empty
  if(tile == 4 && settings.state[3] == 4) {
    settings.state[3] = 0;

    draw();

    if(settings.isActive) {
      settings.moves++;
      updateNumberOfMoves();
    }
    return;
  }

  var currentTile = settings.state[tile-1];
  var checkTile;

  for(let i = 0; i < legalMoves[tile].length; i++) {
    switch(legalMoves[tile][i]) {
      case 1:
        checkTile = tile - 1 - 4;
        break;
      case 2:
        checkTile = tile - 1 + 1;
        break;
      case 3:
        checkTile = tile - 1 + 4;
        break;
      case 4:
        checkTile = tile - 1 - 1;
        break;
    }
    if(settings.state[checkTile] == 0) {
      settings.state[checkTile] = currentTile;
      settings.state[tile-1] = 0;

      draw();

      if(settings.isActive) {
        settings.moves++;
        updateNumberOfMoves();
      }
    }
  }
}

function onShareStart() {
  drawSmallPuzzle(true);
  document.getElementById('container').style.display = 'none';
  document.getElementById('share').style.display = 'block';
  document.getElementById('textShare').innerText =
    texts.textImageIsBeingUploaded[settings.lang];
  uploadImage();
}

function onShareSuccess() {
  drawSmallPuzzle();
  document.getElementById('spinner').style.display = 'none';
  document.getElementById('textShare').innerText =
    texts.textPuzzleIsAvailable[settings.lang];

  var link = getShareURL();
  var a = document.createElement('a');
  a.href =  link;
  a.innerHTML = link;
  a.target = '_blank';
  document.getElementById('share').appendChild(a);
}

function onShareError(msg) {
  document.getElementById('spinner').style.display = 'none';
  document.getElementById('textShare').innerHTML =
  texts.textErrorHasOccured[settings.lang] + '<br>(' + msg + ')';
}

// Drawing functions

function drawRoundedRectangle(context, x, y, w, h, r, color, fill = true) {
  context.beginPath();
  context.moveTo(x + 2*r, y);
  context.lineTo(x + w - 2*r, y);
  context.quadraticCurveTo(x + w, y, x + w, y + 2*r);
  context.lineTo(x + w, y + h - 2*r);
  context.quadraticCurveTo(x + w, y + h, x+w-2*r, y+h);
  context.lineTo(x + 2*r, y + h);
  context.quadraticCurveTo(x, y + h, x, y + h - 2*r);
  context.lineTo(x, y + 2*r);
  context.quadraticCurveTo(x, y, x + 2*r, y);
  context.closePath();

  if(fill) {
    context.fillStyle = color;
    context.fill();
  }
}

function drawFrame() {
  var x = 1.5;
  var y = 1.5;
  var w = size.padding * 2 + 4 * (size.tile + 2) + 2;
  var h = size.padding + size.paddingtop + size.tile * 5;
  var r = 16;

  drawRoundedRectangle(ctx.game, x, y, w, h, r, settings.color1);

  ctx.game.globalCompositeOperation='source-atop';

  ctx.game.shadowOffsetX = 500;
  ctx.game.shadowOffsetY = 0;
  ctx.game.shadowBlur = 15;
  ctx.game.shadowColor = 'rgba(30,30,30,1)';

  drawRoundedRectangle(ctx.game, x - 500, y, w, h, r, settings.color1, false);

  ctx.game.stroke();
  ctx.game.stroke();

  ctx.game.globalCompositeOperation='source-over';
}

function drawBackground() {
  ctx.game.beginPath();

  // the board with the 16 tiles
  ctx.game.rect(
    1 + size.padding,
    1 + size.paddingtop + size.tile - 2,
    4 * (size.tile + 2) + 2,
    4 * (size.tile + 2) + 2
  );

  // the extra tile at the top right corner
  ctx.game.rect(
    1 + size.padding + 3 * (size.tile + 2),
    1 + size.paddingtop - 4,
    size.tile + 2 + 2,
    size.tile + 2
  );

  ctx.game.closePath();

  ctx.game.fillStyle = settings.color2;
  ctx.game.fill();
}

function drawImage() {
  ctx.help.rect(0, 0, 113, 113);
  ctx.help.fillStyle = 'white';
  ctx.help.fill();

  if(settings.img != null) {
    var w, h, w2, h2;
    if(settings.img.height > settings.img.width) { // portrait
      w = 113;
      h = settings.img.height / (settings.img.width / 113);
      w2 = 362;
      h2 = settings.img.height / (settings.img.width / 362);
    }
    else {
      w = settings.img.width / (settings.img.height/ 113);
      h = 113;
      w2 = settings.img.width / (settings.img.height/ 362);
      h2 = 362;
    }

    ctx.help.drawImage(settings.img,
      0 + settings.x,
      0 + settings.y,
      w * (settings.size / 100),
      h * (settings.size / 100)
    );

    ctx.game.rect(
      1.5 + size.padding,
      1.5 + (size.paddingtop + size.tile) / 2 - size.padding,
      113, 113
    );
    ctx.game.fillStyle = settings.color2;
    ctx.game.fill();

    ctx.game.drawImage(canvas.help,
      1.5 + size.padding + 2,
      1.5 + (size.paddingtop + size.tile) / 2 - size.padding + 1,
      110, 110
    );
  }

  for(let row = 0; row < 4; row++) {
    for(let col = 0; col < 4; col++) {
      drawRoundedRectangle(
        ctx.image,
        2 + (size.tile + 2) * col,
        2 + (size.tile + 2) * row,
        size.tile, size.tile, 5, 'black'
      );
    }
  }

  ctx.image.globalCompositeOperation = 'source-atop';

  ctx.image.rect(0, 0, 362, 362);
  ctx.image.fillStyle = 'white';
  ctx.image.fill();

  if(settings.img != null) {
    ctx.image.drawImage(settings.img,
      0 + settings.x / 113 * 362,
      0 + settings.y / 113 * 362,
      w2 * settings.size/100,
      h2 * settings.size/100
    );
  }
  else {
    ctx.image.font = 'normal 44px Roboto';
    ctx.image.fillStyle = 'black';
    var offsetx, offsety;
    for(let tile = 0; tile < 16; tile++) {
      ctx.image.fillText(
        tile + 1,
        size.padding + (size.tile + 2) * (tile % 4) - 40 + (tile < 9 ? 15 : 0),
        size.padding + (size.tile + 2) * Math.floor(tile / 4) + 6
      );
    }
  }
}

function drawState() {
  var a, b, c, d;
  for(let i = 0; i < settings.state.length; i++) {
    if(settings.state[i] == 0) {
      a = 3;
      b = 0;
      c = 3;
      d = -1;
    }
    else {
      a = ((settings.state[i]-1) % 4);
      b = Math.floor((settings.state[i]-1) / 4);
      c = i % 4;
      d = Math.floor(i / 4);
    }
    ctx.game.drawImage(canvas.image,
      2 + (size.tile + 2) * a,
      2 + (size.tile + 2) * b,
      size.tile, size.tile,
      3 + size.padding + (size.tile + 2) * c,
      1 + size.paddingtop + size.tile + (size.tile + 2) * d,
      size.tile, size.tile
    );
  }
}

function drawSmallPuzzle(grayscale = false) {
  var context = document.getElementById('small').getContext('2d');
  context.imageSmoothingQuality = 'high';
  context.drawImage(canvas.game, 0, 0, 320, 380);

  if(grayscale) {
    var imageData = context.getImageData(0, 0, 320, 380);
    var data = imageData.data;

    for(var i = 0; i < data.length; i += 4) {
      var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
      data[i] = brightness;
      data[i + 1] = brightness;
      data[i + 2] = brightness;
    }

    context.putImageData(imageData, 0, 0);
  }
}

function draw() {
  ctx.game.clearRect(0, 0, canvas.game.width, canvas.game.height);
  drawFrame();
  drawBackground();
  drawImage();
  drawState();
}

// Auxiliary functions

function isSolved() {
  for(let i = 0; i < settings.state.length; i++) {
    if(settings.state[i] != i+1) {
      return false;
    }
  }
  return true;
}

function shuffle(moves, animate = false, previousTile = 0, emptyTile = 0) {
  if(emptyTile == 0) {
    emptyTile = 4;
    if(animate) {
      clickTile(4);
    }
    else {
      settings.state[3] = 0;
    }
  }
  else {
    var currentMove;
    var randomMove = previousTile;
    while(randomMove == previousTile) {
      randomMove = legalMoves[emptyTile][Math.floor(Math.random() * legalMoves[emptyTile].length)];
    }

    switch(randomMove) {
      case 1:
        currentMove = emptyTile - 4;
        break;
      case 2:
        currentMove = emptyTile + 1;
        break;
      case 3:
        currentMove = emptyTile + 4;
        break;
      case 4:
        currentMove = emptyTile - 1;
        break;
    }

    if(animate) {
      clickTile(currentMove);
    }
    else {
      settings.state[emptyTile-1] = settings.state[currentMove-1];
      settings.state[currentMove-1] = 0;
    }
    previousTile = emptyTile;
    emptyTile = currentMove;
  }

  moves--;

  if(moves > 0) {
    if(animate) {
      setTimeout(function() { shuffle(moves, animate, previousTile, emptyTile); }, 50);
    }
    else {
      shuffle(moves, animate, previousTile, emptyTile);
    }
  }
  if(moves == 0 && !animate) {
    draw();
  }
}

function getShareURL() {
  var parameters = [];

  parameters.push('c=0');

  if(settings.lang != 'en') {
    parameters.push('l=' + settings.lang);
  }

  parameters.push('clr1=' + settings.color1.substring(1));
  parameters.push('clr2=' + settings.color2.substring(1));

  if(settings.x != 0) {
    parameters.push('x=' + settings.x);
  }

  if(settings.y != 0) {
    parameters.push('y=' + settings.y);
  }

  if(settings.size != 100) {
    parameters.push('s=' + settings.size);
  }

  parameters.push('u=' + settings.url);

  return window.location.href.split('#')[0] + '#' + parameters.join('&');
}

function updateNumberOfMoves() {
  document.getElementById('numberofmoves').innerText =
    texts.textNumberOfMoves[settings.lang] + ' ' + settings.moves;
}

function updateTimeElapsed() {
  document.getElementById('timeelapsed').innerText =
    texts.textTimeElapsed[settings.lang] + ' ' + getTimeElapsed();
}

function getTimeElapsed() {
  var elapsed = new Date() - settings.start;
  elapsed = Math.round(elapsed / 1000);

  var minutes = Math.floor(elapsed / 60);
  var seconds = elapsed % 60;

  if(minutes < 10) {
    minutes = '0' + minutes;
  }

  if(seconds < 10) {
    seconds = '0' + seconds;
  }

  return minutes + ':' + seconds;
}

var canvas = {
  game:  document.getElementById('game'),
  help:  document.getElementById('help'),
  image: document.getElementById('image'),
};

var ctx = {
  game:  canvas.game.getContext('2d'),
  help:  canvas.help.getContext('2d'),
  image: canvas.image.getContext('2d'),
};

ctx.game.imageSmoothingQuality = 'high';
ctx.help.imageSmoothingQuality = 'high';
ctx.image.imageSmoothingQuality = 'high';

var size = {
  padding:    8 * 7,
  paddingtop: 8 * 9,
  tile:       8 * 11,
};

var center = {
  x: canvas.game.width / 2,
  y: canvas.game.height / 2
};

// 1: up, 2: right, 3: down, 4: left
var legalMoves = {
   1: [ 2, 3 ],
   2: [ 2, 3, 4 ],
   3: [ 2, 3, 4 ],
   4: [ 3, 4 ],
   5: [ 1, 2, 3 ],
   6: [ 1, 2, 3, 4 ],
   7: [ 1, 2, 3, 4 ],
   8: [ 1, 3, 4 ],
   9: [ 1, 2, 3 ],
  10: [ 1, 2, 3, 4 ],
  11: [ 1, 2, 3, 4 ],
  12: [ 1, 3, 4 ],
  13: [ 1, 2 ],
  14: [ 1, 2, 4 ],
  15: [ 1, 2, 4 ],
  16: [ 1, 4 ]
};

(function() {
  parseSettings();

  if(settings.controls) {
    document.getElementById('lang-' + settings.lang).checked = true;
    addColorPicker(1);
    addColorPicker(2);
  }
  else {
    document.getElementById('controls').style.display = 'none';
    document.getElementById('github').style.display = 'none';
    document.getElementById('gameplay-details').style.display = 'flex';

    shuffle(settings.shuffleMoves, false);

    settings.isActive = true;
    settings.moves = 0;
    settings.start = new Date();
    interval = setInterval(updateTimeElapsed, 1000);
  }

  if(settings.url != null) {
    loadImage(settings.url);
  }

  applyLanguage();

  draw();
})();
