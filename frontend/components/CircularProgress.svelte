<script lang="ts">
export let progress: number

$: progressPath = () => {
	if (progress <= 0) {
		return ""
	} else if (progress >= 1) {
		return "M50,5A45 45 0 1 1 49.9999 5"
	} else {
		const angle = Math.PI * 2 * progress
		const x = 50 + Math.cos(angle - Math.PI / 2) * 45
		const y = 50 + Math.sin(angle - Math.PI / 2) * 45
		let path = "M50,5"
		if (angle > Math.PI) {
			path += "A45 45 0 0 1 50 95"
		}
		path += `A45 45 0 0 1 ${x} ${y}`
		return path
	}
}
</script>

<div class="progress">
	<svg viewBox="-10 -10 120 120">
		<path d="M50,5A45 45 0 1 1 49.9999 5" />
		<path d={progressPath()} />
	</svg>
	<span class="text">
		<span class="label">
			<slot {progress} />
		</span>
		<span class="percentage">{~~(progress * 100)}%</span>
	</span>
</div>

<style>
.progress {
	position: relative;
}
svg {
	fill: transparent;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	/* transform: scale(0.6); */
	position: absolute;
	stroke-linecap: round;
}
svg path {
	transition: 0.2s ease;
}
path:first-child {
	stroke: var(--ortforange-light);
	stroke-width: 0.5rem;
}
path:last-child {
	stroke: var(--ortforange);
	stroke-width: 0.75rem;
}

.text {
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.text span {
	animation: flow-gradient 5s ease-in-out infinite;
	background: linear-gradient(
		-60deg,
		var(--black),
		var(--ortforange),
		var(--ortforange-light)
	);
	background-size: 300%;

	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.text .percentage {
	font-family: var(--mono);
	font-size: 3em;
}

@keyframes flow-gradient {
	from {
		background-position: 0 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	to {
		background-position: 0 50%;
	}
}
</style>
