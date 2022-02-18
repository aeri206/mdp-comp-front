import { useEffect } from 'react';
import './App.css';

import { AppBar, Toolbar, Divider, Drawer, Box, Typography, CssBaseline, colors } from '@mui/material';
import { List, ListItemIcon, ListItem, ListItemText } from '@mui/material';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import * as d3 from "d3";


const colorScale = d3.scaleSequential(d3.interpolatePRGn);

function drawMetric(ctx, x, y, width, height, value, scalevalue){
  // draw canvas rectangle without filling
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
  // ctx.fillText(Math.round(value* 1000) / 1000, x, y, width);
  // ctx.fillText(Math.round(scalevalue* 1000) / 1000, x, y+12, width);

}

function drawBaseLine(ctx, n, width, height,cellWidth, cellHeight, idx){
  
  // draw canvas rectangle without filling
  ctx.lineWidth = 0.1;
  ctx.font = 'bold 12px sans-serif';

  for (let i = 1; i <= n; i++){
    
    const colors = ['red', 'blue', 'green', 'orange']
    const file_idx = idx[i-1];
    // ctx.fillText(file_idx, i * cellWidth, cellHeight/2);
    const weight_info = require(`./proj/${file_idx}/metadata.json`).attr_weight
    console.log(i, file_idx, weight_info)
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
  const reorder = require('reorder.js')
  

  // use canvas stroke color from d3 color scale
  

    // var perm = reorder.permutation()(mat);
    // var permuted_mat = reorder.stablepermute(mat, perm);
    // console.log(perm, permuted_mat)

  const { n, width, height } = props;
  // make matrix cells using html canvas

  
  useEffect(() => {

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const cellWidth = Math.floor(width / (n+1));
    const cellHeight = Math.floor(height / (n+1));
    
    
    

    const silhouette = require("./proj/silhouette.json")

    let silhouette_map = silhouette.map((val, idx) => Object.values(val[idx]).flat()).map((v, i) => [v, i]);

    let sortIdx = 2 // idx 0: whole, 1~3: class
    let showIdx = 3
    let ifAscending = false // ascending or descending
    
    let silhouette_show = silhouette.map((val) => val.map(v => (showIdx > 0)? v['classwise_silhouette'][showIdx-1] : v['silhouette']))
    const silhouette_idx = silhouette_map.sort((a, b) => ifAscending? a[0][sortIdx] - b[0][sortIdx] : b[0][sortIdx] - a[0][sortIdx]).map(v => v[1]); 
    
    let upper_triangular = silhouette_idx.reduce((acc, curr, idx) => acc.concat(silhouette_idx.slice(idx+1).map(j => silhouette_show[curr][j]).flat()), [])
    
    let max = d3.max(upper_triangular) + d3.min(upper_triangular) > 0 ? d3.max(upper_triangular) : -d3.min(upper_triangular)
    
    // console.log(max, d3.max(upper_triangular), d3.min(upper_triangular))
    let scaleMetric = d3.scaleLinear()
      .domain([-max, max])
      .range([0, 1]);
      
    drawBaseLine(ctx, n, width, height, cellWidth, cellHeight, silhouette_idx)

    for (let i = 0; i < n; i++) { // i 행
      for (let j = i; j < n; j++) { // j 열
        let value = silhouette_show[silhouette_idx[i]][silhouette_idx[j]];
        drawMetric(ctx, (j+1) * cellWidth, (i+1) * cellHeight, cellWidth, cellHeight, value, scaleMetric(value));
      }
    }

    showIdx = 1;
    silhouette_show = silhouette.map((val) => val.map(v => (showIdx > 0)? v['classwise_silhouette'][showIdx-1] : v['silhouette']))
    upper_triangular = silhouette_idx.reduce((acc, curr, idx) => acc.concat(silhouette_idx.slice(idx+1).map(j => silhouette_show[curr][j]).flat()), [])
    max = d3.max(upper_triangular) + d3.min(upper_triangular) > 0 ? d3.max(upper_triangular) : -d3.min(upper_triangular)
    
    scaleMetric = d3.scaleLinear()
      .domain([-max, max])
      .range([0, 1]);

    for (let j = 0; j < n ; j++){ // j 열
      for (let i = j; i < n; i++){ // i 행

        let value = silhouette_show[silhouette_idx[i]][silhouette_idx[j]];
        drawMetric(ctx, (j+1) * cellWidth, (i+1) * cellHeight, cellWidth, cellHeight, value, scaleMetric(value));
      }

    }

    // lower triangle


  }, [n]);

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
            Permanent drawer
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
        <List>
          {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
        <Box>
          <canvas id="canvas" width={width} height={height} style={{ paddingTop:'64px'}} />
        </Box>
      </Box>
    </div>
  );
}


  


  
  


export default App;
