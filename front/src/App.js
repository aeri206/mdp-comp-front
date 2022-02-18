import { useEffect, useState, useRef } from 'react';
import './App.css';

import { AppBar, Toolbar, Divider, Drawer, Box, Typography, CssBaseline } from '@mui/material';
import { List,  MenuItem, FormControl, Select, InputLabel } from '@mui/material';
import * as d3 from "d3";
import { ConstructionOutlined } from '@mui/icons-material';


const colorScale = d3.scaleSequential(d3.interpolatePRGn);



function drawBaseLine(ctx, n, width, height,cellWidth, cellHeight, idx){
  // draw canvas rectangle without filling
  ctx.lineWidth = 0.1;
  ctx.font = 'bold 12px sans-serif';

  for (let i = 1; i <= n; i++){
    
    const colors = ['red', 'blue', 'green', 'orange']
    const file_idx = idx[i-1];
    // ctx.fillText(file_idx, i * cellWidth, cellHeight/2);
    const weight_info = require(`./example/${file_idx}/metadata.json`).attr_weight
    // console.log(i, file_idx, weight_info)
    weight_info.forEach((v, idx) => {
      ctx.fillStyle = colors[idx]
      let barLength = cellWidth * v;
      let barHeight = cellHeight / weight_info.length;
      ctx.fillRect(i * cellWidth, barHeight * idx, barLength, barHeight);
    })

    // ctx.fillStyle = 'black';
    
    // ctx.strokeRect(0, i * cellHeight, cellWidth, cellHeight);
  }
  
  // draw text
  
}

function App(props) {


  function drawMetric (x, y, width, height, value, scalevalue){
    // draw canvas rectangle without filling
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeRect(x, y, width, height);
    // draw text
    // ctx.fillRect(x+width/2, y+height/2, width/2, height/2);
  
    const rgb = colorScale(scalevalue.toString());
  
    const hex = rgb.match(/\d+/g).map(v => {let hex = parseInt(v).toString(16); return hex.length == 1? "0"+hex:hex}).join('');
    ctx.fillStyle = `#${hex}`;
  
    
    // ctx.fillStyle = colorScale(metric);
    // ctx.fillRect(x, y, width/2, height/2);
    
    ctx.fillRect(x, y, width, height);
    
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'hanging';
    // round up number
    ctx.fillText(Math.round(value* 1000) / 1000, x, y, width);
    ctx.fillText(Math.round(scalevalue* 1000) / 1000, x, y+12, width);
  
  }

  const reorder = require('reorder.js')
  console.log(reorder)

  const canvasRef = useRef(null);

  const [sortIdx, setSortIdx] = useState(0);
  const [upperShowIdx, setUpperShowIdx] = useState(2);
  const [lowerShowIdx, setLowerShowIdx] = useState(3);

  const handleSortIdxChange = (event) => setSortIdx(event.target.value);
  const handleUpperChange = (event) => setUpperShowIdx(event.target.value);
  const handleLowerChange = (event) => setLowerShowIdx(event.target.value);


  // use canvas stroke color from d3 color scale
  

    // var perm = reorder.permutation()(mat);
    // var permuted_mat = reorder.stablepermute(mat, perm);
    // console.log(perm, permuted_mat)

  const { n, width, height } = props;
  // make matrix cells using html canvas

  
  const silhouette = require("./example/silhouette.json")
  let silhouette_map = silhouette.map((val, idx) => Object.values(val[idx]).flat()).map((v, i) => [v, i]);

  let cellWidth, cellHeight;

  
  
  useEffect(() => {
    cellWidth = Math.floor(width / (n+1));
    cellHeight = Math.floor(height / (n+1));
  }, [n])

    useEffect(() => {

      if(!canvasRef.current) return;

      const ctx = canvasRef.current.getContext('2d');
    let ifAscending = false // ascending or descending
    
    
    let silhouette_show = silhouette.map((val) => val.map(v => (upperShowIdx > 0)? v['classwise_silhouette'][upperShowIdx-1] : v['silhouette']))
    const silhouette_idx = silhouette_map.sort((a, b) => ifAscending? a[0][sortIdx] - b[0][sortIdx] : b[0][sortIdx] - a[0][sortIdx]).map(v => v[1]); 
    
    let upper_triangular = silhouette_idx.reduce((acc, curr, idx) => acc.concat(silhouette_idx.slice(idx+1).map(j => silhouette_show[curr][j]).flat()), [])
    
    let max = d3.max(upper_triangular) + d3.min(upper_triangular) > 0 ? d3.max(upper_triangular) : -d3.min(upper_triangular)
    // console.log(d3.max(upper_triangular), d3.min(upper_triangular), max)
    
    let scaleMetric = d3.scaleLinear()
      .domain([-max, max])
      .range([0, 1]);

      
    drawBaseLine(ctx, n, width, height, cellWidth, cellHeight, silhouette_idx)

    for (let i = 0; i < n; i++) { // i 행
      for (let j = i+1; j < n; j++) { // j 열
        let value = silhouette_show[silhouette_idx[i]][silhouette_idx[j]];
          drawMetric((j+1) * cellWidth, (i+1) * cellHeight, cellWidth, cellHeight, value, scaleMetric(value));
        
      }
    }

    silhouette_show = silhouette.map((val) => val.map(v => (lowerShowIdx > 0)? v['classwise_silhouette'][lowerShowIdx-1] : v['silhouette']))
    upper_triangular = silhouette_idx.reduce((acc, curr, idx) => acc.concat(silhouette_idx.slice(idx+1).map(j => silhouette_show[curr][j]).flat()), [])
    max = d3.max(upper_triangular) + d3.min(upper_triangular) > 0 ? d3.max(upper_triangular) : -d3.min(upper_triangular)
    
    // console.log(max)
    scaleMetric = d3.scaleLinear()
      .domain([-max, max])
      .range([0, 1]);

    for (let j = 0; j < n ; j++){ // j 열
      for (let i = j; i < n; i++){ // i 행
        let value = silhouette_show[silhouette_idx[i]][silhouette_idx[j]];
        drawMetric((j+1) * cellWidth, (i+1) * cellHeight, cellWidth, cellHeight, value, scaleMetric(value));
      }
    }

    // lower triangle


  }, [sortIdx, upperShowIdx, lowerShowIdx, silhouette, silhouette_map, n, width, height, cellWidth, cellHeight]);

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
        <Divider />
        <Box sx={{ minWidth: 80 }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">order by</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={sortIdx}
              label="OrderBy"
              onChange={handleSortIdxChange}
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
            >
              <MenuItem value={0}>whole</MenuItem>
              <MenuItem value={1}>class 1</MenuItem>
              <MenuItem value={2}>class 2</MenuItem>
              <MenuItem value={3}>class 3</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Divider />
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
