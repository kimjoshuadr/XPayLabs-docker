<template>
  <div
    ref="imageWrapperRef"
    class="image-wrapper"
    @wheel="handleMouseWheel"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
    @dblclick="resetTransform"
    :style="transformStyle"
  >
    <el-card class="box-card">
      <el-image :src="props.imgUrl" class="scalable-image" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// Change in Props definition method
const props = defineProps({
  imgUrl: {
    type: String,
    default: () => ''
  }
});

const imageWrapperRef = ref<HTMLElement | null>(null);
const scale = ref(1); // Initial zoom scale
const maxScale = 3; // Maximum zoom ratio
const minScale = 0.5; // Minimum zoom scale

let isDragging = false;
let startX = 0;
let startY = 0;
let currentTranslateX = 0;
let currentTranslateY = 0;

const handleMouseWheel = (event: WheelEvent) => {
  event.preventDefault();
  let newScale = scale.value - event.deltaY / 1000;
  newScale = Math.max(minScale, Math.min(newScale, maxScale));
  if (newScale !== scale.value) {
    scale.value = newScale;
    resetDragPosition(); // Reset drag position to center the image
  }
};

const handleMouseDown = (event: MouseEvent) => {
  if (scale.value > 1) {
    event.preventDefault(); // Prevent default behavior to avoid dragging
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
  }
};

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging || !imageWrapperRef.value) return;

  const deltaX = event.clientX - startX;
  const deltaY = event.clientY - startY;
  startX = event.clientX;
  startY = event.clientY;

  currentTranslateX += deltaX;
  currentTranslateY += deltaY;

  // Boundary detection to prevent the image from being dragged out of the container
  const bounds = getBounds();
  if (currentTranslateX > bounds.maxTranslateX) {
    currentTranslateX = bounds.maxTranslateX;
  } else if (currentTranslateX < bounds.minTranslateX) {
    currentTranslateX = bounds.minTranslateX;
  }

  if (currentTranslateY > bounds.maxTranslateY) {
    currentTranslateY = bounds.maxTranslateY;
  } else if (currentTranslateY < bounds.minTranslateY) {
    currentTranslateY = bounds.minTranslateY;
  }

  applyTransform();
};

const handleMouseUp = () => {
  isDragging = false;
};

const handleMouseLeave = () => {
  isDragging = false;
};

const resetTransform = () => {
  scale.value = 1;
  currentTranslateX = 0;
  currentTranslateY = 0;
  applyTransform();
};

const resetDragPosition = () => {
  currentTranslateX = 0;
  currentTranslateY = 0;
  applyTransform();
};

const applyTransform = () => {
  if (imageWrapperRef.value) {
    imageWrapperRef.value.style.transform = `translate(${currentTranslateX}px, ${currentTranslateY}px) scale(${scale.value})`;
  }
};

const getBounds = () => {
  if (!imageWrapperRef.value) return { minTranslateX: 0, maxTranslateX: 0, minTranslateY: 0, maxTranslateY: 0 };

  const imgRect = imageWrapperRef.value.getBoundingClientRect();
  const containerRect = imageWrapperRef.value.parentElement?.getBoundingClientRect() ?? imgRect;

  const minTranslateX = (containerRect.width - imgRect.width * scale.value) / 2;
  const maxTranslateX = -(containerRect.width - imgRect.width * scale.value) / 2;
  const minTranslateY = (containerRect.height - imgRect.height * scale.value) / 2;
  const maxTranslateY = -(containerRect.height - imgRect.height * scale.value) / 2;

  return { minTranslateX, maxTranslateX, minTranslateY, maxTranslateY };
};

const transformStyle = computed(() => ({
  transition: isDragging ? 'none' : 'transform 0.2s ease'
}));
</script>

<style scoped>
.image-wrapper {
  width: 100%;
  overflow: hidden;
  position: relative;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none; /* Disable text selection */
  cursor: grab; /* Set initial mouse cursor to draggable */
}

.image-wrapper:active {
  cursor: grabbing; /* Change mouse cursor while dragging */
}

.scalable-image {
  object-fit: contain;
  width: 100%;
  padding: 15px;
}
</style>
