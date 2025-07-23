<script>
export default {
  props: {
    type: {
      type: String,
      required: true,
      default: "original"
    }
  },
  data() {
    return {
      types: {
        original: {
          color: "badge-success",
          text: "原"
        },
        reprint: {
          color: "badge-default",
          text: "转"
        },
        translation: {
          color: "badge-info",
          text: "译"
        },
        top: {
          color: "badge-danger",
          text: "置顶"
        }
      }
    }
  }
}
</script>

<template>
  <span class="badge" :class="types[type].color">
    {{ types[type].text }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 0.25em 0.4em;
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  margin-right: 10px;
}

.badge-success {
  color: #fff;
  background-color: #28a745;
}

.badge-default {
  color: #fff;
  background-color: #6c757d;
}

.badge-info {
  color: #fff;
  background-color: #17a2b8;
}

.badge-danger {
  color: #fff;
  background-color: #dc3545;
  margin-left: 10px;
}
</style>