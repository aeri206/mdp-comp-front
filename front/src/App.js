import { useEffect, useState, useRef } from 'react';
import './App.css';

import { AppBar, Toolbar, Divider, Drawer, Box, Typography, CssBaseline, Button } from '@mui/material';
import { MenuItem, FormControl, Select, InputLabel } from '@mui/material';
import * as d3 from "d3";



const colorScale = d3.scaleSequential(d3.interpolatePRGn);

const showText = false; // 글자 안볼려면 이거 false로


const file_dir = './projections/' + ['example', 'iris300umaphp', 'iris300umapss'][2]

function drawBaseLine(ctx, n, cellWidth, cellHeight, idx, len_metadata){
  // draw canvas rectangle without fillingtrustworthiness
  
  ctx.font = 'bold 12px sans-serif';
  ctx.lineWidth = 0.1;
  ctx.save();

  
  for (let i = 1; i <= n; i++){
    
    const colors = ['red', 'blue', 'green', 'orange']
    const file_idx = idx[i-1];
    // ctx.fillText(file_idx, i * cellWidth, cellHeight/2);
    // const metadata = require(`${file_dir}/${file_idx}/metadata.json`);
    const weight_info = [1] *
    
    // 수정
    ctx.clearRect(i * cellWidth, 0, cellWidth, weight_info.length * cellHeight);
    
    
    weight_info.forEach((v, idx) => {
      ctx.globalAlpha = v;
      ctx.fillStyle = colors[idx]
      ctx.fillRect(i * cellWidth, cellHeight * idx, cellWidth, cellHeight);
    })
    ctx.globalAlpha = 1.0;

    // ctx.fillStyle = 'black';
  }
  ctx.lineWidth = 1;
  ctx.strokeRect(cellWidth, 0, cellWidth*n, cellHeight * len_metadata );
  ctx.restore();
  
  
  // draw text
  
}

function App(props) {


  function drawMetric (x, y, width, height, value, scalevalue){
    // draw canvas rectangle without filling
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 0.1;
    ctx.strokeRect(x, y, width, height);
    // draw text
    // ctx.fillRect(x+width/2, y+height/2, width/2, height/2);
  
    const rgb = colorScale(scalevalue.toString());
  
    const hex = rgb.match(/\d+/g).map(v => {let hex = parseInt(v).toString(16); return hex.length === 1? "0"+hex:hex}).join('');
    ctx.fillStyle = `#${hex}`;
  
    
    ctx.fillRect(x, y, width, height);
    
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'hanging';
    // round up number
    if (showText){
      ctx.fillText(Math.round(value* 1000) / 1000, x, y, width);
      ctx.fillText(Math.round(scalevalue* 1000) / 1000, x, y+12, width);

    }
    
    // 
  
  }

  const reorder = require('reorder.js')

  const canvasRef = useRef(null);

  const [metricType, setMetricType] = useState('trustworthiness');

  const [sortIdx, setSortIdx] = useState(0);
  const [upperShowIdx, setUpperShowIdx] = useState(1);
  const [lowerShowIdx, setLowerShowIdx] = useState(1);

  const [ifReordering, setIfReordering] = useState(false);
  const [directedGraph, setDirectedGraph] = useState(false);
  const [reorderMetric, setReorderMetric] = useState(0);

  const handleMetricTypeChange = event => setMetricType(event.target.value);

  const handleSortIdxChange = (event) => setSortIdx(event.target.value);
  const handleUpperChange = (event) => setUpperShowIdx(event.target.value);
  const handleLowerChange = (event) => setLowerShowIdx(event.target.value);

  const handleReorderClick = () => setIfReordering(!ifReordering);
  const handleReoderMetricChange = event =>  setReorderMetric(event.target.value);
  const handleDirectedClick = () => {
    if (!directedGraph && (reorderMetric === 3)){
      setReorderMetric(0);
    }
    setDirectedGraph(!directedGraph);}

  // use canvas stroke color from d3 color scale
  

    // var perm = reorder.permutation()(mat);
    // var permuted_mat = reorder.stablepermute(mat, perm);
    // console.log(perm, permuted_mat)

  const { n, width, height } = props;
  // make matrix cells using html canvas

  
  const metric_result = require(`${file_dir}/${metricType}.json`)
  console.log('require')
  
  let metric_result_map = metric_result.map((val, idx) => Object.values(val[idx]).flat()).map((v, i) => [v, i]);

  const metadata_sample = require(`${file_dir}/0/metadata.json`);
  const metadata_type = Object.keys(metadata_sample)[0] // hyperparameter or weight_info
  const metadata_value = metadata_sample[metadata_type] // sample type
  const len_metadata = Object.keys(metadata_value).length
  console.log(metadata_sample, len_metadata)

  const cellWidth = Math.floor(width / (n+1));
  const cellHeight = Math.floor(height / (n+1));
  
    useEffect(() => {
      
      if(!canvasRef.current) {
        return};

      let ctx = canvasRef.current.getContext('2d');
      
      let ifAscending = false // ascending or descending
      
      
      let upper_show = metric_result.map((val) => val.map(v => (upperShowIdx > 0)? v[`classwise_${metricType}`][upperShowIdx-1] : v[metricType]))
      const silhouette_idx = metric_result_map.sort((a, b) => ifAscending? a[0][sortIdx] - b[0][sortIdx] : b[0][sortIdx] - a[0][sortIdx]).map(v => v[1]); 
      
      let upper_triangular = silhouette_idx.reduce((acc, curr, idx) => acc.concat(silhouette_idx.slice(idx+1).map(j => upper_show[curr][j]).flat()), [])
      

      
      let upperMax = d3.max(upper_triangular) + d3.min(upper_triangular) > 0 ? d3.max(upper_triangular) : -d3.min(upper_triangular)
      let upperScale = d3.scaleLinear()
        .domain([-upperMax, upperMax])
        .range([0, 1]);

      if (metricType !== 'silhouette'){
        upperScale = d3.scaleLinear()
        .domain([d3.min(upper_triangular), d3.max(upper_triangular)])
        .range([0, 1]);
      }


      for (let i = 0; i < n; i++) { // i 행
        for (let j = i+1; j < n; j++) { // j 열
          let value = upper_show[silhouette_idx[i]][silhouette_idx[j]];
          console.log(value, upperScale(value))
          drawMetric((j+1) * cellWidth, (i+len_metadata) * cellHeight, cellWidth, cellHeight, value, upperScale(value));
        }
      }
      
      const silhouette_to_hd = upper_show.reduce((acc, curr, idx) => acc.concat(curr[idx]), []);
      
      const diagonalScale = d3.scaleLinear()
        .domain([d3.min(silhouette_to_hd), d3.max(silhouette_to_hd)])
        .range([0, 1]);
        
      
        ctx.save();
        ctx.lineWidth = 1;
        for (let i = 0 ; i < n ; i++){
        let value = upper_show[silhouette_idx[i]][silhouette_idx[i]];
        drawMetric((i+1) * cellWidth, (i+len_metadata) * cellHeight, cellWidth, cellHeight, value, diagonalScale(value));
        
        ctx.strokeRect((i+1) * cellWidth, (i+len_metadata) * cellHeight, cellWidth, cellHeight);
      }
      ctx.restore();

      let lower_show = metric_result.map((val) => val.map(v => (lowerShowIdx > 0)? v[`classwise_${metricType}`][lowerShowIdx-1] : v[metricType]))
      let lower_triangular = silhouette_idx.reduce((acc, curr, idx) => acc.concat(silhouette_idx.slice(idx+1).map(j => lower_show[curr][j]).flat()), [])
      let lowerMax = d3.max(lower_triangular) + d3.min(lower_triangular) > 0 ? d3.max(lower_triangular) : -d3.min(lower_triangular)
      
      let lowerScale = d3.scaleLinear()
        .domain([-lowerMax, lowerMax])
        .range([0, 1]);

        if (metricType !== 'silhouette'){
          lowerScale = d3.scaleLinear()
          .domain([d3.min(lower_triangular), d3.max(upper_triangular)])
          .range([0, 1]);
        }

    for (let j = 0; j < n ; j++){ // j 열
      for (let i = j+1; i < n; i++){ // i 행
        let value = lower_show[silhouette_idx[i]][silhouette_idx[j]];
        drawMetric((j+1) * cellWidth, (i+len_metadata) * cellHeight, cellWidth, cellHeight, value, lowerScale(value));
      }
    }

    

    let orders = ({graph, nodes}) => {
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
    none: () => d3.range(n),
    name: () =>
      d3.range(n).sort((a, b) => d3.ascending(nodes[a].id, nodes[b].id)),
//    count: () => d3.range(n).sort((a, b) => nodes[b].count - nodes[a].count),
    cluster: () =>
      d3
        .range(n)
        .sort(
          (a, b) =>
            d3.ascending(nodes[a].cluster, nodes[b].cluster) ||
            d3.ascending(nodes[a].name, nodes[b].name)
        ),
    leafOrder: computeLeaforder,
    leafOrderDist: computeLeaforderDist,
    barycenter: computeBarycenter,
    rcm: computeRCM,
    spectral: computeSpectral
  };

  return orders;
}
  

    
    if (ifReordering) {
      
      let reorder_show = metric_result.map((val) => val.map(v => (upperShowIdx > 0)? v[`classwise_${metricType}`][upperShowIdx-1] : v[metricType]))
      if (metricType === 'silhouette'){
        reorder_show.forEach((val, idx) => {val[idx] = 0})
      }
      
      let reorder_graph = reorder.mat2graph(reorder_show, directedGraph);
      let nodes = reorder_graph.nodes();
      const permutations = orders({graph: reorder_graph, nodes})
      
    
      let order_idx = [permutations['leafOrderDist'](), permutations['barycenter'](), permutations['rcm']()]
      if (!directedGraph){
        order_idx.push(permutations['spectral']())
      }
      let reordered_idx = order_idx[reorderMetric];

      upper_triangular = reordered_idx.reduce((acc, curr, idx) => acc.concat(reordered_idx.slice(idx+1).map(j => reorder_show[curr][j]).flat()), [])
      if (metricType === 'silhouette'){
        upperMax = d3.max(upper_triangular) + d3.min(upper_triangular) > 0 ? d3.max(upper_triangular) : -d3.min(upper_triangular)
        upperScale = d3.scaleLinear()
        .domain([-upperMax, upperMax])
        .range([0, 1]);
      } else {
        upperScale = d3.scaleLinear()
        .domain([d3.min(upper_triangular), d3.max(upper_triangular)])
        .range([0, 1]);
      }
      console.log(upperScale)

      console.log(d3.max(reorder_show.flat()), d3.min(reorder_show.flat()))

      drawBaseLine(ctx, n, cellWidth, cellHeight, reordered_idx, len_metadata)
    for (let i = 0 ; i < n ; i++){
      for (let j = 0; j < n; j++){
        let value = reorder_show[reordered_idx[i]][reordered_idx[j]];
        drawMetric((j+1) * cellWidth, (i+len_metadata) * cellHeight, cellWidth, cellHeight, value, upperScale(value));
      }
      let value = reorder_show[reordered_idx[i]][reordered_idx[i]];
      drawMetric((i+1) * cellWidth, (i+len_metadata) * cellHeight, cellWidth, cellHeight, value, diagonalScale(value));
      // ctx.lineWidth = 1.0;
      ctx.strokeRect((i+1) * cellWidth, (i+len_metadata) * cellHeight, cellWidth, cellHeight);
    }
  }
  else {
    drawBaseLine(ctx, n, cellWidth, cellHeight, silhouette_idx, len_metadata);
  }

  }, [sortIdx, upperShowIdx, lowerShowIdx, metric_result, metric_result_map, n, width, height, cellWidth, cellHeight]);

  const drawerWidth = 240;

  
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
        <Box sx={{ minWidth: 80 }}>
          <FormControl fullWidth sx={{mt: 2}}>
              <InputLabel id="demo-simple-select-label">metric type</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={metricType}
                label="MetricType"
                onChange={handleMetricTypeChange}
              >
                <MenuItem value={'silhouette'}>silhouette</MenuItem>
                <MenuItem value={'trustworthiness'}>trustworthiness</MenuItem>
                <MenuItem value={'continuity'}>continuity</MenuItem>
              </Select>
            </FormControl>
          <Divider />
          <FormControl fullWidth sx={{mt: 2}}>
            <InputLabel id="demo-simple-select-label">order by</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={sortIdx}
              label="OrderBy"
              onChange={handleSortIdxChange}
              disabled={ifReordering}
            >
              <MenuItem value={0}>whole</MenuItem>
              <MenuItem value={1}>class 1</MenuItem>
              <MenuItem value={2}>class 2</MenuItem>
              <MenuItem value={3}>class 3</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{mt: 2}}>
            <InputLabel id="demo-simple-select-label">upper matrix value</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={upperShowIdx}
              label="UpperMatrixValue"
              onChange={handleUpperChange}
            >
              <MenuItem value={0}>whole</MenuItem>
              <MenuItem value={1}>class 1</MenuItem>
              <MenuItem value={2}>class 2</MenuItem>
              <MenuItem value={3}>class 3</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{mt: 2}}>
            <InputLabel id="demo-simple-select-label">lower matrix value</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={lowerShowIdx}
              label="UpperMatrixValue"
              onChange={handleLowerChange}
              disabled={ifReordering}
            >
              <MenuItem value={0}>whole</MenuItem>
              <MenuItem value={1}>class 1</MenuItem>
              <MenuItem value={2}>class 2</MenuItem>
              <MenuItem value={3}>class 3</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Divider />
        <Button sx={{mt: 2}} variant="outlined" onClick={handleReorderClick}>{ifReordering? 'back': 'Reordering'}</Button>
        <FormControl fullWidth sx={{mt: 2}}>
            <InputLabel id="demo-simple-select-label">reorder by</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={reorderMetric}
              label="reorderBy"
              onChange={handleReoderMetricChange}
              disabled={!ifReordering}
            >
              <MenuItem value={0}>leaforderdistance</MenuItem>
              <MenuItem value={1}>barycenter</MenuItem>
              <MenuItem value={2}>rcm</MenuItem>
              <MenuItem value={3} disabled={directedGraph}>spectral</MenuItem>
            </Select>
          </FormControl>
          <Button sx={{mt: 2}} variant="outlined" onClick={handleDirectedClick} disabled={!ifReordering}>{directedGraph? 'undirected': 'directed'}</Button>

        
    </Drawer>
        <Box>
          <canvas
            ref={canvasRef}
            id="canvas" width={width} height={height} style={{ paddingTop:'64px'}} />
        </Box>
      </Box>
    </div>
  );
}


export default App;
