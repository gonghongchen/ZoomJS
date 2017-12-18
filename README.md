# ZoomJS——缩放元素

使用方式：

css：

```css
.zoomEle-point {	/*小圆点的样式*/
	position: absolute;
	left: -4px;
	top: -4px;
	z-index: 9;
	display: none;
	width: 8px;
	height: 8px;
	border-radius: 99px;
	background-color: #fc6074;
	overflow: hidden;
}
```

JavaScript：

```javaScript
new Zoom({
    ele : , //被缩放的元素，必选。
    edgeEle //边界元素，控制被缩放元素的缩放范围，可选，默认为其父级元素。
});
```
在页面中通过【双击鼠标左键添加/移除】缩放功能，可在代码中更改。

注：

1.文件【zoom.js】是基于ES6编写的源文件；

2.文件【zoom(ES5).min.js】是转换为ES5后且压缩过的文件，IE兼容到9+(暂时edge，9+有点小BUG)。

DEMO：https://gonghongchen.github.io/ZoomJS/
