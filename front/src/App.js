import { useEffect, useState, useRef } from 'react';
import './App.css';

import { AppBar, Toolbar, Divider, Drawer, Box, Typography, CssBaseline, FormGroup, FormControlLabel, Switch, colors, Slider } from '@mui/material';
import { MenuItem, FormControl, Select, InputLabel } from '@mui/material';
import * as d3 from "d3";


const colorScale = d3.scaleSequential(d3.interpolatePRGn);

const showText = false; // 글자 안볼려면 이거 false로

const projections_folder = ['example', 'iris100umaphp', 'iris200umaphp', 'iris200umapss'];
// const projections_folder = ['example', 'iris100umaphp'];

const klValue = ['0.01', '0.03', '0.06', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0'];


function drawBaseLine(canvas, n, cellWidth, cellHeight, orderIdx, metaData){
  let ctx = canvas.getContext('2d');
  ctx.font = 'bold 12px sans-serif';
  ctx.globalAlpha = 1.0;
  ctx.lineWidth = 1.0;
  ctx.save();

  ctx.clearRect(cellWidth, 0, cellWidth * n, cellHeight * metaData.cnt);
  
  const colors = ['red', 'blue', 'green', 'orange'];

  if (metaData.type === 'hyperparameter'){
    const scalars = {};
    Object.entries(metaData.range).forEach(hp => {
      scalars[hp[0]] = d3.scaleLinear().domain(hp[1]).range([0, 1]);
    });
    Object.keys(metaData.range).forEach((key, hp_idx) => {
      for (let i = 0 ; i < n ; i++){
        const fileIdx = orderIdx[i];
        const hp = metaData.value[fileIdx][key];
        ctx.fillStyle = colors[hp_idx];
        ctx.globalAlpha = scalars[key](hp);
        ctx.fillRect((i+1) * cellWidth, cellHeight * hp_idx, cellWidth, cellHeight);
      }
    });
  } else if (metaData.type === 'attr_weight'){
    const scalars = metaData.range.map(r => d3.scaleLinear().domain(r).range([0, 1]));
    for (let i = 0 ; i < n ; i++){
      const fileIdx = orderIdx[i];
      const weight = metaData.value[fileIdx];
      weight.forEach((w, w_idx) => {
        ctx.fillStyle = colors[w_idx];
        ctx.globalAlpha = scalars[w_idx](w);
        ctx.fillRect((i+1) * cellWidth, cellHeight * w_idx, cellWidth, cellHeight);
      });
    }
  }
  ctx.restore();
  ctx.strokeRect(cellWidth, 0, cellWidth * n, cellHeight * metaData.cnt);


}

function drawMetric(canvas, n, cellWidth, cellHeight, orderIdx, showValue, metaDataLen, percentage){
  console.log('drawMetric')
  /* 
  1. range (diagonal, non-diagonal)
  2. drawing
  */
  let ctx = canvas.getContext('2d');
  ctx.lineWidth = 3.0;
  ctx.save();
  // 1. calculate diagonal range
  const diagonalValue = showValue.reduce((acc, curr, idx) => acc.concat(curr[idx]), []);
  const nonDiagonalValue = showValue.reduce((acc, curr, idx) => acc.concat(curr.filter((v, i) => i !== idx)), []);
  
  const diagonalRange = d3.scaleLinear()
    // .domain([d3.quantile(diagonalValue, 1-percentage), d3.quantile(diagonalValue, percentage)])
    .domain(d3.extent(diagonalValue))
    .range([0, 1]);

  const nonDiagonalRange = d3.scaleLinear()
  .domain([d3.quantile(nonDiagonalValue, 1-percentage), d3.quantile(nonDiagonalValue, percentage)])
    .range([0, 1]);

    for (let i = 0 ; i < n ; i++){
      for (let j = 0; j < n; j++){
        let value = showValue[orderIdx[i]][orderIdx[j]];
        const rgb = colorScale(nonDiagonalRange(value));
        const hex = rgb.match(/\d+/g).map(v => {let hex = parseInt(v).toString(16); return hex.length === 1? "0"+hex:hex}).join('');
        ctx.fillStyle = `#${hex}`;
        ctx.fillRect((j+1)* cellWidth, (i+metaDataLen) * cellHeight, cellWidth, cellHeight);
      };
      let value = showValue[orderIdx[i]][orderIdx[i]];
      const rgb = colorScale(diagonalRange(value));
      const hex = rgb.match(/\d+/g).map(v => {let hex = parseInt(v).toString(16); return hex.length === 1? "0"+hex:hex}).join('');
      ctx.fillStyle = `#${hex}`;
      ctx.fillRect((i+1)* cellWidth, (i+metaDataLen) * cellHeight, cellWidth, cellHeight);
      ctx.strokeRect((i+1)* cellWidth, (i+metaDataLen) * cellHeight, cellWidth, cellHeight);
  };
  ctx.restore();
}

function loadMetaData(file_dir, n){
  const metadata_sample = require(`${file_dir}/0/metadata.json`);
  const metadata_type = Object.keys(metadata_sample)[0] // hyperparameter or weight_info
  const metadata_value = metadata_sample[metadata_type] // sample type
  const len_metadata = Object.keys(metadata_value).length;

  let metadata = metadata_type === 'attr_weight'? 
  ({
    value: Array.from({length: n}, (v, i) => {
      let metadata = require(`${file_dir}/${i}/metadata.json`);
      return metadata.attr_weight}),
    range: Array.from({length: len_metadata}, () => [0, 1])
  }):({
    value: Array.from({length: n}, (v, i) => {
      let metadata = require(`${file_dir}/${i}/metadata.json`);
      return metadata.hyperparameter
    }), range: {}});
    metadata['type'] = metadata_type;
    metadata['cnt'] = len_metadata;

if (metadata_type === 'hyperparameter'){
  Object.keys(metadata_value).forEach(k => {
    let arr = metadata.value.map(v => v[k])
    metadata.range[k] = [d3.min(arr), d3.max(arr)];
  })
};
return metadata;
}

const reorder = require('reorder.js');

const orders = ({graph, nodes}) => {
  const n = nodes.length;
  const matrix = Array.from(nodes, (_, i) => d3.range(n).map(j => ({ x: j, y: i, z: 0 })));
  const index = nodes.map((d, i) => ("id" in d ? d.id : i));
  const l = [];

  const adjacency = matrix.map(row => row.map(c => c.z));


  let dist_adjacency;

const leafOrder = reorder.optimal_leaf_order();
//.distance(science.stats.distance.manhattan);

function computeLeaforder() {
const order = leafOrder(adjacency);
order.forEach((lo, i) => (nodes[i].leafOrder = lo));
return nodes.map(n => n.leafOrder);
}

function computeLeaforderDist() {
if (!dist_adjacency) dist_adjacency = reorder.graph2valuemats(graph);
const order = reorder.valuemats_reorder(dist_adjacency, leafOrder);
order.forEach((lo, i) => (nodes[i].leafOrderDist = lo));
return nodes.map(n => n.leafOrderDist);
}

function computeBarycenter() {
const barycenter = reorder.barycenter_order(graph);
const improved = reorder.adjacent_exchange(graph, ...barycenter);
improved[0].forEach((lo, i) => (nodes[i].barycenter = lo));
return nodes.map(n => n.barycenter);
}

function computeRCM() {
const rcm = reorder.reverse_cuthill_mckee_order(graph);
rcm.forEach((lo, i) => (nodes[i].rcm = lo));
return nodes.map(n => n.rcm);
}

function computeSpectral() {
const spectral = reorder.spectral_order(graph);
spectral.forEach((lo, i) => (nodes[i].spectral = lo));
return nodes.map(n => n.spectral);
}

const orders = {
// none: () => d3.range(n),
// name: () =>
//   d3.range(n).sort((a, b) => d3.ascending(nodes[a].id, nodes[b].id)),
//    count: () => d3.range(n).sort((a, b) => nodes[b].count - nodes[a].count),
// cluster: () =>
//   d3
//     .range(n)
//     .sort(
//       (a, b) =>
//         d3.ascending(nodes[a].cluster, nodes[b].cluster) ||
//         d3.ascending(nodes[a].name, nodes[b].name)
//     ),
leafOrder: computeLeaforder,
leafOrderDist: computeLeaforderDist,
barycenter: computeBarycenter,
rcm: computeRCM,
spectral: computeSpectral
};

return orders;
}

let n, cellWidth, cellHeight;

function App(props) {

  const [percentageTMP, setPercentageTMP] = useState(1.0);
  const [percentage, setPercentage] = useState(percentageTMP);
  
  const canvasRef = useRef(null);
  const metadataRef = useRef({});
  const orderIdxRef = useRef([]);
  const sortValueRef = useRef({
    all: [],
    filter: []
  });
  const PermRef = useRef({});
  const showValueRef = useRef({
    all: [],
    filter: []
  });
  
  const [sortMetric, setSortMetric] = useState('silhouette');
  const [sortClass, setSortClass] = useState(0);
  const [sortGlobal, setSortGlobal] = useState('rmse');
  const [sortKL, setSortKL] = useState("0.01");

  const handleSortMetricChange = e => {setSortMetric(e.target.value)};
  const handleSortClassChange = e => {setSortClass(e.target.value)};
  const handleSortGlobalChange = e => {setSortGlobal(e.target.value)};
  const handleSortKLChange = e => {setSortKL(e.target.value)};

  // const [sortAsc, setSortAsc] = useState(true); // 오름차순 정렬


  const [ifReorder, setIfReorder] = useState(false);
  const [reorderMethod, setReorderMethod] = useState('leafOrderDist');
  const [reorderDirectedGraph, setReorderDirectGraph] = useState(false);

  const handleReorderMethodChange = e => {setReorderMethod(e.target.value)};
  const handleReorderDirectedGraphChange = e => {
    if (!reorderDirectedGraph && reorderMethod === 'spectral'){
      setReorderMethod('spectral');
    }
    setReorderDirectGraph(e.target.checked);
  };

  const [showMetric, setShowMetric] = useState('continuity');
  const [showClass, setShowClass] = useState(0);
  const [showGlobal, setShowGlobal] = useState('rmse');
  const [showKL, setShowKL] = useState("0.01");

  const handleShowMetricChange = e => {setShowMetric(e.target.value)};
  const handleShowClassChange = e => {setShowClass(e.target.value)};
  const handleShowGlobalChange = e => {setShowGlobal(e.target.value)};
  const handleShowKLChange = e => {setShowKL(e.target.value)};

  const [projections, setProjections] = useState(projections_folder[0]);
  const handleProjectionsChange = e => {setProjections(e.target.value)};

  const { width, height } = props; // props
  
  
  const drawerWidth = 240;

  useEffect(() => {
    // load, update => set file length check
    sortValueRef.current.all = require(`./projections/${projections}/${sortMetric}.json`);
    n = sortValueRef.current.all.length;
    cellWidth = Math.floor(width / (n+1));
    cellHeight = Math.floor(height / (n+1));
    // metric 불러와서 처음부터 로드
  }, [height, projections, sortMetric, width]);

  useEffect(() => {
    // load => metadata check
    canvasRef.current.getContext('2d').clearRect(0, 0, width, height);
    metadataRef.current = loadMetaData('./projections/' + projections, n);
  }, [projections]);


  useEffect(() => {
    if (sortMetric === 'global'){ // sortGlobal
      sortValueRef.current.filter = sortValueRef.current.all.map((val) => val.map(v => v[sortGlobal]));
    } else if (sortMetric === 'kl'){ // sortKL
      sortValueRef.current.filter = sortValueRef.current.all.map((val) => val.map(v => v[sortKL]));
    } else { // sortClass
      sortValueRef.current.filter = sortValueRef.current.all.map((val) => val.map(v => 
        (sortClass > 0)? v[`classwise_${sortMetric}`][sortClass-1] : v[sortMetric]));
    }
  }, [projections, sortMetric, sortGlobal, sortClass, sortKL, ifReorder]);

  useEffect(() => {
    // compute graph for reorder
    if (ifReorder){
    let value4Reorder = sortValueRef.current.filter;
    if (sortMetric === 'silhouette'){
      value4Reorder.forEach((val, idx) => {val[idx] = 0});
    }
    const graph = reorder.mat2graph(value4Reorder, reorderDirectedGraph);
    let nodes = graph.nodes();
    PermRef.current = orders({graph: graph, nodes});
    orderIdxRef.current = PermRef.current[reorderMethod]();
  } else {
    orderIdxRef.current = sortValueRef.current.filter.map((val, idx) => val[idx]).map((v, i) => [i, v])
        .sort((a, b) => a[1] - b[1]).map(v => v[0]);
      }
    // drawBaseLine(ctx, n, cellWidth, cellHeight, orderIdxRef.current,)
    let ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, ctx.width, ctx.height);
    drawBaseLine(canvasRef.current, n, cellWidth, cellHeight, orderIdxRef.current, metadataRef.current);
  }, [projections, sortClass, sortGlobal, sortKL, sortMetric, ifReorder, reorderDirectedGraph, reorderMethod]);

  useEffect(() => {
    console.log(showMetric);
    showValueRef.current.all = require(`./projections/${projections}/${showMetric}.json`);
    // 보여질값 새로 가져옴
  }, [projections, showMetric]);
  useEffect(() => {
    if (showMetric === 'global'){ // showGlobal
      showValueRef.current.filter = showValueRef.current.all.map((val) => val.map(v =>v[showGlobal]));
    } else if (showMetric === 'kl'){ // sortKL
      showValueRef.current.filter = showValueRef.current.all.map((val) => val.map(v => v[showKL]));
    } else { // showClass
      showValueRef.current.filter = showValueRef.current.all.map((val) => val.map(v =>
        (showClass > 0)? v[`classwise_${showMetric}`][showClass-1] : v[showMetric]));
      }
    }, [projections, showMetric, showClass, showGlobal, showKL]);

   useEffect(() => {
     // drawRect
     drawMetric(canvasRef.current, n, cellWidth, cellHeight, orderIdxRef.current, showValueRef.current.filter, metadataRef.current.cnt, percentage);
  }, [
    projections, sortClass, sortGlobal, sortMetric, sortKL,
    ifReorder, reorderDirectedGraph, reorderMethod,
    showMetric, showClass, showGlobal, showKL, percentage]);

  return (
    <div className="App">
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Title
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <Toolbar />
          <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="demo-simple-select-label">Projection Folder</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={projections}
                label="projection folder"
                onChange={handleProjectionsChange}
              >
                {projections_folder.map(p => (
                  <MenuItem
                    key={p}
                    value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          <Divider sx={{mt: 1, mb: 2}}/>
          <Typography variant="h7" noWrap> ORDERING </Typography>
          <Box sx={{ minWidth: 80, ml: 1 }}>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="demo-simple-select-label">Metric Type</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={sortMetric}
                label="metric for sorting"
                onChange={handleSortMetricChange}
              >
                <MenuItem value={'silhouette'}>silhouette</MenuItem>
                <MenuItem value={'trustworthiness'}>trustworthiness</MenuItem>
                <MenuItem value={'continuity'}>continuity</MenuItem>
                <MenuItem value={'global'}>global</MenuItem>
                <MenuItem value={'kl'}>KL</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ ml: 2 }}>
              <FormControl fullWidth sx={{ mt: 2, display: ((sortMetric === 'global' || sortMetric === 'kl') ? 'none' : '') }}>
                <InputLabel id="demo-simple-select-label">Class for Sorting</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={sortClass}
                  label="Class for Sorting"
                  onChange={handleSortClassChange}
                  disabled={sortMetric === 'global'}
                >
                  <MenuItem value={0}>whole</MenuItem>
                  <MenuItem value={1}>Class 1</MenuItem>
                  <MenuItem value={2}>Class 2</MenuItem>
                  <MenuItem value={3}>Class 3</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mt: 2, display: (sortMetric !== 'global' ? 'none' : '') }}>
                <InputLabel id="demo-simple-select-label">Global Metric for Sorting</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={sortGlobal}
                  label="Global Metric for Sorting"
                  onChange={handleSortGlobalChange}
                  disabled={sortMetric !== 'global'}
                >
                  <MenuItem value={'rmse'}>rmse</MenuItem>
                  <MenuItem value={'kruskal_stress'}>kruskal_stress</MenuItem>
                  <MenuItem value={'sammon_stress'}>sammon_stress</MenuItem>
                  <MenuItem value={'dtm'}>dtm</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mt: 2, display: (sortMetric !== 'kl' ? 'none' : '') }}>
                <InputLabel id="demo-simple-select-label">KL value for Sorting</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={sortKL}
                  label="KL value for Sorting"
                  onChange={handleSortKLChange}
                  disabled={sortMetric !== 'kl'}
                >{
                  klValue.map((v, i) => (
                    <MenuItem
                      key={v}
                      value={v}
                    > {v}
                    </MenuItem>
                  ))
                }
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Divider sx={{ mt: 2, mb: 2 }} />
          <Typography variant="h7" noWrap> REORDERING </Typography>
          <Box sx={{ minWidth: 80, ml: 1 }}>
            <FormGroup sx={{ml: 3, mr: 3}}>
              <FormControlLabel control={
                <Switch
                  checked={ifReorder}
                  onChange={() => setIfReorder(!ifReorder)}
                  name="Reordering"
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              } label="Reordering" />
              <FormControlLabel
                disabled={!ifReorder}
                control={
                  <Switch
                    checked={reorderDirectedGraph}
                    onChange={handleReorderDirectedGraphChange}
                    name="directed graph"
                    inputProps={{ 'aria-label': 'controlled' }}
                  />}
                label="Directed Graph" />
            </FormGroup>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="demo-simple-select-label">Reorder Method</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={reorderMethod}
                label="Reorder Method"
                onChange={handleReorderMethodChange}
                disabled={!ifReorder}
              >
                <MenuItem value={'leafOrderDist'}>leafOrderDist</MenuItem>
                <MenuItem value={'leafOrder'}>leafOrder</MenuItem>
                <MenuItem value={'barycenter'}>barycenter</MenuItem>
                <MenuItem value={'rcm'}>rcm</MenuItem>
                <MenuItem value={'spectral'} disabled={reorderDirectedGraph}>spectral</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Divider sx={{ mt: 2, mb: 2 }} />
          <Typography variant="h7" noWrap> SHOW </Typography>
          <Box sx={{ minWidth: 80, ml: 1 }}>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="demo-simple-select-label">Metric Type</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={showMetric}
                label="metric for sorting"
                onChange={handleShowMetricChange}
              >
                <MenuItem value={'silhouette'}>silhouette</MenuItem>
                <MenuItem value={'trustworthiness'}>trustworthiness</MenuItem>
                <MenuItem value={'continuity'}>continuity</MenuItem>
                <MenuItem value={'global'}>global</MenuItem>
                <MenuItem value={'kl'}>kl</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ ml: 2 }}>
              <FormControl fullWidth sx={{ mt: 2, display: ((showMetric === 'global' || showMetric === 'kl') ? 'none' : '') }}>
                <InputLabel id="demo-simple-select-label">Class</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={showClass}
                  label="Class for Sorting"
                  onChange={handleShowClassChange}
                  disabled={showMetric === 'global'}
                >
                  <MenuItem value={0}>whole</MenuItem>
                  <MenuItem value={1}>Class 1</MenuItem>
                  <MenuItem value={2}>Class 2</MenuItem>
                  <MenuItem value={3}>Class 3</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mt: 2, display: (showMetric !== 'global' ? 'none' : '') }}>
                <InputLabel id="demo-simple-select-label">Global Metric</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={showGlobal}
                  label="Global Metric for Sorting"
                  onChange={handleShowGlobalChange}
                  disabled={showMetric !== 'global'}
                >
                  <MenuItem value={'rmse'}>rmse</MenuItem>
                  <MenuItem value={'kruskal_stress'}>kruskal_stress</MenuItem>
                  <MenuItem value={'sammon_stress'}>sammon_stress</MenuItem>
                  <MenuItem value={'dtm'}>dtm</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mt: 2, display: (showMetric !== 'kl' ? 'none' : '') }}>
                <InputLabel id="demo-simple-select-label">KL value</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={showKL}
                  label="Global Metric for Sorting"
                  onChange={handleShowKLChange}
                  disabled={showMetric !== 'kl'}
                >
                  {
                    klValue.map((v, i) => (
                      <MenuItem
                        key={v}
                        value={v}
                      > {v}
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Box  sx={{ml: 2, mr: 2}}>
            <Slider aria-label="Volumne" value={percentageTMP}
            onChange={(event) => {setPercentageTMP(event.target.value)}}
            onChangeCommitted={() => {setPercentage(percentageTMP)}}
            min={0.7} max={1.0} step={0.01}
            valueLabelDisplay="on"
            />
           </Box>
    </Drawer>
    <Box>
        <canvas
          ref={canvasRef}
          id="canvas" width={width} height={height} style={{ paddingTop: '64px' }} />
      </Box>
      </Box>
    </div>
  );
}


export default App;
