let data = [];

function loadData() {
  let file = document.getElementById("fileInput").files[0];

  let reader = new FileReader();

  reader.onload = function(e){
    let text = e.target.result;

    data = text.split("\n")
      .map(Number)
      .filter(x => !isNaN(x));

    analyzeData();
  };

  reader.readAsText(file);
}

function mean(data){
  return data.reduce((a,b)=>a+b)/data.length;
}

function std(data){
  let m = mean(data);
  return Math.sqrt(data.map(x => (x-m)**2).reduce((a,b)=>a+b)/data.length);
}

function createHistogram(data, bins=10){

  let min = Math.min(...data);
  let max = Math.max(...data);

  let width = (max - min)/bins;

  let hist = new Array(bins).fill(0);

  data.forEach(x=>{
    let i = Math.min(Math.floor((x-min)/width), bins-1);
    hist[i]++;
  });

  let labels = [];
  for(let i=0;i<bins;i++){
    labels.push((min + i*width).toFixed(1));
  }

  return {labels, hist};
}

function normalPDF(x, m, s){
  return (1/(s*Math.sqrt(2*Math.PI))) * Math.exp(-0.5*((x-m)/s)**2);
}

let histChart;

function analyzeData(){

  let m = mean(data);
  let s = std(data);

  let histData = createHistogram(data);

  let xs = [];
  let pdfVals = [];

  let min = Math.min(...data);
  let max = Math.max(...data);

  for(let x = min; x <= max; x+=0.1){
    xs.push(x);
    pdfVals.push(normalPDF(x, m, s)*data.length*0.1); 
  }

  if(histChart) histChart.destroy();

  histChart = new Chart(document.getElementById("histChart"), {
    data: {
      labels: histData.labels,
      datasets: [
        {
          type: "bar",
          label: "Histogram",
          data: histData.hist,
          backgroundColor: "lightblue"
        },
        {
          type: "line",
          label: "Normal Fit",
          data: pdfVals,
          borderColor: "red",
          fill: false
        }
      ]
    }
  });

  interpret(m, s);
}

function interpret(mean, std){

  let text = `
  Mean = ${mean.toFixed(2)}  
  Std Dev = ${std.toFixed(2)}  

  The normal distribution appears reasonable if the histogram is symmetric.
  If the data is skewed, a different model may fit better.
  `;

  document.getElementById("analysis").innerText = text;
}