/**
 * Created by asus1 on 2015/7/28.
 */
var FILENAME = "tree.json";
var data = {};
var SVGNS = "http://www.w3.org/2000/svg";
var width = 1280, height = 800;
var marginx = 100, marginy = 20;
var container = getContainer();
var maxPosition = [];
$.getJSON(FILENAME,function(d){
    data.name = d.name;
    data.children = d.children;
    initializeState(data,true);
    drawTree();
});


function getContainer(){
    var body = document.getElementsByTagName("body");
    var svg = document.createElementNS(SVGNS,"svg");
    var container = document.createElementNS(SVGNS,"g");
    svg.setAttribute("height",height);
    svg.setAttribute("width",width);
    body[0].appendChild(svg);
    container.setAttribute('transform','translate('+marginx+','+marginy+')');
    svg.appendChild(container);
    return container;
}

function initializeState(data,state){
    var i;
    data.state = state;
    if(data.children!=null){
        for(i=0;i<data.children.length;i++){
            initializeState(data.children[i],false);
        }
    }
}

function drawTree(){
    var maxmin = {};
    var distancey;
    var distancex = 200;
    for(var i =0;i<maxPosition.length;i++){
        maxPosition[i] = null;
    }
    deleteNode();
    updatePosition(data,0,0);
    maxmin.max = data.position;
    maxmin.min = data.position;
    findMaxMin(data,maxmin);
    distancey = (height-2*marginy) /(maxmin.max - maxmin.min);
    drawNode(data,0,maxmin,distancey,distancex,null);
}

function deleteNode(){
    container.innerHTML = "";
}

function updatePosition(data,height,init){
    var maxP,minP;
    if(data.children == null||data.state == false){
        data.position = getMax(maxPosition[height],init);
        maxPosition[height] = data.position;
    }
    else{
        for(var i = 0;i<data.children.length;i++){
            var v = updatePosition(data.children[i],height+1,
                init-(data.children.length-1)/2+i);
            if(i==0){
                minP = v;
            }else if(i==data.children.length-1){
                maxP = v;
            }
        }
        data.position = (minP+maxP)/2;
    }
    return data.position;
}

function getMax(maxPos,init){
    if(maxPos == null){
        return init;
    }else{
        return Math.max(maxPos+1,init);
    }
}

function findMaxMin(data,maxmin){
   if(data.children!=null && data.state == true)
    {
        for(i=0;i<data.children.length;i++){
            findMaxMin(data.children[i],maxmin);
        }
    }
    maxmin.max = Math.max(data.position,maxmin.max);
    maxmin.min = Math.min(data.position,maxmin.min);
}

function drawNode(data,height,maxmin,distancey,distancex,position){
    if(data.children!=null&&data.state==true){
        for(var i=0;i<data.children.length;i++){
            drawNode(data.children[i],height+1,maxmin,distancey,distancex,data.position);
        }
    }
    if(height!=0){
        var link = document.createElementNS(SVGNS,"path");
        link.setAttribute("class","link");
        link.setAttribute("d","M"+(height-1)*distancex+","+(position-maxmin.min)*distancey
            +"L"+height*distancex+","+(data.position-maxmin.min)*distancey);
        container.appendChild(link);
    }
    var node = document.createElementNS(SVGNS,"g");
    node.setAttribute("transform","translate("+height*distancex+","
        +(data.position-maxmin.min)*distancey+")");
    node.setAttribute("class","node");
    container.appendChild(node);
    var circle = document.createElementNS(SVGNS,"circle");
    var text = document.createElementNS(SVGNS,"text");
    circle.setAttribute("cx",0);
    circle.setAttribute("cy",0);
    circle.setAttribute("r",6);
    circle.treeNode = data;
    if(circle.children!=null) {
        circle.addEventListener('click', function (e) {
            var node = this.treeNode;
            if (node.children == null || node.state == false) {
                node.state = true;
            }
            else {
                node.state = false;
            }
            drawTree();
            return true;
        });
    }
    node.appendChild(circle);
    if(data.children==null||(data.children!=null&&data.state==true)){
        text.setAttribute("text-anchor","end");
        text.setAttribute("transform","translate(-7,3)");
        circle.style.fill = "rgb(255,255,255)";
    }else{
        text.setAttribute("text-anchor","start");
        text.setAttribute("transform","translate(7,3)");
        circle.style.fill = "rgb(127,127,127)";
    }
    text.innerHTML = data.name;
    node.appendChild(text);
}