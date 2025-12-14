<template>
  <div class="category-test">
    <h1>Part Categories (6868 API)</h1>

    <div v-if="loading" class="status">Đang tải dữ liệu...</div>
    <div v-else-if="error" class="status error">{{ error }}</div>

    <table v-else class="category-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Mã</th>
          <th>Tên</th>
          <th>Mô tả</th>
          <th>Số điện thoại</th>
          <th>Trạng thái</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in categories" :key="item.partCategoryId">
          <td>{{ item.partCategoryId }}</td>
          <td>{{ item.partCategoryCode }}</td>
          <td>{{ item.partCategoryName }}</td>
          <td>{{ item.partCategoryDescription }}</td>
          <td>{{ item.partCategoryPhone }}</td>
          <td>{{ item.status }}</td>
        </tr>
      </tbody>
    </table>

    <div class="summary" v-if="!loading && !error">
      Tổng mục: {{ pagination.totalItems }} — Trang hiện tại: {{ pagination.page + 1 }} / Kích thước: {{ pagination.size }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import apiSpringbootV2 from '@/services/apiSpringbootV2'

const categories = ref([])
const loading = ref(false)
const error = ref('')
const pagination = ref({
  totalItems: 0,
  page: 0,
  size: 10
})

const loadCategories = async () => {
  try {
    loading.value = true
    error.value = ''

    const response = await apiSpringbootV2.get('/part-category/list', {
      page: 0,
      size: 10,
      sortBy: 'id',
      direction: 'ASC'
    })

    const payload = response?.data || {}
    categories.value = payload.items || []
    pagination.value = {
      totalItems: payload.totalItems ?? categories.value.length,
      page: payload.page ?? 0,
      size: payload.size ?? 10
    }
  } catch (err) {
    error.value = err.message || 'Không thể tải dữ liệu'
  } finally {
    loading.value = false
  }
}

onMounted(loadCategories)
</script>

<style scoped>
.category-test {
  padding: 2rem;
  font-family: Arial, sans-serif;
}

.category-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.category-table th,
.category-table td {
  border: 1px solid #ddd;
  padding: 0.75rem;
  text-align: left;
}

.category-table th {
  background-color: #f4f4f4;
}

.status {
  margin-top: 1rem;
  font-weight: 500;
}

.status.error {
  color: #dc3545;
}

.summary {
  margin-top: 1rem;
  font-weight: 600;
}
</style>
