# ViewTransition

受控的两端 CSS transition。调用方提供内容、容器和样式；primitive 负责端点测量、阶段、参与者和清理。动画使用 CSS，`getAnimations()` / `finished` 只用于观察完成；不通过 JavaScript 创建或播放动画。

## API

| 部分                         | 参数和职责                                                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Root`                       | `active`、`from`、`to`、`data?`、`disabled?`、`onStatusChange(status, details)`；桥接 React 状态提交，无 DOM。                                                |
| `Target`                     | `targetKey`、`isReady(element)?`；注册实际端点，支持 Base UI 的 `render`、ref 和 DOM props。                                                                  |
| `Preview`                    | `container` / `container(context)`、`getEstimatedRect(parent, context)?`、`children(context)`；渲染每对端点的过渡副本，只等待 Preview 自身的 CSS transition。 |
| `useViewTransition()`        | 当前 `active`、`status`、全部 `transitions`，以及 `getTarget(key)`、`canTransition(from, to)`。                                                               |
| `useViewTransitionActions()` | `refresh()`；不订阅动画阶段，供布局容器通知位置变化。                                                                                                         |

`active=false` 停在 `from`，`active=true` 停在 `to`。只有提交的 active 变化启动过渡；初次挂载直接显示现状，仅切换端点则取消当前运动并直接显示新内容。from/to 是注册 key，或未选择内容时的 null。React 的 key 不会传入组件，因此 DOM 注册用 targetKey。

Target 的就绪由调用方决定；默认就绪。轮播图片使用 `complete && naturalWidth > 0`，占位尺寸不代表图片已显示。Target 的 load 事件通知刷新；自定义内容变化可调用 refresh。刷新不能复活已结束的运动。

`Root.disabled` 让当前状态直接生效，取消当前运动且不创建 Preview；恢复为 false 不会补播已跳过的过渡。是否禁用由调用方决定。

## 运动与方向方案

一个端点对拥有一份稳定的 Preview DOM、内容 data 快照、基准尺寸和已发布的端点坐标。反向时保留这些信息；A 关闭时打开 B，则创建独立的运动，A 继续完成。

每次打开或关闭只尝试两端之间的几何过渡：有可用来源及真实或估算终点才开始。缺少任意一端时以 `skipped` 结束，不创建仅淡入或淡出的 Preview；普通显隐由调用方负责。

反向时，已有 Preview 可以作为视觉来源，不要求它原来的 DOM 端点仍在。估算只用于存在视觉来源的情况。正在运动或反向时若失去真实终点则以 `cancelled` 结束，不改成淡出，也不从真实目标退回估算。

参与者在本方向开始时确定。估算终点可以被真实测量替代；已经跳过、完成或取消的过渡停止观察，目标迟到不会重新启动动画。调用方可通过 `onStatusChange` 的 `reason === "skipped"` 选择普通显隐，并保持这个决定直到下一次打开或关闭。

`transitions` 包含 `id`、`active`、实际运动方向的 `from/to`、`data`、`status` 和 `participants`。首次准备阶段参与者为空；反向衔接时保留已有参与者，避免端点及装饰元素短暂恢复显示。Target 的 `data-transition-source`、`data-transition-target`、`data-transition-covered` 从参与者推导，不根据之后是否挂载重新决定覆盖。

Target 在起始阶段同时提供 `data-starting-style`，供端点内的装饰元素同步过渡。Preview 提供 `data-status`、`data-active`、`data-starting-style`；context 含 active、from/to、data、status。

## 提交与执行顺序

1. Root 在 `getSnapshotBeforeUpdate` 读取来源，暂存需要移动的 Preview；不读取 Preview 的动画中间值。
2. React 提交业务状态和目标侧容器。
3. motion 在合并后的微任务中解析 container、放置 Preview、测量终点并确认两端可用。container 回调读取已提交的 DOM，不需要另建容器注册表。
4. 首次运动发布 starting 并读取初始样式，随后发布 transitioning。反向直接改写终点，不重建 DOM 或重放 starting。
5. 只读观察当前 CSS transitions；完成或取消时清理 Preview、观察器和覆盖状态。

`MotionPreview` 在同一个组件内订阅状态、渲染内容并管理 Portal，通过一份布局输入登记 DOM、移动容器和估算配置，卸载时一起释放；几何渲染不反向触发测量。运行中的 session 包含阶段，清空 session 即 idle。Root 引用同一份 session，但仅在阶段与参与者变化时通知订阅者，几何变化只通知本运动的 Preview。没有固定帧数等待、CSS 时长推算或完成兜底计时器。

## 定位与 CSS

调用方提供同文档内、已连接且有布局的定位父容器，Preview 设置 absolute。内部坐标层归 primitive 管理，Portal 内的内容归 React 管理。支持 moveBefore 时原生移动坐标层，同时校准坐标系，保留子元素的 CSS transition 历史。不支持时交互入口通过 canTransition 忽略同一端点对的打断；强制提交的受控状态仍生效，但跳过动画。

真实端点返回视口坐标；getEstimatedRect 返回定位父容器的内容坐标。换算包含滚动、边框和轴向缩放。旋转、倾斜、透视包含块不在支持范围。端点完全离开视口或祖先裁剪区域时视为缺失；部分可见则使用完整矩形，裁剪由真实容器负责。

CSS 变量：

- `--vt-x/y`：当前端点的局部位置。
- `--vt-base-width/height`：跨反向保持不变的布局尺寸。
- `--vt-scale-x/y`：当前尺寸相对于基准的比例。
- `--vt-from-scale-x/y`：Root 配置的 from 端点相对基准的比例，可用于圆角补偿。

```css
.target[data-transition-covered] {
	opacity: 0;
}
.preview {
	position: absolute;
	left: 0;
	top: 0;
	width: var(--vt-base-width);
	height: var(--vt-base-height);
	translate: var(--vt-x) var(--vt-y);
	scale: var(--vt-scale-x) var(--vt-scale-y);
	transform-origin: 0 0;
	transition:
		translate 200ms ease,
		scale 200ms ease;
}
.preview[data-status="preparing"] {
	visibility: hidden;
}
.preview[data-starting-style] {
	transition: none;
}
@media (prefers-reduced-motion: reduce) {
	.preview {
		transition: none;
	}
}
```

## 虚拟列表接入

Preview 的定位容器放在滚动内容中，与虚拟项同级。几何运动消费虚拟项的 start/size，不等待虚拟项 DOM；未加载时允许视口估算。缺少端点时直接跳过，因此无需维护单端淡出的容器位置。

完整滚动内容上的裁剪层避免 Preview 扩大滚动范围；不能用居中的窄消息列裁剪它。容器放置、估算、Query 缓存和主动滚动都归调用方，primitive 不依赖 TanStack Virtual。

## 内部职责

- `controller`：注册端点、按稳定端点对路由运动、公开状态。
- `motion`：保存本对端点的 CSS 历史；start 确认两端和参与者，updateDestination 只更新几何终点，finish 清理。
- `geometry`、`preview-transport`、`observe-transitions`：坐标计算、DOM 移动、CSS 完成观察。
- `store`：订阅快照；`Target/Preview`：登记与渲染。

Preview 默认 inert、aria-hidden。内容资源的取得与释放由接入方处理；轮播只保存图片的 src 和固有尺寸快照，继续使用原有的文件解析与释放机制。复杂组件同样应由调用方管理其展示快照和资源，不自动克隆业务状态。
