import { useEffect } from 'react';
import './CanvasTest.css';

function CanvasTest() {

  useEffect(() => {
    var ctx = document.querySelector('#tutorial11').getContext('2d');
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        ctx.save();
        ctx.fillStyle = 'rgb(' + (51 * i) + ', ' + (255 - 51 * i) + ', 255)';
        ctx.translate(10 + j * 50, 10 + i * 50);
        ctx.fillRect(0, 0, 25, 25);
        ctx.restore(); // translate 원래대로
    }
  }
  ctx.translate(110, 110);
  ctx.save();
  // 파란 사각형
  ctx.fillStyle = '#0095DD';
  ctx.fillRect(30, 30, 100, 100);
  ctx.rotate((Math.PI / 180) * 25);
  // 회색 사각형
  ctx.fillStyle = '#4D4E53';
  ctx.fillRect(30, 30, 100, 100);
  ctx.restore();

  // 우측 사각형, 사각형 중심에서 회전하기
  // 파란 사각형 그리기
  ctx.fillStyle = '#0095DD';
  ctx.fillRect(150, 30, 100, 100);
  ctx.save();

  ctx.translate(200, 80); // 사각형 중심으로 이동하기
                          // x = x + 0.5 * width
                          // y = y + 0.5 * height
  ctx.rotate((Math.PI / 180) * 25); // 회전
  ctx.translate(-200, -80); // 예전 위치로 이동하기

  // 회색 사각형 그리기
  ctx.fillStyle = '#4D4E53';
  ctx.fillRect(150, 30, 100, 100);

  // 단위를 수평, 수직으로 (x, y)만큼 확대 축소, -1.0 : 대칭
  ctx.restore();
  ctx.fillStyle = 'rgb(0,0,0)';
  ctx.translate(20, -120);
  ctx.save();
  ctx.scale(10, 3);
  ctx.fillRect(1, 10, 10, 10);
  ctx.restore();

  // 수평으로 대칭하기
  ctx.scale(-1, 1);
  ctx.font = '48px serif';
  ctx.fillText('MDN', -135, 120);

  let cv12 = document.querySelector('#tutorial12');
  if (cv12.getContext){
    let ctx = cv12.getContext('2d');
    var sin = Math.sin(Math.PI / 6);
    var cos = Math.cos(Math.PI / 6);
    ctx.translate(100, 100);
    var c = 0;
    for (i = 0; i <= 12; i++) {
      c = Math.floor(255 / 12 * i);
      ctx.fillStyle = 'rgb(' + c + ', ' + c + ', ' + c + ')';
      ctx.fillRect(0, 0, 100, 10);
      ctx.transform(cos, sin, -sin, cos, 0, 0);
    }

    ctx.setTransform(-1, 0, 0, 1, 100, 100);
    ctx.fillStyle = 'rgba(255, 128, 255, 0.5)';
    ctx.fillRect(0, 50, 100, 100);

  }

  }, []);

  useEffect(() => {
    let cv9 = document.querySelector('#tutorial9');
    if (cv9.getContext){
      let ctx = cv9.getContext('2d');
      for (var i = 0; i < 6; i++){
        for (var j = 0; j < 6; j++){
          ctx.fillStyle = 'rgb(' + Math.floor(255 - 42.5 * i) + ', ' +
                           Math.floor(255 - 42.5 * j) + ', 0)';
          ctx.fillRect(j*25,i*25,25,25);
        }
      }

      ctx.fillStyle = '#FD0';
      ctx.fillRect(150, 0, 75, 75);
      ctx.fillStyle = '#6C0';
      ctx.fillRect(225, 0, 75, 75);
      ctx.fillStyle = '#09F';
      ctx.fillRect(150, 75, 75, 75);
      ctx.fillStyle = '#F30';
      ctx.fillRect(225, 75, 75, 75);
      ctx.fillStyle = '#FFF';

      // 투명값을 설정한다
      ctx.globalAlpha = 0.2;

      // 반투명한 원을 그린다
      for (i = 0; i < 7; i++){
        ctx.beginPath();
        ctx.arc(225, 75, 10 + 10 * i, 0, Math.PI * 2, true);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      for (i = 0; i < 6; i++) {
        for (j = 0; j < 6; j++) {
          ctx.strokeStyle = 'rgb(0, ' + Math.floor(255 - 42.5 * i) + ', ' +
                           Math.floor(255 - 42.5 * j) + ')';
          ctx.beginPath();
          ctx.arc(162.5 + j * 25, 162.5 + i * 25, 10, 0, Math.PI * 2, true);
          ctx.stroke();
        }
      }

      ctx.fillStyle = 'rgb(255,221,0)';
      ctx.fillRect(0,150,150,37.5);
      ctx.fillStyle = 'rgb(102,204,0)';
      ctx.fillRect(0,187.5,150,37.5);
      ctx.fillStyle = 'rgb(0,153,255)';
      ctx.fillRect(0,225,150,37.5);
      ctx.fillStyle = 'rgb(255,51,0)';
      ctx.fillRect(0,262.5,150,37.5);


      // 반투명한 사각형을 그린다
      for (i=0;i<10;i++){
        ctx.fillStyle = 'rgba(255,255,255,'+(i+1)/10+')';
        for (j=0;j<4;j++){
          ctx.fillRect(5+i*14,155+j*37.5,14,27.5)
        }
      }
    }

    let cv10 = document.querySelector('#tutorial10');
    if (cv10.getContext){
      let ctx = cv10.getContext('2d');
      for (i = 0; i < 10; i++){
        ctx.lineWidth = 1 + i;
        ctx.beginPath();
        ctx.moveTo(5 + i * 14, 5);
        ctx.lineTo(5 + i * 14, 140);
        ctx.stroke();
      }

      var lineCap = ['butt','round','square'];
      ctx.strokeStyle = '#09f';
      ctx.beginPath();
      ctx.moveTo(160, 10);
      ctx.lineTo(290, 10);
      ctx.moveTo(160, 140);
      ctx.lineTo(290, 140);
      ctx.stroke();
    
      // 선을 그린다
      ctx.strokeStyle = 'black';
      for (i=0;i<lineCap.length;i++){
        ctx.lineWidth = 15;
        ctx.lineCap = lineCap[i];
        ctx.beginPath();
        ctx.moveTo(175 + i * 50, 10);
        ctx.lineTo(175 + i * 50,140);
        ctx.stroke();
      }

      // linejoin
      var lineJoin = ['round', 'bevel', 'miter'];
      ctx.lineWidth = 10;
      for (i=0;i<lineJoin.length;i++){
        ctx.lineJoin = lineJoin[i];
        ctx.beginPath();
        ctx.moveTo(-5, 155 + i * 40);
        ctx.lineTo(35, 195 + i * 40);
        ctx.lineTo(75, 155 + i * 40);
        ctx.lineTo(115, 195 + i * 40);
        ctx.lineTo(155, 155 + i * 40);
        ctx.stroke();
      }

      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 2;
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";

      ctx.font = "20px Times New Roman";
      ctx.fillStyle = "Black";
      ctx.fillText("Sample String", 170, 180);




    }

  }, []);

  useEffect(() => {
    // arc and curves
    let cv5 = document.querySelector('#tutorial5');
    if (cv5.getContext){
      let ctx = cv5.getContext('2d');
      ctx.fillStyle = 'purple';

      for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 3; j++) {
          ctx.beginPath();
          var x = 25 + j * 50; // x coordinate
          var y = 25 + i * 50; // y coordinate
          var radius = 20; // Arc radius
          var startAngle = 0; // Starting point on circle
          var endAngle = Math.PI + (Math.PI * j) / 2; // End point on circle
          var anticlockwise = i % 2 == 0 ? false : true; // clockwise or anticlockwise
  
          ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
  
          if (i > 1) {
            ctx.fill();
          } else {
            ctx.stroke();
          }
        }
      }

      // 이차곡선

      ctx.beginPath();
      ctx.moveTo(175, 125);
      ctx.quadraticCurveTo(125, 125, 125, 162.5);
      ctx.quadraticCurveTo(125, 200, 150, 200);
      ctx.quadraticCurveTo(150, 220, 130, 225);
      ctx.quadraticCurveTo(160, 220, 165, 200);
      ctx.quadraticCurveTo(225, 200, 225, 162.5);
      ctx.quadraticCurveTo(225, 125, 175, 125);
      ctx.stroke();
    }

    let cv6 = document.querySelector('#tutorial6');
    if (cv6.getContext){
      let ctx = cv6.getContext('2d');
       // Cubic curves example
    ctx.beginPath();
    ctx.moveTo(75, 40);
    ctx.bezierCurveTo(75, 37, 70, 25, 50, 25);
    ctx.bezierCurveTo(20, 25, 20, 62.5, 20, 62.5);
    ctx.bezierCurveTo(20, 80, 40, 102, 75, 120);
    ctx.bezierCurveTo(110, 102, 130, 80, 130, 62.5);
    ctx.bezierCurveTo(130, 62.5, 130, 25, 100, 25);
    ctx.bezierCurveTo(85, 25, 75, 37, 75, 40);
    
    // change canvas color to purple
    ctx.fillStyle = '#a55eea';
    
    ctx.fill();
    }

    let cv7 = document.querySelector('#tutorial7');
    if (cv7.getContext){
      let ctx = cv7.getContext('2d');

      var rectangle = new Path2D();
      rectangle.rect(10, 10, 50, 50);

      var circle = new Path2D();
      circle.moveTo(125, 35);
      circle.arc(100, 35, 25, 0, 2 * Math.PI);

      ctx.stroke(rectangle);
      ctx.fill(circle);

      // svg path
    }

    let cv8 =document.querySelector('#tutorial8');
    if (cv8.getContext){
      let ctx = cv8.getContext('2d');
      ctx.font = '48px serif';
      ctx.fillText('Hello world', 10, 50);

      ctx.strokeText('Hello world', 10, 100);

      ctx.textBaseline = 'hanging';
      ctx.strokeText('Hello world', 1, 150);

    }
  },[]);

  useEffect(() => {
    let cv = document.querySelector('#tutorial')
  if (cv.getContext){

    // rectangle
    let ctx = cv.getContext('2d');
    
    // fill ctx with rgb(200, 0, 0) rectangle
    ctx.fillStyle = 'rgb(200, 0, 0)';
    ctx.fillRect(10, 100, 50, 50);
    
    ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
    ctx.fillRect (30, 30, 50, 300); // x, y, width, height
    
    ctx.strokeRect(30, 30, 50, 300);
    ctx.clearRect(50, 100, 15, 15);

    ctx.fillRect(25, 25, 100, 100);
    ctx.clearRect(45, 45, 60, 60);
    ctx.strokeRect(50, 50, 50, 50);
  }
  
  let cv2 = document.querySelector('#tutorial2')
  if (cv2.getContext){
    // path
    let ctx = cv2.getContext('2d');
    
    // draw something on ctx
    ctx.beginPath();
    ctx.moveTo(75, 50);
    ctx.lineTo(100, 75);
    ctx.lineTo(100, 25);
    ctx.fill();
    
  }

  let cv3 = document.querySelector('#tutorial3');
  if (cv3.getContext){
    let ctx = cv3.getContext('2d');

    ctx.beginPath();
    ctx.arc(75, 75, 50, 0, Math.PI * 2, true); // Outer circle
    ctx.moveTo(110, 75);
    ctx.arc(75, 75, 35, 0, Math.PI, false);  // Mouth (clockwise)
    ctx.moveTo(65, 65);
    ctx.arc(60, 65, 5, 0, Math.PI * 2, true);  // Left eye
    ctx.moveTo(95, 65);
    ctx.arc(90, 65, 5, 0, Math.PI * 2, true);  // Right eye
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(125, 125);
    ctx.lineTo(205, 125);
    ctx.lineTo(125, 205);
    ctx.fill();

    // Stroked triangle
    ctx.beginPath();
    ctx.moveTo(225, 225);
    ctx.lineTo(225, 145);
    ctx.lineTo(145, 225);
    // ctx.closePath();
    ctx.stroke(); // 윤곽선을 이용하여 도형을 그립니다.
  }

  let cv4 = document.querySelector('#tutorial4');
  if (cv4.getContext){
    let ctx = cv4.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(120, 120)
    // ctx.lineTo(120, 120);
    ctx.lineTo(50, 30);
    ctx.lineTo(60, 10)
    // ctx.closePath();
    ctx.stroke()
  }
  
  }, []);

  
  return (
    <div className="CanvasTest">
      <body>
        <div>
          <canvas id="tutorial" width="300" height="300"></canvas>
          <canvas id="tutorial2" width="300" height="300"></canvas>
          <canvas id="tutorial3" width="300" height="300"></canvas>
          <canvas id="tutorial4" width="300" height="300"></canvas>
        </div>
        <div>
          <canvas id="tutorial5" width="300" height="300"></canvas>
          <canvas id="tutorial6" width="300" height="300"></canvas>
          <canvas id="tutorial7" width="300" height="300"></canvas>
          <canvas id="tutorial8" width="300" height="300"></canvas> 
        </div>
        <div>
          <canvas id="tutorial9" width="300" height="300"></canvas>
          <canvas id="tutorial10" width="300" height="300"></canvas>
        </div>
          <canvas id="tutorial11" width="500" height="500"></canvas>
          <canvas id="tutorial12" width="300" height="500"></canvas>

      </body>

    </div>
  );
}

export default CanvasTest;
