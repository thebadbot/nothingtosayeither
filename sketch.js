let canvas;
let simple;
let complex;
let isSimple = true;
let drawCount = 0;
let img;

function preload(){
  img = loadImage("img.png")
}

function SimpleDFT() {
    this.coordx = [];
    this.coordy = [];

    this.dftX;
    this.dftY;

    this.time = 0;
    this.path = [];
    this.iteration = 0;

    this.reset = function() {
      this.coordx = [];
      this.coordy = [];

      this.time = 0;
      this.path = [];
      this.iteration = 0;
    }

    this.dft = function(x) {
      let X = [];
      const N = x.length;

      for(let k = 0; k < N; k++){
        let re = 0;
        let im = 0;

        for(let n = 0; n < N; n++){
          re += x[n] * cos(TWO_PI*k*n/N);
          im -= x[n] * sin(TWO_PI*k*n/N);
        }
        re = re / N;
        im = im / N;

        let freq = k;
        let ampl = sqrt(re * re + im * im);
        let phase = atan2(im, re);

        X[k] = { re, im, freq, ampl, phase };
      }

      return X;
    }

    this.epicycles = function(x, y, rot, dftXY) {
       for(let X = 0; X < dftXY.length; X++){
          let prevx = x;
          let prevy = y;

          x += dftXY[X].ampl * cos(dftXY[X].freq * this.time + dftXY[X].phase + rot);
          y += dftXY[X].ampl * sin(dftXY[X].freq * this.time + dftXY[X].phase + rot);

          (X > 0 ? stroke(253, 203, 46, 100) : stroke(253, 203, 46));
          noFill();
          ellipse(prevx, prevy, dftXY[X].ampl*2);
          stroke(253, 203, 46);

          fill(253, 203, 46);
          line(prevx, prevy, x, y);
       }
       return createVector(x, y);
     }

     this.draw = function() {
       if(this.iteration < this.coordx.length+1){
         background(0);

         let vx = this.epicycles(400, 50, 0, this.dftX);
         let vy = this.epicycles(50, 300, HALF_PI, this.dftY);
         let v = createVector(vx.x, vy.y);

         this.path.unshift(v);

         if(this.iteration < this.coordx.length){
           line(vx.x, vx.y, v.x, v.y);
           line(vy.x, vy.y, v.x, v.y);
         }
         beginShape();
         noFill();
         for(let i = 0; i < this.path.length; i++) {
           vertex(this.path[i].x, this.path[i].y);
         }
         endShape();

         const dt = TWO_PI / this.dftY.length;
         this.time -= dt;
         this.iteration++;

         return false;
       }
       return true;
    }

    this.setHeart = function() {
      this.reset();

      for(let t = 0; t < TWO_PI; t+=0.05){
        let heartx = 16*sin(t)**3;
        let hearty = 13*cos(t) - 5*cos(2*t) - 2*cos(3*t) - cos(4*t);
        this.coordx.push(-heartx*10);
        this.coordy.push(-hearty*10);
      }

      this.dftX = this.dft(this.coordx);
      this.dftY = this.dft(this.coordy);
    }

    this.setHeartReverse = function() {
      this.reset();

      for(let t = 0; t < TWO_PI; t+=0.05){
        let heartx = 16*sin(t)**3;
        let hearty = 13*cos(t) - 5*cos(2*t) - 2*cos(3*t) - cos(4*t);
        this.coordx.push(-heartx*10);
        this.coordy.push(-hearty*10);
      }

      this.coordx.reverse();
      this.coordy.reverse();

      this.dftX = this.dft(this.coordx);
      this.dftY = this.dft(this.coordy);
    }
}

this.Complex = function(re, im){
  this.re = re;
  this.im = im;

  this.add = function(c){
    this.re += c.re;
    this.im += c.im;
  }

  this.multiply = function(c){
    const re = this.re*c.re - this.im*c.im;
    const im = this.re*c.im + this.im*c.re;
    return new Complex(re, im);
  }
}

function ComplexDFT() {
    this.coordi = [];
    this.dftI;

    this.time = 0;
    this.path = [];
    this.iteration = 0;

    this.reset = function() {
      this.coordi = [];

      this.time = 0;
      this.path = [];
      this.iteration = 0;
    }

    this.dft = function(x){
    let X = [];
    const N = x.length;

    for(let k = 0; k < N; k++){
      let sum = new Complex(0, 0);

      for(let n = 0; n < N; n++){
        const c = new Complex(cos(TWO_PI*k*n/N), -sin(TWO_PI*k*n/N));
        sum.add(x[n].multiply(c));
      }
      sum.re = sum.re / N;
      sum.im = sum.im / N;

      let freq = k;
      let ampl = sqrt(sum.re * sum.re + sum.im * sum.im);
      let phase = atan2(sum.im, sum.re);

      X[k] = { re: sum.re, im: sum.im, freq, ampl, phase };
    }

    return X;
    }

    this.epicycles = function (re, im, rot, dftIY) {
      for(let X = 0; X < dftIY.length; X++){
         let prevre = re;
         let previm = im;

         re += dftIY[X].ampl * cos(dftIY[X].freq * this.time + dftIY[X].phase + rot);
         im += dftIY[X].ampl * sin(dftIY[X].freq * this.time + dftIY[X].phase + rot);

         if(this.iteration < this.coordi.length){
           (X > 0 ? stroke(253, 203, 46, 100) : stroke(253, 203, 46));
           noFill();
           ellipse(prevre, previm, dftIY[X].ampl*2);
           stroke(253, 203, 46);

           fill(253, 203, 46);
           line(prevre, previm, re, im);
         }
      }
      return createVector(re, im);
    }

    this.draw = function() {
      if(this.iteration < this.coordi.length+1){
        background(0);

        let vi = this.epicycles(width/2, height/2, 0, this.dftI);
        this.path.unshift(vi);

        beginShape();
        noFill();
        for(let i = 0; i < this.path.length; i++) {
          vertex(this.path[i].x, this.path[i].y);
        }
        endShape();

        const dt = TWO_PI / this.dftI.length;
        this.time -= dt;
        this.iteration++;

        return false;
      }
      return true;
    }

    this.setHeart = function() {
      this.reset();

      for(let t = 0; t < TWO_PI; t+=0.05){
        let heartre = 16*sin(t)**3;
        let heartim = 13*cos(t) - 5*cos(2*t) - 2*cos(3*t) - cos(4*t);
        const c = new Complex(-heartre*10, -heartim*10);
        this.coordi.push(c);
      }

      this.dftI = this.dft(this.coordi);
    }

    this.setHeartReverse = function() {
      this.reset();

      for(let t = 0; t < TWO_PI; t+=0.05){
        let heartre = 16*sin(t)**3;
        let heartim = 13*cos(t) - 5*cos(2*t) - 2*cos(3*t) - cos(4*t);
        const c = new Complex(-heartre*10, -heartim*10);
        this.coordi.push(c);
      }

      this.coordi.reverse();

      this.dftI = this.dft(this.coordi);
    }
}

function setup() {
  canvas = createCanvas(800, 650);

  simple = new SimpleDFT();
  complex = new ComplexDFT();

  simple.setHeartReverse();
  complex.setHeartReverse();

  isSimple = true;
  drawCount = 0;
}

function draw() {
  if(isSimple){
    if(simple.draw()){
        if(drawCount % 4 == 0){
          simple.setHeart();
        }else if(drawCount % 4 == 2){
          simple.setHeartReverse();
        }
      isSimple = false;
      drawCount++;
    }
  }else{
    if(complex.draw()){
        if(drawCount % 4 == 1){
          complex.setHeart();
        }else if(drawCount % 4 == 3){
          complex.setHeartReverse();
        }
      isSimple = true;
      drawCount++;
    }
  }
  image(img, 0, 550);
}
