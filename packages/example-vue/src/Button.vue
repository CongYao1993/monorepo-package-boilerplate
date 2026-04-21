<template>
  <button class="example-vue-btn">{{ label }}</button>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true
  }
})
</script>


