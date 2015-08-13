/**
 * @author Michael McDermott
 * Created on 7/20/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr')
    .factory('d3Clust', d3Clust);

  /* @ngInject */
  function d3Clust(d3, lodash) {

    var BACKGROUND_COLOR = 'white';
    var d3Clustergram = {};

    // initialize clustergram: size, scales, etc.
    function initializeVisualization(networkData, params) {


      // Define Visualization Dimensions
      ///////////////////////////////////////

      // greyBorder
      ///////////////////
      // the outermost part of the visualization
      params.greyBorderWidth = 3;

      // the distance between labels and clustergram
      // a universal margin for the clustergram
      params.uniMargin = 4;
      params.uniMarginRow = 2;

      // Super Labels
      ///////////////////
      // super label width - the labels are 20px wide if they are included
      if (params.superLabels === 'yes') {
        // include super labels
        params.superLabelWidth = 20;
      } else {
        // do not include super labels
        params.superLabelWidth = 0;
      }

      // Variable Label Widths
      //////////////////////////
      // based on the length of the row/col labels - longer labels mean more space given
      // get row col data
      var colNodes = networkData.colNodes;
      var rowNodes = networkData.rowNodes;
      // find the label with the most characters and use it to adjust the row and col margins
      var rowMaxChar = lodash.max(rowNodes, function(inst) {
        return inst.name.length;
      }).name.length;
      var colMaxChar = lodash.max(colNodes, function(inst) {
        return inst.name.length;
      }).name.length;
      // define label scale parameters: the more characters in the longest name, the larger the margin
      var minNumChar = 5;
      var maxNumChar = 60;
      var minLabelWidth = 60;
      var maxLabelWidth = 240; // !! LDR minor adjustment
      var labelScale =
        d3
        .scale
        .linear()
        .domain([minNumChar, maxNumChar])
        .range([minLabelWidth, maxLabelWidth])
        .clamp('true');

      // Nomal Labels
      // define the space needed for the classification of rows - includes classification triangles and rects
      params.classRoom = {};
      if (lodash.has(params, 'group-colors')) {
        // make room for group rects
        params.classRoom.row = 18;
        params.classRoom.col = 9;
        // the width of the classification triangle or group rectangle
        params.classRoom.symbolWidth = 9;
      } else {
        // do not make room for group rects
        params.classRoom.row = 9;
        params.classRoom.col = 0;
        // the width of the classification triangle or group rectangle
        params.classRoom.symbolWidth = 9;
      }

      // rotated column labels - approx trig
      params.normLabel = {};
      params.normLabel.width = {};
      params.normLabel.width.row = labelScale(rowMaxChar);
      params.normLabel.width.col = 0.8 * labelScale(colMaxChar);
      // normal label margins
      params.normLabel.margin = {};
      params.normLabel.margin.left = params.greyBorderWidth + params.superLabelWidth;
      params.normLabel.margin.top = params.greyBorderWidth + params.superLabelWidth;
      // norm label background width, norm-label-width plus class-width plus maring
      params.normLabel.background = {};
      params.normLabel.background.row = params.normLabel.width.row +
        params.classRoom.row + params.uniMargin;
      params.normLabel.background.col = params.normLabel.width.col +
        params.classRoom.col + params.uniMargin;

      // clustergram dimensions
      params.clust = {};
      params.clust.margin = {};
      // clust margin is the margin of the normLabel plus the width of the entire normLabel group
      params.clust.margin.left = params.normLabel.margin.left +
        params.normLabel.background.row;
      params.clust.margin.top = params.normLabel.margin.top +
        params.normLabel.background.col;


      // calc clustergram dimensions
      /////////////////////////////////////
      // prevent narrow tiles and prevent stretched rows

      // svg size: less than svg size
      ///////////////////////////////////
      // 0.8 approximates the trigonometric distance required for hiding the spillover
      params.spilloverXOffset = labelScale(colMaxChar) * 0.8;

      // get height and width from parent div
      params.svgDim = {};
      params.svgDim.width = Number(
        d3
        .select('#svg-div')
        .style('width')
        .replace('px', '')
      );
      params.svgDim.height = Number(
        d3
        .select('#svg-div')
        .style('height')
        .replace('px', '')
      );
      // reduce width by row/col labels and by greyBorder width (reduce width by less since this is less aparent with slanted col labels)
      var iniClustWidth = params.svgDim.width - (params.superLabelWidth +
          labelScale(rowMaxChar) + params.classRoom.row) - params.greyBorderWidth -
        params.spilloverXOffset;
      // there is space between the clustergram and the border
      var iniClustHeight = params.svgDim.height - (params.superLabelWidth +
          0.8 * labelScale(colMaxChar) + params.classRoom.col) - 5 *
        params.greyBorderWidth;

      // the visualization dimensions can be smaller than the svg
      // if there are not many rows the clustergram width will be reduced, but not the svg width
      //!! needs to be improved
      var preventcolStretch =
        d3
        .scale
        .linear()
        .domain([1, 20])
        .range([0.05, 1])
        .clamp('true');

      // clustDim - clustergram dimensions (the clustergram is smaller than the svg)
      params.clust.dim = {};
      params.clust.dim.width = iniClustWidth * preventcolStretch(colNodes.length);

      // clustergram height
      ////////////////////////
      // ensure that rects are never taller than they are wide
      // force square tiles
      if (colNodes.length > rowNodes.length) {

        // scale the height
        params.clust.dim.height = iniClustWidth * (rowNodes.length / colNodes
          .length);

        // keep track of whether or not a force square has occurred
        // so that I can adjust the font accordingly
        params.forceSquare = 1;

        // make sure that forceSquare does not cause the entire visualization
        // to be taller than the svg, if it does, then undo
        if (params.clust.dim.height > iniClustHeight) {
          // make the height equal to the width
          params.clust.dim.height = iniClustHeight;
          // keep track of whether or not a force square has occurred
          params.forceSquare = 0;
        }
      }
      // do not force square tiles
      else {
        // the height will be calculated normally - leading to wide tiles
        params.clust.dim.height = iniClustHeight;
        // keep track of whether or not a force square has occurred
        params.forceSquare = 0;
      }

      // Define Orderings
      ////////////////////////////
      // scaling functions to position rows and tiles, define rangeBands
      params.xScale = d3.scale.ordinal().rangeBands([0, params.clust.dim.width]);
      params.yScale = d3.scale.ordinal().rangeBands([0, params.clust.dim.height]);

      // Define Orderings
      params.orders = {
        name: d3.range(colNodes.length).sort(function(a, b) {
          return d3.ascending(colNodes[a].name, colNodes[b].name);
        }),
        // rank
        rankRow: d3.range(colNodes.length).sort(function(a, b) {
          return colNodes[b].rank - colNodes[a].rank;
        }),
        rankCol: d3.range(rowNodes.length).sort(function(a, b) {
          return rowNodes[b].rank - rowNodes[a].rank;
        }),
        // clustered
        clustRow: d3.range(colNodes.length).sort(function(a, b) {
          return colNodes[b].clust - colNodes[a].clust;
        }),
        clustCol: d3.range(rowNodes.length).sort(function(a, b) {
          return rowNodes[b].clust - rowNodes[a].clust;
        }),
        // class
        classRow: d3.range(colNodes.length).sort(function(a, b) {
          return colNodes[b].cl - colNodes[a].cl;
        }),
        classCol: d3.range(rowNodes.length).sort(function(a, b) {
          return rowNodes[b].cl - rowNodes[a].cl;
        })
      };

      // Assign initial ordering for xScale and yScale
      if (params.instOrder === 'clust') {
        params.xScale.domain(params.orders.clustRow);
        params.yScale.domain(params.orders.clustCol);
      } else if (params.instOrder === 'rank') {
        params.xScale.domain(params.orders.rankRow);
        params.yScale.domain(params.orders.rankCol);
      } else if (params.instOrder === 'class') {
        params.xScale.domain(params.orders.classRow);
        params.yScale.domain(params.orders.classCol);
      }

      // visualization parameters
      //////////////////////////////

      // borderWidth - width of white borders around tiles
      params.borderWidth = params.xScale.rangeBand() / 16.66;

      // zoomSwitch from 1 to 2d zoom
      params.zoomSwitch = (params.clust.dim.width / colNodes.length) /
        (params.clust.dim.height / rowNodes.length);

      // font size controls
      ////////////////////////////
      // min and max number of expected nodes
      var minNodeNum = 10;
      var maxNodeNum = 3000;

      // min and max font sizes
      var minFs = 0.05;
      var maxFs = 15;

      // min and max expected screen widths
      var minVizWidth = 400;
      var maxVizWidth = 2000;

      // make a scale that will set the initial font size based on the number of nodes
      var scaleFontSize = d3.scale.log().domain([minNodeNum, maxNodeNum])
        .range([maxFs, minFs]).clamp('true');

      // controls how much the font size increases during zooming
      // 1: do not increase font size while zooming
      // 0: increase font size while zooming
      // allow some increase in font size when zooming
      var minFsZoom = 0.95;
      // allow full increase in font size when zooming
      var maxFsZoom = 0.0;
      // make a scale that will control how the font size changes with zooming based on the number of nodes
      var scaleReduceFontSizeFactor =
        d3
        .scale
        .log()
        .domain([minNodeNum, maxNodeNum])
        .range([minFsZoom, maxFsZoom])
        .clamp('true');

      // define screen width font size scale
      // having a small screen width should reduce the font size of the columns
      // this will be compensated by increasing the available real zoom
      //!! this can be improved
      var scaleFsScreenWidth =
        d3
        .scale
        .linear()
        .domain([minVizWidth, maxVizWidth])
        .range([0.75, 1.15])
        .clamp('true');
      var scaleFsScreenHeight =
        d3
        .scale
        .linear()
        .domain([minVizWidth, maxVizWidth])
        .range([0.75, 1.15])
        .clamp('true');

      // the default font sizes are set here
      params.defaultFsRow = scaleFontSize(rowNodes.length) *
        scaleFsScreenHeight(params.clust.dim.height);
      // the colum font size is scaled by the width
      //!! make this local later
      params.defaultFsCol = scaleFontSize(colNodes.length) *
        scaleFsScreenWidth(params.clust.dim.width);

      // correct for forcing the tiles to be squares - if they are forced, then use the col font size for the row
      if (params.forceSquare === 1) {
        // scale the row font size by the col scaling
        params.defaultFsRow = params.defaultFsCol;
      }

      // calculate the reduce font-size factor: 0 for no reduction in font size and 1 for full reduction of font size
      params.reduceFontSize = {};
      params.reduceFontSize.row = scaleReduceFontSizeFactor(rowNodes.length);
      params.reduceFontSize.col = scaleReduceFontSizeFactor(colNodes.length);

      // set up the real zoom (2d zoom) as a function of the number of colNodes
      // since these are the nodes that are zoomed into in 2d zooming
      var realZoomScaleCol =
        d3
        .scale
        .linear()
        .domain([minNodeNum, maxNodeNum])
        .range([2, 5])
        .clamp('true');

      // scale the zoom based on the screen size
      // smaller screens can zoom in more, compensates for reduced font size with small screen
      var realZoomScaleScreen =
        d3
        .scale
        .linear()
        .domain([minVizWidth, maxVizWidth])
        .range([2, 1])
        .clamp('true');
      // calculate the zoom factor - the more nodes the more zooming allowed
      params.realZoom = realZoomScaleCol(colNodes.length) *
        realZoomScaleScreen(params.clust.dim.width);

      // set opacity scale
      var maxLink = lodash.max(networkData.links, function(d) {
        return Math.abs(d.value);
      });


      // set opacityScale
      // input domain of 0 means set the domain automatically
      if (params.inputDomain === 0) {
        // set the domain using the maximum absolute value
        if (params.opacityScale === 'linear') {
          params.opacityScale = d3.scale.linear().domain([0, Math.abs(
            maxLink.value)]).clamp(true).range([0.0, 1.0]);
        } else if (params.opacityScale === 'log') {
          params.opacityScale = d3.scale.log().domain([0.001, Math.abs(
            maxLink.value)]).clamp(true).range([0.0, 1.0]);
        }
      } else {
        // set the domain manually
        if (params.opacityScale === 'linear') {
          params.opacityScale = d3.scale.linear().domain([0, params.inputDomain])
            .clamp(true).range([0.0, 1.0]);
        } else if (params.opacityScale === 'log') {
          params.opacityScale = d3.scale.log().domain([0.001, params.inputDomain])
            .clamp(true).range([0.0, 1.0]);
        }
      }

      // not running a transition
      params.runTrans = 0;

      // console.log(networkData.links[0])
      // define tile type: rect, group
      // rect is the default faster and simpler option
      // group is the optional slower and more complex option that is activated with: highlighting or split tiles
      // if ( lodash.has(networkData.links[0], 'valueUp') || lodash.has(networkData.links[0], 'highlight') ){
      if (lodash.has(networkData.links[0], 'valueUp')) {
        params.tileType = 'group';
      } else {
        params.tileType = 'simple';
      }

      // check if rects should be highlighted
      if (lodash.has(d3Clustergram.networkData.links[0], 'highlight')) {
        params.highlight = 1;
      } else {
        params.highlight = 0;
      }

      return params;
    }


    // main function
    function makeD3Clustergram(args) {

      // initialize the parameters object
      var params = {};

      // save all arguments for remaking viz
      params.args = args;

      // Unload Arguments
      /////////////////////////

      // networkData - not an optional argument
      var networkData = args.networkData;

      // svgDivId
      if (typeof args.svgDivId === 'undefined') {
        params.svgDivId = 'svg-div';
      } else {
        params.svgDivId = args.svgDivId;
      }

      // super-row/col labels
      if (typeof args.rowLabel === 'undefined' ||
        typeof args.colLabel === 'undefined') {
        // do not put super labels
        params.superLabels = 'no';
      } else {
        // make super labels
        params.superLabels = 'yes';
        params.super = {};
        params.super.row = args.rowLabel;
        params.super.col = args.colLabel;
      }

      // add title to tile
      if (typeof args.titleTile === 'undefined') {
        params.titleTile = false;
      } else {
        params.titleTile = args.titleTile;
      }

      // tile colors
      if (typeof args.tileColors === 'undefined') {
        // red/blue
        params.tileColors = ['#FF0000', '#1C86EE'];
      } else {
        params.tileColors = args.tileColors;
      }


      // tile callback function - optional
      if (typeof args.clickTile === 'undefined') {
        // there is no callback function included
        params.clickTile = 'none';
      } else {
        // transfer the callback function
        params.clickTile = args.clickTile;
      }

      // group callback function - optional
      if (typeof args.clickGroup === 'undefined') {
        params.clickGroup = 'none';
      } else {
        // transfer the callback function
        params.clickGroup = args.clickGroup;
      }

      // set input domain
      if (typeof args.inputDomain === 'undefined') {
        // default domain is set to 0, which means that the domain will be set automatically
        params.inputDomain = 0;
      } else {
        params.inputDomain = args.inputDomain;
      }

      // set opacity scale type
      if (typeof args.opacityScale === 'undefined') {
        params.opacityScale = 'linear';
      } else {
        params.opacityScale = args.opacityScale;
      }

      // variable/fixed visualization size (needs to be in the arguments)
      if (typeof args.resize === 'undefined') {
        // default resize to yes
        params.resize = true;
      } else {
        params.resize = args.resize;
      }

      // get outerMargins
      if (typeof args.outerMargins === 'undefined') {
        // default margins
        params.outerMargins = {
          'top': 0,
          'bottom': 0,
          'left': 0,
          'right': 0
        };
      } else {
        params.outerMargins = args.outerMargins;
      }

      // get initial ordering
      if (typeof args.order === 'undefined') {
        params.instOrder = 'clust';
      }
      // only use ordering if its defined correctly
      else if (args.order === 'clust' || args.order === 'rank' || args.order ===
        'class') {
        params.instOrder = args.order;
      } else {
        // backup
        params.instOrder = 'clust';
      }

      if (typeof args.transpose === 'undefined') {
        params.transpose = false;
      } else {
        params.transpose = args.transpose;
      }

      // transpose network data and super-labels
      if (params.transpose === true) {
        networkData = transposeNetwork(networkData);
        params.super.row = args.colLabel;
        params.super.col = args.rowLabel;
      }

      // save global version of networkData
      d3Clustergram.networkData = networkData;

      // set local variables from networkData
      var colNodes = networkData.colNodes;
      var rowNodes = networkData.rowNodes;

      // colors from http://graphicdesign.stackexchange.com/revisions/3815/8
      params.randColors = ['#000000', '#FF34FF', '#FFFF00', '#FF4A46',
        '#008941', '#006FA6', '#A30059', '#FFDBE5', '#7A4900', '#0000A6',
        '#63FFAC', '#B79762', '#004D43', '#8FB0FF', '#997D87', '#5A0007',
        '#809693', '#FEFFE6', '#1B4400', '#4FC601', '#3B5DFF', '#4A3B53',
        '#FF2F80', '#61615A', '#BA0900', '#6B7900', '#00C2A0', '#FFAA92',
        '#FF90C9', '#B903AA', '#D16100', '#DDEFFF', '#000035', '#7B4F4B',
        '#A1C299', '#300018', '#0AA6D8', '#013349', '#00846F', '#372101',
        '#FFB500', '#C2FFED', '#A079BF', '#CC0744', '#C0B9B2', '#C2FF99',
        '#001E09', '#00489C', '#6F0062', '#0CBD66', '#EEC3FF', '#456D75',
        '#B77B68', '#7A87A1', '#788D66', '#885578', '#FAD09F', '#FF8A9A',
        '#D157A0', '#BEC459', '#456648', '#0086ED', '#886F4C', '#34362D',
        '#B4A8BD', '#00A6AA', '#452C2C', '#636375', '#A3C8C9', '#FF913F',
        '#938A81', '#575329', '#00FECF', '#B05B6F', '#8CD0FF', '#3B9700',
        '#04F757', '#C8A1A1', '#1E6E00', '#7900D7', '#A77500', '#6367A9',
        '#A05837', '#6B002C', '#772600', '#D790FF', '#9B9700', '#549E79',
        '#FFF69F', '#201625', '#72418F', '#BC23FF', '#99ADC0', '#3A2465',
        '#922329', '#5B4534', '#FDE8DC', '#404E55', '#0089A3', '#CB7E98',
        '#A4E804', '#324E72', '#6A3A4C', '#83AB58', '#001C1E', '#D1F7CE',
        '#004B28', '#C8D0F6', '#A3A489', '#806C66', '#222800', '#BF5650',
        '#E83000', '#66796D', '#DA007C', '#FF1A59', '#8ADBB4', '#1E0200',
        '#5B4E51', '#C895C5', '#320033', '#FF6832', '#66E1D3', '#CFCDAC',
        '#D0AC94', '#7ED379', '#012C58', '#7A7BFF', '#D68E01', '#353339',
        '#78AFA1', '#FEB2C6', '#75797C', '#837393', '#943A4D', '#B5F4FF',
        '#D2DCD5', '#9556BD', '#6A714A', '#001325', '#02525F', '#0AA3F7',
        '#E98176', '#DBD5DD', '#5EBCD1', '#3D4F44', '#7E6405', '#02684E',
        '#962B75', '#8D8546', '#9695C5', '#E773CE', '#D86A78', '#3E89BE',
        '#CA834E', '#518A87', '#5B113C', '#55813B', '#E704C4', '#00005F',
        '#A97399', '#4B8160', '#59738A', '#FF5DA7', '#F7C9BF', '#643127',
        '#513A01', '#6B94AA', '#51A058', '#A45B02', '#1D1702', '#E20027',
        '#E7AB63', '#4C6001', '#9C6966', '#64547B', '#97979E', '#006A66',
        '#391406', '#F4D749', '#0045D2', '#006C31', '#DDB6D0', '#7C6571',
        '#9FB2A4', '#00D891', '#15A08A', '#BC65E9', '#FFFFFE', '#C6DC99',
        '#203B3C', '#671190', '#6B3A64', '#F5E1FF', '#FFA0F2', '#CCAA35',
        '#374527', '#8BB400', '#797868', '#C6005A', '#3B000A', '#C86240',
        '#29607C', '#402334', '#7D5A44', '#CCB87C', '#B88183', '#AA5199',
        '#B5D6C3', '#A38469', '#9F94F0', '#A74571', '#B894A6', '#71BB8C',
        '#00B433', '#789EC9', '#6D80BA', '#953F00', '#5EFF03', '#E4FFFC',
        '#1BE177', '#BCB1E5', '#76912F', '#003109', '#0060CD', '#D20096',
        '#895563', '#29201D', '#5B3213', '#A76F42', '#89412E', '#1A3A2A',
        '#494B5A', '#A88C85', '#F4ABAA', '#A3F3AB', '#00C6C8', '#EA8B66',
        '#958A9F', '#BDC9D2', '#9FA064', '#BE4700', '#658188', '#83A485',
        '#453C23', '#47675D', '#3A3F00', '#061203', '#DFFB71', '#868E7E',
        '#98D058', '#6C8F7D', '#D7BFC2', '#3C3E6E', '#D83D66', '#2F5D9B',
        '#6C5E46', '#D25B88', '#5B656C', '#00B57F', '#545C46', '#866097',
        '#365D25', '#252F99', '#00CCFF', '#674E60', '#FC009C', '#92896B',
        '#1CE6FF'
      ];

      // get the total number of colors
      var numColors = params.randColors.length;

      // row groups - only add if the rows have a group attribute
      if (lodash.has(rowNodes[0], 'group') === true || lodash.has(colNodes[0], 'group')) {

        // initialize group colors
        /////////////////////////
        params.groupColors = {};
        // initailize group at 5
        params.groupLevel = {};
        params.groupLevel.row = 5;
        params.groupLevel.col = 5;

      }

      // check if row/col have class information
      if (lodash.has(rowNodes[0], 'cl') || lodash.has(colNodes[0], 'cl')) {
        // gather classes
        params.classColors = {};
      }

      // gather class information from row
      if (lodash.has(rowNodes[0], 'cl') === true) {
        var classRow = lodash.uniq(lodash.pluck(rowNodes, 'cl'));
        // associate classes with colors
        params.classColors.row = {};
        lodash.each(classRow, function(cRow, cRowIndex) {
          params.classColors.row[cRow] =
            params.randColors[cRowIndex + 50 % numColors];
        });
      }
      // gather class information from col
      if (lodash.has(colNodes[0], 'cl') === true) {
        var classCol = lodash.uniq(lodash.pluck(colNodes, 'cl'));
        // associate classes with colors
        params.classColors.col = {};
        lodash.each(classCol, function(cCol, cColIndex) {
          if (cColIndex === 0) {
            params.classColors.col[cCol] = '#eee';
          } else {
            params.classColors.col[cCol] =
              params.randColors[cColIndex + 50 % numColors];
          }
        });
      }

      // get row groups and make color dictionary
      if (lodash.has(rowNodes[0], 'group') === true) {
        params.groupColors.row = {};

        // generate random colors for the groups
        for (var k = 0; k < 200; k++) {
          // grab colors from the list
          if (k === 1) {
            params.groupColors.row[k] = '#eee';
          } else {
            params.groupColors.row[k] = params.randColors[k % numColors];
          }
        }
      }

      // get col groups and make color dictionary
      if (lodash.has(colNodes[0], 'group') === true) {
        params.groupColors.col = {};

        // generate random colors for the groups
        for (var l = 0; l < 200; l++) {
          // grab colors from the list
          if (l === 1) {
            params.groupColors.col[l] = '#eee';
          } else {
            params.groupColors.col[l] = params.randColors[l % numColors];
          }
        }
      }

      // Begin Making Visualization
      /////////////////////////////////

      // might save global data to specific object in case a user wants
      // to have more than one clustergram
      // // initialize an object with the name svgDivId
      // d3Clustergram['params_'+svgDivId] = {}

      // remove any previous visualizations
      d3.select('#main-svg').remove();

      // size and position the outer div first
      //////////////////////////////////////////
      // only resize if allowed
      parentDivSizePos(params);

      // initialize clustergram variables
      params = initializeVisualization(networkData, params);

      // display col and row title
      d3.select('#row-title').style('display', 'block');
      d3.select('#col-title').style('display', 'block');

      // display clustInstructContainer
      d3.select('#clust-instruct-container').style('display', 'block');

      // shift the footer left
      d3.select('#footer-div')
        .style('margin-left', '0px');

      // !! need to set up
      // highlight resource types - set up type/color association
      params = highlightResourceTypes(params);

      // define the variable zoom, a d3 method
      params.zoom = d3.behavior.zoom().scaleExtent([1, params.realZoom *
        params.zoomSwitch
      ]).on('zoom', zoomed);

      // initialize matrix
      /////////////////////////
      params.matrix = [];


      // initialize matrix
      rowNodes.forEach(
        function(tmp, posY) {
          params.matrix[posY] = d3.range(colNodes.length).map(function(posX) {
            return {
              posX: posX,
              posY: posY,
              value: 0
            };
          });
        });
      // rect only
      if (params.tileType === 'simple') {
        // Add information to the matrix
        networkData.links.forEach(function(link) {
          params.matrix[link.source][link.target].value = link.value;
        });
      } else {
        // Add information to the matrix
        networkData.links.forEach(function(link) {
          // transfer link information to the new adj matrix
          params.matrix[link.source][link.target].value = link.value;
          params.matrix[link.source][link.target].valueUp = link.valueUp;
          params.matrix[link.source][link.target].valueDn = link.valueDn;
          if (params.highlight === 1) {
            params.matrix[link.source][link.target].highlight = link.highlight;
          }
        });
      }

      // save params to the global object d3Clustergram
      d3Clustergram.params = params;

      // make clustergram visualization
      ///////////////////////////////////////

      // make outer group for clustGroup - this will position clustGroup once
      var outerGroup = d3.select('#' + params.svgDivId)
        .append('svg')
        .attr('id', 'main-svg')
        // leave room for the light grey border
        .attr('width', params.svgDim.width)
        // the height is reduced by more than the width because the tiles go right up to the bottom border
        .attr('height', params.svgDim.height);
      // call zoom on the entire svg
      // .call( params.zoom );

      params.clustGroup = outerGroup
        // append a group that will hold clustGroup and position it once
        .append('g')
        .attr('transform', 'translate(' + params.clust.margin.left + ',' +
          params.clust.margin.top + ')')
        .append('g')
        .attr('id', 'clust-group');

      // grey background rect for clustergram
      params.clustGroup
        .append('rect')
        .attr('class', 'background')
        .attr('id', 'grey-background')
        .style('fill', '#eee')
        .attr('width', params.clust.dim.width)
        .attr('height', params.clust.dim.height);

      // make rows: make rects or groups
      // use matrix for the data join, which contains a two dimensional
      // array of objects, each row of this matrix will be passed into the row function
      var tempObj, rowObj;

      tempObj = params.clustGroup.selectAll('.row')
        .data(params.matrix)
        .enter()
        .append('g')
        .attr('class', 'row')
        .attr('transform', function(d, rowIndex) {
          return 'translate(0,' + params.yScale(rowIndex) + ')';
        });

      if (params.tileType === 'simple') {
        rowObj = tempObj.each(rowFunction);
      } else {
        rowObj = tempObj.each(rowGroupFunction);
      }


      // white lines in clustergram
      /////////////////////////////////

      // horizontal lines
      rowObj.append('line')
        //!! find ouw what 20 represents
        .attr('x2', 20 * params.clust.dim.width)
        .style('stroke-width', params.borderWidth / params.zoomSwitch +
          'px')
        .style('stroke', 'white');

      // append vertical line groups
      var vertLines = params.clustGroup
        .selectAll('.vert-lines')
        .data(colNodes)
        .enter()
        .append('g')
        .attr('class', 'vert-lines')
        .attr('transform', function(d, vertIndex) {
          return 'translate(' + params.xScale(vertIndex) + ') rotate(-90)';
        });

      // add vertical lines
      vertLines
        .append('line')
        .attr('x1', 0)
        //!! could be improved
        .attr('x2', -params.clust.dim.height)
        .style('stroke-width', params.borderWidth + 'px')
        .style('stroke', 'white');


      // Row
      //////////////////////////////////
      // make container to pre-position zoomable elements
      var containerAllRow = d3.select('#main-svg')
        .append('g')
        .attr('transform', 'translate(' + params.normLabel.margin.left + ',' +
          params.clust.margin.top + ')');

      // white background rect for row labels
      containerAllRow
        .append('rect')
        .attr('fill', BACKGROUND_COLOR)
        .attr('width', params.normLabel.background.row)
        .attr('height', 30 * params.clust.dim.height + 'px')
        .attr('class', 'white-bars');

      // rowLabels
      containerAllRow
        .append('g')
        // position the outer row label group
        .attr('transform', 'translate(' + params.normLabel.width.row + ',0)')
        .append('g')
        .attr('id', 'row-labels');

      // generate and position the row labels
      var rowLabels = d3.select('#row-labels')
        .selectAll('.row-label-text')
        .data(rowNodes)
        .enter()
        .append('g')
        .attr('class', 'row-label-text')
        .attr('transform', function(d, rowLabelTransIndex) {
          return 'translate(0,' + params.yScale(rowLabelTransIndex) + ')';
        })
        .on('click', reorderClickRow)
        .on('mouseover', function() {
          // highlight text
          d3.select(this).select('text').attr('font-family', 'Avenir Next')
            .style('font-weight', 'bold');
        })
        .on('mouseout', function mouseout() {
          d3.select(this).select('text').attr('font-family', 'Avenir Next')
            .style('font-weight', 'normal');
          // reset highlighted col
          d3.select('#clicked-row')
            .style('font-weight', 'bold');
        });

      // append row label text
      rowLabels
        .append('text')
        .attr('y', params.yScale.rangeBand() * 0.65)
        // .attr('dy', params.yScale.rangeBand()/4)
        .attr('text-anchor', 'end')
        .style('font-size', params.defaultFsRow + 'px')
        .text(function(d) {
          return d.name;
        });

      // append rectangle behind text
      rowLabels
        .insert('rect', 'text')
        .attr('x', -10)
        .attr('y', 0)
        .attr('width', 10)
        .attr('height', 10)
        .style('opacity', 0);

      // change the size of the highlighting rects
      rowLabels
        .each(function() {
          // get the bounding box of the row label text
          var bbox = d3.select(this)
            .select('text')[0][0]
            .getBBox();
          // use the bounding box to set the size of the rect
          d3.select(this)
            .select('rect')
            .attr('x', bbox.x * 0.5)
            .attr('y', 0)
            .attr('width', bbox.width * 0.5)
            .attr('height', params.yScale.rangeBand())
            .style('fill', function() {
              var instHl = 'yellow';
              return instHl;
            })
            .style('opacity', function(d) {
              var instOpacity = 0;
              // highlight target genes
              if (d.target === 1) {
                instOpacity = 1;
              }
              return instOpacity;
            });
        });

      // row triangles
      ///////////////////////
      var rowTriangleZoom =
        containerAllRow
        .append('g')
        // shift by the width of the normal row labels
        .attr('transform', 'translate(' + params.normLabel.width.row + ',0)')
        .append('g')
        .attr('id', 'row-label-triangles');

      // append triangle background rect to zoomable group
      rowTriangleZoom
        .append('rect')
        .attr('fill', BACKGROUND_COLOR)
        .attr('width', params.classRoom.row + 'px')
        .attr('height', function() {
          var instHeight = params.clust.dim.height;
          return instHeight;
        });

      // append groups - each holds one triangle
      var rowTriangleIniGroup =
        rowTriangleZoom
        .selectAll('g')
        .data(rowNodes)
        .enter()
        .append('g')
        .attr('class', 'row-triangle-group')
        .attr('transform', function(d, rowTriIndex) {
          return 'translate(0, ' + params.yScale(rowTriIndex) + ')';
        });

      // add triangles
      rowTriangleIniGroup
        .append('path')
        .attr('d', function() {
          var originX = params.classRoom.symbolWidth - 1;
          var originY = 0;
          var midX = 1;
          var midY = params.yScale.rangeBand() / 2;
          var finalX = params.classRoom.symbolWidth - 1;
          var finalY = params.yScale.rangeBand();
          var outputString = 'M ' + originX + ',' + originY + ' L ' +
            midX + ',' + midY + ', L ' + finalX + ',' + finalY + ' Z';
          return outputString;
        })
        .attr('fill', function(d) {
          // initailize color
          var instColor = '#eee';
          if (lodash.has(params, 'classColors')) {
            instColor = params.classColors.row[d.cl];
          }
          return instColor;
        });

      // add row group labels if necessary
      //////////////////////////////////////
      if (lodash.has(params, 'group-colors')) {

        // add rects for highlighting automatically identified groups
        var rowClassRect =
          rowTriangleIniGroup
          .append('rect')
          .attr('class', 'row-class-rect')
          .attr('width', function() {
            var instWidth = params.classRoom.symbolWidth - 1;
            return instWidth + 'px';
          })
          .attr('height', params.yScale.rangeBand())
          .style('fill', function(d) {
            var instLevel = params.groupLevel.row;
            return params.groupColors.row[d.group[instLevel]];
          })
          .attr('x', function() {
            var instOffset = params.classRoom.symbolWidth + 1;
            return instOffset + 'px';
          });

        // optional row callback on click
        if (typeof params.clickGroup === 'function') {
          // only add click functionality to row rect
          rowClassRect
            .on('click', function(d) {
              var instLevel = params.groupLevel.row;
              var instGroup = d.group[instLevel];
              // find all row names that are in the same group at the same groupLevel
              // get rowNodes
              var rNodes = d3Clustergram.networkData.rowNodes;
              var groupNodes = [];
              lodash.each(rNodes, function(node) {
                // check that the node is in the group
                if (node.group[instLevel] === instGroup) {
                  // make a list of genes that are in instGroup at this groupLevel
                  groupNodes.push(node.name);
                }
              });

              // return the following information to the user
              // row or col, distance cutoff level, nodes
              var groupInfo = {};
              groupInfo.type = 'row';
              groupInfo.nodes = groupNodes;
              groupInfo.info = {
                'type': 'distance',
                'cutoff': instLevel / 10
              };

              // pass information to groupClick callback
              params.clickGroup(groupInfo);

            });
        }
      }






      // col labels
      //////////////////////////////////
      // make container to pre-position zoomable elements
      var containerAllCol = d3.select('#main-svg')
        .append('g')
        .attr('transform', 'translate(' + params.clust.margin.left + ',' +
          params.normLabel.margin.top + ')');

      // white background rect for col labels
      containerAllCol
        .append('rect')
        .attr('fill', BACKGROUND_COLOR)
        .attr('width', 30 * params.clust.dim.width + 'px')
        .attr('height', params.normLabel.background.col)
        .attr('class', 'white-bars');

      // col labels
      containerAllCol
        .append('g')
        // position the outer col label group
        .attr('transform', 'translate(0,' + params.normLabel.width.col + ')')
        .append('g')
        .attr('id', 'col-labels');

      // offset click group column label
      var xOffsetClick = params.xScale.rangeBand() / 2 + params.borderWidth;
      // reduce width of rotated rects
      var reduceRectWidth = params.xScale.rangeBand() * 0.36;

      // add main column label group
      var colLabelObj = d3.select('#col-labels')
        .selectAll('.col-label-text')
        .data(colNodes)
        .enter()
        .append('g')
        .attr('class', 'col-label-text')
        .attr('transform', function(d, colLabelIndex) {
          return 'translate(' + params.xScale(colLabelIndex) +
            ') rotate(-90)';
        });

      // append group for individual column label
      var colLabelClick = colLabelObj
        // append new group for rect and label (not white lines)
        .append('g')
        .attr('class', 'col-label-click')
        // rotate column labels
        .attr('transform', 'translate(' + params.xScale.rangeBand() / 2 +
          ',' + xOffsetClick + ') rotate(45)')
        .on('click', reorderClickCol)
        .on('mouseover', function() {
          d3.select(this).select('text').attr('font-family', 'Avenir Next')
            .style('font-weight', 'bold');
        })
        .on('mouseout', function mouseout() {
          d3.select(this).select('text').attr('font-family', 'Avenir Next')
            .style('font-weight', 'normal');
          d3.select('#clicked-col')
            .style('font-weight', 'bold');
        });

      // add column label
      colLabelClick
        .append('text')
        .attr('x', 0)
        .attr('y', params.xScale.rangeBand() / 2)
        // offset label to make room for triangle
        .attr('dx', 2 * params.borderWidth)
        .attr('text-anchor', 'start')
        .attr('full-name', function(d) {
          return d.name;
        })
        .style('font-size', params.defaultFsCol + 'px')
        .text(function(d) {
          return d.name.replace(/_/g, ' ');
        });

      // append rectangle behind text
      colLabelClick
        .insert('rect', 'text')
        .attr('x', 10)
        .attr('y', 0)
        .attr('width', 10)
        .attr('height', 10)
        .style('opacity', 0);

      // change the size of the highlighting rects
      colLabelClick
        .each(function() {

          // get the bounding box of the row label text
          var bbox = d3.select(this)
            .select('text')[0][0]
            .getBBox();

          // use the bounding box to set the size of the rect
          d3.select(this)
            .select('rect')
            .attr('x', bbox.x * 1.25)
            .attr('y', 0)
            .attr('width', bbox.width * 1.25)
            // used a reduced rect width for the columsn
            // because the rects are slanted
            .attr('height', params.xScale.rangeBand() * 0.6)
            .style('fill', 'yellow')
            .style('opacity', 0);
        });

      // add triangle under rotated labels
      colLabelClick
        .append('path')
        .style('stroke-width', 0)
        .attr('d', function() {
          // x and y are flipped since its rotated
          var originY = -params.borderWidth;
          var startX = 0;
          var finalX = params.xScale.rangeBand() - reduceRectWidth;
          var startY = -(params.xScale.rangeBand() - reduceRectWidth +
            params.borderWidth);
          var finalY = -params.borderWidth;
          var outputString = 'M ' + originY + ',0 L ' + startY + ',' +
            startX + ', L ' + finalY + ',' + finalX + ' Z';
          return outputString;
        })
        .attr('fill', function(d) {
          var instColor = '#eee';
          if (lodash.has(params, 'classColors')) {
            instColor = params.classColors.col[d.cl];
          }
          return instColor;
        });


      //!! get the abs maximum value from row/col use this to make red/blue bars
      // // get the max abs nlPval (find obj and get nlPval)
      // enrMax = lodash.max( colNodes, function(d) { return Math.abs(d.nlPval) } ).nlPval ;

      // the enrichment bar should be 3/4ths of the height of the column labels
      params.barScaleCol =
        d3
        .scale
        .linear()
        .domain([0, 1])
        .range([0, params.normLabel.width.col]);

      // append column value bars
      if (lodash.has(d3Clustergram.networkData.colNodes[0], 'value')) {
        colLabelClick
          .append('rect')
          .attr('class', 'col-bars')
          // column is rotated - effectively width and height are switched
          .attr('width', function(d) {
            return params.barScaleCol(d.value);
          })
          // rotate labels - reduce width if rotating
          .attr('height', params.xScale.rangeBand() * 0.66)
          .attr('fill', function() {
            // return d.color;
            return 'red';
          })
          .attr('opacity', 0.4);
      }

      // add group labels if necessary
      //////////////////////////////////
      if (lodash.has(params, 'group-colors')) {
        // add class label under column label
        var colClass = containerAllCol
          .append('g')
          // .attr('transform','translate(0,'+params.normLabel.width.col+')')
          .attr('transform', function() {
            var instOffset = params.normLabel.width.col + 2;
            return 'translate(0,' + instOffset + ')';
          })
          .append('g')
          // shift down 1px
          // .attr('transform','translate(0,2)')
          .attr('id', 'col-class');

        // append groups - each will hold a classification rect
        var colClassIniGroup = colClass
          .selectAll('g')
          .data(colNodes)
          .enter()
          .append('g')
          .attr('class', 'col-class-group')
          .attr('transform', function(d, colClassIndex) {
            return 'translate(' + params.xScale(colClassIndex) + ',0)';
          });

        // add rects for highlighting - dendrogram-like
        colClassIniGroup
          .append('rect')
          .attr('class', 'col-class-rect')
          .attr('width', params.xScale.rangeBand())
          .attr('height', function() {
            var instHeight = params.classRoom.col - 1;
            return instHeight;
          })
          .style('fill', function(d) {
            var instLevel = params.groupLevel.col;
            return params.groupColors.col[d.group[instLevel]];
          });

        // optional column callback on click
        if (typeof params.clickGroup === 'function') {
          colClassIniGroup
            .on('click', function(d) {
              var instLevel = params.groupLevel.col;
              var instGroup = d.group[instLevel];
              // find all column names that are in the same group at the same groupLevel
              // get colNodes
              var cNodes = d3Clustergram.networkData.colNodes;
              var groupNodes = [];
              lodash.each(cNodes, function(node) {
                // check that the node is in the group
                if (node.group[instLevel] === instGroup) {
                  // make a list of genes that are in instGroup at this groupLevel
                  groupNodes.push(node.name);
                }
              });

              // return the following information to the user
              // row or col, distance cutoff level, nodes
              var groupInfo = {};
              groupInfo.type = 'col';
              groupInfo.nodes = groupNodes;
              groupInfo.info = {
                'type': 'distance',
                'cutoff': instLevel / 10
              };

              // pass information to groupClick callback
              params.clickGroup(groupInfo);

            });
        }

      }

      // hide spillover from slanted column labels on right side
      containerAllCol
        .append('path')
        .style('stroke-width', '0')
        // mini-language for drawing path in d3, used to draw triangle
        .attr('d', 'M 0,0 L 500,-500, L 500,0 Z')
        .attr('fill', BACKGROUND_COLOR)
        .attr('id', 'right-slant-triangle')
        .attr('transform', 'translate(' + params.clust.dim.width + ',' +
          params.normLabel.width.col + ')');

      // hide spillover from slanted column labels on left side
      containerAllCol
        .append('path')
        .style('stroke-width', '0')
        // mini-language for drawing path in d3, used to draw triangle
        .attr('d', 'M 0,0 L 500,-500, L 0,-500 Z')
        .attr('fill', BACKGROUND_COLOR)
        .attr('id', 'left-slant-triangle')
        // shift left by 1 px to prevent cutting off labels
        .attr('transform', 'translate(-1,' + params.normLabel.width.col +
          ')');

      // top corner rect
      ///////////////////////////////
      // white rect to cover excess labels
      d3.select('#main-svg')
        .append('rect')
        .attr('fill', BACKGROUND_COLOR)
        .attr('width', params.clust.margin.left)
        .attr('height', params.clust.margin.top)
        .attr('id', 'top-left-white');

      // hide spillover from right
      d3.select('#main-svg')
        .append('rect')
        .attr('fill', BACKGROUND_COLOR)
        .attr('width', '300px')
        .attr('height', '3000px')
        .attr('transform', function() {
          var tmpLeft = params.clust.margin.left + params.clust.dim.width;
          var tmpTop = params.normLabel.margin.top + params.normLabel.width
            .col;
          return 'translate(' + tmpLeft + ',' + tmpTop + ')';
        })
        .attr('class', 'white-bars');



      // only make the super titles if they are requested
      if (params.superLabels === 'yes') {

        // super col title
        /////////////////////////////////////
        // add super column title background
        d3.select('#main-svg')
          .append('rect')
          .attr('fill', BACKGROUND_COLOR)
          .attr('height', params.superLabelWidth + 'px')
          .attr('width', '3000px')
          .attr('class', 'white-bars')
          .attr('transform', 'translate(0,' + params.greyBorderWidth + ')');

        // super col title
        d3.select('#main-svg')
          .append('text')
          .text(params.super.col)
          .attr('text-anchor', 'center')
          .attr('transform', function() {
            var instX = params.clust.dim.width / 1.66;
            var instY = params.superLabelWidth - params.uniMargin;
            return 'translate(' + instX + ',' + instY + ')';
          })
          .style('font-family', 'Avenir Next')
          .style('font-size', '16px')
          .style('font-weight', 500);

        // super row title
        /////////////////////////////////////
        // add super row title background
        d3.select('#main-svg')
          .append('rect')
          .attr('fill', BACKGROUND_COLOR)
          .attr('width', params.superLabelWidth + 'px')
          .attr('height', '3000px')
          .attr('class', 'white-bars')
          .attr('transform', 'translate(' + params.greyBorderWidth + ',0)');

        // append super title row group
        // this is used to separate translation from rotation
        d3.select('#main-svg')
          .append('g')
          .attr('id', 'super-row-label')
          .attr('transform', function() {
            // position in the middle of the clustergram
            var instX = params.superLabelWidth - params.uniMargin;
            // !! LDR minor adjustment
            var instY = params.clust.dim.height / 1.2;
            return 'translate(' + instX + ',' + instY + ')';
          });

        // super row label (rotate the already translated title )
        d3.select('#super-row-label')
          .append('text')
          .text(params.super.row)
          .attr('text-anchor', 'center')
          .attr('transform', 'rotate(-90)')
          .style('font-family', 'Avenir Next')
          .style('font-size', '16px')
          .style('font-weight', 500);

      }

      // white border bottom - prevent clustergram from hitting border
      ///////////////////////////////////////////////////////////////////
      d3.select('#main-svg')
        .append('rect')
        .attr('fill', BACKGROUND_COLOR)
        .attr('width', params.svgDim.width)
        // make this border twice the width of the grey border
        .attr('height', 2 * params.greyBorderWidth)
        .attr('transform', function() {
          // shift up enough to show the entire border width
          var instOffset = params.svgDim.height - 3 * params.greyBorderWidth;
          return 'translate(0,' + instOffset + ')';
        });

      // add border to svg in four separate lines - to not interfere with clicking anything
      ///////////////////////////////////////////////////////////////////////////////////////
      // left border
      /*  d3.select('#main-svg')
          .append('rect')
          .attr('fill','#f5f5f5')
          .attr('width',  params.greyBorderWidth )
          .attr('height', params.svgDim.height )
          .attr('transform','translate(0,0)');

        // right border
        d3.select('#main-svg')
          .append('rect')
          .attr('fill','#f5f5f5')
          .attr('width',  params.greyBorderWidth )
          .attr('height', params.svgDim.height )
          .attr('transform', function(){
            var instOffset =  params.svgDim.width - params.greyBorderWidth ;
            return 'translate('+ instOffset +',0)';
          });

        // top border
        d3.select('#main-svg')
          .append('rect')
          .attr('fill','#f5f5f5')
          .attr('width', params.svgDim.width )
          .attr('height',  params.greyBorderWidth )
          .attr('transform', function(){
            var instOffset = 0 ;
            return 'translate('+ instOffset +',0)';
          });

        // bottom border
        d3.select('#main-svg')
          .append('rect')
          .attr('fill','#f5f5f5')
          .attr('width', params.svgDim.width )
          .attr('height',  params.greyBorderWidth )
          .attr('transform', function(){
            var instOffset =  params.svgDim.height - params.greyBorderWidth ;
            return 'translate(0,'+ instOffset +')';
          });
      */
      // initialize zoom and translate
      ///////////////////////////////////
      // initialize translate vector to compensate for label margins
      params.zoom.translate([params.clust.margin.left, params.clust.margin.top]);

      // resize window
      d3.select(window).on('resize', timeoutResize);

      // disable double-click zoom: double click should reset zoom level
      // do this for all svg elements
      d3.selectAll('svg').on('dblclick.zoom', null);

      // double click to reset zoom - add transition
      d3.select('#main-svg')
        .on('dblclick', function() {
          // apply the following two translate zoom to reset zoom
          // programatically
          twoTranslateZoom(0, 0, 1);
        });
    }


    // parentDiv: size and position svg container - svgDiv
    //////////////////////////////////////////////
    function parentDivSizePos(params) {

      if (params.resize === true) {
        // get outerMargins
        var outerMargins = params.outerMargins;

        // get the size of the window
        var screenWidth = window.innerWidth;
        var screenHeight = window.innerHeight;

        // define width and height of clustergram container
        var containerDim = {};
        containerDim.width = screenWidth - outerMargins.left -
          outerMargins.right;
        containerDim.height = screenHeight - outerMargins.top -
          outerMargins.bottom;

        // size the svg container div - svgDiv
        d3.select('#' + params.svgDivId)
          .style('margin-left', outerMargins.left + 'px')
          .style('margin-top', outerMargins.top + 'px')
          .style('width', containerDim.width + 'px')
          .style('height', containerDim.height + 'px');
      } else {
        // get outerMargins
        var outMargins = params.outerMargins;

        // size the svg container div - svgDiv
        d3.select('#' + params.svgDivId)
          .style('margin-left', outMargins.left + 'px')
          .style('margin-top', outMargins.top + 'px');
      }

    }

    //!! this needs to be improved
    //!! I will have to generalize this
    function highlightResourceTypes(params) {

      // var colNodes = d3Clustergram.networkData.colNodes;
      var rowNodes = d3Clustergram.networkData.rowNodes;

      // // This will set up the resource type color key
      // // and generate an array of genes for later use
      // //////////////////////////////////////////////////////

      // // resHexcodes = ['#097054','#FFDE00','#6599FF','#FF9900','#834C24','#003366','#1F1209']

      // var resHexcodes = ['#0000FF','#FF0000','#C0C0C0', '#FFA500'];

      // define cell line groups
      // var allGroups = ['TF group 1','TF group 2','TF group 3'];

      // var allGroups = lodash.keys(params.classColors.row);

      // // generate an object to associate group with color
      // var resColorDict = {};

      // // initialize the cell line color associations
      // var blueCl = ['H1437','H1792','HCC15','A549','H1944','H1299','H1355','H838','CAL-12T','H23','H460','H661'];
      // var redCl = ['H441','HCC78','H1734','H2228','H1781','H1975','H358','HCC827','H1703','H2342','H1650','LOU-NH91'];
      // var greyCl = ['CALU-3','H2405','H2106', 'HCC44','H1666'];
      // var orangeCl = [] //['HCC44','H1666'];

      // for (var i=0; i<colNodes.length;i++){
      //   // add blue cell line
      //   if ( angular.element.inArray(colNodes[i]['name'],blueCl) > -1 ){
      //     resColorDict[colNodes[i]['name']]=resHexcodes[0];
      //   };
      //   // add red cell line
      //   if ( angular.element.inArray(colNodes[i]['name'],redCl)  > -1 ){
      //     resColorDict[colNodes[i]['name']]=resHexcodes[1];
      //   };
      //   // add grey cell line
      //   if ( angular.element.inArray(colNodes[i]['name'],greyCl)  > -1 ){
      //     resColorDict[colNodes[i]['name']]=resHexcodes[2];
      //   };
      //   // add orange cell line
      //   if ( angular.element.inArray(colNodes[i]['name'],orangeCl)  > -1 ){
      //     resColorDict[colNodes[i]['name']]=resHexcodes[3];
      //   };
      // }

      // // export to global variable
      // params.resColorDict = resColorDict;

      // // define association between tf groups and colors
      // var resColorKey = {}
      // resColorKey['TF group 1'] = resHexcodes[0];
      // resColorKey['TF group 2'] = resHexcodes[1];
      // resColorKey['TF group 3'] = resHexcodes[2];
      // resColorKey['TF group 4'] = resHexcodes[3];

      // // add color key
      // ////////////////////
      // // add keys
      // var keyDivs = d3.select('#resColorKeyDiv')
      //   .selectAll('row')
      //   .data(allGroups)
      //   .enter()
      //   .append('row')
      //   .style('padding-top','15px');

      // // add color
      // keyDivs
      //   .append('div')
      //   .attr('class','col-xs-2')
      //   // get rid of excess padding
      //   .style('padding-left','5px')
      //   .style('padding-right','0px')
      //   .style('padding-top','1px')
      //   .append('div')
      //   .style('width','12px')
      //   .style('height','12px')
      //   .style('background-color', function(d){
      //     return params.classColors.row[d];
      //   })

      // // add names
      // keyDivs
      //   .append('div')
      //   .attr('class','col-xs-10 resNamesInKey')
      //   .append('text')
      //   .text(function(d){
      //     var instRes = d.replace(/_/g, ' ');
      //     return instRes ;
      //   })

      // generate a list of genes for auto complete
      ////////////////////////////////////////////////
      // get all genes
      params.allGenes = [];

      // loop through rowNodes
      lodash.each(rowNodes, function(node) {
        params.allGenes.push(node.name);
      });

      // use Jquery autocomplete
      ////////////////////////////////
      angular.element('#gene-search-box').autocomplete({
        source: params.allGenes
      });

      return params;
    }

    // make each row in the clustergram
    function rowFunction(rowData) {

      // remove zero values to make visualization faster
      var rData = lodash.filter(rowData, function(num) {
        return num.value !== 0;
      });

      // load parameters
      var params = d3Clustergram.params;

      // generate tiles in the current row
      var tile =
        d3
        .select(this)
        // data join
        .selectAll('rect')
        .data(rData)
        .enter()
        .append('rect')
        .attr('class', 'tile')
        .attr('transform', function(d) {
          return 'translate(' + params.xScale(d.posX) + ',0)';
        })
        .attr('width', params.xScale.rangeBand())
        .attr('height', params.yScale.rangeBand() * 0.98)
        .style('fill-opacity', function(d) {
          // calculate output opacity using the opacity scale
          var outputOpacity = params.opacityScale(Math.abs(d.value));
          return outputOpacity;
        })
        // switch the color based on up/dn value
        .style('fill', function(d) {
          return d.value > 0 ? params.tileColors[0] : params.tileColors[1];
        })
        .on('mouseover', function(p) {
          // highlight row - set text to active if
          d3.selectAll('.row-label-text text')
            .classed('active', function(d, i) {
              return i === p.posY;
            });
          d3.selectAll('.col-label-text text')
            .classed('active', function(d, i) {
              return i === p.posX;
            });
        })
        .on('mouseout', function mouseout() {
          d3.selectAll('text').classed('active', false);
        })
        .attr('title', function(d) {
          return d.value;
        });

      // add callback function to tile group - if one is supplied by the user
      if (typeof params.clickTile === 'function') {
        d3.selectAll('.tile')
          .on('click', function(d) {
            // export row/col name and value from tile
            var tileInfo = {};
            tileInfo.row = d3Clustergram.networkData.rowNodes[d.posY].name;
            tileInfo.col = d3Clustergram.networkData.colNodes[d.posX].name;
            tileInfo.value = d.value;
            // run the user supplied callback function
            params.clickTile(tileInfo);
          });
      }

      // append title to group
      if (params.titleTile === true) {
        tile
          .append('title')
          .text(function(d) {
            var instString = 'value: ' + d.value;
            return instString;
          });
      }
    }

    // make each row in the clustergram
    function rowGroupFunction(rowData) {

      // remove zero values to make visualization faster
      var rData = lodash.filter(rowData, function(num) {
        return num.value !== 0;
      });

      // load parameters
      var params = d3Clustergram.params;

      // generate groups
      var tile = d3.select(this)
        // data join
        .selectAll('g')
        .data(rData)
        .enter()
        .append('g')
        .attr('class', 'tile')
        .attr('transform', function(d) {
          return 'translate(' + params.xScale(d.posX) + ',0)';
        });

      // append rect
      tile
        .append('rect')
        // .attr('class','tile')
        .attr('width', params.xScale.rangeBand())
        .attr('height', params.yScale.rangeBand() * 0.98)
        .style('fill-opacity', function(d) {
          // calculate output opacity using the opacity scale
          var outputOpacity = params.opacityScale(Math.abs(d.value));
          if (Math.abs(d.valueUp) > 0 && Math.abs(d.valueDn) > 0) {
            outputOpacity = 0;
          }
          return outputOpacity;
        })
        // switch the color based on up/dn value
        .style('fill', function(d) {
          // // normal rule
          // return d.value > 0 ? params.tileColors[0] : params.tileColors[1] ;
          //!! special rule for LDRgram
          return d.valueDn < 0 ? params.tileColors[0] : params.tileColors[1];
        });

      tile
        .on('mouseover', function(p) {
          // highlight row - set text to active if
          d3.selectAll('.row-label-text text')
            .classed('active', function(d, i) {
              return i === p.posY;
            });
          d3.selectAll('.col-label-text text')
            .classed('active', function(d, i) {
              return i === p.posX;
            });
        })
        .on('mouseout', function mouseout() {
          d3.selectAll('text').classed('active', false);
        })
        .attr('title', function(d) {
          return d.value;
        });


      // // append evidence highlighting - black rects
      if (params.highlight === 1) {
        // console.log(rowData[0])
        tile
          .append('rect')
          .attr('width', params.xScale.rangeBand() * 0.80)
          .attr('height', params.yScale.rangeBand() * 0.80)
          .attr('class', 'highlighting-rect')
          .attr('transform', 'translate(' + params.xScale.rangeBand() / 10 +
            ' , ' + params.yScale.rangeBand() / 10 + ')')
          .attr('class', 'cell-highlight')
          .attr('stroke', 'black')
          .attr('stroke-width', 1.0)
          .attr('fill-opacity', 0.0)
          .attr('stroke-opacity', function(d) {
            // initialize opacity to 0
            var instOpacity = 0;
            // set opacity to 1 if there is evidence
            if (d.highlight === 1) {
              instOpacity = 1;
            }
            return instOpacity;
          });
      }

      // add callback function to tile group - if one is supplied by the user
      if (typeof params.clickTile === 'function') {
        // d3.selectAll('.tile')
        tile
          .on('click', function(d) {
            // export row/col name and value from tile
            var tileInfo = {};
            tileInfo.row = d3Clustergram.networkData.rowNodes[d.posY].name;
            tileInfo.col = d3Clustergram.networkData.colNodes[d.posX].name;
            tileInfo.value = d.value;
            // run the user supplied callback function
            params.clickTile(tileInfo);
          });
      }


      // split-up
      tile
        .append('path')
        .style('stroke', 'black')
        .style('stroke-width', 0)
        .attr('d', function() {
          var startX = 0;
          var finalX = params.xScale.rangeBand();
          var startY = 0;
          var finalY = params.yScale.rangeBand() - params.yScale.rangeBand() /
            60;
          var outputString = 'M' + startX + ',' + startY + ', L' +
            startX + ', ' + finalY + ', L' + finalX + ',0 Z';
          return outputString;
        })
        .style('fill-opacity', function(d) {
          // calculate output opacity using the opacity scale
          var outputOpacity = 0;
          if (Math.abs(d.valueDn) > 0) {
            outputOpacity = params.opacityScale(Math.abs(d.valueUp));
          }
          return outputOpacity;
        })
        // switch the color based on up/dn value
        .style('fill', function() {
          // rlT (released) blue
          return params.tileColors[0];
        });


      // split-dn
      tile
        .append('path')
        .style('stroke', 'black')
        .style('stroke-width', 0)
        .attr('d', function() {
          var startX = 0;
          var finalX = params.xScale.rangeBand();
          var startY = params.yScale.rangeBand() - params.yScale.rangeBand() /
            60;
          var finalY = params.yScale.rangeBand() - params.yScale.rangeBand() /
            60;
          var outputString = 'M' + startX + ', ' + startY + ' ,       L' +
            finalX + ', ' + finalY + ',  L' + finalX + ',0 Z';
          return outputString;
        })
        .style('fill-opacity', function(d) {
          // calculate output opacity using the opacity scale
          var outputOpacity = 0;
          if (Math.abs(d.valueUp) > 0) {
            outputOpacity = params.opacityScale(Math.abs(d.valueDn));
          }
          return outputOpacity;
        })
        // switch the color based on up/dn value
        .style('fill', function() {
          // rlF (not released) orange
          return params.tileColors[1];
        });

      // append title to group
      if (params.titleTile === true) {
        tile
          .append('title')
          .text(function(d) {
            // var instString = 'value: ' + d.value ;
            // specific to LDR
            var instString = 'Perturbagens: ' + d.value + '; released: ' + d.valueUp +
              '; not-released: ' + Math.abs(d.valueDn);
            return instString;
          });
      }
    }

    // reorder the matrix using the toggle switch
    function reorder(instOrder) {

      // load parameters from d3Clustergram
      var params = d3Clustergram.params;

      // set running transition value
      d3Clustergram.params.runTrans = 1;

      // load orders
      if (instOrder === 'clust') {
        params.xScale.domain(params.orders.clustRow);
        params.yScale.domain(params.orders.clustCol);
      } else if (instOrder === 'rank') {
        params.xScale.domain(params.orders.rankRow);
        params.yScale.domain(params.orders.rankCol);
      } else if (instOrder === 'class') {
        params.xScale.domain(params.orders.classRow);
        params.yScale.domain(params.orders.classCol);
      }

      // define the t variable as the transition function
      var t = params.clustGroup.transition().duration(2500);

      // reorder matrix
      t
        .selectAll('.row')
        .attr('transform', function(d, i) {
          return 'translate(0,' + params.yScale(i) + ')';
        })
        .selectAll('.tile')
        .attr('transform', function(d) {
          return 'translate(' + params.xScale(d.posX) + ' , 0)';
        });

      // Move Row Labels
      d3
        .select('#row-labels')
        .selectAll('.row-label-text')
        .transition().duration(2500)
        .attr('transform', function(d, i) {
          return 'translate(0,' + params.yScale(i) + ')';
        });

      // t.selectAll('.column')
      d3
        .select('#col-labels').selectAll('.col-label-text')
        .transition().duration(2500)
        .attr('transform', function(d, i) {
          return 'translate(' + params.xScale(i) + ')rotate(-90)';
        });

      // reorder rowLabelTriangle groups
      d3
        .selectAll('.row-triangle-group')
        .transition().duration(2500)
        .attr('transform', function(d, i) {
          return 'translate(0,' + params.yScale(i) + ')';
        });

      // reorder colClass groups
      d3
        .selectAll('.col-class-group')
        .transition().duration(2500)
        .attr('transform', function(d, i) {
          return 'translate(' + params.xScale(i) + ',0)';
        })
        .each('end', function() {
          // set running transition to 0
          d3Clustergram.params.runTrans = 0;
        });

      // backup allow programmatic zoom
      setTimeout(endReorder, 2500);

    }

    // tmp backup function to allow programmatic zoom after reordering
    function endReorder() {
      d3Clustergram.params.runTrans = 0;
    }

    // recalculate the size of the visualization
    // and remake the clustergram
    function resetVisualizationSize() {

      // remake the clustergram
      d3Clustergram.makeClust(d3Clustergram.params.args);

      // reset zoom and translate
      d3Clustergram.params.zoom.scale(1).translate([d3Clustergram.params.clust
        .margin.left, d3Clustergram.params.clust.margin.top
      ]);

      // // turn off the wait sign
      // angular.element.unblockUI();
    }

    // define zoomed function
    function zoomed() {

      // gather transformation components
      /////////////////////////////////////
      // gather zoom components
      var zoomX = d3.event.scale;
      var zoomY = d3.event.scale;

      // gather translate vector components
      var transX = d3.event.translate[0] - d3Clustergram.params.clust.margin
        .left;
      var transY = d3.event.translate[1] - d3Clustergram.params.clust.margin
        .top;

      // apply transformation: no transition duration when zooming with mouse
      applyTransformation(transX, transY, zoomX, zoomY);

      // reset highlighted col
      d3.select('#clicked-col')
        .style('font-weight', 'bold');
    }

    // apply transformation
    function applyTransformation(transX, transY, zoomX, zoomY) {

      // load parameters
      var params = d3Clustergram.params;

      // define d3 scale
      var d3Scale = zoomX;

      // y - rules
      ///////////////////////////////////////////////////
      // available panning room in the y direction
      // multiple extra room (zoom - 1) by the width
      // always defined in the same way
      var panRoomY = (d3Scale - 1) * params.clust.dim.height;

      // do not translate if translate in y direction is positive
      if (transY >= 0) {
        // restrict transformation parameters
        // no panning in either direction
        transY = 0;
      }
      // restrict y pan to panRoomY if necessary
      else if (transY <= -panRoomY) {
        transY = -panRoomY;
      }

      // x - rules
      ///////////////////////////////////////////////////
      // zoom in y direction only - translate in y only
      if (d3Scale < params.zoomSwitch) {
        // no x translate or zoom
        transX = 0;
        zoomX = 1;
      }
      // zoom in both directions
      // scale is greater than params.zoomSwitch
      else {
        // available panning room in the x direction
        // multiple extra room (zoom - 1) by the width
        var panRoomX = (d3Scale / params.zoomSwitch - 1) * params.clust.dim
          .width;

        // no panning in the positive direction
        if (transX > 0) {
          // restrict transformation parameters
          // no panning in the x direction
          transX = 0;
          // set zoomX
          zoomX = d3Scale / params.zoomSwitch;
        }
        // restrict panning to panRoomX
        else if (transX <= -panRoomX) {
          // restrict transformation parameters
          // no panning in the x direction
          transX = -panRoomX;
          // set zoomX
          zoomX = d3Scale / params.zoomSwitch;
        }
        // allow two dimensional panning
        else {
          // restrict transformation parameters
          // set zoomX
          zoomX = d3Scale / params.zoomSwitch;
        }
      }

      // apply transformation and reset translate vector
      // the zoom vector (zoom.scale) never gets reset
      ///////////////////////////////////////////////////
      // translate clustergram
      params.clustGroup
        .attr('transform', 'translate(' + [transX, transY] + ') scale(' +
          zoomX + ',' + zoomY + ')');

      // transform row labels
      d3.select('#row-labels')
        .attr('transform', 'translate(' + [0, transY] + ') scale(' + zoomY +
          ')');

      // transform rowLabelTriangles
      // use the offset saved in params, only zoom in the y direction
      d3.select('#row-label-triangles')
        .attr('transform', 'translate(' + [0, transY] + ') scale( 1,' +
          zoomY + ')');

      // transform col labels
      // move down col labels as zooming occurs, subtract transX - 20 almost works
      d3.select('#col-labels')
        .attr('transform', 'translate(' + [transX, 0] + ') scale(' + zoomX +
          ')');

      // transform colClass
      d3.select('#col-class')
        .attr('transform', 'translate(' + [transX, 0] + ') scale(' + zoomX +
          ',1)');

      // reset translate vector - add back margins to transX and transY
      params.zoom
        .translate([transX + params.clust.margin.left, transY + params.clust
          .margin.top
        ]);

      // Font Sizes
      ////////////////////////////////////////////////////////
      // reduce the font size by dividing by some part of the zoom
      // if reduceFontSizeFactor_ is 1, then the font will be divided by the whole zoom - and the labels will not increase in size
      // if reduceFontSizeFactor_ is 0, then the font will be divided 1 - and the labels will increase cuction of the font size
      var reduceFontSize =
        d3
        .scale
        .linear()
        .domain([0, 1])
        .range([1, zoomY])
        .clamp('true');
      // scale down the font to compensate for zooming
      var finFont = params.defaultFsRow / (reduceFontSize(params.reduceFontSize
        .row));
      // add back the 'px' to the font size
      finFont = finFont + 'px';
      // change the font size of the labels
      d3.selectAll('.row-label-text')
        .select('text')
        .attr('font-family', 'Avenir Next')
        .style('font-size', finFont);

      // reduce font-size to compensate for zoom
      // calculate the recuction of the font size
      var reduceFSize =
        d3
        .scale
        .linear()
        .domain([0, 1])
        .range([1, zoomX])
        .clamp('true');
      // scale down the font to compensate for zooming
      var fFont = params.defaultFsCol / (reduceFSize(params.reduceFSize.col));
      // add back the 'px' to the font size
      fFont = fFont + 'px';
      // change the font size of the labels
      d3.selectAll('.col-label-text')
        .select('text')
        .attr('font-family', 'Avenir Next')
        .style('font-size', fFont);


      // column value bars
      ///////////////////////

      if (lodash.has(d3Clustergram.networkData.colNodes[0], 'value')) {
        d3.selectAll('.col-bars')
          // column is rotated - effectively width and height are switched
          .attr('width', function(d) {
            return params.barScaleCol(d.value) / (zoomX);
          });
      }

      // //!! change the size of the highlighting rects
      // //////////////////////////////////////////////
      // // re-size of the highlighting rects
      // d3.select('#row-labels')
      //   .each(function(){
      //     // get the bounding box of the row label text
      //     var bbox = d3.select(this)
      //                  .select('text')[0][0]
      //                  .getBBox();
      //     // use the bounding box to set the size of the rect
      //     d3.select(this)
      //       .select('rect')
      //     .attr('x', bbox.x*0.5)
      //     .attr('y', 0)
      //     .attr('width', bbox.width*0.5)
      //     .attr('height', params.yScale.rangeBand())
      //     .style('fill','yellow');
      // });

      // // colLabelClick
      // d3.select('#col-labels')
      //   .each(function(){
      //     // get the bounding box of the row label text
      //     var bbox = d3.select(this)
      //                  .select('text')[0][0]
      //                  .getBBox();
      //     // use the bounding box to set the size of the rect
      //     d3.select(this)
      //       .select('rect')
      //     .attr('x', bbox.x*1.25)
      //     .attr('y', 0)
      //     .attr('width', bbox.width * 1.25)
      //     // used thd reduced rect width for the columsn
      //     // reduced because thee rects are slanted
      //     .attr('height', params.xScale.rangeBand()*0.6)
      //     .style('fill','yellow')
      //     .style('opacity',0);
      //   });
    }

    function twoTranslateZoom(panDx, panDy, finZoom) {

      // get parameters
      var params = d3Clustergram.params;

      if (d3Clustergram.params.runTrans === 0) {

        // define the commonly used variable halfHeight
        var halfHeight = params.clust.dim.height / 2;

        // y pan room, the pan room has to be less than halfHeight since
        // zooming in on a gene that is near the top of the clustergram also causes
        // panning out of the visible region
        var yPanRoom = ((halfHeight) / params.zoomSwitch);

        // prevent visualization from panning down too much
        // when zooming into genes near the top of the clustergram
        if (panDy >= halfHeight - yPanRoom) {

          // explanation of panning rules
          /////////////////////////////////
          // prevent the clustergram from panning down too much
          // if the amount of panning is equal to the halfHeight then it needs to be reduced
          // effectively, the the visualization needs to be moved up (negative) by some factor
          // of the half-width-of-the-visualization.
          //
          // If there was no zooming involved, then the
          // visualization would be centered first, then panned to center the top term
          // this would require a
          // correction to re-center it. However, because of the zooming the offset is
          // reduced by the zoom factor (this is because the panning is occurring on something
          // that will be zoomed into - this is why the panDy value is not scaled in the two
          // translate transformations, but it has to be scaled afterwards to set the translate
          // vector)
          // panDy = halfHeight - (halfHeight)/params.zoomSwitch

          // if panDy is greater than the pan room, then panning has to be restricted
          // start by shifting back up (negative) by halfHeight/params.zoomSwitch then shift back down
          // by the difference between halfHeight and panDy (so that the top of the clustergram is
          // visible)
          var shiftTopViz = halfHeight - panDy;
          var shiftUpViz = -halfHeight / params.zoomSwitch +
            shiftTopViz;

          // reduce panDy so that the visualization does not get panned to far down
          panDy = panDy + shiftUpViz;
        }

        // prevent visualization from panning up too much
        // when zooming into genes at the bottom of the clustergram
        if (panDy < -(halfHeight - yPanRoom)) {

          // console.log('restricting pan up')
          var shiftTopV = halfHeight + panDy;

          var shiftUpV = halfHeight / params.zoomSwitch - shiftTopV; //- moveUpOneRow;

          // reduce panDy so that the visualization does not get panned to far down
          panDy = panDy + shiftUpV;

        }

        // will improve this !!
        var zoomY = finZoom;
        var zoomX = 1;

        // search duration - the duration of zooming and panning
        var searchDuration = 700;

        // centerY
        var centerY = -(zoomY - 1) * halfHeight;

        // transform clust group
        ////////////////////////////
        params.clustGroup
          .transition()
          .duration(searchDuration)
          // first apply the margin transformation
          // then zoom, then apply the final transformation
          .attr('transform', 'translate(' + [0, 0 + centerY] + ')' +
            ' scale(' + 1 + ',' + zoomY + ')' + 'translate(' + [panDx,
              panDy
            ] + ')');

        // transform row labels
        d3.select('#row-labels')
          .transition()
          .duration(searchDuration)
          .attr('transform', 'translate(' + [0, centerY] + ')' + ' scale(' +
            zoomY + ',' + zoomY + ')' + 'translate(' + [0, panDy] + ')');

        // transform rowLabelTriangles
        // use the offset saved in params, only zoom in the y direction
        d3.select('#row-label-triangles')
          .transition()
          .duration(searchDuration)
          .attr('transform', 'translate(' + [0, centerY] + ')' + ' scale(' +
            1 + ',' + zoomY + ')' + 'translate(' + [0, panDy] + ')');

        // transform col labels
        d3.select('#col-labels')
          .transition()
          .duration(searchDuration)
          .attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [
            panDx, 0
          ] + ')');

        // transform colClass
        d3.select('#col-class')
          .transition()
          .duration(searchDuration)
          .attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [
            panDx, 0
          ] + ')');

        // set y translate: centerY is positive, positive moves the visualization down
        // the translate vector has the initial margin, the first y centering, and panDy
        // times the scaling zoomY
        var netYOffset = params.clust.margin.top + centerY + panDy * zoomY;

        // reset the zoom translate and zoom
        params.zoom.scale(zoomY);
        params.zoom.translate([panDx, netYOffset]);

        // Font Sizes
        /////////////////////////////////////////////////
        // reduce font-size to compensate for zoom
        // calculate the recuction of the font size
        var reduceFontSize =
          d3
          .scale
          .linear()
          .domain([0, 1])
          .range([1,
            zoomY
          ])
          .clamp('true');
        // scale down the font to compensate for zooming
        var finFont = params.defaultFsRow / (reduceFontSize(params.reduceFontSize
          .row));
        // add back the 'px' to the font size
        finFont = finFont + 'px';
        // change the font size of the labels
        d3.selectAll('.row-label-text')
          .transition()
          .duration(searchDuration)
          .select('text')
          .attr('font-family', 'Avenir Next')
          .style('font-size', finFont);

        // reduce font-size to compensate for zoom
        // calculate the recuction of the font size
        var reduceFSize =
          d3
          .scale
          .linear()
          .domain([0, 1])
          .range([1, zoomX])
          .clamp('true');
        // scale down the font to compensate for zooming
        var fFont = params.defaultFsCol / (reduceFSize(params.reduceFontSize
          .col));
        // add back the 'px' to the font size
        finFont = finFont + 'px';
        // change the font size of the labels
        d3.selectAll('.col-label-text')
          .transition()
          .duration(searchDuration)
          .select('text').attr('font-family', 'Avenir Next')
          .attr('font-family', 'Avenir Next')
          .style('font-size', fFont);

        // re-size of the highlighting rects
        /////////////////////////////////////////
        d3.select('#row-labels')
          .each(function() {
            // get the bounding box of the row label text
            var bbox = d3.select(this)
              .select('text')[0][0]
              .getBBox();

            // use the bounding box to set the size of the rect
            d3.select(this)
              .select('rect')
              .attr('x', bbox.x * 0.5)
              .attr('y', 0)
              .attr('width', bbox.width * 0.5)
              .attr('height', params.yScale.rangeBand())
              .style('fill', 'yellow');
          });


        // column value bars
        ///////////////////////
        // reduce the height of the column value bars based on the zoom applied
        // recalculate the height and divide by the zooming scale
        // colLabelObj.select('rect')
        if (lodash.has(d3Clustergram.networkData.colNodes[0], 'value')) {
          d3.selectAll('.col-bars')
            .transition()
            .duration(searchDuration)
            // column is rotated - effectively width and height are switched
            .attr('width', function(d) {
              return params.barScaleCol(d.value) / (zoomX);
            });
        }
      }
    }

    // reorder columns with row click
    function reorderClickRow() {

      // set running transition value
      d3Clustergram.params.runTrans = 1;

      // get parameters
      var params = d3Clustergram.params;

      // get rowNodes from global variable
      var rowNodes = d3Clustergram.networkData.rowNodes;
      var colNodes = d3Clustergram.networkData.colNodes;

      // get inst row (gene)
      var instGene = d3.select(this).select('text').text();

      // highlight clicked column
      // first un-highlight all others
      d3.selectAll('.rol-label-text').select('text').attr('font-family', 'Avenir Next')
        .style('font-weight', 'normal');
      // remove previous id
      d3.select('#clicked-row')
        .attr('id', '');

      // highlight current
      d3.select(this).select('text').attr('font-family', 'Avenir Next')
        .style('font-weight', 'bold')
        .attr('id', 'clicked-row');

      // find the row number of this term from rowNodes
      // gather row node names
      var tmpArr = [];
      lodash.each(rowNodes, function(node) {
        tmpArr.push(node.name);
      });

      // find index
      var instRow = lodash.indexOf(tmpArr, instGene);
      // gather the values of the input genes
      tmpArr = [];
      lodash.each(colNodes, function(node, colNodeIndex) {
        tmpArr.push(params.matrix[instRow][colNodeIndex].value);
      });

      // sort the rows
      var tmpSort =
        d3
        .range(tmpArr.length)
        .sort(function(a, b) {
          return tmpArr[b] - tmpArr[a];
        });

      // resort the columns (resort x)
      ///////////////////////////////////
      params.xScale.domain(tmpSort);

      // reorder
      ////////////////////

      // define the t variable as the transition function
      var t = params.clustGroup.transition().duration(2500);

      // reorder matrix
      t.selectAll('.tile')
        .attr('transform', function(d) {
          return 'translate(' + params.xScale(d.posX) + ',0)';
        });

      // Move Col Labels
      d3.select('#col-labels').selectAll('.col-label-text')
        .transition().duration(2500)
        .attr('transform', function(d, i) {
          return 'translate(' + params.xScale(i) + ')rotate(-90)';
        });


      // reorder colClass groups
      d3.selectAll('.col-class-group')
        .transition().duration(2500)
        .attr('transform', function(d, i) {
          return 'translate(' + params.xScale(i) + ',0)';
        })
        .each('end', function() {
          // set running transition to 0
          d3Clustergram.params.runTrans = 0;
        });

      // backup allow programmatic zoom
      setTimeout(endReorder, 2500);
    }

    // reorder rows with column click
    function reorderClickCol() {

      // set running transition value
      d3Clustergram.params.runTrans = 1;

      // get parameters
      var params = d3Clustergram.params;

      // get rowNodes from global variable
      var rowNodes = d3Clustergram.networkData.rowNodes;
      var colNodes = d3Clustergram.networkData.colNodes;

      // get inst col (term)
      var instTerm = d3.select(this).select('text').attr('full-name');

      // highlight clicked column
      // first un-highlight all others
      d3.selectAll('.col-label-text').select('text').attr('font-family', 'Avenir Next')
        .style('font-weight', 'normal');
      // remove previous id
      d3.select('#clicked-col')
        .attr('id', '');

      // highlight current
      d3.select(this).select('text').attr('font-family', 'Avenir Next')
        .style('font-weight', 'bold')
        .attr('id', 'clicked-col');

      // find the column number of this term from colNodes
      // gather column node names
      var tmpArr = [];
      lodash.each(colNodes, function(node) {
        tmpArr.push(node.name);
      });

      // find index
      var instCol = lodash.indexOf(tmpArr, instTerm);

      // gather the values of the input genes
      tmpArr = [];
      lodash.each(rowNodes, function(node, rowNodeIndex) {
        tmpArr.push(params.matrix[rowNodeIndex][instCol].value);
      });

      // sort the rows
      var tmpSort = d3.range(tmpArr.length).sort(function(a, b) {
        return tmpArr[b] - tmpArr[a];
      });

      // resort rows - y axis
      ////////////////////////////
      params.yScale.domain(tmpSort);

      // reorder
      // define the t variable as the transition function
      var t = params.clustGroup.transition().duration(2500);

      // reorder matrix
      t.selectAll('.row')
        .attr('transform', function(data, tIndex) {
          return 'translate(0,' + params.yScale(tIndex) + ')';
        });

      // reorder rowLabelTriangle groups
      d3.selectAll('.row-triangle-group')
        .transition().duration(2500)
        .attr('transform', function(rtd, rtIndex) {
          return 'translate(0,' + params.yScale(rtIndex) + ')';
        });

      // Move Row Labels
      d3.select('#row-labels').selectAll('.row-label-text')
        .transition().duration(2500)
        .attr('transform', function(rlD, rlIndex) {
          return 'translate(0,' + params.yScale(rlIndex) + ')';
        });

      // t.selectAll('.column')
      d3.select('#col-labels').selectAll('.col-label-text')
        .transition().duration(2500)
        .attr('transform', function(cld, clIndex) {
          return 'translate(' + params.xScale(clIndex) + ')rotate(-90)';
        })
        .each('end', function() {
          // set running transition to 0
          d3Clustergram.params.runTrans = 0;
        });

      // highlight selected column
      ///////////////////////////////
      // unhilight and unbold all columns (already unbolded earlier)
      d3.selectAll('.col-label-text')
        .select('rect')
        .style('opacity', 0);

      // highlight column name
      d3.select(this)
        .select('rect')
        .style('opacity', 1);

      // backup allow programmatic zoom
      setTimeout(endReorder, 2500);
    }

    // resize clustergram with screensize change
    var doit;

    function timeoutResize() {

      // get params
      var params = d3Clustergram.params;

      // only resize if allowed
      if (params.resize === true) {

        // clear timeout
        clearTimeout(doit);

        // // set up wait message before request is made
        // angular.element.blockUI({ css: {
        //         border: 'none',
        //         padding: '15px',
        //         backgroundColor: '#000',
        //         '-webkit-border-radius': '10px',
        //         '-moz-border-radius': '10px',
        //         opacity: .8,
        //         color: '#fff'
        //     } });

        doit = setTimeout(resetVisualizationSize, 500);

      }
    }

    // zoom into and highlight the found the gene
    function zoomAndHighlightFoundGene(searchGene) {

      // get parameters
      var params = d3Clustergram.params;

      // unhighlight and unbold all genes
      d3.selectAll('.row-label-text')
        .select('text')
        .attr('font-family', 'Avenir Next')
        .style('font-weight', 'normal');
      d3.selectAll('.row-label-text')
        .select('rect')
        .style('opacity', 0);

      // find the index of the gene
      var instGeneIndex = lodash.indexOf(params.allGenes, searchGene);

      // get y position
      var instYPos = params.yScale(instGeneIndex);

      // make row name bold
      d3.selectAll('.row-label-text')
        .filter(function(d) {
          return d.name === searchGene;
        })
        .select('text')
        .attr('font-family', 'Avenir Next')
        .style('font-weight', 'bold');
      // highlight row name
      d3.selectAll('.row-label-text')
        .filter(function(d) {
          return d.name === searchGene;
        })
        .select('rect')
        .style('opacity', 1);

      // calculate the y panning required to center the found gene
      var panDy = params.clust.dim.height / 2 - instYPos;

      // use two translate method to control zooming
      // panX, panY, zoom
      twoTranslateZoom(0, panDy, params.zoomSwitch);
    }

    // submit genes button
    angular.element('#gene-search-box').keyup(function(e) {
      if (e.keyCode === 13) {
        findRow();
      }
    });

    // find gene in clustergram
    function findRow() {
      // get the searched gene
      var searchGene = angular.element('#gene-search-box').val();

      if (d3Clustergram.params.allGenes.indexOf(searchGene) !== -1) {
        // zoom and highlight found gene
        zoomAndHighlightFoundGene(searchGene);
      }
    }

    function transposeNetwork(network) {
      var tnet = {};
      tnet.rowNodes = network.colNodes;
      tnet.colNodes = network.rowNodes;
      tnet.links = [];

      lodash.each(network.links, function(link) {
        var instLink = {};
        instLink.source = link.target;
        instLink.target = link.source;
        instLink.value = link.value;

        // optional highlight
        if (lodash.has(link, 'highlight')) {
          instLink.highlight = link.highlight;
        }
        if (lodash.has(link, 'valueUp')) {
          instLink.valueUp = link.valueUp;
        }
        if (lodash.has(link, 'valueDn')) {
          instLink.valueDn = link.valueDn;
        }
        tnet.links.push(instLink);
      });
      return tnet;
    }

    return {
      makeClust: makeD3Clustergram,
      reorder: reorder,
      findRow: findRow
    };
  }
})();
