const input = document.querySelector('#file');
const fileBtn = document.querySelector('.file-button');
const parseBtn = document.querySelector('.parse-button');
const xportBtn = document.querySelector('.xport-button');
const graphBtn = document.querySelector('.graph-button');
const alertLabel = document.querySelector('.alert');


let fileName, 
    labels=[],
    data, 
    y1,
    y2,
    dataArr = [["timeStamp", "allThreads", "averageElapsed"]];

input.onchange = readFile;
parseBtn.onclick = parseData;
xportBtn.onclick = toExel;
graphBtn.onclick = drawGraph;





function readFile(e){
  
  let file = input.files[0];
  let reader = new FileReader();
  reader.readAsText(file);
  fileName = file.name.slice(0, file.name.length-4);
  reader.onload = function() {
    res = Papa.parse(reader.result);
    console.log(res);
    changeBtn(fileBtn, "done");
    showDoneImg(e.target.parentNode.querySelector('img'));
    data = res.data;
    res.data.shift();
    parseBtn.style.visibility = "visible";

  };
}

function parseData(e){
 
  const t0 = performance.now();
  changeBtn(parseBtn, "progress");
  setTimeout(function(){
    let startPoint = data[0][0];
    let res = {t:[],y1:[],u:[],y2:[],link:[]};
    data.forEach((el, i) => {
      if(i<data.length-1 && el[13] != "null"){
        res.t.push(Math.round((el[0]-startPoint)/1000));
        res.y1.push(el[12]);
        res.u.push(el[1]);
        res.y2.push(average(res.u));
        res.link.push(el[13]);
        dataArr.push([res.t[i], res.y1[i], res.y2[i]]);
      }
    }
    

    );
    console.log(res);
    labels = res.t;
    y1 = res.y1;
    y2 = res.y2;
    //--------------
    const t1 = performance.now();
    console.log(t1 - t0, 'milliseconds');
    //--------------
    changeBtn(parseBtn, "done");
    showDoneImg(e.target.querySelector('img'));
    xportBtn.style.visibility = "visible";
    graphBtn.style.visibility = "visible";
  }, 1);
  
}





function showDoneImg(i){
  i.style.visibility="visible";
}

function changeBtn(btn, status){
  switch(status){
    case("done"):{
      alertLabel.style.visibility = "hidden";
      btn.style.backgroundColor = "green";
      break;
    };
    case("progress"):{
      alertLabel.style.visibility = "visible";
      btn.style.backgroundColor = "#ffe201";
      break;
    }; 
  }
  
}

function average(nums) {
return Math.round((nums.reduce((partialSum, a) => (1*partialSum) + (1*a), 0))/(nums.length));
}


async function toExel(e){
    const XLSX = await import("https://cdn.sheetjs.com/xlsx-0.18.10/package/xlsx.mjs");

    const wb = XLSX.utils.book_new();

    const ws = XLSX.utils.aoa_to_sheet(dataArr);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, fileName +".xlsx");
    changeBtn(xportBtn, "done");
    showDoneImg(e.target.querySelector('img'));
}

function drawGraph(e){
  changeBtn(graphBtn, "progress");
  setTimeout(function(){
    const data = {
      labels: labels,
      datasets: [
          {
              label: 'Threads',
              backgroundColor: 'rgb(30, 144, 255)',
              borderColor: 'rgb(30, 144, 255)',
              data: y1,
              yAxisID: 'y',
          },{
              label: 'Average response',
              backgroundColor: 'rgb(50, 205, 50)',
              borderColor: 'rgb(50, 205, 50)',
              data: y2,
              yAxisID: 'y1',
          }
      ]
  };

  const config = {
      type: 'line',
      data: data,
      options: {
          responsive: true,
          interaction: {
          mode: 'index',
          intersect: false,
          },
          stacked: false,
          scales: {
          y: {
              type: 'linear',
              display: true,
              position: 'left',
          },
          y1: {
              type: 'linear',
              display: true,
              position: 'right',
          },
          }
      }
  };

  new Chart(document.getElementById('myChart'), config);
  changeBtn(graphBtn, "done");
  showDoneImg(e.target.querySelector('img'));
  }, 1);
}