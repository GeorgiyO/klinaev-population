Array.prototype.at = function (idx) {
  return this[
    idx >= 0 ? idx
             : this.length + idx
    ];
};

let input = {
  zar: document.getElementById("in_zar"),
  count: document.getElementById("in_count"),
  firstDayIll: document.getElementById("in_firstDayIll"),
  illPerDoctor: document.getElementById("in_illPerDoctor")
};
let table = document.getElementById("table");

let getInput = {...input};
Object.entries(getInput)
      .forEach(([k, v]) => getInput[k] = () => Number.parseFloat(v.value));

Object.values(input).forEach(it => it.onchange = redraw);

let currentCanvas = null;
redraw();

function draw(data) {
  if (currentCanvas != null) currentCanvas.destroy();
  currentCanvas = new Chart(
    document.getElementById("myChart"),
    {
      type: "line",
      data: prepareDrawData(data),
      options: {}
    }
  );
}

function getMatrix() {
  let fdi = getInput.firstDayIll();
  let ipd = getInput.illPerDoctor();
  let zar = getInput.zar();
  let m = {
    healthy: [1000 * getInput.count()],
    newIlls: [fdi],
    allIlls: [fdi],
    disabled: [fdi],
    doctorsCalls: [fdi],
    doctors: [Math.floor(fdi / ipd)]
  };
  console.log(zar *
              m.newIlls.at(-1) *
              m.healthy.at(-1));
  let i = 0;
  while (i++ < 100 && m.disabled.at(-1) > 0) {
    m.newIlls.push(
      Math.round(
        zar *
        m.newIlls.at(-1) *
        m.healthy.at(-1)
      )
    );
    m.healthy.push(
      m.healthy.at(-1) -
      m.newIlls.at(-1)
    );
    m.allIlls.push(
      m.allIlls.at(-1) +
      m.newIlls.at(-1)
    );
    m.disabled.push(
      m.disabled.at(-1) +
      m.newIlls.at(-1) -
      or(m.newIlls.at(-11), 0)
    );
    m.doctorsCalls.push(
      m.newIlls.at(-1) +
      or(m.newIlls.at(-11), 0)
    );
    m.doctors.push(
      Math.floor(
        m.doctorsCalls.at(-1) / ipd
      )
    );
  }
  m.days = m.disabled.map((_, i) => i + 1);
  return m;
}

function redraw() {
  let m = getMatrix();
  redrawGraph(m);
  redrawTable(m);
}

function redrawGraph(m) {
  draw({
    x: m.days,
    y: [{
      label: "Заболели сегодня",
      color: "#ff000066",
      data: m.newIlls
    }, {
      label: "Количество нетрудоспособных",
      color: "#00ff0066",
      data: m.disabled
    }, {
      label: "Число обращений к врачу",
      color: "#0000ff66",
      data: m.doctorsCalls
    }]
  });
}

function redrawTable(m) {
  table.innerHTML = "<tr></tr>";
  Object.keys(m)
        .forEach(it => {
          table.querySelector("tr")
            .innerHTML += `<th>${it}</th>`;
        });
  m.days.forEach((_, i) => {
    let tr = document.createElement("tr");
    table.appendChild(tr);
    Object.values(m)
          .forEach(it => {
            tr.innerHTML += `<td>${it.at(i)}</td>`
          });
  });
}

function prepareDrawData(data) {
  let labels = data.x;
  let datasets = data.y;
  return {
    labels,
    datasets: datasets.map(ds => {
      return {
        label: ds.label,
        backgroundColor: ds.color,
        borderColor: ds.color,
        data: ds.data
      };
    })
  };
}

function or(val, defaultVal) {
  return val === undefined ? defaultVal : val;
}