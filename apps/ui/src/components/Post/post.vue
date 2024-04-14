<!-- Post.vue -->
<template>
  <div class="post">
    <div class="post-header">
      <h3>{{ content }}</h3>
    </div>
    <div class="post-content">
      <p>by - {{ author }}</p>
    </div>
    <div class="flex gap-5 post-actions">
      <button @click="toggleLike">
        <span >Like</span>
      </button>
      <button @click="toggleUnlike">
        <span >Unlike</span>
      </button>
      <span>{{ likes }} likes</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Post',
  props: {
    author: String,
    content: String,
    likes: Number,
    liked: Boolean
  },
  methods: {
    toggleLike() {
      this.$emit('toggle-like')
    },
    toggleUnlike() {
      this.$emit('toggle-unlike')
    }
  }
}
</script>