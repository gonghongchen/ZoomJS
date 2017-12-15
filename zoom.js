class Zoom {
	constructor({
		ele = this.throwError("ele"),	//必须传入参数【ele】，表示可缩放的对象
		edgeEle = ele.parentElement		//限制缩放的边界元素，可选，默认为移动元素的父级元素
	}) {
		this.ele = ele;		//可缩放的元素
		this.edgeEle = edgeEle;
		this.widthHeight = [ele.clientWidth, ele.clientHeight];	//此元素的宽高
		this.pointsArr = null;	//可操作的八个点：左上、上中、右上、左中、右中、左下、下中、右下。
		this.isZoom = false;	//当前是否处于可缩放状态
		this.havePoints = false;
		
		this.init();
	}
	throwError(para) {
		/*
		 * @description 抛出空参数错误
		 * @parameter {string} para 
		 */
		throw new Error("parameter " + para + " can not be empty!");
	}
	init() {
		let ele = this.ele,
			edgeEle = this.edgeEle;
		
		if (ele.parentElement !== edgeEle) {	//由于直接设置元素的left、top的值会受限于其父级元素，故当设置的边界元素不是该元素的父级元素的时候就必须更改该元素的实际DOM位置方可实现完整效果
			edgeEle.appendChild(ele);
			edgeEle.style.position = "relative";
		}
		
		ele.addEventListener("dblclick", () => {	//给该元素添加双击事件——添加/移除缩放功能
			if (!this.havePoints) {
				this.createPoints();	//创建小圆点
				this.havePoints = true;
			}
			if (this.isZoom) {
				this.pointsArr.forEach((item) => {
					item.style.display = "none";
				});
				this.isZoom = false;
			} else{
				this.pointsArr.forEach((item) => {
					item.style.display = "inline-block";
				});
				this.isZoom = true;
			}
		}, false);
		
		ele = edgeEle = null;
	}
	createPoints() {
		let span = document.createElement("span"),
			pointsArr = [],
			i = 0;
			
		span.className = "zoomEle-point";
		do {
			pointsArr.push(span.cloneNode(true));
		} while(++i < 8)
		
		this.pointsArr = pointsArr;
		
		this.addPoints(pointsArr);
		
		span = pointsArr = null;
	}
	setPointsPosition() {
		//获取各个圆点的左、上位置的值，依次为：left, top
		const pointWidth = 8,	//圆点宽度，高度一样
			[eleWidth, eleHeight] = this.widthHeight,
			positions = [
				[-(pointWidth / 2), -(pointWidth / 2)],
				[(eleWidth - pointWidth) / 2, -(pointWidth / 2)],
				[eleWidth - (pointWidth / 2), -(pointWidth / 2)],
				[-(pointWidth / 2), (eleHeight - pointWidth) / 2],
				[eleWidth - (pointWidth / 2), (eleHeight - pointWidth) / 2],
				[-(pointWidth / 2), eleHeight - (pointWidth / 2)],
				[(eleWidth - pointWidth) / 2, eleHeight - (pointWidth / 2)],
				[eleWidth - (pointWidth / 2), eleHeight - (pointWidth / 2)],
			];
		
		this.pointsArr.forEach((item, i) => {
			item.style.left = positions[i][0] + "px";
			item.style.top = positions[i][1] + "px";
		});
	}
	addPoints(pointsArr) {
		let ele = this.ele,
			cursors = ["nw-resize", "n-resize", "ne-resize", "w-resize", "e-resize", "sw-resize", "s-resize", "se-resize"];	//光标样式
		
		this.setPointsPosition();
		
		pointsArr.forEach((item, i) => {	//设置圆点样式并添加到元素中去
			item.style.cursor = cursors[i];
			ele.appendChild(item);
		});
		
//		ele.style.border = "1px solid #9C27B0";
		
		this.handlePoints(pointsArr);
		
		ele = pointsArr = null;
	}
	handlePoints(pointsArr) {
		const that = this,
			ele = this.ele,
			mouseDown = (event, point) => {
				let e = event,
					doc = document,
					initPoint = [e.clientX, e.clientY],	//记录下鼠标按下时光标的位置
					[initWidth, initHeight] = that.widthHeight,	//获取宽度、高度初始值
					edgeEle = this.edgeEle,
					[edgeEleWidth, edgeEleHeight] = [edgeEle.clientWidth, edgeEle.clientHeight],	//以此元素的父元素为基准进行计算此元素在某些放大情况下的最大宽度、高度。
					[maxWidth, maxHeight] = [initWidth, initHeight],	//初始化最大宽度、高度
					initProportion = parseFloat((initWidth / initHeight).toFixed(2)),  //初始宽高比
					mouseMove = (point, maxWidth, maxHeight, event) => {
						let e = event,
							[nowWidth, nowHeight] = function(e, i) {	//实时计算当前的宽、高的值。
								switch(i) {
									case 0 :
										return [initPoint[0] - e.clientX + initWidth, initPoint[1] - e.clientY + initHeight];
									case 1 :
										return [initWidth, initPoint[1] - e.clientY + initHeight];
									case 2 :
										return [e.clientX - initPoint[0] + initWidth, initPoint[1] - e.clientY + initHeight];
									case 3 :
										return [initPoint[0] - e.clientX + initWidth, initHeight];
									case 4 :
										return [e.clientX - initPoint[0] + initWidth, initHeight];
									case 5 :
										return [initPoint[0] - e.clientX + initWidth, e.clientY - initPoint[1] + initHeight];
									case 6 :
										return [initWidth, e.clientY - initPoint[1] + initHeight];
									case 7 :
										return [e.clientX - initPoint[0] + initWidth, e.clientY - initPoint[1] + initHeight];
								}
							}(e, point);
							
						if ([0, 2, 5, 7].includes(point)) {		//四个顶点为等比缩放功能
							if (nowWidth >= maxWidth) {		//当当前宽度已经达到最大值的时候直接计算高度
								nowHeight = maxWidth / initProportion;
							} else if (nowHeight >= maxHeight) {	//当当前高度已经达到最大值的时候直接计算宽度
								nowWidth = maxHeight * initProportion;
							} else {	//否则以变动较大的那个方向为准去等比改变另一个方向的值。
								let widthToHeight = parseFloat((nowWidth / initProportion).toFixed(2)),
									heightToWidth = nowHeight * initProportion;
								(Math.abs(widthToHeight - nowHeight) > Math.abs(heightToWidth - nowWidth)) ? nowWidth = heightToWidth : nowHeight = widthToHeight;
							}
						}
						
						nowWidth = nowWidth > 20 ? (nowWidth > maxWidth ? maxWidth : nowWidth) : 20;	//做宽、高的最大最小的限制
						nowHeight = nowHeight > 20 ? (nowHeight > maxHeight ? maxHeight : nowHeight) : 20;
						
//						if ([0, 2, 5, 7].includes(point)) {	//最小化控制
//							if (nowWidth === 20) {
//								nowHeight = 20 / initProportion;
//							} else if (nowHeight === 20) {
//								nowWidth = 20 * initProportion;
//							}
//						}
						
						that.widthHeight = [nowWidth, nowHeight];
						
						that.setPointsPosition();
						
						that.ele.style.width = nowWidth + "px";
						that.ele.style.height = nowHeight + "px";
					};
				
				e.preventDefault();
				
				switch (point) {	//重新根据当前拖动的点定义【left, top, right, bottom】的值，以保证效果。并设置各个情况下最大的宽度、高度值
					case 0 : 
						ele.style.right = edgeEle.clientWidth - (ele.offsetLeft + ele.offsetWidth) + "px";
						ele.style.bottom = edgeEle.clientHeight - (ele.offsetTop + ele.offsetHeight) + "px";
						ele.style.left = "unset";
						ele.style.top = "unset";
						
						maxWidth = initWidth + ele.offsetLeft;
						maxHeight = initHeight + ele.offsetTop;
						
						break;
					case 1 : 
						ele.style.bottom = edgeEle.clientHeight - (ele.offsetTop + ele.offsetHeight) + "px";
						ele.style.top = "unset";
						
						maxHeight = initHeight + ele.offsetTop;
						
						break;
					case 2 : 
						ele.style.left = ele.offsetLeft + "px";
						ele.style.bottom = edgeEle.clientHeight - (ele.offsetTop + ele.offsetHeight) + "px";
						ele.style.top = "unset";
						ele.style.right = "unset";
						
						maxWidth = edgeEleWidth - ele.offsetLeft;
						maxHeight = initHeight + ele.offsetTop;
						
						break;
					case 3 : 
						ele.style.right = edgeEle.clientWidth - (ele.offsetLeft + ele.offsetWidth) + "px";
						ele.style.left = "unset";
						
						maxWidth = initWidth + ele.offsetLeft;
						
						break;
					case 4 : 
						ele.style.left = ele.offsetLeft + "px";
						ele.style.right = "unset";
						
						maxWidth = edgeEleWidth - ele.offsetLeft;
						
						break;
					case 5 : 
						ele.style.top = ele.offsetTop + "px";
						ele.style.right = edgeEle.clientWidth - (ele.offsetLeft + ele.offsetWidth) + "px";
						ele.style.left = "unset";
						ele.style.bottom = "unset";
						
						maxWidth = initWidth + ele.offsetLeft;
						maxHeight = edgeEleHeight - ele.offsetTop;
						
						break;
					case 6 : 
						ele.style.top = ele.offsetTop + "px";
						ele.style.bottom = "unset";
						
						maxHeight = edgeEleHeight - ele.offsetTop;
						
						break;
					case 7 : 
						ele.style.left = ele.offsetLeft + "px";
						ele.style.top = ele.offsetTop + "px";
						ele.style.right = "unset";
						ele.style.bottom = "unset";
						
						maxWidth = edgeEleWidth - ele.offsetLeft;
						maxHeight = edgeEleHeight - ele.offsetTop;
						
						break;
				}
				
				const mouseMoveEvent = (event) => {	//由于【removeEventListener】只能添加确定的函数才能生效，过这里多定义了一个函数。且【event】为必传参数，防止移动事件发生时移动事件里面的【event】不存在或者与点击事件里面的【event】一样了。
					mouseMove(point, maxWidth, maxHeight, event);
				};
				
				doc.addEventListener("mousemove", mouseMoveEvent, false);	//将鼠标的拖动事件添加到【document】对象上面以防止光标移动过快时出现效果不好的情况
				doc.addEventListener("mouseup", () => {
					doc.removeEventListener("mousemove", mouseMoveEvent, false);
				}, false);
			};
		
		pointsArr.forEach((item, i) => {	//给各个小圆点添加按下事件
			item.addEventListener("mousedown", (event) => {
				mouseDown(event, i);
				event.stopPropagation();	//阻止事件向上冒泡，避免影响被缩放的元素上面绑定的其它事件
			}, false);
		});
		
		pointsArr = null;
	}
}
