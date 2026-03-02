<script setup lang="ts">
import { computed, ref } from 'vue';
import { UserService } from '@/services/UserService';
import type { UserInterface } from '@/interfaces/UserInterface';

const users = computed(() => UserService.getAllUsers());

const editingId = ref<number | null>(null);
const editName = ref('');
const editEmail = ref('');
const editRole = ref<'user' | 'admin'>('user');
const editMessage = ref<'success' | 'error' | null>(null);

function startEdit(user: UserInterface) {
  editingId.value = user.id;
  editName.value = user.name;
  editEmail.value = user.email;
  editRole.value = user.role as 'user' | 'admin';
  editMessage.value = null;
}

function cancelEdit() {
  editingId.value = null;
}

function saveEdit() {
  if (editingId.value == null) return;
  editMessage.value = null;
  try {
    UserService.updateUser(editingId.value, {
      name: editName.value.trim(),
      email: editEmail.value.trim(),
      role: editRole.value,
    });
    editMessage.value = 'success';
    setTimeout(() => {
      editingId.value = null;
      editMessage.value = null;
    }, 1500);
  } catch {
    editMessage.value = 'error';
  }
}

function roleLabel(role: string): string {
  return role === 'admin' ? 'Admin' : 'User';
}

function formatDate(d: Date | undefined): string {
  if (!d) return '—';
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString();
}
</script>

<template>
  <section class="max-w-5xl mx-auto">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-[#0B2C3D]">Manage users</h1>
      <p class="mt-1 text-sm text-slate-500">View and update user accounts</p>
    </header>

    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-4 py-3 font-semibold text-slate-700">Name</th>
              <th class="px-4 py-3 font-semibold text-slate-700">Email</th>
              <th class="px-4 py-3 font-semibold text-slate-700">Role</th>
              <th class="px-4 py-3 font-semibold text-slate-700">Created</th>
              <th class="px-4 py-3 font-semibold text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50/50">
              <td class="px-4 py-3">
                <template v-if="editingId === user.id">
                  <input
                    v-model="editName"
                    type="text"
                    class="w-full max-w-[180px] rounded border border-slate-300 px-2 py-1 text-sm"
                    placeholder="Name"
                  />
                </template>
                <span v-else class="font-medium text-slate-800">{{ user.name }}</span>
              </td>
              <td class="px-4 py-3">
                <template v-if="editingId === user.id">
                  <input
                    v-model="editEmail"
                    type="email"
                    class="w-full max-w-[200px] rounded border border-slate-300 px-2 py-1 text-sm"
                    placeholder="Email"
                  />
                </template>
                <span v-else class="text-slate-600">{{ user.email }}</span>
              </td>
              <td class="px-4 py-3">
                <template v-if="editingId === user.id">
                  <select
                    v-model="editRole"
                    class="rounded border border-slate-300 px-2 py-1 text-sm"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </template>
                <span v-else>
                  <span
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="
                      user.role === 'admin'
                        ? 'bg-[#0B2C3D] text-white'
                        : 'bg-slate-100 text-slate-700'
                    "
                  >
                    {{ roleLabel(user.role) }}
                  </span>
                </span>
              </td>
              <td class="px-4 py-3 text-slate-500">{{ formatDate(user.createdAt) }}</td>
              <td class="px-4 py-3 text-right">
                <template v-if="editingId === user.id">
                  <button
                    type="button"
                    class="text-slate-500 hover:text-slate-700 mr-2"
                    @click="cancelEdit"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    class="text-[#1FA971] hover:underline font-medium"
                    @click="saveEdit"
                  >
                    Save
                  </button>
                </template>
                <template v-else>
                  <button
                    type="button"
                    class="text-[#1FA971] hover:underline font-medium"
                    @click="startEdit(user)"
                  >
                    Edit
                  </button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="editMessage" class="px-4 py-2 border-t border-slate-100 text-sm">
        <span v-if="editMessage === 'success'" class="text-[#1FA971]">Saved.</span>
        <span v-else class="text-red-600">Error saving. Try again.</span>
      </div>
      <p v-if="users.length === 0" class="px-4 py-8 text-center text-slate-500">No users yet.</p>
    </div>
  </section>
</template>
